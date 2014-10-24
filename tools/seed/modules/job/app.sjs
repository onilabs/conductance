// Provides access to an app's state (on the machine where the app is running).

@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@crypto = require('nodejs:crypto');
@tempfile = require('sjs:nodejs/tempfile');
@nodeFs = require('nodejs:fs');
@util = require('../util');
@constants = require('nodejs:constants');
@etcd = require('./etcd');
var { @User } = require('../auth/user');
var { @Endpoint } = require('mho:server/seed/endpoint');
var { @follow } = require('./follow');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
var { @rimraf } = require('sjs:nodejs/rimraf');
@validate = require('../validate');
var { quote: @shellQuote } = require('sjs:shell-quote');
var { @keySafe, hex: @appIdSafe } = @validate;
var here = @url.normalize('./', module.id) .. @url.toPath;
var tmpRoot = @path.join(here, '../tmp');
var credentialsRoot = @path.join(here, '../credentials');
var ConductanceArgs = require('mho:server/systemd').ConductanceArgs;

var production = @env.get('production');
var dataRoot = @env.get('data-root');
var keyStore = @env('key-store');
var appRoot = @path.join(dataRoot, 'app');
exports.getAppRoot = -> appRoot;
var conductanceRoot = @path.dirname(require.resolve('mho:').path .. @url.toPath);
var sjsRoot =         @path.dirname(require.resolve('sjs:').path .. @url.toPath);

var expected_exe_name = /docker/;

var getUserAppRoot = exports.getUserAppRoot = function(user) {
  @assert.ok(user instanceof @User);
  return @path.join(appRoot, String(user.id) .. @keySafe);
};

var getAppPath = exports.getAppPath = function(user, id) {
  return @path.join(getUserAppRoot(user), id .. @appIdSafe);
}

var appRunRoot = @path.join(dataRoot, 'run', 'app');
var getAppRunPath = function(user, id) {
  return @path.join(appRunRoot, String(user.id) .. @keySafe, id .. @appIdSafe);
}

var getMasterCodePaths = function(user, appId) {
  var key = @etcd.master_app_repository();
  var root = etcd.get(key) .. @getPath('node.value');
  if (root .. @startsWith('localhost:')) {
    root = root.slice('localhost:'.length);
  }
  return [
    @path.join(root, String(user.id), appId, "code"),
    @path.join(root, String(user.id), appId, "config.json"),
  ];
}

var getGlobalId = (user, id) -> "#{user.id .. @keySafe()}/#{id .. @appIdSafe()}";
var getMachineName = (user, id) -> "#{user.id .. @keySafe()}_#{id .. @appIdSafe()}";

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

var closeAllFileDescriptorsOnExec = function() {
  // node does a terrible job of closing open file descriptors (may be
  // improved in 0.12). So we need to manually mark everything as cloexec when
  // running anything that might be long-running (in particular, our lockfile).
  // XXX this is not portable
  // NOTE: we use *Sync functions to make sure nobody is opening new file descriptors behind our back

  @nodeFs.readdirSync("/proc/#{process.pid}/fd") .. @each {|fd|
    try {
      @util.setCloexec(fd .. parseInt(10));
    } catch(e) {
      if (e.code === 'EBADF') {
        // presumably the file descriptor used to read /proc/PID/fd - ignore
        continue;
      }
    }
  }
};

function tryRunDocker(cmd, stdout) {
  // runs a docker command
  // returns the standard result (truthy) if it completed successfully,
  // and `false` if the container doesn't exist.
  // Throws the original error if the command failed for
  // any other reason.
  try {
    var rv = @childProcess.run('docker', cmd, {stdio:['ignore',stdout === undefined ? 1 : stdout,'pipe']});
    return rv;
  } catch(e) {
    if (!/Error( response from daemon)?: No such (image or )?container: /.test(e.stderr)) {
      @error(e.stderr);
      throw e;
    }
    return false;
  }
}

var _isRunning = function(machineName) {
  var rv = tryRunDocker(['inspect', '--format', '{{.State.Running}}', machineName], 'pipe');
  if(rv === false) {
    return false; // no such container
  }
  var output = rv.stdout;
  switch(output.trim()) {
    case 'true': return true;
    case 'false': return false;
    default: throw new Error("Unknown running state: #{output}".trim())
  }
}

var _awaitExit = function(machineName) {
  closeAllFileDescriptorsOnExec();
  try {
    tryRunDocker(['attach', '--no-stdin', '--sig-proxy=false', machineName], 'ignore');
  } catch(e) {
    if (_isRunning(machineName)) throw e;
  }
};

var _loadConfig = function(configPath) {
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
};


// local app state (exposed by slaves). Provides information
// on a directly running app
exports.localAppState = (function() {
  var apps = {};

  var App = function(user, id) {
    @assert.string(id, 'appId');
    //var globalId = getGlobalId(user, id);
    var machineName = getMachineName(user, id);
    var appRunBase = getAppRunPath(user, id);
    @mkdirp(appRunBase);
    //var pidPath = getPidPath(appRunBase);
    var logPath = @path.join(appRunBase, 'log');
    var configPath = @path.join(appRunBase, 'config.json');
    var recheckPid = @Emitter();
    var clearLogs = -> @fs.open(logPath, 'w') .. @fs.close();

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
              buf = buf.slice(1);
              // false means "no data"; null means "clear old data"
              emit(buf.length == 0 ? false : null);
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

    var isRunning = function() {
      return _isRunning(machineName);
    } .. safe();

    var awaitExit = function() {
      return _awaitExit(machineName);
    };

    var isRunningStream = @Stream(function(emit) {
      while(true) {
        if(isRunning()) {
          waitfor {
            emit(true);
          } and {
            awaitExit(machineName);
          }
        }
        emit(false);
        recheckPid .. @wait();
      }
    // XXX: add @dedupe
    }) .. @mirror;

    var startApp = function(throwing) {
      @mkdirp(appRunBase);

      var stdio = ['ignore'];
      // truncate file
      clearLogs();
      // then open it twice in append mode (for stdout & stderr)
      // XXX does having two file descriptors pointing to the same place
      // lead to interleaving that could otherwise be avoided by
      // using dup()?
      waitfor {
        stdio[1] = @fs.open(logPath, 'a');
      } and {
        stdio[2] = @fs.open(logPath, 'a');
      }

      function log() {
        var formatted = @logging.formatMessage(@logging.INFO, arguments)[1] + "\n";
        formatted = new Buffer(formatted);
        stdio[1] .. @fs.write(formatted,0, formatted.length,null);
      }

      @info("Starting app: #{id}");
      if(isRunning.unsafe()) {
        if (throwing) @assert.fail("app already running!");
        else return false;
      }

      log("Syncing code...");
      @info("syncing current code for app #{id}");
      var codeSources = getMasterCodePaths(user, id);
      
      // make sure the server identity matches key-all-ssh-known-hosts to prevent MITM
      var sshCmd = ['ssh', '-o', 'UserKnownHostsFile=/dev/null', '-o', 'StrictHostKeyChecking=yes'];
      if(keyStore) {
        // if there's no key store (e.g in dev), the current user must already have ssh access
        sshCmd = sshCmd.concat([
          '-o', "GlobalKnownHostsFile=#{@path.join(keyStore, "key-all-ssh-known-hosts")}",
          '-o', "IdentityFile=#{@path.join(keyStore, "key-slave-ssh-id")}",
        ]);
      }
      var cmd = ['rsync', '-az', '-e', sshCmd .. @shellQuote, '--chmod=go-w', '--delete']
        .concat(codeSources)
        .concat([ appRunBase ]);

      @info("Running:", cmd);
      try {
        @childProcess.run(cmd[0], cmd.slice(1), { stdio: 'inherit'});
      } catch(e) {
        log("Code sync failed.");
        throw e;
      }

      var codeDest = @path.join(appRunBase, "code");

      // node does a terrible job of closing open file descriptors (may be
      // improved in 0.12). So we need to manually mark everything as cloexec.
      // XXX this is not portable
      // XXX we use *Sync functions to make sure nobody is opening new file descriptors behind our back

      try {
        closeAllFileDescriptorsOnExec();

        // Make sure there's no leftover container
        // (`docker run -rm` is not 100% reliable)
        // XXX an idempotent `rm` would be much better...
        tryRunDocker(["rm", machineName]);

        log("Building environment...");
        var args = ConductanceArgs;
        var runUser = "app";
        var readOnly = (path) -> "#{path}:#{path}:ro";

        args = [
          "docker",
          "run",
          "--rm=true",
          "--publish", "7075",
          "--publish", "4043",
          "--name", machineName,
          "--hostname", machineName,
          "--user", runUser,
          "--memory", '250m', // XXX tune / configure
          "--workdir", codeDest,
          "--volume", readOnly(codeDest),
        ].concat(production ? [
          "--volume", readOnly('/nix/store'),
        ] : [
          // kinda hacky - just ensure that we have all required paths in dev
          // (it's harmless to add paths that we only need on some boxes)
          "--volume", readOnly('/usr'),
          "--volume", readOnly('/bin'),
          "--volume", readOnly('/lib'),
          "--volume", readOnly('/lib64'),
          "--volume", readOnly(@path.join(process.env.HOME, '.local/share')),
          "--volume", readOnly(conductanceRoot),
          "--volume", readOnly(sjsRoot),
        ]).concat([
          "local/conductance-base", // image name
        ]).concat(args);
        @info("Running", args);
        var child = @childProcess.launch(args[0],
          args.slice(1).concat([
            'serve',
          ]),
          {
            stdio: stdio,
            detached: true,
          }
        );

        @info("launched child process: #{child.pid}");
        var tries = 100;
        // wait until docker reports this container as running
        while(true) {
          if (isRunning.unsafe()) break;
          if (!@childProcess.isRunning(child.pid)) {
            if(!@childProcess.isRunning(child.pid)) throw new Error("process died");
          }
          if(tries <= 0) {
            throw new Error("timed out waiting for app start");
          }
          hold(500);
          tries--;
        }
        recheckPid.emit();
        return true;
      } catch(e) {
        log(e.message);
        throw e;
      } finally {
        stdio.slice(1) .. @each(@fs.close);
      }
    } .. safe();

    var stopApp = function() {
      @info("Stopping app #{machineName}");
      tryRunDocker(["stop", machineName]);
      recheckPid.emit();
    } .. safe();

    var getPortBindings = function() {
      var tries = 30;
      var inspectOutput;
      while(true) {
        @info("getting docker metadata for image #{machineName}");
        try {
          inspectOutput = @childProcess.run('docker', ['inspect', machineName], {stdio:['ignore', 'pipe', 2]}).stdout;

          var containerInfo = inspectOutput .. JSON.parse();
          @assert.eq(containerInfo.length, 1, containerInfo.length);
          //@info(containerInfo[0] .. @getPath('NetworkSettings.Ports'));
          var portBindings = [];
          containerInfo[0]
            .. @getPath('NetworkSettings.Ports')
            .. @ownPropertyPairs .. @each {|[k,v]|
              if (!k .. @endsWith('/tcp')) continue;
              [k,] = k.split('/');
              k = parseInt(k, 10);
              v = v .. @filter(v -> v .. @hasOwn('HostPort')) .. @toArray();
              if (v.length > 0) {
                portBindings.push("#{k}:#{v[0] .. @get('HostPort') .. @assert.ok("blank HostPort")}");
              }
            };
          return portBindings;
          break;
        } catch(e) {
          hold(1000);
          if (tries<=0) throw new Error("Failed to collect docker metadata for #{machineName}");
          @info("Retrying after error: #{e.message}");
          tries--;
        }
      }
    };

    function getSubdomain() {
      return "#{_loadConfig(configPath).name .. @keySafe}.#{user.id .. @keySafe()}"
    };

    return {
      id: id,
      subdomain: getSubdomain,
      isRunning: isRunningStream,
      tailLogs: tailLogs,
      clearLogs: clearLogs,
      start: startApp,
      getPortBindings: getPortBindings,
      wait: awaitExit,
      stop: stopApp,
    };
  };

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
      var user = new @User(userId, null);
      @fs.readdir(path) .. @each {|appId|
        var machineName = getMachineName(user, appId);
        if (_isRunning(machineName)) {
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
  var publicUrlBase = @env.get('publicAddress')('proxy', 'http') .. @url.parse();

  var App = function(user, id) {
    @assert.string(id, 'appId');
    var appId = "#{user.id}/#{id}";
    var appBase = getAppPath(user, id);
    var configPath = @path.join(appBase, 'config.json');
    var safe = semaphoreWrapper();

    var config = (function() {
      var loadConfig = function() {
        return _loadConfig(configPath);
      } .. safe();

      var val = @ObservableVar(loadConfig());
      var rv = val .. @transform(x -> DEFAULT_CONFIG .. @merge(x));
      rv.modify = function(f) {
        f = function(orig) {
          return function(current, unchanged) {
            var rv = orig.apply(null, arguments);
            if (rv === unchanged) return unchanged;
            // validate new config before accepting
            rv.name .. @validate.appName();
            return rv;
          };
        }(f);
        if (val.modify(f)) {
          var conf = val.get();
          @logging.info("saving app config:", conf);
          @mkdirp(appBase);
          @fs.writeFile(configPath, JSON.stringify(conf, null, '  '), 'utf-8');
        }
      } .. safe();
      return rv;
    })();

    @job_master = require('./master');
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

          //// sanity check that we have a config.mho
          //@assert.ok(@fs.exists(@path.join(tmpdest, 'config.mho')), "no config.mho found in code!");

          // stop app so that nothing is trying to run code while we're modifying it
          stopApp();

          // overwrite dir
          tryRename(finaldest, finaldest + '.old');
          @fs.rename(tmpdest, finaldest);
          tryRename(finaldest + '.old', tmpdest);

          // and restart it
          startApp();
        } catch (e) {
          cleanup();
          throw e;
        }
      }
    } .. safe();

    var endpointStream = @Stream(function(emit) {
      var key = @etcd.app_endpoint(appId);
      @etcd.tryOp(-> etcd.set(key, "", {prevExist: false})); // explicitly `null` the key if it's not yet set

      etcd .. @etcd.values(key, {initial:true}) .. @each {|node|
        var serverId = node.value;
        @verbose("got etcd endpoint:", serverId);
        if (serverId === '') {
          emit(false);
        } else {
          @verbose("polling slave endpoint:", serverId);
          etcd .. @etcd.values(@etcd.slave_endpoint(serverId), {initial:true}) .. @each {|url|
            if (url === null) {
              emit(null);
            } else {
              @verbose("got slave endpoint:", url.value);
              emit(@Endpoint(url.value));
            }
          }
        }
      }
    }) .. @dedupe(@eq);

    return {
      id: id,
      config: config,
      start: startApp,
      stop: stopApp,
      deploy: deploy,
      synchronize: safe.lock.synchronize.bind(safe.lock),
      endpoint: endpointStream,
      publicUrlTemplate: "#{publicUrlBase.protocol}://{name}.#{user.id}.#{publicUrlBase.authority}/",
    }
  };

  return function(user, id) {
    @assert.ok(user instanceof @User);
    @assert.string(id);
    var globalId = "#{user.id .. @keySafe()}/#{id .. @keySafe()}";
    var rv = apps[globalId];
    if(!apps..@hasOwn(globalId)) {
      rv = apps[globalId] = App(user, id);
    }
    return rv;
  };
})();
