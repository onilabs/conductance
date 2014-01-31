var childProcess = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var fs = require('sjs:nodejs/fs');
var { lstrip, unindent } = require('sjs:string');
var { merge } = require('sjs:object');

var PRINT_COMMANDS = false;

var run = function(cmd, args, stdin) {
  //logging.info("Running: #{cmd} #{shell_quote.quote(args)}");
  if (PRINT_COMMANDS) process.stderr.write("[Running: #{cmd} #{shell_quote.quote(args)} .. ");
  var result;
  try {
    result = exports.run(cmd, args, {stdio:[stdin === undefined ? process.stdin : stdin, 'pipe', 'pipe']});
  } catch(e) {
    logging.warn(e.output);
    throw e;
  } finally {
    if (PRINT_COMMANDS) console.warn("done]");
  }
  logging.info(result.output);
  return result.output.replace(/\r/g, '');
};

var runPython = function(script) {
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--', 'python'], script .. pythonPrelude(this));
}

var ssh = function(cmd) {
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--'].concat('bash', '-euc', shell_quote.quote([cmd])));
};

var pythonPrelude = function (script, self) {
  script = script .. lstrip('\n') .. unindent();
  assert.ok(self);
  logging.info("* running python code:\n" + script.trim().replace(/^/gm, '# '));
  return "
import os,json,sys,user,shutil, subprocess,platform
WINDOWS = platform.system() == 'Windows'
HOME = user.home
from os import path
def mkdirp(dest):
  if not os.path.exists(dest):
    os.makedirs(dest)

def rmtree(dest):
  if os.path.exists(dest):
    shutil.rmtree(dest)

run = subprocess.check_call
def run_input(input, cmd):
  p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
  p.communicate(input)
  rv = p.wait()
  if rv != 0:
    raise subprocess.CalledProcessError(rv, cmd)

def extractInstaller(path):
  subprocess.check_call(#{JSON.stringify(self.commands.extract_installer)} + [path], stdout=open(os.devnull))

def exportProxy():
  env['CONDUCTANCE_FORCE_HTTP']='1'
  env['http_proxy'] = \'#{self.proxy}'

def script(path):
  if WINDOWS:
    if path.endswith('.sh'):
      path = path[:-3]
    return path.replace('/','\\\\') + '.cmd'
  return path
env = os.environ
TMP = env.get('TEMP', '/tmp')
conductance=path.join(HOME, '.conductance')
#{script}";
};

var runPythonWindows = function(script) {
  var tmpfile = '/tmp/conductance-remote.py'
  fs.writeFile(tmpfile, script .. pythonPrelude(this));
  var scriptPath = this.copyFile(tmpfile, 'input.py');

  var HOME = "C:/Users/#{this.user}";
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--', 'python', scriptPath]);
}

var scp = function(src, dest) {
  run('scp', ['-q', '-P', this.port, src, "#{this.user}@#{this.host}:#{dest}"]);
};

var sftp = function(src, dest) {
  run('bash', ['-c', "sftp -q -P #{this.port} -b - #{this.user}@#{this.host} <<EOF
put #{src} #{dest}
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
    catFile: (path) -> this.runPython("print open(path.join(conductance, #{JSON.stringify(path)})).read()"),
  }

  var posixBase = commonBase .. merge({
    port: '22',
    runPython: runPython,
    copyFile: function(src, dest) {
      dest = '/tmp/' + dest;
      scp.call(this, src, dest);
      return dest;
    },
    commands: {
      extract_installer: ['tar', 'zxf'],
    },
    nativeScript: (script, args) -> shell_quote.quote([script].concat(args||[])),
  });

  var windowsBase = commonBase .. merge({
    /*
     * A brief summary of what's needed on the
     * windows host:
     *
     * - 0install (http://0install.de/?lang=en)
     * - freeSSHd (http://www.freesshd.com/)
     *    - configured to allow public key access
     *    - the SSH key auth stops working sometimes, a restart can fix it (!)
     * - bash (I'm using MSYS bash frm MinGW)
     * - bonjour (zeroconf networking - http://www.apple.com/support/downloads/bonjourforwindows.html)
     */
    runPython: runPythonWindows,
    copyFile: function(src, dest) {
      sftp.call(this, src, "AppData/Local/Temp/" + dest);
      return "C:/Users/IEUser/AppData/Local/Temp/" + dest;
    },
    commands: {
      extract_installer: ['0install', 'run', 'http://0install.de/feeds/SevenZip_CLI.xml', 'x'],
    },
    
    // this does not do any quoting of args, but we dn't need that yet...
    nativeScript: (script, args) -> "$COMSPEC /c \"#{script.replace(/\//g,"\\\\").replace(/\.sh$/, '')}.cmd #{(args||[]).join(" ")}\"",
  });

  switch(user) {
    case 'tim':
      var proxy = "http://#{hostname}.local:9090/";
      return [
        {
          platform: 'linux',
          arch: 'x64',
          host: -> posixBase .. merge({
            proxy: proxy,
            host: 'localhost',
            user: 'sandbox',
          }),
        },

        {
          platform: 'darwin',
          arch: 'x64',
          host: -> posixBase .. merge({
            proxy: proxy,
            host: 'mba.local',
            user: 'test',
          }),
        },

        {
          platform: 'windows',
          arch: 'x86',
          host: -> windowsBase .. merge({
            proxy: proxy,
            host: 'IE10Win8.local',
            user: 'IEUser',
            port: '2222',
          }),
        },
      ];

    default: throw new Error("No test hosts configured for user #{user}");
  }
})();

