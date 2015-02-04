@ = require(['mho:std', 'sjs:pool']);

var common = require('./common');

exports.withDB = (function() {
	// NOTE: `db` api is provided by `fs` server, but it lives at ./db.api
	var conf = common.getConfig('fs');
	return @sharedContext({
		name: 'db.api',
		log: @logging.verbose,
	}, function(block) {
		common.connect(conf, 'db.api',
			api -> api.authenticate(conf .. @get('token'), block));
	});
})();
