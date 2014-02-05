if (typeof(__filename) == 'undefined') {
	// SJS
	var __filename = decodeURIComponent(module.id.substr(7));
}

// this script can process any manifest format v2
var FORMATS = [2];
exports.FORMATS = FORMATS;

/*
 * FORMAT HISTORY:
 *
 * v2: added in conductance-0.2.1
 *  - added windows support (using bundled bsdtar & unzip)
 *  - added detection of file ext from href, rather than filename
 *    (which can be broken by server redirects). This means all hrefs
 *    can end in e.g. #.tgz to force correct detection.
 *  - roll our own `extract` handling, as bsdtar on windows is broken,
 *    and now we can use it with .zip archives if we ever need
 *
 * Currently, the same contents are published as both v1 and v2, for
 * simplicity. Once we _require_ any v2 features, we need to maintain two
 * different manifests (or drop support for the v1 self-update)
 */

var fs = require("fs");
var path = require("path");
var os = require("os");
var http = require('http');
var https = require('https');
var PROTO_MODS = {http: http, https: https};
var IS_WINDOWS = os.platform().toLowerCase().indexOf('win') === 0;

var child_process = require('child_process');

var here;
here = path.dirname(__filename);
var conductance_root = fs.realpathSync(process.env['CONDUCTANCE_ROOT'] || path.dirname(here));

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
		console.error('ERROR: ' + (desc || "assertion failed"));
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
		if (k == 'arch' && part === 'ia32') {
			part = 'x86';
		}
		if (k == 'platform' && part.indexOf('win') === 0) {
			// Windows reports a `win32` platform name even
			// on 64-bit arches, but that's confusing.
			part = 'windows';
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
		debug("mkdir: " + dir);
		fs.mkdirSync(dir);
	}
};

exports.createWrapper = function(link, root, manifest, os) {
	var wrapper = assert(exports.platformSpecificAttr(manifest.wrappers[link.runner], os), "manifest has no wrapper for "+link.runner);
	var contents = wrapper.template.replace(/__REL_(?:([a-zA-Z]+)_)?PATH__/g, function(_, component) {
		if (component) {
			var componentData = manifest.data[component];
			assert(componentData, "unknown component: " + component);
			var id = componentData.id;
			assert(id);
			return path.join('data', component + '-' + id);
		} else {
			return path.relative(root, link.src);
		}
	});

	fs.writeFileSync(link.dest, contents);
	// make sure it's executable
	fs.chmodSync(link.dest, 0755);
};

function install(link, manifest, cb) {
	debug("Installing link: ", link);
	if (fs.existsSync(link.dest)) {
		exports.trash(link.dest);
	}

	if(link.runner) {
		var contents = exports.createWrapper(link, conductance_root, manifest, undefined);
	} else {
		if (IS_WINDOWS) {
			// can't symlink on windows - just copy it
			if (fs.statSync(link.src).isDirectory()) {
				exports.runCmd("robocopy", [link.src, link.dest, '/E',
					// shut up, robocopy:
					'/NFL', // file list
					'/NDL', // directory list
					'/NJH', // job header
					'/NJS', // summary
					'/NC',  // file classes
					'/NS',  // file sizes
					'/NP'   // progress
					],
					[0,1], // robocopy thinks both 0 and 1 mean success. Silly robot.
					cb);
			} else {
				exports.copyFile(link.src, link.dest, cb);
			}
			return;
		}
		// make relative symlinks so that the install dir can be moved
		var cwd = process.cwd();
		try {
			process.chdir(path.dirname(link.dest));
			var src = path.relative(process.cwd(), link.src);
			fs.symlinkSync(src, path.basename(link.dest));
		} finally {
			process.chdir(cwd);
		}
	}
	cb();
};

exports.prompt = function(cb) {
	if (process.stdin.destroyed) return cb(null);
	process.stdin.setEncoding('utf8');
	var util = require('util');

	process.stdin.on('data', function (text) {
		process.stdin.pause();
		cb(text);
	});
	process.stdin.resume();
};

exports.installGlobally = function(cb) {
	// calls `cb` with:
	//  - true: succeeded
	//  - false: failed
	//  - null: user declined
	var prefix = process.env['PREFIX'];
	if (prefix === '') {
		// explicitly skip
		return cb(null);
	}
	prefix = (prefix || '/usr') + '/bin';
	var promptMsg = IS_WINDOWS ?
		"Do you want to add conductance to your $PATH? [Y/n] " :
		"Do you want to install conductance scripts globally into " + prefix + "? [Y/n] ";
	process.stderr.write(promptMsg);
	exports.prompt(function(response) {
		console.warn("");
		response = response.trim();
		if (response == 'y' || response == '') {

			if (IS_WINDOWS) {
				var pathed = path.join(conductance_root, 'share', 'pathed.exe');
				var bindir = path.join(conductance_root, 'bin');
				exports.runCmd(pathed, ['-q', bindir], function(err) {
					if (!err) {
						debug("already on $PATH, no further action needed");
						cb(true);
					} else {
						exports.runCmd(pathed, ['-a', bindir], function(err) {
							if (err) {
								console.warn(err.message);
								cb(false);
							} else {
								cb(true);
							}
						});
					}
				});

			} else {
				var bins = ['conductance', 'sjs'];
				var cmd = 'set -eux';
				bins.forEach(function(name) {
					var src = path.join(conductance_root, "bin", name);
					var dest = path.join(prefix, name);
					cmd += "; ln -sfn '" + src + "' '" + dest + "'";
				});

				exports.runCmd('bash', ['-c', cmd], function(err) {
					if (err) {
						// assume it's a permission error, and try with sudo:
						console.warn("You may be prompted for your user password.");
						exports.runCmd('sudo', ['bash', '-c', cmd], function(err) {
							if (err) {
								console.warn(err.message);
								cb(false);
							} else {
								cb(true);
							}
						});
					} else {
						return cb(true);
					}
				});
			}
		} else {
			return cb(null);
		}
	});
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
			return false;
		}
		return o;
	};

	if (redirectCount === undefined) {
		redirectCount = 0;
	}
	debug("Downloading: " + href);
	if (!_assert(redirectCount < 10, "Too many redirects")) return;
	var name = href.replace(/.*\//, '').replace(/\?.*/,'');
	var tmpfile = genTemp(name);

	var file = fs.createWriteStream(tmpfile);
	var options = href;
	var proto = href.split(':',1)[0].toLowerCase();
	var proxy = null;
	if ((process.env['CONDUCTANCE_FORCE_HTTP'] == '1') || proto === 'http') {
		proxy = process.env['http_proxy'];
		debug("using proxy: " + proxy);
	}
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
		debug('http options: ', options);
	}

	var fetcher = assert(PROTO_MODS[proto], "Unsupported protocol: " + proto);
	var request = fetcher.get(options, function(response) {
		var redirect = response.headers['location'];
		if (redirect) {
			debug("Redirect: " + redirect);
			return exports.download(redirect, cb, redirectCount + 1);
		}
		var statusCode = response.statusCode;
		if (!_assert(response.statusCode === 200, "Server returned " + statusCode + " error status")) return;
		debug("HEADERS:", response.headers);
		var expectedLength = response.headers['content-length'];

		debug("Content-length: " + expectedLength);
		if (expectedLength !== undefined) {
			expectedLength = parseInt(expectedLength, 10);
			if (!_assert(expectedLength > 0, "content-length = 0")) return;
		}
		response.pipe(file);
		response.on('end', function() {
			file.on('finish', function() {
				file.close();
				var fileSize = fs.statSync(tmpfile).size;
				debug("File size: " + expectedLength);
				if (!_assert(fileSize > 0, "no content in downloaded file")) return;
				if (expectedLength !== undefined) {
					if (!_assert(fileSize === expectedLength, "expected " + expectedLength + " bytes, got " + fileSize)) return;
				}
				cb(null, { path: tmpfile, originalName: name});
			});
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

exports.runCmd = function(cmd, args, okCodes /* opt */, cb) {
	if (arguments.length == 3) {
		// okCodes is optional, default to [0]
		cb = okCodes;
		okCodes = [0];
	}
	debug("running ", cmd, args);
	var child = child_process['spawn'](cmd, args, {stdio:'inherit'});
	var done = function(code) {
		var err;
		if (okCodes.indexOf(code) === -1) {
			err = new Error("Command failed with status: " + code);
			err.code = code;
		}
		return cb(err);
	}
	try {
		child.on('exit', done);
		child.on('error', cb);
	} catch(e) {
		cb(e);
	}
};

var extractComponents = function(extract, src, dest) {
	// given a raw archive extract, dive `extract` folders
	// deep and move _those_ contents into dest.
	// Simulates --strip-components of tar,
	// but that's broken on windows' bsdtar (plus we can
	// use it for other archive types like .zip)

	if (!extract) {
		// no more traversal necessary - move contents
		debug("moving contents of "+src + " -> " + dest);
		fs.readdirSync(src).forEach(function(f) {
			var fullSrc = path.join(src, f);
			var fullDest = path.join(dest, f);
			debug("moving " + fullSrc + " -> " + fullDest);
			fs.renameSync(fullSrc, fullDest);
		});
		return;
	}

	var contents = fs.readdirSync(src);
	assert(contents.length == 1, "Ambiguous extract - folder contents are " + JSON.stringify(contents));
	debug("entering " + contents[0]);
	extractComponents(extract-1, path.join(src, contents[0]), dest);
};


exports.getExt = function(url) {
	var ext = url.match(/\.[^./\\]*$/);
	if (ext) ext = ext[0].toLowerCase();
	return ext;
};

exports.extract = function(archive, dest, extract, ext, cb) {
	assert(arguments.length == 5, "extract: wrong number of arguments: " + arguments.length);
	var archivePath = assert(archive.path, "archive has no path");
	var originalName = assert(archive.originalName, "archive has no originalName");
	debug("Extracting " + archivePath + " into " + dest);
	var rawDest = dest + '.raw';
	exports.ensureDir(rawDest);

	var done = function(err) {
		if (err) {
			exports.trash(rawDest);
			assert(false, err.message || String(err));
		} else {
			exports.ensureDir(dest);
			try {
				extractComponents(extract, rawDest, dest);
			} finally {
				exports.trash(rawDest);
			}
			cb();
		}
	};

	switch(ext) {
		case ".exe":
			return exports.copyFile(archivePath, path.join(rawDest, originalName), done);
			break;
		case null:
		case ".gz":
		case ".tgz":
			var cmd = 'tar';
			if (IS_WINDOWS) {
				cmd = path.join(conductance_root, 'share', 'bsdtar', 'bsdtar.exe');
			}
			var args = ["zxf", archivePath, '--directory=' + rawDest];
			return exports.runCmd(cmd, args, done);
			break;
		case ".zip":
			var cmd = 'unzip';
			if (IS_WINDOWS) {
				cmd = path.join(conductance_root, 'share', 'unzip', 'unzip.exe');
			}
			var args = ['-q', archivePath, '-d', rawDest];
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
	console.warn("Downloading component: " + name);
	assert(href, "Malformed manifest: no href");

	var ext = exports.getExt(href);

	href = href.replace(/#.*/, '');
	console.warn(" - fetching: " + href + ' ...');

	exports.download(href, function(err, archive) {
		if (err) assert(false, err);
		
		// extract to a tempdir, and move over to final dest on success
		var tmp = dest + '.tmp';
		if (fs.existsSync(tmp)) exports.trash(tmp);
		if (fs.existsSync(dest)) exports.trash(dest);
		exports.extract(archive, tmp, extract, ext, function() {
			fs.renameSync(tmp, dest);
			cb();
		});
	});
}

exports.load_manifest = function(p) {
	// NOTE: we can't just require(./manifest.json) here, since
	// that would give us the original manifest after an update is performed
	var manifestJson = fs.readFileSync(p, "utf-8");
	var manifest = JSON.parse(manifestJson);
	assert(manifest.format, "manifest has no format attribute");
	if (FORMATS.indexOf(manifest.format) === -1) {
		console.error("Manifest format version: " + manifest.format);
		console.error("This installation understands versions: " + FORMATS.join(","));
		if (manifest.version_error) console.error(manifest.version_error);
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

exports.checkForUpdates = function(cb) {
	// checks for updates. This should *never* cause the process to exit when anything
	// goes wrong, as it's called from conductance proper.
	// calls cb(error, updates);
	var existingManifest = exports.load_manifest(CURRENT_MANIFEST);
	var updateUrl = existingManifest.manifest_url;
	
	var newfile = exports.download(updateUrl, function(err, file) {
		if (err) return cb(err);
		var available = false;
		try {
			var contents = fs.readFileSync(file.path, "utf-8");
			var newManifest = JSON.parse(contents);
			debug("Loaded latest manifest. Version " + newManifest.version + " (installed: " + existingManifest.version + ")");
			if (newManifest.version > existingManifest.version) {
				// potentially can't use rename across drives
				debug("Wrote new manifest to " + NEW_MANIFEST);
				fs.writeFileSync(NEW_MANIFEST, JSON.stringify(newManifest), 'utf-8');
				available = true;
			}
		} catch(e) {
			return cb(e);
		}
		cb(null, available);
	});
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
		if (!fs.existsSync(NEW_MANIFEST)) {
			console.log("No updates available");
			process.exit(0);
		}
		try {
			manifest = exports.load_manifest(NEW_MANIFEST);
			if (!manifest) process.exit(1);
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

			// NOTE: this is the point of no return. If anything goes wrong between
			// here and the end of the script, we've got a potentially-unrecoverable install
			console.warn("Installing components ...");
			var installNext = function(err) {
				assert(!err, String(err));
				if (all_links.length > 0) {
					var link = all_links.shift();
					install(link, manifest, installNext);
				} else {
					// done installing links
					console.warn("Cleaning up ...");
					
					// remove any links that were *not* specified by the current manifest
					Object.keys(oldManifest.data).forEach(function(componentName) {
						var config = oldManifest.data[componentName];
						var links = config.links;
						if (!links) return;
						links = exports.platformSpecificAttr(links);
						links.forEach(function(link) {
							var dest = linkDest(link);
							if (keep_link_paths.indexOf(dest) == -1 && fs.existsSync(dest)) {
								exports.trash(dest);
							}
						});
					});

					// the manifest we just installed is now the current manifest:
					if(!initial) fs.renameSync(NEW_MANIFEST, CURRENT_MANIFEST);
					exports.purgeTrash(function(err) {
						// (err ignored, a warning has been printed)
						exports.dump_versions(manifest);
						console.warn("");
						if(initial) {
							console.warn("Conductance has been installed in " + conductance_root);
							exports.installGlobally(function(ok) {
								if (ok) {
									console.warn("\nEverything installed! Run `conductance` to get started!");
									if (IS_WINDOWS) {
										console.warn("(You may need to open a new console to get the new $PATH setting)");
									}
								} else {
									var msg;
									if (ok === false) { // failed
										msg = {note: "Couldn't add conductance to your $PATH", rerun: "to try again"};
									} else {
										msg = {note: "Skipped global installation", rerun: "if you change your mind"};
									}
									console.warn("\n" + msg.note + ". You can:\n" +
										"  - Re-run this installer (" + path.join(conductance_root, "share", "install." + (IS_WINDOWS ? 'cmd':'sh')) +") " + msg.rerun + "\n" +
										"  - Add " + path.join(conductance_root, "bin") + " to $PATH yourself\n" +
										"  - Run conductance by its full path: " + path.join(conductance_root, "bin", "conductance") + "\n");
								}
							});
						} else {
							console.warn("Updated. Restart conductance for the new version to take effect.");
						}
					});
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

	var isWindows = (process.platform === "win32")

	function rimraf (p, cb) {
		if (!cb) throw new Error("No callback passed to rimraf()")

		var busyTries = 0
		rimraf_(p, function CB (er) {
			if (er) {
				if (isWindows && (er.code === "EBUSY" || er.code === "ENOTEMPTY") &&
						busyTries < exports.BUSYTRIES_MAX) {
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
			if (er) {
				if (er.code === "ENOENT")
					return cb(null)
				if (er.code === "EPERM")
					return (isWindows) ? fixWinEPERM(p, er, cb) : rmdir(p, er, cb)
				if (er.code === "EISDIR")
					return rmdir(p, er, cb)
			}
			return cb(er)
		})
	}

	function fixWinEPERM (p, er, cb) {
		fs.chmod(p, 666, function (er2) {
			if (er2)
				cb(er2.code === "ENOENT" ? null : er)
			else
				fs.stat(p, function(er3, stats) {
					if (er3)
						cb(er3.code === "ENOENT" ? null : er)
					else if (stats.isDirectory())
						rmdir(p, er, cb)
					else
						fs.unlink(p, function(er4) {
							// XXX added for conductance installer (not in upstream rimraf)
							// We can't unlink this file, it's probably being used
							// by the current process. Just throw it in $TEMP and ignore.
							var tmp = process.env['TEMP'];
							if (!er4)
								cb()
							else if (tmp)
								fs.rename(p, path.join(tmp, path.basename(p)), cb);
							else
								cb(er4);
						})
				})
		})
	}

	function fixWinEPERMSync (p, er, cb) {
		try {
			fs.chmodSync(p, 666)
		} catch (er2) {
			if (er2.code !== "ENOENT")
				throw er
		}

		try {
			var stats = fs.statSync(p)
		} catch (er3) {
			if (er3 !== "ENOENT")
				throw er
		}

		if (stats.isDirectory())
			rmdirSync(p, er)
		else
			fs.unlinkSync(p)
	}

	function rmdir (p, originalEr, cb) {
		// try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
		// if we guessed wrong, and it's not a directory, then
		// raise the original error.
		fs.rmdir(p, function (er) {
			if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
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

	// this looks simpler, and is strictly *faster*, but will
	// tie up the JavaScript thread and fail on excessively
	// deep directory trees.
	function rimrafSync (p) {
		try {
			fs.unlinkSync(p)
		} catch (er) {
			if (er.code === "ENOENT")
				return
			if (er.code === "EPERM")
				return isWindows ? fixWinEPERMSync(p, er) : rmdirSync(p, er)
			if (er.code !== "EISDIR")
				throw er
			rmdirSync(p, er)
		}
	}

	function rmdirSync (p, originalEr) {
		try {
			fs.rmdirSync(p)
		} catch (er) {
			if (er.code === "ENOENT")
				return
			if (er.code === "ENOTDIR")
				throw originalEr
			if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
				rmkidsSync(p)
		}
	}

	function rmkidsSync (p) {
		fs.readdirSync(p).forEach(function (f) {
			rimrafSync(path.join(p, f))
		})
		fs.rmdirSync(p)
	}


	return rimraf;
})();

if (require.main === module) {
	exports.main(true);
}
