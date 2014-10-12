@ = require('sjs:test/std');
@test("bootstrap/html exports the same symbols as surface/html") {||
	require('mho:surface/bootstrap/html')
		.. @ownKeys
		.. @assert.eq(require('mho:surface/html') .. @ownKeys .. @sort);
}.skip("TODO (split out bootstrap/components)")
