@ = require('mho:std');
var { @User } = require('../auth/user');
var { @AuthenticationError } = require('../auth');
@crypto = require('nodejs:crypto');
@validate = require('../validate');

if (require.main === module) {
	require('../hub');
	require('seed:env').defaults();
}

var db = @env.get('user-storage');
exports.isNotFound = db.isNotFound;

var randomBytes = function(size){
	waitfor(var err, rv) {
		@crypto.randomBytes(size, resume);
	}
	if (err) throw err;
	return rv;
}

var wrapAuthenticationError = function(block) {
	try {
		return block();
	} catch(e) {
		if (db.isNotFound(e)) {
			throw @AuthenticationError();
		}
		throw e;
	}
}

var getUser = exports.getUser = function(uid) {
	wrapAuthenticationError(function() {
		var {id, props} = db.getUser(uid);
		return new @User(uid, props);
	});
}

var withUser = exports.withUser = function(uid, block) {
	db.synchronize('withUser') {|db|
		var {id, props} = wrapAuthenticationError( -> db.getUser(uid));
		var user = new @User(uid, props);
		var save = function(u) {
			db.updateUser(id, (u .. @get('props')));
		};
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

exports.create = function(username, password, props) {
	@validate.username(username);
	@debug("Creating user #{username}");
	var salt = randomBytes(16).toString("base64");
	var passwordSettings = PASSWORD_SETTINGS .. @merge({
		salt:salt,
	});
	var passwordHash = hashPassword(password, passwordSettings).toString('base64');

	props = props .. @merge({
		name: username,
		password: passwordSettings .. @merge({hash:passwordHash}),
		tokens: [],
	});
	db.createUser(props);
	return new @User(username, props);
};

var EXPIRY_DAYS = 14;
exports.getToken = function(username, password) {
	var now = new Date().getTime();
	var expires = new Date(now + (1000 * 60 * 60 * 24 * EXPIRY_DAYS));
	var secretToken;
	withUser(username) {|user, save|
		if (user.verified() !== true) {
			@info("User is not yet verified");
			throw @AuthenticationError();
		}
		var props = user.props;
		secretToken = {
			uid:username,
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
};

exports.authenticate = function(tokenStr) {
	var token = Token.decode(tokenStr);
	if (token.expires.getTime() < Date.now()) {
		throw @AuthenticationError();
	}
	var storedToken = Token.hashed(token) .. Token.encode();
	var user = getUser(token.uid);
	if (user.tokens() .. @hasElem(storedToken)) {
		return user;
	} else {
		throw @AuthenticationError();
	}
};

exports.ANONYMOUS = new @User('_local', {});
