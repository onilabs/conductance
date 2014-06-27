@ = require(['sjs:std', './util']);
@etcd = require('./etcd');

var HEARTBEAT_INTERVAL = 1000 * 60 * 1; // 1 minute

var load = 0;

exports.main = function(client, id) {
	var info = -> @info.apply(null, ["[client##{id}]"].concat(arguments .. @toArray()));
	info("connecting...");
	client.set("slave/status/#{id}", 'online');
	client.set("slave/load/#{id}", load);
	try {
		waitfor {
			discoverNewRequests(client, info);
		} and {
			while(true) {
				hold(HEARTBEAT_INTERVAL);
				client.set("slave/status/#{id}", 'online');
				client.set("slave/load/#{id}", load);
			}
		}
	} finally {
		try {
			client.del("slave/status/#{id}");
		} catch(e) {
			@error("Couldn't mark slave as offline: #{e}");
		}
	}
};

function handleAppRequests(client, info, app) {
	info("watching app/op/#{app.id}");
	client
		.. @etcd.changes("app/op/#{app.id}")
		.. @filter(change -> change.action === 'set')
		.. @each
	{|change|
		info("saw app op:", change);
		switch(change.node.value) {
			case "stop":
				@info("stopping app #{app.id}");
				app.stop();
				break;
			default:
				throw new Error("Unknown app op:", change.node.value);
		}
	}
};

function runApp(id, block) {
	var stop = @Condition();
	var app = {
		id: id,
		stop: -> stop.set(),
	};
	waitfor {
		block(app)
		return "cancelled"; // XX does this ever happen?
	} or {
		stop.wait();
		return "stopped";
	}
}

function discoverNewRequests(client, info) {
	info("handling new requests");
	client
		.. @etcd.changes('app/job', {'recursive':true})
		.. @filter(change -> change.action === 'set')
		.. @each
	{|change|
		info("saw op:", change);
		change = change.node;
		hold(Math.random() * 10 * 1000); // between 1-10 seconds
		info("accepting op:", change);
		try {
			client.compareAndDelete(
				change .. @get('key'),
				change.value,
				{prevIndex: change .. @get('modifiedIndex')}
			);
		} catch(e) {
			if (![@etcd.err.KEY_NOT_FOUND, @etcd.err.TEST_FAILED] .. @hasElem(e.errorCode)) {
				throw e;
			}
			@info("op already processed...");
			continue;
		}
		var state = "error";
		var id = change.key .. @removeLeading("/app/job/");
		info("starting job for app #{id}...");
		
		// XXX make this waitable?
		spawn(function() {
			load += 1;
			try {
				// clear out any previous actions
				@etcd.tryOp(-> client.del("app/op/#{id}"));
				state = runApp(id) {|app|
					client.set("app/state/#{id}", "running");
					handleAppRequests(client, info, app);
				}
			} finally {
				@info("setting app state #{id} to #{state}");
				client.set("app/state/#{id}", state);
			}
		}());
	}
}

if (require.main === module) {
	exports.main(
		new @etcd.Etcd(),
		require('nodejs:os').hostname()
	);
}
