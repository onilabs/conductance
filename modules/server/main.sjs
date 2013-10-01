require('../../hub'); // install mho: hub
var sys = require('sjs:sys');
var str = require('sjs:string');
var nodePath = require('nodejs:path');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten, remove } = require('sjs:array');
var { override, propertyPairs, keys, merge } = require('sjs:object');
var { seq } = require('sjs:function');
var fs = require('sjs:nodejs/fs');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');
var _config = require('./_config');
var env = require('./env');

var banner = "

              O N I   C O N D U C T A N C E
                                             
             | \\____/ |          ___     ___
            |          |        |_  |   |  _|
           |  ( )  ( )  |         | |   | |
          /|            |\\       / /    \\  \\
         |/|            |\\|      | |     | |
            |          |         \\ \\_____/ /
            (___----___)          \\_______/
                                             
             http://onilabs.com/conductance

";

var printBanner = -> console.log(banner);

exports.run = function(args) {
  args = args || sys.argv();
  var actions = [
    {
      name: 'serve',
      args: '[<file>]',
      desc: 'Run the conductance server
       -r, --autorestart - Restart the server whenever any
                           file changes (using `nodemon`)\n',
      fn: exports.serve,
    },
    {
      name: 'exec',
      args: '<file>',
      desc: 'Execute a SJS script (equivalent to `conductance <file>`)',
      fn: exports.exec,
    },
    {
      name: 'shell',
      desc: 'Run an interactive shell',
      fn: function() {
        printBanner();
        global.__oni_altns = Object.create(require('mho:stdlib'));
        require('sjs:nodejs/repl', {main:true});
      }
    },
    {
      name: 'version',
      desc: 'Print version information',
      fn: exports.printVersion,
    },
    {
      name: 'systemd',
      args: '<command> ...',
      desc: 'Conductance systemd integration',
      fn: function(args) {
        require('./systemd').run(args);
      }
    },
  ];

  var selfUpdate = require('./self-update');
  if (selfUpdate.available) {
    actions.push({
      name: 'update-check',
      desc: 'Check for available updates',
      fn: selfUpdate.check
    });
    actions.push({
      name: 'self-update',
      desc: 'Update to the latest conductance',
      fn: selfUpdate.update
    });
  }

  var usage = function() {
    console.log("Usage: conductance [-v|--verbose] [<file>|<action>] ...");
    console.log();
    actions .. each {|a|
      var args = a.args ? a.args : "";
      console.log("#{a.name .. str.padLeft(10)} #{args .. str.padRight(13)} : #{a.desc}");
    }
    console.log("\nRun `conductance <action> --help` for more specific help.\n");
    return process.exit(1);
  }

  var command;
  var verbosity = 0;
  while (command = args.shift()) {
    if(command == '-h' || command == '--help') {
      printBanner();
      return usage();
    } else if (command == '--verbose') {
      verbosity++;
    } else if (/^-v+$/.test(command)) {
      verbosity += arg.length - 1;
    } else {
      // stop at first non-option arg
      break;
    }
  }

  switch(verbosity) {
    case 0  : logging.setLevel(logging.WARN);    break;
    case 1  : logging.setLevel(logging.INFO);    break;
    case 2  : logging.setLevel(logging.VERBOSE); break;
    default : logging.setLevel(logging.DEBUG);   break;
  }

  logging.info("Log level: #{logging.levelNames[logging.getLevel()]}");

  var action = actions .. find(a -> a.name == command);

  // shortcut (required for shebang lines):
  // if run as: `conductance <filename> [...]`,
  // assume:    `conductance exec <filename> [...]`
  if (!action && command && fs.exists(command)) {
    return exports.run(['exec', command].concat(args));
  }

  if (!action) {
    printBanner();
    if (command) {
      console.error("Unknown command: " + command + "\n");
    }
    return usage();
  }
  action.fn(args);
};

exports.exec = function(args) {
  var url = args.shift();
  if (url.indexOf(":") == -1) {
    url = "file://" + fs.realpath(url);
  }
  process.argv = [ env.executable, url ].concat(args);
  require(url, {main:true});
}

exports.serve = function(args) {
  var configfile = _config.defaultConfig();

  //----------------------------------------------------------------------
  // --autorestart:
  
  var arg = args[0];
  if(arg === '-r' || arg === '--autorestart') {
    process.argv .. remove(arg);
    // nodemon has no API - it just takes over as soon as it's imported.
    // we need to modify the original ARGV:
    // [ '/path/to/node',
    //   '/path/to/conductance',
    //   'serve', ...]
    //
    // To look like a valid nodemon invocation:
    //
    // [ '/path/to/node',
    //   '/path/to/nodemon',
    //   '--exec',
    //   '/path/to/conductance',
    //   'serve', ...]
    //
    process.argv.splice(1, 1, require.resolve('nodejs:nodemon').path, '--exec', process.argv[1]);
    // console.log(process.argv);
    require('nodejs:nodemon');
    return;
  }

  //----------------------------------------------------------------------
  // main program:

  printBanner();

  if (args.length > 0 && args[0].charAt(0) != '-') {
    configfile = args.shift();
  }

  var config = _config.loadConfig(configfile);
  if (!config.serve) {
    throw new Error("config file #{configfile} has no `serve` function");
  }
  process.argv = process.ARGV = [env.executable, 'serve', configfile].concat(args);

  try {
    config.serve(args);
  } catch(e) {
    process.stdout.write("\nOni Conductance exiting with fatal error:\n#{e.toString()}\n\n");
    process.exit(1);
  }
}

exports.printVersion = function() {
  console.log("
  NodeJS version:      #{process.versions['node']}
  NodeJS path:         #{process.execPath}

  SJS version:         #{sys.version}
  SJS path:            #{nodePath.normalize(sys.executable, '..')}

  Conductance version: #{env.conductanceVersion()}
  Conductance path:    #{env.executable}
");
}

if (require.main === module) {
  exports.run();
}
