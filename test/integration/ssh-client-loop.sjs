#!/usr/bin/env sjs
@ = require('sjs:std');
var [port,NUM_TRIES] = @argv();

@ssh = require('mho:ssh-client');

var connectOpts = {
	port: port .. parseInt(),
	host: '127.0.0.1',
	username: process.env.USER,
};

if(NUM_TRIES) NUM_TRIES = parseInt(NUM_TRIES, 10);
else NUM_TRIES = 10;

var sshDir = "#{process.env.HOME}/.ssh";
var key = [ "id_rsa", "id_dsa" ] .. @transform(f -> @path.join(sshDir, f)) .. @find(@fs.exists, null);
if(!key) throw new Error("Couldn't find SSH key");
connectOpts.privateKey = key .. @fs.readFile('ascii');

// on uncaught exception, exit immediately
process.on('uncaughtException', function(err) {
	try {
		console.log('uncaughtException: ' + err);
	} finally {
		process.exit(1);
	}
});

;[process.stdin, process.stdout, process.stderr] .. @each {|stream|
	// `libfiu` will also randomly cause console IO operations to fail,
	// so ignore those...
	stream.on('error', function() { /* ignore */ });
};

try {
	try {
		@prompt('!r\n'); // wait until ready signalled
		process.stdin.end(); // make sure node exits properly
	} catch(e) {
		// if we didn't get this far, the test is useless - just get out of here
		process.exit(0);
	}
	@ssh.connect(connectOpts) {|conn|
		console.log('!c'); // connected
		for (var tries=NUM_TRIES; tries>0; tries--) {
			conn .. @ssh.sftp() {|sftp|
				sftp .. @ssh.writeFile('sftp-test', 'sftp file contents');
				sftp .. @ssh.readFile('sftp-test');
				sftp .. @ssh.readdir('.');
			}
			conn .. @ssh.exec("true");
		}
	}
} catch(e) {
	// for the purpose of this test, a "caught" exception is correct.
	try {
		console.log("Gracefully handled: #{e.message}"); // XXX debugging only
	} catch(e) { /* libfiu can cause write() to fail, so just ignore this */ }
}
