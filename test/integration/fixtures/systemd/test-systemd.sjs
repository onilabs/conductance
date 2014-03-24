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
			if (blk()); return;
		}
		catch(e) {
			err = e;
		}
		if (tries++ >= 5) throw err || new Error("timeout exceeded");
		console.log("wait ..");
		hold(1000);
	}
};

function install() {
	@sd._main(['install', config, '--user'].concat(arguments .. @toArray));
};
var ctl = new @sd._SystemCtl({groups:['myapp'], user: true});

@context("installation") {||
	@test.beforeAll {||
		install();
	}

	@test("installs units in the appropriate .wants location") {||
		install();
		@fs.readdir(unitDest) .. @assert.contains('multi-user.target.wants');
		@fs.readdir(unitDest + '/multi-user.target.wants') .. @assert.eq(['myapp.target']);
		@fs.readdir(unitDest + '/myapp.target.wants') .. @sort .. @assert.eq([
			'myapp-main.socket',
			'myapp-service.service',
			'myapp-timer.timer'
			] .. @sort);
	}

	@test("starts group target upon installation") {||
		ctl._runningUnits() .. @assert.eq('todo');
	}
}
