@ = require('mho:std');
@etcd = require('seed:job/etcd');

var port = -> @env.get('etcd-port');
var host = -> @env.get('etcd-host');
var proto = -> @env.get('etcd-proto');
var root_url = -> "#{proto()}://#{host()}:#{port()}/v2/";
var etcd = -> @env.get('etcd');

function awaitRunningServer() {
	var root = root_url();
	waitfor {
		while(true) {
			if (exports.isRunning(root)) {
				break;
			} else {
				hold(1000);
			}
		}
	} or {
		hold(2000);
		@info("Still waiting for etcd to start...");
		hold();
	}
}

exports.isRunning = function(root) {
	root = root || root_url();
	try {
		@http.get(root + "keys/");
		@info("Found server on #{root}");
		return true;
	} catch(e) {
		if (!e.message .. @contains('ECONNREFUSED')) {
			throw e;
		}
	}
	return false;
};

exports.withEtcd = function(block) {
	if (exports.isRunning()) {
		@info("Using existing etcd server");
		block();
	} else {
		@info("Starting new etcd server");
		waitfor {
			@childProcess.run(@url.normalize('./etcd', module.id) .. @url.toPath, {'stdio':'inherit'});
		} or {
			awaitRunningServer();
			block();
		}
	}
};
