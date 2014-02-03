var url = require('sjs:url');
var seq = require('sjs:sequence');
var http = require('sjs:http');
var assert = require('sjs:assert');
var logging = require('sjs:logging');

exports.api = function(host, system) {
	var isWindows = system.platform == 'windows';
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
	};
	return self;
};
