@ = require('sjs:test/std');
@helper = require('../helper');

@context {||
  @context("caching") {||

    var getter = (url) -> (etag, headers) -> @http.get(
      [url, {'etag': etag}],
      {response: 'full', 'throwing': false, headers: headers || {}})

    @test("without an etag") {||
      var url = @helper.url('test/integration/fixtures/hello.txt');
      var get = getter(url);

      var response = get();
      response.status .. @assert.eq(200);
      response.content .. @assert.eq('world!');
      response.getHeader('etag') .. @assert.eq(undefined);
      response.getHeader('cache-control') .. @assert.eq('no-cache');
    }

    @test("custom etag") {||
      var url = @helper.url('test/integration/fixtures/etag');
      var get = getter(url);
      var response;
      var etag;

      // no if-none-match header:
      response = get('tag1');
      response.status .. @assert.eq(200);
      response.content .. @assert.eq('ok: tag1');
      etag = response.getHeader('etag');
      etag .. @assert.eq('"tag1"');
      response.getHeader('cache-control') .. @assert.eq('must-revalidate');

      var headers = {'If-None-Match': etag};

      // stale
      response = get('tag2', headers);
      response.status .. @assert.eq(200);
      response.content .. @assert.eq('ok: tag2');
      etag = response.getHeader('etag');
      etag .. @assert.eq('"tag2"');

      // up to date
      response = get('tag1', headers);
      response.status .. @assert.eq(304);
      response.content .. @assert.falsy();
    }
  }
}.serverOnly();
