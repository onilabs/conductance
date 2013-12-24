withBusyIndicator {||
	require('builtin:apollo-sys').eval("window['__oni_altns'] = require('mho:std')");
	var c = window.c = require("sjs:xbrowser/console").console({collapsed: false, fullscreen:true, receivelog:true});
	c.focus();
	c.log("Console intialized");
}
