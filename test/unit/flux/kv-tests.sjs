@ = require('sjs:test/std');
@kv = require('mho:flux/kv');
@withServiceScope = require('sjs:service').withServiceScope;

// helper function to get all the keys/values from a db
function all(db) {
  return db ..@kv.query(@kv.RANGE_ALL) ..@toArray;
}

//----------------------------------------------------------------------
// common test implementations to be tested on every db backend:

function test_value_types(db) {
  var objs = [1, 100, 3.14, 'test string',
              {a: 1, b: { c: 'foo' }},
              null,
              [1,2,3],
              [1,2, {a: [4,5], b: 'foo'}]
             ];

  objs .. @each {
    |obj|
    db .. @kv.set('foo', obj);
    db .. @kv.get('foo') .. @assert.eq(obj);
  }
}

function test_key_types(db) {
  var objs = [1, 100, 'test string',
              [1,2,3],
              [1,2, 'foo'],
              [1, [2, ['foo', 3]]],
              null,
              0,
              [0,1],
              'null',
              [null, 1]
             ];

  objs .. @indexed .. @each {
    |[i,obj]|
    db .. @kv.set(obj, i);
  }
  objs .. @indexed .. @each {
    |[i,obj]|
    db .. @kv.get(obj) .. @assert.eq(i);
  }
}

function test_large_value(db) {
  // array with 1M integers:
  __js {  var obj = new Array(1000*1000);
          for (var i=0; i<1000*1000; ++i)
            obj[i] = i;
       }
  db .. @kv.set('foo', obj);
  db .. @kv.get('foo') .. @assert.eq(obj);
}

function test_large_key(db) {
  // array with 10OK integers:
  __js {  var obj = new Array(1000*100);
          for (var i=0; i<1000*100; ++i)
            obj[i] = i;
       }
  db .. @kv.set(obj, 'foo');
  db .. @kv.get(obj) .. @assert.eq('foo');
}

function test_clear(db) {
  db .. @kv.set('foo', 'bar');
  db .. @kv.get('foo') .. @assert.eq('bar');
  db .. @kv.clear('foo');
  db .. @kv.get('foo', undefined) .. @assert.eq(undefined);
}

function test_get(db) {
  var err = @assert.raises(-> db .. @kv.get('foo'));
  err .. @kv.isNotFound .. @assert.ok();
}

function test_transaction(db) {
  var key = "foo";
  var v1 = "firstVal";
  var v2 = "secondVal";
  db .. @kv.set(key, v1);
  db .. @kv.get(key) .. @assert.eq(v1);

  var returnVal = "returnVal";

  function set(v){
    return db .. @kv.withTransaction(function(db) {
      db .. @kv.set(key, v);
      return returnVal;
    });
  }
  set(v2) .. @assert.eq(returnVal);
  db .. @kv.get(key) .. @assert.eq(v2);

  // this should abort the transaction, since we're exiting via a blocklambda return
  function setAbort(v) {
    db .. @kv.withTransaction {|db|
      db .. @kv.set(key, v);
      return returnVal;
    }
  }

  setAbort(v1) ..@assert.eq(returnVal);
  db .. @kv.get(key) .. @assert.eq(v2);


  db ..@kv.withTransaction(function (db2) {
    db2 ..@assert.isNot(db);
    db2 ..@kv.withTransaction(function (db3) {
      db3 ..@assert.is(db2);
      db3 ..@kv.withTransaction(function (db4) {
        db4 ..@assert.is(db3);
      });
    });
  });
}



/*
  NOTE: This function is a candidate for inclusion in the kv interface, if we find that it is useful.
  We could expand the normal `query` api by passing to `tx_query` when `range` is a function.
  
*/
function tx_query(db, range_f) {
  return @Stream(function(r) {

    var OpenStream;

    @withServiceScope {
      |service_scope|
      db .. @kv.withTransaction(function(tx) {
        if (OpenStream) {
          // the transaction has failed and we're being called again.
          // clean up the old open stream:
          OpenStream.stop();
        }
        var range = range_f(tx);
        OpenStream = service_scope.attach(@withOpenStream, db .. @kv.query(range));
        // it is important that we USE the open stream here, instead of just initializing,
        // to ensure that it is actually 'running':
        OpenStream.use({||});
      });
      // if we end up here, we have a transactional open stream:
      OpenStream.use {
        |open_stream|
        open_stream .. @each(r);
      }
    }
  });
}

function tx_query_tweaked(db, range_f) {
  return @Stream(function(r) {

    var OpenStream;

    @withServiceScope {
      |service_scope|
      db .. @kv.withTransaction(function(tx) {
        if (OpenStream) {
          // the transaction has failed and we're being called again.
          // clean up the old open stream:
          OpenStream.stop();
        }
        var range = range_f(tx);
        //console.log('got range:', range .. @inspect);
        OpenStream = service_scope.attach(@withOpenStream, db .. @kv.query(range));
        hold(10);
        OpenStream.use({||});
        hold(10);
      });

      // mimick some outside modifications here; these should not affect the open query:
      db .. @kv.set('start', 10);
      db .. @kv.set('end', 33);
      @integers(1) .. @take(20) .. @each { |x| db .. @kv.set(x, x+55); }  
      
      hold(100);
      
      // if we end up here, we have a transactional open stream:
      OpenStream.use {
        |open_stream|
        open_stream .. @each(r);
      }
    }
  });
}

function test_transactional_query(db) {
  // test a query that is snapshotted to a particular consistent view of the db, not just
  // a snapshot at the time.

  db .. @kv.clearRange(@kv.RANGE_ALL);

  @integers(1) .. @take(12) .. @each { |x| db .. @kv.set(x, x); }
  db .. @kv.set('start', 1); db .. @kv.set('end', 20);

  var transaction_pass = 0;

  var Q = db .. tx_query_tweaked(function(tx) {
      ++transaction_pass;

      var start = tx .. @kv.get('start');
      var end = tx .. @kv.get('end');
      
      if (transaction_pass == 1) {
        // mimick an outside modification:
        // note that we're using 'db' here, and not 'tx':
        db .. @kv.set('end', 25);
        hold(100); // transaction will be retried here
      }
      else if (transaction_pass == 2) {
        db .. @kv.set('end', 11);
        // no `hold(0)`... tx will be retried after this function returns and after actual query in
        // tx_query has already been initialized (it will be closed, though, and a new one started).
      }
      
      return {begin:start, end:end};
  });
  
  Q .. @withOpenStream { |q|
    q .. @first .. @assert.eq([[1],1]);
    // some more 'outside' modifications, to check that these don't affect our stable 
    // snapshot:
    db .. @kv.set('start', 28);
    db .. @kv.set('end', 30);
    @integers(1) .. @take(20) .. @each { |x| db .. @kv.set(x, x+42); }
    // now test that we get what we expect:
    q .. @toArray .. @assert.eq(@integers(2) .. @take(9) .. @map(x->[[x],x]));
    q .. @toArray .. @assert.eq([]);
  }

  @assert.eq(transaction_pass, 3);

}

function test_range_query(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  db .. @kv.query(@kv.RANGE_ALL) .. @toArray .. @assert.eq([]);

  var kv_pairs = [ 'a', 'b', 'c', 'd', 1, 2, 3, 4 ] .. @indexed .. @map([i,x] -> [[x], i]);
  kv_pairs .. @each {
    |[key, val]|
    db .. @kv.set(key, val);
  }
  db .. @kv.query({begin:'a', end:'e'}) .. @toArray .. @assert.eq(kv_pairs.slice(0,4));
  db .. @kv.query({begin:'a', end:'d'}) .. @toArray .. @assert.eq(kv_pairs.slice(0,3));
  db .. @kv.query({begin:'b', end:'d'}) .. @toArray .. @assert.eq(kv_pairs.slice(1,3));

  db .. @kv.query({begin:'a', end:'e'}, {limit:1}) .. @toArray .. @assert.eq(kv_pairs.slice(0,1));

  db .. @kv.query({begin:-10, end:5}) .. @toArray .. @assert.eq(kv_pairs.slice(4,8));
  db .. @kv.query({begin:1, end:4}) .. @toArray .. @assert.eq(kv_pairs.slice(4,7));
  db .. @kv.query({begin:2, end:4}) .. @toArray .. @assert.eq(kv_pairs.slice(5,7));

  db .. @kv.query(@kv.RANGE_ALL) .. @toArray .. @assert.eq(kv_pairs);

  db .. @kv.query({begin: 'a'}) .. @toArray .. @assert.eq(kv_pairs);

  db .. @kv.query({after: 1}) .. @toArray .. @assert.eq(kv_pairs.slice(5,8));

  var EOF = {};

  db ..@kv.query(@kv.RANGE_ALL) .. @consume(EOF, function (next) {
    db .. @kv.clearRange(@kv.RANGE_ALL);

    db ..@kv.set(['a'], 1);
    db ..@kv.set(['b'], 2);

    next() ..@assert.eq([['a'], 1]);
    next() ..@assert.eq([['b'], 2]);
  });

  db ..@kv.query(@kv.RANGE_ALL) .. @consume(EOF, function (next) {
    db .. @kv.clearRange(@kv.RANGE_ALL);

    db ..@kv.set(['a'], 1);
    db ..@kv.set(['b'], 2);

    db ..@kv.clear(['a']);

    next() ..@assert.eq([['b'], 2]);
    next() ..@assert.is(EOF);
  });

   db ..@kv.query(@kv.RANGE_ALL) .. @consume(EOF, function (next) {
    db .. @kv.clearRange(@kv.RANGE_ALL);

    db ..@kv.set(['a'], 1);
    next() ..@assert.eq([['a'], 1]);

    db ..@kv.set(['b'], 2);
    next() ..@assert.is(EOF);
  });

  db ..@kv.query(@kv.RANGE_ALL) .. @consume(EOF, function (next) {
    db .. @kv.clearRange(@kv.RANGE_ALL);

    db ..@kv.set(['a'], 1);
    db ..@kv.set(['b'], 2);

    next() ..@assert.eq([['a'], 1]);

    db ..@kv.clear(['b']);
    next() ..@assert.eq([['b'], 2]);
  });
}

function test_reverse_range_query(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  var kv_pairs = [ 'a', 'b', 'c', 'd', 1, 2, 3, 4 ] .. @indexed .. @map([i,x] -> [[x], i]);

  kv_pairs .. @each {
    |[key, val]|
    db .. @kv.set(key, val);
  }
  db .. @kv.query({begin:'a', end:'e'}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(0,4) .. @reverse);
  db .. @kv.query({begin:'a', end:'d'}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(0,3) .. @reverse);
  db .. @kv.query({begin:'b', end:'d'}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(1,3) .. @reverse);


  db .. @kv.query({begin:-10, end:5}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(4,8) .. @reverse);
  db .. @kv.query({begin:1, end:4}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(4,7) .. @reverse);
  db .. @kv.query({begin:2, end:4}, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs.slice(5,7) .. @reverse);

  db .. @kv.query({begin:'a', end:'e'}, {reverse:true, limit:2}) .. @toArray .. @assert.eq(kv_pairs.slice(2,4) ..@reverse);

  db .. @kv.query(@kv.RANGE_ALL, {reverse: true}) .. @toArray .. @assert.eq(kv_pairs .. @clone .. @reverse);
}

// Test that range queries are 'snapshotted' to the time that they are executed:
function test_concurrent_mod_and_query(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  db .. @kv.query(@kv.RANGE_ALL) .. @toArray .. @assert.eq([]);

  var EOF = {};
  db ..@kv.query(@kv.RANGE_ALL) .. @consume(EOF, function (next) {
    db .. @kv.clearRange(@kv.RANGE_ALL);

    @integers(1) .. @take(50) .. @each { |i| db .. @kv.set(i, i) }

    next() ..@assert.eq([[1], 1]);

    @integers(1) .. @take(10) .. @each { |i| db .. @kv.set(i+40, i+40) }

    @integers(1) .. @take(49) .. @each { |i| next() .. @assert.eq([[i+1], i+1]) }

    next() ..@assert.is(EOF);
  });


}

function test_child_query(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  var kv_pairs = [['a','a', 1], ['a','a',2],['a','b',1], [1,1,1], [1,2,1], [1,11,1], [11,1], [11,1,1]] .. @indexed .. @map([i,x] -> [x,i]);

  kv_pairs .. @each {
    |[k,v]| db .. @kv.set(k,v);
  }

  db .. @kv.query('a') .. @map([k,v] -> k) .. @assert.eq([['a', 'a', 1], ['a', 'a', 2], ['a', 'b', 1]]);
  db .. @kv.query(['a','a']) .. @map([k,v] -> k) .. @assert.eq([['a', 'a', 1], ['a', 'a', 2]]);
  db .. @kv.query(['a','b']) .. @map([k,v] -> k) .. @assert.eq([['a', 'b', 1]]);
  db .. @kv.query(['a','a', 1]) .. @map([k,v] -> k) .. @assert.eq([]);
  db .. @kv.query(['a','a', 3]) .. @map([k,v] -> k) .. @assert.eq([]);
  db .. @kv.query(['1']) .. @map([k,v] -> k) .. @assert.eq([]);
  db .. @kv.query([1]) .. @map([k,v] -> k) .. @assert.eq([[1,1,1], [1,2,1], [1,11,1]]);
  db .. @kv.query([1,1]) .. @map([k,v] -> k) .. @assert.eq([[1,1,1]]);
}

function test_nested_transactions(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  // test that mutations from nested transactions only become visible
  // when the *outermost* transaction is done

  var inner_done;
  waitfor {
    waitfor () { inner_done = resume }
    db .. @kv.get('foo', 'undefined') .. @assert.eq('undefined');
  }
  and {
    db .. @kv.withTransaction {
      |outer|
      outer .. @kv.withTransaction {
        |inner|
        inner .. @kv.set('foo', 42);
      }
      inner_done();
      hold(100);
    }
    db .. @kv.get('foo', 'undefined') .. @assert.eq(42);
  }
}

function test_persistence(info) {
  @test("persistence") {|s|
    all(s.db) ..@assert.eq([]);

    s.db ..@kv.set('foo', 1);
    s.db ..@kv.set('bar', 2);

    all(s.db) ..@assert.eq([[['bar'], 2], [['foo'], 1]]);

    var expected = '[\n  [["bar"], 2],\n  [["foo"], 1]\n]';

    if (info.file != null) {
      @fs.readFile(s.path(info.file), 'utf8') ..@assert.eq(expected);

    }
    else if (info.string != null) {
      info.string .. @current .. @assert.eq(expected);
    }
    else {
      localStorage[info.localStorage] ..@assert.eq(expected);
    }
  }
}

function test_equal(db, new_db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

  var expected1 = [];
  all(db) ..@assert.eq(expected1);
  all(new_db) ..@assert.eq(expected1);

  db ..@kv.set('quxcorge', 5);

  var expected2 = [[['quxcorge'], 5]];
  all(db) ..@assert.eq(expected2);
  all(new_db) ..@assert.eq(expected2);
}

function test_subspace() {
  @context("subspace") {||
    @test("init") {|s|
      all(s.db) ..@assert.eq([]);
      all(s.raw) ..@assert.eq([]);

      s.raw ..@kv.set('foo', 20);

      s.db ..@kv.set('foo', 1);
      s.db ..@kv.set(['foo', 'bar'], 2);

      s.db ..@kv.withTransaction(function (db) {
        db ..@kv.set('qux', 3);
      });

      s.db ..@kv.withTransaction(function (db) {
        db ..@kv.withTransaction(function (db) {
          db ..@kv.set('corge', 4);
        });
      });
    }

    @test("query") {|s|
      all(s.db) ..@assert.eq([[['corge'], 4],
                              [['foo'], 1],
                              [['foo', 'bar'], 2],
                              [['qux'], 3]]);

      all(s.raw) ..@assert.eq([[['foo'], 20],
                               [['foobar', 0, 'corge'], 4],
                               [['foobar', 0, 'foo'], 1],
                               [['foobar', 0, 'foo', 'bar'], 2],
                               [['foobar', 0, 'qux'], 3]]);

      s.db ..@kv.query({
        begin: 'foo',
        end: 'qux'
      }) ..@toArray ..@assert.eq([[['foo'], 1], [['foo', 'bar'], 2]]);

      s.raw ..@kv.query({
        begin: ['foobar', 0, 'foo'],
        end: ['foobar', 0, 'qux']
      }) ..@toArray ..@assert.eq([[['foobar', 0, 'foo'], 1], [['foobar', 0, 'foo', 'bar'], 2]]);

      s.db ..@kv.query('foo') ..@toArray ..@assert.eq([[['foo', 'bar'], 2]]);

      s.raw ..@kv.query('foobar') ..@toArray ..@assert.eq([[['foobar', 0, 'corge'], 4],
                                                           [['foobar', 0, 'foo'], 1],
                                                           [['foobar', 0, 'foo', 'bar'], 2],
                                                           [['foobar', 0, 'qux'], 3]]);
    }

    @test("get") {|s|
      s.db ..@kv.get('foo') ..@assert.eq(1);
      s.db ..@kv.get(['foo', 'bar']) ..@assert.eq(2);
      s.db ..@kv.get('qux') ..@assert.eq(3);
      s.db ..@kv.get('corge') ..@assert.eq(4);

      s.raw ..@kv.get(['foobar', 0, 'foo']) ..@assert.eq(1);
      s.raw ..@kv.get(['foobar', 0, 'foo', 'bar']) ..@assert.eq(2);
      s.raw ..@kv.get(['foobar', 0, 'qux']) ..@assert.eq(3);
      s.raw ..@kv.get(['foobar', 0, 'corge']) ..@assert.eq(4);
    }

    @test("sub-subspace") {|s|
      var sub = @kv.Subspace(s.db, 'nou');

      sub ..@kv.set('foo', 10);

      sub ..@kv.withTransaction(function (db) {
        db ..@kv.set('bar', 20);
      });

      sub ..@kv.withTransaction(function (db) {
        db ..@kv.withTransaction(function (db) {
          db ..@kv.set('qux', 30);
        });
      });

      sub ..@kv.get('foo') ..@assert.eq(10);
      sub ..@kv.get('bar') ..@assert.eq(20);
      sub ..@kv.get('qux') ..@assert.eq(30);

      all(sub) ..@assert.eq([[['bar'], 20],
                             [['foo'], 10],
                             [['qux'], 30]]);

      all(s.db) ..@assert.eq([[['corge'], 4],
                              [['foo'], 1],
                              [['foo', 'bar'], 2],
                              [['nou', 'bar'], 20],
                              [['nou', 'foo'], 10],
                              [['nou', 'qux'], 30],
                              [['qux'], 3]]);

      all(s.raw) ..@assert.eq([[['foo'], 20],
                               [['foobar', 0, 'corge'], 4],
                               [['foobar', 0, 'foo'], 1],
                               [['foobar', 0, 'foo', 'bar'], 2],
                               [['foobar', 0, 'nou', 'bar'], 20],
                               [['foobar', 0, 'nou', 'foo'], 10],
                               [['foobar', 0, 'nou', 'qux'], 30],
                               [['foobar', 0, 'qux'], 3]]);
    }
  }
}

function test_encryption() {
  @context("encryption") {||
    @test("init") {|s|
      all(s.db) ..@assert.eq([]);
      all(s.raw) ..@assert.eq([]);

      s.db ..@kv.set('foo', 1);
      s.db ..@kv.set('bar', 2);

      var expected = [[['bar'], 2], [['foo'], 1]];
      all(s.db) ..@assert.eq(expected);
      all(s.raw) ..@assert.notEq(expected);
    }

    @test("same value") {|s|
      var enc_foo = s.db ..@kv.get('foo');
      var raw_foo = s.raw ..@kv.get('foo');

      enc_foo ..@assert.eq(1);
      raw_foo ..@assert.notEq(1);

      s.db ..@kv.set('foo', 1);

      s.db ..@kv.get('foo') ..@assert.eq(enc_foo);
      s.raw ..@kv.get('foo') ..@assert.notEq(enc_foo);
      s.raw ..@kv.get('foo') ..@assert.notEq(raw_foo);
    }

    @test("same password") {|s|
      var new_db = @kv.Encrypted(s.raw, { password: 'foobar' });

      new_db ..@kv.get('foo') ..@assert.eq(1);
    }

    @test("different password") {|s|
      var new_db = @kv.Encrypted(s.raw, { password: 'different_password' });

      @assert.raises(-> new_db ..@kv.get('foo'));
    }

    @test("transactions") {|s|
      s.db ..@kv.set('foo', 5);

      var foo = s.db ..@kv.withTransaction(function (db) {
        return db ..@kv.get('foo');
      });

      foo ..@assert.eq(5);

      s.db ..@kv.withTransaction(function (db) {
        db ..@kv.get('foo') ..@assert.eq(5);
        db ..@kv.set('foo', 10);
      });

      s.db ..@kv.get('foo') ..@assert.eq(10);

      s.db ..@kv.withTransaction(function (db) {
        db ..@kv.withTransaction(function (db) {
          db ..@kv.get('foo') ..@assert.eq(10);
          db ..@kv.set('foo', 15);
        });
      });

      s.db ..@kv.get('foo') ..@assert.eq(15);
      s.raw ..@kv.get('foo') ..@assert.notEq(15);
    }
  }
}

function test_all(new_db) {
  @test("withTransaction") { |s| s.db .. test_transaction }
  @test("equal")           { |s| s.db .. test_equal(new_db(s)) }
  @test("transactionalquery") { |s| s.db .. test_transactional_query }

  // For all these tests, we run them both inside & outside
  // of a transaction block
  ;[
    ["outside of transaction", (s, block) -> block(s.db)],
    ["withTransaction", (s, block) -> s.db .. @kv.withTransaction(block)],
    ["withTransaction^2", (s, block) -> s.db ..@kv.withTransaction(db -> db ..@kv.withTransaction(block))]
  ] .. @each {|[desc, wrap]|
    @context(desc) {||
      @test("value types") { |s| s .. wrap(test_value_types) }
      @test("key types")   { |s| s .. wrap(test_key_types)   }
      @test("large key")   { |s| s .. wrap(test_large_key)   }
      @test("large value") { |s| s .. wrap(test_large_value) }.serverOnly()
      @test("clear")       { |s| s .. wrap(test_clear)       }
      @test("get")         { |s| s .. wrap(test_get)         }
      @test("range_query") { |s| s .. wrap(test_range_query) }
      @test("concurrent_mod_and_query") { |s| s .. wrap(test_concurrent_mod_and_query) }
      @test("reverse_range_query") { |s| s .. wrap(test_reverse_range_query) }
      @test("child_query") { |s| s .. wrap(test_child_query) }
      @test("nested transactions") { |s| s .. wrap(test_nested_transactions) }.skip("TODO")
    }
  }
}

//----------------------------------------------------------------------

@context {||
  @context("LocalDB (memory)") {||
    @test.beforeAll {|s|
      s.db = @kv.LocalDB();
    }

    test_all(s -> s.db);
  }

  @context("Encrypted (memory)") {||
    @test.beforeAll {|s|
      s.raw = @kv.LocalDB();
      s.db = @kv.Encrypted(s.raw, { password: 'foobar' });
    }

    test_encryption();
    test_all(s -> s.db);
  }

  @context("Subspace") {||
    @test.beforeAll {|s|
      s.raw = @kv.LocalDB();
      s.db = @kv.Subspace(s.raw, ['foobar', 0]);
    }

    test_subspace();
    test_all(s -> @kv.Subspace(s.raw, ['foobar', 0]));
  }
};

@context {||
  @context("LocalDB (localStorage)") {||
    @test.beforeAll {|s|
      s.db = @kv.LocalDB({ localStorage: 'local-test-db' });
    }

    @test.afterAll {|s|
      delete localStorage['local-test-db'];
    }

    test_persistence({ localStorage: 'local-test-db' });
    test_all(s -> @kv.LocalDB({ localStorage: 'local-test-db' }));
  }

  @context("Encrypted (localStorage)") {||
    @test.beforeAll {|s|
      s.raw = @kv.LocalDB({ localStorage: 'encrypted-test-db' });
      s.db = @kv.Encrypted(s.raw, { password: 'foobar' });
    }

    @test.afterAll {|s|
      delete localStorage['encrypted-test-db'];
    }

    test_encryption();
    test_all(s -> @kv.Encrypted(s.raw, { password: 'foobar' }));
  }
}.browserOnly();

@context {||
  var obs = @ObservableVar('');
  @context("LocalDB (string)") {||
    @test.beforeAll {|s|
      obs.set('');
      s.db = @kv.LocalDB({ string: obs });
    }

    test_persistence({ string: obs });
    test_all(s -> /*@kv.LocalDB({ string: obs })*/s.db); // XXX two dbs with same 'string=obs' are **not** the same db (yet - maybe this behavior will be changed at some point)
  }
}

@test("LocalDB readonly") {||
  var db = @kv.LocalDB({readonly: true});
  @assert.raises(-> db .. @kv.set('foo', 'bar'));
}

@context {||
  @test.beforeAll {|s|
    s.root = @path.join(process.env['TEMPDIR'] || process.env['TEMP'] || '/tmp', 'sjs-fs-tests');

    // TODO code duplication with afterAll
    @childProcess.run('rm', ['-rf', s.root], {stdio:'inherit'});

    if (!@fs.isDirectory(s.root)) {
      @fs.mkdir(s.root);
    }
    s.path = -> @path.join.apply(null, [s.root].concat(arguments .. @toArray));
  }

  @test.afterAll {|s|
    @childProcess.run('rm', ['-rf', s.root], {stdio:'inherit'});
  }

  @context("LocalDB (file)") {||
    @test.beforeAll {|s|
      s.db = @kv.LocalDB({ file: s.path('local-test-db') });
    }

    test_persistence({ file: 'local-test-db' });
    test_all(s -> @kv.LocalDB({ file: s.path('local-test-db') }));
  }

  @context("Encrypted (file)") {||
    @test.beforeAll {|s|
      s.raw = @kv.LocalDB({ file: s.path('encrypted-test-db') });
      s.db = @kv.Encrypted(s.raw, { password: 'foobar' });
    }

    test_encryption();
    test_all(s -> @kv.Encrypted(s.raw, { password: 'foobar' }));
  }

  //----------------------------------------------------------------------
  // LevelDB

  @context("LevelDB") {||
    @test.beforeAll {|s|
      s.db = @kv.LevelDB(s.path('leveldb-test-db'));
    }

    @test.afterAll {|s|
      s.db.close();
    }

    // TODO test that opening the same location twice results in equal dbs
    test_all(s -> s.db);
  }

}.serverOnly();

