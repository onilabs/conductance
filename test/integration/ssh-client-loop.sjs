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
	while(true) {
		// we had a legitimate failure. Keep trying to write it
		// until we succeed (or die trying)
		try {
			console.error('Uncaught: ' + err);
			process.exit(1);
		} catch(e) { }
	}
});

try {
	@prompt('!r\n'); // wait until ready signalled
	@ssh.connect(connectOpts) {|conn|
		console.log('!c'); // connected
		for (var tries=NUM_TRIES; tries>0; tries--) {
			conn .. @ssh.exec("true");
		}
	}
} catch(e) {
	// for the purpose of this test, a "caught" exception is correct.
	try {
		console.log("Gracefully handled: #{e.message}"); // XXX debugging only
	} catch(e) { /* libfiu can cause write() to fail, so just ignore this */ }
	process.exit(0);
}
process.exit(0);
