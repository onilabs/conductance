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

	var host = hosts[platform];
	context("#{platform}_#{arch}") {||
		var bundle = url.normalize("../dist/#{system.archive}", module.id) .. url.toPath();
		var conductanceHead = url.normalize("../dist/conductance-HEAD.tar.gz", module.id) .. url.toPath();
		var conductanceUrl = manifest.data.conductance.href;
		assert.string(conductanceUrl);

		// we'll prime the proxy with the current workspace' bootstrap script and archives
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
						proxy.fake([
							[conductanceUrl, conductanceHead],
							[bootstrapScript, localBootstrap],
							[bootstrapArchive, bundle],
						], brk);
					}
				}
			}
		}

		/********************************************************
		* helpers to setup / destroy conductance install
		********************************************************/
		var ensureClean = function() {
			host.runCmd("rm -rf $HOME/.conductance");
		};

		var manualInstall = function() {
			assert.ok(fs.exists(bundle));
			host.copyFile(bundle, '/tmp/conductance-install');
			ensureClean();
			host.runCmd('bash -ex -c "cd $HOME; mkdir .conductance; cd .conductance; tar zxf /tmp/conductance-install"');
			return host.runCmd(exportProxy + '$HOME/.conductance/share/boot.sh');
		};

		var bashInstall = function() {
			return host.runCmd(exportProxy + "curl -# #{bootstrapScript} | tee /tmp/script | bash -e");
		};

		var bashInstallWithInput = function(input) {
			return host.runCmd(exportProxy + "curl -s #{bootstrapScript} > /tmp/script && echo '#{input}' | bash -e /tmp/script");
		};

		var runServer = function(config) {
			host.copyFile(url.normalize("fixtures/#{config}", module.id) .. url.toPath, "/tmp/#{config}");
			return host.runCmd("$HOME/.conductance/bin/conductance run /tmp/#{config}");
		};

		var assertHealthy = function() {
			// run a little test server (shuts itself down after we ping it)
			var contents;
			waitfor {
				runServer("hello.mho");
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

		test.beforeAll {||
			ensureClean();
		}

		/********************************************************
		* Tests
		********************************************************/
		test('host is available') {||
			// don't bother running futher tests if this one fails
			host.runCmd('true');
		}

		context('manual') {||
			var modifyManifest = function(block) {
				var manifest = JSON.parse(manifestContents);
				
				// make a new copy for modification
				var newManifest = JSON.parse(manifestContents);
				block(newManifest, manifest);
				return newManifest;
			};

			test.beforeEach {||
				ensureClean();
				manualInstall();
			}

			test('install works') {||
				assertHealthy();
			}

			test('ignores a modified manifest if the version is <= the existing version') {||
				var manifest = modifyManifest {|mf|
					// change node ID
					var node = mf.data.node;
					node.id = "0.8.9"
				}

				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				]) {||
					var output = host.runCmd(exportProxy + '$HOME/.conductance/bin/conductance self-update');
					assert.ok(output .. str.contains('No updates available'), output);
				}

				manifest.version = manifest.version - 1;
				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				]) {||
					var output = host.runCmd(exportProxy + '$HOME/.conductance/bin/conductance self-update');
					assert.ok(output .. str.contains('No updates available'), output);
				}
			}

			test('downloads a single new component') {||
				var manifest = modifyManifest {|mf|
					// downgrade to last stable nodejs
					var node = mf.data.node;
					node.id = "0.8.9"
					node.href = {
						platform_key: node.href.platform_key
						, "linux_x64": "http://nodejs.org/dist/v0.8.9/node-v0.8.9-linux-x64.tar.gz"
						, "windows_x64": "http://nodejs.org/dist/v0.8.9/x64/node.exe"
						, "osx_x64": "http://nodejs.org/dist/v0.8.9/node-v0.8.9-darwin-x64.tar.gz"
					};
					mf.version++;
				}

				var getNodeVersion = function() {
					return runServer("node_version.mho").split("\n")
						.. seq.find(l -> l .. str.startsWith("NODE VERSION:"));
				};
				var initialVersion = getNodeVersion();

				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				]) {||
					var output = host.runCmd(exportProxy + '$HOME/.conductance/bin/conductance self-update');
					assert.ok(output .. str.contains('node: 0.8.9'));

					var currentVersion = getNodeVersion();

					currentVersion .. assert.eq("NODE VERSION: 0.8.9");
					currentVersion .. assert.notEq(initialVersion);
				}
				JSON.parse(host.runCmd('cat $HOME/.conductance/share/manifest.json')) .. assert.eq(manifest);
			}

			var listDir = (dir) ->
				host.runCmd("ls -1 $HOME/.conductance/#{dir}/").trim().split("\n")
					.. seq.filter()
					.. seq.sort()
					.. seq.toArray();

			test('updates symlinks and wrapper scripts') {||
				// NOTE: this is brittle based on contents of manifest.json,
				// but that should change rarely
				listDir('share') .. assert.eq(['boot.sh', 'manifest.json', 'self-update.js']);
				listDir('node_modules') .. assert.eq(['stratifiedjs']);

				var manifest = modifyManifest {|mf|
					mf.version++;
					var existingWrapper = mf.wrappers.node;
					existingWrapper .. object.keys .. each {|k|
						if (k === 'platform_key') continue;
						existingWrapper['k'] = 'A script invoking __REL_PATH__!'
					}

					mf.data.conductance.links = [{src: "conductance", dest:"new_conductance"}];
					mf.data.stratifiedjs.links = [{src: "modules", dest:"sjs_modules"}];
				}

				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				]) {||
					var output = host.runCmd(exportProxy + 'CONDUCTANCE_DEBUG=1 $HOME/.conductance/bin/conductance self-update');
					assert.ok(output .. str.contains('Updated. Restart conductance for the new version to take effect.'));
				}

				// old links should be removed, and new ones in their place
				listDir('.') .. assert.eq(['bin', 'data', 'new_conductance', 'node_modules', 'share', 'sjs_modules']);
				listDir('share') .. assert.eq(['boot.sh', 'manifest.json']);
				listDir('node_modules') .. assert.eq([]);
				listDir('sjs_modules') .. assert.contains('http.sjs');

				JSON.parse(host.runCmd('cat $HOME/.conductance/share/manifest.json')) .. assert.eq(manifest);
			}
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
					ensureClean();
					host.runCmd(exportProxy + "curl -# #{bootstrapScript} | tee /tmp/script | bash -e");
					assertHealthy();
				}

				context("with existing install") {||
					test.beforeEach( -> host.runCmd("mkdir -p $HOME/.conductance"));

					test('aborts by default when directory exists') {||
						['n','no',''] .. each {|response|
							logging.info("Responding with: '#{response}'");
							var output;
							var failed = false;
							try {
								bashInstallWithInput(response);
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
						var output = bashInstallWithInput('y');
						var homePath = host.runCmd("echo $HOME").trim();

						output .. str.contains("This installer will REMOVE the existing contents at #{homePath}/.conductance\nContinue? [y/N]") .. assert.ok;
						output .. str.contains("Cancelled.") .. assert.falsy;
						assertHealthy();
					}
				}
			}
		}
	}.timeout(null).skipIf(!host, "No host configured for this platform");;
}
