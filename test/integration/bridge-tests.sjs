var {test, context, assert} = require('sjs:test/suite');
var helper = require('../helper');
var bridge = require('mho:rpc/bridge');
var http = require('sjs:http');
var logging = require('sjs:logging');

context('bridge error handling') {||
  var apiName = '/test/integration/fixtures/bridge.api';
  var apiid;

  test.beforeAll {|s|
    var response = http.json([helper.url(apiName), {format:"json"}]);
    apiid = response.apiid;
    assert.ok(apiid);
  }

  test('propagates server-side errors') {||
    assert.raises({filter: e -> !bridge.isConnectionError(e) && e.message == "Some error"}) {||
      bridge.connectWith(helper.getHost(), apiid) {|connection|
        connection.api.throwError('Some error');
      }
    };
  }

  test('re-throws client-side errors') {||
    assert.raises({filter: e -> !bridge.isConnectionError(e) && e.message == "Some client error"}) {||
      bridge.connectWith(helper.getHost(), apiid) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  test('throws connection errors') {||
    var log = [];
    assert.raises({filter: e -> bridge.isConnectionError}) {||
      bridge.connectWith(helper.getHost(), apiid) {|connection|
        log.push(connection.api.ping());
        connection.api.dieAfter(50);
        hold(100);
        log.push(connection.api.ping());
      }
    };
    log .. assert.eq([ 'pong' ]);
  }
}
