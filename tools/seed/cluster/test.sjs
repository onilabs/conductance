#!/usr/bin/env sjs
@ = require('sjs:std');
@etcd = require('./etcd');
@slave = require('./slave');
@server = require('./master');

var port = 4001;
var host = 'localhost';
var proto = 'http';
var clientSettings = {
	host:host,
	port:port,
};

function awaitRunningServer() {
	var root = "#{proto}://#{host}:#{port}/v2/";
	waitfor {
		while(true) {
			try {
				@http.get(root + "keys/");
				@info("Found server on #{root}");
				break;
			} catch(e) {
				if (!e.message .. @contains('ECONNREFUSED')) {
					throw e;
				}
				hold(1000);
			}
		}
	} or {
		hold(2000);
		@info("Still waiting for etcd to start...");
		hold();
	}
}

waitfor {
	@childProcess.run('etcd/bin/etcd', {'stdio':'inherit'});
} or {
	awaitRunningServer();
	var server = new @etcd.Etcd(host, port);
	// discard operations from previous master
	try {
		server.del('app/op/', {recursive:true});
	} catch(e) {
		if (e.errorCode !== @etcd.err.KEY_NOT_FOUND) throw e;
	}
	waitfor {
		@server.main(server, {
			balanceTime: 20,
		});
	} or {
		hold(1000);
		server .. @server.op('start', 'tim/123');
		hold(10000);
		@info("STOPPING app");
		server .. @server.op('stop', 'tim/123');
		hold();
	} or {
		hold(100);
		;[1, 2
			//,3,4,5
		]
			.. @map((id) -> -> @slave.main(new @etcd.Etcd(host, port), id))
			.. @waitforAll();
	}
}
