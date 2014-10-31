var env = require('mho:env');
@ = require('mho:std');
@etcd = require('./job/etcd');
@email = require('seed:auth/email');
@server = require('mho:server');
var PROD = process.env.NODE_ENV === 'production';

function initLogLevel() {
	if (process.env['SEED_LOG_LEVEL']) {
		var lvlName = process.env['SEED_LOG_LEVEL'].toUpperCase();
		var lvl = @logging[lvlName];
		@assert.number(lvl, "not a valid log level: #{lvlName}");
		@logging.setLevel(lvl);
	}
}
initLogLevel();

var seedLocal = require('mho:server/seed/local');

var portFromEnv = function(name, def, xform) {
	var e = process.env[name];
	if (e) {
		if (xform) e = xform(e);
		return parseInt(e, 10);
	}
	return def;
};


var defaultPorts = exports.defaultPorts = {
	http: portFromEnv('SEED_HTTP_PORT', PROD ? 80 : 8080),
	https: portFromEnv('SEED_HTTPS_PORT', PROD ? 443 : 4043),

	local: seedLocal.defaultPort,
	master: portFromEnv('SEED_MASTER_PORT', 7071),
	slave: portFromEnv('SEED_SLAVE_PORT', 7072),
};
var standardPorts = {
	http:80,
	https:443,
};


var def = function(key,val, lazy) {
	@assert.ok(val !== undefined, "Undefined env key: #{key}");
	if (!env.has(key)) {
		if (lazy) {
			@assert.eq(typeof(val), 'function', key);
			env.lazy(key,val);
		} else {
			env.set(key, val)
		}
	}
}


exports.installSignalHandlers = function() {
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
			@logging.print("Error adopting new environ: #{e}");
		}
	});
};

exports.defaults = function() {
	def('seed-api-version', seedLocal.apiVersion);
	var devDefault = function(obj, def, msg) {
		if(obj) return obj;
		if(PROD) throw new Error(msg);
		return def;
	};
	var devDefaultEnvvar = function(name, def, msg) {
		return devDefault(process.env[name], def, msg || "$#{name} not set");
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
	def('local-api-endpoint', '/local/remote.api');

	var selfHost = process.env['SEED_PUBLIC_ADDRESS'] || 'localhost.self';
	/* ^^ localhost.self is used for development, requires dnsmasq config:
		$ cat /etc/dnsmasq.d/self.conf
		address=/.self/127.0.0.1
	*/

	def('host-aliases', function() {
		// $SEED_HOST_ALIASES takes format:
		// <name>:<host> <name2>:<host2> ...
		var spec = process.env['SEED_HOST_ALIASES'];
		var rv = {};
		if(spec && spec.length > 0) {
			spec .. @split(' ') .. @each {|entry|
				var [name,host] = entry.split(':');
				rv[name] = host;
			}
		}
		@debug("SEED_HOST_ALIASES parsed: ", rv);
		return rv;
	}, true);
	
	// if any host aliases are defined, use vhost
	def('use-vhost', -> !this.get('host-aliases') .. @eq({}), true);

	;['proxy','master','slave'] .. @each {|service|
		def("host-#{service}",  function() {
			return process.env["SEED_#{service.toUpperCase()}_HOST"] || this.get('host-aliases')[service] || selfHost;
		}, true);
	}
	def('host-local', 'localhost');

	def('publicAddress', function() {
		var defaultProto = env.get('default-proto', 'http');
		var useVhost = env.get('use-vhost');
		return function(service, proto) {
			proto = proto || defaultProto;
			var origin = env.get("host-#{service}", selfHost);
			var port;
			switch(service) {
				case 'proxy':
					// never use explicit port
					port = env.get("port-#{proto}");
					break;
				case 'local':
					// always use explicit port
					port = env.get('port-local');
					break;
				default:
					if(useVhost) {
						port = env.get("port-#{proto}");
					} else {
						port = env.get("port-#{service}");
					}
					break;
			}

			var rv = "#{proto}://#{origin}";
			if(standardPorts[proto] !== port) {
				rv += ":#{port}";
			}
			rv += "/";
			return rv;
		};
	}, true);

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
			cert: @fs.readFile(@path.join(store, 'key-conductance-etcd-client.crt')),
			key:  @fs.readFile(@path.join(store, 'key-conductance-etcd-client.key')),
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

	def('seed-ssl', function() {
		var store = this.get('key-store');
		if (store) {
			return {
				cert: @path.join(store, 'key-conductance-https.crt') .. @fs.readFile(),
				key:  @path.join(store, 'key-conductance-https.key') .. @fs.readFile(),
			};
		} else {
			var insecure = @path.join(@env.get('conductanceRoot'), 'ssl');
			return {
				cert: @path.join(insecure, 'insecure-localhost.crt') .. @fs.readFile(),
				key:  @path.join(insecure, 'insecure-localhost.key') .. @fs.readFile(),
			};
		}
	}, true);

	// exposed ports
	def('port-http', defaultPorts.http);
	def('port-https', defaultPorts.https);
	def('port-master', defaultPorts.master);
	def('port-slave', defaultPorts.slave);
	def('port-local', defaultPorts.local);

	def('gcd-namespace', -> devDefaultEnvvar('DATASTORE_NAMESPACE', 'seed-dev'), true);
	def('gcd-host', process.env['DATASTORE_HOST'] || (PROD ? null : 'http://localhost:8089'));
	def('user-storage',
		-> this.get('gcd-credentials')
			? require('seed:master/user-gcd').Create(this.get('gcd-namespace'))
			: require('seed:master/user-leveldown'),
		true);

	// path overrides from $ENV
	var codeRoot = @url.normalize('..', module.id) .. @url.toPath;
	var dataDir = process.env['SEED_DATA'] || @path.join(codeRoot, 'data');
	@assert.ok(@fs.exists(dataDir), "data dir does not exist: #{dataDir}");
	def('data-root', dataDir);

	def('key-store', -> devDefaultEnvvar('SEED_KEYS', null), true);
	def('rsync-user', process.env['SEED_RSYNC_USER'] || null);

	def('api-keys', function() {
		var contents = @fs.readFile(@path.join(this.get('key-store') || codeRoot, 'key-conductance-apis.json'), 'utf-8');
		contents = contents.replace(/^\S*\/\/.*\n/gm, ''); // allow comments
		return contents .. JSON.parse;
	}, true);

	def('mandrill-api-keys', -> this.get('api-keys') .. @get('mandrill'), true);
	def('gcd-credentials', function() {
		var creds = this.get('api-keys').gcd .. devDefault(null, "gcd credentials not found");
		if (!creds) return creds;
		if(Array.isArray(creds.key)) {
			// convert string array into flat string
			creds.key = creds.key .. @join("\n");
		}
		return creds;
	}, true);

	def('email-transport', @email.mandrillTransport, true);
	def('runtime-environ', -> @path.join(this.get('data-root'), 'environ'), true);
	def('ctl-signal', 'SIGUSR2');
};

