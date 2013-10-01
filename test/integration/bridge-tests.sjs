var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = require('../helper');
var bridge = require('mho:rpc/bridge');
var http = require('sjs:http');
var logging = require('sjs:logging');
var url = require('sjs:url');

context('bridge error handling') {||
  var apiName;
  if (isBrowser) {
    apiName = url.normalize('fixtures/bridge.api', module.id);
  } else {
    apiName = '/test/integration/fixtures/bridge.api';
  }
  console.log(apiName);
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
