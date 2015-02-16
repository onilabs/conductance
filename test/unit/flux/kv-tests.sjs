@ = require('sjs:test/std');

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

function test_query(db) {
  db .. @kv.clearRange(@kv.RANGE_ALL);

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

//----------------------------------------------------------------------

@context {||
  @kv = require('mho:flux/kv');
    
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

  //----------------------------------------------------------------------
  // LevelDB

  @context("LevelDB") {||
    @test.beforeAll {|s|
      s.db = @kv.LevelDB(s.path('leveldb-test-db'));
    }

    @test.afterAll {|s|
      s.db.close();
    }

    @test("value types") {|s| s.db .. test_value_types() }
    @test("key types") {|s| s.db .. test_key_types() }
    @test("large value") {|s| s.db .. test_large_value() }
    @test("large key") {|s| s.db .. test_large_key() }
    @test("clear") {|s| s.db .. test_clear() }
    @test("get") {|s| s.db .. test_get() }

    @test("query") {|s| s.db .. test_query() }
  }

}.serverOnly();
