#!/usr/bin/env sjs
var fs = require("sjs:nodejs/fs");
var path = require("nodejs:path");
var object = require('sjs:object');
var str = require('sjs:string');
var url = require('sjs:url');
var seq = require('sjs:sequence');
var {map, each, toArray} = seq;
var logging = require('sjs:logging');
logging.setLevel(process.env['GUP_XTRACE'] ? logging.INFO : logging.warn);

var selfUpdate = require('../../share/self-update.js');
var proxy = require('../../proxy');

var { run, assert} = require('../common');
var rm_rf = function(d) {
	waitfor() {
		selfUpdate.rm_rf(d, resume);
	}
};

exports.main = function(args) {
	var [dest, target] = require('sjs:sys').argv();
	var platform_root = fs.realpath(process.cwd());
	var manifest = JSON.parse(fs.readFile('../share/manifest.json', "utf-8"));

	var [platform, arch] = target.split('_');
	var _os = { platform: platform, arch: arch};

	var package_name = "#{_os.platform}_#{_os.arch}";
	var base = path.join(platform_root, package_name);
	logging.warn("Processing #{package_name} in #{base}");

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
		var ext = selfUpdate.getExt(originalName);
		waitfor() {
			selfUpdate.extract(
				{path: local_tarball, originalName: originalName},
				component_base,
				extract,
				ext,
				resume);
		}

		var links = config.links;
		if(links) {
			links = selfUpdate.platformSpecificAttr(links, _os);
			links .. each {|link|
				if (link.runner) {
					throw new Error("don\'t know how to handle bootstrapped runner scripts yet");
				}
				var src = path.join(component_base, link.src);
				var dest = path.join(base, link.dest);
				selfUpdate.ensureDir(dest .. str.endsWith('/') ? dest : path.dirname(dest));
				run("cp", "-r", src, dest);
			}
		}
	}

	var share_root = path.join(platform_root, "../share");
	var share_dest = path.join(base, "share");
	logging.info("copying files from #{share_root} -> #{share_dest}");
	run("gup", "-u", share_root);
	selfUpdate.ensureDir(share_dest);
	fs.readdir(share_root) .. each {|filename|
		if (filename .. str.startsWith('.')) continue;
		filename = path.join(share_root, filename)
		run("gup", "-u", filename);
		logging.info("copying #{filename} -> #{share_dest}");
		run("cp", "-a", filename, share_dest);
	}

	var node_wrapper = selfUpdate.platformSpecificAttr(manifest.wrappers.node, _os);
	var filename = 'install.' + (_os.platform == 'windows' ? 'cmd' : 'sh');
	var content = node_wrapper.template.replace('__REL_PATH__', 'share/self-update.js');
	var script = path.join(base, 'share', filename);
	fs.writeFile(script, content);
	fs.chmod(script, 0755);
}

if (require.main === module) {
	exports.main();
}
