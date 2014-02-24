var url = require('sjs:url');
var seq = require('sjs:sequence');
var http = require('sjs:http');
var assert = require('sjs:assert');
var logging = require('sjs:logging');
var fs = require('sjs:nodejs/fs');
var { get } = require('sjs:object');
var childProcess = require('sjs:nodejs/child-process');
var proxyModule = require('../proxy');

var builtConductanceHead = false;
exports.api = function(system, bundle) {
	var host = exports.getHost(system);
	bundle = bundle || exports.bundlePath(system);

	var isWindows = system.platform == 'windows';
	var depsBuilt = false;
	var self = {
		installRoot: isWindows ? undefined : '/tmp/conductance',
		assertHealthy: function(conductance_root) {
			// run a little test server (shuts itself down after we ping it)
			var contents;
			waitfor {
				self.runServer("hello.mho", conductance_root);
			} and {
				seq.integers(0, 10) .. seq.each {||
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
		},

		buildDeps: function() {
			var opts = {stdio: ['ignore', 'ignore', 'pipe']};
			try {
				if (!builtConductanceHead) {
					childProcess.run('gup', ['-u', exports.conductanceHead], opts);
					builtConductanceHead = true;
				}
				childProcess.run('gup', ['-u', bundle], opts);
			} catch(e) {
				logging.print(e.stderr);
				throw e;
			}
		},

		ensureClean: function() {
			host.runPython("
				conductance = path.join(user.home, '.conductance')
				rmtree(conductance)
				if WINDOWS:
					# remove conductance from $PATH
					try:
						run(pathed_cmd + ['-r', path.join(conductance, 'bin')])
					except subprocess.CalledProcessError as e:
						print 'Warn: %s' % (e,)
				else:
					rmtree('/tmp/conductance/bin')
			");
			self.isGloballyInstalled() .. assert.eq(false, "conductance is globally installed!");
		},

		listDir: function(dir) {
			return host.runPython("print '\\n'.join(os.listdir(path.join(conductance, \"#{dir}\")))").trim().split("\n")
				.. seq.filter()
				.. seq.sort()
				.. seq.toArray();
		},

		isGloballyInstalled: function(prefix) {
			if (isWindows) {
				// for debugging
				//host.runPython("
				//	run(pathed_cmd + ['-l'])
				//");
				var output = host.runPython('
					bindir = path.join(conductance, "bin")
					code = subprocess.Popen(pathed_cmd + ["-q", bindir]).wait()
					assert code in (0,1)
					print "true" if code == 0 else "false"
				');
				['true','false'] .. assert.contains(output);
				return output == 'true';
			} else {
				var output = host.runPython("
					bindir = path.join(#{JSON.stringify(prefix || self.installRoot)}, 'bin')
					try:
						items = os.listdir(bindir)
					except OSError:
						items = []
					exists = [file in items for file in ('sjs', 'conductance')]
					assert all(exists) or (not any(exists)), 'inconsistent install found! %r' % (exists,)
					print 'true' if all(exists) else 'false'
				");
				['true','false'] .. assert.contains(output);
				return output == 'true';
			}
		},

		_extractInstaller: function() {
			if (!depsBuilt) self.buildDeps();
			host.copyFile(bundle, 'conductance-install');
			host.runPython('
				mkdirp(conductance)
				os.chdir(conductance)
				extractInstaller(path.join(TMP, "conductance-install"))
			');
		},

		_runInstaller: function(input) {
			return host.runPython("
				exportProxy()
				env['PREFIX']=''
				run_input('#{input || ''}', [script(HOME + '/.conductance/share/install.sh')])
			");
		},

		manualInstall: function(input) {
			self._extractInstaller();
			self._runInstaller(input);
		},

		selfUpdate: function() {
			return host.runPython("
				exportProxy()
				run([script(conductance + '/bin/conductance'), 'self-update'])
			");
		},

		_copyFixture: function(name) {
			var dest = "#{name}";
			return host.copyFile(url.normalize("fixtures/#{name}", module.id) .. url.toPath, dest);
		},

		_run: function(args, conductance_root) {
			conductance_root = conductance_root ? JSON.stringify(conductance_root) : 'conductance';
			return host.runPython("
				os.chdir(HOME)
				os.chdir(#{conductance_root})
				run([script('bin/conductance')] + #{JSON.stringify(args)})
			");
		},

		runServer: function(config, conductance_root) {
			return self._run(["serve", "#{self._copyFixture(config)}"], conductance_root);
		},

		runMhoScript: function(config, conductance_root) {
			return self._run(["exec", "#{self._copyFixture(config)}"], conductance_root);
		},

		serveProxy: function(block) {
			return proxyModule.serve(exports.getProxyPort(system), block);
		},
	};
	return self;
};

exports.bundlePath = function(system) {
	var platform = system .. exports.getPlatform;
	var archive = "#{platform}_#{system .. exports.getArch}.#{platform == 'windows' ? 'zip' : 'tar.gz'}";
	var bundle = url.normalize("../dist/#{archive}", module.id) .. url.toPath();
	return bundle;
};

exports.getPlatform = (sys) -> sys .. get('platform');
exports.getHost = (sys) -> sys.host && sys.host();
exports.getArch = (sys) -> sys .. get('arch');
exports.getProxyPort = function(sys) {
	var host = sys .. exports.getHost();
	var proxyPort = parseInt(url.parse(host.proxy).port, 10);
	assert.number(proxyPort);
	return proxyPort;
}


exports.loadManifest = function (path) {
	var manifestContents = fs.readFile(path || (url.normalize('../share/manifest.json', module.id) .. url.toPath), 'utf-8')
	var manifest = JSON.parse(manifestContents);
	return [manifest, manifestContents];
}
exports.conductanceHead = url.normalize("../dist/conductance-HEAD.tar.gz", module.id) .. url.toPath();
