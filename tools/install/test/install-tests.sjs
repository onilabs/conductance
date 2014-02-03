var {context, test, assert} = require('sjs:test/suite');
var seq = require('sjs:sequence');
var {each, map, slice, toArray} = seq;
var array = require('sjs:array');
var http = require('sjs:http');
var url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var childProcess = require('sjs:nodejs/child-process');
var cutil = require('sjs:cutil');
var str = require('sjs:string');
var logging = require('sjs:logging');
var object = require('sjs:object');
var {get} = object;
var path = require('nodejs:path');

var hosts = require('./hosts');
var proxyModule = require('../proxy');

var manifestContents = fs.readFile(url.normalize('../share/manifest.json', module.id) .. url.toPath, 'utf-8')
var manifest = JSON.parse(manifestContents);

/*
if (require.main === module) {
	var system = hosts.systems[2]; // (hack)
	// XXX duplicated with context() block below, just used for manual testing
	var platform = system.platform;
	var host = system.host && system.host();
	var arch = system.arch;

	var archive = "#{platform}_#{arch}.#{platform == 'windows' ? 'zip' : 'tar.gz'}";
	var bundle = url.normalize("../dist/#{archive}", module.id) .. url.toPath();
	var conductanceHead = url.normalize("../dist/conductance-HEAD.tar.gz", module.id) .. url.toPath();
	var conductanceUrl = manifest.data.conductance.href;
	assert.string(conductanceUrl);

	// we'll prime the proxy with the current workspace' install script and archives
	var installScript = "http://conductance.io/install.sh"
	var installArchive = "http://conductance.io/install/#{system.platform}_#{system.arch}.tar.gz"
	var localInstallScript = url.normalize("../install.sh", module.id) .. url.toPath();

	childProcess.run('gup', ['-u', conductanceHead, bundle], {'stdio':'inherit'});

	proxyModule.serve(9090) {|proxy|
		// always fake out the condutance URL to serve the latest HEAD
		proxy.fake([
			[conductanceUrl, conductanceHead],
			[installScript, localInstallScript],
			[manifest.manifest_url, new Buffer(manifestContents)],
			[installArchive, bundle],
		], -> hold());
	}
}
/* */


var proxyStrata = null;
hosts.systems .. each {|system|
	var platform = system.platform;
	var host = system.host && system.host();
	var arch = system.arch;

	context("#{platform}_#{arch}") {||
		var archive = "#{platform}_#{arch}.#{platform == 'windows' ? 'zip' : 'tar.gz'}";
		var bundle = url.normalize("../dist/#{archive}", module.id) .. url.toPath();
		var conductanceHead = url.normalize("../dist/conductance-HEAD.tar.gz", module.id) .. url.toPath();
		var conductanceUrl = manifest.data.conductance.href;
		assert.string(conductanceUrl);

		// we'll prime the proxy with the current workspace' install script and archives
		// NOTE: these two URLs must be http, because they're access via `curl` and
		// we can't get curl to use a http proxy for https URLs.
		var installScript = "http://conductance.io/install.sh"
		var installArchive = "http://conductance.io/install/#{system.platform}_#{system.arch}.tar.gz"
		var localInstallScript = url.normalize("../install.sh", module.id) .. url.toPath();

		test.beforeAll {||
			childProcess.run('gup', ['-u', conductanceHead, bundle], {'stdio':'inherit'});
			assert.eq(proxyStrata, null);

			proxyStrata = cutil.breaking {|brk|
				proxyModule.serve(9090) {|proxy|
					// always fake out the condutance URL to serve the latest HEAD
					proxy.fake([
						[conductanceUrl, conductanceHead],
						[installScript, localInstallScript],
						[manifest.manifest_url, new Buffer(manifestContents)],
						[installArchive, bundle],
					], brk);
				}
			}
		}

		test.afterAll {||
			if(proxyStrata) {
				proxyStrata.resume();
				proxyStrata = null;
			}
		}

		/********************************************************
		* helpers to setup / destroy conductance install
		********************************************************/
		var util = require('./util').api(host, system);
		var {assertHealthy, ensureClean, runServer, runMhoScript, isGloballyInstalled, listDir} = util;

		var manualInstall = function(input) {
			assert.ok(fs.exists(bundle), "no such file: #{bundle}");
			host.copyFile(bundle, 'conductance-install');
			host.runPython('
				mkdirp(conductance)
				os.chdir(conductance)
				extractInstaller(path.join(TMP, "conductance-install"))
			');
			var prefix='';
			if (input !== undefined) {
				host.runPython('tmp=path.join(TMP, "conductance"); rmtree(tmp); mkdirp(tmp)');
			}
			return host.runPython("
				exportProxy()
				env['PREFIX']=\"#{prefix}\"
				run_input('#{input || ''}', [script(HOME + '/.conductance/share/install.sh')])
			");
		};

		var selfUpdate = function() {
			return host.runPython("
				exportProxy()
				run([script(conductance + '/bin/conductance'), 'self-update'])
			");
		};

		var withTemp = function(block) {
			var tmpfile = '/tmp/conductance-test-' + process.pid + '-' + withTemp.counter++;
			try {
				block(tmpfile);
			} finally {
				if (fs.exists(tmpfile)) fs.unlink(tmpfile);
			}
		}
		withTemp.counter = 0;

		var modifyTar = function(archive, file, mutate) {
			var root = 'tools/install/';
			file = root + file;
			withTemp {|tmp|
				var cwd = process.cwd();
				fs.mkdir(tmp);
				process.chdir(tmp);
				try {
					childProcess.run('tar', ['xzf', archive], {stdio: 'inherit'});
					var rootEntries = fs.readdir('.');
					if (rootEntries.length == 1) {
						// hacky support for archives with extract=1
						file = rootEntries[0] + '/' + file;
					}
					var contents = fs.readFile(path.join(tmp, file), 'utf-8');
					fs.writeFile(path.join(tmp, file), mutate(contents), 'utf-8');
					childProcess.run('tar', ['czf', archive].concat(rootEntries), {stdio: 'inherit'});
				} finally {
					process.chdir(cwd);
					childProcess.run('rm', ['-rf', tmp]);
				}
			}
		};

		test.beforeEach {||
			ensureClean();
		}

		/********************************************************
		* Tests
		********************************************************/
		test('host is available') {||
			// don't bother running futher tests if this one fails
			host.runPython('print "OK"');
		}

		context('manual') {||
			var modifyManifest = function(block) {
				var manifest = JSON.parse(manifestContents);
				
				// make a new copy for modification
				var newManifest = JSON.parse(manifestContents);
				block(newManifest, manifest);
				return newManifest;
			};

			var withManifest = function(manifest, block) {
				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				], block);
			};

			test.beforeEach {||
				manualInstall();
			}

			test('install works') {||
				assertHealthy();
				listDir('.') .. assert.eq([
					'bin', 'data', 'node_modules', 'share'
				]);
			}

			test('ignores a modified manifest if the version is <= the existing version') {||
				var manifest = modifyManifest {|mf|
					// change node ID
					var node = mf.data.node;
					node.id = "0.8.9"
				}

				withManifest(manifest) {||
					var output = selfUpdate();
					assert.ok(output .. str.contains('No updates available'), output);
				}

				manifest.version = manifest.version - 1;
				withManifest(manifest) {||
					var output = selfUpdate();
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
						, "windows_x86": "http://nodejs.org/dist/v0.8.9/node.exe"
						, "darwin_x64": "http://nodejs.org/dist/v0.8.9/node-v0.8.9-darwin-x64.tar.gz"
					};
					mf.version++;
				}

				var getNodeVersion = function() {
					return runMhoScript("node_version.mho").split("\n")
						.. seq.find(l -> l .. str.startsWith("NODE VERSION:"));
				};
				var initialVersion = getNodeVersion();

				withManifest(manifest) {||
					var output = selfUpdate();
					assert.ok(output .. str.contains('node: 0.8.9'));

					var currentVersion = getNodeVersion();

					currentVersion .. assert.eq("NODE VERSION: 0.8.9");
					currentVersion .. assert.notEq(initialVersion);
				}
				JSON.parse(host.catFile('share/manifest.json')) .. assert.eq(manifest);
			}

			test('updates symlinks and wrapper scripts when manifest definitions change') {||
				// NOTE: this is brittle based on contents of manifest.json,
				// but that should change rarely
				var initialDirs = {
					'.': listDir('.'),
					'share': listDir('share'),
					'node_modules': listDir('node_modules'),
				};
				var initialShare = listDir('share');
				var initialNodeModules = listDir('node_modules');

				var manifest = modifyManifest {|mf|
					mf.version++;
					var existingWrapper = mf.wrappers.node;
					existingWrapper .. object.keys .. each {|k|
						if (k === 'platform_key') continue;
						existingWrapper[k] = {template: 'A script invoking __REL_PATH__!'};
					}

					// remove common link (share/self-update.js)
					mf.data.conductance.links = mf.data.conductance.links .. object.merge({all:[]});
					mf.data.stratifiedjs.links = [
						{src: "modules", dest:"sjs_modules/"},
					];
				}

				proxyStrata.value.fake([
					[manifest.manifest_url, new Buffer(JSON.stringify(manifest))]
				]) {||
					var output = selfUpdate();
					assert.ok(output .. str.contains('Updated. Restart conductance for the new version to take effect.'));
				}

				var without = function(arr, elem) {
					var rv = arr.slice();
					assert.contains(arr, elem);
					rv .. array.remove(elem) .. assert.ok();
					return rv;
				};

				// old links should be removed, and new ones in their place
				listDir('.') .. assert.eq(initialDirs['.'].concat(['sjs_modules']) .. seq.sort());
				listDir('share') .. assert.eq(initialDirs['share'] .. without('self-update.js'));
				listDir('node_modules') .. assert.eq(initialDirs['node_modules'] .. without('stratifiedjs'));
				listDir('sjs_modules/modules') .. assert.contains('http.sjs');

				JSON.parse(host.catFile('share/manifest.json')) .. assert.eq(manifest);

				host.catFile('bin/conductance' + host.executableScriptSuffix).trim()
					.. assert.eq("A script invoking data/conductance-#{manifest.data.conductance.id}/conductance!".replace(/\//g, host.sep));
			}

			test("is upgradeable to a new format via an intermediate release") {||
				// SCENARIO:
				// We need to change from manifest format version N -> version (N+1)
				// So we release a new manifest @ conductance-vN.json including a new version of conductance
				// which contains a self-update.js script that can process versions [N, N+1], and
				// has a new manifest url of conductance-vN-(N+1).json
				//
				// The transitional version's manifest is then conductance-(N+1).json, which contains
				// an implementation that *only* understands format version (N+1)
				
				var conductanceUrl = (n) -> "http://example.com/conductance/#{n}.tar.gz";
				var currentFormat = manifest.format;

				var firstUpdate = modifyManifest {|mf|
					mf.version+=1;
					mf.manifest_url += currentFormat + '-' + (currentFormat + 1);
					mf.data.conductance.id = 'test-2';
					mf.data.conductance.href = conductanceUrl(2);
				}

				var secondUpdate = modifyManifest {|mf|
					mf.version+=2;
					mf.format = currentFormat + 1;
					mf.manifest_url += (currentFormat + 1);
					mf.data.conductance.id = 'test-3';
					mf.data.conductance.href = conductanceUrl(3);
				}

				var thirdUpdate = modifyManifest {|mf|
					mf.version+=3;
					mf.format = currentFormat + 1;
					mf.manifest_url += (currentFormat + 1);
					mf.data.conductance.id = 'test-4';
					mf.data.conductance.href = conductanceUrl(3);
				}

				withTemp {|tmp|
					childProcess.run('cp', [conductanceHead, tmp], {'stdio':'inherit'});
					// the new version of self-update.js understands version N and N+1
					modifyTar(tmp, 'share/self-update.js', data -> data.replace(/var FORMATS = \[/, 'var FORMATS = [' + secondUpdate.format + ', '));

					withTemp {|tmp2|
						childProcess.run('cp', [conductanceHead, tmp2], {'stdio':'inherit'});
						// the final version of self-update.js ONLY understands version N+1
						modifyTar(tmp2, 'share/self-update.js', data -> data.replace(/var FORMATS = .*/, 'var FORMATS = [' + secondUpdate.format + '];'));

						proxyStrata.value.fake([
							[manifest.manifest_url, new Buffer(JSON.stringify(firstUpdate))],
							[firstUpdate.manifest_url, new Buffer(JSON.stringify(secondUpdate))],
							[secondUpdate.manifest_url, new Buffer(JSON.stringify(thirdUpdate))],
							[conductanceUrl(2), tmp],
							[conductanceUrl(3), tmp2],
							]) {||
							selfUpdate() .. str.contains("conductance: test-2") .. assert.ok();
							assertHealthy();
							selfUpdate() .. str.contains("conductance: test-3") .. assert.ok();
							assertHealthy();
							selfUpdate() .. str.contains("conductance: test-4") .. assert.ok();
							assertHealthy();
						}
					}
				}
			}

			test("supports zip files") {||
				// all zip sources are bundled initially, so we need to ensure the
				// self-update script can handle new .zip files:
				var addZip = function(m) {
					m.version++;
					m.data['zippy'] = {
						"id": "test-1",
						"href": "http://downloads.sourceforge.net/project/gnuwin32/unzip/5.51-1/unzip-5.51-1-bin.zip",
						"links": [ { "src": "bin", "dest": "share/zippy" } ],
					};
				};
				withManifest(modifyManifest(addZip)) { ||
					selfUpdate();
					listDir("share/zippy") .. assert.contains("unzip.exe");
				}
			}

			test("allows install location to be moved to a location containing spaces") {||
				var trash = -> host.runPython("rmtree(path.join(HOME, '.conductance moved'))");
				trash();
				try {
					host.runPython("os.rename(conductance, path.join(HOME, '.conductance moved'))");
					assertHealthy('.conductance moved');
				} finally {
					trash();
				}
			}

			test('has only the expected contents') {||
				// notably, ".temp" should be cleaned up
				listDir('.') .. assert.eq([
					'bin', 'data', 'node_modules', 'share'
				]);
			}


			context('error handling') {||
				var assertNotBroken = function() {
					assertHealthy();

					withManifest(modifyManifest(m -> m.version += 2)) {||
						selfUpdate();
					}
				};

				test('if a symlink source is not valid') {||
					var manifest = modifyManifest() {|mf|
						mf.data.conductance.links = [{src: 'noop', dest: 'bin'}];
						mf.version++;
					}
					withManifest(manifest) {||
						assert.raises({filter: e -> e.output.match(/^ERROR: No such file: .*[\/\\]noop$/m)}, selfUpdate);
					}
					assertNotBroken();
				}

				test('if an archive is not valid') {||
					var fakeHref = 'http://example.com/conductance.tar.gz'
					var manifest = modifyManifest() {|mf|
						mf.data.conductance.href = fakeHref;
						mf.data.conductance.id = '99.99.99';
						mf.version++;
					}
					withManifest(manifest) {||
						proxyStrata.value.fake([[fakeHref, new Buffer("hardly a tar")]]) {||
							assert.raises({filter: e -> e.output.match(/^ERROR: Command failed with status: \d+$/m)}, selfUpdate);
						}
					}
					assertNotBroken();

					// with the same manifest but a fixed manifest, it should succeed
					withManifest(manifest) {||
						proxyStrata.value.fake([[fakeHref, conductanceHead]]) {||
							selfUpdate();
						}
					}
				}

				test('if an URL fails to download') {||
					var fakeHref = 'http://example.com/conductance.tar.gz'
					var manifest = modifyManifest() {|mf|
						mf.data.conductance.href = fakeHref;
						mf.data.conductance.id = '99.99.99';
						mf.version++;
					}
					withManifest(manifest) {||
						proxyStrata.value.fake([[fakeHref, null]]) {||
							assert.raises({filter: e -> e.output.match(/^ERROR: Download failed.*try again later/m)}, selfUpdate);
						}
					}
					assertNotBroken();
				}
			}

			context('manifest version upgrades') {||
				var understoodFormats = require('../share/self-update.js').FORMATS;

				test('prints version error from the new manifest') {||
					var manifest = modifyManifest {|mf|
						mf.format++;
						mf.version++;
						mf.version_error = "You can't handle the manifest!";
					};
					withManifest(manifest) {||
						assert.raises({filter: e -> e.output .. str.contains(
							"Manifest format version: #{manifest.format}\n" +
							"This installation understands versions: #{understoodFormats.join(", ")}\n" +
							"You can't handle the manifest!"
						)}, selfUpdate);
					}
				}
			}
		}

		context('automated installer') {||
			// NOTE: on windows, we can't use the automated installer, since
			// it opens a GUI window. So we're still using the manual installer here,
			// and assuming the self-extractor does what it's supposed to.
			test.beforeAll {|s|
				if (system.platform == 'windows') {
					s.install = manualInstall;
					s.installGloballyPrompt = "Do you want to add conductance to your $PATH?";
				} else {
					s.install = function(input) {
						return host.runPython("
							exportProxy()
							env['CONDUCTANCE_HEADLESS']='1'
							base = path.join(TMP, 'conductance')
							rmtree(base)
							mkdirp(path.join(base, 'bin'))
							env['PREFIX'] = base
							script = path.join(TMP, 'installer');
							run(['curl', '-L', '-s', '--output', script, '#{installScript}'])
							SILENT=True # suppress 'command failed' python output
							run_input(#{JSON.stringify(input)}, ['bash', '-e', script])
						");
					};
					s.installGloballyPrompt = "Do you want to install conductance scripts globally into #{util.installRoot}/bin?";
				}
			}

			context('bash installer') {||
				test('installs to a clean system') {|s|
					s.install('y'); // install into $PREFIX
					isGloballyInstalled() .. assert.ok();
					assertHealthy(util.installRoot);
				}

				context("with existing install") {|s|
					test.beforeEach( -> host.runPython("mkdirp(conductance)"));

					test('aborts by default when directory exists') {|s|
						['n','no',''] .. each {|response|
							logging.info("Responding with: '#{response}'");
							var output;
							var failed = false;
							try {
								s.install(response);
							} catch(e) {
								failed = true;
								output = e.output;
							}
							assert.ok(failed, 'Command succeeded!');
							assert.ok(output, 'no output');
							var homePath = host.runPython("print HOME").trim();

							output.split('\n') .. assert.eq([
								"This installer will REMOVE the existing contents at #{homePath}/.conductance",
								"Continue? [y/N] ",
								"Cancelled.",
							]);
						}
					}

					test('overwrites existing directory if the user tells it to') {|s|
						var output = s.install('y\ny');
						var homePath = host.runPython("print HOME").trim();

						output .. str.contains("This installer will REMOVE the existing contents at #{homePath}/.conductance\nContinue? [y/N]") .. assert.ok;
						output .. str.contains("Cancelled.") .. assert.falsy;
						assertHealthy(util.installRoot);
					}
				}
			}.skipIf(system.platform == 'windows', "N/A")

			test("windows self-extracting .exe") {|s|
				var homePath = host.runPython("print HOME").trim();
				var installerPath = url.normalize("../dist/Conductance-#{system.arch}.exe", module.id) .. url.toPath();
				var mockCmdPath = url.normalize("./fixtures/mock-cmd.exe", module.id) .. url.toPath();

				console.warn();
				childProcess.run('gup', ['-u', installerPath, mockCmdPath], {'stdio':'inherit'});

				var remoteInstaller = host.copyFile(installerPath, 'conductance.exe');
				var remoteCmdExe = host.copyFile(mockCmdPath, 'mock-cmd.exe');
				host.runPython("
					installer = #{JSON.stringify(remoteInstaller)}
					with open(installer, 'rb') as f:
						installer_contents = f.read()
					assert 'cmd.exe' in installer_contents, 'cmd.exe missing from exe contents'
					installer_contents = installer_contents.replace('cmd.exe', 'dmc.exe')
					with open(installer, 'wb') as out:
						out.write(installer_contents)

					import tempfile
					bindir = tempfile.mkdtemp()
					try:
						# insert dmc.exe
						shutil.copy(#{JSON.stringify(remoteCmdExe)}, path.join(bindir, 'dmc.exe'))
						child_env = env.copy()
						child_env['PATH'] = os.pathsep.join([bindir,  env['PATH']])

						args_file = path.join(TMP, 'cmd-args')
						if os.path.exists(args_file):
							os.remove(args_file)
						child_env['LOG'] = args_file
						run([installer], env=child_env)
						with open(args_file) as f:
							args = f.read().splitlines()
						print 'ARGS: ' + repr(args)
					finally:
						shutil.rmtree(bindir)

					exportProxy()
					assert args[0] == '/K'
					args[0] = '/C' # run noninteractively for test purposes

					run_input('y', ['cmd.exe'] + args)
				");
				isGloballyInstalled() .. assert.ok();
				assertHealthy();
			}.skipIf(system.platform != 'windows', "N/A")

			test('skips global install if the user wants') {|s|
				s.install('n') .. assert.contains(s.installGloballyPrompt + " [Y/n] \n\nSkipped global installation.");
				isGloballyInstalled() .. assert.eq(false);
				assertHealthy();
			}

			test('instructions to re-run installer are correct') {|s|
				var output = s.install('n');
				var match = /Re-run this installer \(([^)]+)\) if you change your mind/.exec(output);
				assert.ok(match, "couldn't find re-run instructions");
				var installerLocation = match[1];

				isGloballyInstalled() .. assert.eq(false);
				host.runPython("
					exportProxy()
					env['PREFIX']=#{JSON.stringify(util.installRoot || '/not-used')} # only used on posix
					run_input('y', [#{JSON.stringify(installerLocation)}])
				");
				assertHealthy(util.installRoot);
			}

		}

	}.timeout(90).skipIf(!host, "No host configured for this platform");;
}
