@ = require('sjs:test/std');
@kv = require('mho:flux/kv');

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
              [1, [2, ['foo', 3]]]
             ];

  objs .. @each {
    |obj|
    db .. @kv.set(obj, 'foo');
    db .. @kv.get(obj) .. @assert.eq('foo');
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

  function setAbort(v) {
    db .. @kv.withTransaction {|db|
      db .. @kv.set(key, v);
      return returnVal;
    }
  }

  setAbort(v1) ..@assert.eq(returnVal);
  db .. @kv.get(key) .. @assert.eq(v2);
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

function test_persistence(info) {
  function all(db) {
    return db ..@kv.query(@kv.RANGE_ALL) ..@toArray;
  }

  @test("persistence") {|s|
    all(s.db) ..@assert.eq([]);

    s.db ..@kv.set('foo', 1);
    s.db ..@kv.set('bar', 2);

    all(s.db) ..@assert.eq([[['bar'], 2], [['foo'], 1]]);

    var encoded = '[\n  [["bar"], 2],\n  [["foo"], 1]\n]';

    if (info.file != null) {
      @fs.readFile(s.path(info.file), 'utf8') ..@assert.eq(encoded);
      var new_db = @kv.LocalDB({ file: s.path(info.file) });

    } else {
      localStorage[info.localStorage] ..@assert.eq(encoded);
      var new_db = @kv.LocalDB({ localStorage: info.localStorage });
    }

    @assert.is(new_db, s.db);
    all(new_db) ..@assert.eq(all(s.db));
  }
}

function test_all() {
  @test("withTransaction") { |s| s.db .. test_transaction }

  // For all these tests, we run them both inside & outside
  // of a transaction block
  ;[
    [null, (s, block) -> block(s.db)],
    ["withTransaction", (s, block) -> s.db .. @kv.withTransaction(block)]
  ] .. @each {|[desc, wrap]|
    @context(desc) {||
      @test("value types") { |s| s .. wrap(test_value_types) }
      @test("key types")   { |s| s .. wrap(test_key_types)   }
      @test("large key")   { |s| s .. wrap(test_large_key)   }
      @test("large value") { |s| s .. wrap(test_large_value) }.serverOnly()
      @test("clear")       { |s| s .. wrap(test_clear)       }
      @test("get")         { |s| s .. wrap(test_get)         }
      @test("range_query") { |s| s .. wrap(test_range_query) }
      @test("reverse_range_query") { |s| s .. wrap(test_reverse_range_query) }
      @test("child_query") { |s| s .. wrap(test_range_query) }
    }
  }
}

//----------------------------------------------------------------------

@context {||
  @context("LocalDB (memory)") {||
    @test.beforeAll {|s|
      s.db = @kv.LocalDB();
    }

    test_all();
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
    test_all();
  }
}.browserOnly();

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
    test_all();
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

    test_all();
  }

}.serverOnly();
