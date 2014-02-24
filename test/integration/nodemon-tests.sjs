@ = require('sjs:test/std');
@env = require('mho:env');

@context{||

  var base = @url.normalize('./fixtures/nodemon', module.id) .. @url.toPath;
  var expectStarts = function(proc, expected, block) {
    var restarts = 0;
    var restarted = @Emitter();
    waitfor {
      var data;
      while(true) {
        data = proc.stderr .. @read();
        if (data == null) break;
        data = data.toString('utf-8');
        @info("got data: #{data}");
        restarts += data .. @regexp.matches(/Conductance serving address:/g) .. @count();
        @info("restarts = #{restarts}");
        hold(1000);
        restarted.emit(restarts);
      }
    } or {
      while(true) {
        var out = proc.stdout .. @read();
        out = out.toString('utf-8');
        if (out == null) break;
        @info(out);
      }
      hold();
    } or {
      block(restarted);
    }
    restarts .. @assert.eq(expected);
  }

  var touch = function(path) {
    var now = new Date().getTime() / 1000;
    @info("touching: #{path}");
    @fs.utimes(path, now, now);
  };

  var launch = function() {
    return @childProcess.launch(process.execPath,
      [@env.executable, 'serve', '-r'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: base,
      });
  }

  @test.beforeAll() {|s|
    s.proc = launch();
    // wait until it's started
    s.proc .. expectStarts(1) {|restarted|
      restarted.wait();
    }
  }

  @test.afterAll() {|s|
    var drain = function(s) {
      while(s .. @read() != null);
    }

    waitfor {
      [s.proc.stdout, s.proc.stderr] .. @each.par(drain);
    } and {
      waitfor {
        s.proc .. @childProcess.wait();
      } or {
        s.proc .. @childProcess.kill({wait: false});
        console.warn("nodemon (pid #{s.proc.pid} won't quit - sending TERM");
        s.proc .. @childProcess.kill({wait: false, killSignal: 'SIGTERM'});
        hold(5000);
        console.warn("nodemon won't quit - sending KILL");
        s.proc .. @childProcess.kill({wait: false, killSignal: 'SIGKILL'});
        hold();
      }
    }
  }

  ;['api','sjs','js','mho','gen'] .. @each {|ext|
    @test("restarts on .#{ext} change") {|s|
      s.proc .. expectStarts(1) {|restarted|
        touch(@path.join(base, "file.#{ext}"));
        restarted.wait();
      }
    }
  }

  ;['css','html'] .. @each {|ext|
    @test("does not restart on .#{ext} change by default") {|s|
      s.proc .. expectStarts(0) {|restarted|
        touch(@path.join(base, "file.#{ext}"));
        hold(2000);
      }
    }
  }


}.serverOnly();
