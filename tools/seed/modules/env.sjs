var env = require('mho:env');
@etcd = require('./job/etcd');

var def = function(key,val, lazy) {
	if (!env.has(key)) {
		if (lazy) env.lazy(key,val);
		else      env.set(key, val)
	}
}

exports.parse = function(args, options) {
	var parser = require('sjs:dashdash').createParser({
		options: options.concat({
			names: ['help', 'h'],
			type: 'bool',
		}),
	});

	try {
		var opts = parser.parse(args);
	} catch(e) {
		console.error('Error: ', e.message);
		process.exit(1);
	}

	if (opts.help) {
		console.log("options:\n");
		console.log(parser.help({includeEnv:true}));
		process.exit(0);
	}

	exports.defaults();
	return opts;
};

exports.defaults = function() {
	var PROD = process.env.NODE_ENV === 'production';

	def('publicHost', 'localhost.self');
	def('publicAddress', function(type, proto) {
		var port = env.get("port-#{type}");
		return "#{proto || "http"}://#{env.get('publicHost')}:#{port}/"
	});
	/* ^^ used for development, requires dnsmasq config:
		$ cat /etc/dnsmasq.d/self.conf
		address=/.self/127.0.0.1
	*/

	def('etcd-host', 'localhost');
	def('etcd-port', 4001);
	def('etcd', function() {
		return new @etcd.Etcd(this.get('etcd-host'), this.get('etcd-port'));
	}, true);

	// ports which proxy server should run on
	def('port-proxy-http', PROD ? 80 : 8080);
	def('port-proxy-https', PROD ? 443 : 4043);

	// master & slave conductance API ports
	def('port-master', 7079);
	def('port-slave', 7072);
};
