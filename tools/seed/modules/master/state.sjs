@ = require('mho:std');
@util = require('../util');
var fsExt = require('nodejs:fs-ext');

var prefix = @env('data-root');
var lockPath = @path.join(prefix, 'master.lock');
var hasLock = false;

exports.acquire = function() {
	@assert.falsy(hasLock, "hasLock");
	try{
		@fs.mkdir(prefix);
	} catch(e) {
		if (e.code != 'EEXIST') throw e;
	}
	
	var lockfile = @fs.open(lockPath, 'w');
	try {
		fsExt.flockSync(lockfile, 'exnb');
	} catch(e) {
		if (e.code == 'EAGAIN') {
			throw new Error("Cannot acquire lockfile");
		}
		throw e;
	}
	// NEVER let children inherit lockfile
	@util.setCloexec(lockfile);
	hasLock = true;
}
