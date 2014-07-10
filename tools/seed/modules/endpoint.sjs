@ = require('mho:std');
@bridge = require('mho:rpc/bridge');

function pool(opts) {
	var items = [];
	var eq = opts .. @get('eq');
	var access = opts .. @get('access');
	return function(obj, block) {
		var existing = items .. @find(x -> eq(obj, x), null);
		if (existing == null) {
			items.push(obj);
			existing = obj;
		}

		if (!existing._ctx) {
			existing._ctx = @Condition();
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

				ctx = @breaking {|brk|
					access(existing, brk);
				}
				existing._ctx.set(ctx);
			} else {
				ctx = existing._ctx.wait();
			}
			got_ctx = true;

			return block(ctx.value);

		} finally {
			--existing._refs;
			if (existing._refs === 0) {
				// last one out
				existing._ctx.clear();
				if (got_ctx) {
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
	access: function(endpoint, block) {
		endpoint._connect(block);
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

EndpointProto.connect = function(block) {
	return endpointPool(this, block);
};

EndpointProto._connect = function(block) {
	@bridge.connect(this.server, {}) { |conn|
		block(conn.api);
	}
}

EndpointProto.relative = function(url) {
	return exports.Endpoint(@url.normalize(url, this.server));
};

EndpointProto .. @bridge.setMarshallingDescriptor({
	wrapLocal: (x) -> x._props,
	wrapRemote: ['seed:endpoint', 'unmarshallEndpoint'],
});

exports.unmarshallEndpoint = function(args) {
	return exports.Endpoint.apply(null, args);
};

