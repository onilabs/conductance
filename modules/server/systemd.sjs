#!/usr/bin/env sjs
// vim: syntax=sjs:
require('../../hub');
var fs = require('sjs:nodejs/fs');
var child_process = require('sjs:nodejs/child-process');
var path = require('nodejs:path');
var seq  = require('sjs:sequence');
var { each, map, toArray, filter } = seq;
var string = require('sjs:string');
var array = require('sjs:array');
var { isArrayLike } = array;
var object = require('sjs:object');
var { ownKeys, ownPropertyPairs } = object;
var shell_quote = require('sjs:shell-quote');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
//logging.setLevel(logging.DEBUG); // NOCOMMIT
var Url = require('sjs:url');

var conductance = require('mho:server/main');
var env = require('mho:server/env');

var fail = function(msg) {
	throw new Error(msg);
}

var CONDUCTANCE_FLAG = 'X-Conductance-Generated';

var parseArgs = function(command, options, args) {
	var parser = dashdash.createParser({ options: options });
	var opts = parser.parse(args);
	if (opts.help) {
		logging.error("Usage: gen-systemd #{command} [OPTIONS]\nOPTIONS:\n#{parser.help()}");
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
	this.mainTarget = "#{opts.namespace}.target";
};

SystemCtl.prototype._run = function(args) {
	var _args = [];
	// TODO: add --user option if opts.user
	args = _args.concat(args);
	logging.info(" - running: systemctl #{args.join(" ")}");
	return child_process.run('systemctl', args, {stdio:'inherit'});
};

SystemCtl.prototype.reloadConfig = ()      -> this._run(['daemon-reload']);
SystemCtl.prototype.reinstall    = (units) -> this._run(['reenable'].concat(units));
SystemCtl.prototype.uninstall    = (units) -> this._run(['disable'].concat(units));
SystemCtl.prototype.start        = (units) -> this._run(['start'].concat(units));
SystemCtl.prototype.stop         = (units) -> this._run(['stop'].concat(units));
SystemCtl.prototype.status       = (units) -> this._run(['status'].concat(units));

// TODO: there should be a more specific call we can make here:
SystemCtl.prototype.stopUnwanted = -> this._run(['reset-failed']);

SystemCtl.prototype.restart = function(units) {
	this._run(['restart'].concat(units));
	// restart only has an effect if units are running, so we start them just in case
	this.start(units);
}

SystemCtl.prototype.log = function(units, args) {
	var cmdline = units .. map(u -> ['--unit', u]) .. concat .. toArray;
	cmdline = cmdline.concat(args);
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
 * under the given namespace.
 */
var installedUnits = function(opts, exclude) {
	var base = opts.dest;
	var namespace = opts.namespace;
	exclude = (exclude || []) .. map(u -> u.name);

	var unit_files = fs.readdir(base);
	logging.debug("unit files:", unit_files);
	var conductanceFlagRe = new RegExp("^#{CONDUCTANCE_FLAG} *= *true", "m")
	var is_conductance = function(target) {
		if(target .. string.startsWith("#{namespace}-") || target == "#{namespace}.target") {
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
	logging.debug("old unit files:", old_units);
	if (old_units.length > 0) {
		logging.print(
			["Uninstalling #{old_units.length} #{opts.namespace} units from #{opts.dest}:"]
			.concat(old_units .. map(u -> u.name)).join("\n - "));
		confirm(opts);
		if (opts.live) {
			var unitNames = old_units .. map(u -> u.name);
			var ctl = new SystemCtl(opts);
			try {
				ctl.uninstall(unitNames);
				ctl.stop(unitNames);
			} catch(e) {
				if (!opts.force) throw e;
			}
		}
		old_units .. each(u -> u.remove(opts));
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
	if (!opts.live) {
		logging.warn("Unit configuration removed, but not stopped. To stop removed services, run:
conductance-systemd update");
	}
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
		if (name == 'Unit') {
			params.push([CONDUCTANCE_FLAG, 'true']);
		}
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

Unit.prototype.install = function() {
	var installSection = this.sections .. seq.find(s -> s[0] == 'Install');
	if (!installSection) {
		logging.verbose("No install section found for #{this}");
		return;
	}
	var currentLinks = this.existingLinks();
	var wantedLinks = [];
	installSection[1] .. each {|[k,val]|
		switch(k) {
			case 'WantedBy':
				wantedLinks.push("#{val}.wants/#{this.name}");
				break;
			case 'RequiredBy':
				wantedLinks.push("#{val}.requires/#{this.name}");
				break;
			case 'Alias':
				wantedLinks.push(val);
				break;
			case 'Also':
				logging.warn("Unable to proces `Also` directive without --live");
				break;
			default:
				logging.verbose("Ignoring unknown install directive: #{k}");
				break;
		}
	}
	currentLinks .. array.difference(wantedLinks) .. each {|ln|
		logging.debug("Removing #{ln}");
		fs.unlink(path.join(this.base, ln));
	}
	wantedLinks .. each {|ln|
		logging.debug("Linking #{ln}");
		var destpath = path.join(this.base, ln);
		var parentDir = path.dirname(destpath);
		var relpath = path.relative(parentDir, this.path());
		var linkName = path.basename(ln);

		ensureDir(parentDir);
		// have to do relative link from dest, otherwise nodejs throws an error
		chdir(parentDir) {||
			try {
				fs.unlink(linkName);
			} catch(e) { /* didn't exist */ }
			fs.symlink(relpath, linkName);
		}
	}
}

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

Unit.prototype.existingLinks = function() {
	var links = [];
	var entries = fs.readdir(this.base);
	entries .. each {|entry|
		var dirpath = path.join(this.base, entry);
		if (fs.lstat(dirpath).isDirectory()) {
			fs.readdir(dirpath) .. each {|link|
				var linkRel = path.join(entry, link);
				var linkPath = path.join(dirpath, link);
				if (link === this.name) links.push(linkRel);
				else {
					try {
						if (fs.realpath(linkPath) === fs.realpath(this.path())) {
							links.push(linkRel);
						}
					} catch(e) {
						logging.warn("Unable to check #{linkRel}: #{e.message}");
					}
				}
			}
		}
	}
	return links;
};

Unit.prototype.remove = function(opts) {
	var files = this.existingLinks() .. map(l => path.join(this.base, l));
	files.push(this.path());
	logging.info(["Removing:"].concat(files).join("\n - "));
	files .. each(fs.unlink);
};


var install = function(opts) {
	var base = opts.dest;
	var mkunit = (name) -> new Unit(opts.dest, name);
	ensureDir(opts.dest);

	var configFiles = opts._args;
	if (configFiles.length == 0) {
		configFiles = [conductance.defaultConfig()];
		logging.warn("Using default config: #{configFiles[0]}");
	}

	var nodeExe = process.execPath;
	var namespace = opts.namespace;
	var units = [];

	var rootService = mkunit("#{namespace}.target");
	rootService.addSection('Unit', { Description: "Oni Conductance target" });
	rootService.addSection('Install', { WantedBy: "multi-user.target" });
	units.push(rootService);

	configFiles .. each {|configPath|
		var config = conductance.loadConfig(configPath);
		if (!config.systemd) {
			fail("No systemd config for #{configPath}");
		}

		config.systemd .. ownPropertyPairs .. each {|[name, sys]|
			var fqn = "#{namespace}-#{name}"
			var serviceUnit = mkunit("#{fqn}.service");
			var service = sys.Service || {};
			var socket = sys.Socket;

			var socketUnit = socket ? mkunit("#{fqn}.socket") : null;

			// -- Service --
			var requires = [rootService.name];
			if (socketUnit) requires.push(socketUnit.name);
			serviceUnit.addSection('Unit', {
				'X-Conductance-Source': env.configPath(),
				'Requires': requires,
				'After': 'local-fs.target network.target',
			});

			var sjsExe = Url.normalize('../sjs', require.resolve('sjs:').path) .. Url.toPath();
			if(!fs.exists(sjsExe)) {
				fail("SJS executable not found at #{sjsExe}");
			}
			service = object.merge({
				// fully qualify both `node` and `sjs` executables to ensure we get the right runtime
				'ExecStart': [nodeExe, sjsExe, env.conductanceRoot() + 'modules/server/main.sjs', env.configPath()],
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
			serviceUnit.addSection('Service', service);

			// -- Service Install --
			var defaults = {};
			if (!socketUnit) {
				defaults['WantedBy'] = rootService.name;
			}
			var install = object.merge(defaults, sys.Install || {});
			serviceUnit.addSection('Install', install);
			units.push(serviceUnit);

			if (socket) {
				socketUnit.addSection('Unit', { 'Requires': rootService.name });
				socket = object.clone(socket);
				// socket.listen is intended for `ports` style objects, we move it to socket.ListenStream
				// after processing
				if (socket.Listen) {
					var ports = socket.Listen;
					delete socket.Listen;
					socket.ListenStream = ports .. map(p -> p.address ? p.address : p);
				}
				socketUnit.addSection('Socket', socket);
				socketUnit.addSection('Install', { WantedBy: rootService.name });
				units.push(socketUnit);
			}
		}
	}

	var unitNames = units .. map(u -> u.name) .. seq.sort();

	var firstDupe = firstDuplicate(unitNames);
	if (firstDupe !== null) {
		fail("Duplicate unit file detected (#{firstDupe}) - no files written");
	}

	uninstallExistingUnits(opts, units);

	logging.info(["Installing:"].concat(unitNames).join("\n - "));
	confirm(opts);
	units .. each {|unit|
		unit.write();
		if (!opts.live) {
			// we have a modest "install-like" process for non-live installs
			unit.install();
		}
	}

	if (opts.live) {
		var ctl = new SystemCtl(opts);
		ctl.reinstall(unitNames);

		logging.info("Reloading config ...");
		ctl.reloadConfig();

		logging.info("(Re)starting services ...");
		ctl.restart([rootService.name]);
	} else {
		logging.warn("Unit files installed, but nothing reloaded (--live not specified)");
	}
}

exports.main = function() {
	var commonOptions = [
			{
				name: 'dest',
				type: 'string',
				help: 'Override default systemd unit location',
			},
			{
				names: ['namespace','n'],
				type: 'string',
				help: 'Namespace (used to separate multiple conductance-powered services, default "conductance")',
				'default': 'conductance',
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
			name: 'live',
			type: 'bool',
			help: 'add / remove / restart services immediately. Requires root.'
		},
		{
			names: ['interactive', 'i'],
			type: 'bool',
			help: 'Prompt for confirmation before changing anything'
		},
	];

	var args = require("sjs:sys").argv();
	var command = args.shift();
	var options = commonOptions;
	var action;
	switch(command) {
		case "install":
			options = commonOptions.concat(commonInstallOptions);
			action = install;
			break;
		case "uninstall":
			options = commonOptions.concat(commonInstallOptions.concat([
				{
					name: 'force',
					type: 'bool',
					help: "Remove config files even if services can't be stopped",
				}
			]));
			action = uninstall;
			break;

		case "list":
			action = function(opts) {
				noargs(opts);
				installedUnits(opts) .. each(u -> console.log(u.name));
			};
			break;

		case "update":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.stopUnwanted();
				ctl.start(ctl.mainTarget);
			};
			break;

		case "restart":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.restart(ctl.mainTarget);
			};
			break;

		case "stop":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.stop(ctl.mainTarget);
			};
			break;

		case "start":
			action = function(opts) {
				noargs(opts);
				var ctl = new SystemCtl(opts);
				ctl.reloadConfig();
				ctl.start(ctl.mainTarget);
			};
			break;

		case "log":
			action = function(opts) {
				var ctl = new SystemCtl(opts);
				var units = installedUnits(opts);
				ctl.log(units, opts._args);
			};
			break;

		default:
			var msg = command ? "Unknown command: #{command}" : "No command given";
			fail("#{msg}\n
Commands:
  SYSTEM MODIFICATION:
    install:    Install units from one or more .mho config files
    uninstall:  Remove all currently installed conductance units

  SERVICE ACTIONS:
    update:     Start installed services, stop removed services
    list:       List installed conductance units
    start:      Start conductance target (noop if already running)
    stop:       Stop conductance units
    restart:    Restart conductance units

Global options:\n#{dashdash.createParser({ options: commonOptions }).help({indent:2})}

Pass `--help` after a valid command to show command-specific help.");
			break;
	}
	var opts = parseArgs(command, options, args);
	action(opts);
}

if (require.main === module) {
	try {
		exports.main();
	} catch(e) {
		logging.debug(String(e));
		if (e.message) logging.error(e.message);
		process.exit(1);
	}
}

