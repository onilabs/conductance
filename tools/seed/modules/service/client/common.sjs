@ = require('mho:std');
var NONE = {};

exports.getConfig = function(key) {
	var config = @env.get('seed-service-config', NONE);
	if(config === NONE) throw new Error("service configuration not found");
	config = config .. @get(key, NONE);
	if(config === NONE) throw new Error("'#{key}' service configuration not found");
	return config;
}
