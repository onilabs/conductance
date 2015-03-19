#!/usr/bin/env sjs
@ = require(['sjs:std', 'sjs:nodejs/mkdirp', 'sjs:nodejs/rimraf']);
var here = @url.normalize('./', module.id) .. @url.toPath();
var hosts = require('../install/test/hosts');
var outputs = [
	// known not to contain any platform-specific code
	['portable', ['nodemon', 'google-oauth-jwt', 'agentkeepalive', 'ssh2']],
	// required for the operation of the self-installer
	['bootstrap', ['tar', 'fstream']],
	// will be compiled and packaged across every platform + arch that we support
	['compiled', ['leveldown', 'protobuf', 'weak']],
];

// To build only a subset, pass one or more args like:
//
// ./script portable
// ./script compiled-windows
// ./script compiled-linux-x86
//
// ( ... )


// sanity check: make sure all deps in package.json match up with the combination
// of deps in each category.
// (we skip `
(function() {
	var pkgInfo = @fs.readFile("../../package.json") .. JSON.parse();
	var actualDeps = ['dependencies', 'optionalDependencies']
		.. @map(typ -> pkgInfo[typ] .. @ownKeys)
		.. @concat
		.. @unique
		.. @filter(x -> x !== 'stratifiedjs') // packaged explicitly from git
		.. @sort;
	var packagedDeps = outputs
		.. @map.filter([category, packages] -> category == 'bootstrap' ? null : packages)
		.. @concat
		.. @unique
		.. @sort;
	packagedDeps .. @assert.eq(actualDeps, "this script is out of sync with the package.json dependencies");
})();


var manifest = @fs.readFile("../install/share/manifest.json") .. JSON.parse();
// we want to restrict native compilation to the exact version we're distributing:
var nodeVersion = manifest .. @getPath('data.node.id');

var args = @argv();
var shouldBuild;
var sysId = sys -> "#{sys.platform}-#{sys.arch}";
if (args.length == 0) {
	shouldBuild = -> true;
} else {
	if(args .. @any(a -> a .. @startsWith('-'))) {
		console.warn("Valid filters:");
		outputs .. @each {|[component,_]|
			var lines = (component === 'compiled') ?
				hosts.systems .. @map(s -> [
					"#{component}-#{s.platform}",
					"#{component}-#{s .. sysId()}",
				]) .. @concat .. @unique .. @sort
			: [component];
			console.warn(lines .. @map(l -> '  ' + l) .. @join('\n'))
		}
		process.exit(1)
	}
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
	hosts.systems .. @each {|sys|
		var id = sys .. sysId();
		if (!shouldBuild(category, sys)) {
			console.log("Skipping #{category}-#{id}");
			continue;
		}
		console.log("Building #{category}-#{id}");
		var versionedDeps = versionDeps(deps);
		
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

		console.log("Running on #{host.host}");
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

	var args = {
		packages:versionedDeps,
		node_version:nodeVersion,
		tempdir:tempdir,
		destdir:builddir,
	};
	var serializedArgs = args .. @ownPropertyPairs .. @map(([k,v]) -> "#{k}=#{v .. JSON.stringify()}");
	@childProcess.run('python', ['-c',
		"import common; common.install(#{serializedArgs})"],
		{stdio:'inherit'}
	);

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

