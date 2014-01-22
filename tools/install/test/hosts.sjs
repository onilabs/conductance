var childProcess = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var fs = require('sjs:nodejs/fs');
var { merge } = require('sjs:object');

var PRINT_COMMANDS = false;

var run = function(cmd, args) {
  logging.info("Running: #{cmd} #{shell_quote.quote(args)}");
  if (PRINT_COMMANDS) process.stderr.write("[Running: #{cmd} #{shell_quote.quote(args)} .. ");
  var result;

  try {
    result = exports.run(cmd, args, {stdio:[process.stdin, 'pipe', 'pipe']});
  } catch(e) {
    logging.warn(e.output);
    throw e;
  } finally {
    if (PRINT_COMMANDS) console.warn("done]");
  }
  logging.info(result.output);
  return result.output;
};

var ssh = function(cmd) {
  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--'].concat(cmd));
};

var replaceTemp = function(str, tempdir) {
  if (tempdir) {
    return str.replace(/\/tmp\//, tempdir);
  }
  return str;
};

var sshWindows = function(cmd) {
  assert.string(cmd);
  var HOME = "C:/Users/#{this.user}";
  cmd = cmd .. replaceTemp(HOME + '/' + this.tempdir);
  cmd = cmd.replace(/\$HOME/, HOME);

  var tmpfile = '/tmp/conductance-remote.sh'
  fs.writeFile(tmpfile, cmd);
  this.copyFile(tmpfile, this.tempdir + 'input.sh');

  return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--', 'bash', '-eux', HOME + '/' + this.tempdir + 'input.sh']);
};

var scp = function(src, dest) {
  return run('scp', ['-q', '-P', this.port, src, "#{this.user}@#{this.host}:#{dest}"]);
};

var sftp = function(src, dest) {
  dest = dest .. replaceTemp(this.tempdir);
  return run('bash', ['-c', "sftp -q -P #{this.port} -b - #{this.user}@#{this.host} <<EOF
put #{src} #{dest}
EOF"]);
}

// like childProcess.run(), but combines stdout/stderr
exports.run = function(command, args, options) {
  var output = [];
  function appendTo(buffer) {
    return function(data) { buffer.push(data); }
  };

  var child = childProcess.launch(command, args, options);
  if(child.stdout) child.stdout.on('data', appendTo(output));
  if(child.stderr) child.stderr.on('data', appendTo(output));
  function join(arr) { return arr.join(''); };

  try {
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

  var posixBase = {
    port: '22',
    runCmd: ssh,
    copyFile: scp,
    extractInstaller: "tar zxf",
    nativeScript: (script, args) -> shell_quote.quote([script].concat(args||[])),
  };

  var windowsBase = {
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
    runCmd: sshWindows,
    copyFile: sftp,
    tempdir: "AppData/Local/Temp/",
    extractInstaller: '0install run http://0install.de/feeds/SevenZip_CLI.xml x',
    
    // this does not do any quoting of args, but we dn't need that yet...
    nativeScript: (script, args) -> "$COMSPEC /c \"#{script.replace(/\//g,"\\\\").replace(/\.sh$/, '')}.cmd #{(args||[]).join(" ")}\"",
  };

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

