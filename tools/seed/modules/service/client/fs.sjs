@ = require('mho:std');
@bridge = require('mho:rpc/bridge');
@https = require('nodejs:https');

if (require.main === module) {
	@env.set('host-fs', 'localhost');
	@env.set('seed-service-config', {
		fs: require('../init/fs').init({ enable: true}, "example/app1"),
	});
}

var { @openTransport } = require('mho:rpc/aat-client');
var common = require('./common');
var connectedCtx = @Condition(null);
var activeCalls = 0;
var killer = null;
var stopKiller = function() {
	if(!killer) return;
	var k = killer;
	killer = null;
	k.abort();
}

var withApi = function(block) {
	activeCalls++;
	stopKiller();

	try {
		if(activeCalls === 1) {
			if(killer) {
				// rescue
				stopKiller();
			} else {
				// connect, using internal CA for https
				var conf = common.getConfig('fs');
				var agent = new @https.Agent(@https.globalAgent.options .. @merge({
					ca: conf .. @get('ca'),
				}));

				//@info("conf: ", conf);
				var apiinfo = @bridge.resolve(conf .. @get('server'), {agent: agent});
				//@info("apiinfo: ", apiinfo);
				var ctx = @breaking {|brk|
					@bridge.connect(apiinfo, {
						transport: @openTransport(apiinfo.server, {agent:agent}),
					}) {|connection|
						brk(connection.api.authenticate(conf .. @get('token')));
					}
				}
				connectedCtx.set(ctx);
			}
		} else {
			// wait for connectedCtx to be valid
			connectedCtx.wait();
		}
		block(connectedCtx.value.value .. @assert.ok);
	} finally {
		activeCalls--;
		if(activeCalls === 0 && connectedCtx.isSet) {
			killer .. @assert.eq(null);
			killer = spawn(function() {
				hold(1000 * 20);
				@logging.debug("@fs connection unused, closing");
				// don't let anyone kill this stratum
				// after this point
				killer = null;
				var ctx = connectedCtx.value;
				connectedCtx.clear();
				if(ctx) {
					ctx.resume();
				}
			}());
		}
	}
};


function wrap(method) {
	return function() {
	var args = arguments .. @toArray;
		withApi {|invoke|
			// XXX handle disconnection
			//console.log("invoking ", method, "with", args);
			return invoke(method, args);
		}
	};
};

// NOTE: relies on this being served from a location with access to seed source code
require('../../fs/prototype') .. @ownKeys .. @each {|method|
	exports[method] = wrap(method);
}
