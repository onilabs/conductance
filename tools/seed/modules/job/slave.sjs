@ = require(['mho:std', '../util']);
@etcd = require('./etcd');
@os = require('nodejs:os');
@app = require('./app');
var { @User } = require('../auth/user');

exports.main = function(client, serverId, singleton) {
	var info = -> @info.apply(null, ["[client##{serverId}]"].concat(arguments .. @toArray()));
	var load = 0;
	var loadChanged = @Emitter();
	loadChanged.emit(load);
	var withLoad = function(block) {
		load += 1;
		loadChanged.emit(load);
		try {
			return block();
		} finally {
			load -= 1;
			loadChanged.emit(load);
		}
	};
	withLoad.currentValue = -> load;

	var heartbeat = function() {
		info("load: #{load}");
		client.set(@etcd.slave_load(serverId), load);
	};

	info("connecting...");
	var endpoint_url = @env.get('publicAddress')('slave') + "app.api";
	function runServer() {
		var endpointKey = @etcd.app_endpoint(null);
		var owned = @etcd.tryOp(-> client.get(endpointKey, {recursive:true}));
		if (owned) {
			owned = owned
				.. @getPath('node.nodes')
				.. @transform(n -> n.nodes || [])
				.. @concat
				.. @filter(node -> node.value === serverId)
				.. @map(node -> node.key .. @removeLeading(endpointKey))
				.. @toArray();
		} else {
			owned = [];
		}

		info("Slave owns #{owned.length} apps in etcd. Checking for running apps...");
		@app.localAppState.runningApps .. @each {|[id, app]|
			if (singleton || owned .. @hasElem(id)) {
				info("adopting already-running app: #{id}");
				owned .. @remove(id);
				spawn(appRunLoop(client, serverId, info, app, id, withLoad, true));
			} else {
				@warn(`slave ${serverId} ignoring running app $id (owned by another slave, and singleton is false)`);
			}
		}

		if (owned.length > 0) info("Dropping #{owned.length} dead apps...");
		owned .. @each {|id|
			info("Dropping endpoint key for dead app #{id}");
			var deleted = @etcd.tryOp(-> client.compareAndDelete(@etcd.app_endpoint(id), serverId, {}));
			if (!deleted) {
				@warn("Couldn't delete!");
			}
		}

		heartbeat();
		waitfor {
			discoverNewRequests(client, serverId, info, withLoad);
		} and {
			@etcd.heartbeat(heartbeat);
		} and {
			while(true) {
				// each time the load changes, clean up old docker containers.
				// We add a short delay to not bother running this every
				// single time something changes
				@app.cleanupDeadContainers();
				loadChanged .. @each {||
					hold(1000 * 60 * 5);
					//hold(1000 * 5);
					@app.cleanupDeadContainers();
				}
			}
		}
	};

	client .. @etcd.advertiseEndpoint(serverId, endpoint_url) {||
		var suffix = singleton ? "" : ".#{serverId}";
		var monitoring = require('seed:monitoring');
		var loadKey = "load#{suffix}";
		monitoring.withMetric("user.slave", @combine(
			loadChanged .. @transform(val -> [[loadKey, val]]),
			monitoring.sample(function() {
				var containers = @childProcess.run('docker', ['ps','-qa'],{stdio:['ignore','pipe',2]}).stdout.split("\n") .. @filter() .. @count();
				return [ [loadKey, load], ['docker_containers', containers ]];
			})
		), runServer);
	}
};

var { ping:@pingAppOwner } = require('./master');

function appRunLoop(client, serverId, info, app, id, withLoad, alreadyRunning) {
	var endpointKey = @etcd.app_endpoint(id);
	var portMappingKey = @etcd.app_port_mappings(id);
	var portMappingValue = null;
	withLoad {||
		try {
			// XXX this would be much simpler (we cound just try multiple `prevValue` ops)
			// if not for https://github.com/coreos/etcd/issues/1619
			var mightBeRunning = false;
			while(true) {
				var currentEndpoint = null;
				@etcd.tryOp( -> currentEndpoint = client.get(endpointKey).node, [@etcd.err.KEY_NOT_FOUND]);
				@debug("Current endpoint for #{id} =",currentEndpoint);
				var currentEndpointValue = currentEndpoint == null ? null : currentEndpoint .. @get('value');
				if (!([null, "", serverId] .. @hasElem(currentEndpointValue))) {
					// app is running elsewhere. Ping it, and only take over if it doesn't respond
					@info("App is already running on another node: #{currentEndpointValue}");
					if (client .. @pingAppOwner(id)) {
						@warn("App #{id} is already running on #{currentEndpoint}");
						return;
					}
					@warn("App owner for #{id} did not respond to ping - forcibly taking over");
				}
				var setOpts = currentEndpoint
					? {prevIndex:currentEndpoint .. @get('modifiedIndex')}
					: {prevExist:false};
				if(@etcd.tryOp(
					-> client.set(endpointKey, serverId, setOpts),
					[@etcd.err.TEST_FAILED]
				)) {
					// success, we own the key now
					mightBeRunning = currentEndpointValue == serverId;
					break;
				} else {
					@info("Race condition when claiming app endpoint; retrying...");
				}
			}
			
			// if this node was not already running the app, clear the logs so user doesn't
			// see a flash of logs from some way-old run
			if(!(alreadyRunning || mightBeRunning)) app.clearLogs();

			waitfor {
				if (!alreadyRunning) {
					if (mightBeRunning) {
						app.start(false);
					} else {
						app.stop();
						info("running app #{id}");
						app.start(true);
					}
				}
				var portBindings = app.getPortBindings();
				var subdomain = app.subdomain();
				portMappingValue = "#{subdomain}:#{@env.get('internalAddress')},#{portBindings.join(",")}";
				@info("setting port bindings:", portMappingValue);
				client.set(portMappingKey, portMappingValue);
				app.wait();
				
				// app ended:
				collapse;
				info("app #{id} ended");
				app.stop();
				waitfor {
					@etcd.tryOp(-> client.compareAndDelete(endpointKey, serverId, {}));
				} and {
					if (portMappingValue !== null) {
						@etcd.tryOp(-> client.compareAndDelete(portMappingKey, portMappingValue, {}));
					}
				}
			} or {
				info("watching app ops: #{@etcd.app_op(id)}");
				client
					.. @etcd.values(@etcd.app_op(id) +"/", {recursive:true})
					.. @each
				{|node|
					try {
						info("saw app op:", node.key, node.value);
						switch(node.value) {
							case "stop":
								info("stopping app #{id}");
								app.stop();
								hold();
								// the other branch will collapse this one
								// when the app actually terminates
								break;
							case "start":
								info("ignoring duplicate [start] request");
								break;
							case "ping":
								// noop, used on duplicate `start` requests to check that the
								// owning node is still up
								break;
							default:
								info("Unknown app op:", node.value);
								break;
						}
					} finally {
						info("deleting app op:", node.key, node.value);
						@etcd.tryOp(
							-> client.del(node.key, {prevIndex: node .. @get('modifiedIndex')}),
							[@etcd.err.TEST_FAILED]);
					}
				}
			}
		} catch(e) {
			@error("Error in appRunLoop:" + String(e));
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
		@info("saw new op:", node.value);
		hold(withLoad.currentValue() * 200); // 0.2s per load
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
