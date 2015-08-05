#!/usr/bin/env conductance
@ = require('sjs:test/std');

if (require('sjs:sys').hostenv === 'nodejs') {
  @net = require('nodejs:net');
  var socketServer = function(port) {
    var server = @net.createServer({
      pauseOnConnect:true,
    });
    server.listen(port);
    waitfor {
      server .. @wait('listening');
    } or {
      throw (server .. @wait('error'));
    }
    return server;
  }
  var awaitListeningPort = function(port) {
    while(true) {
      waitfor(var err) {
        var conn = @net.connect(port, 'localhost', resume);
        conn.on('error', resume);
      }
      if(err) {
        if(err.code === 'ECONNREFUSED') {
          continue;
        }
        throw err;
      } else {
        break;
      }
    }
  }
  @ssh = require('mho:ssh-client');
  var { @TemporaryFile, @TemporaryDir } = require('sjs:nodejs/tempfile');
  var { @mkdirp } = require('sjs:nodejs/mkdirp');
  var conn;
  var SSH_PORT = 2222;
  var sshDir = "#{process.env.HOME}/.ssh";
  var user = process.env.USER;
  var defaultClientSettings = {
    username: user,
    port: SSH_PORT,
    host: 'localhost',
    //debug:console.log,
  };
  // NOTE: these tests require passwordless SSH into localhost for the current user.
  // on travis, we set that up right here.

  // TODO: move this somewhere common if we need it in any other tests
  if (process.env.TRAVIS === 'true') {
    if (@childProcess.run('which', ['socat'], {stdout: 'ignore', throwing: false}).code !== 0) {
      @warn("installing socat...");
      @childProcess.run('sudo', ['apt-get', '-y', 'install', 'socat'], {stdio:'inherit'});
    }

    var authFile = @path.join(sshDir, 'authorized_keys');
    if(!@fs.exists(authFile)) {
      @warn("Setting up passwordless SSH...");
      @mkdirp(sshDir);
      var idFile = @path.join(sshDir,'id_rsa');
      @childProcess.run('ssh-keygen', ['-t', 'rsa', '-C', 'nobody@travis-ci.org', '-P', '','-f',idFile], {stdio: 'inherit'});
      
      // Needed for openSSH, but not for nodejs SSH library:
      // @path.join(sshDir, 'config') .. @fs.writeFile('StrictHostKeyChecking no\n');
      
      authFile .. @fs.writeFile(@fs.readFile(idFile+'.pub', 'ascii'));
      @childProcess.run('chmod', ['-R', 'g-rw,o-rw', sshDir], {stdio: 'inherit'});
    }
  }

  function startServer(s, serverSettings, clientSettings) {
    serverSettings = {
      port: SSH_PORT,
      extraConf: '',
    } .. @merge(serverSettings);
    
    s.ctx = @breaking {|brk|

      var connectOpts = s.clientOpts = defaultClientSettings .. @merge(
        {port: serverSettings.proxyPort || serverSettings.port},
        clientSettings);

      @info("Connect opts:", connectOpts);
      var key = [ "id_rsa", "id_dsa" ] .. @transform(f -> @path.join(sshDir, f)) .. @find(@fs.exists, null);
      if(!key) throw new Error("Couldn't find SSH key");
      @info("using SSH private key #{key}");
      connectOpts.privateKey = key .. @fs.readFile('ascii');
      
      var sshd = process.env.PATH.split(':')
        .. @transform(bin -> @path.join(bin, 'sshd'))
        .. @find(@fs.exists);
      var confDir = @url.normalize('./fixtures/sshd', module.id) .. @url.toPath;

      @TemporaryFile({mode: 0600}) {|conf|

        confDir .. @path.join('conf') .. @fs.readFile('ascii')
          .. @supplant(serverSettings .. @merge({confDir: confDir}))
          .. @stream.pump(conf.writeStream());

        //conf.readStream() .. @stream.readAll() .. (s -> console.log(s.toString()));

        // group permissions aren't persisted by git,
        // so we need to satisfy SSH's paranoia
        @childProcess.run('chmod', ['-R', 'g-rw,o-rw',
          confDir .. @path.join('host_dsa_key'),
          confDir .. @path.join('host_rsa_key'),
        ], {stdio: 'inherit'});

        function runSSH() {
          @childProcess.run(sshd, [ '-D', '-f', conf.path,
            //'-d', // debug
          ], {stdio: 'inherit', throwing: false, cwd: '/tmp'}) {|sshd|
            var connected;
            s.sshd = sshd;
            //console.log("running sshd #{sshd.pid}");
            waitfor {
              sshd .. @childProcess.wait({throwing: false});
              if(!connected) throw new Error("sshd died");
            } or {
              while(true) {
                try {
                  @ssh.connect(connectOpts) {|conn|
                    connected = true;
                    brk(conn);
                  }
                } catch(e) {
                  if(!connected && e.code === 'ECONNREFUSED') {
                    // ssh isn't listening yet, just retry
                    hold(1000);
                    continue;
                  }
                  throw e;
                }
                break;
              }
            }
            sshd .. @childProcess.kill();
          }
        }

        if(serverSettings.proxyPort) {
          @info("Running socat");
          @childProcess.run('socat', [
            "TCP-LISTEN:#{serverSettings.proxyPort},reuseaddr",
            "TCP:localhost:#{serverSettings.port},retry=10"],
            {stdio: 'inherit', throwing:false}) {
            |socat|
            s.socat = socat;
            runSSH();
          }
        } else {
          runSSH();
        }
      }
    };
    s.conn = s.ctx.value;
  }

  function stopServer(s) {
    s.ctx.resume();
  }

  function addTestHooks(serverSettings, clientSettings) {
    @test.beforeAll {|s|
      startServer(s, serverSettings, clientSettings);
    }
    @test.afterAll(stopServer);
  }

}

if (require.main === module) {
  var state = {};
  startServer(state);
  console.log("server running!");
  var args = @sys.argv();
  if(args.length === 0) {
    require('sjs:debug').prompt("press return to exit ...");
  } else {
    state.conn .. @ssh.run(args[0], args.slice(1), {stdio:'inherit'}) .. console.log();
  }
  stopServer(state);
} else {
  @context {|s|
    @context {|s|
      addTestHooks();

      require('sjs:../test/unit/node/child-process-common').commonTests({
        run: -> @ssh.run.apply(@ssh, [s.conn].concat(arguments .. @toArray)),
        exec: -> @ssh.exec.apply(@ssh, [s.conn].concat(arguments .. @toArray)),
        isRunning: function() {
          throw @skipTest("isRunning: not yet implemented");
        }
      }, {
        supportsSignal: false,
        supportsKill: false,
        supportsRawFileDescriptors: false,
      });

      @test("process killed externally") {||
        @assert.raises({filter: e -> e.code === (128 | 15) /* SIGINT */},
          -> @ssh.run(s.conn, 'bash',
            ['-c', "echo $$; sleep 20"],
            {stdio:['ignore', 'pipe', 'inherit']})
          { |proc|
            var pid = proc.stdout .. @stream.lines('ascii') .. @first .. parseInt;
            @info("Killing pid #{pid}");
            @childProcess.run('kill', [pid]);
            hold();
          }
        );
      };
    }

    @context("usage errors") {||
      addTestHooks();
      // We used to test `host` and `port`, but those are
      // defaulted to `localhost:22` now (which is not all that useful)
      @test("missing username") {|s|
      
        var opts = s.clientSettings .. @clone();
        opts.username = undefined;
        @assert.raises( -> @ssh.connect(opts, -> null));
      }
    }


    @context("transport errors") {||
      @context() {||
        addTestHooks({
          proxyPort: SSH_PORT,
          port: SSH_PORT+1,
        }, { keepAliveInterval: 500});
        @test("network connection error") {|s|
          var active = @Condition();
          waitfor {
            @assert.raises({message: 'SSH connection terminated'},
            -> @ssh.run(s.conn, 'bash', ['-c', 'echo OK; sleep 100; exit 0'], {stdio: ['ignore', 'pipe', 'inherit']}) {|ssh|
                ssh.stdout .. @stream.lines('ascii') .. @first() .. @assert.eq('OK\n');
                active.set();
                hold();
              }
            );
          } and {
            active.wait();
            @info("killing socat");
            @childProcess.kill(s.socat);
            @info("killed socat");
          }
          active.isSet .. @assert.eq(true);
        }
      }
    }

    @test("socket timeout") {||
      // make a dummy server which accepts connections but never
      // makes any response
      var server = socketServer(SSH_PORT);
      var connections = [];
      server.on('connection', function(conn) {
        connections.push(conn);
      });

      try {
        waitfor {
          @assert.raises({message: 'Socket timed out'}, ->
            @ssh.connect(defaultClientSettings .. @merge({timeout: 1000})) {|conn|
              throw new Error("ssh connection succeeded");
            }
          );
        } or {
          hold(2000);
          throw new Error("Timeout didn't trigger");
        }
      } finally {
        waitfor () {
          @info("closing server")
          connections .. @each(c -> c.end());
          server.close(resume);
        }
        @info("server closed");
      }
    }

    @test("socket destroyed by server") {|s|
      var server = socketServer(SSH_PORT);
      server.on('connection', function(conn) {
        conn.destroy();
      });

      try {
        @assert.raises({message: 'Socket terminated'}, ->
          @ssh.connect(defaultClientSettings) {|conn|
            throw new Error("ssh connection succeeded");
          }
        );
      } finally {
        waitfor () {
          @info("closing server")
          server.close(resume);
        }
        @info("server closed");
      }
    }

    var libfiuBase = @url.normalize('../../tools/libfiu/build/', module.id) .. @url.toPath;
    @context("fallible IO") {||
      var NUM_ITERATIONS = 1000;
      var NUM_SSH_EXECS = 10;
      addTestHooks({ });

      @test("should not cause uncaught exceptions") {||
        var knownErrorMessages = [

          // libuv doesn't know about all error codes, and
          // aborts the process when it encounters an unknown one.
          /uv_err_name: Assertion `0' failed/

        ];

        @TemporaryDir() {|ctlBase|
          for(var iteration=0; iteration<NUM_ITERATIONS; iteration++) {
            @info(" - Attempt ##{iteration}");

            // have we reached the connection phase yet? We fail if this doesn't happen within 5s
            var connected = false;

            // has the process exited yet?
            var exited = false;

            // was this a known error? (see knownErrorMessages)
            var knownError = false;

            // did we see unexpected output?
            var unexpectedOutput = false;

            // was the output truncated?
            var truncatedOutput = false;

            // did the test harness handle the error successfully?
            var handled = false;

            // we proceed in lockstep with the child process'
            // stdout messages, so that we can enable libfiu
            // once the child is ready (and track whether it
            // gets to the "connected" stage)
            var stages = [
              ['!r', function(proc) {
                // initial setup complete - enable the gremlins!
                var prob = (Math.random() * 0.1).toFixed(3);
                @childProcess.run(
                  @path.join(libfiuBase, 'bin/fiu-ctrl'),
                  [
                    '-f', ctlBase,
                    '-c','enable_random name=posix/io/*,probability=' + prob,
                    String(proc.pid),
                  ],
                  {stdio: 'inherit', env: env});
                @info("libfiu enabled (probability=#{prob})");
                proc.stdin .. @stream._write('\n');
              }],

              // We've (successfully) connected to the SSH server.
              // If this (or process death) doesn't happen in 5s, something
              // is weird.
              ['!c', function() { connected = true; } ],
            ];

            var env = process.env .. @merge({
              LD_LIBRARY_PATH: @path.join(libfiuBase, 'lib'),
            });

            var ignoreError = function(source, event, filter) {
              var e = source .. @events(event || 'error') .. @each {|e|
                if(filter && !filter(e)) {
                  throw e;
                }
                @warn("Error in test infrastructure: #{e}");
              }
            }

            var proc = @childProcess.run( 'bash', [
                // limit memory so things don't get too crazy
                '-euc', 'ulimit -v 3024000 -m 2024000 && exec "$@"', '--',
                @path.join(libfiuBase, 'bin/fiu-run'),
                '-x', '-f', ctlBase, 'conductance', 'exec',
                @url.normalize('./ssh-client-loop.sjs', module.id),
                String(SSH_PORT), String(NUM_SSH_EXECS),
              ],
              {
                stdio:['pipe','pipe','pipe'],
                env: env,
                throwing: false,
              }
            ) {|proc|
              @debug("child running...");
              waitfor {
                // These initial branches never terminate; they'll only
                // be cancelled once all of stcin/stdout is completely
                // consumed.
                waitfor {
                  proc.stdout .. ignoreError();
                } or {
                  proc.stderr .. ignoreError();
                } or {
                  proc .. ignoreError();
                } or {
                  // when a child is killed by SIGABRT, nodejs throws an
                  // uncaught ECONNRESET in the parent process.
                  process .. ignoreError('uncaughtException', e -> e.code === 'ECONNRESET');
                } or {
                  //
                  // process stdout/stderr completely (until EOF)
                  //
                  waitfor {
                    proc.stdout .. @stream.lines('utf-8') .. @each {|line|
                      line = line.trim();
                      if(!line.length) continue;
                      if(knownError) {
                        // if the process has died,
                        // just funnel additional stdout to the console
                        @info('(output after known error): ' + line);
                        continue;
                      }

                      if(truncatedOutput) {
                        @warn("Additional output seen after truncation: " + line);
                        handled = false;
                        unexpectedOutput = true;
                        continue;
                      }

                      if(line .. @startsWith("Gracefully handled: ")) {
                        @info(line);
                        handled = true;
                        continue;
                      }

                      if("Gracefully handled: " .. @startsWith(line)) {
                        // Sometimes nodejs truncates child process output.
                        // As long as this is the _last_ line of output, let it slide...
                        truncatedOutput = true;
                        handled = true;
                        continue;
                      }

                      // otherwise, make sure we're progressing in lockstep with the expected output
                      var expected = stages.shift();
                      if(expected && line === expected[0]) {
                        @info("saw line:", line);
                        expected[1](proc);
                      } else {
                        @warn(line);
                        unexpectedOutput = true;
                      }
                    }
                  } and {
                    // check stderr for known error messages which aren't the fault of
                    // the SSH library
                    proc.stderr .. @stream.lines('utf-8') .. @each {|line|
                      line = line.trim();
                      if(!line.length) continue;

                      if(knownErrorMessages .. @any(re -> re.test(line))) {
                        @info("Ignoring known error: #{line}");
                        knownError = true;
                      } else {
                        @warn(line);
                      }
                    }
                  }
                }
              } and {

                // wait for the child to exit
                waitfor {
                  proc .. @childProcess.wait({throwing: false});
                  exited = true;
                } or {
                  hold(5000);
                  if(!connected) {
                    @warn("Child didn't connect (or exit) after 5s");
                    proc .. @childProcess.kill();
                  }
                  hold(30000);
                  @warn("Child didn't exit after 30s");
                  proc .. @childProcess.kill();
                  hold();
                }
              }
            };
            exited .. @assert.ok();
            if(knownError) continue; // nothing we can do about these
            if(unexpectedOutput) throw new Error("Unexpected output");
            if(handled) continue; // this was a success, regardless of how the child exited
            @info("Proc died with code #{proc.code}, signal #{proc.signal}");
            if(proc.signal) {
              // The process calls exit() in all known cases (both success and fail).
              // If we get a signal, we don't know whether it failed, or whether the
              // test harness encountered an error. So just ignore this run.
              @info("Proc died with signal #{proc.signal}, can't determine failure type");
              continue;
            }
            if(proc.code !== 0) {
              throw new Error("child process exited with code #{proc.code} (signal #{proc.signal})");
            }
          }
        }
      }
    }
    .timeout(null)
    .skipIf(!(process.env.FUZZ_TEST && @fs.exists(@path.join(libfiuBase))),
      "set $FUZZ_TEST=1 and build #{libfiuBase} to enable");

  }.serverOnly();
}
