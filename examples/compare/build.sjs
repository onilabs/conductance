var childProcess = require('sjs:nodejs/child-process');
var fs = exports.fs = require('sjs:nodejs/fs');
var path = require('nodejs:path');
var { each, map, concat, filter, join, toArray, integers } = require('sjs:sequence');
var { contains } = require('sjs:array');
var assert = require('sjs:assert');
var Url = require('sjs:url');
var { startsWith, endsWith } = require('sjs:string');

[exports.target, exports.source, exports.tempfile] = require('sjs:sys').argv();

var TRACE = exports.TRACE = process.env.REDO_XTRACE;
var run = exports.run = function(cmd, args) {
	if(TRACE) {
		console.warn('+', cmd, args.join(' '));
	}
	return childProcess.run(cmd, args, {stdio:'inherit'});
}
run('redo-ifchange', [module.id .. Url.toPath]);

/*
 * Highlight SJS source code:
 */
var highlight = exports.highlight = (function() {
	// XXX dupliacted with ../chat/default.do
	run('redo-ifchange', ['../node_modules/ace']);
	require("amd-loader");
	// load jsdom, which is required by Ace
	require("nodejs:ace/lib/ace/test/mockdom");
	
	// load the highlighter and the desired mode and theme
	var highlighter = require("nodejs:ace/lib/ace/ext/static_highlight");
	var SJSMode = require("nodejs:ace/lib/ace/mode/sjs").Mode;
	var JSMode = require("nodejs:ace/lib/ace/mode/javascript").Mode;
	var theme = require("nodejs:ace/lib/ace/theme/eclipse");
	var styleWritten = false;
	return function(src, lang) {
		lang = lang || 'sjs';
		var mode = lang == 'js' ? new JSMode() : new SJSMode();
		var highlighted = highlighter.render(src, mode, theme, 1, true);
		var css = highlighted.css.split("\n");

		css = css
			// remove clear declaration. It's only needed when
			// displaying the gutter, but we've disabled that.
			.. filter(line -> ! /clear:/.test(line))
			// strip out font declarations:
			.. filter(line -> ! /font-(family|size)/.test(line))
			// and background colours
			.. filter(line -> ! /background-/.test(line))
		;

		css = "
			.ace_line { min-height: 1em; }
			#{css .. join("\n")}
		";

		var escapeJS = function(src) {
			src = src.replace(/\\/g,'\\\\');
			src = src.replace(/'/g,"\\'");
			return "'#{src}'";
		}
		var args = [lang, highlighted.html];
		var rv = {
			code: "samples.addCode(#{args .. map(escapeJS) .. join(", ")});",
			css: css
		};
		return rv;
	}
})();

