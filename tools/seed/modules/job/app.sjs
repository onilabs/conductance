// Provides access to an app's state (on the machine where the app is running).

@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@crypto = require('nodejs:crypto');
@tempfile = require('sjs:nodejs/tempfile');
@nodeFs = require('nodejs:fs');
@tar = require('sjs:nodejs/tar');
@gzip = require('sjs:nodejs/gzip');
@util = require('../util');
@constants = require('nodejs:constants');
@etcd = require('./etcd');
@bridge = require('mho:rpc/bridge');
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

var production = @env.get('production');
var dataRoot = @env.get('data-root');
var keyStore = @env('key-store');
var appRoot = @path.join(dataRoot, 'app');
exports.getAppRoot = -> appRoot;
var conductanceRoot = @path.dirname(require.resolve('mho:').path .. @url.toPath);
var sjsRoot =         @path.dirname(require.resolve('sjs:').path .. @url.toPath);
var DOCKER_IMAGE = 'local/conductance-base';

var expected_exe_name = /docker/;
var appSizeLimit = 1024 * 10; // 10mb

var app_PATH = (function() {
  var systemPaths = [
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
  ];
  var seedPaths = [
    process.execPath,
    @sys.executable,
    @env.executable,
  ] .. @transform(@fs.realpath) .. @transform(@path.dirname);

  return @concat(seedPaths, systemPaths) .. @unique() .. @join(":");
})();

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
    @path.join(root, String(user.id), appId, "state.json"),
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

function tryRunDocker(cmd, stdout, block) {
  // runs a docker command
  // returns the standard result (truthy) if it completed successfully,
  // and `false` if the container doesn't exist.
  // Throws the original error if the command failed for
  // any other reason.
  try {
    var rv = @childProcess.run('docker', cmd, {stdio:['ignore',stdout === undefined ? 1 : stdout,'pipe']}, block);
    return rv;
  } catch(e) {
    if (!/Error( response from daemon)?: No such (image or )?container: /.test(e.stderr)) {
      //@error("Docker error output from command #{cmd.join(' ')}:" + e.stderr);
      if(e.stderr && e.message) e.message += "\n" + e.stderr;
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

var _loadState = function(path) {
  var loaded = {};
  try {
    loaded = @fs.readFile(path, 'utf-8') .. JSON.parse();
  } catch(e) {
    if (e.code !== 'ENOENT') throw e;
    @warn("no state found at #{path}");
    loaded = {config: {}, state: {}};
  }
  @debug("Loaded state:", loaded);
  return {
    config: DEFAULT_CONFIG .. @merge(loaded.config),
    state: loaded.state,
  };
};


function limitStreamSize(stream, maxkb) {
  return @Stream(function(emit) {
    var size = 0;
    stream .. @each {|chunk|
      Buffer.isBuffer(chunk) .. @assert.ok();
      size += chunk.length;
      if((size/1024) > maxkb) {
        var err = new Error("Application too large");
        err.tooLarge = true;
        err.maxkb = maxkb;
        err .. @bridge.setMarshallingProperties(['tooLarge', 'maxkb']);
        throw err;
      }
      emit(chunk);
    }
  });
}

var cleanupDeadContainers = exports.cleanupDeadContainers = function() {
  var nonEmptyLines = s -> s .. @split("\n") .. @filter() .. @toArray();
  var run_output = function(args, containers) {
    @info("Running `docker #{args .. @join(" ")}`#{containers ? " on #{containers.length} containers" : ""}");
    return @childProcess.run('docker', args.concat(containers || []),
      {stdio: ['ignore','pipe',2]}).stdout;
  }
  var containers = run_output(['ps', '-aq']) .. nonEmptyLines;

  if(containers.length > 0) {
    var image = run_output(['images', '-q', '--no-trunc', DOCKER_IMAGE]).trim();
    @assert.ok(/^[0-9a-fA-F]+$/.test(image), "bad image id: #{image}");
    
    // NOTE: old docker (e.g 1.3.2) uses .Id, newer uses .ID
    var filterArg = '--format={{if (and (eq .State.Running false) (eq .Image "'+image+'"))}}{{or .ID .Id}}{{end}}';

    @info("running `docker inspect '#{filterArg}'`");
    var ok = tryRunDocker(['inspect', filterArg].concat(containers), 'pipe') {|p|
      var count = 0;
      p.stdout .. @stream.lines('ascii') .. @transform(@strip) .. @filter() .. @each {|container|
        @info("running `docker rm '#{container}'`");
        if(tryRunDocker(["rm", container], 'ignore')) {
          count++;
        } else {
          @warn("docker `rm` #{container} failed");
        }
      }
      @info("Cleaned up #{count} dead containers");
    }
    if(!ok) {
      @warn("`docker inspect` failed");
    }
  }
};

var writeServiceConfig = function(appRunBase, globalId) {
  var appConfig = @fs.readFile(@path.join(appRunBase, "state.json")) .. JSON.parse .. @get('config');
  var enabledServices = appConfig .. @get('services', []);
  var service = appConfig .. @get('service');
  var serviceConfig = service .. @get('data', {});
  var serviceEnv = service .. @get('env', {});

  serviceConfig = serviceConfig .. @merge(enabledServices .. @map(function(key) {
    var conf = appConfig .. @getPath(['data',key], null);
    // hardcoded for internal services
    if(['fs'] .. @hasElem(key)) {
      conf = require("seed:service/init/#{key}").init(conf, globalId) || null;
    }
    if(!conf) return null;
    return [key, conf];
  }) .. @filter .. @pairsToObject);
  serviceConfig._env = serviceEnv;
  @debug(`service config = $serviceConfig`);
  var serviceConfigFile = @path.join(appRunBase, "services.json");
  serviceConfigFile .. @fs.writeFile(JSON.stringify(serviceConfig));
  return serviceConfigFile;
};

// local app state (exposed by slaves). Provides information
// on a directly running app
exports.localAppState = (function() {
  var apps = {};

  var App = function(user, id) {
    @assert.string(id, 'appId');
    var globalId = getGlobalId(user, id);
    var machineName = getMachineName(user, id);
    var appRunBase = getAppRunPath(user, id);
    @mkdirp(appRunBase);
    //var pidPath = getPidPath(appRunBase);
    var logPath = @path.join(appRunBase, 'log');
    var appendAppLogs = block ->
      @fs.withWriteStream(logPath, {flags: 'a', encoding:'utf-8'}, block);

    var statePath = @path.join(appRunBase, 'state.json');
    var recheckPid = @Emitter();
    var clearLogs = -> @fs.open(logPath, 'w') .. @fs.close();
    var isStarting = @Condition();

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
        if (!isStarting.isSet) {
          waitfor {
            emit(false); // not running, and not starting
          } and {
            isStarting.wait();
          }
        }
        waitfor {
          emit(null);
        } and {
          recheckPid .. @wait();
        }
      }
    }) .. @dedupe .. @mirror;

    var startApp = function(throwing) {
      @info("Starting app: #{id}");
      if(isRunning.unsafe()) {
        if (throwing) @assert.fail("app already running!");
        else return false;
      }

      isStarting.set();
      try {

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
        // wrap fs into a stream
        var logStream = @fs.createWriteStream(logPath, {fd: stdio[1], encoding:'utf-8'});
        var log = msg -> logStream .. @stream._write(msg+"\n");

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

        log("Building environment...");

        var env = [];
        var dockerFlags = [];
        dockerFlags.push('--env', "SEED_SERVICE_CONFIG=" + writeServiceConfig(appRunBase, globalId));
        var sjsInit = [
          @url.normalize('./await-stdio.sjs', module.id) .. @url.toPath,
          require.resolve('mho:../hub').path .. @url.toPath,
          @url.normalize('../service/init.sjs', module.id) .. @url.toPath,
        ];
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

          var args = [process.execPath, @sys.executable, 'mho:server/main.sjs'];
          var runUser = "app";
          var readOnly = (path) -> "#{path}:#{path}:ro";

          (function() {
            // add nixos mount if present
            var path = '/run/current-system';
            var profile;
            try {
              @fs.stat('/etc/NIXOS');
              profile = @fs.readlink(path);
            } catch(e) {
              if(e.code === 'ENOENT') return []; // not a nixos box
              throw e;
            }
            @info("Launching docker container with profile path: #{profile}");
            // NOTE: this isn't used in the container, it's just a convenient
            // way to associate a path with the container (retrieved with
            // `docker inspect`). We use it to mark all running docker roots
            // as live when running `nixos-collect-garbage`
            dockerFlags.push('--volume', "#{profile}:/nix-root:ro");
          })();

          @env.get('app-host-mappings') .. @ownPropertyPairs .. @each {|[k,v]|
            dockerFlags.push("--add-host=#{k}:#{v}");
          }
            
          var stdio_marker_path = '/tmp/stdio-ready';

          args = [
            "docker",
            "run",
            "--detach",
            "--publish", "7075",
            //"--publish", "4043",
            "--name", machineName,
            "--hostname", machineName,
            "--user", runUser,
            "--memory", '250m', // XXX tune / configure
            "--workdir", codeDest,
            "--volume", readOnly(appRunBase),
            "--env", "SJS_INIT=#{sjsInit .. @join(":")}",
            "--env", "CONDUCTANCE_SEED=1",
            "--env", "STDIO_READY=#{stdio_marker_path}",
            "--env", "PATH="+@env.get('app-PATH'),
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
          ]).concat(dockerFlags).concat([
            "local/conductance-base", // image name
          ]).concat(args);
          @info("Running", args);
          try {
            waitfor {
              @childProcess.run(args[0],
                args.slice(1).concat([
                  'serve', '--port', '7075', '--host', 'any'
                ]),
                { stdio: ['ignore', 'ignore', 2] }
              );
              collapse;
              @info("Attaching output streams");
              @childProcess.launch('docker', ['attach', '--sig-proxy=false', machineName], {stdio:stdio});

              @info("Resuming execution");
              @childProcess.run('docker', ['exec', machineName, 'touch', stdio_marker_path], {stdio:'inherit'});

              if (!isRunning.unsafe()) {
                throw new Error("app failed to start");
              }
            } or {
              hold(50 * 1000);
              throw new Error("timed out waiting for app to start");
            }
          }
          finally {
            recheckPid.emit();
          }
          return true;
        } catch(e) {
          log(e.message);
          throw e;
        } finally {
          stdio.slice(1) .. @each(@fs.close);
        }
      } finally {
        isStarting.clear();
      }
    } .. safe();

    var stopApp = function() {
      @info("Stopping app #{machineName}");
      appendAppLogs {|log|
        log.write("Stopping application...\n");
        tryRunDocker(["stop", machineName], 'ignore');
        recheckPid.emit();
      }
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
      return "#{_loadState(statePath).config.name .. @keySafe}-#{user.id .. @keySafe()}"
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
    var statePath = @path.join(appBase, 'state.json');
    var safe = semaphoreWrapper();

    var [config, state, modifyState] = (function() {
      var loadState = function() {
        return _loadState(statePath);
      } .. safe();

      var val = @ObservableVar(loadState());
      var saveState = function() {
        var state = val.get();
        @logging.info("saving app state:", state);
        @mkdirp(appBase);
        @fs.writeFile(statePath, JSON.stringify(state, null, '  '), 'utf-8');
      };

      var modifyChild = function(key, orig, check) {
        // wraps `orig` modifier into a modificatino function that operates on
        // a child property, with an optional `check`
        return function(current, unchanged) {
          var child = orig(current[key], unchanged);
          if (child === unchanged) return unchanged;
          if (check) check(child);
          var rv = current .. @clone();
          rv[key] = child;
          return rv;
        };
      };

      var config = val .. @transform(x -> DEFAULT_CONFIG .. @merge(x.config));
      var state = val .. @transform(x -> x.state);
      config.modify = function(f) {
        f = modifyChild('config', f, function(config) {
            // validate new config before accepting
            config.name .. @validate.appName();
        });
        if (val.modify(f)) {
          saveState();
        }
      } .. safe();

      var modifyState = function(f) {
        if (val.modify(modifyChild('state', f))) {
          saveState();
        }
      } .. safe();

      return [config, state, modifyState];
    })();

    @job_master = require('./master');
    var startApp = function() {
      etcd .. @job_master.start(appId);
    };

    var stopApp = function() {
      etcd .. @job_master.stop(appId);
    };

    var deploy = function(stream, opts) {
      opts = opts || {};
      var strip = opts.strip;
      @mkdirp(appBase);
      var tmpdest = @path.join(appBase, "_code");
      var finaldest = @path.join(appBase, "code");
      
      var cleanup = -> @rimraf(tmpdest);

      if (@fs.exists(tmpdest)) {
        cleanup();
      }
      @mkdirp(tmpdest);
      try {
        stream .. @gzip.decompress .. limitStreamSize(appSizeLimit) .. @tar.extract({
          path: tmpdest,
          strip: strip,
        });

        //// sanity check that we have a config.mho
        //@assert.ok(@fs.exists(@path.join(tmpdest, 'config.mho')), "no config.mho found in code!");

        // stop app so that nothing is trying to run code while we're modifying it
        stopApp();

        // overwrite dir
        tryRename(finaldest, finaldest + '.old');
        @fs.rename(tmpdest, finaldest);
        tryRename(finaldest + '.old', tmpdest);

        // modify deployment state
        modifyState.unsafe(st -> st .. @merge({deployed: Date.now()}));

        // and restart it
        startApp();
      } catch (e) {
        cleanup();
        throw e;
      }
    } .. safe();

    var endpointStream = @Stream(function(emit) {
      var key = @etcd.app_endpoint(appId);
      @etcd.tryOp(-> etcd.set(key, "", {prevExist: false})); // explicitly `null` the key if it's not yet set

      etcd .. @etcd.values(key, {initial:true}) .. @each.track {|node|
        var serverId = node.value;
        @verbose("got etcd endpoint:", serverId);
        if (!serverId) {
          emit(false);
        } else {
          @verbose("polling slave endpoint:", serverId);
          etcd .. @etcd.values(@etcd.slave_endpoint(serverId), {initial:true}) .. @each.track {|url|
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
      state: state,
      start: startApp,
      stop: stopApp,
      deploy: deploy,
      synchronize: safe.lock.synchronize.bind(safe.lock),
      endpoint: endpointStream,
      publicUrlTemplate: "#{publicUrlBase.protocol}://{name}-#{user.id}.#{publicUrlBase.authority}/",
      toString: -> "<#App #{appId}>",
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
