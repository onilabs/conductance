@ = require('sjs:test/std');
@env = require('mho:env');

@context('environment', function() {
  @test('value', function() {
    @env.value('val1', 'one');
    @env.get('val1') .. @assert.eq('one');
    @assert.raises( -> @env.get('val2'));
  });

  @test('factory', function() {
    var val=1;
    @env.factory('val', -> val++);
    @env.get('val') .. @assert.eq(1);
    @env.get('val') .. @assert.eq(2);
  });

  @test('lazy', function() {
    var val=1;
    @env.lazy('val', -> val++);
    @env.get('val') .. @assert.eq(1);
    @env.get('val') .. @assert.eq(1);
  });

  @context('dependencies', function() {
    @test.beforeEach:: function() {
      @env.log = [];

      @env.factory('c', function(reg) {
        reg.get('b') .. @assert.eq('b');
        reg.get('a') .. @assert.eq('a');
        @env.log.push('c');
        return 'c';
      });

      @env.lazy('b', function(reg) {
        reg.get('a') .. @assert.eq('a');
        @env.log.push('b');
        return 'b';
      });

      @env.lazy('a', function(reg) {
        reg.get('v') .. @assert.eq('val');
        @env.log.push('a');
        return 'a';
      });

      @env.value('v', 'val');
    }

    @test('recursive lazy dependencies are evaluated as needed', function() {
      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c']);

      @env.get('a') .. @assert.eq('a');
      @env.get('b') .. @assert.eq('b');
      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c','c']);
    });

    @test('clearCached', function() {
      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c']);

      @env.clearCached();

      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c','a','b','c']);
    });

    @test('clearCached with explicit keys', function() {
      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c']);

      @env.clearCached('c');

      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c','c']);

      @env.clearCached(['b','c']);
      @env.get('c') .. @assert.eq('c');
      @env.log .. @assert.eq(['a','b','c','c','b','c']);
    });

    @test('clearCached on missing key', function() {
      @assert.raises({message: /^Key 'foo' not found in <#Environment.*/}, -> @env.clearCached('foo'));
    });
  });
    
  @test('calling module as a shortcut for get()', function() {
    @env.set('val', 123);
    @env('val') .. @assert.eq(123);
  });

});
