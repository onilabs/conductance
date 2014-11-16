@ = require([
  'sjs:test/std',
  'mho:std',
]);

@test("version info") {||
  var info = @http.get(
    @url.normalize('../../local/version.json', module.id)) .. JSON.parse();
  info .. @ownKeys .. @sort .. @assert.eq(['apiVersion', 'conductanceVersion']);
  info .. @ownPropertyPairs .. @each([k,v] -> v .. @assert.ok(k));
}.browserOnly();
