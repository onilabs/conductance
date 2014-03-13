@ = require("sjs:test/std");
@helper = require('../helper');
@bundle = require('sjs:bundle');

var load = function(filename) {
  return @http.get(@helper.url("test/integration/fixtures/app/#{filename}"));
};

var getJSUrls = function(contents) {
  return contents
    .. @regexp.matches(/<script[^>]*src=['"]([^'"]+)['"][^>]*>/g)
    .. @map(m -> m[1] .. @rsplit('/', 1) .. @at(-1))
    .. @sort;
}

@context("@bundle directive") {||
  @test("causes bundle script to be loaded") {||
    load('bundle.app') .. getJSUrls .. @assert.eq(['bundle.app!bundle', 'stratified.js']);
  }

  @test("app content and dependencies") {||
    @bundle.contents({contents: load('bundle.app!bundle')})
      .. @map(url -> url.replace(/.*fixtures/, 'FIXTURES'))
      .. @sort
      .. @assert.eq(['FIXTURES/app/bundle.app', 'sjs:sys.sjs']);
  }
}
