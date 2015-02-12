@fs = require('sjs:nodejs/fs');

// NOTE: to simplify security concerns and potential for accessing
// resources belong to other apps, we limit this interface to:
//
//  - no ability to create symlinks
//  - we only expose APIs that deal with paths or objects
//    i.e. you can't do fs.read(fd), because FDs are trivially
//    spoofed. Instead, we rely on bridge encapsulation to ensure
//    that the client can only invoke functions we supply them with.
//  - to prevent leaks, we only expose full operations - i.e no
//    calls that keep a file open upon completion.

module.exports = {
	_init: function(getPath) {
		this._path = getPath;
	},
	rename: (a,b) -> @fs.rename(this._path(a), this._path(b)),
	chmod: (a, mode) -> @fs.chmod(this._path(a), mode),
	stat: (a) -> @fs.stat(this._path(a)),
	utimes: (a, atime, mtime) -> @fs.utimes(this._path(a)),
	unlink: (a) -> @fs.unlink(this._path(a)),
	rmdir: (a) -> @fs.rmdir(this._path(a)),
	mkdir: (a, mode) -> @fs.mkdir(this._path(a), mode),
	readdir: (a) -> @fs.readdir(this._path(a)),
	readFile: (a, opts, encoding) -> @fs.readFile(this._path(a), opts, encoding),
	writeFile: (a, data, encoding) -> @fs.writeFile(this._path(a), data, encoding),
	fileContents: (a, encoding) -> @fs.fileContents(this._path(a), encoding),
	exists: (a) -> @fs.exists(this._path(a)),
	isFile: (a) -> @fs.isFile(this._path(a)),
	isDirectory: (a) -> @fs.isDirectory(this._path(a)),
};

