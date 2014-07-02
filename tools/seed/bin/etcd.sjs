@ = require('mho:std');
@etcd = require('seed:job/etcd');

function awaitRunningServer(proto, host, port) {
	var root = "#{proto}://#{host}:#{port}/v2/";
	waitfor {
		while(true) {
			try {
				@http.get(root + "keys/");
				@info("Found server on #{root}");
				break;
			} catch(e) {
				if (!e.message .. @contains('ECONNREFUSED')) {
					throw e;
				}
				hold(1000);
			}
		}
	} or {
		hold(2000);
		@info("Still waiting for etcd to start...");
		hold();
	}
}

exports.withEtcd = function(block) {
	waitfor {
		@childProcess.run(@url.normalize('./etcd', module.id) .. @url.toPath, {'stdio':'inherit'});
	} or {
		awaitRunningServer('http', 'localhost', 4001);
		block(new @etcd.Etcd('localhost', 4001));
	}
};
