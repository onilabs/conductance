@ = require(['mho:std']);
@tar = require('sjs:nodejs/tar');
@gzip = require('sjs:nodejs/gzip');

exports.upload = function(app, root) {
	var contents = @tar.pack(root) .. @gzip.compress;
	var payload = @Stream(function(emit) {
		var i=0;
		var chunk;
		var chunks=[];
		var lastTime = 0;
		var send = function(chunk) {
			if (chunks.length > 0) {
				@debug("[> chunk #{i}: #{chunks.length}]");
				@debug("[= chunk #{i++}: #{chunks.length}]");
				emit(Buffer.concat(chunks));
				chunks = [];
			}
		};

		contents .. @each {|chunk|
			chunks.push(chunk);

			var now = Date.now();
			if (Math.abs(now - lastTime) > 200) {
				// if last round-trip was less than 200ms ago, keep accumulating
				lastTime = now;
				send();
			}
		}
		send();
	});
	app.deploy(payload, {strip:1});
}
