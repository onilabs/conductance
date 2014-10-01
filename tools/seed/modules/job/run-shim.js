var runner = process.env['RUN_USER'];

process.setuid(runner);
process.setgid(runner);
console.warn("PID " + process.pid + " running");

process.on('exit', function(code) {
  console.warn("Process exited: " + code);
});

console.warn("initial args:", process.argv);

process.argv.splice(1, 1);
console.warn("new args:", process.argv);
console.warn("requiring:", process.argv[1]);
require(process.argv[1]);
