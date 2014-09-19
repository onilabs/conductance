@ = require('../lib/common');
@validate = require('seed:validate');

@context() {||
@addTestHooks();
@user = require('seed:master/user.api');
@deploy = require('seed:master/deploy.api');
@verification = require('seed:master/verification');
var {@isAuthenticationError} = require('seed:auth');

@context("user.api") {||
	@test.beforeAll(@stub.clearData);

	var createUser = (name) -> @user.createUser({
		username: name,
		password: 'secret',
		email: 'me@example.com',
	});

	@test("validates username") {||
		var accept = function(username) {
			createUser(username);
		};

		var reject = function(username) {
			@assert.raises({message: @validate.username.errorMessage}, -> createUser(username));
		};

		reject("_local");
		reject("0name");
		reject("a/b");
		reject("a.b");

		accept("name0");
		accept("a_b");
		accept("a-b");
	}

	@test("rejects existing users") {||
		createUser("fred");
		@assert.raises({message:"Username already exists"}, -> createUser("fred"));
	}
}

@context("verification.sjs") {||
	var userDb = require('seed:master/user');
	@test.beforeEach {|s|
		s.userProps = {
			username: 'user',
			password: 'secret',
			email: 'me@example.com',
		};
		@user.createUser(s.userProps);
		s.user = -> userDb.getUser(s.userProps.username);
	}

	@test("Users are created unverified") {|s|
		var user = s.user();
		user.verified() .. @assert.eq(false);
		user.verifyCode() .. @assert.string();
	}

	@test("Login fails on unverified user") {|s|
		@assert.raises({filter: @isAuthenticationError},
			-> @deploy.getToken(s.userProps.username, s.userProps.password));
	}

	@test("Verification fails on incorrect code or username") {|s|
		var user = s.user();
		@verification.verify("someone_else", user.verifyCode()) .. @assert.falsy();
		@verification.verify(user.name(), user.verifyCode() + "x") .. @assert.falsy();
	}

	@test("Login succeeds after verification") {|s|
		var user = s.user();
		@verification.verify(s.userProps.username, user.verifyCode()) .. @assert.ok();
		@deploy.getToken(s.userProps.username, s.userProps.password) .. @assert.ok();
	}
}

}.serverOnly();
