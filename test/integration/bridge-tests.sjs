@ = require('sjs:test/std');
@bytes = require('sjs:bytes');
var {test, context, assert, isBrowser} = require('sjs:test/suite');
var helper = @helper = require('../helper');
var bridge = @bridge = require('mho:rpc/bridge');
var { isBridgeError, isTransportError } = bridge;
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

context('bridge error handling', function() {
  var apiid;

  test.beforeAll:: function(s) {
    apiid = apiUrl();
  }

  test('propagates server-side errors', function() {
    assert.raises({filter: e -> !isBridgeError(e) && e.message == "Some error"}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.throwError('Some error');
      }
    };
  });

  test('re-throws client-side errors', function() {
    assert.raises({filter: e -> !isBridgeError(e) && e.message == "Some client error"}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  });

  test('includes server-side stacktrace', function() {
    //XXX should be able to disable this if server filesystem layout is sensitive
    assert.raises({filter: e -> !isBridgeError(e) && e.toString() .. /at file:\/\/.*fixtures\/bridge.api:\d+/.test()}) {||
      bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
        connection.api.callme(function() { throw new Error('Some client error'); });
      }
    };
  });

  var destroyMethods = ['destroyConnection'/*, 'breakConnection'*/];
  destroyMethods .. each {|method|
    var destroy = function(api, log) {
      api[method](50);
      hold(500);
      return api.ping();
    };

    context("destroyed with #{method}", function() {
      test.beforeEach:: function(s) {
        s.log = [];
        s.push = function(obj) {
          logging.info("log.push: #{obj}");
          s.log.push(obj);
        }
      }

      test("throws bridge error", function(s) {
        assert.raises({filter: e -> e .. isTransportError()}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            s.push(connection.api.ping());
            try {
              s.push(connection.api .. destroy());
              s.push("not reached");
            }
            catch(e) {
              s.push('not reached');
              throw e;
            }
            retract {
              s.push('1');
            }
          }
        };

        s.log .. assert.eq([ 'pong', '1']);
      });

      test("error thrown in cancellation", function(s) {
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
      }).skip('does not work with finalization code moved; but should not matter');

      test("retracts all running calls", function(s) {
        // ideally this would not be necessary, but long-running methods invoked
        // by a remote function may never receive a retraction (since the remote cannot send one)
        // To be safe. we abort _all_ running calls when we see a ConnectionError
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            connection.api.callme {||
              try {
                @sys.spawn(function() {
                  hold(200);
                  try {
                    s.push(connection.api .. destroy());
                    s.push('not reached');
                  } catch (e) {
                    assert.truthy(e .. isBridgeError);
                    //assert.eq(e.message, 'session lost');
                    s.push('lingering call exception'); 
                  }
                });
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
      }).skip('does not work with finalization code moved; but should not matter');

      test("retracts all pending calls", function(s) {
        // ideally this would not be necessary, but long-running methods invoked
        // by a remote function may never receive a retraction (since the remote cannot send one)
        // To be safe. we abort _all_ running calls when we see a ConnectionError
        assert.raises({filter: e -> e.message === 'Bridge connection lost'}) {||
          bridge.connect(apiid, {server: helper.getRoot()}) {|connection|
            @sys.spawn(function() {
              hold(200);
              try {
                s.push(connection.api .. destroy());
                s.push('not reached');
              } catch (e) {
                assert.truthy(e .. isBridgeError);
                //assert.eq(e.message, 'session lost');
                s.push('lingering call exception'); 
              }
            });
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
      }).skip('does not work with finalization code moved; but should not matter');
    });
  };

  test('retracts server side execution initiated by client on closed connection', function() {
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      @sys.spawn(function() {
        // call doesn't return before the connection ends (due to `spawn`),
        // which will cause a `session lost` error
        assert.raises({filter: isBridgeError}, ->
          connection.api.detectRetractionAfterDelay(2*MAX_ROUNDTRIP));
      });
      hold(MAX_ROUNDTRIP);
    }
    bridge.connect(apiid, {server: helper.getRoot()}){
      |connection|
      assert.truthy(connection.api.didDetectRetraction());
    }
  });

  test('throws BridgeError when calling client function after closed connection', function() {
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
  });

});

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
  
      

context(function() {
  // common setup to make api module available
  var url,prefix;

  test.beforeAll:: function() {
    url = apiUrl();
    var path = Url.parse(url).relative;
    prefix = path.slice(0, path.indexOf('test/'));
  }

  context('object marshalling', function() {
    test("Stream", function() {
      require(url).connect {|api|
        api.integers(0, 5) .. map(x -> x) .. assert.eq([0,1,2,3,4,5]);
      }
    });

    test("Set", function() {
      require(url).connect {|api|
        api.identity(@Set([1,2,3,'foo'])) .. assert.eq(@Set([1,2,3,'foo']));
      }
    });

    test("Map", function() {
      require(url).connect {|api|
        api.identity(@Map([[1,1],[2,'a'],['foo','bar']])) .. 
          assert.eq(@Map([[1,1],[2,'a'],['foo','bar']]));
      }
    });

    test("ObservableVar", function() {
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
    });

    context("binary data", function() {
      var isPhantomJS = @isBrowser && /PhantomJS/.test(window.navigator.userAgent);
      var noTypedArraySupport = isPhantomJS;
      var noBlobSupport = true; // WE DON'T SUPPORT BLOBS ANY MORE = typeof(Blob) === 'undefined';
      var api;
      var bridge_service; 
      test.beforeAll:: function(s) {
        bridge_service = @runGlobalBackgroundService(bridge.connect, apiUrl(), {server:helper.getRoot()});
        api = bridge_service[0].api;
      }
      test.afterAll:: function(s) { bridge_service[1](); }
      var payload = 'ßɩnɑʀʏ';
      
      test('Buffer ends up as Uint8Array', function() {
        var buf = Buffer.from(payload);
        var rv = api.identity(buf);
        //rv .. Buffer.isBuffer .. @assert.ok(`not a Buffer: $rv`);
        (rv instanceof Uint8Array) .. @assert.ok(`not a Uint8Array: $rv`);
        rv .. @assert.eq(new Uint8Array(buf.buffer, buf.byteOffset, buf.length));
      }).serverOnly().skip("Any Uint8Array (which includes Buffer) will now be become a Buffer on nodejs");
      
      test('Uint8Array', function() {
        var buf = new Uint8Array(@octetsToArrayBuffer(payload .. @utf16ToUtf8));
        var rv = api.identity(new Uint8Array(buf)); // 'new' here, so that we keep buf; bridge might pass ownership otherwise
        (rv instanceof Uint8Array) .. @assert.ok(`not a Uint8Array: $rv`);
        rv .. @arrayBufferToOctets .. @utf8ToUtf16 .. @assert.eq(payload);
        // on nodejs, 'rv' will be a Buffer (supertype of Uint8Array), so
        // the following won't hold:
        // rv .. @assert.eq(buf);
      }).skipIf(noTypedArraySupport)
      
      test('ArrayBuffer ends up as ArrayBuffer', function() {
        var buf = new Uint8Array(@octetsToArrayBuffer(payload .. @utf16ToUtf8)).buffer;
        (buf instanceof ArrayBuffer) .. @assert.ok();
        var rv = api.identity(buf);
        (rv instanceof ArrayBuffer) .. @assert.ok(`not an ArrayBuffer: $rv`);
        rv .. @arrayBufferToOctets .. @utf8ToUtf16 .. @assert.eq(payload);
      }).skipIf(noTypedArraySupport)
      
      test('Blob ends up in the platform\'s preferred format', function() {
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
      }).skipIf(noBlobSupport || isPhantomJS /* PhantomJS Blob implementation is busted */)
    });
  });

  context('returns_and_breaks', function() {
    test('blocklambda_return', function() {
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
    });

    test('blocklambda_return via stratum', function() {
      var rv = 'x';
      function foo(api) {
        api.execViaStratum { ||
          hold(0);
          return 'a';
        }
        assert.fail('not reached');
      }
      require(url).connect() { |api|
        rv = foo(api);
      }
      assert.eq(rv, 'a');
    });

    test('blocklambda_return via detached stratum', function() {
      var rv = 'x';
      function foo(api) {
        try {
          api.execViaDetachedStratum { ||
            hold(0);
            return 'y';
          }
          assert.fail('not reached');
        }
        catch(e) {
          // we should get an 'unroutable' exception
          return 'a';
        }
      }
      require(url).connect() { |api|
        rv = foo(api);
      }
      assert.eq(rv, 'a');
    });

    test('blocklambda_break via stratum', function() {
      var rv = 'x';
      function foo(api) {
        api.execViaStratum { ||
          hold(0);
          break;
          assert.fail('not reached');
        }
        return 'a';
      }
      require(url).connect() { |api|
        rv = foo(api);
      }
      assert.eq(rv, 'a');
    });

    test('blocklambda_return_async', function() {
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
    });


    test('blocklambda_return_slow', function() {
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
    });

    test('blocklambda_break_1', function() {
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
    });

    test('blocklambda_break_2', function() {
      var rv = '';
      require(url).connect() {|api|
        api.integer_stream { |x|
          rv += x;
          if (x === 10) break;
        }
        rv += 'done';
      }
      assert.eq(rv, '012345678910done');
    });

    test('blocklambda_break_async', function() {
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
    });
  });

  context('synchronous_aborting', function() {

    /**

       api.call

       executing_call on our side... we see a break on our side...
       the finally stuff on our side will be handled

     */

    test('async_blbreak_blocking_finally_at_initiator', function() {
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
    });

    test('blbreak_blocking_finally_at_initiator', function() {
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
    });


    test('async_blbreak_blocking_finally_at_intermediate', function() {
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
    });

    test('s_blbreak_blocking_finally_at_intermediate', function() {
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
    });

    test('async_nested_blbreak_blocking_finally_at_intermediate', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          api.blocking_finally(-> (rv+='c','ignore'), block);
          rv += 'y';
        })({ ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    });

    test('async_complicated_nested_blbreak_blocking_finally_at_intermediate', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          var stratum = reifiedStratum.spawn(-> api.blocking_finally(-> (rv+='c','ignore'), block));
          hold();//stratum.wait();
          rv += 'y';
        })({ ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    });

    test('async_nested_blbreak_blocking_finally_finally', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          try {
            api.blocking_finally(-> (rv+='c','ignore'), block);
          }
          finally {
            hold(0);
            rv += 'f';
          }
          rv += 'y';
        })({ ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcfd');
    });


    test('s_nested_blbreak_blocking_finally_at_intermediate', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          api.blocking_finally(-> (rv+='c','ignore'), block);
          rv += 'y';
        })({ ||
          rv += 'a';
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    });

    test('s_nested_blbreak_blocking_finally_finally', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          try {
            api.blocking_finally(-> (rv+='c','ignore'), block);
          }
          finally {
            rv += 'f';
          }
          rv += 'y';
        })({ ||
          rv += 'a';
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcfd');
    });


    //--------------------------------------------------------------
    test('s_blreturn_blocking_finally_at_intermediate', function() {
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
    });
    //--------------------------------------------------------------

    test('async_blreturn_blocking_finally_at_intermediate', function() {
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
    });

    //--------------------------------------------------------------
    test('s_blreturn_blocking_finally_at_intermediate_2', function() {
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
    });
    //--------------------------------------------------------------

    test('async_blreturn_blocking_finally_at_intermediate_2', function() {
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
    });

    test('async_nested_blreturn_blocking_finally_at_intermediate', function() {
      var rv = '';
      require(url).connect() { |api|

        (function() {

          (function(block) {
            api.blocking_finally(-> (rv+='c','ignore'), block);
            rv += 'y';
          })({ ||
            rv += 'a';
            hold(10);
            rv += 'b';
            return;
            rv += 'x';
          });
          rv += 'z';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abcd');
    });

    test('async_nested_blreturn_blocking_finally_at_intermediate_2', function() {
      var rv = '';
      require(url).connect() { |api|

        (function() {
          
          (function() {
            api.blocking_finally(-> (rv+='c','ignore'), { ||
              rv += 'a';
              hold(10);
              rv += 'b';
              return;
              rv += 'x';
            });
            rv += 'y';
          })();
          rv += 'z';
        })();
        rv += 'd';
      }
      assert.eq(rv, 'abczd');
    });

    test('async_complicated_nested_blreturn_blocking_finally_at_intermediate', function() {
      var rv = '';
      function test() {
        require(url).connect() { |api|
          
          (function(block) {
            var stratum = reifiedStratum.spawn(-> api.blocking_finally(-> (rv+='c','ignore'), block));
            hold();//stratum.wait();
            rv += 'y';
          })({ ||
            rv += 'a';
            hold(10);
            rv += 'b';
            return 'r';
            rv += 'x';
          });
          rv += 'd';
        }
        rv += 'e';
      }
      rv += test();
      assert.eq(rv, 'abcr');
    });

    test('blreturn_across_nested_bridge_calls', function() {
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
    });

    test('blreturn_across_nested_spawned_bridge_calls', function() {
      var rv = '';

      function spawn_and_wait(id, block) {
        try {
          reifiedStratum.spawn(block).wait();
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
    });

    test('blbreak_across_nested_spawned_bridge_calls', function() {
      var rv = '';

      function spawn_and_wait(id, block) {
        try {
          reifiedStratum.spawn(block).wait();
        }
        finally {
          rv += id;
        }
      }

      function test() {
        require(url).connect() { |api|

          (function(blk) {
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
          })({
            ||
            hold(10);
            rv += '*';
            break;
          });

          return 'R';
        }
      }

      rv += test();
      assert.eq(rv, '*gGiIoOR');
    });


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
    test('async_complicated_nested_blbreak_blocking_finally_at_intermediate_throw', function() {
      var rv = '';
      require(url).connect() { |api|

        (function(block) {
          var stratum = @sys.spawn(-> api.blocking_finally(function() { rv+='c'; throw new Error('finalizer_throw');}, block));
          try {
            stratum.capture();
          }
          catch(e) { assert.eq(String(e).split('\n')[0], 
                               'Error: finalizer_throw'); 
                     rv += 'C'; }
          finally {
            rv += 'f';
          }
          rv += 'y';
        })({ ||
          rv += 'a';
          hold(10);
          rv += 'b';
          break;
          rv += 'x';
        });
        rv += 'd';
      }
      assert.eq(rv, 'abcCfyd');
    });

    //----------------------------------------------------------------------
    test('blklambda break in abort-finally', function() {
      // This test used to hang
      require(url).connect() { |api|
        // have the other side call and abort f, but not return itself...
        // only the 'break' will abort the outer call
        api.callAbortHold { ||
          try { 
            hold();
          }
          finally {
            // this `break` should bail out of the callAbortHold
            break; 
          }
        }
      }
    });

    test('blklambda return in abort-finally', function() {
      // This test used to hang
      function foo() {
        require(url).connect() { |api|
          // have the other side call and abort f, but not return itself...
          // only the 'return' will abort the outer call
          api.callAbortHold { ||
            try { 
              hold();
            }
            finally {
              // this `return` should bail out of the callAbortHold
              return 'xxx'; 
            }
          }
          return 'yyy';
        }
        return 'zzz';
      }
      assert.eq(foo(), 'xxx');
    });

    test('exception in abort-finally', function() {
      // This test used to hang
      function foo() {
        require(url).connect() { |api|
          // have the other side call and abort f, but not return itself...
          // only the exception will abort the outer call
          api.callAbortHold { ||
            try { 
              hold();
            }
            finally {
              // this exception should bail out of the callAbortHold
              throw 'xxx';
            }
          }
          return 'yyy';
        }
        return 'zzz';
      }
      var rv;
      try { rv = foo() } catch(e) { 
        rv = e;
      }
      assert.eq(rv, 'xxx');
    });
  });

  context('api modules', function() {

    test('returns API', function() {
      var rv;
      require(url).connect(a -> rv = a.ping());
      rv .. assert.eq('pong');
    });

    test('reestablishes connection', function() {
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
          assert.raises({filter: isBridgeError}, -> ping());
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
    }).skip("Currently aborts entire connection, to err on safe side (workaround for uncaught errors in strata)");

    test("serves .api from relative directory", function() {
      // hello.api is configured to be served from "./test",
      // not cwd() + '/test':
      require(helper.url('hello.api')).connect {|api|
        api.hello() .. assert.eq("world!");
      }
    });


    context('multiple clients', function() {
      var driver = require('sjs:xbrowser/driver');
      var { Driver } = driver;

      test.beforeEach(function(s) {
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
      });

      test.afterEach(function(s) {
        s.drivers .. each (function(c) {
          console.log("END OF client");
        });
        s.drivers .. each(d -> d.__finally__());
      });

    }).browserOnly().timeout(15);
  });
});

context("non-root locations", function() {
    test.beforeAll:: function(s) {
      s.server = @runGlobalBackgroundService(function(scope) {
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
    }
    
    test.afterAll(function(s) {
      s.server[1](); // terminate server
    });
    
    var testResolve = function(dest, path, expectedRelative) {
      return test(dest + path, function(s) {
        var port = s.ports[0];
        var url = "http://localhost:#{port}#{dest}#{path}bridge.api";
        logging.info("Resolving: #{url}");
        var resolved = bridge.resolve(url);
        resolved.server .. assert.eq("http://localhost:#{port}#{dest}");
        
        var expected = "http://localhost:#{port}#{dest}";
        @url.normalize(resolved.root, url) .. @assert.eq(expected);
        resolved.root .. assert.eq(expectedRelative);
      });
    }
    
    context("proxied API maintains relative address", function() {
      testResolve('/proxy/', '', './');
      testResolve('/proxy/', 'double/prefix/', '../../');
      testResolve('/proxy/', 'nested/prefix/', '../../');
      testResolve('/proxy/', 'nested-prefix-', './');
      testResolve('/proxy/', 'nested-dir-prefix/', '../');
      testResolve('/proxy/', 'parent/fixtures/', '../../');
      
      // non-canonical URLs are unlikely, but can probably happen:
      testResolve('/proxy/', 'parent/fixtures/../fixtures/', '../../');
      testResolve('/proxy/', 'parent//fixtures/../fixtures/', '../../');
    });
    
    context("redirected API maintains relative address", function() {
      testResolve('/redirect/', 'double/prefix/', '../../');
    });
    
    test("custom bridgeRoot", function(s) {
      var [proxyPort, canonicalPort] = s.ports;
      var url = "http://localhost:#{proxyPort}/canonicalize/bridge.api";
      logging.info("Resolving: #{url}");
      var resolved = bridge.resolve(url);
      resolved.server .. assert.eq("http://example.com/rpc/");
    });
}).serverOnly();

context("garbage collection", function() {
  var singleton = function(a) {
    a.length .. @assert.eq(1, `expected a singleton, got $a`);
    return a[0];
  }
  @test("deletion of published functions", function() {
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
  }).skipIf(!global.gc, "pass --expose-gc to node if you want to run this test");

  @test("connections are dropped on disconnect", function() {
    require(@helper.url('test/integration/fixtures/resource-usage.api')).connect {|api|
      api.numConnections() .. @assert.eq(1);
      require(@helper.url('test/integration/fixtures/resource-usage.api')).connect {|api|
        api.numConnections() .. @assert.eq(2);
      }
      // give other side a chance to close:
      hold(100);
      api.numConnections() .. @assert.eq(1);
    }
  });
}).serverOnly();

