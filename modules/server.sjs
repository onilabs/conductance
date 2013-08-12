var cutil = require('sjs:cutil');
var http = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys, merge } = require('sjs:object');
var { writeErrorResponse } = require('./server/response');
var logging = require('sjs:logging');

exports.run = function(config, block) {
  var ports = config.ports;
  var portsPending = ports.length;

  var shutdown = cutil.Condition();
  var ready = cutil.Condition();

  function runPort(port_desc) {
    // detangle config:
    var port_config =
      { address:  '0',
        capacity: 100,
        max_connections: 1000,
        ssl: false,
        key: undefined,
        cert: undefined,
        ca: undefined,
        passphrase: undefined,
        fd: undefined,
      } ..
      override(port_desc);

    // collect all hosts connected to our port:
    var hosts = config.hosts ..
      filter({ports} -> !ports || ports.indexOf(port_desc.name) != -1) ..
      toArray;
    
    // run a http(s) server on the port:
    http.withServer(port_config) {
      |server|
      if (--portsPending == 0) {
        ready.set();
      }
      waitfor {
        shutdown.wait();
      } or {
        server.eachRequest {
          |req|
          console.log("#{req.request.method} #{req.url}");

          // set standard headers:
          req.response.setHeader("Server", "Conductance"); // XXX version

          // find host to dispatch to:
          if (!req.request.headers.host) {
            // we require a host header
            req .. writeErrorResponse(400, "Missing 'host' header");
            continue;
          }
          var host = hosts .. find({hostname} -> hostname.test(req.request.headers.host));
          if (!host) {
            req .. writeErrorResponse(400, "Unknown host #{req.request.headers.host}");
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
  }

  //----------------------------------------------------------------------
  // main program:


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

  waitfor {
    cutil.waitforAll(runPort, ports);
  } and {
    if (block) {
      try {
        ready.wait();
        block();
      } finally {
        shutdown.set();
      }
    }
  }
  logging.print("\nOni Conductance finished");
};
