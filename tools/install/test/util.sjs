var url = require('sjs:url');
var seq = require('sjs:sequence');
var http = require('sjs:http');
var assert = require('sjs:assert');
var logging = require('sjs:logging');

exports.api = function(host) {
	var self = {
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
			host.runCmd("rm -rf $HOME/.conductance");
		},

		_copyFixture: function(name) {
			var dest = "/tmp/#{name}";
			host.copyFile(url.normalize("fixtures/#{name}", module.id) .. url.toPath, dest);
			return dest;
		},

		_runCommand: function(args, conductance_root) {
			conductance_root = conductance_root || '$HOME/.conductance';
			return host.runCmd(host.nativeScript(conductance_root + "/bin/conductance", args));
		},

		runServer: function(config, conductance_root) {
			return self._runCommand(["serve", "#{self._copyFixture(config)}"], conductance_root);
		},

		runMhoScript: function(config, conductance_root) {
			return self._runCommand(["exec", "#{self._copyFixture(config)}"], conductance_root);
		},
	};
	return self;
};
