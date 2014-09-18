@ = require('../lib/common');
@addTestHooks();
@validate = require('seed:validate');

@context("user.api") {||
	@api = require('seed:master/user.api');
	@test.beforeAll(@stub.clearData);

	@test("validates username") {||
		var u = (name) -> {
			username: name,
			password: 'secret',
			email: 'me@me.com',
		};

		var accept = function(username) {
			@api.createUser(u(username));
		};

		var reject = function(username) {
			@assert.raises({message: @validate.username.errorMessage}, -> @api.createUser(u(username)));
		};

		reject("_local");
		reject("0name");
		reject("a/b");
		reject("a.b");

		accept("name0");
		accept("a_b");
		accept("a-b");
	}
}.serverOnly();
