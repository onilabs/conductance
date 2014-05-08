var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = require('../helper');
var bridge = require('mho:rpc/bridge');
var { isTransportError } = bridge;
var http = require('sjs:http');
var { Emitter } = require('sjs:event');
var { Condition } = require('sjs:cutil');
var logging = require('sjs:logging');
var Url = require('sjs:url');
var { each, at, all, map, hasElem } = require('sjs:sequence');
var { contains, startsWith } = require('sjs:string');
var { eq } = require('sjs:compare');

var apiUrl = -> helper.url('test/integration/fixtures/bridge.api');

function logStatusChanges(log, status, initial) {
  var current = initial;
  status.observe {|val|
    if (val.connected === current) continue;
    current = val.connected;
    var desc = current ? "connected" : "disconnected";
    logging.info("saw connect event: #{desc}");
    log.push(desc);
  }
}

context('bridge error handling') {||
  var apiid;

  test.beforeAll {|s|
    apiid = apiUrl();
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
      assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
          log.push(connection.api.ping());
          connection.api[method](50);
          hold(500);
          log.push(connection.api.ping());
        }
      };
      log .. assert.eq([ 'pong' ]);
    };
  };

}

function waitforSuccess(block) {
  var lastError;
  try {
    while(true) {
      try {
        block();
        break;
      } catch (e) {
        lastError = e;
      }
      hold(100);
    }
  } retract {
    if (lastError) throw lastError;
  }
};
  
      

context() {||
  // common setup to make api module available
  var url,prefix;

  test.beforeAll {||
    url = apiUrl();
    var path = Url.parse(url).relative;
    prefix = path.slice(0, path.indexOf('test/'));
    require('mho:rpc/aat-client').setServerPrefix(prefix);
  }

  context('object marshalling') {||
    test("Stream") {||
      require(url).connect {|api|
        api.integers(0, 5) .. map(x -> x) .. assert.eq([0,1,2,3,4,5]);
      }
    }

    test("ObservableVar") {||
      require(url).connect({status:true}) {|api|
        api.withSharedVariable {|v|
          var changes = [];
          waitfor {
            v .. each(x -> changes.push(x));
          } or {
            waitforSuccess(-> changes .. eq([undefined]));
            v.set("value1");
            v.get() .. assert.eq("value1");
            waitforSuccess(-> changes .. eq([undefined, "value1"]));
          }
        }
      }
    }
  }



  context('api modules') {||

    test('returns API') {||
      var rv;
      require(url).connect(a -> rv = a.ping());
      rv .. assert.eq('pong');
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
          logStatusChanges(log, status);
        }
      }
      log .. assert.eq([
        'ping', 'pong',
        'ping', 'disconnected', 'connected', /* no pong; it was aborted */
        'ping', 'pong']);
    }.skip("Currently aborts entire connection, to err on safe side (workaround for uncaught errors in strata)");

    test("serves .api from relative directory") {||
      // hello.api is configured to be served from "./test",
      // not cwd() + '/test':
      require(helper.url('hello.api')).connect {|api|
        api.hello() .. assert.eq("world!");
      }
    }


    context('multiple clients') {||
      var driver = require('sjs:xbrowser/driver');
      var { Driver } = driver;

      test.beforeEach {|s|
        assert.ok(prefix);
        var fixtureUrl = Url.normalize('./fixtures/bridgeClient.html?root=' + prefix, module.id);
        s.drivers = [];
        s.Client = function(id) {
          var c = {};
          c.log = [];
          c.id = id;
          c.driver = Driver(fixtureUrl);
          s.drivers.push(c.driver);
          c.lib = driver.waitforCondition(-> c.driver.window().stdlib);
          return c;
        }
      }

      test.afterEach {|s|
        s.drivers .. each (function(c) {
          console.log("END OF client");
        });
        s.drivers .. each(d -> d.__finally__());
      }

    }.browserOnly().timeout(15);
  }
}
