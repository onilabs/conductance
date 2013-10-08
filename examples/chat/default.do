#!/usr/bin/env sjs
// vim: set syntax=sjs:
var childProcess = require('sjs:nodejs/child-process');
var fs = require('sjs:nodejs/fs');
var path = require('nodejs:path');
var { each, map, concat, filter, join, toArray, integers } = require('sjs:sequence');
var { contains } = require('sjs:array');
var assert = require('sjs:assert');
var { startsWith, endsWith } = require('sjs:string');

var TRACE = process.env.REDO_XTRACE;
var run = function(cmd, args) {
	if(TRACE) {
		console.warn('+', cmd, args.join(' '));
	}
	return childProcess.run(cmd, args, {stdio:'inherit'});
}

var [target, _, tempfile] = require('sjs:sys').argv();
var dir = path.dirname(target);
var filename = path.basename(target);
if (dir == ".") {
	dir = target;
	filename = "";
}
var src = "src";
var macroFile = path.join(src, 'res', 'macros')
var filepp = '../../tools/filepp';
var fileppArgs = ['-imacros', macroFile, '-mp', '$', '-mpnk'];

if(dir === src) {
	console.warn("WARN: attempt to build #{target} ignored");
	process.exit(0);
}

assert.ok(dir .. startsWith('step'), "invalid directory name #{dir} making #{target}");
var stepno = parseInt(dir.slice("step".length));

var stepTitles = [
	undefined, // for 1-based indexing
	"Simple Display",
	"Derived Values",
	"User Input",
	"Multiple Users",
	"Dealing With Errors",
];
assert.ok(stepTitles[stepno], "step #{stepno} is not defined (update default.do)");



/*
 * Highlight SJS source code:
 */
var HIGHLIGHT_ON='//hl_on', HIGHLIGHT_OFF='//hl_off', HIGHLIGHT_NOOP='//hl_noop';
var highlight = (function() {
	run('redo-ifchange', ['../node_modules/ace']);
	require("amd-loader");
	// load jsdom, which is required by Ace
	require("nodejs:ace/lib/ace/test/mockdom");
	
	// load the highlighter and the desired mode and theme
	var highlighter = require("nodejs:ace/lib/ace/ext/static_highlight");
	var SJSMode = require("nodejs:ace/lib/ace/mode/sjs").Mode;
	var ShellMode = require("nodejs:ace/lib/ace/mode/sh").Mode;
	var theme = require("nodejs:ace/lib/ace/theme/eclipse");
	var styleInserted = false;
	return function(src, lang) {
		var mode = lang == 'sh' ? new ShellMode() : new SJSMode();
		var src_lines = src.split("\n");
		var highlights = [];
		var lineno = 0;
		var in_hl = false;
		src_lines = src_lines .. filter(function(line) {
			if (line.trim() == HIGHLIGHT_ON) {
				in_hl = true;
			} else if (line.trim() == HIGHLIGHT_OFF) {
				in_hl = false;
			} else if (line.trim() == HIGHLIGHT_NOOP) {
				// ignore this line
			} else {
				// normal line
				if(in_hl) highlights.push(lineno);
				lineno++;
				return true;
			}
		});

		src = src_lines .. join("\n");

		var highlighted = highlighter.render(src, mode, theme, 1, true);
		if (!styleInserted) {
			styleInserted = true;
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

			console.log("
				<style type=\"text/css\" media=\"screen\">
					.ace_line { min-height: 1em; }
					.ace_static_highlight .highlight { background: #fff; }
					.ace_static_highlight .non_highlight, .ace_static_highlight .non_highlight * { color: #888 !important; }
					#{css .. join("\n")}
				</style>
			");
		}
		var lineno = 0;
		var has_highlights = highlights.length > 0;
		var default_line_style = has_highlights ? 'ace_line non_highlight' : 'ace_line';
		var html = highlighted.html.replace(/\bace_line\b/g, function(match) {
			if (highlights .. contains(lineno++)) {
				return 'ace_line highlight';
			} else {
				return default_line_style;
			}
		});
		return html;
	}
})();

/*
 * Create directory, and ensure it doesn't have any
 * additional unwanted files
 */
var createDirectory = function(dir) {
	// ensure dir does not contain anything extra
	run('redo-ifchange', ['inputs']);
	var inputs = fs.readFile('inputs', 'utf-8').split("\n") .. filter (f -> ! f .. contains(path.sep))  .. toArray();
	var expectedFiles = inputs .. map(l -> l.replace(/\.md$/, ''));

	if (!fs.exists(dir)) {
		console.warn("Making #{dir}");
		fs.mkdir(dir);
	} else {
		fs.readdir(dir) .. each {|file|
			if (file .. path.extname() === '.tmp') continue;
			if (!expectedFiles .. contains(file)) {
				var p = path.join(dir, file);
				console.warn("Removing #{p}");
				fs.unlink(p);
			}
		}
	}
};

var macroDefinitions = function(isDoc) {
	var defines = [];
	if(isDoc) {
		defines.push('DOC');
		defines.push("TITLE=#{stepTitles[stepno]}");
		if (stepTitles[stepno-1]) {
			defines.push("PREV_STEPNO=#{stepno-1}");
			defines.push("PREV_STEP_TITLE=#{stepTitles[stepno-1]}");
		}
		if (stepTitles[stepno+1]) {
			defines.push("NEXT_STEPNO=#{stepno+1}");
			defines.push("NEXT_STEP_TITLE=#{stepTitles[stepno+1]}");
		}
	}
	defines.push("STEPNO=#{stepno}");
	defines.push("STEP#{stepno}");
	defines.push("STEP#{stepno}_ONLY");

	integers(1, stepno-1) .. each {|i|
		defines.push("STEP#{i}");
		defines.push("hl_#{i}=#{HIGHLIGHT_NOOP}");
	}

	defines.push("hl_#{stepno}=#{isDoc ? HIGHLIGHT_ON : HIGHLIGHT_NOOP}");
	defines.push("hl_off=#{isDoc ? HIGHLIGHT_OFF : HIGHLIGHT_NOOP}");
	if(TRACE) console.warn('defines: ', defines);
	return defines;
};

/*
 * Generate HTML from the input markdown
 */
var createHtml = function(source) {
	var sources = fs.readFile('inputs', 'utf-8').split("\n") .. filter()  .. map(f -> path.join(src, f));
	run('redo-ifchange', sources);
	fs.readFile(path.join(src, 'res','_head.html'), 'utf-8') .. console.log();

	var defines = macroDefinitions(true);
	var args = fileppArgs.concat([source]).concat(defines .. map(d -> "-D#{d}"))
	if(TRACE) args.unshift('-dl');
	if(TRACE) console.warn('+', filepp, args.join(' '));
	var md = childProcess.run(filepp, args, {stdio:[0,'pipe',2]}).stdout;
	assert.ok(md);
	var currentFile = null;
	// insert file markers
	md = md.replace(/^(<!-- +file: *([^- ]*) *-->)|^((?:[^ \n].*?\n)(?:\s*\n)*)(     *\S)/gm, function(match, isFilename, filename, pre, code) {
		if(TRACE) { console.warn("FILE match: ", toArray(arguments).slice(1,4)); }
		if(isFilename) {
			currentFile = filename;
		}
		var marker = currentFile ? "<!-- #FILE: #{currentFile} -->\n\n" : "";
		return isFilename ? marker : "#{pre}#{marker}#{code}";
	});
	if(TRACE) console.warn(md);

	var opts = {gfm: true};

	opts.highlight = highlight;

	var htmlContents = require('sjs:marked').convert(md, opts);

	// break content div at info-box boundaries
	htmlContents = htmlContents.replace(/^(<div class="info">(.|\n)*?<\/div>)/gm, "</div>$1<div class=\"content\">");

	// insert filename markers
	htmlContents = htmlContents.replace(/<!-- #FILE: (\S+) -->\s*<pre>/gm, "<pre><span class=\"filename\">$1</span>");

	htmlContents .. console.log();

	fs.readFile(path.join(src, 'res','_foot.html'), 'utf-8') .. console.log();
};


/*
 * generate source code
 * (i.e include only indented blocks from a file)
 */
function createCode(source) {
	var defines = macroDefinitions(false);
	run('redo-ifchange', [macroFile]);
	defines.push("STEP#{stepno}_ONLY");

	var out = childProcess.run(filepp,
		concat(
			fileppArgs,
			defines .. map(flag -> "-D#{flag}"),
			[source]
		) .. toArray(),
		{stdio:[0,'pipe',2]}
	).stdout;

	var is_code = true;
	var firstline = true;
	out.split("\n") .. each {|line|
		var old_is_code = is_code;
		is_code = line .. startsWith('    ');
		if (is_code) {
			if (!firstline && !old_is_code) console.log();
			if (line.trim() === HIGHLIGHT_NOOP) continue;
			console.log(line.slice(4));
			firstline = false;
		}
	}
};


/******************************
 * actually build the target:
 ******************************/



if (!filename) {
	createDirectory(dir);
} else {
	run('redo-ifchange', [dir]);

	var source = path.join(src, filename);

	if (fs.exists(source)) {
		run('redo-ifchange', [dir]);
		// just symlink
		var cwd = process.cwd();
		process.chdir(dir);
		try {
			fs.symlink(path.join('..', source), path.basename(tempfile));
		} finally {
			process.chdir(cwd);
		}
	} else {
		// create file in `dir`
		source += '.md';
		run('redo-ifchange', [source])

		if (filename .. endsWith('.html')) {
			createHtml(source);
		} else {
			createCode(source);
		}
	}
}


