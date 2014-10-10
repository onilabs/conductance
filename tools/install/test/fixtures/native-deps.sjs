@ = require('sjs:test/std');
var runner = require('sjs:test/runner');
var reporter = require('sjs:test/reporter');

// To make sure the deployed binaries are compatible with
// the target OS/arch, we have a smoke test here for
// each native dep we rely on:

var r = new runner.Runner(runner.getRunOpts({
	reporter: new reporter.DefaultReporter({}),
}));

r.context("native-deps.sjs") {||
	@test("storage (leveldown)") {||
		var storage = require('mho:server/storage');
		require('sjs:nodejs/tempfile').TemporaryDir() {|d|
			storage.Storage(d) {|s|
				s.put("test", "true");
				s.get("test").toString('utf-8') .. @assert.eq("true");
			}
		}
	}

	@test("flux (protobuf)") {||
		// XXX should we start a dev server to properly test protobuf?
		var Gcd = require('mho:flux/gcd');
		var gcd = Gcd.GoogleCloudDatastore({
			schemas: {},
			context: {devel:true,},
		});
	}
};

r.run();
