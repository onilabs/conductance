@ = require('mho:std');
var fsExt = require('nodejs:fs-ext');

var prefix = process.env['XDG_RUNTIME_DIR'] || '/run';
var runDir = @path.join(prefix, 'conductance-seed');
var lockPath = @path.join(runDir, 'state.lock');
var statePath = @path.join(runDir, 'state.json');
var newStatePath = @path.join(runDir, 'state.json.tmp');
var internalStateLock = @Semaphore(1);
var hasLock = false;

exports.acquire = function() {
	@assert.falsy(hasLock, "hasLock");
	try{
		@fs.mkdir(runDir);
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
	hasLock = true;
}

// you must hold internalStateLock
// when calling this function
var _load = function() {
	@assert.ok(hasLock);
	try {
		var contents = @fs.readFile(statePath, 'utf-8');
	} catch(e) {
		if (e.code == 'ENOENT') {
			return {};
		}
		throw e;
	}
	return JSON.parse(contents);
};

exports.load = function() {
	internalStateLock.synchronize {||
		return _load();
	}
}

exports.modify = function(f) {
	internalStateLock.synchronize {||
		var newState = f(_load());
		@assert.ok(newState);
		var contents = JSON.stringify(newState);
		newStatePath .. @fs.writeFile(new Buffer(contents));
		// once written, move file atomically
		// (so that external readers never see an inconsistent state
		@fs.rename(newStatePath, statePath);
	}
}
