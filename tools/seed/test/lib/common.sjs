var lib = require(['sjs:test/std', 'sjs:xbrowser/driver']);
var api = require('./stub.api').connect();
lib.driver = require('sjs:xbrowser/driver');
var driver = lib.Driver('../', {width:400, height:600});
lib.addTestHooks = function() {
	lib.test.beforeEach {|s|
		api.clearData();
	}

	lib.test.beforeAll {|s|
		s.driver = driver;
	}

	lib.driver.addTestHooks();

	lib.test.afterAll {|s|
		hold(5000);
		s.driver.close();
	}
};
module.exports = lib;
