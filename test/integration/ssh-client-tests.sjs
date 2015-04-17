@ = require('sjs:test/std');
@context {|s|
  @ssh = require('mho:ssh-client');
  var { @mkdirp } = require('sjs:nodejs/mkdirp');
  var conn;
  @test.beforeAll {|s|
    // NOTE: these tests require passwordless SSH into localhost for the current user.
    // on travis, we set that up right here.
    var sshDir = "/home/#{process.env.USER}/.ssh";
    var sshAgent = process.env.SSH_AUTH_SOCK;

    // TODO: move this somewhere common if we need it in any other tests
    if (process.env.TRAVIS === 'true') {
      //- ssh-keygen -t rsa -C your_email@youremail.com -P '' -f ~/.ssh/id_rsa
      //- cat /home/travis/.ssh/id_rsa.pub >> /home/travis/.ssh/authorized_keys
      //- ln -s /home/travis/.ssh/authorized_keys /home/travis/.ssh/authorized_keys2
      //- echo "Host localhost" >> /home/travis/.ssh/config
      //- echo "    StrictHostKeyChecking no" >> /home/travis/.ssh/config
      //- chmod g-rw,o-rw /home/travis/.ssh/*

      var authFile = @path.join(sshDir, 'authorized_keys');
      if(!@fs.exists(authFile)) {
        console.warn("Setting up passwordless SSH...");
        @mkdirp(sshDir);
        var idFile = @path.join(sshDir,'id_rsa');
        @childProcess.run('ssh-keygen', ['-t', 'rsa', '-C', 'nobody@travis-ci.org', '-P', '','-f',idFile], {stdio: 'inherit'});
        @path.join(sshDir, 'config') .. @fs.writeFile('StrictHostKeyChecking no\n');
        authFile .. @fs.writeFile(@fs.readFile(idFile+'.pub', 'ascii'));
        @childProcess.run('chmod', ['-R', 'g-rw,o-rw', sshDir], {stdio: 'inherit'});

        // sanity check
        @childProcess.run('ssh', ['-vvv', 'localhost', 'echo OK'], {stdio: 'inherit'});
      }
    }
    
    s.ctx = @breaking {|brk|
      var user = process.env.USER;

      if(process.env.SHELL .. @contains('fish')) {
        // XXX way hacky....
        user = 'sandbox';
      }

      var opts = {
        host: 'localhost',
        username: user,
      };
      if(sshAgent) {
        @info("using SSH agent");
        opts.agent = sshAgent;
      } else {
        var key = [ "id_rsa", "id_dsa" ] .. @transform(f -> @path.join(sshDir, f)) .. @find(@fs.exists, null);
        if(!key) throw new Error("Couldn't find SSH key (and $SSH_AUTH_SOCK not set)");
        @info("using SSH private key #{key}");
        opts.privateKey = key .. @fs.readFile('ascii');
      }
      //console.log(opts);
      @ssh.connect(opts, brk);
    };
    conn = s.ctx.value;
  }
  @test.afterAll {|s|
    s.ctx.resume();
  }

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
}.serverOnly();
