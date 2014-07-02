@ = require(['sjs:std', '../util']);
@etcd = require('./etcd');
@os = require('nodejs:os');
@app = require('./app');
var { @User } = require('../auth/user');
var { @alphanumeric } = require('../validate');

var HEARTBEAT_INTERVAL = 1000 * 60 * 1; // 1 minute

var load = 0;


exports.main = function(client, id, server_root) {
	var info = -> @info.apply(null, ["[client##{id}]"].concat(arguments .. @toArray()));
	var endpoint_url = server_root + "app.api";
	info("connecting...");
	client.set(@etcd.slave_endpoint(id), endpoint_url);
	client.set(@etcd.slave_load(id), load);
	try {
		waitfor {
			discoverNewRequests(client, id, info);
		} and {
			while(true) {
				hold(HEARTBEAT_INTERVAL);
				client.set(@etcd.slave_endpoint(id), endpoint_url);
				client.set(@etcd.slave_load(id), load);
			}
		}
	} finally {
		try {
			client.del(@etcd.slave_endpoint(id));
		} catch(e) {
			@error("Couldn't mark slave as offline: #{e}");
		}
	}
};


function runApp(id, block) {
	waitfor {
		app.start();
	} or {
		stop.wait();
		return "stopped";
	}
}

function discoverNewRequests(client, serverId, info) {
	info("handling new requests");
	var prefix = @etcd.app_job(null);
	client
		.. @etcd.values(prefix, {'recursive':true})
		.. @each
	{|node|
		@debug("saw op:", node.value);
		hold(load * 1000); // 1s per load
		@debug("accepting op:", node.value);
		var key = node .. @get('key');
		var del = -> client.compareAndDelete(key, node .. @get('value'), {prevIndex: node .. @get('modifiedIndex')});
		if (!@etcd.tryOp(del)) {
			@debug("op already processed");
			continue;
		}
		var id = key .. @removeLeading(prefix);
		info("starting job for app #{id}");
		
		// XXX make this waitable?
		spawn(function() {
			var endpointKey = @etcd.app_endpoint(id);
			client.set(endpointKey, serverId);
			load += 1;
			try {
				// clear out any previous actions
				@etcd.tryOp(-> client.del("app/op/#{id}"));
				var [userId, appId] = id.split('/');
				var user = new @User(userId, "(slave)");
				var app = @app.localAppState(user, appId);
				waitfor {
					app.start();
					app.wait();
				} or {
					info("watching app ops for #{id}");
					client
						.. @etcd.values(@etcd.app_op(id))
						.. @each
					{|node|
						info("saw app op:", node.value);
						switch(node.value) {
							case "stop":
								@info("stopping app #{app.id}");
								app.stop();
								break;
							case "start":
								info("ignoring duplicate [start] request");
								break;
							default:
								throw new Error("Unknown app op:", node.value);
						}
					}
				}
			} finally {
				info("app ended");
				app.stop();
				@etcd.tryOp(-> client.compareAndDelete(endpointKey, serverId, {}));
				load-=1;
			}
		}());
	}
}
