var cutil = require('sjs:cutil');
var http = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys, merge, clone } = require('sjs:object');
var { writeErrorResponse } = require('./server/response');
var logging = require('sjs:logging');
var {Constructor} = require('sjs:object');
var func = require('sjs:function');
var assert = require('sjs:assert');
var string = require('sjs:string');

/**
  @function run
  @summary run a conductance server
  @arg {Object|Array} [config] server configuration(s)
  @arg {optional Function} [block] Block to run the server around
  @desc
    `config` should be a single object or array of objects. Each object should have the keys:

    * address - a [::Port]
    * routes - an (optionally nested) Array of [::Responder]
      (i.e [::Route] or [::Host]) objects.

    ### Block function
    
    If `block` is not given, the server will run indefinitely (until
    a fatal error occurs such as the process being terminated).

    If `block` is given, the server will call `block()` when
    it's started listening on all ports. Once block() returns,
    the server will shut down.
    
    ### Example 1: A simple server:

        // common definitions for all examples
        var { Port, Route, run } = require('mho:server');
        function hello (req) -> req.response.end("hi!");

        // run a simple server
        run({
          address: Port(8080),
          routes: [
            Route(null, {
              GET: hello
            }),
          ]
        })

    ### Example 2: Matching paths:

        run({
          port: Port(8080),
          routes: [
            
            // matches e.g "/greet/john"
            Route( /greet\/(.*)/,
              handler: {
                GET: function(req, matches) {
                  req.response.end("Hello, #{matches[1]}");
                }
              }
            ),
            
            // matches e.g "/exit/John"
            Route( /exit\/(.*)/,
              handler: {
                GET: function(req, matches) {
                  req.response.end("Farewell, #{matches[1]}");
                }
              }
            )
          ]
        });
    
    ### Example 3: Virtual hosts:

        run({
          port: Port(8080),
          routes: [
            Host("code.example.com",
              [
                Route('/hello', {GET: helloCode}),
              ]
            ),
            Host(/^.*\.example\.com$/,
              [
                Route('/hello', {GET: helloWildcard}),
              ]
            ),

            // conductance will serve a default error page when no matching route can be
            // found, but this fallback allows us to give a custom response.
            Route(/^/, {
              GET: function(req) {
                req .. writeErrorResponse(406, 'Not Acceptable',
                              'You requested an unknown host');
              }
            }),
          ]
        });
*/
exports.run = function(config, block) {
  var apps = Array.isArray(config) ? config : [config];
  var unstartedApps = apps.length;

  var shutdown = cutil.Condition();
  var ready = cutil.Condition();

  function runApp(app) {
    var port_config = app.address.getConfig();
    logging.debug("server config: ", port_config);

    // run a http(s) server on the port:
    http.withServer(port_config) {
      |server|
      if (--unstartedApps == 0) {
        ready.set();
      }
      waitfor {
        shutdown.wait();
      } or {
        server.eachRequest {
          |req|
          logging.info("#{req.request.method} #{req.url}");

          // set standard headers:
          req.response.setHeader("Server", "Conductance"); // XXX version

          // execute handler function:
          try {
            var matchResult;
            var [route, matchResult] = findMatchingRoute(app.routes, req);
            if (!route) continue;
            route.handle(req, matchResult);
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
    if (fdCount != apps.length) {
      throw new Error("Configuration specifies #{ports.length} ports, but we were passed #{fdCount} $LISTEN_FDS");
    }
    logging.verbose("Adopting #{fdCount} $LISTEN_FDS");
    var nextFD=3;
    apps .. each {|app|
      app.address.config = merge(app.address.config, {fd: nextFD++});
    }
  }

  waitfor {
    cutil.waitforAll(runApp, apps);
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


/** helper, used by main server, Host and Route to handle sub-routes */
function findMatchingRoute(routes, req, path) {
  // path can be given to override the url's path (for sub-routes)
  var host;
  var matchResult;
  var route = routes .. find(function(route) {
    if (route.matchesHost) {
      if (host === undefined) {
        host = req.request.headers.host || null;
        if (host) {
          var i = host.indexOf(':');
          if (i !== -1) host = host.slice(0, i);
        }
      }
      return !!(matchResult = route.matchesHost(host));
    } else if (route.matchesPath) {
      if (path === undefined) {
        path = req.url.path.slice(1); // remove leading "/"
      }
      return !!(matchResult = route.matchesPath(path));
    } else {
      return !!(matchResult = route.matches(req));
    }
  });
  if (!route) {
    req .. writeErrorResponse(400, 'No handler found');
  }
  return [route, matchResult];
};



/**
  @class Responder
  @summary Internal interface shared by both [::Route] and [::Host]
*/
var Responder = {
  _init: function() {
    this.filters = [];
  },
  addFilter: function(f) {
    // filters are stored outermost-first
    this.filters.unshift(f);
  },
  handle: function(req) {
    var args = arguments;
    var self = this;
    // each concrete class defines _handle
    var blk = -> self._handle.apply(self, args);
    this.filters .. each {|filter|
      // `b` alias avoids closing over `blk` (infinite loop)
      blk = (function(b) { return -> filter(req, b);})(blk);
    };
    return blk(args[0]);
  },
  _initClone: function(source) {
    this.filters = source.filters.slice();
  },
};

/**
  @class Host
  @function Host
  @param {String|RexExp} [hostName] Hostname to handle requests for
  @param {Array} [routes] Array of (possibly nested) [::Route] objects for this host
*/
var HostProto = Object.create(Responder);
HostProto._init = func.seq(HostProto._init, function(hostName, routes) {
  if(hostName .. string.isString) {
    this.matchesHost = (h) -> h === hostName;
  } else {
    // assume regexp
    this.matchesHost = (h) -> hostName.exec(h);
  }
  this.routes = flatten(routes);
});

HostProto._clone = function() {
  var rv = Object.create(HostProto);
  rv._initClone(this);
  rv.matchesHost = this.matchesHost;
  rv.routes = this.routes.slice();
  return rv;
}

HostProto._handle = function(req) {
  var [route, matchResult] = findMatchingRoute(this.routes, req);
  if (!route) return;
  route.handle(req, matchResult);
};

exports.Host = Constructor(HostProto);

var RouteProto = Object.create(Responder);
RouteProto._init = func.seq(RouteProto._init, function(matcher, handlers) {
  this.handlers = handlers;

  // set up `this.matchesPath() and this.`stripPath()`` based on type of matcher
  if (matcher == null) {
    this.matchesPath = -> true;
    this.stripPath = p -> p.slice(1);
  } else if (string.isString(matcher)) {
    this.matchesPath = (p) -> p === matcher;
    this.stripPath = (p) -> p.slice(matcher.length + 1);
  } else {
    // assume regexp
    this.matchesPath = (p) -> matcher.exec(p);
    this.stripPath = (p, matches) -> p.slice(matches.index + matches[0].length + 1);
  }

  if (logging.isEnabled(logging.DEBUG)) {
    // augment matcher function with debug info
    var orig = this.matchesPath;
    this.matchesPath = function(path) {
      var rv = orig.apply(this, arguments);
      logging.debug("Route for #{matcher} #{rv ? "matched" : "did not match"} path #{path}");
      return rv;
    };
  }

  if (Array.isArray(this.handlers)) {
    // if we have sub-routes, use the nested handle function
    this._handle = this._handleNested;
  } else {
    // otherwise, handle requests directly
    this._handle = this._handleDirect;
  }
});

RouteProto._clone = function() {
  var rv = Object.create(RouteProto);
  rv._initClone(this);
  rv._handle = this._handle;
  rv.matchesPath = this.matchesPath;
  rv.stripPath = this.stripPath;
  rv.handlers = clone(this.handlers);
  return rv;
}

RouteProto._handleNested = function(req, pathMatches) {
  // an array must consist of `Route` objects
  var path = this.stripPath(req.url.path, pathMatches);
  var [route, pathMatches] = findMatchingRoute(this.handlers, req, path);
  if (!route) return;
  route.handle(req, pathMatches);
};

RouteProto._handleDirect = function(req, pathMatches) {
  // check if there's a handler function for the given method:
  var handler = this.handlers[req.request.method];
  if (!handler) {
    // try the generic "*" handler
    handler = route.handler['*'];
  }
  if (!handler) {
    req.response.setHeader('Allow', keys(this.handlers) .. join(', '));
    req .. writeErrorResponse(405, 'Method not allowed');
  }
  handler.call(this.handlers, req, pathMatches);
};

/**
  @class Route
  @function Route
  @param {RexExp|String} [path] Path to match
  @param {Object|Array} [handlers] handler object or array of sub-routes
  @desc
    **Note**: `path` is matched against the request path, *without* the leading slash.
    So to handle a HTTP request for "/foo/bar", you would use
    `Route(/^foo\/bar$/, ...)` or `Route("foo/bar", ...)`

    If `handlers` is an array, it must contain only [::Route] objects. If `path`
    matches a request's path, the matched portion will be removed and the remaining
    path will be used to find the appropriate sub-route.

    If `handlers` is not an Array, it should be an object with a property for each
    supported HTTP request type. Keys should be a function which will be called with
    `req` (a [::TODO]) and `matches` (the result of `path.exec(requestPath)`) if `path`
    is a regular expression. The `"*"` property may be used to handle all other
    HTTP methods.

    ### Example:

        Route(/^dir\/(.*)/, {
          GET: function(req, [path, remainder]) {
            req.response.end("GOT: #{remainder}");
          },
          '*': function(req) {
            req.response .. writeErrorResponse(500, "Unsupported method: #{req.request.method}");
          }
        });
*/
exports.Route = Constructor(RouteProto);

/**
  @class Port
  @function Port
  @param {Number} [port]
  @param {optional String} [address] interface (IP address) to listen on
  @desc
    If `address` is not given, the server will listen on all available interfaces.

    If `port` is not given, or is falsy, a random available port will be used.
    //TODO: how do you find out what port was used?
*/
var PortProto = {};
PortProto.defaultConfig = {
  capacity: 100,
  max_connections: 1000,
};
PortProto._init = function(port, address) {
  this.address = address || null;
  this.sslConfig = null;
  assert.number(port, 'port');
  this.port = port;
  this.config = {};
};

/**
 @function Port.ssl
 @param {Settings} [settings]
 @summary enable SSL with the given settings
 @desc
  Settings provided here are passed to the underlying [sjs:nodejs/http::withServer] method,
  generally just `cert` and `key`.
 */
PortProto.ssl = function(opts) {
  assert.is(this.sslConfig, null, "SSL already set");
  this.sslConfig = merge(opts, {ssl:true});
  return this;
};

PortProto.config = function(conf) {
  this.config.extend(conf);
  return this;
};

PortProto.getAddress = function() {
  return (this.address == null ? '': this.address + ":") + String(this.port || 0);
};

PortProto.getConfig = function() {
  var sslConfig = this.sslConfig || {ssl:false};
  return merge(this.defaultConfig, this.config, sslConfig, {
    address: this.getAddress(),
  });
};

exports.Port = Constructor(PortProto);

