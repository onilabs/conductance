var url = require('sjs:url');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys } = require('sjs:object');
var { stat } = require('sjs:nodejs/fs');
var { writeErrorResponse } = require('./response');
var dashdash = require('sjs:dashdash');
var logging = require('sjs:logging');

require.hubs.push(['mho:', url.normalize('../', module.id)]);
require.hubs.push(['\u2127:', 'mho:']); // mho sign '℧'

//----------------------------------------------------------------------
// helpers

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

function usage(msg) {
  console.log("
Usage: conductance [options] [configfile]

#{parser.help()}
    Default configfile: #{configfile}
");
  if(msg) console.log(msg);
}

var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();

//----------------------------------------------------------------------
// parse parameters

console.log(banner);

var configfile = "#{conductanceRoot}default_config.mho";

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
  var opts = parser.parse(process.argv);
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
  if (opts._args.length > 0) {
    usage("Too many arguments");
    process.exit(1);
  }
}

//----------------------------------------------------------------------
// init environment

configfile = url.normalize(configfile, process.cwd() + '/');

var env = require('./env');
env.init({
  conductanceRoot    : conductanceRoot,
  configRoot         : url.normalize('./', configfile),
  conductanceVersion : "1-#{
                             (new Date(
                                stat(url.normalize('../../stratifiedjs/stratified-node.js', 
                                     module.id).substr(7)).mtime)).getTime()
                           }",
});


//----------------------------------------------------------------------
// load config file

console.log("Loading config from #{configfile}");
var config = require(configfile);

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
      passphrase: undefined
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
  config.ports .. each.par(100, runPort);
  process.stdout.write("
Oni Conductance finished
");
//  process.exit(0);
}
catch(e) {  
  process.stdout.write("
Oni Conductance exiting with fatal error:
#{e.toString()}

"); 
  process.exit(1);
}

