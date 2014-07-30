var env = require('mho:env');
@fs = require('sjs:nodejs/fs');
@assert = require('sjs:assert');
@url = require('sjs:url');
@etcd = require('./job/etcd');
@logging = require('sjs:logging');
var { @at } = require('sjs:sequence');

if (process.env['SEED_LOG_LEVEL']) {
	@logging.setLevel(@logging[process.env['SEED_LOG_LEVEL']]);
}

var def = function(key,val, lazy) {
	@assert.ok(val != null, "Undefined env key: #{key}");
	if (!env.has(key)) {
		if (lazy) {
			@assert.eq(typeof(val), 'function', key);
			env.lazy(key,val);
		} else {
			env.set(key, val)
		}
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
	/* ^^ used for development, requires dnsmasq config:
		$ cat /etc/dnsmasq.d/self.conf
		address=/.self/127.0.0.1
	*/
	def('publicAddress', function(type, proto) {
		var port = env.get("port-#{type}");
		return "#{proto || "http"}://#{env.get('publicHost')}:#{port}/"
	});

	var portFromEnv = function(name, def, xform) {
		var e = process.env[name];
		if (e) {
			if (xform) e = xform(e);
			return parseInt(e, 10);
		}
		return def;
	};

	var etcdAddr = (process.env['ETCD_ADDR'] || 'localhost:4001').split(':');

	def('etcd-host', etcdAddr[0]);
	def('etcd-port', etcdAddr[1]);
	def('etcd-proto', 'http'); // XXX no support for https yet...
	def('etcd', function() {
		var host = this.get('etcd-host');
		var port = this.get('etcd-port');
		@logging.info("Connecting to etcd #{host}:#{port}");
		return new @etcd.Etcd(host, port);
	}, true);

	// ports which proxy server should run on
	def('port-proxy-http', portFromEnv('SEED_PROXY_PORT', 8080));
	def('port-proxy-https', portFromEnv('SEED_PROXY_PORT_HTTPS', 4043));

	// master & slave conductance API ports
	def('port-master', portFromEnv('SEED_MASTER_PORT', 7071));
	def('port-slave', portFromEnv('SEED_SLAVE_PORT', 7072));

	// path overrides from $ENV
	var dataDir = process.env['SEED_DATA'] || (@url.normalize('../data', module.id) .. @url.toPath);
	@assert.ok(@fs.exists(dataDir), "data dir does not exist: #{dataDir}");
	def('data-root', dataDir);
};
