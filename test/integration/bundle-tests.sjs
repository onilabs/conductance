@ = require('sjs:test/std');

@context(function() {
  var { @TemporaryFile} = require('sjs:nodejs/tempfile');
  @env = require('mho:env');
  @test("bundle", function() {
    @TemporaryFile {|{path, close}|
      close();
      @fs.unlink(path);
      @childProcess.run(process.execPath, [
        @env.executable,
        'bundle',
        'mho:std',
        '--output', path], {stdio:'inherit'});
      path .. @fs.exists .. @assert.ok();
    }
  });
}).serverOnly();
