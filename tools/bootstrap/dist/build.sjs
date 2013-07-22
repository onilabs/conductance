#!/usr/bin/env sjs
var fs = require("sjs:nodejs/fs");
var path = require("nodejs:path");
var selfUpdate = require('../share/self-update.js');
var {assert} = selfUpdate;
var object = require('sjs:object');
var str = require('sjs:string');
var url = require('sjs:url');
var seq = require('sjs:sequence');
var proxy = require('../proxy');
var {map, each} = seq;

function assert(o, r) {
	if(!o) throw new Error(r);
	return o;
}

var rm_rf = function(d) {
	waitfor() {
		selfUpdate.rm_rf(d, resume);
	}
};

var run = function(cmd /*, args */) {
	waitfor(var err) {
		selfUpdate.runCmd(cmd, Array.prototype.slice.call(arguments, 1), resume);
	}
	if (err !== undefined) throw err;
};

exports.main = function() {
	var args = require('sjs:sys').argv();

	var manifestFilename = url.normalize('../share/manifest.json', module.id) .. url.toPath;
	var manifest = JSON.parse(fs.readFile(manifestFilename, "utf-8"));

	var here = fs.realpath(url.normalize(".", module.id) .. url.toPath);
	var platform_root = path.join(here, 'tmp')

	var platforms = args .. map(function(desc) {
		var [platform, arch] = desc.split('_');
		return { platform: platform, arch: arch};
	});

	platforms .. each {|_os|
		var package_name = "#{_os.platform}_#{_os.arch}";
		var base = path.join(platform_root, package_name);
		console.log("Processing #{package_name}");

		if (fs.exists(base)) {
			rm_rf(base);
		}
		selfUpdate.ensureDir(base);

		manifest.data .. object.ownPropertyPairs .. each {|[component, config]|
			if (!config.bootstrap) continue;
			var url = selfUpdate.platformSpecificAttr(config.href, _os);
			if(url === false) continue;
			var originalName = url.replace(/.*\//, '').replace(/\?.*/,'');
			var platform = 'all';
			if (config.href.platform_key) platform = selfUpdate.platformKey(config.href.platform_key, _os);
			
			// download & cache
			var local_tarball = proxy.download(url);

			var extract = config.extract;
			if (extract) extract = selfUpdate.platformSpecificAttr(extract, _os);
			var component_base = path.join(base, "data", "#{component}-#{config.id}");
			waitfor() {
				selfUpdate.extract(
					{path: local_tarball, originalName: originalName},
					component_base,
					extract, resume);
			}

			var links = config.links;
			if(links) {
				links = selfUpdate.platformSpecificAttr(links, _os);
				links .. each {|link|
					var src = path.join(component_base, link.src);
					var dest = path.join(base, link.dest);
					selfUpdate.ensureDir(dest .. str.endsWith('/') ? dest : path.dirname(dest));
					run("cp", src, dest);
				}
			}
		}

		var share_root = path.join(here, "../share");
		var share_dest = path.join(base, "share");
		selfUpdate.ensureDir(share_dest);
		fs.readdir(share_root) .. each {|filename|
			if (filename .. str.endsWith('.do') || filename .. str.startsWith('.')) continue;
			filename = path.join(share_root, filename)
			run("cp", "-a", filename, share_dest);
		}

		var node_wrapper = selfUpdate.platformSpecificAttr(manifest.wrappers.node, _os);
		var filename = 'boot.' + (_os.platform == 'windows' ? 'cmd' : 'sh');
		var content = node_wrapper.template.replace('__REL_PATH__', 'share/self-update.js');
		var script = path.join(base, 'share', filename);
		fs.writeFile(script, content);
		fs.chmod(script, 0755);
	}
}

if (require.main === module) {
	exports.main();
}
