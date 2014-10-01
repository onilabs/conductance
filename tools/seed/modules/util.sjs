@ = require('sjs:std');
@fsExt = require('nodejs:fs-ext');
@constants = require('nodejs:constants');

exports.removeLeading = function(subj, leading) {
	@assert.ok(subj .. @startsWith(leading), `$subj does not start with $leading`);
	return subj.slice(leading.length);
};

exports.removeTrailing = function(subj, trailing) {
	@assert.ok(subj .. @endsWith(trailing), `$subj does not start with $trailing`);
	return subj.slice(0, - trailing.length);
};

exports.setCloexec = function(fd) {
	// NOTE: we use *Sync functions to make sure nobody is opening new file descriptors behind our back
	var flags = fd .. @fsExt.fcntlSync('getfd');
	var cloexec = flags | @constants.FD_CLOEXEC;
	if (flags !== cloexec) {
		// clexec flag not yet set:
		fd .. @fsExt.fcntlSync('setfd', cloexec);
	}
	((fd .. @fsExt.fcntlSync('getfd')) & @constants.FD_CLOEXEC) .. @assert.ok('CLOEXEC not set');
}
