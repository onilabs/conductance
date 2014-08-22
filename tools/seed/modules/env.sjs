var env = require('mho:env');
@fs = require('sjs:nodejs/fs');
@assert = require('sjs:assert');
@url = require('sjs:url');
@etcd = require('./job/etcd');
@logging = require('sjs:logging');
@email = require('seed:auth/email');
var { @at } = require('sjs:sequence');
var { @get } = require('sjs:object');

if (process.env['SEED_LOG_LEVEL']) {
	var lvlName = process.env['SEED_LOG_LEVEL'];
	var lvl = @logging[lvlName];
	@assert.number(lvl, "not a valid log level: #{lvlName}");
	@logging.setLevel(lvl);
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
	def('seed-api-version', 1);
	var PROD = process.env.NODE_ENV === 'production';
	def('production', PROD);
	def('deployLoopback', false);
	def('anonymous-access', false);
	def('cors', function() {
		// if we've disabled anonymous-access, then all our APIs
		// are protected by explicit authentication, so leave
		// them open to CORS.
		return !this.get('anonymous-access');
	}, true);
	def('cors-origins', []);

	var internalHost = 'localhost';
	def('internalAddress', process.env['SEED_INTERNAL_ADDRESS'] || internalHost);

	var selfHost = 'localhost.self';
	def('host-self', process.env['SEED_PUBLIC_ADDRESS'] || selfHost);
	def('host-proxy', process.env['SEED_PROXY_HOST'] || selfHost);
	/* ^^ localhost.self is used for development, requires dnsmasq config:
		$ cat /etc/dnsmasq.d/self.conf
		address=/.self/127.0.0.1
	*/
	def('publicAddress', function(server, service, proto) {
		if(arguments.length === 1) {
			service = server;
			server = 'self'
		}
		var port = env.get("port-#{service}");
		var host = env.get("host-#{server}");
		return "#{proto || "http"}://#{host}:#{port}/"
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

	def('local-config-root',
		// used only for local server
		-> @path.join(process.env .. @get('XDG_CONFIG_HOME', @path.join(process.env .. @get('HOME'), '.config')), 'conductance'),
		true);

	def('key-store', -> process.env['SEED_KEYS'] || null, true);

	def('email-domain', -> process.env['MAILGUN_SERVER'] || this.get('host-self'), true);
	def('email-transport', @email.mailgunTransport, true);
};
