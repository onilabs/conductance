var child_process = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');

var run = function(cmd, args) {
  logging.info("Running: #{cmd} #{shell_quote.quote(args)}");
  var result;

  try {
    result = exports.run(cmd, args, {stdio:[process.stdin, 'pipe', 'pipe']});
  } catch(e) {
    logging.warn(e.output);
    throw e;
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

exports.linux = {
  host: 'localhost',
  user: 'sandbox',
  port: '22',
  proxy: 'http://meep.local:9090',
  runCmd: ssh,
  copyFile: scp,
};

// like child_process.run(), but combines stdout/stderr
exports.run = function(command, args, options) {
  var output = [];
  function appendTo(buffer) {
    return function(data) { buffer.push(data); }
  };

  var child = child_process.launch(command, args, options);
  if(child.stdout) child.stdout.on('data', appendTo(output));
  if(child.stderr) child.stderr.on('data', appendTo(output));
  function join(arr) { return arr.join(''); };

  try {
    child_process.wait(child);
  } catch(e) {
    // annotate error with stdout / err info
    e.output = join(output);
    throw e;
  } retract {
    child_process.kill(child, options);
  }
  return {output: join(output)};
};
