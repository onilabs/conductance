#!/usr/bin/env sjs
// vim: set syntax=sjs:
var childProcess = require('sjs:nodejs/child-process');
var fs = require('sjs:nodejs/fs');
var path = require('nodejs:path');
var { each, map, concat, filter, toArray, integers } = require('sjs:sequence');
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

if(dir === src) {
	console.warn("WARN: attempt to build #{target} ignored");
	process.exit(0);
}

assert.ok(dir .. startsWith('step'), "invalid directory name #{dir} making #{target}");
var stepno = parseInt(dir.slice("step".length));

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

/*
 * Generate HTML from the input markdown
 */
var createHtml = function(source) {
	var sources = fs.readFile('inputs', 'utf-8').split("\n") .. filter()  .. map(f -> path.join(src, f));
	run('redo-ifchange', sources);
	fs.readFile(path.join(src, 'res','_head.html'), 'utf-8') .. console.log();

	var defines = ['DOC', "STEPNO=#{stepno}"];
	defines.push("STEP#{stepno}");
	defines.push("STEP#{stepno}_ONLY");

	var args = ['-imacros', path.join(src,'res','macros'), source].concat(defines .. map(d -> "-D#{d}"))
	if(TRACE) args.unshift('-dl');
	var md = childProcess.run('../../tools/filepp', args, {stdio:[0,'pipe',2]}).stdout;
	assert.ok(md);
	var currentFile = null;
	// insert file markers
	md = md.replace(/^#+ File: ([^\n]*)|^((?:[^ \n].*?\n)(?:\s*\n)*)(     *\S)/gm, function(match, filename, pre, code) {
		if(filename) {
			currentFile = filename;
			return match;
		}
		return "#{pre}    //FILE:#{currentFile}\n#{code}";
	});
	if(TRACE) console.warn(md);

	var opts = {gfm: true};

	var htmlContents = require('sjs:marked').convert(md, opts);

	// break content div at info-box boundaries
	htmlContents = htmlContents.replace(/^(<div class="info">(.|\n)*?<\/div>)/gm, "</div>$1<div class=\"content\">");

	// insert filename markers
	htmlContents = htmlContents.replace(/<code>(?:\n|\s)*\/\/FILE:(.*)\n/gm, "<span class=\"filename\">$1</span><code>");

	htmlContents .. console.log();

	fs.readFile(path.join(src, 'res','_foot.html'), 'utf-8') .. console.log();
};


/*
 * generate source code
 * (i.e include only indented blocks from a file)
 */
function createCode(source) {
	var defines = integers(1, stepno) .. map(n -> "STEP#{n}");
	defines.push("STEP#{stepno}_ONLY");
	console.warn('defines: ', defines);
	var out = childProcess.run('../../tools/filepp',
		concat(
			defines .. map(flag -> "-D#{flag}"),
			[source]
		) .. toArray(),
		{stdio:[0,'pipe',2]}
	).stdout;

	var is_code = true;
	out.split("\n") .. each {|line|
		var old_is_code = is_code;
		is_code = line .. startsWith('    ');
		if (is_code) {
			if (!old_is_code) console.log();
			console.log(line.slice(4));
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


