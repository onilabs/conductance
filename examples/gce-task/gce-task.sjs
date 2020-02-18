#!/usr/bin/env conductance
/**
 * A script for running an on-demand GCE instance to perform some work.
 * Once created, the calling code will have SSH access to the new instance.
 * On completion (or error) , the instance will be terminated.
 */

@ = require('sjs:std');
@legacy = require('sjs:legacy');
@g = require('mho:server/googleapis');
@ssh = require('mho:ssh-client');
@logging.setLevel(@logging.DEBUG);

var PREFIX='gce-task-';
var defaultSourceRange = '0.0.0.0/0';
var allPorts = ['0-65535'];
var ubuntuImage = 'https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-1410-utopic-v20150509';
var defaultOpts = {
	flavor: 'f1-micro',
	user: 'ubuntu',
	image: ubuntuImage,
};

var globalResources = {
	network: {
		id: 'net',
		cidr: "192.168.3.0/24",
		rules: {
			'all': {
				sourceRanges: [defaultSourceRange],
				allowed: [
					{ IPProtocol: 'tcp', ports: allPorts, },
					{ IPProtocol: 'icmp', },
				],
			},
		},
	},
	key: {
		id: PREFIX+'key',
	},
};

/*
 * Credentials should contain:
 * {
 *   account: "--------@developer.gserviceaccount.com",
 *   key: "/path/to/key.pem",
 *   project: "projectname",
 *   zone: "us--------
 * }
 *
 */
var createClient = exports.createClient = function createClient(creds) {
	var jwtClient = new @g.auth.JWT(
		creds .. @get('account'),
		creds .. @get('key'),
		null, ['https://www.googleapis.com/auth/compute']
	);
	var tokens = jwtClient.authorize();
	var client = @g.compute({version: 'v1', auth: jwtClient});
	var rv = Object.create(client);
	rv.apiParams = {
		zone: creds.zone,
		project: creds.project,
	};
	return rv;
};

exports.withServer = function(client, opts, block) {
	if(arguments.length === 2) {
		block = opts;
		opts = {};
	}
	opts = defaultOpts .. @merge(opts);

	setupGlobalResources(client);
	var q = p -> client.apiParams .. @merge(p);
	var serverWrapper = acquire(client, opts, true) .. @assert.ok();
	var server = serverWrapper.instance;
	console.log("Got server #{server.id}");

	try {
		while(server.status !== 'RUNNING') {
			console.log(" ... waiting for server (#{server.status})");
			hold(2000);
			server.refresh();
		}
		console.log("Waiting for host keys ...");
		while(true) {
			var output = client.instances.getSerialPortOutput({instance: server.name }..q).contents;
			if(output) {
				//console.log(output);
				
				if (opts.image .. @contains('coreos')) {
					var coreosPrefix = 'SSH host key: ';
					var keys = output.split('\n')
						.. @filter(line -> line .. @startsWith(coreosPrefix))
						.. @transform(line -> line.slice(coreosPrefix.length))
						.. @transform(function(line) {
							//console.log("KEYLINE: #{line}");
							var [ hex, _alg ] = line.split(' ');
							return hex;
						})
					;
				} else {
					try {
						// strip leading log soure lines (e.g `ec2: `)
						var lines = output.split('\n')
						.. @map(line -> line.replace(/^[^ ]*: /, ''));

						var startPos = lines .. @indexed .. @find(([i,line]) -> /BEGIN SSH HOST KEY FINGERPRINTS/.test(line)) .. @first;
						var endPos = lines .. @indexed .. @find(([i,line]) -> /END SSH HOST KEY FINGERPRINTS/.test(line)) .. @first;
					} catch(e) {
						if(!e instanceof @SequenceExhausted) throw e;
						lines = [];
					}
					var keys = lines.slice(startPos+1, endPos)
					.. @transform(function(line) {
						//console.log("KEYLINE: #{line}");
						var [ _size, hex, _path, _alg ] = line.split(' ');
						return hex;
					});
				}

				keys = keys
					.. @map(function(hex) {
						// make sure it looks like the kind of key we expect:
						@assert.ok(/^[a-zA-Z0-9]{2}(:[a-zA-Z0-9]{2})+$/.test(hex), "Bad key: #{hex}");
						return hex.replace(/:/g,'');
					})
					.. @toArray();

				if(keys.length > 0) {
					console.log("got keys:", keys);
					serverWrapper.hostKeys = keys;
					break;
				}
			}

			hold(5000);
		}
		block(serverWrapper);
	} finally {
		console.log("deleting server");
		client.instances['delete']({
			instance: server.name,
		}..q);
	}
};


function removeLeading(subj, prefix) {
	if (subj .. @startsWith(prefix)) {
		subj = subj.slice(prefix.length);
	}
	return subj;
}


function isNotFound(e) {
	return (e.errors[0].reason === 'notFound');
}

function setupGlobalResources(client) {
	var q = p -> client.apiParams .. @merge(p);
	var spec = globalResources;

	var networkSpec = globalResources .. @get('network');
	var network;
	try {
		network = client.networks.get({network: PREFIX+networkSpec.id} .. q);
		console.log("Using existing network ...");
	} catch(e) {
		if (e.errors[0].reason !== 'notFound') throw e;
		network = client.networks.insert({
			resource: {
				name: PREFIX+networkSpec.id,
			}
		} .. q);
	}

	// check firewall rules
	var networkUrl = network .. @get('selfLink');
	var firewalls = client.firewalls.list({} .. q).items .. @filter(function(fw) {
		return fw .. @get('network') === networkUrl;
	}) .. @toArray();

	var essence = function(fw) {
		// given a firewall rule, extract a minimal spec (so we can compare it against the desired state)
		// XXX doesn't support denied rules
		return [fw.name .. removeLeading(PREFIX), {
			sourceRanges: fw.sourceRanges,
			allowed: fw.allowed
		}];
	};

	var [toKeep, toDelete] = firewalls .. @legacy.partition(function(fw) {
		var [id, rule] = essence(fw);
		return networkSpec.rules[id] .. @eq(rule);
	}) .. @map(@toArray);

	var toCreate = networkSpec.rules .. @ownPropertyPairs
		.. @transform([key, val] -> [PREFIX+key,val])
		.. @filter([key, _] -> !toKeep .. @any(rule -> rule.name === key))
		.. @toArray;

	console.log("network: keeping #{toKeep.length} rules, deleting #{toDelete.length} and creating #{toCreate.length}");

	toDelete .. @each.par {|fw|
		console.log("Delete: #{fw.name}");
		client.firewalls['delete']({
			firewall: fw.name,
			network: networkUrl,
		} .. q);
	}

	toCreate .. @each.par {|[name, rule]|
		console.log("Create: #{name}");
		client.firewalls.insert({
			resource: {
				name: name,
				network: networkUrl,
			} .. @merge(rule),
		} .. q);
	}
}

function Server(client, instance, opts) {
	this.instance = instance .. @assert.ok();
	this.client = client .. @assert.ok();
	this._addQueryParams = p -> client.apiParams .. @merge(p);
	this.opts = opts;
}

function newInstanceId() {
	return require('crypto').randomBytes(3).toString('hex');
}

function acquire(client, opts) {
	var q = p -> client.apiParams .. @merge(p);

	var id;
	while(true) {
		id = PREFIX+newInstanceId();
		try {
			client.instances.get({
				instance: id,
			}..q);
		} catch(e) {
			if(isNotFound(e)) break;
			throw e;
		}
	}

	var diskName = id;
	var diskParams = {
		//"type": "PERSISTENT",
		"boot": true,
		//"mode": "READ_WRITE",
		"deviceName": diskName,
		"autoDelete": true,
	};

	waitfor {
		var machineType = client.machineTypes.get({machineType: opts.flavor} .. q);
	} and {
		var network = client.networks.get({network: PREFIX+globalResources.network.id} .. q);
	} and {
		console.log("Creating instance from image: #{opts.image}");
		// create a disk from opts.image
		diskParams.initializeParams = {
			"sourceImage": opts .. @get('image'),
		};
	}

	var server = client.instances.insert({
		resource: {
			"machineType": machineType .. @get('selfLink'),
			name: id,
			disks: [
				diskParams,
			],
			networkInterfaces: [
				{
					"network": network .. @get('selfLink'),
					"accessConfigs": [
						{
							"name": "External NAT",
							"type": "ONE_TO_ONE_NAT"
						}
					]
				},
			],
		},
	}..q);
	return new Server(client, server, opts);
};

exports.deleteResources = function(client) {
	// we must delete resources bottom-up
	var q = p -> client.apiParams .. @merge(p);
	var firewalls = client.firewalls.list({}..q).items;
	client.networks.list({} .. q).items
		.. @filter(net -> net.name .. @startsWith(PREFIX))
		.. @each {|net|
		firewalls .. @filter(fw -> fw.network === net.selfLink) .. @each {|fw|
			console.log("Deleting firewall: #{fw.name}");
			client.firewalls['delete']({firewall: fw.name}..q);
		}
		console.log("Deleting network: #{net.name}");
		client.networks['delete']({
			network: net.name,
		}..q);
	}

	client.instances.list({} ..q).items
		.. @filter(instance -> instance.name .. @startsWith(PREFIX))
		.. @each {|instance|
		console.log("Deleting instance: #{instance.name}");
		client.instances['delete']({
			instance: instance.name,
		}..q);
		
	}
}

var ssh = exports.ssh = function ssh(server, block) {
	var ip = server.instance.networkInterfaces[0].accessConfigs[0] .. @get('natIP');
	var sshOpts = {
		host: ip,
		hostHash: 'md5',
		hostVerifier: hostKey -> server.hostKeys .. @hasElem(hostKey),
		username: server.opts .. @get('user'),
	};
	//console.log(ip);
	var agentPath = process.env.SSH_AUTH_SOCK;
	if(agentPath) sshOpts.agent = agentPath;
	@ssh.connect(sshOpts, block);
};

exports.bootstrap = function(conn) {
	//conn .. @ssh.exec('bash -euxc "
	//	sudo yum -y update
	//	sudo yum -y install npm git make gcc
	//"', {'stdio':'inherit'});

	conn .. @ssh.exec('bash -euxc "
		curl https://conductance.io/install.sh > /tmp/install.sh
		rm -rf "$HOME/.conductance"
		echo n | env CONDUCTANCE_HEADLESS=1 bash -e /tmp/install.sh
	"', {'stdio':'inherit'});
}

exports.installApp = function(conn, codeRoot) {
	var @tar = require('sjs:nodejs/tar');
	var @gzip = require('sjs:nodejs/gzip');
	var archive = @tar.pack(codeRoot) .. @gzip.compress();
	console.log("Uploading code...");
	conn .. @ssh.exec('bash -euxc "
		rm -rf app
		mkdir app
		tar xz -C app
	"', {stdio:['pipe', 'inherit', 'inherit']}) {|stream|
		archive .. @pump(stream.stdin);
	}

	if(@path.join(codeRoot, 'package.json') .. @fs.exists()) {
		conn .. @ssh.exec('bash -euxc "
			cd app
			npm install --production
		"', {stdio:'inherit'});
	}
}

exports.run = function(conn) {
	console.log("Running...");
	conn .. @ssh.exec('bash -euxc "
		cd app
		export PATH="$PATH:$PWD/node_modules/.bin:$HOME/.conductance/bin"
		conductance serve
	"', {stdio:'inherit'});
}

if (require.main === module) {
	(function() {
		var args = @sys.argv();
		var p = require('sjs:dashdash').createParser({options: [
			{name: 'help', type: 'bool',},
			{name: 'delete', type: 'bool', help: 'remove all instances and shared resources'},
			{name: 'setup', type: 'bool', help: 'only set up shared resources (network, etc)'},
		]});
		var opts = p.parse();
		args = opts._args;
		if (opts.help) {
			console.warn("Usage: gce-task.sjs [OPTIONS] command [arg] [arg...]\n\nOptions:\n#{p.help()}");
			process.exit(1);
		}

		var client = -> exports.createClient(require('./gce-credentials'));
		
		if(opts.setup) {
			client() .. setupGlobalResources();
		} else if (opts['delete']) {
			client() .. exports.deleteResources();
		} else {
			if (args.length == 0) throw new Error("Command required");
			client() .. exports.withServer {|server|
				server .. ssh {|conn|
					// this is just a sample script which runs a single SSH command.
					// Unless your requirements are trivial,
					// you should use this module programmatically
					conn .. exports.bootstrap();
					console.warn("+ #{args .. @join(' ')}");
					conn .. @ssh.run(args[0], args.slice(1), {'stdio':'inherit'});
				}
			}
		}
	})();
}
