@ = require('sjs:sequence');
@fs = require('sjs:nodejs/fs');
@childProcess = require('sjs:nodejs/child-process');
@url = require('sjs:url');

@childProcess.run('gup', ['-u', module.id .. @url.toPath()], {stdio:'inherit'});

exports.walk = function walkdir(path, cb) {
	var files = @fs.readdir(path);
	files .. @each {
		|f|
		if (@fs.isDirectory(path+"/"+f))
			walkdir(path+"/"+f, cb);
		else
			cb(path+"/"+f);
	};
}
