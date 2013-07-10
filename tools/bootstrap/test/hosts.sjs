var child_process = require('sjs:nodejs/child-process');
var shell_quote = require('sjs:shell-quote');
var logging = require('sjs:logging');

var run = function(cmd, args) {
	logging.info("Running: #{cmd} #{shell_quote.quote(args)}");
	return child_process.run( cmd, args, {stdio:'inherit'});
};

var ssh = function(cmd) {
	return run('ssh', ['-p', this.port, this.user+"@"+this.host, '--'].concat(cmd));
};

var scp = function(src, dest) {
	return run('scp', ['-q', '-P', this.port, src, "#{this.user}@#{this.host}:#{dest}"]);
};

exports.linux = {
	host: 'localhost',
	user: 'sandbox',
	port: '22',
	proxy: 'http://meep.local:9090',
	runCmd: ssh,
	copyFile: scp,
};
