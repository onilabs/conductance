@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@state = require('./state');
@crypto = require('nodejs:crypto');
@tempfile = require('sjs:nodejs/tempfile');
@nodeFs = require('nodejs:fs');
@fsExt = require('nodejs:fs-ext');
@constants = require('nodejs:constants');
var { @follow } = require('./follow');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
var { @rimraf } = require('sjs:nodejs/rimraf');
var here = @url.normalize('./', module.id) .. @url.toPath;
var tmpRoot = @path.join(here, '../tmp');
var credentialsRoot = @path.join(here, '../credentials');
var ConductanceArgs = require('mho:server/systemd').ConductanceArgs;

var User = exports.User = function(id, nickname) {
  this.id = id;
  this.nickname = nickname;
};

var alphanumeric = function(name) {
  if (/^[a-zA-Z0-9]+$/.test(name)) {
    return name;
  }
  throw new Error("Invalid app identifier: #{name}");
}

var DEFAULT_CONFIG = {
  version: 1,
  name: "unknown",
};

var tryRename = function(src, dest) {
  try {
    @fs.rename(src, dest);
  } catch(e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
};

var getUserAppRoot = function(user) {
  @assert.ok(user instanceof User);
  return @path.join(here, '../apps', user.id .. alphanumeric);
};

var getAppPath = function(user, id) {
  return @path.join(getUserAppRoot(user), id .. alphanumeric);
}

// getApp needs to be a module-level function, as it
// contains process-wide state
var getApp = (function() {
  var apps = {};

  var App = function(user, id) {
    @assert.string(id, 'appId');
    var destRoot = getUserAppRoot(user);
    var appBase = getAppPath(user, id);
    var pidPath = @path.join(appBase, "pid");
    var logPath = @path.join(appBase, 'log');
    var configPath = @path.join(appBase, 'config.json');
    var lock = @Semaphore();
    var recheckPid = @Emitter();

    var tailLogs = function(count) {
      if(count === undefined) count = 100;
      return @Stream(function(emit) {
        var ready = @Condition();
        var buf = [];
        waitfor {
          @follow(logPath, 'utf-8') .. @each {|lines|
            if (lines === null) {
              buf = [null];
            } else {
              buf = buf.concat(lines);
            }
            ready.set();
          }
        } and {
          while(true) {
            ready.wait();
            ready.clear();
            waitfor {
              ready.wait();
            } or {
              // give some hold time to accumulate more data
              hold(100);
              if (buf[0] === null) {
                emit(null);
                buf = buf.slice(1);
              }
              if (buf.length == 0) continue;
              var contents = buf;
              if (buf.length > count) {
                contents = [' ... ' ].concat(buf.slice(-count));
              }
              buf = [];
              emit(contents.join('\n') + '\n');
            }
          }
        }
      });
    };

    var safe = function(f) {
      var rv = function() {
        lock.synchronize {||
          return f.apply(this, arguments);
        }
      };
      rv.unsafe = f; // allow calling `f` directly if you already have the lock
      return rv;
    };

    var _groupRunning = (pid) -> @childProcess.isRunning(-pid, 0);

    var getPid = function() {
      var pid = null;
      try {
        pid = parseInt(@fs.readFile(pidPath).toString('ascii'), 10);
      } catch(e) {
        if (e.code !== 'ENOENT') throw e;
      }

      if (pid !== null && _groupRunning(pid)) {
        // check the actual proc (XXX linux-only)
        var exe = @fs.readlink("/proc/#{pid}/exe") .. @path.basename;
        @debug("pid #{pid} is process #{exe}");
        if (!/node/.test(exe)) {
          @warn("pid #{pid} is running, but is not a nodejs process! (#{exe})");
          pid = null;
        }
        return pid;
      } else {
        return null;
      }
    } .. safe();

    var isRunning = function() {
      return getPid.unsafe() !== null;
    } .. safe();

    var config = (function() {
      var loadConfig = function() {
        var loaded = {};
        try {
          loaded = @fs.readFile(configPath, 'utf-8') .. JSON.parse();
        } catch(e) {
          if (e.code !== 'ENOENT') throw e;
          @warn("no config found at #{configPath}");
          loaded = {};
        }
        @info("Loaded config:", loaded);
        return DEFAULT_CONFIG .. @merge(loaded);
      } .. safe();

      var val = @ObservableVar(loadConfig());
      var rv = val .. @transform(x -> DEFAULT_CONFIG .. @merge(x));
      rv.modify = function(f) {
        if (val.modify(f)) {
          var conf = val.get();
          @logging.info("saving app config:", conf);
          @mkdirp(appBase);
          @fs.writeFile(configPath, JSON.stringify(conf, null, '  '), 'utf-8');
        }
      } .. safe();
      return rv;
    })();

    var pidStream = @Stream(function(emit) {
      var pid = getPid();
      emit(pid);
      while(true) {
        waitfor {
          hold(5000); // XXX use waitpid() or some sort of pipe() notification for killed processes
        } or {
          recheckPid .. @wait();
        }
        var last = pid;
        pid = getPid();
        if (pid !== last) emit(pid);
      }
    });

    var startApp = function(throwing) {
      var pid = getPid.unsafe();
      if (pid !== null) {
        if (throwing) @assert.fail("app already running!");
        else return false;
      }
      var stdio = ['ignore'];
      // truncate file
      @fs.open(logPath, 'w') .. @fs.close();
      // then open it twice in append mode (for stdout & stderr)
      // XXX does having two file descriptors pointing to the same place
      // lead to interleaving that could otherwise be avoided by
      // using dup()?
      waitfor {
        stdio[1] = @fs.open(logPath, 'a');
      } and {
        stdio[2] = @fs.open(logPath, 'a');
      }

      // node does a terrible job of closing open file descriptors (may be
      // improved in 0.12). So we need to manually mark everything as cloexec.
      // XXX this is not portable
      // XXX we use *Sync functions to make sure nobody is opening new file descriptors behind our back

      @nodeFs.readdirSync("/proc/#{process.pid}/fd") .. @each {|fd|
        fd = parseInt(fd, 10);
        var flags;
        try {
          flags = fd .. @fsExt.fcntlSync('getfd');
        } catch(e) {
          if (e.code === 'EBADF') {
            // presumably the file descriptor used to read /proc/PID/fd - ignore
            continue;
          }
        }
        var cloexec = flags | @constants.FD_CLOEXEC;
        if (flags !== cloexec) {
          // clexec flag not yet set:
          fd .. @fsExt.fcntlSync('setfd', cloexec);
        }
        ((fd .. @fsExt.fcntlSync('getfd')) & @constants.FD_CLOEXEC) .. @assert.ok('CLOEXEC not set');
      }

      try {
        var child = @childProcess.launch(process.execPath,
          ConductanceArgs.slice(1).concat([
            '-vvv',
            'serve',
            @path.join(appBase, 'code', 'config.mho'),
          ]),
          {
            // XXX send stdout to logfile, too
            stdio: stdio,
            detached: true,
            env: process.env .. @merge({
              RUN_USER: 'tim', // XXX
              PIDFILE: pidPath,
              SJS_INIT: @path.join(@url.normalize('./run-shim.sjs', module.id) .. @url.toPath()),
            }),
          }
        );
        console.log("launched child process: #{child.pid}");
      } finally {
        stdio.slice(1) .. @each(@fs.close);
        spawn(function() {hold(400); recheckPid.emit();}());
      }
      return true;
    } .. safe();

    var stopApp = function() {
      var pid = getPid.unsafe();
      if (pid == null) {
        @debug("stopApp(#{id}) - not running");
        recheckPid.emit();
        return false;
      }
      @info("Stopping app #{id}, PID #{pid}");
      var timeouts = [
        [0, 'INT', 100],
        [1000, 'INT', 1000],
        [3000, 'TERM', 1000],
        [5000, 'KILL', 1000],
      ];
      var dead = false;
      timeouts .. @each {|[pre, sig, post]|
        dead = !_groupRunning(pid);
        if(dead) break;
        hold(pre);
        @info("killing #{pid} with #{sig}");
        process.kill(-pid, 'SIG' + sig);
        hold(post);
      }
      recheckPid.emit();
      if (!dead) throw new Error("could not terminate app");
    } .. safe();

    var deploy = function(stream) {
      @mkdirp(appBase);
      var expectedSize = 0;
      @tempfile.TemporaryFile({prefix:"conductance-deploy-"}) {|tmpfile|
        console.log("receiving #{id} -> #{tmpfile.path}");

        var outstream = tmpfile.writeStream();
        stream .. @each {|chunk|
          expectedSize += chunk.length;
          outstream .. @stream.write(chunk);
        }
        outstream .. @stream.end();

        console.log("upload done (#{expectedSize}b), unpacking");
        @assert.ok(expectedSize > 0, "can't deploy an empty file");
        var tmpdest = @path.join(appBase, "_code");
        var finaldest = @path.join(appBase, "code");
        
        var cleanup = -> @rimraf(tmpdest);

        if (@fs.exists(tmpdest)) {
          cleanup();
        }
        @mkdirp(tmpdest);
        try {
          @fs.fstat(tmpfile.file).size .. @assert.eq(expectedSize, "uploaded file size");
          @childProcess.run('tar', ['xzf', tmpfile.path, '-C', tmpdest], {stdio:'inherit'});

          // sanity check that we have a valid config.mho
          @childProcess.run(ConductanceArgs[0], ConductanceArgs.slice(1).concat([
            'exec',
            @path.join(tmpdest, 'config.mho'),
          ]), {stdio:'inherit'});

          // before we modify anything, kill the old app (if any)
          stopApp.unsafe();
            
          // overwrite dir
          tryRename(finaldest, finaldest + '.old');
          @fs.rename(tmpdest, finaldest);
          tryRename(finaldest + '.old', tmpdest);

          // and start it
          startApp.unsafe();
        } catch (e) {
          cleanup();
          throw e;
        }
      }
    } .. safe();

    return {
      id: id,
      config: config,
      pid: pidStream,
      start: startApp,
      stop: stopApp,
      tailLogs: tailLogs,
      deploy: deploy,
      synchronize: lock.synchronize.bind(lock),
    }
  };

  return function(user, id) {
    @assert.ok(user instanceof User);
    @assert.string(id);
    var globalId = "#{user.id .. alphanumeric()}/#{id .. alphanumeric()}";
    var rv = apps[globalId];
    if(!apps..@hasOwn(globalId)) {
      rv = apps[globalId] = App(user, id);
    }
    return rv;
  };
})();

var AppCollection = function(user) {
  var basePath = getUserAppRoot(user);
  var val = @ObservableVar([]);
  var rv = {
    items: val .. @transform(function(ids) {
      return ids .. @map(function(id) {
        @info("Fetching app #{id}");
        return getApp(user, id);
      });
    }),
    reload: function() {
      val.modify(function(current, unchanged) {
        var newval = @fs.readdir(basePath) .. @sort();
        if (newval .. @eq(current)) return unchanged;
        return newval;
      });
    },
  };
  rv.reload();
  return rv;
};

function createApp(user, id, props) {
  if (getAppPath(user, id) .. @fs.exists()) {
    throw new Error("App #{id} already exists");
  }
  var app = getApp(user, id);
  app.config.modify(-> props);
  appCollection.reload();
  return app;
};

function destroyApp(user, id) {
  getApp(user, id).synchronize {||
    @info("Destroying app #{id}");
    @rimraf(getAppPath(user, id));
    appCollection.reload();
  }
}

exports.Api = function(user) {
  @assert.ok(user instanceof User);
  @mkdirp(getUserAppRoot(user));
  var appCollection = AppCollection(user);

  return {
    user: user.id,
    apps: appCollection.items,
    getApp: id -> getApp(user, id),
    createApp: (id, props) -> destroyApp(user, id, props),
    destroyApp: id -> destroyApp(user, id),
  };
};
