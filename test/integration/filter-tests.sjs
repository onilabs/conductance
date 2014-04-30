@ = require('sjs:test/std');
@helper = require('../helper');

@context {||

  @test("Etag") {||
    var url = @helper.url('etagTest');
    var response;
    var headers = {};
    var etag;
    var get = (etag) -> @http.get([url, {'etag': etag}], {response: 'full', 'throwing': false, headers: headers})

    // no if-none-match header:
    response = get('tag1');
    response.status .. @assert.eq(200);
    response.content .. @assert.eq('ok: tag1');
    etag = response.getHeader('etag');
    etag .. @endsWith('-tag1"') .. @assert.ok("Expected *-tag1, got #{etag}");

    headers['If-None-Match'] = etag;

    // stale
    response = get('tag2');
    response.status .. @assert.eq(200);
    response.content .. @assert.eq('ok: tag2');
    etag = response.getHeader('etag');
    etag .. @endsWith('-tag2"') .. @assert.ok("Expected *-tag2, got #{etag}");

    // up to date
    response = get('tag1');
    response.status .. @assert.eq(304);
    response.content .. @assert.falsy();
  }

}.serverOnly();
