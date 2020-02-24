@ = require('sjs:test/std');
@bytes = require('sjs:bytes');
var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = @helper = require('../helper');
var bridge = @bridge = require('mho:rpc/bridge');
var { isTransportError } = bridge;
var http = require('sjs:http');
var logging = require('sjs:logging');
var Url = require('sjs:url');
var { each, at, all, map, hasElem, indexed } = require('sjs:sequence');
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

var CALL_BATCH_PERIOD = 20;   // bridge implementation detail

var MAX_ROUNDTRIP = CALL_BATCH_PERIOD + 100; // roundtrip time between client & server.
                                             // If a single call takes longer than this, tests may fail.

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
    var destroy = function(api, log) {
      api[method](50);
      hold(500);
      return api.ping();
    };

    context("destroyed with #{method}") {||
      test.beforeEach {|s|
        s.log = [];
        s.push = function(obj) {
          logging.info("log.push: #{obj}");
          s.log.push(obj);
        }
      }

      test("throws connection error") {|s|
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            s.push(connection.api.ping());
            try {
              s.push(connection.api .. destroy());
              s.push("not reached");
            }
            catch(e) {
              // Only 'destroyConnection' hits this catch, because it errors
              // before 'api[method]()' returns.
              // This error is generated during retraction, so we *also* hit 
              // the 'retract' path.
//              assert.eq(method, 'destroyConnection');
              s.push('1');
              // should be retacted by virtue of block exiting
              s.push("not reached");
              throw e;
            }
            retract {
//              if(method === 'breakConnection') {
                // breakConnection doesn't hit the catch, because it errors in
                // the hold(500)
                s.push('1');
//              }
//              s.push('2');
            }
          }
        };

        s.log .. assert.eq([ 'pong', '1']);
      };

      test("error thrown in cancellation") {|s|
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            waitfor {
              connection.api.throwOnCancellation("error intentionally thrown during cancellation");
            } and {
              hold(MAX_ROUNDTRIP);
              connection.api .. destroy();
            }
          }
        };
        hold(MAX_ROUNDTRIP * 4); // give server a chance to fail
      }

      test("retracts all running calls") {|s|
        // ideally this would not be necessary, but long-running methods invoked
        // by a remote function may never receive a retraction (since the remote cannot send one)
        // To be safe. we abort _all_ running calls when we see a ConnectionError
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            connection.api.callme {||
              try {
                spawn(function() {
                  hold(200);
                  try {
                    s.push(connection.api .. destroy());
                    s.push('not reached');
                  } catch (e) {
                    assert.truthy(e .. isTransportError);
                    //assert.eq(e.message, 'session lost');
                    s.push('lingering call exception'); 
                  }
                }());
                s.push("running");
                hold(1000);
              } retract {
                s.push("retracted");
              } finally {
                s.push("finally");
              }
            }
          }
        }
        hold(1000);
        s.log .. assert.eq(['running', 'retracted', 'finally', 'lingering call exception']);
      }

      test("retracts all pending calls") {|s|
        // ideally this would not be necessary, but long-running methods invoked
        // by a remote function may never receive a retraction (since the remote cannot send one)
        // To be safe. we abort _all_ running calls when we see a ConnectionError
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            spawn(function() {
              hold(200);
              try {
                s.push(connection.api .. destroy());
                s.push('not reached');
              } catch (e) {
                assert.truthy(e .. isTransportError);
                //assert.eq(e.message, 'session lost');
                s.push('lingering call exception'); 
              }
            }());
            try {
              s.push("running");
              connection.api.hold();
            } retract {
              s.push("retracted");
            } finally {
              s.push("finally");
            }
          }
        }
        hold(1000);
        s.log .. assert.eq(['running', 'retracted', 'finally', 'lingering call exception']);
      }
    }
  };

  test('retracts server side execution initiated by client on closed connection'){||
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      spawn(function() {
        // call doesn't return before the connection ends (due to `spawn`),
        // which will cause a `session lost` error
        assert.raises({filter: isTransportError}, ->
          connection.api.detectRetractionAfterDelay(2*MAX_ROUNDTRIP));
      })();
      hold(MAX_ROUNDTRIP);
    }
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      assert.truthy(connection.api.didDetectRetraction());
    }
  }

  test('throws TransportError when calling client function after closed connection'){||
    var someFuncExecuted = false;
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      var someFunc = function(){someFuncExecuted = true};
      connection.api.checkErrorThrownOnCallingFuncAfterDelay(someFunc, MAX_ROUNDTRIP);
    }
    hold(MAX_ROUNDTRIP*2);

    assert.falsy(someFuncExecuted);
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      assert.truthy(connection.api.wasErrorThrown());
    }
  }

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

    test("Custom") {||
      var duck = {text: "Hi there!"};
      var marshalled = {text: "Hi there!"};
      bridge.connect(apiUrl(), {server: helper.getRoot()}) {|connection|
        var api = connection.api;
        marshalled .. bridge.setMarshallingDescriptor({
          wrapLocal: o -> o.text,
          wrapRemote: [api, 'unmarshallCustomObject'],
          //wrapRemote: ['sjs:string', 'strip'], // api.unmarshallCustomObject,
        });
        api.isCustomObject(duck) .. assert.eq(false);
        api.isCustomObject(duck .. api.unmarshallCustomObject()) .. assert.eq(false);
        api.isCustomObject(marshalled) .. assert.eq(true);
      }
    }

    test("Error during unmarshalling") {||
      var obj = {text: "Hi there!"};
      bridge.connect(apiUrl(), {server: helper.getRoot()}) {|connection|
        var api = connection.api;
        obj .. bridge.setMarshallingDescriptor({
          wrapLocal: o -> o.text,
          wrapRemote: [api, 'buggyUnmarshaller'],
        });
        assert.raises({message:"This unmarshaller intentionally left broken"}, -> api.isCustomObject(obj));
      }
    }

    test("Arbitrary unmarshaller is disallowed") {||
      var obj = {text: "Hi there!"};
      bridge.connect(apiUrl(), {server: helper.getRoot()}) {|connection|
        var api = connection.api;
        obj .. bridge.setMarshallingDescriptor({
          wrapLocal: o -> o.text,
          wrapRemote: ['sjs:string', 'strip'],
        });
        assert.raises({ message: /Unsupported marshalling descriptor/},
          -> api.ping(obj));
      }
    }

    exports.allowedUnmarshaller = function(obj) {
      return {custom:true, obj:obj};
    };

    exports.disallowedUnmarshaller = function(obj) {
      throw new Error("disallowedUnmarshaller called!");
    };

    test("Only whitelisted unmarshallers are allowed from server") {||
      var duck = {text: "Hi there!"};
      bridge.connect(apiUrl(), {server: helper.getRoot(), localWrappers:[ [module.id, 'allowedUnmarshaller'] ]}) {|connection|
        var api = connection.api;
        api.returnCustomObject(duck, [module.id, 'allowedUnmarshaller']) .. assert.eq({
          custom: true,
          obj: duck,
        });

        assert.raises({ message: /Unsupported marshalling descriptor/},
          -> api.returnCustomObject(duck, [module.id, 'disallowedUnmarshaller']));
      }
    }

    context("binary data") {||
      var isPhantomJS = @isBrowser && /PhantomJS/.test(window.navigator.userAgent);
      var noTypedArraySupport = isPhantomJS;
      var noBlobSupport = typeof(Blob) === 'undefined';
      var api;
      @withBackgroundServices {
        |background_session|
        var bridge_service; 
        test.beforeAll {|s|
          bridge_service = background_session.attach(bridge.connect, apiUrl(), {server:helper.getRoot()});
          bridge_service.use { |_api|
            api = _api.api;
          }
        }
        test.afterAll {|s| bridge_service.stop(true) }
        var payload = 'ßɩnɑʀʏ';
        
        test('Buffer') {||
          var buf = Buffer.from(payload);
          var rv = api.identity(buf);
          rv .. Buffer.isBuffer .. @assert.ok(`not a Buffer: $rv`);
          rv .. @assert.eq(buf);
        }.serverOnly()
        
        test('Uint8Array') {||
          var buf = new Uint8Array(@octetsToArrayBuffer(payload .. @utf16ToUtf8));
          var rv = api.identity(buf);
          (rv instanceof Uint8Array) .. @assert.ok(`not a Uint8Array: $rv`);
          rv .. @arrayBufferToOctets .. @utf8ToUtf16 .. @assert.eq(payload);
          rv .. @assert.eq(buf);
        }.skipIf(noTypedArraySupport)
        
        test('ArrayBuffer ends up as Uint8Array') {||
          var buf = new Uint8Array(@octetsToArrayBuffer(payload .. @utf16ToUtf8)).buffer;
          (buf instanceof ArrayBuffer) .. @assert.ok();
          var rv = api.identity(buf);
          (rv instanceof Uint8Array) .. @assert.ok(`not a Uint8Array: $rv`);
          rv .. @arrayBufferToOctets .. @utf8ToUtf16 .. @assert.eq(payload);
        }.skipIf(noTypedArraySupport)
        
        test('Blob ends up in the platform\'s preferred format') {||
          var buf = new Uint8Array(@octetsToArrayBuffer(payload .. @utf16ToUtf8));
          buf = new Blob([buf]);
          (buf instanceof Blob) .. @assert.ok();
          var rv = api.identity(buf);
          if(@isBrowser) {
            (rv instanceof Uint8Array) .. @assert.ok(`not a Uint8Array: $rv`);
            rv .. @arrayBufferToOctets .. @utf8ToUtf16 .. @assert.eq(payload);
          } else {
            rv .. Buffer.isBuffer .. @assert.ok(`not a Buffer: $rv`);
            rv .. @assert.eq(Buffer.from(payload));
          }
        }.skipIf(noBlobSupport || isPhantomJS /* PhantomJS Blob implementation is busted */)
      }
    } // background_session
  }

  context('returns_and_breaks') {||
    test('blocklambda_return') {||
      var rv = '';
      function foo(api) { 
        api.integer_stream { |x|
          rv += x;
          if (x === 10) return 'done';
        }
        return 'not reached';
      }
      require(url).connect() {|api|
        rv += foo(api);
      }
      assert.eq(rv, '012345678910done');
    }

    test('blocklambda_return_async') {||
      var rv = '';
      function foo(api) { 
        api.integer_stream { |x|
          rv += x;
          if (x === 10) {
            hold(0);
            return 'done';
          }
        }
        return 'not reached';
      }
      require(url).connect() {|api|
        rv += foo(api);
      }
      assert.eq(rv, '012345678910done');
    }


    test('blocklambda_return_slow') {||
      var rv = '';
      function foo(api) { 
        (api.slowIntegers(0)) { |x|
          rv += x;
          if (x === 10) return 'done';
        }
        return 'not reached';
      }
      require(url).connect() {|api|
        rv += foo(api);
      }
      assert.eq(rv, '012345678910done');
    }

    test('blocklambda_break_1') {||
      var rv = '';
      function foo(api) { 
        api.integer_stream { |x|
          rv += x;
          if (x === 10) break;
        }
        return 'done';
      }
      require(url).connect() {|api|
        rv += foo(api);
      }
      assert.eq(rv, '012345678910done');
    }

    test('blocklambda_break_2') {||
      var rv = '';
      require(url).connect() {|api|
        api.integer_stream { |x|
          rv += x;
          if (x === 10) break;
        }
        rv += 'done';
      }
      assert.eq(rv, '012345678910done');
    }

    test('blocklambda_break_async') {||
      var rv = '';
      require(url).connect() {|api|
        api.integer_stream { |x|
          rv += x;
          hold(0);
          if (x === 10) break;
        }
        rv += 'done';
      }
      assert.eq(rv, '012345678910done');
    }
  }

  context('synchronous_aborting') {||

    /**

       api.call

       executing_call on our side... we see a break on our side...
       the finally stuff on our side will be handled

     */

    test('async_blbreak_blocking_finally_at_initiator') {||
      var rv = '';
      require(url).connect() { |api|
        api.integer_stream { |x|
          rv += x;
          hold(0);
          if (x === 10) {
            try {
              break;
            }
            finally {
              hold(0);
              rv += 'F';
            }
          }
        };
        rv += 'done'
      }
      assert.eq(rv,'012345678910Fdone');
    }

    test('blbreak_blocking_finally_at_initiator') {||
      var rv = '';
      require(url).connect() { |api|
        api.integer_stream { |x|
          rv += x;
          if (x === 10) {
            try {
              break;
            }
            finally {
              hold(0);
              rv += 'F';
            }
          }
        };
        rv += 'done'
      }
      assert.eq(rv,'012345678910Fdone');
    }


    test('async_blbreak_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|
        api.blocking_finally(-> (rv+='c','ignore')) { ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        }
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('s_blbreak_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|
        api.blocking_finally(-> (rv+='c','ignore')) { ||
          rv += 'a';
          rv += 'b';
          break;
          rv += 'x';
        }        
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('async_nested_blbreak_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          api.blocking_finally(-> (rv+='c','ignore'), block);
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('async_complicated_nested_blbreak_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          var stratum = spawn api.blocking_finally(-> (rv+='c','ignore'), block);
          hold();//stratum.value();
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('async_nested_blbreak_blocking_finally_finally') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          try {
            api.blocking_finally(-> (rv+='c','ignore'), block);
          }
          finally {
            hold(0);
            rv += 'f';
          }
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcfd');
    }


    test('s_nested_blbreak_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          api.blocking_finally(-> (rv+='c','ignore'), block);
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('s_nested_blbreak_blocking_finally_finally') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          try {
            api.blocking_finally(-> (rv+='c','ignore'), block);
          }
          finally {
            rv += 'f';
          }
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcfd');
    }


    //--------------------------------------------------------------
    test('s_blreturn_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|
        function test() {
          api.blocking_finally(-> (rv+='c','ignore')) { ||
            rv += 'a';
            rv += 'b';
            return 'd';
            rv += 'x';
          }
          rv += 'x';
        }
        rv += test();
        hold(100);
      }
      assert.eq(rv, 'abcd');
    }
    //--------------------------------------------------------------

    test('async_blreturn_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|
        function test() {
          api.blocking_finally(-> (rv+='c','rv_from_finalizer_ignore')) { ||
            rv += 'a';
            hold(0);
            rv += 'b';
            return 'd';
            rv += 'x';
          }
          rv += 'y';
        }
        rv += test();
        //hold(1000);
      }
      assert.eq(rv, 'abcd');
    }

    //--------------------------------------------------------------
    test('s_blreturn_blocking_finally_at_intermediate_2') {||
      var rv = '';
      require(url).connect() { |api|
        function test() {
          try {
            api.blocking_finally(-> (rv+='c','ignore')) { ||
              rv += 'a';
              rv += 'b';
              return 'd';
              rv += 'x';
            }
            rv += 'x';
          }
          finally {
            rv += 'f';
          }
        }
        rv += test();
        hold(100);
      }
      assert.eq(rv, 'abcfd');
    }
    //--------------------------------------------------------------

    test('async_blreturn_blocking_finally_at_intermediate_2') {||
      var rv = '';
      require(url).connect() { |api|
        function test() {
          try {
            api.blocking_finally(-> (rv+='c','rv_from_finalizer_ignore')) { ||
              rv += 'a';
              hold(0);
              rv += 'b';
              return 'd';
              rv += 'x';
            }
            rv += 'y';
          }
          finally {
            rv += 'f';
          }
        }
        rv += test();
        //hold(1000);
      }
      assert.eq(rv, 'abcfd');
    }

    test('async_nested_blreturn_blocking_finally_at_intermediate') {||
      var rv = '';
      require(url).connect() { |api|

        (function() {

          var block = { ||
            rv += 'a';
            hold(10);
            rv += 'b';
            return;
            rv += 'x';
          };
          
          (function() {
            api.blocking_finally(-> (rv+='c','ignore'), block);
            rv += 'y';
          })();
          rv += 'z';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    }

    test('async_nested_blreturn_blocking_finally_at_intermediate_2') {||
      var rv = '';
      require(url).connect() { |api|

        (function() {
          
          (function() {
            var block = { ||
              rv += 'a';
              hold(10);
              rv += 'b';
              return;
              rv += 'x';
            };
            api.blocking_finally(-> (rv+='c','ignore'), block);
            rv += 'y';
          })();
          rv += 'z';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abczd');
    }

    test('async_complicated_nested_blreturn_blocking_finally_at_intermediate') {||
      var rv = '';
      function test() {
        require(url).connect() { |api|
          
          var block = { ||
            rv += 'a';
            hold(10);
            rv += 'b';
            return 'r';
            rv += 'x';
          };
          
          (function() {
            var stratum = spawn api.blocking_finally(-> (rv+='c','ignore'), block);
            hold();//stratum.value();
            rv += 'y';
          })();
          rv += 'd';
        }
        rv += 'e';
      }
      rv += test();
      assert.eq(rv, 'abcr');
    }

    test('blreturn_across_nested_bridge_calls') { ||
      var rv = '';

      function test() {
        require(url).connect() { |api|
          try {
            api.blocking_finally(->(rv+='o','ignore')) {
              ||
              try {
                api.blocking_finally(->(rv+='i','ignore')) {
                  ||
                  try {
                    api.blocking_finally(->(rv+='g','ignore')) {
                      ||
                      hold(10);
                      rv += '*';
                      return 'R';
                    }
                  }
                  finally {
                    rv += 'G';
                  }
                }
              }
              finally {
                rv += 'I';
              }
            }
          }
          finally {
            rv += 'O';
          }
        }
      }

      rv += test();
      assert.eq(rv, '*gGiIoOR');
    }

    test('blreturn_across_nested_spawned_bridge_calls') { ||
      var rv = '';

      function spawn_and_wait(id, block) {
        try {
          (spawn block()).value();
        }
        finally {
          rv += id;
        }
      }

      function test() {
        require(url).connect() { |api|
          spawn_and_wait('O') {
            ||
            api.blocking_finally(->(rv+='o','ignore')) {
              ||
              spawn_and_wait('I') {
                ||
                api.blocking_finally(->(rv+='i','ignore')) {
                  ||
                  spawn_and_wait('G') {
                    ||
                    api.blocking_finally(->(rv+='g','ignore')) {
                      ||
                      hold(10);
                      rv += '*';
                      return 'R';
                    }
                  }
                }
              }
            }
          }
        }
      }

      rv += test();
      assert.eq(rv, '*gGiIoOR');
    }

    test('blbreak_across_nested_spawned_bridge_calls') { ||
      var rv = '';

      function spawn_and_wait(id, block) {
        try {
          (spawn block()).value();
        }
        finally {
          rv += id;
        }
      }

      function test() {
        require(url).connect() { |api|

          var blk = {
            ||
            hold(10);
            rv += '*';
            break;
          }

          spawn_and_wait('O') {
            ||
            api.blocking_finally(->(rv+='o','ignore')) {
              ||
              spawn_and_wait('I') {
                ||
                api.blocking_finally(->(rv+='i','ignore')) {
                  ||
                  spawn_and_wait('G') {
                    ||
                    api.blocking_finally(->(rv+='g','ignore'), blk);
                  }
                }
              }
            }
          }

          return 'R';
        }
      }

      rv += test();
      assert.eq(rv, '*gGiIoOR');
    }


    // XXX it's not quite clear what the semantics should be here.
    // The exception should probably end up at the point where the 'abort' ends up, rather
    // than traversing the stack like a 'normal' exception.
    // Also, real exceptions (new Error(.)) behave differently to others.
    // Interestingly, plain JS behaves like the testcase here. (E.g. the following code
    // loops forever - although it also does so for non-Error exceptions.
    /* 
     while (1) {
       console.log('a');
       try {
         try {
           break;
         }
         finally {
           throw new Error('foo');
         }
       }
       catch(e) {
         console.log("caught "+e);
       }
       console.log('b');
     }
    */    
    test('async_complicated_nested_blbreak_blocking_finally_at_intermediate_throw') {||
      var rv = '';
      require(url).connect() { |api|

        var block = { ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        };

        (function() {
          var stratum = spawn api.blocking_finally(function() { rv+='c'; throw new Error('finalizer_throw');}, block);
          try {
            stratum.value();
          }
          catch(e) { assert.eq(String(e).split('\n')[0], 
                               'Error: finalizer_throw'); 
                     rv += 'C'; }
          finally {
            rv += 'f';
          }
          rv += 'y';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcCfyd');
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

context("non-root locations") {||
  @withBackgroundServices {
    |background_session|

    test.beforeAll {|s|
      s.server = background_session.attach(function(scope) {
        var ready = @Condition();
        waitfor {
          require('./fixtures/bridge-proxy.mho').serve([], ready);
          throw new Error("server ended prematurely");
        }
        or {
          s.ports = ready.wait();
          scope();
        }
      });
      s.server.start(true);
    }
    
    test.afterAll {|s|
      s.server.stop(true);
    }
    
    var testResolve = function(dest, path, expectedRelative) {
      return test(dest + path) {|s|
        var port = s.ports[0];
        var url = "http://localhost:#{port}#{dest}#{path}bridge.api";
        logging.info("Resolving: #{url}");
        var resolved = bridge.resolve(url);
        resolved.server .. assert.eq("http://localhost:#{port}#{dest}");
        
        var expected = "http://localhost:#{port}#{dest}";
        @url.normalize(resolved.root, url) .. @assert.eq(expected);
        resolved.root .. assert.eq(expectedRelative);
      }
    }
    
    context("proxied API maintains relative address") {||
      testResolve('/proxy/', '', './');
      testResolve('/proxy/', 'double/prefix/', '../../');
      testResolve('/proxy/', 'nested/prefix/', '../../');
      testResolve('/proxy/', 'nested-prefix-', './');
      testResolve('/proxy/', 'nested-dir-prefix/', '../');
      testResolve('/proxy/', 'parent/fixtures/', '../../');
      
      // non-canonical URLs are unlikely, but can probably happen:
      testResolve('/proxy/', 'parent/fixtures/../fixtures/', '../../');
      testResolve('/proxy/', 'parent//fixtures/../fixtures/', '../../');
    }
    
    context("redirected API maintains relative address") {||
      testResolve('/redirect/', 'double/prefix/', '../../');
    }
    
    test("custom bridgeRoot") {|s|
      var [proxyPort, canonicalPort] = s.ports;
      var url = "http://localhost:#{proxyPort}/canonicalize/bridge.api";
      logging.info("Resolving: #{url}");
      var resolved = bridge.resolve(url);
      resolved.server .. assert.eq("http://example.com/rpc/");
    }
  } // background_session
}.serverOnly();

context("garbage collection") {||
  var singleton = function(a) {
    a.length .. @assert.eq(1, `expected a singleton, got $a`);
    return a[0];
  }
  @test("deletion of published functions") {||
    require(@helper.url('test/integration/fixtures/resource-usage.api')).connect {|api|
      function forceRefreshNumFunctions() {
        global.gc();
        api.ping();
        return api.numFunctions() .. singleton;
      };

      // firstly, test that there's one connection, and generating 100 functions
      // adds 100 published functions on the server side.
      api.numConnections() .. @assert.eq(1);
      var initialFuncs = api.numFunctions() .. singleton;
      initialFuncs .. @assert.number();
      var funcs = api.genFunctions(100);
      @assert.eq(forceRefreshNumFunctions() - initialFuncs, 100);

      // garbage collection should enqueue deletion messages
      // (which will piggyback on the next available poll or command)
      funcs = null;
      @assert.eq(forceRefreshNumFunctions(), initialFuncs);
    }
  }.skipIf(!global.gc, "pass --expose-gc to node if you want to run this test");

  @test("connections are dropped on disconnect") {||
    require(@helper.url('test/integration/fixtures/resource-usage.api')).connect {|api|
      api.numConnections() .. @assert.eq(1);

      require(@helper.url('test/integration/fixtures/resource-usage.api')).connect {|api|
        api.numConnections() .. @assert.eq(2);
      }

      api.numConnections() .. @assert.eq(1);
    }
  }
}.serverOnly();

