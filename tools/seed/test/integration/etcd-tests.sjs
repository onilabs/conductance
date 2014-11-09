@ = require([
  'sjs:test/std',
  'mho:std',
  {id: 'seed:job/etcd', 'name':'etcd'},
]);
@context("etcd") {||
  var client;
  var root = '/__test/';
  var key = k -> k ? root+k : root;

  @test.beforeAll {||
    client = @env.get('etcd');
    @etcd.tryOp( -> client.del(key(), {recursive:true}), [@etcd.err.KEY_NOT_FOUND]);
  }

  ;[true, false] .. @each {|existing|
    @test("changes({recursive:true}) begins from the current time for #{existing?"":"non-"}existing keys") {||
      var k = key('test');
      
      // set & remove previous value
      client.set(k, 'previous value');
      client.set(k, 'previous value');

      if(!existing) client.del(k);

      var changes = [];
      var seen = @Condition();
      var terminal = "final value";
      waitfor {
        client .. @etcd.changes(root, {recursive:true}) .. @each {|c|
          console.log(c);
          changes.push(c.node.value);
          seen.set();
          if (c.node.value == terminal) break;
        }
      } and {
        hold(100);
        client.set(k, "new value 1");
        client.set(k, "new value 2");
        client.set(k, terminal);
      }
      changes .. @assert.eq(['new value 1', 'new value 2', terminal]);
    }
  }

  ;[true, false] .. @each {|existing|
    @test("changes({initial:true}) begins from the current time for #{existing?"":"non-"}existing keys") {||
      var k = key('test');
      
      // set & remove previous value
      client.set(k, 'previous value');
      client.set(k, 'previous value');

      if(!existing) client.del(k);

      var changes = [];
      var seen = @Condition();
      var terminal = "final value";
      waitfor {
        client .. @etcd.changes(k, {initial:true}) .. @each {|c|
          var val = c.node === null ? null : c.node.value;
          changes.push(val);
          seen.set();
          if (val === terminal) break;
        }
      } and {
        hold(100);
        client.set(k, "new value 1");
        client.set(k, "new value 2");
        client.set(k, terminal);
      }
      changes .. @assert.eq([
        existing ? 'previous value' : null,
        'new value 1', 'new value 2', terminal]);
    }
  }

  @test("changes() resumes at the latest value if index falls out of etcd's index range") {||
  }.skip("TODO");
}.serverOnly();
