var url = require('sjs:url');
var nodePath = require('nodejs:path');
var fs = require('sjs:nodejs/fs');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys, merge } = require('sjs:object');
var { stat } = require('sjs:nodejs/fs');
var { writeErrorResponse } = require('./response');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');

require('../../hub'); // install mho: hub

var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();
var conductanceVersion = "1-#{
                              (new Date(
                                  stat(require.resolve('sjs:../stratified-node.js').path .. url.toPath(7)).mtime
                              )).getTime()
                            }";

exports.loadConfig = function(path) {
  var configfile = path || exports.defaultConfig();
  configfile = url.normalize(configfile, process.cwd() + '/');

  var env = require('./env');
  env.init({
    conductanceRoot    : conductanceRoot,
    configPath         : configfile,
    configRoot         : url.normalize('./', configfile),
    conductanceVersion : conductanceVersion,
  });


  //----------------------------------------------------------------------
  // load config file

  console.log("Loading config from #{configfile}");
  var config = require(configfile);
  env.update('config', config);
  return config;
}

exports.defaultConfig = function() {
  var builtin = "#{conductanceRoot}default_config.mho";
  var local = nodePath.join(process.cwd(), 'config.mho');
  return (fs.exists(local)) ? local : builtin;
}


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

exports.run = function() {
  var configfile = exports.defaultConfig();

  //----------------------------------------------------------------------
  // helpers


  function usage(msg) {
    console.log("
  Usage: conductance [options] [configfile]

  #{parser.help()}
      Default configfile: #{configfile}
  ");
    if(msg) console.log(msg);
  }


  //----------------------------------------------------------------------
  // parse parameters

  console.log(banner);

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
    {
      name: 'version',
      type: 'bool',
      help: 'Print version information'
    },
  ]});

  try {
    var opts = parser.parse();
  } catch(e) {
    usage(e.message || String(e));
    process.exit(1);
  }
  if (opts.help) {
    usage();
    process.exit(0);
  }

  if (opts.version) {
    var sys = require('sjs:sys');
    console.log("
Conductance version #{conductanceVersion} (#{conductanceRoot})
SJS version #{sys.version} (#{nodePath.normalize(sys.executable, '..')})
");
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
    if (opts._args.length > 0) {
      usage("Too many arguments");
      process.exit(1);
    }
  }

  var config = exports.loadConfig(configfile);

  //----------------------------------------------------------------------
  // http(s) server(s)

  function runPort(port_desc) {
    // detangle config:
    var port_config = 
      { address:  '0',
        capacity: 100,
        max_connections: 1000,
        ssl: false,
        key: undefined,
        cert: undefined,
        passphrase: undefined,
        fd: undefined,
      } ..
      override(port_desc);

    // collect all hosts connected to our port:
    var hosts = config.hosts .. 
      filter({ports} -> !ports || ports.indexOf(port_desc.name) != -1) ..
      toArray;
    
    // run a http(s) server on the port:
    withServer(port_config) {
      |server| 
      server.eachRequest { 
        |req| 
        console.log("#{req.request.method} #{req.url}");

        // set standard headers:
        req.response.setHeader("Server", "Conductance"); // XXX version

        // find host to dispatch to:
        var host = hosts .. find({hostname} -> hostname.test(req.url.host));
        if (!host) {
          req .. writeErrorResponse(400, 'Unknown host');
          continue;
        }

        // we've got a host; find the route now:
        var matches;
        var route = host.routes .. flatten .. find({path} -> !!(matches = req.url.path.match(path)));
        if (!route) {
          req .. writeErrorResponse(400, 'Path not found');
          continue;
        }
        
        // we've got the route

        // check if there's a handler function for the given method:
        handler_func = route.handler[req.request.method];
        if (!handler_func) {
          // try the generic "*" handler
          handler_func = route.handler['*'];
        }
        if (!handler_func) {
          req.response.setHeader('Allow', keys(route.handler) .. join(', '));
          req .. writeErrorResponse(405, 'Method not allowed');
          continue;
        }

        // set headers; 
        if (route.headers) {
          route.headers .. propertyPairs .. each { 
            |nv|
            req.response.setHeader(nv[0], nv[1]);
          }
        }

        // execute handler function:
        try {
          handler_func(matches, req);
        }
        catch(e) {
          console.log("Error handling request: #{e}");
        }
      }
    }
  }

  //----------------------------------------------------------------------
  // main program:

  try {
    var ports = config.ports;

    if (process.env['LISTEN_PID'] === String(process.pid)) {
      // use socket activation
      var fdCount = parseInt(process.env.LISTEN_FDS, 10);
      if (fdCount != ports.length) {
        throw new Error("Configuration specifies #{ports.length} ports, but we were passed #{fdCount} $LISTEN_FDS");
      }
      logging.verbose("Adopting #{fdCount} $LISTEN_FDS");
      var nextFD=3;
      ports = ports .. map(function(p) {
        return merge(p, {fd: nextFD++});
      });
    }

    ports .. each.par(100, runPort);
    process.stdout.write("\nOni Conductance finished\n");
  //  process.exit(0);
  }
  catch(e) {
    process.stdout.write("\nOni Conductance exiting with fatal error:\n#{e.toString()}\n\n");
    process.exit(1);
  }
}

if (require.main === module) {
  exports.run();
}
