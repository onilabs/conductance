@ = require('sjs:test/std');
@env = require('mho:env');

@context(function() {
  var { @mkdirp } = require('sjs:nodejs/mkdirp');
  var killProc = function(proc) {
    if(!proc) {
      throw new Error("child process was not launched");
      return;
    }
    if (!proc .. @childProcess.isRunning()) {
      throw new Error("child process exited prematurely");
    }
    var drain = function(s) {
      s .. @stream.contents .. @each(->null);
    }

    waitfor {
      [proc.stdout, proc.stderr] .. @filter .. @each.par(drain);
    } and {
      waitfor {
        try {
          proc .. @childProcess.wait();
        } catch(e) {
          // node processes send signal + 128
          if (!e.signal && e.code < 128) throw e;
        }
      } or {
        proc .. @childProcess.kill({wait: false});
        hold(3000);
        console.warn("nodemon (pid #{proc.pid} won't quit - sending TERM");
        proc .. @childProcess.kill({wait: false, killSignal: 'SIGTERM'});
        hold(5000);
        console.warn("nodemon won't quit - sending KILL");
        proc .. @childProcess.kill({wait: false, killSignal: 'SIGKILL'});
        hold();
      }
    }
  }

  var cp_r = @isWindows
    ? function(src, dest) {
      var {code} = @childProcess.run("robocopy", [src, dest, '/E',
        // shut up, robocopy:
        '/NFL', // file list
        '/NDL', // directory list
        '/NJH', // job header
        '/NJS', // summary
        '/NC',  // file classes
        '/NS',  // file sizes
        '/NP'   // progress
      ], {stdio:'inherit', throwing:false});
      if(![0,1] .. @hasElem(code)) {
        throw new Error("child process exited with error code #{code}");
      }
    }
    : function(src, dest) {
      // XXX -L is important here, so that we copy any 'npm link'ed source
      @childProcess.run('cp', ['-aL', src, dest]);
    };

  @test("supports conductance installed in a path with special characters", function(s) {
    // There are various other exotic sequences that nodemon will probably
    // fail on, as its parsing code is complex and doesn't follow any
    // particular standard. But we mostly care about spaces.
    require('sjs:nodejs/tempfile').TemporaryDir {|d|
      var newBase = @path.join(d, 'dir_with multiple spaces');
      if (!@isWindows) {
        newBase += ' and "quotes"';
      }
      @fs.mkdir(newBase);
      ;[
        'conductance',
        'conductance.cmd',
        'modules',
        'hub.sjs',
        'package.json',
        'node_modules'
        ] .. @each {|f|
        var src = @path.join(@env.conductanceRoot, f) .. @fs.realpath;
        var dest = @path.join(newBase, f);
        @mkdirp(@path.dirname(dest));
        //console.log("copying #{src} into #{dest}");
        if(@fs.stat(src).isDirectory()) {
          cp_r(src, dest);
        } else {
          @childProcess.run('cp', [src, dest]);
        }
      }

      var nodePath = @path.join(newBase, 'node_exe with spaces');
      if(@isWindows) nodePath += '.exe';
      @childProcess.run('cp', [process.execPath, nodePath], {stdio:'inherit'});

      // XXX debug
      //@childProcess.run('ls', ['-l', newBase], {stdio:'inherit'});
      //@childProcess.run(nodePath, ['-e','console.log("NODE IS OK");'], {stdio:'inherit'});

      var mho = @path.join(newBase, 'my app.mho');
      @fs.withWriteStream(mho) {|f|
        "
          exports.serve = function(args) {
            console.warn('APP RUN WITH:', args);
          }
        " .. @stream.pump(f);
      }
      var args = [
        //'/usr/bin/strace', '-f','-eexecve',  // XXX debug
        nodePath, @path.join(newBase, 'conductance'), 'serve', '-r', mho];
      //console.log("launching ", args);

      try {
        var proc = s.proc = @childProcess.launch(args[0], args.slice(1),
          { stdio: ['ignore', 'pipe', 'pipe'],
            // make sure it's not relying on `node` / `nodejs` in $PATH
            //env: process.env .. @merge({PATH:'/bin:/usr/bin'}),
          }
        );

        var output = null;
        waitfor {
          var data;
          proc.stderr .. @stream.contents('utf-8') .. @each {|data|
            //console.log("got data: #{data}");
            if (data .. @contains('APP RUN WITH:')) {
              output = data;
              break;
            }
            if (data .. @contains('app crashed')) {
              break;
            }
          }
        } or {
          if(proc.stdout) {
            proc.stdout .. @stream.contents('utf-8') .. @each(@info);
          }
          hold();
        }
        output .. @assert.eq("APP RUN WITH: []\n");
      } finally {
        killProc(proc);
      }
    }
  }).timeout(20); // a lot of files to copy, can be slow (esp. on a windows VM)

  @context("long-running server", function() {
    var base = @url.normalize('./fixtures/nodemon', module.id) .. @url.toPath;
    var expectStarts = function(proc, expected, block) {
      var restarts = 0;
      var restarted = @Dispatcher();
      waitfor {
        var data;
        proc.stderr .. @stream.contents('utf-8') .. @each {|data|
          @info("got data: #{data}");
          var newRestarts = data .. @regexp.matches(/Conductance serving address:/g) .. @count();
          if (newRestarts > 0) {
            restarts += newRestarts;
            @info("restarts = #{restarts}");
            hold(1000);
            restarted.dispatch(restarts);
          }
        }
      } or {
        if(proc.stdout) {
          proc.stdout .. @stream.contents('utf-8') .. @each(@info);
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
          cwd: base
        });
    }

    var TO_REMOVE = [];
    @test.beforeAll:: function(s) {
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
        restarted.receive();
      }
    }

    @test.afterAll:: function(s) {
      s.proc .. killProc();
      if (TO_REMOVE.length > 0) {
        @childProcess.run('rm', ['-rf'].concat(TO_REMOVE), {stdio:'inherit'});
      }
    }

    ;['api','sjs','js','mho','gen'] .. @each {|ext|
      @test("restarts on .#{ext} change", function(s) {
        s.proc .. expectStarts(1) {|restarted|
          touch(@path.join(base, "file.#{ext}"));
          restarted.receive();
        }
      });
    }

    ;['css','html'] .. @each {|ext|
      @test("does not restart on .#{ext} change by default", function(s) {
        s.proc .. expectStarts(0) {|restarted|
          touch(@path.join(base, "file.#{ext}"));
          hold(2000);
        }
      });
    }
  });


}).serverOnly();
