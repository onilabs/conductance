var { canonicalizeURL } = require('sjs:http');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, parallelize, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys } = require('sjs:object');
var { stat } = require('sjs:nodejs/fs');
var { writeErrorResponse } = require('./response');

require.hubs.push(['mho:', canonicalizeURL('../', module.id)]);
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

function usage() {
  console.log("
Usage: conductance [options] [configfile]

Options:
  -h, --help           Display this help message and exit

Default configfile: #{configfile}
");
}

var conductanceRoot = canonicalizeURL('../../', module.id).substr(7);

//----------------------------------------------------------------------
// parse parameters

console.log(banner);

var configfile = "#{conductanceRoot}default_config.mho";

for (var i=1; i<process.argv.length; ++i) {
  var flag = process.argv[i]; 
  switch (flag) {
  case '-h':
  case '--help':
    usage();
    process.exit(0);
  default:
    configfile = flag;
  }
}

//----------------------------------------------------------------------
// init environment

var env = require('./env');
env.init({
  conductanceRoot    : conductanceRoot,
  configRoot         : canonicalizeURL('./', configfile),
  conductanceVersion : "1-#{
                             (new Date(
                                stat(canonicalizeURL('../../apollo/oni-apollo-node.js', 
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
  config.ports .. parallelize(100) .. each(runPort);
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

