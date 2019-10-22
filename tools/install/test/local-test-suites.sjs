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
	var commonArgs = ['-f'];

	@context("#{system.platform}_#{system.arch}") {||
		@test.beforeAll {||
			@assert.eq(proxyStrata, null);

			proxyStrata = @cutil.breaking {|brk|
				hostUtil.serveProxy {|proxy|
					proxy.fake([
						[manifest.data.conductance.href, @util.conductanceHead],
						[manifest.manifest_url, Buffer.from(manifestContents)],
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

		@test("conductance binary deps") {||
			var args = ['exec', 'mho:../test/run.mho'].concat(commonArgs);
			var testScript = hostUtil._copyFixture('native-deps.sjs');
			host.runPython("
				run([script(conductance + '/bin/conductance'), 'exec', #{JSON.stringify(testScript)}])
			");
		}

		@test("conductance") {||
			var args = ['exec', 'mho:../test/run.mho'].concat(commonArgs);
			host.runPython("
				run([script(conductance + '/bin/conductance')] + #{JSON.stringify(args)})
			");
		}

		@test("stratifiedJS") {||
			var args = ['sjs:../test/run.html'].concat(commonArgs);
			host.runPython("
				run([script(conductance + '/bin/sjs')] + #{JSON.stringify(args)})
			");
		}
	}.timeout(1000);
}

