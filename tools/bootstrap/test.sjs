#!/usr/bin/env sjs
require('sjs:test/runner').run({
	base: module.id,
	modules: ['test/bundle-tests.sjs'],
	bail: true,
});

