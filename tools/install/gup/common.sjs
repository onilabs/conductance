var logging = require('sjs:logging');
var seq = require('sjs:sequence');
var {map, each, toArray} = seq;
var url = require('sjs:url');
logging.setLevel(process.env['GUP_XTRACE'] ? logging.INFO : logging.warn);

exports.assert = function(o, r) {
	if(!o) throw new Error(r);
	return o;
}

var selfUpdate = require('../share/self-update.js');
var run = exports.run = function(cmd /*, args */) {
	logging.info(" + #{cmd} #{arguments .. toArray .. seq.slice(1) .. seq.join(" ")}");
	waitfor(var err) {
		selfUpdate.runCmd(cmd, Array.prototype.slice.call(arguments, 1), resume);
	}
	if (err !== undefined) throw err;
};

run('gup', '-u', module.id .. url.toPath);
