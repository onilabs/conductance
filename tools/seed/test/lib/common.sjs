
var libModules = ['sjs:test/std'];
var api = require('./stub.api');

var isBrowser = require('sjs:sys').hostenv === 'xbrowser';
var driver;
if (isBrowser) {
	api = api.connect();
	libModules.push('sjs:xbrowser/driver');
	driver = require('sjs:xbrowser/driver');
}

var lib = require(libModules);
var logging = require('sjs:logging');
var {HtmlOutput} = require('sjs:test/reporter');
lib.stub = api;


lib.addTestHooks = function() {
	lib.test.beforeEach {|s|
		api.clearData();
	}

	if (isBrowser) {
		lib.test.beforeAll {|s|
			s.driver = lib.Driver('../', {width:400, height:600});
		};

		lib.test.afterEach {|s, err|
			if (err && HtmlOutput && HtmlOutput.instance) {
				// if we're running in a browser, we can sneakily inject
				// iscreenshots directly in log output
				var screenshot = s.driver.document().body .. require('sjs:xbrowser/html2canvas').render();
				HtmlOutput.instance.log("Captured screenshot:");
				HtmlOutput.instance.log(screenshot);
			}
		};

		driver.addTestHooks();

		lib.test.afterAll {|s|
			//hold(5000);
			s.driver.close();
		}
	}
};
module.exports = lib;
