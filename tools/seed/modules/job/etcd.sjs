@ = require('mho:std');
var wraplib = require('sjs:wraplib');
var etcd = require('nodejs:node-etcd');
var HEARTBEAT_INTERVAL = 1000 * 60 * 1; // 1 minute

exports.Etcd = etcd;
wraplib.annotate(exports, {
	Etcd: {
		"this": wraplib.sync,
		prototype: {

			compareAndDelete :  [3, wraplib.handle_error_and_value],
			compareAndSwap   :  [4, wraplib.handle_error_and_value],
			create           :  [3, wraplib.handle_error_and_value],
			del              :  [2, wraplib.handle_error_and_value],
			'delete'         :  [2, wraplib.handle_error_and_value],
			get              :  [2, wraplib.handle_error_and_value],
			leader           :  [0, wraplib.handle_error_and_value],
			leaderStats      :  [0, wraplib.handle_error_and_value],
			machines         :  [0, wraplib.handle_error_and_value],
			mkdir            :  [2, wraplib.handle_error_and_value],
			post             :  [3, wraplib.handle_error_and_value],
			raw              :  [4, wraplib.handle_error_and_value],
			rmdir            :  [2, wraplib.handle_error_and_value],
			selfStats        :  [0, wraplib.handle_error_and_value],
			set              :  [3, wraplib.handle_error_and_value],
			testAndDelete    :  [3, wraplib.handle_error_and_value],
			testAndSet       :  [4, wraplib.handle_error_and_value],
			version          :  [0, wraplib.handle_error_and_value],
			watch            :  [2, wraplib.handle_error_and_value],
			watcher          :  [2, wraplib.handle_error_and_value],
			watchIndex       :  [3, wraplib.handle_error_and_value],

		}
	}
});

exports.changes = function(client, key, opts) {
	opts = opts ? @clone(opts) : {};
	var nextIndex = 0;
	if (opts .. @hasOwn('waitIndex')) {
		nextIndex = opts.waitIndex;
		delete opts.waitIndex;
	}
	var emitInitial = false;
	if (opts .. @hasOwn('initial')) {
		emitInitial = opts.initial;
		delete opts.initial;
	}
	return @Stream(function(_emit) {
		var emit = function(change) {
			if (change.node) {
				nextIndex = (change.node .. @get('modifiedIndex')) + 1;
			}
			_emit(change);
		};

		if (emitInitial) {
			//console.log("grabbing initial: " + key);
			var initial;
			var got = exports.tryOp(function() {
				initial = client.get(key, opts);
			}, [exports.err.KEY_NOT_FOUND]);
			if (got) {
				emit(initial)
			} else {
				emit({
					action: 'get',
					node: null,
				});
			}
		}

		while(true) {
			waitfor(var err, change) {
				//console.log("grabbing changes: " + key, opts, nextIndex);
				var req = client.watch(key, opts .. @merge({waitIndex: nextIndex}), resume);
			} retract {
				if (req) req.abort();
				req = null;
			}
			if(err) {
				if (err.errorCode === exports.err.EVENT_INDEX_CLEARED) {
					@warn("etcd.watch() called with a waitIndex that has already been cleared - resetting to 0");
					nextIndex = 0;
					continue
				}
				throw err;
			}

			emit(change);
		}
	});
} .. wraplib.mark_sync();

exports.values = function(client, key, opts) {
	return exports.changes.apply(null, arguments)
		//.. @filter(function(change) {
		//	if (change.action === 'set' || change.action === 'get' || change.action === 'create') return true;
		//	console.log("Skipping non-value change type: #{change.action}");
		//})
		.. @filter(change -> change.action === 'set' || change.action === 'get' || change.action === 'create')
		.. @transform(change -> change.node);
}

exports.tryOp = function(fn, allowed_errors) {
	if (!allowed_errors) allowed_errors = [exports.err.KEY_NOT_FOUND, exports.err.TEST_FAILED, exports.err.KEY_EXISTS];
	try {
		return fn() || true;
	} catch(e) {
		//console.log("errcode: #{e.errorCode}");
		if (allowed_errors.indexOf(e.errorCode) === -1) throw e;
		return false;
	}
}

exports.hasValue = function(client, key) {
	// returns false on no such key, or if key exists with a blank value
	var value;
	if (!exports.tryOp(function() {
		value = client.get(key).node.value;
	}, exports.err.KEY_NOT_FOUND)) return false;
	return value.length > 0;
}

exports.err = {
	KEY_NOT_FOUND: 100,
	TEST_FAILED: 101,
	KEY_EXISTS: 105,
	EVENT_INDEX_CLEARED: 401,
};

var keyFn = function(prefix) {
	return function(id) {
		@assert.ok(id !== undefined, "no ID given (key prefix #{prefix})");
		return id === null ? prefix : "#{prefix}#{id}";
	}
}

exports.slave_endpoint = keyFn("/slave/endpoint/");
exports.slave_load = keyFn("/slave/load/");
exports.app_job = keyFn("/app/job/");
exports.app_op = keyFn("/app/op/");
exports.app_endpoint = keyFn("/app/endpoint/");
exports.app_port_mappings = keyFn("/app/portmap/");
exports.master_app_repository = () -> "/master/app_repository";

exports.advertiseEndpoint = function(client, serverId, endpoint, block) {
	var deployLoopback = @env.get('deployLoopback', false);
	var key = exports.slave_endpoint(serverId);
	client.set(key, endpoint);
	try {
		waitfor {
			block();
		} or {
			exports.heartbeat(-> client.set(key, endpoint));
		}
	} finally {
		try {
			exports.tryOp(-> client.compareAndDelete(key, endpoint, {}));
		} catch(e) {
			if (!deployLoopback) {
				@error("Couldn't mark node as offline: #{e}");
			}
		}
	}
};

exports.heartbeat = function(beat) {
	while(true) {
		hold(HEARTBEAT_INTERVAL);
		beat();
	}
};

if (require.main === module) {
	require('sjs:wraplib/inspect').inspect(exports);
}
