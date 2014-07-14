@ = require('mho:std');
@user = require('../auth/user');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@storage = require('mho:server/storage');
@crypto = require('nodejs:crypto');

if (require.main === module) {
	@assert.ok(@fs.exists(@env.set('dataRoot', 'data')));
}

var config_root = @path.join(@env.get('dataRoot'), 'user');
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
		return store.get(userKey(id)) .. JSON.parse;
	}
}

var getUid = function(username) {
	dbLock.synchronize {||
		var rv = store.get(aliasKey(username)).toString('ascii');
		@debug("resolved user #{username} -> #{rv}");
		return rv;
	}
};

var withUser = function(uid, block) {
	dbLock.synchronize {||
		var key = userKey(uid);
		var save = function(u) {
			store.put(key, JSON.stringify(u));
		};
		return block(store.get(key) .. JSON.parse, save);
	}
}


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

exports.create = function(username, password) {
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
		store.put(key, {
			name: username,
			password: passwordSettings .. @merge({hash:passwordHash}),
		} .. JSON.stringify());
		return new @user.User(id, username);
	}
};

var EXPIRY_DAYS = 14;
exports.getToken = function(username, password) {
	var now = new Date().getTime();
	var expires = new Date(now + (1000 * 60 * 60 * 24 * EXPIRY_DAYS));
	var contents = randomBytes(20);
	var uid = getUid(username);
	var secretToken = {
		uid:uid,
		expires: expires,
		contents: contents.toString(contentsEncoding),
	};

	var dbToken = Token.hashed(secretToken);

	try {
		withUser(uid) {|user, save|
			var expectedHash = user.password.hash;
			var givenHash = hashPassword(password, user.password).toString('base64');
			if (!@eq(givenHash, expectedHash)) {
				throw @user.AuthenticationError();
			}
			var serializedToken = Token.encode(dbToken);
			@verbose("Adding token to user: ", dbToken);
			if (!user.tokens) user.tokens = [];
			user.tokens = [serializedToken].concat(user.tokens.slice(0,9));
			save(user);
		}
		return Token.encode(secretToken);
	} catch(e) {
		@info("failed to authenticate user: #{e.message}");
		@info(String(e)); // XXX remove
	}
	return null;
	throw @user.AuthenticationError();
};

exports.authenticate = function(tokenStr) {
	try {
		var token = Token.decode(tokenStr);
		if (token.expires.getTime() < Date.now()) {
			throw @user.AuthenticationError();
		}
		var storedToken = Token.hashed(token) .. Token.encode();
		var user = getUser(token.uid);
		@assert.ok(user.tokens .. @hasElem(storedToken), "token not found");
		return new @user.User(token.uid, user.name);
	} catch(e) {
		@info("failed to authenticate token: #{e.message}");
		@info(String(e)); // XXX remove
		throw @user.AuthenticationError();
	}
};

if (require.main === module) {
	console.log("---- dump ----");
	store.query() .. @each {|[k,v]|
		console.log(k.toString("utf-8") + "=" + v.toString("utf-8"));
	}
	console.log("---- end -----");
}


exports.ANONYMOUS = new @user.User('_local', null);
