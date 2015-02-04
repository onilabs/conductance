@ = require('mho:std');
var { @keySafe } = require('seed:validate');
var jwt = @env.get('jwt');

// returns [userId, appId] given a valid seed-issued jwt token
exports.verify = function(token) {
	var {claims} = jwt.verify(token);
	claims.iss .. @assert.eq('seed');
	claims.aud .. @assert.eq('seed');
	var parts = claims.sub.split('/') .. @map(part -> part .. @assert.ok .. @keySafe);
	// parts is [userId, appId]
	parts.length .. @assert.eq(2);
	return parts;
};
