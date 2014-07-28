#!/usr/bin/env sjs
// This script creates required runtime directories (as root)
// NOTE: this script is run AS ROOT, so don't do anything dumb ;)
@childProcess = require('sjs:nodejs/child-process');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@fs = require('sjs:nodejs/fs');
@assert = require('sjs:assert');

function env(name) {
	var rv = process.env[name];
	@assert.ok(rv, "Not defined: $#{name}");
	return rv;
};

function create(dir, mode, owner, group) {
	@mkdirp(dir);
	@fs.chmod(dir, mode);
	if (owner) {
		@childProcess.run('chown', [owner, dir]);
	}
	if (group) {
		@childProcess.run('chgrp', [group, dir]);
	}
}

create(env('SEED_VAR'), 0755);
create(env('SEED_DATA'), 0750, 'conductance', 'wheel');
create(env('SEED_DATA')+'/run', 0711, 'conductance', 'conductance');
create(env('ETCD_DATA_DIR'), 0750, 'etcd', 'wheel');
