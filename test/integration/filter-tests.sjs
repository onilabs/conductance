@ = require('sjs:test/std');
@helper = require('../helper');

@context {||
  var getter = (url) -> (etag, headers) -> @http.get(
    [url, {'etag': etag}],
    {response: 'full', 'throwing': false, headers: headers || {}})

  @test("EtagFilter") {||
    var url = @helper.url('etagRoute');
    var get = getter(url);
    var response;
    var etag;

    // no if-none-match header:
    response = get('tag1');
    response.status .. @assert.eq(200);
    response.content .. @assert.eq('ok: tag1');
    etag = response.getHeader('etag');
    etag .. @endsWith('-tag1"') .. @assert.ok("Expected *-tag1, got #{etag}");

    var headers = {'If-None-Match': etag};

    // stale
    response = get('tag2', headers);
    response.status .. @assert.eq(200);
    response.content .. @assert.eq('ok: tag2');
    etag = response.getHeader('etag');
    etag .. @endsWith('-tag2"') .. @assert.ok("Expected *-tag2, got #{etag}");

    // up to date
    response = get('tag1', headers);
    response.status .. @assert.eq(304);
    response.content .. @assert.falsy();
  }

}.serverOnly();
