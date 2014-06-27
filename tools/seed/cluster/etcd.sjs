@ = require(['sjs:object', 'sjs:sequence']);
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
	opts = opts || {};
	var nextIndex = 0;
	return @Stream(function(emit) {
		while(true) {
			waitfor(var err, change) {
				var req = client.watch(key, opts .. @merge({waitIndex: nextIndex}), resume);
			} retract {
				if (req) req.abort();
				req = null;
			}
			if(err) throw err;

			nextIndex = (change.node .. @get('modifiedIndex')) + 1;
			emit(change);
		}
	});
} .. wraplib.mark_sync();

exports.tryOp = function(fn, allowed_errors) {
	if (!allowed_errors) allowed_errors = [exports.err.KEY_NOT_FOUND, exports.err.TEST_FAILED];
	try {
		fn();
	} catch(e) {
		if (allowed_errors.indexOf(e.errorCode) === -1) throw e;
		return false;
	}
	return true;
}

exports.err = {
	KEY_NOT_FOUND: 100,
	TEST_FAILED: 101,
};

if (require.main === module) {
	require('sjs:wraplib/inspect').inspect(exports);
}
