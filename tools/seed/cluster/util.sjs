@ = require('sjs:std');

exports.removeLeading = function(subj, leading) {
	@assert.ok(subj .. @startsWith(leading), `$subj does not start with $leading`);
	return subj.slice(leading.length);
};

