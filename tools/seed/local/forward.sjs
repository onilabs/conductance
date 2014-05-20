#!/usr/bin/env sjs

@ = require('sjs:std');

var forward = exports.forward = function(a, b) {
	waitfor {
		a .. @pump(b);
		b.end();
	} and {
		b .. @pump(a);
		a.end();
	}
}

if (require.main === module) {
	var net = require('nodejs:net');
	var server = net.createServer();
	waitfor {
		server.listen(8046, 'localhost');
		server.on("connection", function(conn) {
			console.log("CONNECTED");
			var fwd = net.createConnection({ port: 8000 });
			waitfor {
				fwd .. @wait('connect');
				console.log("forwarder connected");
				if (err) throw err;
				console.log("Connected");
				exports.forward(conn, fwd);
				console.log("Done");
			} or {
				var err = fwd .. @wait(['error', 'end']);
				// XXX why array?
				console.log("ERR:#{err}", err);
				//if(err) throw err;
			}
		});
		server .. @wait('listening');
		console.log("listening");
		hold();
	} or {
		var err = server .. @wait(['error', 'end']);
		if(err) throw err
	}
}
