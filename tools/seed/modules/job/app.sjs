// Provides access to an app's state (on the machine where the app is running).

@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@crypto = require('nodejs:crypto');
@tempfile = require('sjs:nodejs/tempfile');
@nodeFs = require('nodejs:fs');
@fsExt = require('nodejs:fs-ext');
@constants = require('nodejs:constants');
@etcd = require('./etcd');
@job_master = require('./master');
var { @User } = require('../auth/user');
var { @Endpoint } = require('../endpoint');
var { @follow } = require('./follow');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
var { @rimraf } = require('sjs:nodejs/rimraf');
var { @alphanumeric } = require('../validate');
var here = @url.normalize('./', module.id) .. @url.toPath;
var tmpRoot = @path.join(here, '../tmp');
var credentialsRoot = @path.join(here, '../credentials');
var ConductanceArgs = require('mho:server/systemd').ConductanceArgs;

var dataRoot = @env.get('dataRoot');
var appRoot = @path.join(dataRoot, 'app');

var getUserAppRoot = exports.getUserAppRoot = function(user) {
  @assert.ok(user instanceof @User);
  return @path.join(appRoot, String(user.id) .. @alphanumeric);
};

var getAppPath = exports.getAppPath = function(user, id) {
  return @path.join(getUserAppRoot(user), id .. @alphanumeric);
}

var appRunRoot = @path.join(dataRoot, 'run', 'app');
var getAppRunPath = function(user, id) {
  return @path.join(appRunRoot, String(user.id) .. @alphanumeric, id .. @alphanumeric);
}

var tryRename = function(src, dest) {
  try {
    @fs.rename(src, dest);
  } catch(e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
};

var writeAtomically = function(path, contents) {
  // atomic on POSIX, but not necessarily on Windows
  var tmp = path + '.tmp';
  @fs.writeFile(tmp, contents);
  @fs.rename(tmp, path);
};


var semaphoreWrapper = function() {
  var lock = @Semaphore();
  var wrapper = function(f) {
    var rv = function() {
      lock.synchronize {||
        return f.apply(this, arguments);
      }
    };
    rv.unsafe = f; // allow calling `f` directly if you already have the lock
    return rv;
  };
  wrapper.lock = lock;
  return wrapper;
}

var DEFAULT_CONFIG = {
  version: 1,
  name: "unknown",
};

var etcd = @env.get('etcd');

// local app state (exposed by slaves). Provides information
// on a directly running app
exports.localAppState = (function() {
  var apps = {};

  var getPidPath = root -> @path.join(root, "pid");

  var _groupRunning = (pid) -> @childProcess.isRunning(-pid, 0);

  var _getPid = function(pidPath) {
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
  };


  var App = function(user, id) {
    @assert.string(id, 'appId');
    var appBase = getAppPath(user, id);
    var appRunBase = getAppRunPath(user, id);
    var pidPath = getPidPath(appRunBase);
    var logPath = @path.join(appRunBase, 'log');
    var configPath = @path.join(appBase, 'config.json');
    var recheckPid = @Emitter();

    var tailLogs = function(count, emit) {
      if(count === undefined) count = 100;
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
    };

    var safe = semaphoreWrapper();

    var getPid = function() {
      return _getPid(pidPath);
    } .. safe;

    var isRunning = function() {
      return getPid.unsafe() !== null;
    } .. safe();

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
      @info("Starting app: #{id}");
      var pid = getPid.unsafe();
      if (pid !== null) {
        if (throwing) @assert.fail("app already running!");
        else return false;
      }

      // XXX this needs to be a _remote_ rsync once slaves run
      // on separate machines
      @info("syncing current code for app #{id}");
      var codeSource = @path.join(appBase, "code");
      var codeDest = @path.join(appRunBase, "code");
      @mkdirp(codeSource);
      @mkdirp(codeDest);
      
      @childProcess.run('rsync', ['-az', '--delete',
        codeSource + "/",
        codeDest,
      ], { stdio: 'inherit'});

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
        var args = ConductanceArgs.slice(1);
        
        // add setuid shim
        args.unshift(
          @path.join(@url.normalize('../job/run-shim.js', module.id) .. @url.toPath())
        );

        var child = @childProcess.launch(process.execPath,
          args.concat([
            '-vvv',
            'serve',
            @path.join(appRunBase, 'code', 'config.mho')
          ]),
          {
            stdio: stdio,
            detached: true,
            env: process.env .. @merge({
              RUN_USER: 'tim', // XXX
            }),
          }
        );

        @info("launched child process: #{child.pid}");
        pidPath .. writeAtomically(String(child.pid));

      } finally {
        stdio.slice(1) .. @each(@fs.close);
        spawn(function() {hold(400); recheckPid.emit();}());
      }
      return true;
    } .. safe();

    var waitApp = function() {
      pidStream .. @each {|pid|
        if (pid === null) break;
      }
    };

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

    return {
      id: id,
      pid: pidStream,
      tailLogs: tailLogs,
      start: startApp,
      wait: waitApp,
      stop: stopApp,
    }
  };

  var getGlobalId = (user, id) -> "#{user.id .. @alphanumeric()}/#{id .. @alphanumeric()}";

  var getApp = function(user, id) {
    @assert.ok(user instanceof @User);
    @assert.string(id);
    var globalId = getGlobalId(user, id);
    var rv = apps[globalId];
    if(!apps..@hasOwn(globalId)) {
      rv = apps[globalId] = App(user, id);
    }
    return rv;
  };
  getApp.runningApps = @Stream(function(emit) {
    var root = appRunRoot;
    @mkdirp(root);
    @fs.readdir(root) .. @each {|userId|
      var path = @path.join(root, userId);
      if (!@fs.stat(path).isDirectory()) continue;
      @fs.readdir(path) .. @each {|appId|
        var pidPath = getPidPath(@path.join(path, appId));
        if (_getPid(pidPath) !== null) {
          var user = new @User(userId, null);
          var globalId = getGlobalId(user, appId);
          emit([globalId, getApp(user, appId)]);
        }
      }
    }
  });
  return getApp;
})();

// master app state (for use on master). Provides central control
// for an app (id, code, endpoint, start / stop, etc).
exports.masterAppState = (function() {
  var apps = {};

  var App = function(user, id) {
    @assert.string(id, 'appId');
    var appId = "#{user.id}/#{id}";
    var appBase = getAppPath(user, id);
    var configPath = @path.join(appBase, 'config.json');
    var safe = semaphoreWrapper();

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

    var startApp = function() {
      etcd .. @job_master.start(appId);
    };

    var stopApp = function() {
      etcd .. @job_master.stop(appId);
    };

    var deploy = function(stream) {
      @mkdirp(appBase);
      var expectedSize = 0;
      @tempfile.TemporaryFile({prefix:"conductance-deploy-"}) {|tmpfile|
        @info("receiving #{id} -> #{tmpfile.path}");

        var outstream = tmpfile.writeStream();
        stream .. @each {|chunk|
          expectedSize += chunk.length;
          outstream .. @stream.write(chunk);
        }
        outstream .. @stream.end();

        @info("upload done (#{expectedSize}b), unpacking");
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

          // sanity check that we have a config.mho
          @assert.ok(@fs.exists(@path.join(tmpdest, 'config.mho')), "no config.mho found in code!");

          // stop app so that nothing is trying to run code while we're modifying it
          stopApp();

          // overwrite dir
          tryRename(finaldest, finaldest + '.old');
          @fs.rename(tmpdest, finaldest);
          tryRename(finaldest + '.old', tmpdest);

          // and restart it
          startApp();
        } catch (e) {
          //cleanup();
          throw e;
        }
      }
    } .. safe();

    var endpointStream = @Stream(function(emit) {
      var key = @etcd.app_endpoint(appId);
      @etcd.tryOp(-> etcd.set(key, "", {prevExist: false})); // explicitly `null` the key if it's not yet set

      var last = undefined;
      etcd .. @etcd.values(key, {initial:true}) .. @each {|node|
        var serverId = node.value;
        if (serverId === '') {
          if (last !== null) {
            last = null;
            emit(null);
          }
        } else {
          etcd .. @etcd.values(@etcd.slave_endpoint(serverId), {initial:true}) .. @each {|url|
            if (last !== url.value) {
              last = url.value;
              emit(@Endpoint(url.value));
            }
          }
        }
      }
    });

    return {
      id: id,
      config: config,
      start: startApp,
      stop: stopApp,
      deploy: deploy,
      synchronize: safe.lock.synchronize.bind(safe.lock),
      endpoint: endpointStream,
    }
  };

  return function(user, id) {
    @assert.ok(user instanceof @User);
    @assert.string(id);
    var globalId = "#{user.id .. @alphanumeric()}/#{id .. @alphanumeric()}";
    var rv = apps[globalId];
    if(!apps..@hasOwn(globalId)) {
      rv = apps[globalId] = App(user, id);
    }
    return rv;
  };
})();
