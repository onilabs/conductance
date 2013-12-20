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

    test("Observable") {||
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

    test('exposes connection object') {||
      require(url).connect((a, c) -> c.reconnect .. assert.ok());
    }.skip("TODO: update for new API");

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
          logStatusChanges(log, status);
        }
      }
      log .. assert.eq([
        'connected',
        '+callback',
        'disconnected',
        '-callback',
        'connected',
        'result']);
    }.skip("TODO: update for new API");


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

      test('server-side observables are resolved consistently when one client is offline') { |s|
        require(url).connect {|api|
          var c1, c2;

          api.withSharedVariable {|v|
            // now, we make two iframe clients with mockable HTTP stacks:
            waitfor {
              c1 = s.Client('1');
              c1.ready = Condition();
              c1.gotValue = Condition();
              c1.polling = Condition();
            } and {
              c2 = s.Client('2');
              c2.ready = Condition();
              c2.gotValue = Condition();
            }

            var polling = Emitter();
            var disconnected = Condition();
            var orig_request = c1.lib.http.request;

            c1.lib.http.request = function() {
              if (disconnected.isSet) {
                logging.info("still disconnected - denying HTTP request");
                throw new Error("intentionally disconnected by test suite");
              }
              if ((arguments[0] .. at(-1)).cmd .. startsWith('poll_')) {
                // intercept poll requests
                c1.polling.set();
                waitfor {
                  disconnected.wait();
                  logging.info("throwing error in poll()");
                  throw new Error("disconnect intentionally triggered by test suite");
                } or {
                  return orig_request.apply(this, arguments);
                } finally {
                  c1.polling.clear();
                }
              } else {
                return orig_request.apply(this, arguments);
              }
            }
            
            var run = function(client) {
              client.lib.api.connect({server:prefix, status:true}) {|api, connection|
                logging.info("#{client.id}: connected");
                client.connection = connection;
                waitfor {
                  logStatusChanges(client.log, connection.status);
                } or {
                  var v = api.sharedVariable();
                  var observeReady = Condition();
                  waitfor {
                    v.observe {|val|
                      logging.info("client #{client.id}: observed #{val}");
                      client.log.push(val.join('|'));
                      client.gotValue.set();
                      observeReady.set();
                    }
                  } and {
                    observeReady.wait();
                    client.push = v.push.bind(v);
                    client.ready.set();
                  }
                }
              }
            };

            var waitForLog = function(log) {
              [c1, c2] .. each {|client|
                while (! client.log .. hasElem(log)) {
                  logging.debug("waiting for client #{client.id} to see log: #{log}");
                  client.gotValue.clear();
                  client.gotValue.wait();
                }
                logging.debug("client #{client.id} has now seen log: #{log}");
                client.gotValue.clear();
              }
            };

            waitfor {
              run(c1);
            } or {
              run(c2);
            } or {
              waitfor {
                c1.ready.wait();
              } and {
                c2.ready.wait();
              }

              c1.log .. assert.eq(['connected', '']);
              c2.log .. assert.eq(['connected', '']);

              c1.push('1.1');
              waitForLog('1.1');

              logging.info("Awaiting disconnect");
              waitfor {
                c1.connection.disconnected.wait();
              } and {
                disconnected.set();
              }

              logging.info("Adding a value from each client");
              waitfor {
                c1.push('1.2');
              } and {
                // give c1 a head start, so that if 2.1
                // appears first on the server then
                // c1 was clearly held up by reconnecting
                hold(100);
                waitfor {
                  c2.push('2.1');
                } and {
                  logging.info("awaiting c2 value");
                  c2.gotValue.wait();
                  c2.gotValue.clear();
                }
                c2.log .. assert.eq(['connected', '', '1.1', '1.1|2.1']);
                c1.log .. assert.eq(['connected', '', '1.1', 'disconnected']);
                hold(1000);
                logging.info("allowing reconnect");
                disconnected.clear();
              }

              // wait until both have seen final event
              waitForLog('1.1|2.1|1.2');
            }
          }
          c2.log .. assert.eq(['connected', '', '1.1', '1.1|2.1', '1.1|2.1|1.2']);
          c1.log .. assert.eq(['connected', '', '1.1', 'disconnected', 'connected', '1.1|2.1', '1.1|2.1|1.2']);
        }
      }.skip("TODO: update for new API");
    }.browserOnly().timeout(15);
  }
}
