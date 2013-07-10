var url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var manifestJson = fs.readFile(url.normalize('share/manifest.json', module.id) .. url.toPath, 'utf-8');
var manifest = JSON.parse(manifestJson);
var { withServer } = require('sjs:nodejs/http');

exports.serve = function(port, block) {
	var port_config =
		{ address:  '0.0.0:' + port,
			capacity: 1,
			max_connections: 1,
			ssl: false,
		};

	var ready = require('sjs:cutil').Condition();

	waitfor {
		ready.wait();
		block();
		console.log("Shutting down server...");
	} or {
		withServer(port_config) {
			|server|
			ready.set();
			server.eachRequest {
				|req|
				console.log("REQUEST: ",req);
			}
		};
	}
}

if(require.main === module) {
	exports.serve(9090) {||
		console.log("ready...");
		hold();
	}
}
