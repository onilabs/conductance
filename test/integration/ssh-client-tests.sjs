@ = require('sjs:test/std');
@context {|s|
  var sshDir = "/home/#{process.env.USER}/.ssh";
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

  @ssh = require('mho:ssh-client');
  var { @TemporaryFile } = require('sjs:nodejs/tempfile');
  var { @mkdirp } = require('sjs:nodejs/mkdirp');
  var conn;

  function addTestHooks(serverSettings, clientSettings) {
    @test.afterAll {|s|
      s.ctx.resume();
    }
    @test.beforeAll {|s|

      serverSettings = {
        port: 2222,
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
        var key = [ "id_rsa", "id_dsa" ] .. @transform(f -> @path.join(sshDir, f)) .. @find(@fs.exists, null);
        if(!key) throw new Error("Couldn't find SSH key (and $SSH_AUTH_SOCK not set)");
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
        proxyPort: 2222,
        port: 2223,
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

}.serverOnly();
