#!/usr/bin/env sjs
var Url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var nodeFs = require('nodejs:fs')
var stream = require('sjs:nodejs/stream');
var path = require('nodejs:path');
var http = require('sjs:http');
var seq = require('sjs:sequence');
var cutil = require('sjs:cutil');
var object = require('sjs:object');
var selfUpdate = require('./share/self-update.js');
var logging = require('sjs:logging');
var { withServer } = require('sjs:nodejs/http');

// only used by in-process require() - when running as a
// command line tool, cache_dir *must* be specified
var cache_dir = Url.normalize('dist/dl', module.id) .. Url.toPath();

exports.serve = function(port, block) {
	var port_config =
		{ address:  '0.0.0.0:' + port,
			ssl: false,
		};

	var ready = require('sjs:cutil').Condition();
	var fakes = {};

	var api = {
		fake: function(config, block) {
			var orig = fakes;
			fakes = object.merge(fakes, config);
			try {
				block();
			} finally {
				fakes = orig;
			}
		},
	};

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
				try {
					var url = request.url;
					if (url[0] == '/') url = url.slice(1);
					var setLength = (s) -> response.setHeader('Content-Length', String(s));
					var fake = fakes[url];

					var localFile;
					if (fake !== undefined) {
						if (Buffer.isBuffer(fake)) {
						}
						setLength(fake.length);
						response.write(fake);
					} else {
						localFile = exports.download(url);
					}

					if (localFile) {
						setLength(fs.stat(localFile).size);
						console.log("PROXY: sending #{localFile}");
						var f = nodeFs.createReadStream(localFile);
						f .. stream.pump(response);
					}
					response.end();
				} catch(e) {
					try {
						response.writeHead(500);
						response.end(e.toString());
						logging.error("error handling request to #{url}; written 400 response: #{e}\n");
					} catch (writeErr) {
						// ending up here means that we probably already sent headers to the clients...
						logging.error(writeErr + "\n");
						// throw the original exception, it's more important
						throw e;
					}
				}
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

var locks = {};
exports.download = function(url) {
	// ensures a URL is cached. Returns the local file path
	// uses cacheLock to prevent concurrent access
	var filename = url.replace(/[^a-zA-Z0-9.]+/g, '_');
	var cacheLock = locks[filename];
	if (!cacheLock) {
		// TODO: this is unbounded...
		cacheLock = cutil.Semaphore();
		locks[filename] = cacheLock;
	}

	cacheLock.acquire();
	try {
		var dest = path.join(cache_dir, filename);
		if (!fs.exists(dest)) {
			console.log("PROXY: Caching to: " + filename);
			selfUpdate.ensureDir(path.dirname(dest));
			waitfor(var err, tmpfile) {
				selfUpdate.download(url, resume);
			}
			if (err) throw err;
			run("mv", tmpfile.path, dest);
		}
		return dest;
	} finally {
		cacheLock.release();
	}
};

if(require.main === module) {
	var parser = require('sjs:dashdash').createParser({options: [
		{ name: 'port', type: 'integer', },
		{ name: 'cache', type: 'string',},
		{ name: 'help', type: 'bool', },
	]});

	var opts;
	try {
		opts = parser.parse();
		if (opts.help) throw new Error();
		if (opts._args.length > 0) {
			throw new Error("Too many arguments");
		}
		if (!opts.cache) {
			throw new Error("You must provide a cache dir");
		}
		cache_dir = opts.cache;
		if (!fs.exists(cache_dir)) throw new Error("No such directory: " + cache_dir);
	} catch(e) {
		if (e.message) console.error("Error: " + e.message);
		console.error("Usage: proxy [OPTIONS]");
		console.error(parser.help());
		process.exit(1);
	}

	exports.serve(opts.port || 9090) {||
		console.log("PROXY: ready...");
		hold();
	}
}
