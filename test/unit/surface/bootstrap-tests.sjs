@ = require('sjs:test/std');
@test("bootstrap/html exports the same symbols as surface/html", function() {
	require('mho:surface/bootstrap/html')
		.. @ownKeys .. @sort
		.. @assert.eq(require('mho:surface/html') .. @ownKeys .. @sort);
});
