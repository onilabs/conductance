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
}

function test_query(db) {
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

  db .. @kv.query({begin:-10, end:5}) .. @toArray .. @assert.eq(kv_pairs.slice(4,8));
  db .. @kv.query({begin:1, end:4}) .. @toArray .. @assert.eq(kv_pairs.slice(4,7));
  db .. @kv.query({begin:2, end:4}) .. @toArray .. @assert.eq(kv_pairs.slice(5,7));
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

    var encoded = '[[[2,98,97,114,0],[1,50]],[[2,102,111,111,0],[1,49]]]';

    if (info.file != null) {
      @fs.readFile(s.path(info.file), 'utf8') ..@assert.eq(encoded);
      var new_db = @kv.Local({ file: s.path(info.file) });

    } else {
      localStorage[info.localStorage] ..@assert.eq(encoded);
      var new_db = @kv.Local({ localStorage: info.localStorage });
    }

    @assert.is(new_db, s.db);
    all(new_db) ..@assert.eq(all(s.db));
  }
}

function test_all() {
  @test("withTransaction") {|s| s.db .. test_transaction() }

  // For all these tests, we run them both inside & outside
  // of a transaction block
  ;[
    [null, (s, block) -> block(s.db)],
    ["withTransaction", (s, block) -> s.db .. @kv.withTransaction(block)]
  ] .. @each {|[desc, wrap]|
    @context(desc) {||
      @test("value types") { |s| s .. wrap(test_value_types) }
      @test("key types")   { |s| s .. wrap(test_key_types)   }
      @test("large value") { |s| s .. wrap(test_large_value) }
      @test("large key")   { |s| s .. wrap(test_large_key)   }
      @test("clear")       { |s| s .. wrap(test_clear)       }
      @test("get")         { |s| s .. wrap(test_get)         }
      @test("query")       { |s| s .. wrap(test_query)       }
    }
  }
}

//----------------------------------------------------------------------

@context {||
  @context("Local (memory)") {||
    @test.beforeAll {|s|
      s.db = @kv.Local();
    }

    test_all();
  }
};

@context {||
  @context("Local (localStorage)") {||
    @test.beforeAll {|s|
      s.db = @kv.Local({ localStorage: 'local-test-db' });
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
    if (!@fs.isDirectory(s.root)) {
      @fs.mkdir(s.root);
    }
    s.path = -> @path.join.apply(null, [s.root].concat(arguments .. @toArray));
  }

  @test.afterAll {|s|
    @childProcess.run('rm', ['-rf', s.root], {stdio:'inherit'});
  }

  @context("Local (file)") {||
    @test.beforeAll {|s|
      s.db = @kv.Local({ file: s.path('local-test-db') });
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

    // This can't be tested by Local db because it takes too long
    @test("large value") {|s| s.db .. test_large_value() }
  }

}.serverOnly();
