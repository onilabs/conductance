@ = require('mho:std');

exports.init = function(serviceConfig, appId) {
	appId .. @assert.ok();
	if(serviceConfig && serviceConfig.enable === true) {
		@info("Generating JWT for fs service");
		var jwt = @env.get('jwt');
		waitfor {
			var token = jwt.sign({
				iss:"seed",
				sub: appId,
				aud: "seed",
			});
		} and {
			var ca = @path.join(@env.get('key-store'), 'key-all-internal-ca.crt') .. @fs.readFile();
		}
		return {
			token: token,
			server: @env.get('publicAddress')('fs','https'),
			ca: ca,
		};
	}
}
