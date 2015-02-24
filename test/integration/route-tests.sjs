@ = require(['sjs:test/std']);
@helper = require('../helper');

var rel = p -> @helper.url('');

@context("response.send") {||
  var _url;
  @test.beforeAll {||
    _url = @helper.url('response.send')+'?';
  }

  var url = function() {
    return _url+ (arguments .. @toArray .. JSON.stringify .. encodeURIComponent);
  }

  var get = function() {
    return @http.get(url.apply(null, arguments), {response:'raw'});
  }

  @test("headers & body") {||
    var response = get(
      {
        headers: {
          'content-type': "text/plain",
          etag: 1234,
        },
      },
      'body!');
    response.headers['content-type'] .. @assert.eq('text/plain');
    response .. @stream.readAll('ascii') .. @assert.eq("body!");
  }

  @test("body only") {||
    var response = get('body!');
    response .. @stream.readAll('ascii') .. @assert.eq("body!");
  }

  @test("response code, text & headers") {||
    var response = @http.get(url({ status: 404, statusText:'Nope', headers:{'x-test':'true'}}, 'body!'), {throwing:false, response:'raw'});
    response.headers['x-test'] .. @assert.eq('true');
    response .. @stream.readAll('ascii') .. @assert.eq('body!');
  }

  @test("response code & headers") {||
    var response = @http.get(url({ status: 404, statusText:'Nope', headers:{'x-test':'true'}}, null), {throwing:false, response:'raw'});
    response.headers['x-test'] .. @assert.eq('true');
    response .. @stream.readAll('ascii') .. @assert.eq('');
  }
}
