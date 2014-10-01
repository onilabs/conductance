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
        var newRestarts = data .. @regexp.matches(/Conductance serving address:/g) .. @count();
        if (newRestarts > 0) {
          restarts += newRestarts;
          @info("restarts = #{restarts}");
          hold(1000);
          restarted.emit(restarts);
        }
      }
    } or {
      while(proc.stdout) {
        var out = proc.stdout .. @read();
        if (out == null) break;
        out = out.toString('utf-8');
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
      [@env.executable, 'serve', '-r', '--port', '7099'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: base,
      });
  }

  var TO_REMOVE = [];
  @test.beforeAll() {|s|
    if (base .. @contains(@path.sep + ".")) {
      // we're running from a hidden directory, so minimatch will
      // cause nodemmon to ignore everything. Let's make a tempfile instead
      var tmp = process.env['TEMP'] || process.env['TMP'] || '/tmp';
      var orig_base = base;
      base = @path.join(tmp, "conductance-nodemon-test");
      TO_REMOVE.push(base);
      @childProcess.run('rm', ['-rf', base], {stdio:'inherit'});
      @childProcess.run('cp', ['-a', orig_base, base], {stdio:'inherit'});
    }

    s.proc = launch();
    // wait until it's started
    s.proc .. expectStarts(1) {|restarted|
      restarted .. @wait();
    }
  }

  @test.afterAll() {|s|
    var drain = function(s) {
      while(s .. @read() != null);
    }

    waitfor {
      [s.proc.stdout, s.proc.stderr] .. @filter .. @each.par(drain);
    } and {
      waitfor {
        try {
          s.proc .. @childProcess.wait();
        } catch(e) {
          if (!e.signal) throw e;
        }
      } or {
        s.proc .. @childProcess.kill({wait: false});
        hold(3000);
        console.warn("nodemon (pid #{s.proc.pid} won't quit - sending TERM");
        s.proc .. @childProcess.kill({wait: false, killSignal: 'SIGTERM'});
        hold(5000);
        console.warn("nodemon won't quit - sending KILL");
        s.proc .. @childProcess.kill({wait: false, killSignal: 'SIGKILL'});
        hold();
      }
    }
    if (TO_REMOVE.length > 0) {
      @childProcess.run('rm', ['-rf'].concat(TO_REMOVE), {stdio:'inherit'});
    }
  }

  ;['api','sjs','js','mho','gen'] .. @each {|ext|
    @test("restarts on .#{ext} change") {|s|
      s.proc .. expectStarts(1) {|restarted|
        touch(@path.join(base, "file.#{ext}"));
        restarted .. @wait();
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
