var {context, test, assert} = require('sjs:test/suite');
var seq = require('sjs:sequence');
var {each, map} = seq;
var http = require('sjs:http');
var url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var childProcess = require('sjs:nodejs/child-process');
var cutil = require('sjs:cutil');
var str = require('sjs:string');
var logging = require('sjs:logging');
var object = require('sjs:object');
var {get} = object;

var hosts = require('./hosts');
var proxyModule = require('../proxy');

var proxyStrata = null;
test.afterAll {||
	if(proxyStrata) {
		proxyStrata.resume();
	}
};

[
	{
		platform: 'linux',
		arch: 'x64',
		archive: 'linux_x64.tar.gz',
	},
	{
		platform: 'osx',
		arch: 'x64',
		archive: 'osx_x64.tar.gz',
	},
	{
		platform: 'windows',
		arch: 'x64',
		archive: 'windows_x64.tar.gz',
	},
] .. each {|system|
	var platform = system.platform;
	var arch = system.arch;
	var manifestContents = fs.readFile(url.normalize('../share/manifest.json', module.id) .. url.toPath, 'utf-8')
	var manifest = JSON.parse(manifestContents);

	context("#{platform}_#{arch}") {||
		var host = hosts[platform] || {runCmd: -> asset.fail(), proxy: 'NONE'};
		var bundle = url.normalize("../dist/#{system.archive}", module.id) .. url.toPath();
		var conductanceHead = url.normalize("../dist/conductance-HEAD.tar.gz", module.id) .. url.toPath();
		var conductanceUrl = manifest.data.conductance.href;
		assert.string(conductanceUrl);

		// bootstrap script detects
		var bootstrapScript = "http://onilabs.com/conductance.sh"
		var bootstrapArchive = "http://onilabs.com/conductance/#{system.platform}_#{system.arch}.tar.gz"
		var localBootstrap = url.normalize("../install.sh", module.id) .. url.toPath();

		var exportProxy = 'export CONDUCTANCE_FORCE_HTTP=1 http_proxy='+host.proxy+'; ';

		test.beforeAll {||
			childProcess.run('redo-ifchange', [conductanceHead, bundle], {'stdio':'inherit'});

			if (!proxyStrata) {
				proxyStrata = cutil.breaking {|brk|
					proxyModule.serve(9090) {|proxy|
						// always fake out the condutance URL to serve the latest HEAD
						proxy.fake(object.pairsToObject([
							[conductanceUrl, conductanceHead],
							[bootstrapScript, localBootstrap],
							[bootstrapArchive, bundle],
						]), brk);
					}
				}
			}
		}

		test.beforeEach {||
			// each install should be clean
			host.runCmd("rm -rf $HOME/.conductance");
		}

		test('host is available') {||
			// don't bother running futher tests if this one fails
			host.runCmd('true');
		}

		var assertHealthy = function() {
			// run a little test server
			host.copyFile(url.normalize("hello.mho", module.id) .. url.toPath, "/tmp/hello.mho");
			var contents;
			waitfor {
				host.runCmd("$HOME/.conductance/bin/conductance run /tmp/hello.mho");
			} and {
				seq.integers(0, 10) .. each {||
					try {
						contents = http.get("http://#{host.host}:7079/ping");
						break;
					} catch(e) {
						logging.info("Error: #{e.message}, retrying ... ");
						hold(1000);
					}
				}
			}
			assert.eq(contents, "Pong!");
		};


		context('manual') {||
			test('unpack & boot') {||
				assert.ok(fs.exists(bundle));
				host.copyFile(bundle, '/tmp/conductance-install');
				host.runCmd('bash -ex -c "cd $HOME; rm -rf .conductance; mkdir .conductance; cd .conductance; tar zxf /tmp/conductance-install"');
				host.runCmd(exportProxy + '$HOME/.conductance/share/boot.sh');

				assertHealthy();
			}

			test('download new component versions') {||
				var manifest = JSON.parse(manifestContents);
				
				// make a new copy for modification
				var newManifest = JSON.parse(manifestContents);
				var cond = newManifest.data.conductance;
				cond.id = ' 0.99-dev';

				conductance_archive = proxyModule.download(cond.href);

				proxyStrata.value.fake(object.pairsToObject([
					[manifest.manifest_url, new Buffer(JSON.stringify(newManifest))],
					[manifest.data.stratifiedjs.href, null],
				])) {||
					var output = host.runCmd('$HOME/.conductance/bin/conductance self-update');
					assert.ok(output .. str.contains('conductance: 0.99-dev'), output);

					var output = host.runCmd('$HOME/.conductance/bin/conductance self-update');
				}
			}.skip("TODO");
		}

		if (system.platform == 'windows') {
			context('self-installer .exe') {||
				test('installs') {||
				}

				test('aborts when directory exists') {||
				}

				test('overwrites existing directory if the user tells it to') {||
				}
			}.skip("TODO");
		} else {
			context('bash installer') {||
				test('installs to a clean system') {||
					var output = host.runCmd(exportProxy + "curl -# #{bootstrapScript} | tee /tmp/script | bash -e");
				}

				test('aborts by default when directory exists') {||
					host.runCmd("mkdir -p $HOME/.conductance");
					['n','no',''] .. each {|response|
						logging.info("Responding with: '#{response}'");
						var output;
						var failed = false;
						try {
							host.runCmd(exportProxy + "curl -s #{bootstrapScript} > /tmp/script && echo '#{response}' | bash -e /tmp/script");
						} catch(e) {
							failed = true;
							output = e.output;
						}
						assert.ok(failed, 'Command succeeded!');
						assert.ok(output, 'no output');
						var homePath = host.runCmd("echo $HOME").trim();

						output.split('\n') .. assert.eq([
							"This installer will REMOVE the existing contents at #{homePath}/.conductance",
							"Continue? [y/N]",
							"Cancelled.",
							""
						]);
					}
				}

				test('overwrites existing directory if the user tells it to') {||
					host.runCmd("rm -rf $HOME/.conductance && mkdir -p $HOME/.conductance");
					var output = host.runCmd(exportProxy + "curl -s #{bootstrapScript} > /tmp/script && echo 'y' | bash -e /tmp/script");
					var homePath = host.runCmd("echo $HOME").trim();

					output .. str.contains("This installer will REMOVE the existing contents at #{homePath}/.conductance\nContinue? [y/N]") .. assert.ok;
					output .. str.contains("Cancelled.") .. assert.falsy;
					assertHealthy();
				}
			}
		}

	}.timeout(null);
}
