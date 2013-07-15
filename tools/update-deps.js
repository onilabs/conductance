#!/usr/bin/env node

// this script works around:
// https://github.com/isaacs/npm/issues/1727
//
// (and also the fact that an `npm install` crawls even
// when nothing is out of date)

var path = require('path');
var fs = require('fs');
var child_process = require('child_process');

var root = path.dirname(path.dirname(__filename));
process.chdir(root);
var modules = path.join(root, 'node_modules');
var packageInfo = require(path.join(root, 'package.json'));
var deps = packageInfo.dependencies;
var packageNames = Object.keys(deps);

packageNames = packageNames.filter(function(pkg) {
	var p = path.join(modules, pkg);
	if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink()) {
		console.log(pkg + ": skipping (symlink)");
		return false;
	}
	return true;
});

try {
	packageNames.forEach(function(pkg) {
		var id = pkg + '@' + deps[pkg];
		var installed = require(path.join(modules, pkg, 'package.json'));
		if (installed._from != id) {
			throw new Error(pkg + " out of date. \nRequired: " + id + "\nCurrent: " + installed._from);
		}
		console.log(pkg + ': Up to date');
	});
} catch(e) {
	if(e.message) console.error("Error: " + e.message);
	// if anything went wrong, run `npm install`
	console.log("Calling `npm install`");
	var proc = child_process.spawn('npm', ['install'].concat(packageNames), {stdio:'inherit'});
	proc.on('exit', function(code) {
		process.exit(code);
	})
}
