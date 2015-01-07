@ = require('sjs:test/std');

@context {||
  var { @TemporaryFile} = require('sjs:nodejs/tempfile');
  @env = require('mho:env');
  @test("bundle") {||
    @TemporaryFile {|{path, file}|
      @fs.close(file);
      @fs.unlink(path);
      @childProcess.run(process.execPath, [
        @env.executable,
        'bundle',
        'mho:std',
        '--output', path], {stdio:'inherit'});
      path .. @fs.exists .. @assert.ok();
    }
  }
}.serverOnly();
