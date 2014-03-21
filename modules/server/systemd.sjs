#!/usr/bin/env sjs
// vim: syntax=sjs:

/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */


/**
  @summary Utilities for defining systemd units
*/

var fs = require('sjs:nodejs/fs');
var stream = require('sjs:nodejs/stream');
var child_process = require('sjs:nodejs/child-process');
var path = require('nodejs:path');
var seq  = require('sjs:sequence');
var { concat, each, map, toArray, filter, find, any, join, hasElem } = seq;
var string = require('sjs:string');
var array = require('sjs:array');
var { isArrayLike } = array;
var object = require('sjs:object');
var { ownKeys, ownValues, hasOwn, ownPropertyPairs, merge, pairsToObject, getPath } = object;
var shell_quote = require('sjs:shell-quote');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var Url = require('sjs:url');
var sys = require('sjs:sys');
var { inspect } = require('sjs:debug');

var conductance = require('./_config');
var env = require('./env');

var fail = function(msg) {
	throw new Error(msg);
}

var CONDUCTANCE_FLAG = 'X-Conductance-Generated';
var CONDUCTANCE_FORMAT_FLAG = 'X-Conductance-Format';
var CONDUCTANCE_FORMAT = 1;
var CONDUCTANCE_GROUP_FLAG = 'X-Conductance-Group';

var DEFAULT_GROUP = 'conductance';


/**
  @class Group
  @function Group
  @param {optional String} [name="conductance"]
  @param {Array} [units] an array of [::Unit] objects
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
                'ExecStart': ConductanceArgs.concat('serve', env.config().path),
              },
              // use socket activation
              Socket: {
                Listen: serverAddress,
              },
            }
          }
         );
    


    The following types are supported as values:

     - The `Environment` value may be an
       object literal - its [sjs:object::ownPropertyPairs] will be
       collected and converted to "#{key}=#{value}" format.

     - `Exec*` values may be an array, in which case
       they will be escaped using [sjs:shell-quote::].

     - For all other cases, Arrays will be repeated as
       multiple values of the same key, e.g: `{key: [1,2,3]}`
       will be converted to:

           key=1
           key=2
           key=3
*/

var GroupProto = Object.create({});
var Group = exports.Group = object.Constructor(GroupProto);

GroupProto._init = function(name, components) {
	if (arguments.length < 2) {
		components = arguments[0];
		name = DEFAULT_GROUP;
	}
	this.name = name;
	this.unitFilename = "#{this.name}.target";
	this.components = this._processComponents(components, this.unitFilename);
};

GroupProto.unit = -> this._addMandatorySettings(Unit('Target', null, {
	'Unit':    { Description: "Oni Conductance target" },
	'Install': { WantedBy: "multi-user.target" },
}));

GroupProto._addMandatorySettings = function(unit) {
	// add common settings
	unit.override('Unit', [
		[CONDUCTANCE_FLAG, 'true'],
		[CONDUCTANCE_FORMAT_FLAG, String(CONDUCTANCE_FORMAT)],
		[CONDUCTANCE_GROUP_FLAG, this.unitFilename],
	] .. pairsToObject());
}

GroupProto._processComponents = function(components, groupTarget) {
	components .. ownPropertyPairs .. each {|[key, units]|
		if (!isArrayLike(units)) {
			// promote single unit object into an array
			components[key] = [units];
		}
	}

	components .. ownPropertyPairs .. each {|[name, units]|
		units .. each {|unit|
			if (!UnitProto.isPrototypeOf(unit)) {
				fail("Not a systemd.Unit object: #{unit .. inspect}");
			}
		}

		var fqn = "#{this.name}-#{name}";
		var unitTypes = units .. map(u -> u.type);

		// trigger types are units that will activate a service.
		var triggerTypes = ['socket', 'timer'];
		var hasTrigger = (triggerTypes .. array.union(unitTypes)).length > 0;

		units .. each {|unit|
			this._addMandatorySettings(unit);
			unit.setDefault('Install', { 'WantedBy': groupTarget });

			// add in defaults or each unit type
			if (unit.type == 'service') {

				// if there's a socket unit depend upon it
				if (unitTypes .. hasElem('socket')) {
					unit.setDefault('Unit', {
						'Requires': ["#{fqn}.socket"],
					});
				}

				unit.setDefault('Unit', {
					'After': ['local-fs.target', 'network.target'],
				});

				unit.setDefault('Service', {
					// fully qualify both `node` and `sjs` executables to ensure we get the right runtime
					'ExecStart': exports.ConductanceArgs.concat('run', env.configPath()),
				});

				// If we don't have any trigger units defined, we bind this
				// service directly to the group target
				if (!hasTrigger) {
					unit.setDefault('Unit', { 'PartOf': groupTarget });
				}

			} else {
				// all non-service units are bound to the group target
				unit.setDefault('Unit', { 'PartOf': groupTarget });
			}

			if (unit.type == 'socket') {
				// socket.listen is intended for `ports` style objects,
				// we move it to socket.ListenStream after processing
				var ports = unit.sections .. getPath('Socket.Listen', null);
				if (ports !== null) {
					var socket = unit.sections['Socket'];
					delete socket['Listen'];

					if (!Array.isArray(ports)) ports = [ports];
					socket['ListenStream'] = ports .. map(p -> p.getAddress ? p.getAddress() : p);
				}
			}
		};
	};
	
	return components;
};

/**
  @class Unit
  @function Unit
  @param {String} [type]
  @param {Object|null} [primarySettings]
  @param {optional Object} [additionalSettings]
  @desc
    Creates a systemd unit, suitable for passing to [::Group].

    Generally, it's more convenient to use the shortcut functions to create
    units of standard types:

    - [::Service]
    - [::Socket]
    - [::Timer]

    `type` should be a lowercase string like "socket", "service", etc.

    A systemd unit is made up of multiple sections. The primary section is
    named after the type (e.g the promary section for a service is the "Service"
    section). The keys and values specified in `primarySettings` will be used for the primary section.

    If you need to specify additional sections (e.g "Unit"), you should pass
    these in `additionalSettings`. This is an object with keys for each section, and
    nested objects for that section's settings.

    To understand what settings you should configure, consult
    [the systemd.unit documentation](http://www.freedesktop.org/software/systemd/man/systemd.unit.html).

    ### Example:

        Unit('service', {
          Restart: 'always',
          User: 'myapp',
          ExecStart: ConductanceArgs.concat('serve', env.config().path),
        }, {
          Install: {
            WantedBy: 'multi-user.target',
          }
        });


    ### Value types:

    The following types are supported as values for any setting:

     - `String`: this will be written to the configuration file without
       any processing.

     - `Array`: in general, Arrays will be repeated as
       multiple values of the same key, e.g: `{key: [1,2,3]}`
       will be converted to:

           key=1
           key=2
           key=3

     However, There are some property-specific exceptions to the above conversion rules:

     - A value for the `Environment` setting may be a
       string, an array of pairs, or an object literal
       (whose [sjs:object::ownPropertyPairs] will be used).

       If given a string, it will be written as-is to the configuration file.
       If given an array or object, the keys and values will be escaped (so
       that special characters and spaces are represented literally, rather than
       interpreted by systemd.

     - `Exec*` values may be an array, in which case
       they will be escaped using [sjs:shell-quote::].


*/
var titleCase = (s) -> s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

var UnitProto = Object.create({});
UnitProto._init = function(type, attrs, sections) {
	sections = sections ? object.clone(sections) : {};
	if (attrs) {
		var primarySection = type .. titleCase();
		assert.notOk(sections .. hasOwn(primarySection), "additional sections includes #{primarySection}");
		sections[primarySection] = object.clone(attrs);
	}

	// Check for non-normalized section names.
	// These _could_ be valid multi-word sections we don't know about, so just warn
	sections .. ownKeys .. each {|key|
		var normalized = key .. titleCase();
		if (key != normalized) {
			logging.warn("Unknown systemd unit section #{inspect(key)} - did you mean #{inspect(normalized)}?");
		}
	}


	this.sections = sections;
	this.type = type.toLowerCase();
};

UnitProto.ensureSection = function(section) {
	if (!this.sections .. hasOwn(section)) {
		this.sections[section] = {};
	}
	return this.sections[section];
};

UnitProto.setDefault = function(section, attrs) {
	this.sections[section] = object.merge(attrs, this.ensureSection(section));
};

UnitProto.override = function(section, attrs) {
	this.sections[section] = object.merge(this.ensureSection(section), attrs);
};

var Unit = exports.Unit = object.Constructor(UnitProto);

exports.Service = () -> Unit.apply(null, ['service'].concat(arguments .. toArray));
exports.Socket  = () -> Unit.apply(null, ['socket' ].concat(arguments .. toArray));
exports.Timer   = () -> Unit.apply(null, ['timer'  ].concat(arguments .. toArray));

/**
  used by configs to define systemd actions which will launch conductance
  (using the current node, sjs & conductance versions, regardless of what is on
  $PATH etc)
  */
exports.ConductanceArgs = [
	process.execPath,
	sys.executable,
	path.join(env.conductanceRoot, 'modules/server/main.sjs'),
];

var parseArgs = function(command, options, args) {
	var parser = dashdash.createParser({ options: options });
	var opts = parser.parse(args);
	if (opts.help) {
		logging.print("Usage: conductance systemd #{command} [OPTIONS]\nOPTIONS:\n#{parser.help()}");
		process.exit(0);
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
	if (this.opts.files_only) return null;
	if (!opts) opts = {};
	var _args = [];
	// TODO: add --user option if opts.user
	args = _args.concat(args);
	if (quiet !== true) logging.info(" - running: systemctl #{args.join(" ")}");
	return child_process.run('systemctl', args, {stdio: 'inherit'} .. merge(opts));
};

SystemCtl.prototype._run_output = function(args) {
	if (this.opts.files_only) return '';
	return this._run(args, {stdio: [process.stdin, 'pipe', process.stderr]}, true).stdout;
}

SystemCtl.prototype._runUnits = function (action, units) {
	if (units.length == 0) {
		throw new Error("No units given to #{action} action.");
	}
	return this._run([action].concat(units));
}

SystemCtl.prototype.controlUnits = function() {
	// controlUnits are those that should be started / stopped / etc.
	// if `--all` is passed in as an option, this returns all installed units.
	// Otherwise, this returns the per-group `.target` unit
	if (this.opts.all) {
		return installedUnits(this.opts) .. map(u -> u.name);
	} else {
		return this.mainTargets;
	}
};

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
	if (this.opts.files_only) return [];

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
	var [cleanUnits, uncleanUnits] = units .. seq.partition(unit ->
		unit .. string.endsWith('.socket') || unit .. string.endsWith('.target')
	) .. map(toArray);
	
	// non-socket units can't restart cleanly (but will have no
	// downtime if they are covered by socket unit)
	logging.debug("stopping units: ", uncleanUnits);

	if (uncleanUnits.length > 0) {
		this.stop(uncleanUnits);
	}

	// socket units can restart cleanly
	if (cleanUnits.length > 0) {
		this._runUnits('restart', cleanUnits);
	}
	this.start(units);
}

SystemCtl.prototype.log = function(units, args) {
	var cmdline = units .. map(u -> ['--unit', u]) .. concat .. toArray;
	cmdline = cmdline.concat(args);
	logging.info(" - running: journalctl #{cmdline.join(" ")}");
	return child_process.run('journalctl', cmdline, {stdio:'inherit'});
};


/**
 * write a line to a writable stream
 */
var writeln = function(f, s) {
	if (s) {
		logging.debug(s);
		f .. stream.write(s);
	}
	f .. stream.write('\n');
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
function UnitFile(base, filename, unit) {
	assert.string(base, 'base');
	assert.string(filename, 'filename');
	this.base = base;
	this.name = filename;
	this.sections = {};
	this.desiredLinks = [];

	if (unit) {
		assert.ok(UnitProto.isPrototypeOf(unit));
		unit.sections .. ownPropertyPairs() .. each {|[name, conf]|
			this.addSection(name, conf);
		}
	}
}

UnitFile.prototype.addSection = function(name, conf) {
	var section;
	if (this.sections .. hasOwn(name)) {
		section = this.sections[name];
	} else {
		section = this.sections[name] = [];
	}

	if (!isArrayLike(conf)) {
		// convert obj to list of pairs
		conf = conf .. ownPropertyPairs();
	}

	// flatten arrays into lists of params, for consistency
	conf .. each {|[key,val]|

		// special-cased conversions:
		if (key .. string.startsWith('Exec') && val .. isArrayLike()) {
			val = shell_quote.quote(val);
		} else if (key === 'Environment' && !val .. string.isString()) {
			if (!val .. isArrayLike()) {
				val = val .. ownPropertyPairs;
			}
			// now turn pairs into env strings
			val = val .. map([k,v] -> "#{k}=#{v}") .. map(s -> shell_quote.quote([s]));
		}

		var vals = (val .. isArrayLike()) ? val : [val];
		vals .. each {|val|
			assert.string(val, `value for ${key} is ${typeof(val)}: ${val}`);
			section.push([key, val]);
		}
	}
}

UnitFile.prototype.write = function() {
	ensureDir(this.base);
	fs.withWriteStream(this.path(), this._write.bind(this));
}

UnitFile.prototype.toString = -> "<UnitFile(#{this.name})>";

var fst = pair -> pair[0];

UnitFile.prototype._write = function(f) {
	this.sections .. ownPropertyPairs .. each {|[name, params]|
		f .. writeln("[#{name}]");
		params .. seq.sort(array.cmp) .. each {|[key,val]|
			f .. writeln(key + '=' + val);
		}
		f .. writeln();
	}
};

UnitFile.prototype.path = -> path.join(this.base, this.name);
exports._UnitFile = UnitFile;

var loadGroup = function(configPath) {
	var config = conductance.loadConfig(configPath);
	var group = config.systemd;
	if (!group) {
		fail("No systemd config for #{configPath}");
	}
	
	// allow lazy definitions
	if (group instanceof(Function)) group = group();

	if (!GroupProto.isPrototypeOf(group)) {
		throw new Error("exports.systemd should be (or return) a systemd.Group");
	}
	return group;
};

var defaultConfig = function() {
	var config = conductance.defaultConfig();
	return config;
};

var install = function(opts) {
	var base = opts.dest;
	var mkUnitFile = (name, unit) -> new UnitFile(opts.dest, name, unit);
	ensureDir(opts.dest);

	var configFiles = opts._args;
	if (configFiles.length == 0) {
		configFiles = [defaultConfig()];
	}

	var namespaces = {};

	configFiles .. each {|configPath|
		var group = loadGroup(configPath);

		var namespace = group.name;
		if (namespaces .. hasOwn(namespace)) {
			fail("Duplicate systemd group detected (#{namespace}) - no files written");
		}

		var targetFile = mkUnitFile(group.unitFilename, group.unit);

		var unitFiles = group.components .. ownPropertyPairs .. map (function([name, units]) {
			var fqn = "#{namespace}-#{name}";
			return units .. map(unit -> mkUnitFile("#{fqn}.#{unit.type}", unit));
		}) .. concat .. toArray;

		unitFiles.push(mkUnitFile(group.unitFilename, group.unit));
		namespaces[namespace] = unitFiles;
	};


	opts.groups = namespaces .. ownKeys .. toArray;

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
		{
			name: 'files-only',
			type: 'bool',
			help: "Create / update systemd files but don't notify systemd of changes",
		},
	];

	var allOpt = [
		{
			name: 'all',
			type: 'bool',
			help: 'Act on all units, not just .target units'
		},
	];

	var groupOptions = [
		{
			names: ['config','c'],
			type: 'arrayOfString',
			help: "Act on groups defined in FILE (defaults to \"#{conductance.defaultConfig()}\")",
			'default': [],
			'helpvar':'FILE',
		},
		{
			names: ['group','g'],
			type: 'arrayOfString',
			help: "Specify group name to act on",
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
			options = options.concat(allOpt);
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.restart(ctl.controlUnits());
			};
			break;

		case "stop":
			options = options.concat(allOpt);
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.stop(ctl.controlUnits());
			};
			break;

		case "start":
			options = options.concat(allOpt);
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.start(ctl.controlUnits());
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
			var usage = "Commands:
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

  Actions that act on groups accept `--config` or `--group` multiple times.

Global options:\n#{dashdash.createParser({ options: commonOptions }).help({indent:2})}

Pass `--help` after a valid command to show command-specific help.";

			if (command == "--help" || command == "-h") {
				logging.print(usage);
				process.exit(0);
			} else {
				var msg = command ? "Unknown command: #{command}" : "No command given";
				fail("#{msg}\n\n#{usage}");
			}
			break;
	}
	var opts = parseArgs(command, options, args);

	if (opts.group) {
		if (opts.group.length > 0 && opts.config.length > 0) {
			throw new Error("Use either --group or --config, not both.");
		}

		if (opts.group.length === 0 && opts.config.length === 0) {
			opts.config = [defaultConfig()];
		}

		if (opts.config.length > 0) {
			opts.groups = opts.config .. map(conf -> loadGroup(conf).name);
		} else {
			opts.groups = opts.group;
		}
		delete opts.group;
		delete opts.config;
		logging.info("Groups: #{opts.groups .. join(", ")}");
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
