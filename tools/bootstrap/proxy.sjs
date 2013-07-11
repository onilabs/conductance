var Url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var stream = require('sjs:nodejs/stream');
var path = require('nodejs:path');
var http = require('sjs:http');
var cutil = require('sjs:cutil');
var selfUpdate = require('./share/self-update.js');
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
		console.log("PROXY: Shutting down server...");
	} or {
		withServer(port_config) {
			|server|
			ready.set();
			server.eachRequest {
				|{request, response}|
				//console.log("REQUEST: ",request);
				var url = request.url;
				if (url[0] == '/') url = url.slice(1);
				var localFile = exports.download(url);
				var size = fs.stat(localFile).size;
				response.setHeader('Content-Length', String(size));
				console.log("PROXY: sending #{localFile}");
				var f = require('nodejs:fs').createReadStream(localFile);
				f .. stream.pump(response);
				response.end();
			}
		};
	}
};

var run = function(cmd /*, args */) {
	waitfor(var err) {
		selfUpdate.runCmd(cmd, Array.prototype.slice.call(arguments, 1), resume);
	}
	if (err !== undefined) throw err;
};

var cacheLock = cutil.Semaphore();
exports.download = function(url) {
	// ensures a URL is cached. Returns the local file path
	// uses cacheLock to prevent concurrent access
	var base = Url.normalize('dist/dl', module.id) .. Url.toPath();
	var filename = url.replace(/[^a-zA-Z0-9.]+/g, '_');
	cacheLock.acquire();
	try {
		var dest = path.join(base, filename);
		if (!fs.exists(dest)) {
			console.log("PROXY: Caching to: " + filename);
			selfUpdate.ensureDir(path.dirname(dest));
			waitfor(var tmpfile) {
				selfUpdate.download(url, resume);
			}
			run("mv", tmpfile.path, dest);
		}
		return dest;
	} finally {
		cacheLock.release();
	}
};

if(require.main === module) {
	exports.serve(9090) {||
		console.log("PROXY: ready...");
		hold();
	}
}
