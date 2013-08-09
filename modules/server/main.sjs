require('../../hub'); // install mho: hub
var sys = require('sjs:sys');
var str = require('sjs:string');
var nodePath = require('nodejs:path');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys, merge } = require('sjs:object');
var { writeErrorResponse } = require('./response');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');
var _config = require('./_config');

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

exports.run = function(args) {
  args = args || sys.argv();
  var command = args.shift();
  var actions = [
    {
      name: 'run',
      desc: 'Run the conductance server',
      fn: exports.serve,
    },
    {
      name: 'version',
      desc: 'Print version information',
      fn: exports.printVersion,
    },
    {
      name: 'systemd',
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

  var action = actions .. find(a -> a.name == command);
  console.log(banner);

  if (!action) {
    if (command) {
      console.error("Unknown command: " + command + "\n");
    }
    console.log("Usage: conductance <action> ...\n");
    actions .. each {|a|
      console.log("#{a.name .. str.padLeft(15)}: #{a.desc}");
    }
    console.log("\nRun `conductance <action> --help` for command-specific help.\n");
    return process.exit(1);
  }
  action.fn(args);
};

exports.serve = function(args) {
  var configfile = _config.defaultConfig();

  //----------------------------------------------------------------------
  // helpers


  function usage(msg) {
    console.log("
  Usage: conductance run [options] [configfile]

#{parser.help()}
    Default configfile: #{configfile}
  ");
    if(msg) console.log(msg);
  }


  //----------------------------------------------------------------------
  // parse parameters

  var parser = dashdash.createParser({options: [
    {
      names: ['help', 'h'],
      type: 'bool',
      help: 'Print this help and exit.',
    },
    {
      names: ['verbose', 'v'],
      type: 'arrayOfBool',
      help: 'Increase log level. Can be used multiple times.'
    },
  ]});

  try {
    var opts = parser.parse(args);
  } catch(e) {
    usage(e.message || String(e));
    process.exit(1);
  }
  if (opts.help) {
    usage();
    process.exit(0);
  }

  switch(opts.verbose && opts.verbose.length) {
    case undefined :
    case 0         : logging.setLevel(logging.WARN);    break;
    case 1         : logging.setLevel(logging.INFO);    break;
    case 2         : logging.setLevel(logging.VERBOSE); break;
    default        : logging.setLevel(logging.DEBUG);   break;
  }
  logging.info("Log level: #{logging.levelNames[logging.getLevel()]}");
  if (opts._args.length > 0) {
    configfile = opts._args.shift();
  }

  //----------------------------------------------------------------------
  // main program:

  var config = _config.loadConfig(configfile);
  var main = config.run || (function() {
    logging.warn("declarative .mho files (no `run` function) are deprecated");
    require('../server').serve(config);
  });

  try {
    main.apply(config, opts._args);
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
  SJS path:            #{path.normalize(sys.executable, '..')}

  Conductance version: #{env.conductanceVersion}
  Conductance path:    #{env.conductanceRoot}
");
}


if (require.main === module) {
  exports.run();
}
