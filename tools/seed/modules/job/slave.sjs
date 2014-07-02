@ = require(['sjs:std', '../util']);
@etcd = require('./etcd');
@os = require('nodejs:os');
@app = require('./app');
var { @User } = require('../auth/user');
var { @alphanumeric } = require('../validate');

var HEARTBEAT_INTERVAL = 1000 * 60 * 1; // 1 minute

var load = 0;


exports.main = function(client, serverId, serverRoot, singleton) {
	var info = -> @info.apply(null, ["[client##{serverId}]"].concat(arguments .. @toArray()));
	var endpoint_url = serverRoot + "app.api";
	info("connecting...");
	client.set(@etcd.slave_endpoint(serverId), endpoint_url);

	if(singleton) { // only one slave per host should be set to singleton
		@app.localAppState.runningApps .. @each {|[id, app]|
			info("adopting already-running app: #{id}");
			spawn(appRunLoop(client, serverId, info, app, id, true));
		}
	}

	client.set(@etcd.slave_load(serverId), load);
	try {
		waitfor {
			discoverNewRequests(client, serverId, info);
		} and {
			while(true) {
				hold(HEARTBEAT_INTERVAL);
				client.set(@etcd.slave_endpoint(serverId), endpoint_url);
				client.set(@etcd.slave_load(serverId), load);
			}
		}
	} finally {
		try {
			client.del(@etcd.slave_endpoint(serverId));
		} catch(e) {
			if (!@env.get('deployLoopback', false)) {
				@error("Couldn't mark slave as offline: #{e}");
			}
		}
	}
};


function appRunLoop(client, serverId, info, app, id, alreadyRunning) {
	var endpointKey = @etcd.app_endpoint(id);
	try {
		client.set(endpointKey, serverId);
		load += 1;
		waitfor {
			if (!alreadyRunning) {
				app.stop();
				info("running app #{id}");
				app.start(true);
			}
			app.wait();
		} or {
			info("watching app ops: #{@etcd.app_op(id)}");
			client
				.. @etcd.values(@etcd.app_op(id) +"/", {recursive:true})
				.. @each
			{|node|
				try {
					info("saw app op:", node.value);
					switch(node.value) {
						case "stop":
							info("stopping app #{id}");
							app.stop();
							@etcd.tryOp(-> client.compareAndDelete(endpointKey, serverId, {}));
							break;
						case "start":
							info("ignoring duplicate [start] request");
							break;
						default:
							throw new Error("Unknown app op:", node.value);
					}
				} finally {
					info("deleting app op:", node.value);
					client.del(node.key, {});
				}
			}
		}
	} catch(e) {
		@error(String(e));
	} finally {
		info("app #{id} ended");
		app.stop();
		@etcd.tryOp(-> client.compareAndDelete(endpointKey, serverId, {}));
		load-=1;
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
		
		// clear out any previous actions
		var existingOps;
		try {
			existingOps = client.get(@etcd.app_op(id), {recursive:true}).node.nodes;
		} catch(e) {
			if (e.errorCode !== @etcd.err.KEY_NOT_FOUND) {
				throw e;
			}
		}
		;(existingOps || []) .. @each {|existing|
			if (existing .. @get('createdIndex') < node .. @get('createdIndex')) {
				info("deleting previous op for app #{id}: #{existing.value}");
				client.del(existing.key);
			}
		};

		info("starting job for app #{id}");
		var [userId, appId] = id.split('/');
		var user = new @User(userId, "(slave)");
		var app = @app.localAppState(user, appId);
		// XXX make this waitable?
		spawn(appRunLoop(client, serverId, info, app, id, false));
	}
}
