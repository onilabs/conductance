/** @nodoc */
@ = require('mho:std');
@bridge = require('mho:rpc/bridge');

function pool(opts) {
	var items = [];
	var eq = opts .. @get('eq');
	var access = opts .. @get('access');
	return function(obj, opts, block) {
		opts = opts || {};
		var existing = items .. @find(x -> eq(obj, x), null);
		if (existing == null) {
			items.push(obj);
			existing = obj;
		}

		if (!existing._ctx) {
			existing._ctx = @Condition();
			existing._connectionError = @Condition();
		}

		if (!existing .. @hasOwn('_refs')) {
			existing._refs = 0;
		}
		existing._refs++;

		var ctx, got_ctx = false;
		try {
			if (existing._refs === 1) {
				// first one in
				existing._ctx.clear();
				existing._connectionError.clear();

				ctx = @breaking {|brk|
					access(existing, opts, brk);
				}
				existing._ctx.set(ctx);
			} else {
				ctx = existing._ctx.wait();
			}
			got_ctx = true;

			waitfor {
				return block(ctx.value);
			} or {
				throw existing._connectionError.wait();
			}
		} finally {
			--existing._refs;
			if (existing._refs === 0) {
				// last one out
				existing._ctx.clear();
				if (got_ctx) {
					// NOTE: we don't bother to send ctx._connectionError here,
					// because that would just throw the error (which we're already doing)
					ctx.resume();
				}
			}

			if (existing._refs === 0) {
				// after cleanup, there's still nobody using this resource
				var idx = items.indexOf(existing);
				@assert.ok(idx >= 0);
				items.splice(idx, 1);
			}
		}
	};
};

var endpointPool = pool({
	eq: (a,b) -> a.eq(b),
	access: function(endpoint, opts, block) {
		var fromBlock = false;
		try {
			endpoint._connect(opts) {|api|
				try {
					return block(api);
				} catch (e) {
					fromBlock = true;
					// errors thrown from the block should be thrown, but should
					// not trigger _connectionError
					throw e;
				}
			}
		} catch(e) {
			if (!fromBlock) {
				// this will throw the error from all current uses
				// of this connection, not just the initial one
				endpoint._connectionError.set(e);
			}
			throw e;
		}
	},
});

// an endpoint is a bridge-transferrable, poolable
// API connection
var EndpointProto = {};
EndpointProto._init = function(server) {
	@assert.string(server, "server");
	this.server = server;
	this._props = arguments .. @toArray();
};

exports.Endpoint = @Constructor(EndpointProto);

EndpointProto.toString = function() {
	return ("[Endpoint (" + this.server + ")]");
}

EndpointProto.eq = function(other) {
	return @eq(this._props, other._props);
}

EndpointProto.connect = function(opts, block) {
	if (arguments.length == 1) {
		block = opts;
		opts = {};
	}
	return endpointPool(this, opts, block);
};

EndpointProto._connect = function(opts, block) {
	@bridge.connect(this.server, opts) { |conn|
		block(conn.api);
	}
}

EndpointProto.relative = function(url) {
	return exports.Endpoint(@url.normalize(url, this.server));
};

EndpointProto .. @bridge.setMarshallingDescriptor({
	wrapLocal: (x) -> x._props,
	wrapRemote: ['mho:server/seed/endpoint', 'unmarshallEndpoint'],
});

exports.unmarshallEndpoint = function(args) {
	return exports.Endpoint.apply(null, args);
};

