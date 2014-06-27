@ = require(['sjs:std', './util']);
@etcd = require('./etcd');

exports.monitorClusterChanges = function(client) {
	var info = -> @info.apply(null, ["[monitor]"].concat(arguments .. @toArray()));
	while(true) {
		info("watching for slaves...");
		client .. @etcd.changes('slave/state', {recursive:true}) .. @each {|change|
			info("saw change: " + change.node.key + "=" + change.node.value);
		}
	}
};

exports.op = function(client, op, id) {
	var prefix = "app/#{op === 'start'?'job':'op'}/";
	@info("performing action [#{op}] on [#{prefix}#{id}]");
	var created = client.set(prefix + id, op).node;
	@info("submitted op #{op}", created);
	var change = client.watch(created .. @get('key'), {waitIndex: created .. @get('modifiedIndex') + 1});
	@info("op accepted! #{id}!#{op}");
}

exports.balanceJobs = function(client) {
	@info("balancing jobs");
	var servers = client.get('/slave/status', {'recursive':true})
		.. @getPath('node.nodes')
		.. @filter(obj -> obj .. @get('value'))
		.. @map(obj -> obj .. @get('key') .. @removeLeading('/slave/status/'));
	//@info("Running servers: ", servers);
	var loads = client.get('/slave/load', {'recursive':true})
		.. @getPath('node.nodes')
		.. @filter(obj -> servers .. @hasElem(obj .. @get('key') .. @removeLeading('/slave/load/')))
		.. @map(function(node) { node.value = parseInt(node.value, 10); return node;})
		.. @toArray();

	@info("got (active) loads:", loads .. @map(l -> l.value));
	if (loads.length == 0) return;

	var avg = (loads .. @reduce(0, (sum, val) -> sum + parseInt(val.value))) / loads.length;
	@info("Average load: " + avg);
	loads .. @each {|load|
		if (load .. @get('value') > avg*2) {
			@error("server #{load.key} is more than 2* average load!");
		}
	}
};

exports.main = function(client, opts) {
	var balanceTime = (opts .. @get('balanceTime')) * 1000;
	waitfor {
		exports.monitorClusterChanges(client);
	} or {
		while(true) {
			hold(balanceTime);
			exports.balanceJobs(client);
		}
	}
};

if (require.main === module) {
	exports.main(
		new @etcd.Etcd(),
		{
			balanceTime: 60 * 10,
		}
	);
}
