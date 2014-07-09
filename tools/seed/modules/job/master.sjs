@ = require(['mho:std', '../util']);
@etcd = require('./etcd');
@os = require('nodejs:os');

exports.monitorClusterChanges = function(client) {
	var info = -> @info.apply(null, ["[monitor]"].concat(arguments .. @toArray()));
	while(true) {
		info("watching for slaves...");
		client .. @etcd.changes(@etcd.slave_endpoint(null), {recursive:true}) .. @each {|change|
			info("saw change: " + change.node.key + "=" + change.node.value);
		}
	}
};

var op = function(client, op, id) {
	@info("performing action [#{op}] on [#{id}]");
	var created;
	if (op === 'start') {
		created = client.set(@etcd.app_job(id), op).node;
	} else {
		var hasEndpoint = client .. @etcd.hasValue(@etcd.app_endpoint(id));
		if (!hasEndpoint) {
			@info("skipping `#{op}` request - there is no endpoint");
			return false;
		}
		@info("sending #{op} op to endpoint", client.get(@etcd.app_endpoint(id)));
		created = client.create(@etcd.app_op(id), op).node;
	}
	@info("submitted op #{op}", created);
	var change = client.watch(created .. @get('key'), {waitIndex: created .. @get('modifiedIndex') + 1});
	@info("op accepted! #{id}!#{op}");
	return true;
}

exports.start = (client, id) -> op(client, 'start', id);
exports.stop = (client, id) -> op(client, 'stop', id);
exports.sync_code = (client, id) -> op(client, 'sync_code', id);

exports.balanceJobs = function(client) {
	@info("balancing jobs");
	var prefix = @etcd.slave_endpoint(null);
	var servers = client.get(prefix, {'recursive':true})
		.. @getPath('node.nodes')
		.. @filter(obj -> obj .. @get('value'))
		.. @map(obj -> obj .. @get('key') .. @removeLeading(prefix));
	@info("Running servers: ", servers);

	prefix = @etcd.slave_load(null);
	var loads = client.get(prefix, {'recursive':true})
		.. @getPath('node.nodes')
		.. @filter(obj -> servers .. @hasElem(obj .. @get('key') .. @removeLeading(prefix)))
		.. @map(function(node) { node.value = parseInt(node.value, 10); return node;})
		.. @toArray();

	@info("got (active) loads:", loads .. @map(l -> l.value));
	if (loads.length == 0) return;

	var avg = (loads .. @reduce(0, (sum, val) -> sum + parseInt(val.value))) / loads.length;
	@info("Average load: " + avg);
	loads .. @each {|load|
		if (load .. @get('value') > avg*2) {
			@error("server #{load.key} is more than 2* average load!");
			// XXX actually do some balancing!
		}
	}
};

exports.main = function(client, opts) {
	var appRoot = require('./app').getAppRoot();
	var appRepository = "#{@env.get('internalAddress')}:#{appRoot}";
	client.set(@etcd.master_app_repository(), appRepository);
	client .. @etcd.advertiseEndpoint('master', @env.get('publicAddress')('master')) {||
		try {
			var balanceTime = (opts .. @get('balanceTime')) * 1000;
			waitfor {
				exports.monitorClusterChanges(client);
			} or {
				while(true) {
					hold(balanceTime);
					exports.balanceJobs(client);
				}
			}
		} finally {
			@etcd.tryOp(-> client.compareAndDelete(@etcd.master_app_repository(), appRepository));
		}
	}
};