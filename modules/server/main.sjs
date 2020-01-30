/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
  @nodoc
*/

require('../../hub'); // install mho: hub
var sys = require('sjs:sys');
var Url = require('sjs:url');
var str = require('sjs:string');
var { each, find } = require('sjs:sequence');
var fs = require('sjs:nodejs/fs');
var logging = require('sjs:logging');
var _config = require('./_config');
var env = require('../env');


__js var banner = "

              O N I   C O N D U C T A N C E
                                             
             | \\____/ |          ___     ___
            |          |        |_  |   |  _|
           |  ( )  ( )  |         | |   | |
          /|            |\\       / /    \\  \\
         |/|            |\\|      | |     | |
            |          |         \\ \\_____/ /
            (___----___)          \\_______/
                                             
                  http://conductance.io

";

__js function printBanner() {
  if (process.stderr.isTTY) {
    console.warn(banner);
  }
}


var processGlobalOptions = exports.processGlobalOptions = function(args) {
  var command;
  var verbosity = 0;
  while (command = args.shift()) {
    // canonicalize --verbose / --quiet args
    if (command === '--quiet') command='-q';
    else if (command == '--verbose') command='-v';

    if(command == '-h' || command == '--help') {
      printBanner();
      return usage(0);
    } else if (/^-v+$/.test(command)) {
      verbosity += command.length - 1;
    } else if (/^-q+$/.test(command)) {
      verbosity -= command.length - 1;
    } else {
      // stop at first non-option arg
      break;
    }
  }

  var action = actions .. find(a -> a.name == command, undefined);
  verbosity += (action ? action.defaultVerbosity) || 0;

  switch(verbosity) {
    case -1 : logging.setLevel(logging.WARN);    break;
    case 0  : logging.setLevel(logging.INFO);    break;
    case 1  : logging.setLevel(logging.VERBOSE); break;
    default : logging.setLevel(verbosity < 0 ? logging.ERROR : logging.DEBUG);   break;
  }

  logging.verbose("Log level: #{logging.levelNames[logging.getLevel()]}");
  return [action, command]
}


exports.run = function(args) {
  args = args || sys.argv();

  var [ action, command ] = processGlobalOptions(args);

  // shortcut (required for shebang lines):
  // if run as: `conductance <filename> [...]`,
  // assume:    `conductance exec <filename> [...]`
  if (!action && command && fs.exists(command)) {
    return exports.run(['exec', command].concat(args));
  }

  if (!action) {
    printBanner();
    if (command) {
      logging.error("Unknown command: " + command + "\n");
    }
    return usage();
  }

  action.fn(args);
};

exports.exec = function(args) {
  var url = args.shift() .. Url.coerceToURL();
  process.argv = [ env.executable, url ].concat(args);
  require(url, {main:true});
}

exports.localSeedServer = function(args) {
  printBanner();
  require('./seed/local').serve(args);
}

exports.serve = function(args) {
  var configfile = _config.defaultConfig();

  //----------------------------------------------------------------------
  // --autorestart:
  
  var arg = args[0];
  printBanner();

  if(arg === '-r' || arg === '--autorestart') {
    args.shift(); // remove -r // --autorestart
    var nodemon = require('nodejs:nodemon');

    // TODO: pluck nodemon-compatible args from the front of `args`
    // to customise `opts`
    var opts = {
      ext: 'api sjs mho gen js',
      ignore: 'frontend/',
      exec: 'exec "'+process.execPath.replace(/\"/g, '\\"')+'"',
      args: [env.executable, 'serve'].concat(args),
      legacyWatch: true
    };
    logging.debug("nodemon options:", opts);

    __js {
      nodemon(opts)
        .on('log', function(log) {
          var output = log.colour;
          //console.log(log);
          
          // skip `starting <exec>`
          if (log.type === 'status' && log.message .. str.startsWith('starting ')) {
            //output = output.replace(/starting.*`/, 'starting conductance ...');
            return;
          }
          
          // skip version message
          if (log.type === 'info' && /^v\d+(\.\d+)+$/.test(log.message)) return;
          
          // skip "watching: *.*
          if (log.type === 'info' && log.message .. str.startsWith('watching: ')) return;
          
          console.warn(output);
        })
      ;
    }
    // never return
    hold();
  }

  //----------------------------------------------------------------------
  // main program:

  if (args.length > 0 && args[0].charAt(0) != '-') {
    configfile = args.shift();
  }

  var config = _config.loadConfig(configfile);
  if (!config.serve) {
    throw new Error("config file #{configfile} has no `serve` function");
  }

  try {
    config.serve(args);
  } catch(e) {
    console.error("\nOni Conductance exiting with fatal error:\n#{e.toString()}\n");
    process.exit(1);
  }
}

exports.printVersion = function() {
  console.log("
  NodeJS version:      #{process.versions['node']}
  NodeJS path:         #{process.execPath}

  SJS version:         #{sys.version}
  SJS path:            #{require('nodejs:path').normalize(sys.executable, '..')}

  Conductance version: #{env.conductanceVersion()}
  Conductance path:    #{env.executable}
");
}

var actions = [
  {
    name: 'serve',
    args: '[<file>]',
    desc: 'Run the conductance server
      -r, --autorestart - Restart the server whenever any
                          file changes (using `nodemon`)\n',
    fn: exports.serve,
    defaultVerbosity: -1, // WARN
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
      global.__oni_altns = require('mho:std');
      require('sjs:nodejs/repl', {main:true});
    }
  },
  {
    name: 'seed',
    desc: 'Run a local seed server',
    fn: exports.localSeedServer,
    defaultVerbosity: -1, // WARN
  },
  {
    name: 'bundle',
    desc: 'Create a module bundle',
    fn: function(args) {
      require('sjs:bundle').main(args);
    }
  },
  {
    name: 'version',
    desc: 'Print version information',
    fn: exports.printVersion,
  },
  {
    name: 'init',
    args: '<template>',
    desc: 'Initialize a new Conductance project in the current directory',
    fn: function(args) {
      if (args.length !== 1) {
        console.log("Run this command in a new directory and specify a <template> argument:");
        console.log("  mkdir myapp");
        console.log("  cd myapp");
        console.log("  conductance init <template>");
        console.log("Available templates:");
        console.log(require('./project-template').getTemplateDescriptions());
      }
      else
        require('./project-template').initProject(args[0]);
    }
  },
  { name: 'doc',
    desc: 'Run the conductance/sjs documentation browser app',
    fn: function(args) {
      process.chdir("#{env.conductanceRoot}doc");
      exports.serve(args);
    },
    defaultVerbosity: -1, // WARN
  }
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


function usage(exitcode) {
  console.warn("Usage: conductance [-v|--verbose|-q|--quiet] [<file>|<action>] ...");
  console.warn();
  actions .. each {|a|
    var args = a.args ? a.args : "";
    console.warn("#{a.name .. str.padLeft(12)} #{args .. str.padRight(13)} : #{a.desc}");
  }
  console.warn("\nRun `conductance <action> --help` for more specific help.\n");
  return process.exit(exitcode === undefined ? 1 : exitcode);
}

if (require.main === module) {
  exports.run();
}
