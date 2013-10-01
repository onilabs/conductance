var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = require('../helper');
var bridge = require('mho:rpc/bridge');
var http = require('sjs:http');
var logging = require('sjs:logging');
var Url = require('sjs:url');

var apiUrl = -> helper.url('test/integration/fixtures/bridge.api');

context('bridge error handling') {||
  var apiName = Url.parse(apiUrl()).relative;
  var apiid;

  test.beforeAll {|s|
    var response = http.json([helper.url(apiName), {format:"json"}]);
    apiid = response.apiid;
    assert.ok(apiid);
  }

  test('propagates server-side errors') {||
    assert.raises({filter: e -> !bridge.isConnectionError(e) && e.message == "Some error"}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        connection.api.throwError('Some error');
      }
    };
  }

  test('re-throws client-side errors') {||
    assert.raises({filter: e -> !bridge.isConnectionError(e) && e.message == "Some client error"}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  test('throws connection errors') {||
    var log = [];
    assert.raises({filter: e -> bridge.isConnectionError}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        log.push(connection.api.ping());
        connection.api.dieAfter(50);
        hold(100);
        log.push(connection.api.ping());
      }
    };
    log .. assert.eq([ 'pong' ]);
  }
}

context('api loader') {||
  var url = apiUrl();

  test.beforeAll {||
    var path = Url.parse(url).relative;
    var prefix = path.slice(0, path.indexOf('test/'));
    require('mho:rpc/aat-client').setServerPrefix(prefix);
  }

  test('returns API') {||
    require(url).ping() .. assert.eq('pong');
    require(url).hostenv() .. assert.eq('nodejs');
  }

  test('exposes connection object') {||
    require(url).__connection .. assert.ok();
  }.skip("Not yet implemented");
}
