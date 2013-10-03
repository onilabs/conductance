var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = require('../helper');
var bridge = require('mho:rpc/bridge');
var { isTransportError } = bridge;
var http = require('sjs:http');
var logging = require('sjs:logging');
var Url = require('sjs:url');
var { each } = require('sjs:sequence');
var { contains } = require('sjs:string');

var apiUrl = -> helper.url('test/integration/fixtures/bridge.api');

context('bridge error handling') {||
  var apiid;

  test.beforeAll {|s|
    var apiName = Url.parse(apiUrl()).relative;
    var response = http.json([helper.url(apiName), {format:"json"}]);
    apiid = response.apiid;
    assert.ok(apiid);
  }

  test('propagates server-side errors') {||
    assert.raises({filter: e -> !isTransportError(e) && e.message == "Some error"}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        connection.api.throwError('Some error');
      }
    };
  }

  test('re-throws client-side errors') {||
    assert.raises({filter: e -> !isTransportError(e) && e.message == "Some client error"}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  test('includes server-side stacktrace') {||
    //XXX should be able to disable this if server filesystem layout is sensitive
    assert.raises({filter: e -> !isTransportError(e) && e.toString() .. /at module file:\/\/.*fixtures\/bridge.api:\d+/.test()}) {||
      bridge.connectWith(helper.getRoot(), apiid) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  test('throws connection errors') {||
    var log = [];
    assert.raises({filter: isTransportError}) {||
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
  var url;

  test.beforeAll {||
    url = apiUrl();
    var path = Url.parse(url).relative;
    var prefix = path.slice(0, path.indexOf('test/'));
    require('mho:rpc/aat-client').setServerPrefix(prefix);
  }

  test.beforeAll {|s|
    s.apis = [];
    s.require = function(url) {
      var api = require(url);
      s.apis.push(api);
      return api;
    }
  }

  test.afterAll {|s|
    s.apis .. each {|api|
      //logging.info("cleaning up API connection in test.afterEach");
      api.__connection.__finally__();
    }
  }

  test('returns API') {|s|
    s.require(url).ping() .. assert.eq('pong');
  }

  test('exposes connection object') {|s|
    s.require(url).__connection .. assert.ok();
  }

  test('fails in-progress calls when connection is lost, but reestablishes connection') {|s|
    var log = [];
    var api = s.require(url);
    var status = api.__connection.status();
    var ping = function() {
      log.push('ping');
      log.push(api.ping());
    }

    waitfor {
      ping();
      api.dieAfter(50);
      hold(100);
      assert.raises({filter: isTransportError}, -> ping());
      // after the above disconnect, the API should be reconnected
      ping();
    } or {
      var state = undefined;
      status.observe {|val|
        if (val.connected === state) continue;
        state = val.connected;
        log.push(state ? "connected" : "disconnected");
      }
    }
    log .. assert.eq([
      'ping', 'pong',
      'ping', 'disconnected', 'connected', /* no pong; it was aborted */
      'ping', 'pong']);
  }
}
