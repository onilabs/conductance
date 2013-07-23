var childProcess = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');

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

var scp = function(src, dest) {
  return run('scp', ['-q', '-P', this.port, src, "#{this.user}@#{this.host}:#{dest}"]);
};

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

var hosts = (function() {
  var user = process.env['USER'];
  var hostname = childProcess.run('hostname', [], {stdio: [process.stdin, 'pipe', process.stderr]}).stdout.trim();

  switch(user) {
    case 'tim':
      var proxy = "http://#{hostname}.local:9090/";
      return {
        linux: -> {
          host: 'localhost',
          user: 'sandbox',
          port: '22',
          proxy: proxy,
          runCmd: ssh,
          copyFile: scp,
        },
        mac: -> {
          host: 'mba.local',
          user: 'test',
          port: '22',
          proxy: proxy,
          runCmd: ssh,
          copyFile: scp,
        },
        // TODO: windows
      }

    default: throw new Error("No test hosts configured for user #{user}");
  }
})();



exports.systems = [
    {
      platform: 'linux',
      arch: 'x64',
      host: hosts.linux,
    },
    {
      platform: 'darwin',
      arch: 'x64',
      host: hosts.mac,
    },
    {
      platform: 'windows',
      arch: 'x64',
      host: hosts.windows,
    },
  ];
