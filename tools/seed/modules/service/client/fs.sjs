@ = require(['mho:std', 'sjs:pool']);

if (require.main === module) {
	// for development
	@env.set('host-fs', 'localhost');
	@env.set('seed-service-config', {
		fs: require('../init/fs').init({ enable: true}, "example/app1"),
	});
}

var common = require('./common');

var withApi = (function() {
	var conf = common.getConfig('fs');
	return @sharedContext({
		delay: 10 * 1000, // drop connection after 10s inactivity
		name: 'fs.api',
		log: @logging.verbose,
	}, function(block) {
		common.connect(conf, 'fs.api') {|api|
			block(api.authenticate(conf .. @get('token')));
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
require('../../fs/prototype').keys .. @each {|method|
	exports[method] = wrap(method);
}
