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
    apiid = response.id;
    assert.ok(apiid);
  }

  test('propagates server-side errors') {||
    assert.raises({filter: e -> !isTransportError(e) && e.message == "Some error"}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.throwError('Some error');
      }
    };
  }

  test('re-throws client-side errors') {||
    assert.raises({filter: e -> !isTransportError(e) && e.message == "Some client error"}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  test('includes server-side stacktrace') {||
    //XXX should be able to disable this if server filesystem layout is sensitive
    assert.raises({filter: e -> !isTransportError(e) && e.toString() .. /at module file:\/\/.*fixtures\/bridge.api:\d+/.test()}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  }

  var destroyMethods = ['destroyConnection', 'breakConnection'];
  destroyMethods .. each {|method|
    test("throws connection error from #{method}") {||
      var log = [];
      assert.raises({filter: isTransportError}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
          log.push(connection.api.ping());
          connection.api[method](50);
          hold(100);
          log.push(connection.api.ping());
        }
      };
      log .. assert.eq([ 'pong' ]);
    };
  };
}

context('api.connect()') {||
  var url;

  test.beforeAll {||
    url = apiUrl();
    var path = Url.parse(url).relative;
    var prefix = path.slice(0, path.indexOf('test/'));
    require('mho:rpc/aat-client').setServerPrefix(prefix);
  }

  test('returns API') {||
    require(url).connect(a -> a.ping()) .. assert.eq('pong');
  }

  test('exposes connection object') {||
    require(url).connect((a, c) -> c.reconnect .. assert.ok());
  }

  test('reestablishes connection') {||
    var log = [];
    require(url).connect({status:true}) {|api, connection|
      var status = connection.status;
      var ping = function() {
        log.push('ping');
        log.push(api.ping());
      }

      waitfor {
        ping();
        api.destroyConnection(50);
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
    }
    log .. assert.eq([
      'ping', 'pong',
      'ping', 'disconnected', 'connected', /* no pong; it was aborted */
      'ping', 'pong']);
  }

  test('resumes in-progress calls') {||
    var log = [];
    require(url).connect({status:true}) {|api, connection|
      var status = connection.status;
      waitfor {
        log.push(api.callme(function() {
          log.push("+callback");
          hold(500);
          log.push("-callback");
          return "result";
        }));
      } or {
        api.breakConnection(50);
        hold();
      } or {
        var state = undefined;
        status.observe {|val|
          if (val.connected === state) continue;
          state = val.connected;
          log.push(state ? "connected" : "disconnected");
        }
      }
    }
    log .. assert.eq([
      '+callback',
      'disconnected',
      '-callback',
      'connected',
      'result']);
  }
}
