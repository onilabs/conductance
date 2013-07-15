if (typeof(__filename) == 'undefined') {
	// SJS
	var __filename = decodeURIComponent(module.id.substr(7));
}

// this script can process any manifest format v1.
var VERSION = 1;
var fs = require("fs");
var path = require("path");
var os = require("os");
var http = require('http');
var https = require('https');
var PROTO_MODS = {http: http, https: https};

var child_process = require('child_process');

var here;
here = path.dirname(__filename);
var conductance_root = process.env['CONDUCTANCE_ROOT'] || path.dirname(here);

var CURRENT_MANIFEST = path.join(conductance_root, 'share', 'manifest.json');
var NEW_MANIFEST = path.join(conductance_root, 'share', 'manifest.new.json');
var trashDir = path.join(conductance_root, '.trash');

var VERBOSE = process.env['CONDUCTANCE_DEBUG'] === '1';
var debug = function(/* ... */) {
	if(!VERBOSE) return;
	console.log.apply(console, ['DEBUG:'].concat(Array.prototype.slice.call(arguments)));
};

var assert = exports.assert = function(o, desc) {
	if (!o) {
		console.error(desc || "not ok");
		process.exit(1);
	}
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
	if (val === undefined) return undefined;
	if (!_os) _os = os;
	var result = val;
	if (val.platform_key) {
		debug("platform config:", val);
		var key = exports.platformKey(val.platform_key, _os);
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

function install(link, manifest, cb) {
	debug("Installing link: ", link);
	if (fs.existsSync(link.dest)) {
		exports.trash(link.dest);
	}
	if(link.runner) {
		var wrapper = assert(exports.platformSpecificAttr(manifest.wrappers[link.runner]));
		var contents = wrapper.template.replace(/__REL_PATH__/, path.relative(conductance_root, link.src));
		fs.writeFileSync(link.dest, contents);
		
		// make sure it's executable
		fs.chmodSync(link.dest, 0755);
	} else {
		if (os.platform().toLowerCase() == 'windows' && fs.statSync(link.src).isDirectory()) {
			// can't symlink a dir on windows - just copy it
			exports.runCmd("xcopy", [link.src, link.dest, '/s','/e'], cb);
			return;
		}
		//just symlink it
		fs.symlinkSync(link.src, link.dest);
	}
	cb();
};

function genTemp(name) {
	return path.join(os.tmpdir(), "conductance-" + String(process.pid) + "-" + name);
};

exports.download = function(href, cb, redirectCount) {
	var _assert = function(o, detail) {
		var msg = "Download failed. The server may be experiencing trouble, please try again later.";
		if(detail) msg += "\n(" + detail + ")";
		if (!o) {
			cb(msg, null);
			throw new Error("reached end of control");
		}
		return o;
	};

	if (redirectCount === undefined) {
		redirectCount = 0;
	}
	_assert(redirectCount < 10, "Too many redirects");
	console.warn(" - Fetching: " + href);
	var name = href.replace(/.*\//, '').replace(/\?.*/,'');
	var tmpfile = genTemp(name);

	var file = fs.createWriteStream(tmpfile);
	var options = href;
	var proto = href.split(':',1)[0].toLowerCase();
	var proxy = process.env[proto.toUpperCase() + '_PROXY'];
	debug(proto + "_proxy: " + proxy);
	if(proxy) {
		proto = 'http';
		var match = proxy.match(/^[^:]*:\/\/([^\/:]+)(?::(\d+))/);
		var destMatch = href.match(/^[^:]*:\/\/([^\/]+)/);
		assert(match, "Can't parse proxy host");
		assert(destMatch, "Can't parse URL host");
		options = {
			host: match[1],
			port: parseInt(match[2] || 8080, 10),
			path: href,
			headers: {
				Host: destMatch[1]
			}
		};
		debug(options);
	}

	var fetcher = assert(PROTO_MODS[proto], "Unsupported protocol: " + proto);
	var request = fetcher.get(options, function(response) {
		var redirect = response.headers['location'];
		if (redirect) {
			debug("Redirect: " + redirect);
			return exports.download(redirect, cb, redirectCount + 1);
		}
		var statusCode = response.statusCode;
		_assert(response.statusCode === 200, "Server returned " + statusCode + " error status");
		debug("HEADERS:", response.headers);
		var expectedLength = _assert(response.headers['content-length'], "no content-length given");
		debug("Content-length: " + expectedLength);
		expectedLength = parseInt(expectedLength, 10);
		_assert(expectedLength > 0, "content-length = 0");
		response.pipe(file);
		response.on('end', function() {
			file.close();
			var fileSize = fs.statSync(tmpfile).size;
			debug("File size: " + expectedLength);
			_assert(fileSize === expectedLength, "expected " + expectedLength + " bytes, got " + fileSize);
			cb(null, { path: tmpfile, originalName: name});
		});
	}).on('error', function() {
		_assert(false);
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
		case null:
		case ".gz":
		case ".tgz":
			var cmd = 'tar';
			if (os.platform().toLowerCase() == 'windows') {
				cmd = os.path.join(conductance_root, 'share', 'bsdtar.exe');
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
	exports.download(href, function(err, archive) {
		if (err) assert(false, err);
		exports.extract(archive, dest, extract, cb);
	});
}

exports.load_manifest = function(p) {
	// NOTE: we can't just require(./manifest.json) here, since
	// that would give us the original manifest after an update is performed
	var manifestJson = fs.readFileSync(p, "utf-8");
	var manifest = JSON.parse(manifestJson);
	assert(manifest.format_version, "manifest has no format_version attribute");
	if (manifest.format_version != VERSION) {
		console.error("Manifest format version: " + manifest.format_version);
		console.error("This installation understands version: " + VERSION);
		console.error(manifest.version_error);
		return false;
	}
	return manifest;
};

exports.dump_versions = function(manifest) {
	manifest = manifest || exports.load_manifest(CURRENT_MANIFEST);
	if (!manifest) return;
	var keys = Object.keys(manifest.data);
	keys.sort();
	console.warn("\nComponent versions:");
	keys.forEach(function(name) {
		var component = manifest.data[name];
		if (component.internal) return;
		console.warn(" - " + name + ": " + component.id);
	});
}

exports.checkForUpdates = function() {
	// checks for updates. This should *never* cause the process to exit when anything
	// goes wrong, as it's called from conductance proper.
	// Returns `true` if there are updates.
	var existingManifest = exports.load_manifest(CURRENT_MANIFEST);
	var updateUrl = existingManifest.manifest_url;
	
	// TODO: load updateUrl, and save to manifest.new.json if its version is > existingManifest
};

// main function
exports.main = function(initial) {
	var oldManifest = exports.load_manifest(CURRENT_MANIFEST);
	if (!oldManifest) return;

	var manifest;
	if (initial) {
		debug("installing bundled manifest");
		manifest = oldManifest; // install existing manifest
	} else {
		debug("checking for new manifest");
		if (!fs.existsSync(NEW_MANIFEST)) {
			console.log("No updates available");
			process.exit(0);
		}
		try {
			manifest = exports.load_manifest(NEW_MANIFEST);
			if (!manifest) throw new Error();
		} catch(e) {
			console.error("Unable to load new manifest.");
			fs.unlink(NEW_MANIFEST);
			process.exit(1);
		}
	}

	var new_components = [];
	var all_components = [];
	var tasks = Object.keys(manifest.data).map(function(componentName) {
		return function(next) {
			var v = manifest.data[componentName];
			var parentDir = path.join(conductance_root, "data");
			var dest = path.join(parentDir, componentName + '-' + assert(v.id));
			var component = {
				name: componentName,
				root: dest,
				conf: v};
			all_components.push(component);

			if (!fs.existsSync(dest)) {
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

	var linkDest = function(link) {
		var src = link.src;
		assert(src, "link has no source");
		var dest = link.dest;
		assert(dest, "link has no destination");

		if (dest[dest.length - 1] == '/') {
			dest = path.join(dest, path.basename(src));
		}
		return path.join(conductance_root, dest);
	}

	var cont = function() {
		if (tasks.length > 0) {
			tasks.shift()(cont);
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
				if (!component.conf.links) return;
				var links = exports.platformSpecificAttr(component.conf.links);
				links.forEach(function(link) {
					var src = path.join(assert(component.root), assert(link.src, "link has no src"));
					assert(fs.existsSync(src), "No such file: " + src);
					var dest = linkDest(link);
					ensureDir(path.dirname(dest));
					all_links.push({
						src: src,
						dest: dest,
						runner: link.runner
					});
				});
			});
			
			// NOTE: this must be done *before* we start calling shift() on all_links
			var keep_link_paths = all_links.map(function(l) { return l.dest; });
			debug("Keeping links: ", keep_link_paths);
			assert(keep_link_paths.length > 0, "no links in current version");

			// NOTE: this is the pint of no return. If anything goes wrong between
			// here and the end of the script, we've got a potentially-unrecoverable install
			console.warn("Installing components ...");
			var installNext = function() {
				if (all_links.length > 0) {
					var link = all_links.shift();
					install(link, manifest, installNext);
				} else {
					// done installing links
					console.warn("Cleaning up ...");
					
					// remove any links that were *not* specified by the current manifest
					var old_link_paths = [];
					Object.keys(oldManifest.data).forEach(function(componentName) {
						var config = oldManifest.data[componentName];
						var links = config.links;
						if (!links) return;
						links = exports.platformSpecificAttr(links);
						links.forEach(function(link) {
							var dest = linkDest(link);
							if (keep_link_paths.indexOf(dest) == -1 && fs.existsSync(dest)) {
								old_link_paths.push(dest);
							}
						});
					});

					var removeLink = function() {
						if (old_link_paths.length > 0) {
							exports.trash(old_link_paths.shift(), removeLink);
						} else {
							// all links trashed
							
							// the manifest we just installed is now the current manifest:
							if(!initial) fs.renameSync(NEW_MANIFEST, CURRENT_MANIFEST);
							exports.purgeTrash(function(err) {
								// (err ignored, a warning has been printed)
								exports.dump_versions(manifest);
								console.warn("");
								if(initial) {
									console.warn("Everything installed! Run " + path.join(conductance_root, 'bin','conductance') + " to get started!");
								} else {
									console.warn("Updated. Restart conductance for the new version to take effect.");
								}
							});
						}
					}
					removeLink();
				}
			};
			installNext(); // run installNext async loop
		}
	}
	cont(); // run cont() async loop
};

exports.purgeTrash = function(cb) {
	var _cb = function(err) {
		if(err) {
			debug(err);
			console.warn("Error cleaning up old files. Please delete " + trashDir + " manually.");
			return cb(err);
		} else {
			cb();
		}
	};
	if(fs.existsSync(trashDir)) {
		try {
			exports.rm_rf(trashDir, _cb);
		} catch(e) {
			_cb(e);
		}
	} else {
		cb();
	}
};

exports.trash = function(p) {
	debug("Trashing: " + p);
	exports.ensureDir(trashDir);
	var filename = path.basename(p);
	var dest;
	for (var i=0; ; i++) {
		dest = path.join(trashDir, filename + '.' + i);
		if (!fs.existsSync(dest)) break;
	}
	fs.renameSync(p, dest);
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

if (require.main === module) {
	exports.main(true);
}
