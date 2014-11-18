@ = require('sjs:test/std');
@helper = require('../helper');

@context {||
  @context("caching") {||

    var getter = (url) -> (etag, headers) -> @http.get(
      [url, {'etag': etag}],
      {response: 'full', 'throwing': false, headers: headers || {}})

    @test("without an etag") {||
      var url = @helper.url('test/integration/fixtures/counter.txt');
      var get = getter(url);

      // make sure the counter starts at 0
      @http.get(url + '?reset=1');
      
      var response = get();
      response.status .. @assert.eq(200);
      response.content .. @assert.eq('current: 0');
      response.getHeader('etag') .. @assert.eq(undefined);
      response.getHeader('cache-control') .. @assert.eq('no-cache');

      // without an etag, the content function should always be called
      @info("req2");
      get().content .. @assert.eq('current: 1');
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

  @context("custom filter") {||
    @test("headers") {||
      var response = @http.get(@helper.url('test/integration/fixtures/custom-filter.txt'), {response:'full'});
      response.content .. @assert.eq("hello!");
      response.status .. @assert.eq(200);
      response.getHeader('x-gen-was-here') .. @assert.eq("yup");
      response.getHeader('content-type') .. @assert.eq("application/x-special-format");
      response.getHeader('cache-control') .. @assert.eq("private, max-age=10");
    }

    @test("alternate response") {||
      var response = @http.get(@helper.url('test/integration/fixtures/custom-filter.txt?redirect=/elsewhere'), {response:'full', throwing:false, max_redirects:0});
      response.status .. @assert.eq(302);
      response.getHeader('location') .. @assert.eq('/elsewhere');
    }
  }

  @test("slow generator import race condition") {||
    var modulePath = require.resolve('./fixtures/slow_gen.txt.gen').path;
    var url = @helper.url('test/integration/fixtures/slow_gen.txt');
    var msg = "So slow!";
    
    // make sure we start fresh
    delete require.modules[modulePath];

    @integers(0, 3) .. @each.par(100) {|i|
      hold(100 * i);
      @http.get(url, {agent:false}) .. @assert.ok(msg);
    };

    // make sure modulePath was actually the path that got populated
    require.modules[modulePath].exports.content() .. @assert.eq(msg);
  }
}.serverOnly();
