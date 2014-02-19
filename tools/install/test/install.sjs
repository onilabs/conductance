#!/usr/bin/env sjs
@ = require('sjs:std');
@util = require('./util');

var [_, hostType] = @argv();
hostType = @path.basename(hostType) .. @rsplit('.', 1) .. @at(0);

var hosts = require('./hosts');
var systems = hosts.systems
	.. @filter(sys -> sys.platform == hostType);
@assert.ok(systems .. @count > 0, "No systems of type #{hostType} found");

systems .. @each {|system|
	var hostUtil = @util.api(system);
	var bundle = @util.bundlePath(system);
	hostUtil.ensureClean();
	var [manifest, manifestContents] = @util.loadManifest();

	hostUtil.serveProxy {|proxy|
		proxy.fake([
			[manifest.data.conductance.href, @util.conductanceHead],
			[manifest.manifest_url, new Buffer(manifestContents)],
		]) {||
			hostUtil.manualInstall('y');
		}
	}
}
