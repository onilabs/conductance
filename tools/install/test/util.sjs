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

		runServer: function(config, conductance_root) {
			conductance_root = conductance_root || '$HOME/.conductance';
			host.copyFile(url.normalize("fixtures/#{config}", module.id) .. url.toPath, "/tmp/#{config}");
			return host.runCmd("#{conductance_root}/bin/conductance run /tmp/#{config}");
		},

	};
	return self;
};
