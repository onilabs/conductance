@ = require('sjs:test/std');
@context {|s|
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


  function addTestHooks(serverSettings, clientSettings) {
    @test.afterAll {|s|
      s.ctx.resume();
    }
    @test.beforeAll {|s|

      serverSettings = {
        port: SSH_PORT,
        extraConf: '',
      } .. @merge(serverSettings);
      
      s.ctx = @breaking {|brk|
        var user = process.env.USER;

        var connectOpts = {
          host: 'localhost',
          username: user,
          port: serverSettings.proxyPort || serverSettings.port,
          debug: @logging.debug,
        } .. @merge(clientSettings);
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
            ], {stdio: 'inherit', throwing: false}) {|sshd|
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
      conn = s.ctx.value;
    }
  }


  @context {||
    addTestHooks();
    require('sjs:../test/unit/node/child-process-common').commonTests({
      run: -> @ssh.run.apply(@ssh, [conn].concat(arguments .. @toArray)),
      exec: -> @ssh.exec.apply(@ssh, [conn].concat(arguments .. @toArray)),
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
        -> @ssh.run(conn, 'bash',
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
    var fullOpts = {
      host: 'localhost',
      username: process.env.USER,
      port: SSH_PORT,
    }

    addTestHooks();
    fullOpts .. @ownKeys .. @each {|key|
      @test("missing #{key}") {||
        var opts = fullOpts .. @clone();
        opts[key] = undefined;
        var expectedMeassage = key === 'username'
          ? /Cannot read property 'length' of undefined|Argument must be a string/
          : /Authentication failure/;
        @assert.raises(
          {message: expectedMeassage},
          -> @ssh.connect(opts, -> null)
        );
      }
    }
  }


  @context("transport errors") {||
    @context() {||
      addTestHooks({
        extraConf: '
          ClientAliveInterval 1
          ClientAliveCountMax 1
        '
      });
      @test("SSH timeout") {||
        // XXX ssh2 library should actually respond to keepalive messages,
        // but for now this is an easy way to amulate disconnection by
        // the server.
        @assert.raises({message: "SSH connection terminated"},
          -> @ssh.run(conn, 'bash', ['-c', 'sleep 100']).stdout .. @assert.eq('done'));
      }
    }

    @context() {||
      addTestHooks({
        proxyPort: SSH_PORT,
        port: SSH_PORT+1,
      }, { keepAliveInterval: 500});
      @test("network connection error") {|s|
        var active = @Condition();
        waitfor {
          @assert.raises({message: 'SSH connection terminated'},
          -> @ssh.run(conn, 'bash', ['-c', 'echo OK; sleep 100; exit 0'], {stdio: ['ignore', 'pipe', 'inherit']}) {|ssh|
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
          @ssh.connect({port: SSH_PORT, timeout: 1000}) {|conn|
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

  @test("socket destroyed by server") {||
    var server = socketServer(SSH_PORT);
    var connections = [];
    server.on('connection', function(conn) {
      conn.destroy();
    });

    try {
      @assert.raises({message: 'Socket terminated'}, ->
        @ssh.connect({port: SSH_PORT, timeout: 1000}) {|conn|
          throw new Error("ssh connection succeeded");
        }
      );
    } finally {
      waitfor () {
        @info("closing server")
        connections .. @each(c -> c.end());
        server.close(resume);
      }
      @info("server closed");
    }
  }

  var libfiuBase = @url.normalize('../../tools/libfiu/build/', module.id) .. @url.toPath;
  @context("fallible IO") {||
    var NUM_ITERATIONS = 100;
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
          @info("Attempt ##{iteration}");

          // have we reached the connection phase yet? We fail if this doesn't happen within 5s
          var connected = false;

          // has the process exited yet?
          var exited = false;

          // was this a known error? (see knownErrorMessages)
          var knownError = false;

          // did the test harness handle the error successfully?
          var handled = false;

          // we proceed in lockstep with the child process'
          // stdout messages, so that we can enable libfiu
          // once the child is ready (and track whether it
          // gets to the "connected" stage)
          var stages = [
            ['!r', function(proc) {
              // initial setup complete - enable the gremlins!
              @childProcess.run(
                @path.join(libfiuBase, 'bin/fiu-ctrl'),
                [
                  '-f', ctlBase,
                  '-c','enable_random name=posix/io/*,probability=0.05',
                  String(proc.pid),
                ],
                {stdio: 'inherit', env: env});
              @info("libfiu enabled");
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

          var proc = @childProcess.run( 'bash', [
              // limit memory so things don't get too crazy
              '-euxc', 'ulimit -v 3024000 -m 2024000 && exec "$@"', '--',
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
            @info("child running...");
            waitfor {
              // check stdout for expected messages
              proc.stdout .. @stream.lines('utf-8') .. @zip(stages) .. @each {|[line,[expected, action]]|
                line = line.trim();
                if(!line.length) continue;
                if(line .. @startsWith("Gracefully handled: ")) {
                  @info(line);
                  handled = true;
                  continue;
                }

                if(exited) {
                  // if the process has died,
                  // just funnel additional stdout to the console
                  console.log(line);
                } else {
                  @info("saw line:", line);
                  line .. @assert.eq(expected);
                  action(proc);
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
                  console.warn(line);
                }
              }
            } and {
              waitfor {
                proc .. @childProcess.wait({throwing: false});
                exited = true;
              } or {
                hold(5000);
                if(!connected) throw new Error("Child didn't connect after 5s");
                hold();
              }
            }
          };
          exited .. @assert.ok();
          if(knownError) continue; // nothing we can do about these
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
