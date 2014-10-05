var childProcess = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var fs = require('sjs:nodejs/fs');
var { lstrip, unindent } = require('sjs:string');
var { merge } = require('sjs:object');

var PRINT_COMMANDS = false;

var run = function(cmd, args, stdin, getOutput) {
  //logging.info("Running: #{cmd} #{shell_quote.quote(args)}");
  if (PRINT_COMMANDS) process.stderr.write("[Running: #{cmd} #{shell_quote.quote(args)} .. ");

  var fixOutput = function(result) {
    if (getOutput) {
      if (result.output.length) result.output += "\n";
      result.output += getOutput();
    }
    result.output = (result.output || '').replace(/\r/g, '').trim();
  };

  var result;
  try {
    result = exports.run(cmd, args, {stdio:[stdin === undefined ? process.stdin : stdin, 'pipe', 'pipe']});
    fixOutput(result);
  } catch(e) {
    fixOutput(e);
    if (e.output.length) {
      logging.warn(e.output);
    }
    throw e;
  } finally {
    if (PRINT_COMMANDS) console.warn("done]");
  }
  if (result.output.length > 0) {
    logging.info(result.output);
  }
  return result.output;
};

var runPython = function(script, quiet) {
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--', 'python'], script .. pythonPrelude(this, quiet));
}

var ssh = function(cmd) {
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--'].concat('bash', '-euc', shell_quote.quote([cmd])));
};

var pythonPrelude = function (script, self, quiet) {
  script = script .. lstrip('\n') .. unindent();
  assert.ok(self);
  if (!quiet)
    logging.info("* running python code:\n" + script.trim().replace(/^/gm, '# '));

  return "
from __future__ import print_function
import os,json,sys,user,re,shutil,subprocess,platform,time
WINDOWS = platform.system() == 'Windows'
HOME = user.home
from os import path
def mkdirp(dest):
  if not os.path.exists(dest):
    os.makedirs(dest)

run = subprocess.check_call
def run_input(input, cmd):
  p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
  p.communicate(input + '\\n')
  rv = p.wait()
  if rv != 0:
    raise subprocess.CalledProcessError(rv, cmd)


def rmtree(dest):
  if os.path.exists(dest):
    if WINDOWS:
      # rmtree fails on long paths in windows, so
      # we use rmdir, which we keep running until
      # it actually deleltes `dest`
      tries = 10
      while True:
        subprocess.check_call(['cmd.exe', '/C', 'rmdir', '/s', '/q', dest])
        if not os.path.exists(dest):
          break
        assert tries >= 0, 'rmdir: too many tries'
        print('rmdir sucks, retrying ...')
        tries -= 1
        time.sleep(0.5)
    else:
      shutil.rmtree(dest)

pathed_cmd = ['0install', 'run', 'http://gfxmonk.net/dist/0install/pathed.xml']

def extractInstaller(path):
  subprocess.check_call(#{JSON.stringify(self.commands.extract_installer)} + [path], stdout=open(os.devnull))

def exportProxy():
  env['CONDUCTANCE_FORCE_HTTP']='1'
  env['http_proxy'] = \'#{self.proxy}'

def script(path):
  if WINDOWS:
    if path.endswith('.sh'):
      path = path[:-3]
    path = path.replace('/','\\\\')
  return path + #{JSON.stringify(self.executableScriptSuffix)}
env = os.environ
TMP = env.get('TEMP', '/tmp')
SILENT=False
conductance=path.join(HOME, '.conductance')

env['CONDUCTANCE_DEBUG']='1'

try:
#{script.replace(/^/gm, '    ')}
except subprocess.CalledProcessError as e:
  if not SILENT:
    print('Command failed [%s]: %r' % (e.returncode, e.cmd), file=sys.stderr)
    sys.stderr.flush()
  sys.exit(1)
";
};

var runPythonWindows = function(script, quiet) {
  var tmpfile = '/tmp/conductance-remote.py'

  fs.writeFile(tmpfile, script .. pythonPrelude(this, quiet));
  var scriptPath = this.copyFile(tmpfile, 'input.py');

  var getOutput = function() {
    try {
      sftp.call(this, "AppData/Local/Temp/python-output.log", "/tmp/python-output.log", 'get');
      return fs.readFile('/tmp/python-output.log', 'utf-8');
    } catch(e) {
      logging.warn("ERROR: Couldn't get remote output: #{e.message} ...");
      return "";
    }
  }.bind(this);

  var HOME = "C:/Users/#{this.user}";
  return run('ssh',
    ['-p', this.port, this.user+"@"+this.host, '--', 'cmd /c "python ' + scriptPath + ' > %TEMP%/python-output.log 2>&1"'],
    undefined,
    getOutput
  );
}

var scp = function(src, dest) {
  run('scp', ['-q', '-P', this.port, src, "#{this.user}@#{this.host}:#{dest}"]);
};

var sftp = function(src, dest, op) {
  run('bash', ['-c', "sftp -q -P #{this.port} -b - #{this.user}@#{this.host} >/dev/null <<EOF
#{op || 'put'} #{src} #{dest}
EOF"]);
}

// like childProcess.run(), but combines stdout/stderr
exports.run = function(command, args, options) {
  var output = [];
  function appendTo(buffer) {
    return function(data) { buffer.push(data); }
  };

  var input = null;
  if (options && options.stdio && options.stdio[0]) {
    input = new Buffer(options.stdio[0], 'utf-8');
    options.stdio[0] = 'pipe';
  }
  var child = childProcess.launch(command, args, options);
  if(child.stdout) child.stdout.on('data', appendTo(output));
  if(child.stderr) child.stderr.on('data', appendTo(output));
  function join(arr) { return arr.join(''); };

  try {
    if (input !== null) {
      child.stdin.end(input);
    }
    childProcess.wait(child);
  } catch(e) {
    // annotate error with stdout / err info
    e.output = join(output);
    throw e;
  } retract {
    childProcess.kill(child, options);
  }
  return {output: join(output)};
};

// user-specific stuff:

exports.systems = (function() {
  var user = process.env['USER'];
  var hostname = childProcess.run('hostname', [], {stdio: [process.stdin, 'pipe', process.stderr]}).stdout.trim();

  var commonBase = {
    port: '22',
    runPython: runPython,
    copyFile: function(src, dest) {
      dest = '/tmp/' + dest;
      scp.call(this, src, dest);
      return dest;
    },
    catFile: (path) -> this.runPython("print(open(path.join(conductance, #{JSON.stringify(path)})).read())"),
  }

  var posixBase = commonBase .. merge({
    executableScriptSuffix: '',
    commands: {
      extract_installer: ['tar', 'zxf'],
    },
    sep: '/',
  });

  var windowsBase = commonBase .. merge({
    /*
     * A brief summary of what's needed on the
     * windows host:
     *
     * - python
     * - 0install (http://0install.de/?lang=en)
     * - freeSSHd (http://www.freesshd.com/)
     *    - configured to allow public key access
     *    - the SSH key auth stops working sometimes, a restart can fix it (!)
     * - bonjour (zeroconf networking - http://www.apple.com/support/downloads/bonjourforwindows.html)
     */
    runPython: runPythonWindows,
    executableScriptSuffix: '.cmd',
    copyFile: function(src, dest) {
      sftp.call(this, src, "AppData/Local/Temp/" + dest);
      return "C:/Users/IEUser/AppData/Local/Temp/" + dest;
    },
    catFile: function(path) {
      var localFile = "/tmp/catfile-output-#{process.pid}";
      sftp.call(this, ".conductance/" + path, localFile, 'get');
      var contents = fs.readFile(localFile, 'utf-8');
      fs.unlink(localFile);
      return contents;
    },
    commands: {
      extract_installer: ['0install', 'run', 'http://0install.de/feeds/SevenZip_CLI.xml', 'x', '-aoa'],
    },
    sep: '\\',
  });

  switch(user) {
    case 'tim':
      var proxy = (port) -> "http://#{hostname}.local:#{port}/";
      return [
        {
          platform: 'linux',
          arch: 'x64',
          host: -> posixBase .. merge({
            proxy: proxy(9090),
            host: 'localhost',
            user: 'sandbox',
          }),
        },

        {
          platform: 'linux',
          arch: 'x86',
          host: -> posixBase .. merge({
            proxy: proxy(9090),
            host: 'fedora-19-x86.local',
            user: 'sandbox',
          }),
        },

        {
          platform: 'darwin',
          arch: 'x64',
          host: -> posixBase .. merge({
            proxy: proxy(9091),
            host: 'mba.local',
            user: 'test',
          }),
        },

        {
          platform: 'windows',
          arch: 'x86',
          host: -> windowsBase .. merge({
            proxy: proxy(9092),
            host: 'IE10Win8.local',
            user: 'IEUser',
            port: '2222',
          }),
        },
      ];

    default: throw new Error("No test hosts configured for user #{user}");
  }
})();

