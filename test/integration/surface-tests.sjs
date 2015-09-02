@ = require(['sjs:test/std', 'mho:std']);
@helper = require('../helper');

@context() {||
  var { @Driver } = require('sjs:xbrowser/driver');

  @test("Server-side mechanisms are evaluated") {||
    var url = @helper.url('test/integration/fixtures/static-mechanism.html');
    @info("loading: ", url);
    var d = @Driver(url);
    try {
      d.waitforSuccess(-> d.window().mechanismComplete .. @assert.ok());
    }
    finally {
      d.close();
    }
  }
}.browserOnly();
