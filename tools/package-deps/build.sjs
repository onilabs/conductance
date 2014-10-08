#!/usr/bin/env sjs
@ = require(['sjs:std', 'sjs:nodejs/mkdirp', 'sjs:nodejs/rimraf']);
var here = @url.normalize('./', module.id) .. @url.toPath();
var outputs = [
	['portable', ['nodemon', 'google-oauth-jwt', 'agentkeepalive']],
	['bootstrap', ['tar', 'fstream']],
	// do compiled last
	['compiled', ['leveldown', 'protobuf']],
];

// To build only a subset, pass one or more args like:
//
// ./script portable
// ./script compiled-windows
// ./script compiled-linux-x86
//
// ( ... )

var manifest = @fs.readFile("../install/share/manifest.json") .. JSON.parse();
// we want to restrict native compilation to the exact version we're distributing:
var nodeVersion = manifest .. @getPath('data.node.id');
var selsPath = @path.join(here, 'selections');

var args = @argv();
var shouldBuild;
var sysId = sys -> "#{sys.platform}-#{sys.arch}";
if (args.length == 0) {
	shouldBuild = -> true;
} else {
	shouldBuild = (category, sys) ->
		args .. @hasElem(category) || (
		sys ? (
			args .. @hasElem("#{category}-#{sys.platform}") ||
			args .. @hasElem("#{category}-#{sys .. sysId()}")
		) : false
	)
}

function versionDeps(packages) {
	return packages .. @map(function(name) {
		var info = @fs.readFile("../../node_modules/#{name}/package.json") .. JSON.parse();
		console.warn("Using #{name}@#{info.version}");
		return [name, info.version];
	});
};


function compileNativeDeps(category, deps) {
	var hosts = require('../install/test/hosts');
	hosts.systems .. @each {|sys|
		var id = sys .. sysId();
		if (!shouldBuild(category, sys)) {
			console.log("Skipping #{category}-#{id}");
			continue;
		}
		console.log("Building #{category}-#{id}");
		var versionedDeps = versionDeps(deps);
		
		// we check selections into source, for auditing
		var selection_dest = @path.join(here, 'selections', id);
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

		var tempName = 'conductance-binary-deps.tgz';
		var pythonScript = @fs.readFile('remote_build.py', 'utf-8') .. @supplant({
			versionedDeps: JSON.stringify(versionedDeps),
			xdg_data_override_tar: xdg_data_override_tar ? xdg_data_override_tar .. JSON.stringify() : 'None',
			xdg_data_override: xdg_data_override .. JSON.stringify(),
			nodeVersion: nodeVersion,
			tempName: tempName .. JSON.stringify(),
			common_py: @fs.readFile('common.py', 'utf-8'),
		});
		//console.log(pythonScript);

		host.runPython(pythonScript, true /* quiet */);

		var archiveDest = @path.join(here, 'dist', id + '.tgz');
		host.getTempfile(tempName, archiveDest);
	}
}

function compilePortableDeps(category, deps) {
	if (!shouldBuild(category)) {
		console.log("Skipping #{category}");
		return;
	}
	var versionedDeps = versionDeps(deps);
	var tempdir = @path.join(here, 'build', category + '.tmp');
	var builddir = @path.join(here, 'build', category);
	if(@fs.exists(builddir)) @rimraf(builddir);
	versionedDeps .. @each {|[name, version]|
		var args = {
			tempdir:tempdir,
			builddir:builddir,
			name:name,
			version:version,
		};
		@childProcess.run('python', ['-c',
			"import common; common.gather(#{args .. @ownPropertyPairs .. @map(([k,v]) -> "#{k}=#{v .. JSON.stringify()}")})"], {stdio:'inherit'});
	};
	@childProcess.run('tar', ['czf', @path.join(here, 'dist', "#{category}.tgz"),
		'-C', builddir].concat(@fs.readdir(builddir)), {stdio:'inherit'});

	@rimraf(builddir);
};

outputs .. @each {|[category, deps]|
	if (category === 'compiled') {
		compileNativeDeps(category, deps);
	} else {
		compilePortableDeps(category, deps);
	}
}

