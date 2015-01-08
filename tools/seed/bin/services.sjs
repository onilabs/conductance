#!/usr/bin/env conductance
@ = require('mho:std');
require('../modules/hub');

if (require.main === module) {
	require('seed:env').defaults();
}

exports.awaitRunningServer = function awaitRunningServer(desc, isRunning) {
	waitfor {
		while(true) {
			if (isRunning()) {
				break;
			} else {
				hold(1000);
			}
		}
	} or {
		hold(2000);
		@info("Still waiting for #{desc} to start...");
		hold();
	}
}

exports.tryHttp = function(block) {
	try {
		block();
		return true;
	} catch(e) {
		if (!e.message .. @contains('ECONNREFUSED')) {
			throw e;
		}
	}
	return false;
};

var etcd = exports.etcd = (function() {
	var port = -> @env.get('etcd-port');
	var host = -> @env.get('etcd-host');
	var proto = -> @env.get('etcd-proto');
	var root_url = -> "#{proto()}://#{host()}:#{port()}/v2/";

	var isRunning = function(root) {
		root = root || root_url();
		return exports.tryHttp {||
			@http.get(root + "stats/self", @env.get('etcd-ssl'));
			@info("Found etcd server on #{root}");
		}
	};

	var rv = {};
	rv.awaitRunningServer = function awaitRunningServer() {
		var root = root_url();
		exports.awaitRunningServer("etcd", -> isRunning(root));
	}

	rv.withServer = function(block) {
		if (isRunning()) {
			@info("Using existing etcd server");
			block();
		} else {
			@info("Starting new etcd server");
			@env.get('production') .. @assert.eq(false);
			waitfor {
				@assert.notOk(process.env.ETCD_DATA_DIR, "ETCD_DATA_DIR defined");
				@assert.notOk(process.env.ETCD_NAME, "ETCD_NAME defined");
				process.env.ETCD_DATA_DIR = @path.join(@env.get('data-root'), 'etcd');
				process.env.ETCD_NAME = require('nodejs:os').hostname();

				var bin = (@url.normalize('../tools/etcd/bin/etcd', module.id) .. @url.toPath);
				@childProcess.run(bin, [], {'stdio':'inherit', detached: true});
			} or {
				rv.awaitRunningServer();
				block();
			}
		}
	};

	return rv;
})();

var gcd = exports.gcd = (function() {
	var host = @env('gcd-host');
	var root_url = -> host;

	var isRunning = function(root) {
		root = root || root_url();
		if(root === null) {
			// running on gce, assume OK
			return true;
		}
		return exports.tryHttp {||
			@http.get(root);
			@info("Found gcd server on #{root}");
		}
	};

	var rv = {};
	rv.awaitRunningServer = function awaitRunningServer() {
		var root = root_url();
		exports.awaitRunningServer("gcd", -> isRunning(root));
	}

	rv.withServer = function(block) {
		if (!@env.get('use-gcd')) {
			@info("gcd server not required");
			return block();
		}

		if (isRunning()) {
			@info("Using existing gcd server");
			block();
		} else {
			@info("Starting new gcd server");
			waitfor {
				var bin = (@url.normalize('../tools/gcd/dev_server', module.id) .. @url.toPath);
				var data_path = @path.join(@env.get('data-root'), 'gcd');
				var url = @url.parse(host);
				@childProcess.run(bin, ['start', "--port=#{url.port}", data_path], {'stdio':'inherit', detached: true});
			} or {
				rv.awaitRunningServer();
				block();
			}
		}
	};

	return rv;
})();

exports.withServices = function(block) {
	var ready = {
		etcd: @Condition(),
		gcd: @Condition(),
	};

	waitfor {
		exports.etcd.withServer {||
			ready.etcd.set();
			hold();
		}
	} or {
		exports.gcd.withServer {||
			ready.gcd.set();
			hold();
		}
	} or {
		ready .. @ownValues .. @each(c -> c.wait());
		block();
	}
};

if (require.main === module) {
	var exitStatus = 0;
	exports.withServices {||
		var args = @argv();
		if(args.length == 0) {
			console.log("services ready, waiting for shutdown ...");
			// NOTE: hold() will not keep the process open -
			// we actually do want to wait until ctrl+c (or EOF)
			process.stdin .. @each(-> null);
		} else {
			var cmd = args.shift();
			var proc = @childProcess.run(cmd, args, {stdio:'inherit', throwing: false});
			exitStatus = proc.code;
			exitStatus .. @assert.number();
		}
	}
	process.exit(exitStatus);
}
