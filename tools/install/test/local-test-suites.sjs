@ = require('sjs:test/std');
@cutil = require('sjs:cutil');
@util = require('./util');

var hosts = require('./hosts');
var systems = hosts.systems;
systems .. @each {|system|
	var hostUtil = @util.api(system);
	var bundle = @util.bundlePath(system);
	var [manifest, manifestContents] = @util.loadManifest();

	var proxyStrata = null;
	var host = @util.getHost(system);

	@context("#{system.platform}_#{system.arch}") {||
		@test.beforeAll {||
			@assert.eq(proxyStrata, null);

			proxyStrata = @cutil.breaking {|brk|
				hostUtil.serveProxy {|proxy|
					proxy.fake([
						[manifest.data.conductance.href, @util.conductanceHead],
						[manifest.manifest_url, new Buffer(manifestContents)],
					]) {||
						hostUtil.ensureClean();
						hostUtil.manualInstall('n');
						brk();
					}
				}
			}
		}

		@test.afterAll {||
			if(proxyStrata) {
				proxyStrata.resume();
				proxyStrata = null;
			}
		}

		@test("conductance") {||
			host.runPython("
				run([os.path.join(conductance, 'bin','conductance'), 'exec', 'mho:../test/run.mho', '-f'])
			");
		}

		@test("stratifiedJS") {||
			host.runPython("
				run([os.path.join(conductance, 'bin','sjs'), 'sjs:../test/run.html', '-f'])
			");
		}
	}.timeout(1000);
}

