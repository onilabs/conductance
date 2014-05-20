#!/usr/bin/env sjs
@ = require('sjs:std');
var { @quote } = require('sjs:shell-quote');
var Connection = require('nodejs:ssh2');

var quoteCmds = function(commands) {
	return command .. @map(@quote) .. @join('; ');
}

var terminate = function(conn) {
	@debug("terminating connection");
	// shutdown procedure
	waitfor {
		waitfor {
			var err = conn .. @wait('close');
			@debug("CLOSE");
			if (err) throw err;
		} and {
			conn .. @wait('end');
			@debug("END");
		} and {
			conn.end();
		}
	} or {
		hold(1000);
		@warn("connection didn't terminate in 5s; exiting");
	}
};

var CommandFailedProto = new Error('Command failed');
var CommandFailed = function(code) {
	var rv = Object.create(CommandFailedProto);
	rv.code = code;
	return rv;
}

var exec = function(conn, command, block) {
	if (command .. @isQuasi()) {
		command = command .. @mapQuasi(s -> @quote([s])) .. @join('');
	}

	if (command .. @isArrayLike()) {
		command = @shellQuote.quote(command);
	}
	command = 'exec bash -euc ' + @quote([command]);

	waitfor(var err, stream) {
		@debug("running: #{command}");
		conn.exec(command, resume);
	}
	if (err) throw err;

	stream.data = @Stream(function(emit) {
		while(true) {
			var chunk = stream .. @read();
			if (chunk == null) break;
			emit(chunk);
		}
	});
	//if (!block) return stream;

	var exitStatus;
	waitfor {
		exitStatus = stream .. @wait('exit');
		@debug("exited: #{exitStatus}");
	} and {
		try {
			block(stream);
		} finally {
			if (exitStatus === undefined) {
				stream.resume(); // XXX allows events through unrelated to `data`, because ssh2 is implemented weird.
				stream.end(); // send EOF
			}
			//	waitfor {
			//		stream .. @wait('exit');
			//	} or {
			//		// XXX this doesn't seem to be doing anything...
			//		;['INT', 'TERM', 'KILL'] .. @each {|sig|
			//			@warn("sending #{sig}");
			//			stream.signal(sig);
			//			hold(3000);
			//		}
			//		hold();
			//	}
			//}
		}
	}

	var signal = null;
	if (@isArrayLike(exitStatus)) {
		[ exitStatus, signal ] = exitStatus;
	}
	if (exitStatus != 0) {
		@debug("exit status: #{exitStatus}; signal: #{signal}");
		throw CommandFailed(exitStatus);
	}
	@debug("command exited successfully");
};

var Connect = exports.Connect = function(opts, block) {
	@assert.ok(block);
	var conn = new Connection();
	conn.connect(opts);
	try {
		waitfor {
			var err = conn .. @wait('error');
			@debug("ERROR: #{err}");
			throw err;
		} or {
			conn .. @wait('timeout');
			throw new Error("Connection timed out");
		} or {
			conn .. @wait('ready');
			block(conn);
		}
	} finally {
		conn .. terminate();
	}
};

var installConductance = function(conn, root) {
	conn .. exec(`
		set -eux;
		exec 2>&1;
		echo '#INFO HELLO'
		function install () {
			ln -s '/home/tim/dev/oni/conductance' $root
		}
		if test ! -e $root/conductance; then
			echo '#INFO Installing conductance ...'
			mkdir -p "\$(dirname $root)"
			install
			echo INSTALL
		else
			echo OK
		fi
	`) {|out|
		out.setEncoding('utf-8');
		var response;
		var output = [];
		out .. @lines .. @each { |line|
			line = line.trim();
			output.push(line);
			@debug('LINE:', line);
			if (line.length == 0) continue;
			response = line;
			if (line .. @startsWith('#INFO')) {
				@info(line.slice(6).trim());
			}
		}
		@debug('response:', response);
		switch(response) {
			case 'INSTALL':
				@info("Installed conductance to #{root}");
				break;
			case 'OK':
				@info("Conductance already installed in #{root}");
				break;
			default:
				console.log("Unexpected response: #{response}\n#{output .. @join('\n')}");
				throw new Error("Unexpected response: #{response}\n#{output .. @join('\n')}");
		}
	}
}

var runSeed = exports.runSeed = function(conn, root, block) {
	conn .. exec(`
		set -eux;
		cd $root/tools/seed
		exec ../../conductance -vvv serve
	`) {|out|
		out.setEncoding('utf-8');
		var response;
		var output = [];
		var ready = @Condition();
		waitfor {
			waitfor {
				out .. @lines .. @each { |line|
					line = line.trim();
					@warn('CONDUCTANCE OUT: ' + line);
					if (line .. @startsWith("Conductance serving address:")) {
						ready.set();
					}
				}
			} and {
				ready.wait();
				block();
			}
		} or {
			out .. @wait('exit');
		}
	}
}

var proxyConnections = exports.proxyConnections = function(sshConn, port, block) {
	var net = require('nodejs:net');
	var tempfile = require('sjs:nodejs/tempfile');
	tempfile.TemporaryDir({prefix:"conductance-proxy"}) {|dir|
		var sockPath = @path.join(dir, "conductance.sock");
		var connections = @Queue(5);
		@info("Setting up #{sockPath}");
		var server = net.createServer();
		server.listen(sockPath);

		// NOTE: this is unbound
		var strata = [];
		server.on("connection", function(conn) {
			var s = spawn(function() {
				hold(0);
				try {
					@info("proxy start [active=#{strata.length}]");
					sshConn .. forwardOut(port) {|stream|
						waitfor {
							conn .. @pump(stream);
							stream.end();
						} and {
							stream .. @pump(conn);
							conn.end();
						}
					}
				} catch(e) {
					@warn("Error in connection handler:\n#{e}");
				} finally {
					conn.end();
					strata .. @remove(s) .. @assert.ok();
				}
			}());
			strata.push(s);
		});

		var err = server .. @wait('listening');
		@info("listening...");

		waitfor {
			server .. @wait('close');
		} and {
			try {
				block(sockPath);
			} finally {
				strata .. @each.par(s -> s.abort());
				server.close();
			}
		}
	}
}

var forwardOut = function(conn, port, block) {
	waitfor (var err, stream) {
		conn.forwardOut('localhost', port, 'localhost', port, resume);
	}
	if(err) throw err;
	waitfor {
		var err = stream .. @wait(['end', 'error']);
		if (err) throw err;
	} and {
		block(stream);
	}
};

if (require.main === module) {
	@logging.setLevel(@logging.DEBUG);
	Connect({
		host: 'localhost',
		port: 22,
		username: 'tim',
		//debug: console.log,
		privateKey: @fs.readFile(process.env.HOME + '/.ssh/id_rsa')
	}) {|conn|
		//conn .. installConductance('/tmp/condy');
		//conn .. runSeed('/home/tim/dev/oni/conductance') {||
			console.log("PID: #{process.pid}");
			conn .. proxyConnections(7079) {|path|
				@info("got local proxy: #{path}");
				hold();
			}
			//conn .. forwardOut(7091, 7079) {|stream|
			//	console.log("forwarding #{7091}");
			//	var data = [
			//		'HEAD / HTTP/1.1',
			//		'User-Agent: curl/7.27.0',
			//		'Host: 127.0.0.1',
			//		'Accept: */*',
			//		'Connection: close',
			//		'',
			//		''
			//	];
			//	console.log(stream);
			//	stream.setEncoding('utf-8');
			//	stream.write(data.join('\r\n'));
			//	stream .. @lines .. @each {|l|
			//		@warn(l.trim());
			//	}
			//	//hold();
			//	//@http.get('http://localhost:7091/') .. console.log();
			//}
		//}
	}
}
