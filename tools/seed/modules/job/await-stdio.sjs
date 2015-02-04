// There's a race condition between `docker start`
// and `docker attach`. So that we don't lose logs
// (particularly very early crashes), we inject this wrapper
// via $SJS_INIT which will block process execution until stdio is ready

var fs = require('sjs:nodejs/fs');
var path = process.env['STDIO_READY'];
if(!path) throw new Error("$STDIO_READY");
while(!fs.exists(path)) {
	hold(100);
}
fs.unlink(path);
delete process.env['STDIO_READY']
