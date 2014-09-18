var env = require('mho:env');
@ = require('mho:std');
@etcd = require('./job/etcd');
@email = require('seed:auth/email');
@server = require('mho:server');

function initLogLevel() {
	if (process.env['SEED_LOG_LEVEL']) {
		var lvlName = process.env['SEED_LOG_LEVEL'];
		var lvl = @logging[lvlName];
		@assert.number(lvl, "not a valid log level: #{lvlName}");
		@logging.setLevel(lvl);
	}
}
initLogLevel();

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
		options: options.concat([
			{
				names: ['host'],
				type: 'string',
				help: 'serve on address (default: "localhost". Use "any" to serve on any address")',
				'default': 'localhost',
			},
			{
				names: ['help', 'h'],
				type: 'bool',
			},
		]),
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

	var host;
	if (env.has('listen-iface')) {
		// already set (e.g multiple servers in one process); ignore opts.host
		host = env.get('listen-iface');
	} else {
		host = opts.host == 'any' ? null : opts.host;
		env.set('listen-iface', host);
	}
	opts.Port = function(num) {
		if(arguments.length > 1) return @server.Port.apply(null, arguments);
		console.log("Port #{num} on host #{host}");
		return @server.Port(num, host);
	};

	exports.defaults();

	// when we get sigusr2, adopt envvars found in $SEED_DATA/envvars
	var ENV_ORIG = process.env .. @clone();
	var MODIFIED = {};
	process.on(env.get('ctl-signal'), function() {
		// NOTE: currently we hard-code the things we want to respond to at runtime.
		// This is just SEED_LOG_LEVEL at the moment.

		function setenv(k, v, op) {
			console.log("[#{process.pid}] #{op ? op : 'Setting'} #{k}=#{v}");
			if (v === undefined) {
				delete process.env[k];
			} else {
				process.env[k] = v;
			}
		}

		try {
			var envFile = @path.join(env.get('data-root'), 'environ');
			@logging.warn("Deserializing new environment from: #{envFile}");

			// mark previously-modified keys as stale
			var old = MODIFIED .. @ownKeys .. @toArray;
			old .. @each {|key| MODIFIED[key] = false; }

			require('nodejs:fs').readFileSync(envFile, 'utf-8') .. @split("\n") .. @each {|line|
				line = line.trim();
				if(line.length == 0) continue;
				var [k,v] = line .. @split("=", 1);
				// freshly modified
				MODIFIED[k] = true;
				setenv(k, v == "" ? undefined : v);
			}

			// now revert stale modified keys
			old .. @each {|key|
				if (MODIFIED[key] != true) {
					// we didn't just re-set it
					setenv(key, ENV_ORIG[key], 'Reverting to original');
					delete MODIFIED[key];
				}
			};
			initLogLevel();
		} catch(e) {
			@logging.info("Error adopting new environ: #{e}");
		}
	});

	return opts;
};

exports.defaults = function() {
	def('seed-api-version', 1);
	var PROD = process.env.NODE_ENV === 'production';
	var devDefault = function(obj, def, msg) {
		if(obj) return obj;
		if(PROD) throw new Error(msg);
		return def;
	};
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
	def('etcd-ssl', function() {
		var store = this.get('key-store');
		if(!store) return null;
		return {
			agent: false,

			// trust a server signed by our CA
			ca:   @fs.readFile(process.env .. @get('ETCD_CA_FILE')),

			// provide our client certificate
			cert: @fs.readFile(process.env .. @get('SEED_ETCD_CLIENT_CERT')),
			key:  @fs.readFile(process.env .. @get('SEED_ETCD_CLIENT_KEY')),
		};
	}, true);
	def('etcd-proto', PROD ? 'https' : 'http');
	def('etcd', function() {
		var host = this.get('etcd-host');
		var port = this.get('etcd-port');
		var sslOpts = this.get('etcd-ssl');
		@logging.info("Connecting to etcd #{host}:#{port}");
		return new @etcd.Etcd(host, port, sslOpts);
	}, true);

	// ports which proxy server should run on
	def('port-proxy-http', portFromEnv('SEED_PROXY_PORT', 8080));
	def('port-proxy-https', portFromEnv('SEED_PROXY_PORT_HTTPS', 4043));

	// master & slave conductance API ports
	def('port-master', portFromEnv('SEED_MASTER_PORT', 7071));
	def('port-slave', portFromEnv('SEED_SLAVE_PORT', 7072));

	def('use-gcd', !!process.env['DATASTORE_HOST']);
	//def('gcd-host', -> process.env .. get('DATASTORE_HOST'), true);
	def('gcd-dataset', -> devDefault(process.env['DATASTORE_DATASET'], 'development', '$DATASTORE_DATASET not set'), true);
	def('user-storage',
		-> this.get('use-gcd')
			? require('seed:master/user-gcd').Create()
			: require('seed:master/user-leveldown'),
		true);

	// path overrides from $ENV
	var codeRoot = @url.normalize('..', module.id) .. @url.toPath;
	var dataDir = process.env['SEED_DATA'] || @path.join(codeRoot, 'data');
	@assert.ok(@fs.exists(dataDir), "data dir does not exist: #{dataDir}");
	def('data-root', dataDir);

	def('local-config-root',
		// used only for local server
		-> @path.join(process.env .. @get('XDG_CONFIG_HOME', @path.join(process.env .. @get('HOME'), '.config')), 'conductance'),
		true);

	def('key-store', -> devDefault(process.env['SEED_KEYS'], null, "$SEED_KEYS not set"), true);

	def('api-keys',
		-> @fs.readFile(@path.join(this.get('key-store') || codeRoot, 'api-keys.json'), 'utf-8') .. JSON.parse,
		true);

	def('email-transport', @email.mandrillTransport, true);
	def('runtime-environ', -> @path.join(this.get('data-root'), 'environ'), true);
	def('ctl-signal', 'SIGUSR2');
};

