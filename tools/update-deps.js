#!/usr/bin/env node

// this script works around:
// https://github.com/isaacs/npm/issues/1727
//
// (and also the fact that an `npm install` crawls even
// when nothing is out of date)

var path = require('path');
var fs = require('fs');
var child_process = require('child_process');

var root = process.cwd();
var modules = path.join(root, 'node_modules');
var packageInfo = JSON.parse(fs.readFileSync('package.json'));
var deps = packageInfo.dependencies;

if (process.env['NODE_ENV'] != 'production' && process.env['DEV_DEPENDENCIES'] == null) {
	process.env['DEV_DEPENDENCIES'] = '*';
}

if (process.env['DEV_DEPENDENCIES']) {
	// merge specific devDependencies
	var include;
	var check;
	if (process.env['DEV_DEPENDENCIES'] == '*') {
		include = function() { return true; };
		check = function() {};
	} else {
		var names = process.env['DEV_DEPENDENCIES'].split(',');
		include = function(key) {
			var idx = names.indexOf(key);
			if (idx !== -1) {
				names.splice(idx, 1);
				return true;
			} else {
				return false;
			}
		};

		check = function() {
			if (names.length > 0) {
				throw new Error("Unknown dev dependencies: " + names.join(","));
			}
		};
	}

	for (var k in packageInfo.devDependencies) {
		if (include(k)) {
			deps[k] = packageInfo.devDependencies[k];
		}
	}
	check();
}

// merge optionalDependencies, ignoring anything specified in $SKIP_OPTIONAL
if(packageInfo.optionalDependencies) {
	var optionalDepNames = Object.keys(packageInfo.optionalDependencies);
	var skipOptional = [];
	if (process.env['SKIP_OPTIONAL']) {
		if (process.env['SKIP_OPTIONAL'] === '*') {
			skipOptional = optionalDepNames;
		} else {
			skipOptional = process.env['SKIP_OPTIONAL'].split(',');
		}
	}
	for (var k in packageInfo.optionalDependencies) {
		if (skipOptional.indexOf(k) === -1) {
			deps[k] = packageInfo.optionalDependencies[k];
		}
	}
}


var packageNames = Object.keys(deps);

var skipNames = (process.env['SKIP_PACKAGES'] || '').split().filter(function(s) { return s.length > 0; });

packageNames = packageNames.filter(function(pkg) {
	var p = path.join(modules, pkg);
	if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink()) {
		console.log(pkg + ": skipping (symlink)");
		return false;
	}
	if(skipNames.indexOf(pkg) !== -1) {
		console.log(pkg + ": skipping ($SKIP_PACKAGES)");
		return false;
	}
	return true;
});

var outOfDate = packageNames.map(function(pkg) {
	var requirement = (deps[pkg] == '*' ? '' : deps[pkg]);
	return [pkg, requirement];
}).filter(function(pair) {
	var pkg = pair[0]
	var id = pair.join('@');
	try {
		var installed = require(path.join(modules, pkg, 'package.json'));
		if (installed._from != id) {
			throw new Error(pkg + " out of date. \nRequired: " + id + "\nCurrent: " + installed._from);
		}
		console.log(pkg + ': Up to date ('+id+')');
		return false;
	} catch(e) {
		if(e.message) console.error("Error: " + e.message);
		return true;
	}
});

if (outOfDate.length > 0) {
	var args = outOfDate.map(function(pkg) { return pkg.join('@');});
	console.log("Calling `npm install --production " + args.join(" ") + "`");
	var proc = child_process.spawn('npm', ['install', '--production'].concat(args), {stdio:'inherit'});
	proc.on('exit', function(code) {
		process.exit(code);
	})
}
