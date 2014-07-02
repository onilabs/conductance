@fs = require('sjs:nodejs/fs');
var runner = process.env['RUN_USER'];
var pidfile = process.env['PIDFILE'];

var writeAtomically = function(path, contents) {
  var tmp = path + '.tmp';
  @fs.writeFile(tmp, contents);
  @fs.rename(tmp, path);
};

pidfile .. writeAtomically(String(process.pid));

process.setuid(runner);
process.setgid(runner);
console.warn("PID #{process.pid}, running as user #{runner}");

process.on('exit', function(code) {
  console.warn("DEAD: #{code}");
});
