var { appendContent } = require('mho:surface');
var sys = require('sjs:sys');
var cutil = require('sjs:cutil');
var logging = require('sjs:logging');
require('sjs:xbrowser/console').console({collapsed: false, receivelog: true});
window.run = function(code) {
	//logging.info("running: ", code);
	sys.eval(code, {filename: "inline"});
};
