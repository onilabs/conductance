@ = require('../lib/common');
@validate = require('seed:validate');

@context("user.api") {||
	@addTestHooks();
	@api = require('seed:master/user.api');
	@test.beforeAll(@stub.clearData);

	var createUser = (name) -> @api.createUser({
		username: name,
		password: 'secret',
		email: 'me@me.com',
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
}.serverOnly();
