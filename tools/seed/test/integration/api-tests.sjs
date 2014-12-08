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
		reject("a-b");

		accept("name0");
		accept("a_b");
	}

	@test("rejects existing users") {||
		createUser("fred");
		@assert.raises({message:"Username already exists"}, -> createUser("fred"));
	}
}

@context("deploy.sjs") {||
	var deploy  = require('seed:master/deploy');
	@test.beforeEach {|s|
		var User = require('seed:auth/user').User;
		s.user = new User("1234", "test1");
		s.api = deploy.Api(s.user);
	}

	@test("Validates app id is hex on creation") {|s|
		var rejectsId = function(id) {
			@assert.raises({message: /^Not hexadecimal:/},
				-> s.api.createApp(id, 'name'));
		};
		rejectsId('app ID with spaces');
		rejectsId('notAHexNumber');

		// OK:
		s.api.createApp('01234567890abcDEF', 'name');
	}

	@test("Validates app name on creation") {|s|
		var rejectsName = function(name) {
			@assert.raises({message: @validate.appName.errorMessage},
				-> s.api.createApp('123', {name: name}));
		};
		rejectsName('not a name!');
		rejectsName('a.b');
		rejectsName('a/b');
		rejectsName('_ab');
	}

	@test("Validates app name on edit") {|s|
		var originalName = 'valid_Name';
		var app = s.api.createApp('123', { name: originalName});
		var rejectsName = function(name) {
			@assert.raises({message: @validate.appName.errorMessage},
				-> app.config.modify(c -> {name: name}));
		};

		rejectsName('bad name');
		rejectsName('-leading-dash');
	}

	var maxmb = 10;
	@test("upload size is limited to #{maxmb}mb") {|s|
		@stub.deployOfSize(10 * 1024 + 1) {|dir|
			var app = s.api.createApp('123', {name:"biggie"});
			@assert.raises({
				filter: function(err) {
					return err.message === 'Application too large' && err.tooLarge === true && err.maxkb === maxmb*1024;
				}},
				-> require('mho:server/seed/local/upload').upload(app, dir)
			);
		}
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
