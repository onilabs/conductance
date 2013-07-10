// this script can process any manifest format v1.
var API = 1;
var fs = require("fs");
var path = require("path");
var os = require("os");
var http = require('http');
var child_process = require('child_process');

var here;
if (typeof(__filename) == 'undefined') {
	// SJS
	var __filename = decodeURIComponent(module.id.substr(7));
}
here = path.dirname(__filename);

// var here = path.dirname(__filename);
var VERBOSE = process.env['CONDUCTANCE_DEBUG'] === '1';
var debug = function(/* ... */) {
	if(!VERBOSE) return;
	console.log.apply(console, ['DEBUG:'].concat(Array.prototype.slice.call(arguments)));
};

var assert = exports.assert = function(o, desc) {
	if (!o) throw new Error(desc || "not ok");
	return o;
};

exports.platformKey = function(platform_key, _os) {
	return platform_key.map(function(k) {
		var part = _os[k];
		if (part.call) {
			part = part.call(_os);
		}
		return part.toLowerCase();
	}).join("_");
};

exports.platformSpecificAttr = function(val, _os) {
	if (!_os) _os = os;
	var result = val;
	if (val.platform_key) {
		var key = exports.platformKey(val.platform_key, _os);
		debug("platform config:", val);
		var msg = "Unsupported platform type: " + key;
		if (!val.hasOwnProperty(key)) {
			key = 'default';
		}
		result = val[key];
		assert(result !== undefined, msg);
		if (val.all && Array.isArray(result)) {
			result = result.concat(val.all);
		}
	}
	return result;
};

var ensureDir = exports.ensureDir = function (dir) {
	if (!fs.existsSync(dir)) {
		ensureDir(path.dirname(dir));
		fs.mkdirSync(dir);
	}
};

function install(link, manifest) {
	debug("Installing link: ", link);
	if(link.runner) {
		var wrappers = assert(exports.platformSpecificAttr(manifest.wrappers[link.runner]));
		var contents = wrapper.template.replace(/__REL_PATH__/, path.relative(here, link.src));
		fs.writeFileSync(link.dest, contents);
		
		// make sure it's executable
		fs.chmodSync(link.dest, 0755);
	} else {
		//just symlink it
		fs.symlinkSync(link.src, link.dest);
	}
};

function genTemp(name) {
	return path.join(os.tmpdir(), "conductance-" + String(process.pid) + "-" + name);
};

exports.download = function(href, cb) {
	console.warn(" - Fetching: " + href);
	var name = href.replace(/.*\//, '').replace(/\?.*/,'');
	var tmpfile = genTemp(name);

	var file = fs.createWriteStream(tmpfile);
	var request = http.get(href, function(response) {
			response.pipe(file);
			response.on('end', function() {
				file.close();
				assert(fs.statSync(tmpfile).size > 0, "Downloaded file is empty.");
				cb({ path: tmpfile, originalName: name});
			});
	}).on('error', function() {
		assert(false, "Download failed. Try again later");
	});
};

exports.copyFile = function(src, dest, cb) {
	var cbCalled = false;
	var rd = fs.createReadStream(src);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(dest);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
};

exports.runCmd = function(cmd, args, cb) {
	debug("running ", cmd, args);
	var child = child_process['spawn'](cmd, args, {stdio:'inherit'});
	var done = function(code) {
		var err = code == 0 ? undefined : new Error("Command failed with status: " + code);
		return cb(err);
	}
	try {
		child.on('exit', done);
		child.on('error', cb);
	} catch(e) {
		cb(e);
	}
};

exports.extract = function(archive, dest, extract, cb) {
	var archivePath = assert(archive.path, "archive has no path");
	var originalName = assert(archive.originalName, "archive has no originalName");
	debug("Extracting " + archivePath + " into " + dest);
	exports.ensureDir(dest);
	var ext = originalName.match(/\.[^./\\]*$/);
	var done = function(err) {
		if (err) {
			assert(false, err.message || String(err));
		} else {
			cb();
		}
	};

	if (ext) ext = ext[0].toLowerCase();
	switch(ext) {
		case ".exe":
			return exports.copyFile(archivePath, path.join(dest, originalName), done);
			break;
		case ".gz":
		case ".tgz":
			var cmd = 'tar';
			if (os.platform().toLowerCase() == 'windows') {
				cmd = os.path.join(here, 'bsdtar.exe');
			}
			var args = ["zxf", archivePath, '--directory=' + dest];
			if (extract !== undefined) {
				args.push('--strip-components=' + String(extract));
			}
			return exports.runCmd(cmd, args, done);
			break;
		case ".zip":
			var cmd = 'unzip';
			var args = ['-q', archivePath, '-d', dest];
			assert(extract === undefined, "Can't extract components from a zip");
			return exports.runCmd(cmd, args, done);
			break;
		default:
			assert(false, "Unknown archive type: " + ext);
			break;
	}
};

var download_and_extract = function(name, dest, attrs, cb) {
	var href = exports.platformSpecificAttr(attrs.href);
	var extract = exports.platformSpecificAttr(attrs.extract);
	// `false` means not needed for this platform - just skip it
	if (href === false) return cb();
	console.warn("Downloading component: " + name + " to path " + dest);
	assert(href, "Malformed manifest: no href");
	exports.download(href, function(archive) {
		exports.extract(archive, dest, extract, cb);
	});
}

exports.load_manifest = function() {
	// NOTE: we can't just require(./manifest.json) here, since
	// that would give us the original manifest after an update is performed
	var manifestJson = fs.readFileSync("./manifest.json", "utf-8");
	var manifest = JSON.parse(manifestJson);
	if (manifest.version != API) {
		console.error(manifest.version_error);
		return false;
	}
	return manifest;
};

exports.dump_versions = function(manifest) {
	manifest = manifest || exports.load_manifest();
	if (!manifest) return;
	var keys = Object.keys(manifest.data);
	keys.sort();
	keys.each(function(name) {
		var component = manifest.data.name;
		if (component.internal) return;
		console.warn(" - " + name + ":" + component.id);
	});
}

// main function
exports.main = function(initial) {
	var manifest = exports.load_manifest();
	if (!manifest) return;

	var idx = 0;
	var new_components = [];
	var all_components = [];
	var tasks = Object.keys(manifest.data).map(function(componentName) {
		return function(next) {
			var v = manifest.data[componentName];
			var parentDir = path.join(here, "data");
			var dest = path.join(parentDir, componentName + '-' + ok(v.id));
			var component = {
				name: componentName,
				root: dest,
				conf: v};
			all_components.push(component);

			if (!fs.exists(dest)) {
				debug("New component required: " + dest);
				ensureDir(dest);
				// download data
				download_and_extract(componentName, dest, v, function() {
					new_components.push(component);
					next();
				});
			} else {
				next();
			}
		};
	});

	var run_next = function() {
		i++;
		if (i < tasks.length) {
			tasks[i](run_next);
		} else {
			// all tasks have been run in sequence
			if (new_components.length == 0 && process.env['CONDUCTANCE_REINSTALL'] !== 'true') {
				// nothing new available
				return;
			}
			
			// Figure out all links from all components (not just new ones, in case of broken install).
			// We process each component (and check paths) before installing anything,
			// just in case we have a bad component - we don't want to install only half the links
			var all_links = [];
			all_components.forEach(function(component) {
				if (!component.links) return;
				var links = exports.platformSpecificAttr(component.links);
				links.forEach(function(link) {
					var src = path.join(assert(component.root), assert(link.src, "link has no src"));
					assert(fs.exists(src), "No such file: " + src);
					var dest = assert(link.dest);
					if (dest[dest.length - 1] != '/') {
						dest = path.join(dest, path.basename(src));
					}
					dest = path.join(here, dest);
					ensureDir(path.dirname(dest));
					all_links.push({
						src: src,
						dest: dest,
						runner: link.runner
					});
				});
			});

			console.warn("Installing components ...");
			all_links.forEach(function(link) {
				install(link, manifest);
			});

			// now remove any links that were *not* specified by the current manifest
			var link_dirs = {};
			all_links.forEach(function(link) {
				var parentDir = path.dirname(link.dest);
				var filename = path.basename(link.dest);
				if (!link_dirs[parentDir]) link_dirs[parentDir] = [];
				link_dirs[parentDir].append(filename);
			});
			Object.keys(link_dirs).forEach(function(dir) {
				debug("Checking " + dir + " for old links...");
				var expected = link_dirs[dir];
				var present = fs.readdirSync(dir);
				present.forEach(function(filename) {
					var p = path.join(dir, filename);
					if (expected.indexOf(filename) == -1 && fs.statSync(p).isSymbolicLink) {
						debug("Removing old link: " + p);
						fs.unlinkSync(p);
					}
				});
			});


			if(initial) {
				console.warn("Everything installed!");
			} else {
				console.warn("Updated. Restart conductance for the new version to take effect.");
			}
			exports.dump_versions(manifest);
		}
	}
	run_next();
};

exports.rm_rf = (function() {
	/* This function from rimraf.js:
	 * Original copyright:
	 * Copyright 2009, 2010, 2011 Isaac Z. Schlueter.
	 * All rights reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person
	 * obtaining a copy of this software and associated documentation
	 * files (the "Software"), to deal in the Software without
	 * restriction, including without limitation the rights to use,
	 * copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following
	 * conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	 * OTHER DEALINGS IN THE SOFTWARE.
	 */

	// for EMFILE handling
	var timeout = 0
	exports.EMFILE_MAX = 1000
	exports.BUSYTRIES_MAX = 3

	function rimraf (p, cb) {
		if (!cb) throw new Error("No callback passed to rimraf()")

		var busyTries = 0
		rimraf_(p, function CB (er) {
			if (er) {
				if (er.code === "EBUSY" && busyTries < exports.BUSYTRIES_MAX) {
					busyTries ++
					var time = busyTries * 100
					// try again, with the same exact callback as this one.
					return setTimeout(function () {
						rimraf_(p, CB)
					}, time)
				}

				// this one won't happen if graceful-fs is used.
				if (er.code === "EMFILE" && timeout < exports.EMFILE_MAX) {
					return setTimeout(function () {
						rimraf_(p, CB)
					}, timeout ++)
				}

				// already gone
				if (er.code === "ENOENT") er = null
			}

			timeout = 0
			cb(er)
		})
	}

	// Two possible strategies.
	// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
	// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
	//
	// Both result in an extra syscall when you guess wrong.  However, there
	// are likely far more normal files in the world than directories.  This
	// is based on the assumption that a the average number of files per
	// directory is >= 1.
	//
	// If anyone ever complains about this, then I guess the strategy could
	// be made configurable somehow.  But until then, YAGNI.
	function rimraf_ (p, cb) {
		fs.unlink(p, function (er) {
			if (er && er.code === "ENOENT")
				return cb()
			if (er && (er.code === "EPERM" || er.code === "EISDIR"))
				return rmdir(p, er, cb)
			return cb(er)
		})
	}

	function rmdir (p, originalEr, cb) {
		// try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
		// if we guessed wrong, and it's not a directory, then
		// raise the original error.
		fs.rmdir(p, function (er) {
			if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST"))
				rmkids(p, cb)
			else if (er && er.code === "ENOTDIR")
				cb(originalEr)
			else
				cb(er)
		})
	}

	function rmkids(p, cb) {
		fs.readdir(p, function (er, files) {
			if (er)
				return cb(er)
			var n = files.length
			if (n === 0)
				return fs.rmdir(p, cb)
			var errState
			files.forEach(function (f) {
				rimraf(path.join(p, f), function (er) {
					if (errState)
						return
					if (er)
						return cb(errState = er)
					if (--n === 0)
						fs.rmdir(p, cb)
				})
			})
		})
	}

	return rimraf;
})();
