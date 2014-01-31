// These tests can't be run un-supervised unless you have write access to /usr/bin (or passwordless sudo)
// Unlike bundle-tests.sjs, it:
// - installs from real URLs (but you can use /etc/hosts hacks to send it prerelease versions)
// - installs to /usr/bin
var hosts = require('./hosts');

var {context, test, assert} = require('sjs:test/suite');
var runner = require('sjs:test/run');

hosts.systems .. each {|system|
	var host = system.host;
	var {assertHealthy} = require('./util').api(host);
	var clean = -> host.runPython("
		rmtree(conductance)
		run(['sudo','rm','-rf','/usr/bin/conductance','/usr/bin/sjs'])
	");

	test.beforeEach(clean);
	test.afterEach(clean);

	test(system.platform) {||
		var installScript = "http://onilabs.com/conductance.sh"
		host.runPython("run(['bash','-c', 'curl -s #{installScript} | bash -e'])");
		assertHealthy("/usr");
	}.skipIf(!host, "No configured host for this platform");
}
