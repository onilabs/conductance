#!/usr/bin/env conductance
@ = require(['sjs:test/std', 'mho:std', {id: '../helper', name: 'helper'}]);

var user = 'sandbox' // XXX;

/*
XXX Test setup requirements:

- user `sandbox`, with ~/.config/systemd
- the current $USER added to the sandbox group
- ~sandbox/.config/systemd/ exists (and is recursively group-writable)
- passwordless sudo for `systemctl start|stop user@{UID}.service`
- $ loginctl enable-linger sandbox

It'd be better if we could do this with systemd-nspawn somehow,
but that currently requires root anyway.

For debugging, you can run this script directly. It'll setup the sandbox
user's required systemd units, print out the commands required to run the
tests as that user, and then run them (with any additional args you pass in).
*/


if (!@isBrowser) {
  var uid = null;
  try {
    uid = @childProcess.run('id', ['-u', user], {stdio: ['ignore','pipe', 'pipe']}).stdout.trim();
  } catch (e) {
    // pass
  }
  var args = [process.execPath, @env.executable, 'exec', @url.normalize('./fixtures/systemd/run', module.id), '--color=on'];
  var manual_run_args = ['sudo', '-u', user, 'env', "DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/#{uid}/dbus/user_bus_socket"].concat(args);

  @stream = require('sjs:nodejs/stream');

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

  var opt = {stdio:'inherit'};

  var userUnit = "user@#{uid}.service";

  var unitBase = "/home/#{user}/.config/systemd/user"

  function cleanup() {
    @childProcess.run('rm', ['-rf', unitBase], opt);
    @childProcess.run('sudo', ['systemctl', 'stop', userUnit], opt);
  }

  function indir(dir, block) {
    var cwd = process.cwd();
    process.chdir(dir);
    try {
      block();
    } finally {
      process.chdir(cwd);
    }
  }
}

function printManualInstructions() {
  console.warn("\n### To run manually:\n#{manual_run_args .. require('sjs:shell-quote').quote()}\n###");
}

function setupSandboxUser() {
  @assert.ok(uid);
  cleanup();
  mkdir(unitBase, user);
  mkdir(unitBase + "/default.target.wants", user);

  @fs.writeFile(@path.join(unitBase, "dbus.service"), "
    [Unit]
    Requires=dbus.socket

    [Service]
    ExecStart=/usr/bin/dbus-daemon --session --address=systemd: --nofork --systemd-activation
    ExecReload=/usr/bin/dbus-send --print-reply --session --type=method_call --dest=org.freedesktop.DBus / org.freedesktop.DBus.ReloadConfig
  ".replace(/^ */mg, ''));

  @fs.writeFile(@path.join(unitBase, "dbus.socket"), "
    [Socket]
    ListenStream=%t/dbus/user_bus_socket
  ".replace(/^ */mg, ''));

  @path.join(unitBase, 'dbus.service') .. groupWritable(user);
  @path.join(unitBase, 'dbus.socket') .. groupWritable(user);

  indir(unitBase + "/default.target.wants") {||
    if (!@fs.exists('dbus.socket')) {
      @fs.symlink("../dbus.socket", "dbus.socket");
    }
  }
}

if (require.main === module) {
  setupSandboxUser();
  @childProcess.run('sudo', ['systemctl', 'start', userUnit], opt);
  printManualInstructions();

  @childProcess.run(manual_run_args[0], manual_run_args.slice(1).concat(@argv()), {'stdio':'inherit'});
} else {
  @context() {||

    @sd = require('mho:server/systemd');
    @context("file installation") {||
      var tmp = @helper.tmpContext();
      var configPath = @url.normalize('fixtures/systemd/config.mho', module.id) .. @url.toPath;
      var run = function(action) {
        @sd._main([action, '--files-only', '--dest', tmp.path].concat(Array.prototype.slice.call(arguments, 1)));
      };

      var unitFiles = function() {
        return @fs.readdir(tmp.path);
      }

      var writeUnit = function(name, contents) {
        @path.join(tmp.path, name) .. @fs.writeFile(contents);
      };

      var oldUnitName = 'myapp-old-unit.service';
      @test("installation removes existing units of the same group") {||
        writeUnit(oldUnitName, '
        [Unit]
        X-Conductance-Group = myapp
        X-Conductance-Generated = true
        ');

        unitFiles() .. @assert.eq([oldUnitName]);
        run('install', configPath);
        unitFiles() .. @assert.notContains(oldUnitName);
      }

      @test("uninstallExistingUnits leaves excluded units (those that are about to be reinstalled)") {||
        var contents = '
          [Unit]
          X-Conductance-Group = myapp
          X-Conductance-Generated = true
          ';
        var newUnitName = 'myapp-new.service';

        writeUnit(oldUnitName, contents);
        writeUnit(newUnitName, contents);

        unitFiles() .. @assert.eq([newUnitName, oldUnitName]);
        @sd._uninstallExistingUnits({
          groups: ['myapp'],
          files_only: true,
          dest: tmp.path,
        }, [new @sd._UnitFile(tmp.path, newUnitName)]);

        unitFiles() .. @assert.eq([newUnitName]);
      }

      @test("ambiguous units without a group key are removed if their filename might match") {||
        writeUnit(oldUnitName, '
        [Unit]
        X-Conductance-Generated = true
        ');

        unitFiles() .. @assert.eq([oldUnitName]);
        run('uninstall', '--group', 'myapp');
        unitFiles() .. @assert.eq([]);
      }

      @test("units with an ambiguous filename are left alone if they belong to a different group") {||
        writeUnit(oldUnitName, '
        [Unit]
        X-Conductance-Group = myapp-old
        X-Conductance-Generated = true
        ');

        unitFiles() .. @assert.eq([oldUnitName]);
        run('uninstall', '--group', 'myapp');
        unitFiles() .. @assert.eq([oldUnitName]);
      }

      @test("uninstalls all units created by conductance") {||
        var unitName = 'some.unit';
        writeUnit(unitName, '
        [Unit]
        X-Conductance-Generated = true
        ');

        var otherUnitName = 'some-other.unit';
        writeUnit(otherUnitName, '
        [Unit]
        ');

        unitFiles() .. @assert.eq([otherUnitName, unitName]);
        run('uninstall', '--all');
        unitFiles() .. @assert.eq([otherUnitName]);
      }
    }

    @test("integration") {||
      printManualInstructions();

      var me = @childProcess.run('id', ['-nu'], {stdio: ['ignore','pipe', process.stderr]}).stdout.trim();

      var rv = -1;
      cleanup();


      try {
        setupSandboxUser();
        var unitName = 'systemd-conductance-tests';
        var unit = "#{unitName}.service";

        @fs.writeFile(@path.join(unitBase, unit), "
          [Service]
          ExecStart=#{args .. require('sjs:shell-quote').quote()}
          Restart=no
          SyslogIdentifier=#{unitName}
        ".replace(/^ */mg, ''));
        @path.join(unitBase, unit) .. groupWritable(user);

        indir(unitBase + "/default.target.wants") {||
          if (!@fs.exists(unit)) {
            @fs.symlink("../#{unit}", unit);
          }
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
    }.skipIf(uid == null, "TODO: get these tests working more portably").timeout(60);

  }.skipIf(@isBrowser)
}

