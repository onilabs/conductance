@env = require('mho:env');
// preemtively disable env keys which could
// cause side effects if not correctly stubbed
// (e.g email, data storage, config paths)
//
// These are stubbed in ./stub.api

var disable = function(key) {
	@env.lazy('key', function() {
		throw new Error("env key [#{key}] not available (test mode)");
	});
}

disable('email-transport');
disable('data-root');
disable('local-config-root');

require('../../modules/hub');
