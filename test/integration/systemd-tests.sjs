@ = require(['sjs:test/std', 'mho:std']);

var groupWritable = function(path, grp) {
  @childProcess.run('chgrp', [grp, path]);
  @childProcess.run('chmod', ['g+rwX', path]);
};

var mkdir = function(path, grp) {
  if (!@fs.exists(path)) {
    @fs.mkdir(path);
  }
  if (grp) {
    path .. groupWritable(grp);
  }
};

var lines = function(stream) {
  var buf = '';
  var chunk, lines=[];
  return @Stream(function(emit) {
    while (true) {
      while(lines.length > 0) {
        emit(lines.shift());
      }
      chunk = stream .. @stream.read();
      if (chunk == null) {
        if (buf) emit(buf);
        return;
      }
      chunk = chunk.toString('utf-8');
      lines = (buf + chunk).split('\n');
      buf = lines.pop(); // unfinished line
    }
  });
};

@test("systemd integration tests") {||
  @stream = require('sjs:nodejs/stream');
  /*
  XXX Test setup requirements:

  - user `sandbox`, with ~/.config/systemd
  - the current $USER added to the sandbox group
  - ~sandbox/.config/systemd/ exists (and is recursively group-writable)
  - passwordless sudo for `systemctl start|stop user@{UID}.service`

  It'd be better if we could do this with systemd-nspawn somehow,
  but that currently requires root anyway.
  */

  var user = 'sandbox'; // XXX
  var uid = @childProcess.run('id', ['-u', user], {stdio: ['ignore','pipe', process.stderr]}).stdout.trim();
  var me = @childProcess.run('id', ['-nu'], {stdio: ['ignore','pipe', process.stderr]}).stdout.trim();
  var unitName = 'systemd-conductance-tests';
  var unit = "#{unitName}.service";

  var opt = {stdio:'inherit'};

  var userUnit = "user@#{uid}.service";

  var unitBase = "/home/#{user}/.config/systemd/user"

  function cleanup() {
    @childProcess.run('rm', ['-rf', unitBase], opt);
    @childProcess.run('sudo', ['systemctl', 'stop', userUnit], opt);
  }

  cleanup();

  mkdir(unitBase, user);
  var rv = -1;

  try {
    mkdir(unitBase + "/default.target.wants", user);

    var args = [process.execPath, @env.executable, 'exec', @url.normalize('./fixtures/systemd/run', module.id), '--color=on'];
    @fs.writeFile(@path.join(unitBase, unit), "
      [Service]
      ExecStart=#{args .. require('sjs:shell-quote').quote()}
      SyslogIdentifier=#{unitName}
    ".replace(/^ */mg, ''));

    @path.join(unitBase, unit) .. groupWritable(user);

    var cwd = process.cwd();
    process.chdir(unitBase + "/default.target.wants");
    try {
      if (!@fs.exists(unit)) {
        @fs.symlink("../#{unit}", unit);
      }
    } finally {
      process.chdir(cwd);
    }

    var proc = @childProcess.launch('journalctl', ['-f','--lines=0', '--output=json'], {'stdio':['ignore','pipe', process.stderr]});
    waitfor {
      proc .. @childProcess.wait();
    } and {
      try {
        waitfor {
          proc.stdout .. lines .. @skip(1) .. @transform(JSON.parse) .. @filter(log -> log.SYSLOG_IDENTIFIER==unitName) .. @each {|line|
            //console.warn('##', line);
            //console.warn(line.SYSLOG_IDENTIFIER, line.SYSLOG_PID);
            line = line.MESSAGE;
            if (Array.isArray(line)) {
              line = new Buffer(line).toString('utf-8');
            }
            if (line .. @startsWith('__EXIT__')) {
              rv = parseInt(line.split(' ')[1], 10);
              @info("[ Exited: #{rv} ]");
              break;
            }
            @info(line);
          }
        } and {
          @childProcess.run('sudo', ['systemctl', 'start', userUnit], opt);
        }
      } catch(e) {
        @warn("Error: #{String(e)}");
        throw e;
      } finally {
        // terminate journalctl
        @info("killing journalctl pid #{proc.pid}");
        proc .. @childProcess.kill({wait:false});
      }
    }
  } finally {
    @info("cleaning up systemd unit files...");
    if (process.env['CLEANUP'] !== 'false') cleanup();
  }
  rv .. @assert.eq(0, "tests failed");
}.skipIf(@isBrowser || process.env['LOGNAME'] != 'tim', "TODO: get these tests working more portably").timeout(60);
