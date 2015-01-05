#!/usr/bin/env sjs
// This script creates required runtime directories (as root)
// NOTE: this script is run AS ROOT, so don't do anything dumb ;)
@childProcess = require('sjs:nodejs/child-process');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@fs = require('sjs:nodejs/fs');
@assert = require('sjs:assert');
@path = require('nodejs:path');
var { @each } = require('sjs:sequence');
var { @startsWith, @contains } = require('sjs:string');

function env(name) {
	var rv = process.env[name];
	@assert.ok(rv, "Not defined: $#{name}");
	return rv;
};

function chown(owner, path) {
	console.log("chown #{owner} #{path}");
	@childProcess.run('chown', ['-R', owner, path], {'stdio':'inherit'});
}

function chmod(perm, path) {
	console.log("chmod #{perm.toString(8)} #{path}");
	@fs.chmod(path, perm);
}

function chgrp(group, path) {
	console.log("chgrp #{group} #{path}");
	@childProcess.run('chgrp', ['-R', group, path], {'stdio':'inherit'});
}

function create(dir, mode, owner, group) {
	console.log("mkdirp #{dir}");
	@mkdirp(dir);
	chmod(mode, dir);
	if (owner) {
		chown(owner, dir);
	}
	if (group) {
		chgrp(group, dir);
	}
}

function unlink(path) {
	if(@fs.exists(path)) @fs.unlink(path);
}

create(env('SEED_VAR'), 0755);
create(env('SEED_DATA'), 0750, 'conductance', 'conductance');
create(env('SEED_DATA')+'/run', 0750, 'conductance', 'conductance');
unlink(env('SEED_DATA')+'/environ');
create(env('ETCD_DATA_DIR'), 0750, 'etcd', 'wheel');


// now set ownership / permissions on key files
(function setKeyPermissions() {
	var base = env('SEED_KEYS');
	var contents = @fs.readdir(base);
	contents .. @each {|file|
		var path = @path.join(base, file);

		// chmod
		if (file .. @startsWith('key-all-')) {
			// workd-readable
			chmod(0644, path);
		} else if (file .. @startsWith('key-') && file .. @contains('-ssh')) {
			// SSH keys are owner-only
			chmod(0600, path);
		} else {
			// all other keys are group-readable
			chmod(0640, path);
		}

		// chown
		if (file .. @startsWith('key-etcd-')) {
			chown('etcd.root', path);
		} else if (file .. @startsWith('key-slave-')) {
			chown('conductance.root', path);
		} else if (file .. @startsWith('key-conductance-') || file .. @startsWith('key-all-')) {
			var owner = 'conductance.conductance';
			if (file .. @startsWith('key-conductance--etcd-')) {
				owner = 'etcd.conductance';
			}
			chown(owner, path);
		}
	}
})();
