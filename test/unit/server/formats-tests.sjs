@ = require('sjs:test/std');
@context {||

@stream = require('sjs:nodejs/stream');
@fileServer = require('mho:server/file-server');
@codeFormats = require('mho:server/formats').Code();

var mockRequest = function(url) {
  return {
    url: @url.parse(url),
    request: {
      method: 'GET',
    },
    response: (new @stream.WritableStringStream()) .. @extend({
      writeHead: (h) -> this.head = h,
      end: function(c) {
        if(c) this.body += c;
      },
    }),

    result: -> {
      head: this.response.head,
      body: this.response.data,
    }
  }
};

@context('.app') {||
  @test('loads a relative template') {||
    var path = @url.normalize('./fixtures/custom-template.app', module.id) .. @url.toPath;
    var req = mockRequest('http://example.com/' + path);
    @fileServer.serveFile(req, path, 'app', {
      formats: @codeFormats,
    });
    req.result().body .. @assert.contains('App contents: <script type="text/sjs">');

  }
}

}.serverOnly();
