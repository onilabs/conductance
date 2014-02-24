@ = require('sjs:test/std');
@context {||

@fileServer = require('mho:server/file-server');
@codeFormats = require('mho:server/formats').Code();
var { @mockRequest } = require('./util');

@context('.app') {||
  @test('loads a relative template') {||
    var path = @url.normalize('./fixtures/custom-template.app', module.id) .. @url.toPath;
    var req = @mockRequest();
    @fileServer.serveFile(req, path, 'app', {
      formats: @codeFormats,
    });
    req.result().body .. @assert.contains('App contents: <script type="text/sjs">');

  }
}

}.serverOnly();
