var lib = require(['sjs:test/std', 'sjs:xbrowser/driver']);
var api = require('./stub.api').connect();
var logging = require('sjs:logging');
var {HtmlOutput} = require('sjs:test/reporter');
lib.stub = api;
lib.driver = require('sjs:xbrowser/driver');
var driver = lib.Driver('../', {width:400, height:600});
lib.addTestHooks = function() {
	lib.test.beforeEach {|s|
		api.clearData();
	}

	lib.test.beforeAll {|s|
		s.driver = driver;
	}

	lib.test.afterEach {|s, err|
		if (err && HtmlOutput && HtmlOutput.instance) {
			// if we're running in a browser, we can sneakily inject
			// iscreenshots directly in log output
			var screenshot = driver.document().body .. require('sjs:xbrowser/html2canvas').render();
			HtmlOutput.instance.log("Captured screenshot:");
			HtmlOutput.instance.log(screenshot);
		}
	}

	lib.driver.addTestHooks();

	lib.test.afterAll {|s|
		//hold(5000);
		s.driver.close();
	}
};
module.exports = lib;
