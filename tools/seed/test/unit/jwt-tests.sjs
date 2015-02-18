@ = require(['mho:std', 'sjs:test/std']);
@context("jwt signing") {||
	var jwt = @env.get('jwt');
	var {JWT} = require('seed:jwt');

	@test("validates signed key") {||
		var token = jwt.sign({
			iss: "issuer",
			sub: "subject",
			aud: "audience",
		});

		var {claims} = jwt.verify(token);
		claims .. @assert.eq({
			iss: "issuer",
			sub: "subject",
			aud: "audience",
		});
	}

	@test("jwt verifies algorithm used") {||
		var signer = new JWT({
			crypto: { algorithm: 'NONE' },
		});
		var token = signer.sign({});

		@assert.raises({message:/JWT signature does not match/}, -> jwt.verify(token));
	}
}.serverOnly();
