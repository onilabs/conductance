@ = require('mho:std');
@bridge = require('mho:rpc/bridge');
@https = require('nodejs:https');
var { @openTransport } = require('mho:rpc/aat-client');

var NONE = {};

exports.getConfig = function(key) {
	var config = @env.get('seed-service-config', NONE);
	if(config === NONE) throw new Error("service configuration not found");
	config = config .. @get(key, NONE);
	if(config === NONE) throw new Error("'#{key}' service configuration not found");
	return config .. @merge({
		_agent: exports.agent(config) .. @assert.ok(),
	});
}

exports.agent = function(config) {
	return new @https.Agent(@https.globalAgent.options .. @merge({
		ca: config .. @get('ca'),
	}));
};

exports.apiinfo = function(config, api) {
	var api = config .. @get('server') + api;
	@verbose("resolving API #{api}");
	return @bridge.resolve( api, {agent: config .. @get('_agent')});
}

exports.connect = function(config, api, block) {
	var apiinfo = exports.apiinfo(config, api);
	@bridge.connect(apiinfo, {
		transport: @openTransport(apiinfo.server, {agent:config .. @get('_agent')}),
	}) {|conn|
		block(conn.api);
	}
}
