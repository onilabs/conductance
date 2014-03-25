@ = require(['sjs:test/std', 'mho:std']);
@sd = require('mho:server/systemd');

var config = @url.normalize('./config.mho', module.id);
var unitDest = (process.env .. @get('HOME')) + '/.config/systemd/user';

var waitUntil = function(blk) {
	var tries=0;
	var err;
	while(true) {
		err = null;
		try {
			if (blk()) return;
		}
		catch(e) {
			err = e;
		}
		if (tries++ >= 5) throw err || new Error("timeout exceeded");
		console.log("wait ..");
		hold(1000);
	}
};

var ctl = new @sd._SystemCtl({groups:['myapp'], user: true});
function stopAll() {
	var runningUnits = ctl._activeUnits();
	if(runningUnits.length > 0) ctl.stop(runningUnits);
};

var activationTime = (unit) -> ctl._unitProperties(unit, ['ActiveEnterTimestampMonotonic'])
	.. @get('ActiveEnterTimestampMonotonic')
	.. parseInt();


function runAction(action) {
	@sd._main([action, '--config', config, '--user'].concat(Array.prototype.slice.call(arguments, 1)));
};

function install() {
	@sd._main(['install', config, '--user'].concat(arguments .. @toArray));
};

function assertRestarts(units, blk) {
	var startTimes = units .. @map(activationTime);

	blk();

	var newStartTimes = units .. @map(activationTime);
	@info("initial start times: ", startTimes);
	@info("new     start times: ", newStartTimes);
	units .. @indexed .. @each {|[i, unit]|
		@assert.ok(newStartTimes[i] > startTimes[i], "#{unit} didn't get restarted");
	}
};


var groupDependencies = [
	'myapp-main.socket',
	'myapp-service.service',
	'myapp-background.timer',
	'myapp-cron.timer',
] .. @sort;

var minimalUnits = groupDependencies.concat([
	'myapp.target',
]) .. @sort;

var startupUnits = minimalUnits.concat([
	'myapp-background.service', // started 0m after boot
]) .. @sort;

var allUnits = startupUnits.concat([
	'myapp-main.service',
	'myapp-cron.service',
]) .. @sort;

@context("installation") {||
	@test.beforeEach {||
		stopAll();
		install();
	}

	@test("installs units in the appropriate .wants location") {||
		@fs.readdir(unitDest) .. @assert.contains('multi-user.target.wants');
		@fs.readdir(unitDest + '/multi-user.target.wants') .. @assert.eq(['myapp.target']);
		@fs.readdir(unitDest + '/myapp.target.wants') .. @sort .. @assert.eq(groupDependencies .. @sort);
	}

	@test("starts necessary targets upon installation") {||
		ctl._activeUnits() .. @sort .. @assert.eq(startupUnits .. @sort);
	}

	@test("restarts (only) startup units on installation") {||
		assertRestarts(startupUnits, install);

		var runningUnits = ctl._activeUnits();
		runningUnits .. @remove('myapp-main.service'); // XXX remove once resolved: http://lists.freedesktop.org/archives/systemd-devel/2014-March/018193.html
		runningUnits .. @sort .. @assert.eq(startupUnits .. @sort);
	}

	@test("restarts running non-startup on installation") {||
		var unit = 'myapp-main.service';
		startupUnits .. @assert.notContains(unit);
		ctl.start([unit]);
		ctl._activeUnits() .. @assert.contains(unit);

		var startTime = activationTime(unit);
		install();
		var newStartTime = activationTime(unit);
		@assert.ok(newStartTime > startTime, "#{unit} didn't get restarted");
	}

	@test("stops and removes previously-installed units") {||
	}.skip("TODO");

	@test("stops and removes _all_ conductance units") {||
	}.skip("TODO");
}

@context("unit control") {||
	@test.beforeAll {||
		install();
	}

	@test.beforeEach {||
		stopAll();
		waitUntil(-> ctl._activeUnits() .. @eq([]));
	}

	@test("starts only required units by default") {||
		runAction('start');
		ctl._activeUnits() .. @sort .. @assert.eq(startupUnits);
	}

	@test("starts all units if --all given") {||
		runAction('start', '--all');
		ctl._activeUnits() .. @sort .. @assert.eq(allUnits);
	}

	@test("restarts all units that happen to be running") {||
		ctl._activeUnits() .. @assert.eq([]);
		runAction('restart');
		ctl._activeUnits() .. @assert.eq([]);

		ctl.start(allUnits);
		assertRestarts(allUnits) {||
			runAction('restart');
		}
	}

	@test("stops all running units") {||
		ctl.start(allUnits);
		runAction('stop');
		ctl._activeUnits() .. @sort .. @assert.eq([]);
	}

	@context("manual group control") {||
		// these are more here to document what happens than to
		// describe desired behaviour -
		// ideally we'd like stop and restart of the group unit to
		// propagate to _all_ units, but that would currently
		// cause `install` to start _all_ units.

		@test("starting group starts minimal units") {||
			ctl.start(['myapp.target']);
			ctl._activeUnits() .. @sort .. @assert.eq(startupUnits);
		}

		@test("restarting group restarts minimal services") {||
			ctl.restart(['myapp.target']);
			ctl._activeUnits() .. @sort .. @assert.eq(startupUnits);

			assertRestarts(startupUnits, -> ctl.restart(['myapp.target']));

			ctl.start(allUnits);
			assertRestarts(allUnits, -> ctl.restart(['myapp.target']));
		}
	}.skip("not currently working as expected");
}
