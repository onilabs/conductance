#!/usr/bin/env sjs
@ = require('sjs:std');
var [port,NUM_TRIES, initial_prob, secondary_prob] = @argv();

initial_prob = initial_prob.. @assert.ok() .. parseFloat;
secondary_prob = secondary_prob .. @assert.ok() .. parseFloat;

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

var ffi = require('ffi');
var helper = ffi.Library('libfiu_helper', {
	'install_fiu_helper': ['int', ['double','double', 'int']],
	'failsafe_print': ['void', ['string']],
});

function PRINT(msg) {
	helper.failsafe_print(msg);
}

var DEBUG = -> null;
var enable_debug_log = 0;
if(false) {
	DEBUG = PRINT;
	enable_debug_log = 1;
}

function installHooks() {
	// install nodejs error hooks
	var stream = require('nodejs:stream');
	var net = require('nodejs:net');
	__js {
		var failureModes = {
			'readEnded': function() {
				this._readableState.ended = true;
				this._readableState.length = 0;
			},
			'writeEnded': function() {
				this._writableState.ended = true;
				this._writableState.length = 0;
			},
			'throwError': function() { throw new Error("synthetic err") },
			'closeEvent': function() {
				var self = this;
				setTimeout(-> self.emit('close', new Error("synthetic close event")), 0);
				return true;
			},
			'errorEvent': function() {
				var self = this;
				setTimeout(-> self.emit('error', new Error("synthetic err event")), 0);
				return false;
			},
		};
		failureModes.common = [
			//['throwError', failureModes.throwError],
			['errorEvent', failureModes.errorEvent],
			['closeEvent', failureModes.closeEvent],
		];
		failureModes.readable = failureModes.common.concat([['ended', failureModes.readEnded]]);
		failureModes.writable = failureModes.common.concat([['ended', failureModes.writeEnded]]);

		var failureOptions = {
			read: failureModes.readable,
			write: failureModes.writable,
			end: failureModes.writable,
		}
		function inject(source, method) {
			var failures = failureOptions[method] .. @assert.ok;
			DEBUG("injecting #{method} to #{source}");
			source[method] = function(o) {
				return function() {
					var i = Math.round(Math.random() * (failures.length-1));
					var response = failures[i];
					if(Math.random() <= 0.1) { // fail rarely
						response .. @assert.ok([method, i, failures.length, failures[i]]);
						var cont = response[1].call(this);
						if(cont === false) return;
					}
					return o.apply(this, arguments);
				}
			}(source[method] .. @assert.ok("no such method: #{method}"));
		}

		stream.Readable.prototype .. inject('read');
		;[
			stream.Writable.prototype,
			stream.Duplex.prototype,
			net.Socket.prototype,
		] .. @each(function(src) {
			src .. inject('write');
			src .. inject('end');
		});
	}

	// install libfiu error events
	helper.install_fiu_helper(initial_prob, secondary_prob, enable_debug_log) .. @assert.eq(0);
}



// on uncaught exception, exit immediately
process.on('uncaughtException', function(err) {
	try {
		PRINT('uncaughtException: ' + err);
		PRINT(err.stack);
	} finally {
		process.exit(1);
	}
});

PRINT('!r');
installHooks();
try {
	@ssh.connect(connectOpts) {|conn|
		PRINT('!c'); // connected
		for (var tries=NUM_TRIES; tries>0; tries--) {
			conn .. @ssh.sftp() {|sftp|
				sftp .. @ssh.writeFile('/tmp/sftp-test', 'sftp file contents');
				sftp .. @ssh.readFile('/tmp/sftp-test');
				sftp .. @ssh.readdir('/tmp');
			}
			conn .. @ssh.exec("true");
		}
	}
} catch(e) {
	// for the purpose of this test, a "caught" exception is correct.
	PRINT("Gracefully handled: #{e.message}");
}
