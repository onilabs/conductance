@ = require('mho:std');
var { @User } = require('../auth/user');
var { @AuthenticationError } = require('../auth');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@storage = require('mho:server/storage');
@crypto = require('nodejs:crypto');
@validate = require('../validate');

if (require.main === module) {
	require('../hub');
	require('seed:env').defaults();
}


var config_root = @path.join(@env.get('data-root'), 'user');
@debug("CONFIG_ROOT:", config_root);

@mkdirp(config_root);
var store = @storage.Storage(@path.join(config_root, 'auth.db'));

var isNotFound = e -> e.type === 'NotFound';

var prefixed = function(prefix) {
	return @Stream(function(emit) {
		store.query({
			start: prefix,
		}) .. @each {|pair|
			pair[0] = pair[0].toString('ascii');
			if (!pair[0] .. @startsWith(prefix)) {
				break;
			}
			emit(pair);
		}
	});
};

var keysWithPrefix = function(prefix) {
	return prefixed(prefix) .. @transform ([k,v] -> k.slice(prefix.length));
};

//var cleanup = function() {
//	;['server:'] .. @each{|prefix|
//		prefixed(prefix) .. @toArray .. @each {|[k,v]|
//			//console.log("checking key #{k}, ", v);
//			v = v.toString('utf-8') .. JSON.parse();
//			if (!v.name) {
//				console.log("Terfing incomplete #{k}");
//				store.del(k);
//			}
//		}
//	}
//};
//cleanup();

var userKey = id -> new Buffer("user:#{id}", 'ascii');
var aliasKey = name -> new Buffer("username:#{name}", 'utf-8');
var randomBytes = function(size){
	waitfor(var err, rv) {
		@crypto.randomBytes(size, resume);
	}
	if (err) throw err;
	return rv;
}

var dbLock = @Semaphore();

var genUnique = function(genKey) {
	var key, id;
	var length = 4;
	while(true) {
		id = randomBytes(length++).toString('hex');
		key = genKey(id);
		var keyBuf = new Buffer(key, 'ascii');
		var conflict;
		try{
			store.get(keyBuf);
			conflict = true;
		} catch(e) {
			if (e .. isNotFound())
				conflict = false;
			else
				throw e;
		}

		if (!conflict) {
			return [key, id];
		}
	}
};
var getUser = function(id) {
	dbLock.synchronize {||
		return new @User(id, store.get(userKey(id)) .. JSON.parse);
	}
}

var getUid = function(username) {
	dbLock.synchronize {||
		var rv = store.get(aliasKey(username)).toString('ascii');
		@debug("resolved user #{username} -> #{rv}");
		return rv;
	}
};

var withUserById = function(uid, block) {
	@validate.alphanumeric(uid);
	dbLock.synchronize {||
		var key = userKey(uid);
		var save = function(u) {
			store.put(key, JSON.stringify(u .. @get('props')));
		};
		try {
			var user = new @User(uid, store.get(key) .. JSON.parse);
		} catch(e) {
			throw @AuthenticationError();
		}
		return block(user, save);
	}
}

// password storage based on recommendations in:
// http://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/

var intBase = 32;
var contentsEncoding = 'base64';
var Token = {
	decode: function(t) {
		@assert.string(t);
		var [uid, exp, contents] = t .. @split('|', 2);
		exp = parseInt(exp, intBase);
		return {
			uid: uid,
			expires: new Date(exp * 1000),
			contents: contents,
		};
	},
	encode: function(t) {
		var {uid, expires, contents} = t;
		expires = Math.floor(expires.getTime() / 1000).toString(intBase);
		return [uid, expires, contents].join('|');
	},
	hashed: function(token) {
		var { contents } = token;
		@assert.ok(contents);
		var h = @crypto.createHash('sha256');
		h.update(contents);
		return token .. @merge({contents: h.digest('base64')});
	},
}

var hashPassword = function(password, opts) {
	if (password.length == 0) throw new Error("blank password");
	var { salt, iterations, keylen } = opts;
	@assert.string(salt);
	var saltBuf = new Buffer(salt, "base64");
	@assert.number(iterations);
	@assert.number(keylen);
	waitfor(var err, rv) {
		@crypto.pbkdf2(password, saltBuf, iterations, keylen, resume);
	}
	if(err) throw err;
	return rv;
};

var PASSWORD_SETTINGS = {
	iterations: 10000,
	keylen: 32, // (in bytes)
};
// XXX upgrade users to latest password settings on login

exports.withUserByName = function(username, block) {
	var uid = getUid(username);
	withUserById(uid, block);
};

exports.withUserById = withUserById;

exports.create = function(username, password, props) {
	@debug("Creating user #{username}");
	var salt = randomBytes(16).toString("base64");
	var passwordSettings = PASSWORD_SETTINGS .. @merge({
		salt:salt,
	});
	var passwordHash = hashPassword(password, passwordSettings).toString('base64');

	dbLock.synchronize {||
		var alias = aliasKey(username);
		try {
			store.get(alias);
			throw new Error("Username already exists");
		} catch(e) {
			if (!e .. isNotFound) throw e;
		}

		var [key, id] = genUnique(userKey);
		@debug("writing alias: #{alias} -> #{id}");
		store.put(alias, id);
		props = props .. @merge({
			name: username,
			password: passwordSettings .. @merge({hash:passwordHash}),
		});
		store.put(key, props .. JSON.stringify());
		return new @User(id, props);
	}
};

var EXPIRY_DAYS = 14;
exports.getToken = function(username, password) {
	var now = new Date().getTime();
	var expires = new Date(now + (1000 * 60 * 60 * 24 * EXPIRY_DAYS));
	try {
		var uid = getUid(username);
		var secretToken;
		withUserById(uid) {|user, save|
			if (user.verified() !== true) {
				throw new Error("User is not yet verified");
			}
			var props = user.props;
			secretToken = {
				uid:uid,
				expires: expires,
				contents: randomBytes(20).toString(contentsEncoding),
			};

			var dbToken = Token.hashed(secretToken);

			var expectedHash = props.password.hash;
			var givenHash = hashPassword(password, props.password).toString('base64');
			if (!@eq(givenHash, expectedHash)) {
				throw @AuthenticationError();
			}
			var serializedToken = Token.encode(dbToken);
			@verbose("Adding token to user: ", dbToken);
			if (!props.tokens) props.tokens = [];
			props.tokens = [serializedToken].concat(props.tokens.slice(0,9));
			save(user);
		}
		return Token.encode(secretToken);
	} catch(e) {
		@info("failed to authenticate user: #{e.message}");
		@info(String(e)); // XXX remove
	}
	throw @AuthenticationError();
};

exports.authenticate = function(tokenStr) {
	try {
		var token = Token.decode(tokenStr);
		if (token.expires.getTime() < Date.now()) {
			throw @AuthenticationError();
		}
		var storedToken = Token.hashed(token) .. Token.encode();
		var user = getUser(token.uid);
		@assert.ok(user.tokens() .. @hasElem(storedToken), "token not found");
		return user;
	} catch(e) {
		@info("failed to authenticate token: #{e.message}");
		@info(String(e)); // XXX remove
		throw @AuthenticationError();
	}
};

exports.ANONYMOUS = new @User('_local', {});

if (require.main === module) {
	@stream = require('sjs:nodejs/stream');
	var load = function() {
		var o = {};
		store.query() .. @each {|[k,v]|
			//k = k.toString("utf-8");
			v = v.toString("utf-8");
			var isJson = v.charAt(0) === '{' && v .. @at(-1, '') === '}';
			if(isJson) {
				v = JSON.parse(v);
			}
			o[k] = {json: isJson, value: v};
		}
		return o;
	};

	var dump = function(o, stream) {
		stream .. @stream.write(JSON.stringify(o, null, '  '));
	};

	var arg = @argv()[0];
	switch(arg) {
		case undefined:
		case '--help':
			console.warn("Usage: user.sjs [--edit|--dump]");
			process.exit(1);
			break;
		case '--edit':
			var old = load();
			require('sjs:nodejs/tempfile').TemporaryFile() {|f|
				var path = f.path;
				old .. dump(f.writeStream());
				f.close();

				var editor = process.env .. @get('EDITOR', 'vi');
				console.warn("Running: #{editor}");
				editor = editor.split();
				@childProcess.run(editor[0], editor.slice(1).concat([path]), {'stdio':'inherit'});
				console.warn("Saving results...");
				var result = @fs.readFile(path, 'utf-8') .. JSON.parse();
				result .. @ownPropertyPairs .. @each {|[k, v]|
					delete old[k];
					var isJson = v.json;
					v = v.value;
					@assert.ok(v);
					if(isJson) v = JSON.stringify(v);
					store.put(k, v);
				}
				// old contains only keys not found in result, so delete them:
				old .. @ownKeys .. @each {|k|
					store.del(k);
				}
			}
			break;
		case '--dump':
			load() .. dump(process.stdout);
			break;
		default:
			console.warn("Unknown flag #{arg}, try --help");
			process.exit(1);
			break;
	}
}
