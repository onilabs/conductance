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
var {get, ownKeys} = object;
var path = require('nodejs:path');

var hosts = require('./hosts');
var proxyModule = require('../proxy');
var util = require('./util');

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
	var host = util.getHost(system);
	var arch = system.arch;

	context("#{platform}_#{arch}") {||
		var [manifest, manifestContents] = util.loadManifest();
		var bundle = util.bundlePath(system);
		var conductanceHead = util.conductanceHead;
		var conductanceUrl = manifest.data.conductance.href;
		assert.string(conductanceUrl);

		// we'll prime the proxy with the current workspace' install script and archives
		// NOTE: these two URLs must be http, because they're access via `curl` and
		// we can't get curl to use a http proxy for https URLs.
		var installScript = "http://conductance.io/install.sh"
		var installArchive = "http://conductance.io/install/#{system.platform}_#{system.arch}.tar.gz"
		var localInstallScript = url.normalize("../install.sh", module.id) .. url.toPath();

		var hostUtil = util.api(system);

		test.beforeAll {||
			assert.eq(proxyStrata, null);

			proxyStrata = cutil.breaking {|brk|
				hostUtil.serveProxy {|proxy|
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
		var {
			assertHealthy, ensureClean, runServer, runMhoScript,
			isGloballyInstalled, listDir, selfUpdate, manualInstall,
			assertNoLeftoverTempFiles
		} = hostUtil;

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

		test.afterEach {||
			assertNoLeftoverTempFiles();
		}

		/********************************************************
		* Tests
		********************************************************/
		test('host is available') {||
			// don't bother running futher tests if this one fails
			host.runPython('print "OK"');
		}

		test("bundle contains a working nodejs") {||
			hostUtil._extractInstaller();
			host.runPython("
				run([path.join(conductance, script('bin/node')), '-e', 'console.log(__filename)'])
			") .. assert.eq("[eval]");
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
				host.runPython("
					run([path.join(conductance, script('bin/sjs')), '-e', '123 .. console.log()'])
				") .. assert.eq("123");

				host.runPython("
					run([path.join(conductance, script('bin/node')), '-e', 'console.log(__filename)'])
				") .. assert.eq("[eval]");
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

			var old_nodejs_hrefs = {
				"platform_key": ["platform", "arch"]
				, "linux_x64": "http://nodejs.org/dist/v0.8.9/node-v0.8.9-linux-x64.tar.gz"
				, "windows_x64": "http://nodejs.org/dist/v0.8.9/x64/node.exe"
				, "windows_x86": "http://nodejs.org/dist/v0.8.9/node.exe"
				, "darwin_x64": "http://nodejs.org/dist/v0.8.9/node-v0.8.9-darwin-x64.tar.gz"
			};

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
					['node_cmd', 'node_sh'] .. each {|name|
						mf.wrappers[name] = {template: 'A script invoking __REL_PATH__!'};
					}

					// remove self-update.js link
					var conductanceLinks = mf.data.conductance.links.all;
					var selfUpdateLink = conductanceLinks .. seq.find(link -> link.src .. str.contains('self-update.js'));
					assert.ok(selfUpdateLink);
					conductanceLinks .. array.remove(selfUpdateLink) .. assert.ok();
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
					mf.data.conductance.id = 'long-test-version-3';
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
							selfUpdate() .. str.contains("conductance: long-test-version-3") .. assert.ok();
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
							assert.raises({filter: e -> e.output.match(/^ERROR: incorrect header check$/m)}, selfUpdate);
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
							"This installation understands versions: #{understoodFormats.join(",")}\n" +
							"You can't handle the manifest!"
						)}, selfUpdate);
					}
				}
			}

			test('installs executable stubs for use in `git bash`') {||
				manualInstall();
				// XXX: assumes location of `git` in program files.
				// NOTE: we pipe commands into an interactive bash session (rather than using `-c`)
				// because everything crashes (even `dirname`) if you run it non-interactively
				var output = host.runPython("
					# ensure we're getting the installed $PATH:
					sys_path = subprocess.check_output([path.join(conductance, 'share/pathed.exe'), '-l']).splitlines()
					os.environ['PATH'] = os.pathsep.join(sys_path)

					proc = subprocess.Popen(['C:/Program Files/Git/bin/bash.exe', '--login', '-i'], stdin=subprocess.PIPE)
					proc.stdin.write('echo \"PATH:$PATH\"\\n')
					proc.stdin.write('conductance version                               \\necho CONDUCTANCE_EXIT_$?\\n')
					proc.stdin.write('node --version                                    \\necho NODE_EXIT_$?\\n')
					proc.stdin.write('sjs -e \"console.log(require(\\'sjs:sys\\').version)\"\\necho SJS_EXIT_$?\\n')
					proc.stdin.close()
					proc.wait()
				");
				output .. assert.contains('CONDUCTANCE_EXIT_0');
				output .. assert.contains('NODE_EXIT_0');
				output .. assert.contains('SJS_EXIT_0');
			}.skipIf(system.platform != 'windows', "N/A")

			test('update while conductance is running') {||
				// make a new manifest with all versions updated (but the same archive).
				// In the case of node, we actually downgrade the .exe to make sure a change
				// to the running .exe works
				var manifest = modifyManifest {|mf|
					var components = 0;
					var nodeComponent;
					mf.data .. ownKeys() .. each {|k|
						components++;
						mf.data[k]['id'] = mf.data[k]['id'] + '-new';
						if (k == 'node') {
							nodeComponent = mf.data[k];
						}
					}
					assert.ok(components > 1, "too few components: #{components}");
					assert.ok(nodeComponent, "node component not found");
					nodeComponent.href = old_nodejs_hrefs;
					mf.version++;
				};

				withManifest(manifest) {||
					var fixture = hostUtil._copyFixture('hello.mho');
					var output = host.runPython("
						import time
						import urllib

						server = subprocess.Popen([script(conductance + '/bin/conductance'), 'serve', #{JSON.stringify(fixture)}])
						time.sleep(1)
						assert server.poll() is None, 'server ended...'
						try:
							assert urllib.urlopen('http://localhost:7079/up').read() == 'ok'

							exportProxy()
							run([script(conductance + '/bin/conductance'), 'self-update'])
							assert urllib.urlopen('http://localhost:7079/ping').read() == 'Pong!'
						finally:
							server.terminate()
							server.wait()
					");
					assert.ok(output .. str.contains('-new'));
				}
				assertHealthy();
			}
		}

		context('automated installer') {||
			// NOTE: on windows, we can't use the automated installer, since
			// it opens a GUI window. So we're still using the manual installer here,
			// and we have an explicit test that the self-extracting .exe is
			// creating the files and running the commands we expect.
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
					s.installGloballyPrompt = "Do you want to install conductance scripts globally into #{hostUtil.installRoot}/bin?";
				}
			}

			context('bash installer') {||
				test('installs to a clean system') {|s|
					s.install('y'); // install into $PREFIX
					isGloballyInstalled() .. assert.ok();
					assertHealthy(hostUtil.installRoot);
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
						assertHealthy(hostUtil.installRoot);
					}
				}
			}.skipIf(system.platform == 'windows', "N/A")

			test("self-extracting .exe") {|s|
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
					env['PREFIX']=#{JSON.stringify(hostUtil.installRoot || '/not-used')} # only used on posix
					run_input('y', [#{JSON.stringify(installerLocation)}])
				");
				assertHealthy(hostUtil.installRoot);
			}

		}
	}.timeout(90).skipIf(!host, "No host configured for this platform");

	if (platform != 'windows') {
		// don't need to check windows compatibility, since
		// there was no v1 windows installer
		context("#{platform}_#{arch} forwards compatibility") {||
			var v1Code = url.normalize('../tmp/v0.2.0.git', module.id) .. url.toPath();
			var v1InstallRoot = path.join(v1Code, 'tools/install');

			var archive = "#{platform}_#{arch}.#{platform == 'windows' ? 'zip' : 'tar.gz'}";
			var bundle = path.join(v1InstallRoot, "dist/#{archive}");

			// the v1 manifest, as of release 0.1:
			var oldManifestPath = path.join(v1InstallRoot, 'share/manifest.json');
			// the latest v1-compatible manifest:
			var manifestPath =    url.normalize('../manifest-v1.json', module.id) .. url.toPath;
			// the latest v2-compatible manifest:
			var newManifestPath = url.normalize('../manifest-v2.json', module.id) .. url.toPath;
			var oldManifest, manifest, newManifest;

			test.beforeAll {||
				console.warn();
				childProcess.run('gup', ['-u', v1Code], {'stdio':'inherit'});
				childProcess.run('gup', ['-j5', '-u', oldManifestPath, manifestPath, newManifestPath], {'stdio':'inherit'});

				var oldManifestContents = fs.readFile(oldManifestPath, 'utf-8');
				oldManifest = oldManifestContents .. JSON.parse();
				assert.eq(oldManifest.format, 1);
				assert.contains(oldManifest.manifest_url, "manifest-v1.json");

				var manifestContents = fs.readFile(manifestPath, 'utf-8');
				manifest = JSON.parse(manifestContents);
				assert.eq(manifest.format, 1);
				assert.contains(manifest.manifest_url, "manifest-v2.json");
				assert.notEq(oldManifest.version, manifest.version);

				var newManifestContents =  fs.readFile(newManifestPath, 'utf-8');
				newManifest = JSON.parse(newManifestContents);
				assert.eq(newManifest.format, 2);
				assert.contains(newManifest.manifest_url, "manifest-v2.json");
				assert.notEq(manifest.version, newManifest.version);

				var conductanceUrl = newManifest.data.conductance.href;
				assert.notEq(oldManifest.data.conductance.href, conductanceUrl);

				assert.eq(proxyStrata, null);

				proxyStrata = cutil.breaking {|brk|
					hostUtil.serveProxy() {|proxy|
						proxy.fake([
							[oldManifest.manifest_url, new Buffer(manifestContents)],
							[newManifest.manifest_url, new Buffer(newManifestContents)],
							[conductanceUrl, util.conductanceHead],
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

			var hostUtil = util.api(system, bundle);
			var {
				assertHealthy, ensureClean, runServer, runMhoScript,
				isGloballyInstalled, listDir, selfUpdate, manualInstall
			} = hostUtil;

			test.beforeEach {||
				ensureClean();
			}

			test("can update cleanly to the latest version") {||
				manualInstall();
				assertHealthy();
				var remoteManifest = host.catFile("share/manifest.json") .. JSON.parse();
				remoteManifest.format .. assert.eq(1);
				remoteManifest .. assert.eq(oldManifest);

				// the first update gets the latest manifest-v1.json, which contains
				// the new updater:
				selfUpdate();
				assertHealthy();
				remoteManifest = host.catFile("share/manifest.json") .. JSON.parse();
				remoteManifest.format .. assert.eq(1);
				remoteManifest .. assert.eq(manifest);

				// the next update installs the very latest code, using the latest updater:
				selfUpdate();
				assertHealthy();
				remoteManifest = host.catFile("share/manifest.json") .. JSON.parse();
				remoteManifest.format .. assert.eq(2);
				remoteManifest .. assert.eq(newManifest);
			}

		}.timeout(90).skipIf(!host, "No host configured for this platform");
	}
}
