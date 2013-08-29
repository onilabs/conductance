#!/usr/bin/env sjs
// vim: syntax=sjs:
var fs = require('sjs:nodejs/fs');
var child_process = require('sjs:nodejs/child-process');
var path = require('nodejs:path');
var seq  = require('sjs:sequence');
var { concat, each, map, toArray, filter, find, any, join } = seq;
var string = require('sjs:string');
var array = require('sjs:array');
var { isArrayLike } = array;
var object = require('sjs:object');
var { ownKeys, ownValues, hasOwn, ownPropertyPairs, merge } = object;
var shell_quote = require('sjs:shell-quote');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var Url = require('sjs:url');
var sys = require('sjs:sys');

var conductance = require('./_config');
var env = require('./env');

var fail = function(msg) {
	throw new Error(msg);
}

var CONDUCTANCE_FLAG = 'X-Conductance-Generated';
var DEFAULT_GROUP = 'conductance';

var GroupProto = Object.create({});
GroupProto._init = function(name, units) {
	this.name = name;
	this.units = units;
};

/**
  @class Group
  @function Group
  @param {optional String} [name]
  @default "conductance"
  @param {Object} [units]
  @desc
    Creates a group of systemd services.

    The keys from `units` become the systemd target names (prefixed by the group name).
    The values of `units will be turned into sytemd units.

    ### Example:

        var env = require('mho:server/env');
        var { Group, ConductanceArgs } = require('mho:server/systemd');
        var { Port } = require('mho:server');

        var serverAddress = Port(8080);

        exports.systemd = Group("my-app",
          {
            main: {
              Service: {
                Restart: 'always',
                User: 'myapp',
                Group: 'myapp',
                Environment: [
                  'NODE_ENV=production',
                ],
                'ExecStart': ConductanceArgs.concat('run', env.config().path),
              },
              // use socket activation
              Socket: {
                Listen: serverAddress,
              },
            }
          }
         );
    


    The systemd units are generated with the following rules:
  
    // TODO...

*/
var Group = exports.Group = function(name, units) {
	var rv = Object.create(GroupProto);
	if (arguments.length < 2) {
		units = arguments[0];
		name = DEFAULT_GROUP;
	}
	rv._init(name, units);
	return rv;
};

/**
  used by configs to define systemd actions which will launch conductance
  (using the current node, sjs & conductance versions, regardless of what is on
  $PATH etc)
  */
exports.ConductanceArgs = [
	process.execPath,
	sys.executable,
	path.join(env.conductanceRoot(), 'modules/server/main.sjs'),
];

var parseArgs = function(command, options, args) {
	var parser = dashdash.createParser({ options: options });
	var opts = parser.parse(args);
	if (opts.help) {
		logging.error("Usage: conductance systemd #{command} [OPTIONS]\nOPTIONS:\n#{parser.help()}");
		throw new Error();
	}
	if (!opts.dest) {
		// default to system location
		opts.dest = '/etc/systemd/system';
	}
	if (opts.verbose) logging.setLevel(logging.DEBUG);
	logging.verbose("Using systemd root: #{opts.dest}");
	return opts;
};

/* Assert that no arguments were passed */
var noargs = function(opts) {
	if (opts._args.length > 0) {
		fail("Extra arguments provided");
	}
};

/* run a systemctl command */
var run_systemctl = function(opts, args) {
	var _args = [];
	args = _args.concat(args);
	logging.info(" - running: systemctl #{args.join(" ")}");
	return child_process.run('systemctl', args, {stdio:'inherit'});
};

/**
 * simple wrapper around common systemctl operations
 */
var SystemCtl = function(opts) {
	this.opts = opts;
	this.mainTargets = opts.groups .. map(name -> "#{name}.target");
};

SystemCtl.prototype._run = function(args, opts, quiet) {
	if (!opts) opts = {};
	var _args = [];
	// TODO: add --user option if opts.user
	args = _args.concat(args);
	if (quiet !== true) logging.info(" - running: systemctl #{args.join(" ")}");
	return child_process.run('systemctl', args, {stdio: 'inherit'} .. merge(opts));
};

SystemCtl.prototype._run_output = function(args) {
	return this._run(args, {stdio: [process.stdin, 'pipe', process.stderr]}, true).stdout;
}

SystemCtl.prototype._runUnits = function (action, units) {
	if (units.length == 0) {
		throw new Error("No units given to #{action} action.");
	}
	return this._run([action].concat(units));
}

SystemCtl.prototype.reloadConfig = ()      -> this._run(['daemon-reload']);
SystemCtl.prototype.reinstall    = (units) -> this._runUnits('reenable', units);
SystemCtl.prototype.uninstall    = (units) -> this._runUnits('disable', units);
SystemCtl.prototype.start        = (units) -> this._runUnits('start', units);
SystemCtl.prototype.stop         = (units) -> this._runUnits('stop', units);
SystemCtl.prototype.status       = (units) -> this._runUnits('status', units);

SystemCtl.prototype.stopUnwanted = function() {
	// TODO: there should be a more specific call we can make here:
	var unwanted = [];
	this._runningUnits() .. each {|unitName|
		var props = this._unitProperties(unitName, [
			'LoadState',
			'ActiveState',
			'SubState',
			'UnitFileState',
		]);

		if (props.ActiveState === 'failed') {
			logging.debug("unit #{unitName} is in failed state - skipping");
			continue;
		}
		if (props.UnitFileState === '') {
			logging.debug("activeState is '#{props.ActiveState}', but unit file is '#{props.UnitFileState}'");
			unwanted.push(unitName);
		} else {
			logging.debug("unit #{unitName} has file state #{props.UnitFileState} - skipping");
		}
	}

	if (unwanted.length > 0) {
		logging.debug("Stopping unwanted units:", unwanted);
		this.stop(unwanted);
	} else {
		logging.info("No unwanted units running");
	}
};

SystemCtl.prototype._unitProperties = function(unit, propertyNames) {
	var args = seq.concat(
		['show'],
		propertyNames .. seq.intersperse('-p'),
		['--', unit]) .. toArray;

	var output = this._run_output(args);

	var props = {};
	output.split('\n')
		.. each {|line|
			line = line.trim();
			if (!line) continue;
			[key, val] = line .. string.split('=', 1);
			props[key.trim()] = val.trim();
		};
	//logging.debug("Unit #{unit} has props:", props);
	return props;
};

SystemCtl.prototype._runningUnits = function() {
	var output = this._run_output(['list-units', '--no-legend', '--no-pager', '--full']);
	output = output.split('\n')
	.. filter(line -> line.trim())
	.. map (function(line) {
			return line.trim().split(/\s/)[0];
		});

	var units = this.opts.groups .. transform(function(namespace) {
		return output
		.. filter(name -> name .. string.startsWith(namespace));
	}) .. concat .. toArray;
	logging.debug("Currently running unit names: ", units);
	return units;
};

SystemCtl.prototype.restart = function(units) {
	this._runUnits('restart', units);
	// restart only has an effect if units are running, so we start them just in case
	this.start(units);
}

SystemCtl.prototype.log = function(units, args) {
	var cmdline = units .. map(u -> ['--unit', u]) .. concat .. toArray;
	cmdline = cmdline.concat(args);
	logging.info(" - running: journalctl #{cmdline.join(" ")}");
	return child_process.run('journalctl', cmdline, {stdio:'inherit'});
};


/**
 * write a string to a file
 */
var write = function(f, s) {
	var buf = new Buffer(s + '\n');
	logging.debug(s);
	fs.write(f, buf, 0, buf.length);
}

/**
 * Confirm an action i opts.interactive is set
 */
var confirm = function(opts, msg) {
	if (!opts.interactive) return;
	if(!msg) msg = "Continue? [y/N]";
	var debug = require('sjs:debug');
	var response = debug.prompt(msg + " ");
	if (response !== 'y') fail("User cancelled...");
}

/**
 * Ensure directory exists
 */
var ensureDir = function(dir) {
	if (!fs.exists(dir)) {
		logging.info("#{dir} does not exist - creating it");
		fs.mkdir(dir);
	}
}

/**
 * Return a list of all installed units
 * under the given groups.
 */
var installedUnits = function(opts, exclude) {
	var base = opts.dest;
	exclude = (exclude || []) .. map(u -> u.name);

	var unit_files = fs.readdir(base);
	logging.debug("existing unit files:", unit_files);
	var conductanceFlagRe = new RegExp("^#{CONDUCTANCE_FLAG} *= *true", "m")
	var is_conductance = function(target) {
		var validName = (
			opts.groups .. any((namespace)
				-> target .. string.startsWith("#{namespace}-")
				|| target == "#{namespace}.target"));

		if(validName) {
			var contents = fs.readFile(path.join(base, target)).toString();
			if (conductanceFlagRe.test(contents)) {
				return true;
			}
		}
		return false;
	};
	return unit_files
		.. filter(is_conductance)
		.. toArray
		.. array.difference(exclude)
		.. map(u -> new Unit(opts.dest, u));
}

/**
 * Execute a block in a specific director
 */
var chdir = function(dir, block) {
	var old = process.cwd();
	process.chdir(dir);
	try {
		block();
	} finally {
		process.chdir(old);
	}
}

var uninstallExistingUnits = function(opts, exclude) {
	var old_units = installedUnits(opts, exclude);
	var oldUnitNames = old_units .. map(u -> u.name);
	logging.debug("old unit files:", oldUnitNames);
	if (old_units.length > 0) {
		logging.print(
			["Uninstalling #{old_units.length} #{opts.groups .. join(",")} units from #{opts.dest}:"]
			.concat(oldUnitNames).join("\n - "));
		confirm(opts);
		var unitNames = old_units .. map(u -> u.name);
		var ctl = new SystemCtl(opts);
		try {
			ctl.stop(unitNames);
		} catch(e) {
			if (!opts.force) throw e;
		}
		ctl.uninstall(unitNames);
		old_units .. each {|unit|
			if (fs.exists(unit.path())) {
				fs.unlink(unit.path());
			}
		}
	}
	return old_units;
}

var firstDuplicate = function(arr) {
	// assumes all values are truthy (or at least !== null)
	var last = null;
	arr .. each {|item|
		if (item === last) return item;
		last = item;
	}
	return null;
}

var uninstall = function(opts) {
	noargs(opts);
	var base = opts.dest;
	if (!fs.exists(base)) {
		fail("#{base} does not exist");
	}
	uninstallExistingUnits(opts);
}

/**
 * Unit file abstraction
 */
function Unit(base, filename) {
	assert.string(base, 'base');
	assert.string(filename, 'filename');
	this.base = base;
	this.name = filename;
	this.sections = [];
	this.desiredLinks = [];
}

Unit.prototype.addSection = function(name, conf) {
	var params = [];
	// flatten arrays into lists of params, for consistency
	conf .. ownPropertyPairs .. each {|[key,val]|
		var vals = (val .. isArrayLike()) ? val : [val];
		vals .. each {|val|
			params.push([key, val]);
		}
	}
	if (name == 'Unit') {
		params.push([CONDUCTANCE_FLAG, 'true']);
	}
	this.sections.push([name, params]);
}

Unit.prototype.write = function() {
	ensureDir(this.base);
	var f = fs.open(this.path(), 'w');
	try {
		this._write(f);
	} finally {
		fs.close(f);
	}
}

Unit.prototype.toString = -> "<Unit(#{this.name})>";

Unit.prototype._write = function(f) {
	this.sections .. each {|[name, params]|
		f .. write("[#{name}]");
		params .. each {|[key,val]|
			f .. write(key + '=' + val);
		}
		f .. write('\n');
	}
};

Unit.prototype.path = -> path.join(this.base, this.name);

var install = function(opts) {
	var base = opts.dest;
	var mkunit = (name) -> new Unit(opts.dest, name);
	ensureDir(opts.dest);

	var configFiles = opts._args;
	if (configFiles.length == 0) {
		configFiles = [conductance.defaultConfig()];
		logging.warn("Using default config: #{configFiles[0]}");
	}

	var namespaces = {};
	var addUnit = function(namespace, unit) {
		if (!namespaces .. hasOwn(namespace)) {
			namespaces[namespace] = [];
		}
		namespaces[namespace].push(unit);
	};

	configFiles .. each {|configPath|
		var config = conductance.loadConfig(configPath);
		var group = config.systemd;
		if (!group) {
			fail("No systemd config for #{configPath}");
		}
		
		// allow lazy definitions
		if (group instanceof(Function)) group = group();

		if (!GroupProto.isPrototypeOf(group)) {
			logging.warn("Deprecation warning: exports.systemd should be a systemd.Group");
			group = exports.Group(group);
		}

		var namespace = group.name;
		var groupTarget = "#{namespace}.target";

		group.units .. ownPropertyPairs .. each {|[name, sys]|
			var fqn = "#{namespace}-#{name}"
			var serviceUnit = mkunit("#{fqn}.service");
			var service = sys.Service || {};
			var socket = sys.Socket;

			var socketUnit = socket ? mkunit("#{fqn}.socket") : null;

			// -- Service --
			var requires = [];
			if (socketUnit) requires.push(socketUnit.name);
			serviceUnit.addSection('Unit', {
				'X-Conductance-Source': env.configPath(),
				'Requires': requires,
				'After': 'local-fs.target network.target',
			});

			service = object.merge({
				// fully qualify both `node` and `sjs` executables to ensure we get the right runtime
				'ExecStart': exports.ConductanceArgs.concat('run', env.configPath()),
				'User': 'nobody',
				'Group': 'nobody',
				'SyslogIdentifier': fqn,
				'StandardOutput': 'syslog',
			}, service);
			// quote all exec* arrays
			service .. object.ownPropertyPairs .. each {|[k,v]|
				if (k .. string.startsWith('Exec') && v .. isArrayLike()) {
					service[k] = shell_quote.quote(v);
				}
			}
			// expand environment {k1:"v1"} into ["k1=v1", ...]
			if (service.Environment !== undefined &&
			    !service.Environment .. isArrayLike() &&
			    !service.Environment .. isString()) {
				service.Environment = service.Environment .. ownPropertyPairs .. map([k,v] -> "#{k}=#{v}");
			}

			serviceUnit.addSection('Service', service);

			// -- Service Install --
			var defaults = {};
			if (!socketUnit) {
				defaults['WantedBy'] = groupTarget;
			}
			var install = object.merge(defaults, sys.Install || {});
			serviceUnit.addSection('Install', install);
			addUnit(namespace, serviceUnit);

			if (socket) {
				socketUnit.addSection('Unit', { 'Requires': groupTarget });
				socket = object.clone(socket);
				// socket.listen is intended for `ports` style objects, we move it to socket.ListenStream
				// after processing
				if (socket.Listen) {
					var ports = socket.Listen;
					delete socket.Listen;
					if (!Array.isArray(ports)) ports = [ports];
					socket.ListenStream = ports .. map(p -> p.getAddress ? p.getAddress() : p);
				}
				socketUnit.addSection('Socket', socket);
				socketUnit.addSection('Install', { WantedBy: groupTarget });
				addUnit(namespace, socketUnit);
			}
		}
	}


	opts.groups = namespaces .. ownKeys .. toArray;
	// add one root target per namespace
	namespaces .. ownPropertyPairs .. each {|[namespace, units]|
		var rootService = mkunit("#{namespace}.target");
		rootService.addSection('Unit', { Description: "Oni Conductance target" });
		rootService.addSection('Install', { WantedBy: "multi-user.target" });
		units.push(rootService);
	}

	// combine units from all namespaces
	var allUnits = namespaces .. ownValues .. concat .. toArray;

	// check for duplicates
	var unitNames = allUnits .. map(u -> u.name) .. seq.sort();

	var firstDupe = firstDuplicate(unitNames);
	if (firstDupe !== null) {
		fail("Duplicate unit file detected (#{firstDupe}) - no files written");
	}

	uninstallExistingUnits(opts, allUnits);

	logging.info(["Installing:"].concat(unitNames).join("\n - "));
	confirm(opts);
	allUnits .. each {|unit|
		unit.write();
	}

	var ctl = new SystemCtl(opts);
	ctl.reinstall(unitNames);

	logging.info("Reloading config ...");
	ctl.reloadConfig();

	if (opts.no_restart) {
		logging.info("Starting new services ...");
		ctl.start(ctl.mainTargets);
	} else {
		logging.info("Restarting services ...");
		ctl.restart(ctl.mainTargets);
	}
}

exports.main = function(args) {
	var commonOptions = [
			{
				name: 'dest',
				type: 'string',
				help: 'Override default systemd unit location',
			},
			{
				names: ['verbose','v'],
				type: 'bool',
			},
			{
				names: ['help','h'],
				type: 'bool',
				help: 'Show this help',
			},
	];

	var commonInstallOptions = [
		{
			name: 'no-restart',
			type: 'bool',
			help: 'don\'t restart existing units, even if their configuration has changed (this will still start new units and stop old ones)'
		},
		{
			names: ['interactive', 'i'],
			type: 'bool',
			help: 'Prompt for confirmation before changing anything'
		},
	];

	var groupOptions = [
		{
			names: ['group','g'],
			type: 'arrayOfString',
			help: "Specify group to act on (if not given, the default of \"#{DEFAULT_GROUP}\" is used)",
			'default': [],
		},
	]

	if (!args) args = require("sjs:sys").argv();
	var command = args.shift();
	// everything but `install` uses groupOptions, so we include it in the default set
	var options = [commonOptions, groupOptions] .. concat .. toArray;
	var action;
	switch(command) {
		case "install":
			options = commonOptions.concat(commonInstallOptions);
			action = install;
			break;
		case "uninstall":
			options = [commonOptions, commonInstallOptions, groupOptions, [
				{
					name: 'force',
					type: 'bool',
					help: "Remove config files even if services can't be stopped",
				}
			]] .. concat .. toArray;
			action = uninstall;
			break;

		case "list":
			action = function(opts) {
				noargs(opts);
				installedUnits(opts) .. each(u -> console.log(u.name));
			};
			break;

		// undocumented action, as it shouldn't be
		// necessary (and may be removed)
		case "stop-unwanted":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.stopUnwanted();
			};
			break;

		case "restart":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.restart(ctl.mainTargets);
			};
			break;

		case "stop":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.stop(ctl.mainTargets);
			};
			break;

		case "start":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.start(ctl.mainTargets);
			};
			break;

		case "log":
			action = function(opts) {
				var ctl = new SystemCtl(opts);
				var units = installedUnits(opts);
				ctl.log(units..map(u->u.name), opts._args);
			};
			break;

		case "status":
			action = function(opts) {
				var ctl = new SystemCtl(opts);
				var units = installedUnits(opts);
				ctl.status(units..map(u->u.name), opts._args);
			};
			break;

		default:
			var msg = command ? "Unknown command: #{command}" : "No command given";
			fail("#{msg}\n
Commands:
  SYSTEM MODIFICATION:
    install:    Install units from one or more .mho config files.
                Also removes previously-installed units that are
                no longer defined.

    uninstall:  Remove all currently installed conductance units in
                the given group(s).

  SERVICE ACTIONS:
    list:       List installed conductance units in the given group(s).
    start:      Start conductance group(s) (noop if already running).
    stop:       Stop conductance group(s).
    restart:    Restart conductance group(s).
    status:     Run systemctl status on conductance group(s).
    log:        Run journalctl on conductance group(s).

  Actions that act on group(s) accept `--group/-g` multiple times,
  and default to #{DEFAULT_GROUP} if no groups are specified.

Global options:\n#{dashdash.createParser({ options: commonOptions }).help({indent:2})}

Pass `--help` after a valid command to show command-specific help.");
			break;
	}
	var opts = parseArgs(command, options, args);
	if (opts.group && opts.group.length === 0) {
		opts.groups = [DEFAULT_GROUP];
	} else {
		opts.groups = opts.group;
		delete opts.group;
	}
	action(opts);
}

exports.run = function(args) {
	try {
		exports.main(args);
	} catch(e) {
		logging.debug(String(e));
		if (e.message) logging.error(e.message);
		process.exit(1);
	}
}

if (require.main === module) {
	exports.run();
}
