/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
@ = require(['mho:std']);
@tar = require('sjs:nodejs/tar');
@gzip = require('sjs:nodejs/gzip');

exports.upload = function(app, root) {
	if(!@fs.exists(root)) {
		throw new Error("No such directory: #{root}");
	}
	var contents = @tar.pack(root) .. @gzip.compress;
	var payload = @Stream(function(emit) {
		var i=0;
		var chunk;
		var chunks=[];
		var lastTime = 0;
		var send = function(chunk) {
			if (chunks.length > 0) {
				@debug("[> chunk #{i}: #{chunks.length}]");
				var buf = Buffer.concat(chunks);
				@debug("[send #{chunks.length} chunks (#{buf.length}b)");
				emit(buf);
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
