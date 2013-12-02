require('app:std').withBusyIndicator {||
	require('builtin:apollo-sys').eval("@ = require('mho:stdlib');");
	var c = window.c = require("sjs:xbrowser/console").console({collapsed: false, fullscreen:true, receivelog:true});
	c.focus();
	c.log("Console intialized");
}
