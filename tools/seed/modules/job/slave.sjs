@ = require(['mho:std', '../util']);
@etcd = require('./etcd');
@os = require('nodejs:os');
@app = require('./app');
var { @User } = require('../auth/user');
var { @alphanumeric } = require('../validate');

exports.main = function(client, serverId, singleton) {
	var info = -> @info.apply(null, ["[client##{serverId}]"].concat(arguments .. @toArray()));
	var load = 0;
	var withLoad = function(block) {
		load += 1;
		try {
			return block();
		} finally {
			load -= 1;
		}
	};
	withLoad.currentValue = -> load;

	var heartbeat = function() {
		@info("load for #{serverId} = #{load}");
		client.set(@etcd.slave_load(serverId), load);
	};

	info("connecting...");
	var endpoint_url = @env.get('publicAddress')('slave') + "app.api";
	client .. @etcd.advertiseEndpoint(serverId, endpoint_url) {||
		if(singleton) { // only one slave per host should be set to singleton
			@app.localAppState.runningApps .. @each {|[id, app]|
				info("adopting already-running app: #{id}");
				spawn(appRunLoop(client, serverId, info, app, id, withLoad, true));
			}
		}
		heartbeat();
		waitfor {
			discoverNewRequests(client, serverId, info, withLoad);
		} and {
			@etcd.heartbeat(heartbeat);
		}
	}
};


function appRunLoop(client, serverId, info, app, id, withLoad, alreadyRunning) {
	var endpointKey = @etcd.app_endpoint(id);
	var portMappingKey = @etcd.app_port_mappings(id);
	var portMappingValue = null;
	withLoad {||
		try {
			client.set(endpointKey, serverId);
			waitfor {
				if (!alreadyRunning) {
					app.stop();
					info("running app #{id}");
					app.start(true);
				}
				var portBindings = app.getPortBindings();
				@info("got port bindings:", app.getPortBindings());
				portMappingValue = "#{@env.get('publicHost')},#{portBindings.join(",")}";
				client.set(portMappingKey, portMappingValue);
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
			waitfor {
				@etcd.tryOp(-> client.compareAndDelete(endpointKey, serverId, {}));
			} and {
				if (portMappingValue !== null) {
					@etcd.tryOp(-> client.compareAndDelete(portMappingKey, portMappingValue, {}));
				}
			}
		}
	}
}

function discoverNewRequests(client, serverId, info, withLoad) {
	info("handling new requests");
	var prefix = @etcd.app_job(null);
	client
		.. @etcd.values(prefix, {'recursive':true})
		.. @each
	{|node|
		@debug("saw op:", node.value);
		hold(withLoad.currentValue() * 500); // 0.5s per load
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
		spawn(appRunLoop(client, serverId, info, app, id, withLoad, false));
	}
}
