@ = require(['sjs:object', 'sjs:sequence', {id:'sjs:assert',name:'assert'}]);
var { @warn } = require('sjs:logging');
var wraplib = require('sjs:wraplib');
var etcd = require('nodejs:node-etcd');

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
			nextIndex = (change.node .. @get('modifiedIndex')) + 1;
			_emit(change);
		};

		if (emitInitial) {
			//console.log("grabbing initial: " + key);
			var initial = client.get(key, opts);
			emit(initial)
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
		.. @filter(change -> change.action === 'set' || change.action === 'get')
		.. @transform(change -> change.node);
}

exports.tryOp = function(fn, allowed_errors) {
	if (!allowed_errors) allowed_errors = [exports.err.KEY_NOT_FOUND, exports.err.TEST_FAILED, exports.err.KEY_EXISTS];
	try {
		fn();
	} catch(e) {
		//console.log("errcode: #{e.errorCode}");
		if (allowed_errors.indexOf(e.errorCode) === -1) throw e;
		return false;
	}
	return true;
}

exports.err = {
	KEY_NOT_FOUND: 100,
	TEST_FAILED: 101,
	KEY_EXISTS: 105,
	EVENT_INDEX_CLEARED: 401,
};

var keyFn = function(prefix) {
	return function(id) {
		@assert.ok(id !== undefined);
		return id === null ? prefix : "#{prefix}#{id}";
	}
}

exports.slave_endpoint = keyFn("/slave/endpoint/");
exports.slave_load = keyFn("/slave/load/");
exports.app_job = keyFn("/app/job/");
exports.app_op = keyFn("/app/op/");
exports.app_endpoint = keyFn("/app/endpoint/");

if (require.main === module) {
	require('sjs:wraplib/inspect').inspect(exports);
}
