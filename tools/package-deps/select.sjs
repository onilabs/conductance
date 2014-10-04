#!/usr/bin/env sjs
@ = require(['sjs:std', 'sjs:nodejs/mkdirp']);
var outputs = {
	portable: ['nodemon', 'google-oauth-jwt', 'agentkeepalive'],
	compiled: ['leveldown', 'protobuf'],
	bootstrap: ['tar'],
};

@hosts = require('../install/test/hosts');
var nativeDeps = outputs.compiled;
var versionedDeps = nativeDeps .. @map(function(name) {
	var info = @fs.readFile("../../node_modules/#{name}/package.json") .. JSON.parse();
	console.warn("Using #{name}@#{info.version}");
	return [name, info.version];
});

var manifest = @fs.readFile("../install/share/manifest.json") .. JSON.parse();
// we want to restrict native compilation to the exact version we're distributing:
var nodeVersion = manifest .. @getPath('data.node.id');

@hosts.systems .. @each {|sys|
	console.log("Selecting on:", sys);
	//if (sys.platform !== 'darwin') continue;
	if (sys.platform !== 'windows') continue;
	host = sys.host();

	var xdg_data_override = @path.join("xdg", "data_#{sys.platform}");
	var xdg_data_override_tar;
	if (@fs.exists(xdg_data_override)) {
		xdg_data_override_tar = xdg_data_override + '.tgz';
		@childProcess.run('tar', ['czf', xdg_data_override_tar, xdg_data_override], {'stdio':'inherit'});
		xdg_data_override_tar = host.copyFile(xdg_data_override_tar, 'xdg_data_overrides');
	} else {
		console.warn("WARN: no XDG override: #{xdg_data_override}");
	}

	var pythonScript = @fs.readFile('select.py', 'utf-8') .. @supplant({
		versionedDeps: JSON.stringify(versionedDeps),
		xdg_data_override_tar: xdg_data_override_tar ? xdg_data_override_tar .. JSON.stringify() : 'None',
		xdg_data_override: xdg_data_override .. JSON.stringify(),
		nodeVersion: nodeVersion,
	});
	console.log(pythonScript);

	host.runPython(pythonScript, true /* quiet */);
}
