@ = require('mho:std');
var wraplib = require('sjs:wraplib');
var etcd = require('nodejs:node-etcd');
var HEARTBEAT_INTERVAL = 1000 * 60 * 1; // 1 minute

// like handle_error_and_value, except it annotates the error / value with
// the (optional) third `headers` value.
var handle_etcd_result = function(_fn, resume) {
	return function(err, value, headers) {
		if(headers) {
			// attach to either err or result:
			(err || value).headers = headers;
		}
		resume(err, value);
	}
};

exports.Etcd = etcd;
wraplib.annotate(exports, {
	Etcd: {
		"this": wraplib.sync,
		prototype: {

			compareAndDelete :  [3, handle_etcd_result],
			compareAndSwap   :  [4, handle_etcd_result],
			create           :  [3, handle_etcd_result],
			del              :  [2, handle_etcd_result],
			'delete'         :  [2, handle_etcd_result],
			get              :  [2, handle_etcd_result],
			leader           :  [0, handle_etcd_result],
			leaderStats      :  [0, handle_etcd_result],
			machines         :  [0, handle_etcd_result],
			mkdir            :  [2, handle_etcd_result],
			post             :  [3, handle_etcd_result],
			raw              :  [4, handle_etcd_result],
			rmdir            :  [2, handle_etcd_result],
			selfStats        :  [0, handle_etcd_result],
			set              :  [3, handle_etcd_result],
			testAndDelete    :  [3, handle_etcd_result],
			testAndSet       :  [4, handle_etcd_result],
			version          :  [0, handle_etcd_result],
			watch            :  [2, handle_etcd_result],
			watcher          :  [2, handle_etcd_result],
			watchIndex       :  [3, handle_etcd_result],

		}
	}
});

exports.changes = function(client, key, opts) {
	opts = opts ? @clone(opts) : {};
	var nextIndex = null;
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
		__js var updateIndex = function(node) {
			var n = (node .. @get('modifiedIndex')) + 1;
			if (n > nextIndex) nextIndex = n;
		};

		var emit = function(change) {
			if (change.node) updateIndex(change.node);
			// use null for blank / deleted node, not undefined
			if (change.node === undefined) change.node = null;
			_emit(change);
		};

		var BLANK = {
			action: 'get',
			node: null,
		};

		//@debug("grabbing initial: " + key);
		var initial = null;
		var initialHeaders = null;
		try {
			initial = client.get(key, opts);
			initialHeaders = initial.headers;
		} catch(e) {
			if(e.errorCode !== exports.err.KEY_NOT_FOUND) {
				throw e;
			}
			initialHeaders = e.headers;
		}

		if(nextIndex === null) {
			nextIndex = (initialHeaders .. @get('x-etcd-index') .. parseInt(10)) + 1;
			@debug("Initial index: ", nextIndex);
		}

		if (emitInitial) {
			emit(initial || BLANK);
		}

		while(true) {
			waitfor(var err, change, headers) {
				//@debug("grabbing changes: " + key, opts, nextIndex);
				var req = client.watch(key, opts .. @merge({waitIndex: nextIndex}), resume);
			} retract {
				@info("client.watch retracted");
				if (req) req.abort();
				req = null;
			}
			if(err) {
				if (err.errorCode === exports.err.EVENT_INDEX_CLEARED) {
					@warn("etcd.watch() called with a waitIndex that has already been cleared - resetting to 0");
					nextIndex = 0;
					continue
				}
				if(err.errors) {
					// multiple errors, set by etcd's _multiserverHelper
					err.message += err.errors .. @map(e -> '\n - ' + e.httperror) .. @join();
					
					// When etcd times out and we're using https, it fails with an ugly SSL protocol error.
					// see https://github.com/coreos/etcd/issues/1607
					if(err.errors .. @all(e -> e.httperror .. String() .. @contains('decryption failed or bad record mac'))) {
						@verbose("Assuming error is due to timeout: " + err.message);
						continue;
					}
				}
				throw err;
			}
			if(!change && headers['x-etcd-index']) {
				// etcd responded successfully, but the body was empty
				// Most likely a timeout, so just continue
				// (see https://github.com/stianeikeland/node-etcd/issues/32)
				continue;
			}

			emit(change);
		}
	});
} .. wraplib.mark_sync();

exports.values = function(client, key, opts) {
	return exports.changes.apply(null, arguments)
		//.. @monitor(function(change) {
		//	@warn("saw change type #{change.action} on etcd key #{key}");
		//})
		.. @filter(change -> !['watch'] .. @hasElem(change.action))
		.. @transform(change -> change.node);
}

exports.tryOp = function(fn, allowed_errors) {
	if (allowed_errors) {
		@assert.arrayOfNumber(allowed_errors, "allowed_errors");
	} else {
		allowed_errors = [exports.err.KEY_NOT_FOUND, exports.err.TEST_FAILED, exports.err.KEY_EXISTS];
	}
	try {
		return fn() || true;
	} catch(e) {
		//@debug("errcode: #{e.errorCode}");
		if (allowed_errors.indexOf(e.errorCode) === -1) throw e;
		return false;
	}
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
		if(id == null) {
			return prefix;
		}
		var args = arguments .. @toArray;
		@assert.arrayOfString(args);
		return "#{prefix}#{args .. @join('/')}";
	}
}

var endpoint_root = "/endpoint/";
exports.endpoint = keyFn("/endpoint/");
exports.slave_endpoint = keyFn("/endpoint/slave/");
exports.master_endpoint = exports.endpoint('master');
exports.slave_load = keyFn("/slave/load/");
exports.app_job = keyFn("/app/job/");
exports.app_op = keyFn("/app/op/");
exports.app_endpoint = keyFn("/app/endpoint/");
exports.app_port_mappings = keyFn("/app/portmap/");
exports.master_app_repository = () -> "/master/app_repository";

exports.advertiseEndpoint = function(client, key, endpoint, block) {
	@assert.ok(key .. @startsWith(endpoint_root), "invalid endpoint: key #{key}");
	var refresh = -> client.set(key, endpoint, {ttl:Math.round(HEARTBEAT_INTERVAL * 2.5 / 1000)})
	client.set(key, ''); // set a blank endpoint on start, so that anyone waiting for a change will definitely reconnect
	refresh();
	try {
		waitfor {
			block();
		} or {
			exports.heartbeat(refresh);
		}
	} finally {
		try {
			exports.tryOp(-> client.compareAndDelete(key, endpoint, {}));
		} catch(e) {
			@error("Couldn't mark node as offline: #{e}");
		}
	}
};

exports.heartbeat = function(beat) {
	while(true) {
		hold(HEARTBEAT_INTERVAL);
		beat();
	}
};

// throw an etcd-compatible error
exports.Error = function(code) {
	var e = new Error("Etcd error (#{code})");
	e.errorCode = code;
	return e;
}

if (require.main === module) {
	require('sjs:wraplib/inspect').inspect(exports);
}
