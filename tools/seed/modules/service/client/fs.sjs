@ = require(['mho:std', 'sjs:pool']);
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

var withApi = (function() {
	var conf = common.getConfig('fs');
	var agent = new @https.Agent(@https.globalAgent.options .. @merge({
		ca: conf .. @get('ca'),
	}));

	return @sharedContext({
		delay: 10 * 1000, // drop connection after 10s inactivity
		name: 'fs.api',
		log: @logging.verbose,
	}, function(block) {
		var apiinfo = @bridge.resolve(conf .. @get('server'), {agent: agent});
		@bridge.connect(apiinfo, {
			transport: @openTransport(apiinfo.server, {agent:agent}),
		}) {|conn|
			block(conn.api.authenticate(conf .. @get('token')));
		}
	});
})();

function wrap(method) {
	return function() {
	var args = arguments .. @toArray;
		withApi {|invoke|
			return invoke(method, args);
		}
	};
};

// NOTE: relies on this being served from a location with access to seed source code
require('../../fs/prototype') .. @ownKeys .. @each {|method|
	exports[method] = wrap(method);
}
