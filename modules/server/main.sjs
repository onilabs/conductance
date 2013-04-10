var { canonicalizeURL } = require('sjs:http');
var { withServer } = require('sjs:nodejs/http');
var { each, map, filter, parallelize, find, toArray } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override } = require('sjs:object');
var { stat } = require('sjs:nodejs/fs');

require.hubs.push(['mho:', canonicalizeURL('../', module.id)]);
require.hubs.push(['\u2127:', 'mho:']); // mho sign '℧'

var env = require('./env');
env.init({
  conductanceRoot    : canonicalizeURL('../../', module.id).substr(7),
  conductanceVersion : "1-#{
                             (new Date(
                                stat(canonicalizeURL('../../apollo/oni-apollo-node.js', 
                                     module.id).substr(7)).mtime)).getTime()
                           }",
});

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

//----------------------------------------------------------------------
// parse parameters

console.log(banner);

var configfile = "#{env.conductanceRoot()}default_config.mho";

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
        req.response.writeHead(400, 'Unknown host');
        continue;
      }

      // we've got a host; find the route now:
      var matches;
      var route = host.routes .. flatten .. find({path} -> !!(matches = req.url.path.match(path)));
      if (!route) {
        req.response.writeHead(400, 'Path not found');
        continue;
      }
      
      // we've got the route; execute handler:
      try {
        route.handler(matches, req);
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

