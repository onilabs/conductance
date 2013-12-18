var cutil = require('sjs:cutil');
var http = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, keys, merge, clone, extend } = require('sjs:object');
var { isHttpError, NotFound } = require('./server/response');
var logging = require('sjs:logging');
var {Constructor} = require('sjs:object');
var func = require('sjs:function');
var assert = require('sjs:assert');
var string = require('sjs:string');

/**
  @function run
  @summary run a conductance server
  @param {Object|Array} [config] server configuration(s)
  @param {optional Function} [block] Block to run the server around
  @desc
    `config` should be a single object or array of objects. Each object should have the keys:

    * address - a single [::Port] or array of [::Port]s
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
        var hello = (req) -> req.response.end("hi!");

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
          address: Port(8080),
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
          address: Port(8080),
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

var toArray = (v) -> Array.isArray(v) ? v : [v];

exports.run = function(config, block) {
  var servers = [];

  toArray(config) .. each {|config|
    var routes = config.routes .. flatten();
    toArray(config.address) .. each {|address|
      servers.push([config, address, routes]);
    }
  };

  if (process.env['LISTEN_PID'] === String(process.pid)) {
    // use socket activation
    var fdCount = parseInt(process.env.LISTEN_FDS, 10);
    if (fdCount != servers.length) {
      throw new Error("Configuration specifies #{ports.length} ports, but we were passed #{fdCount} $LISTEN_FDS");
    }
    logging.verbose("Adopting #{fdCount} $LISTEN_FDS");
    var nextFD=3;
    servers .. each {|[app, address, routes]|
      address.useOpenFileDescriptor(nextFD++);
    }
  }

  var unstartedServers = servers.length;
  var shutdown = cutil.Condition();
  var ready = cutil.Condition();

  function runServer([app, address, routes]) {
    var port_config = address.getConfig();
    logging.debug("server config: ", port_config);

    // run a http(s) server on the port:
    http.withServer(port_config) {
      |server|
      logging.print("Conductance serving address:", port_config.address);
      if (--unstartedServers == 0) {
        ready.set();
      }
      waitfor {
        shutdown.wait();
        server.stop();
      } or {
        server.eachRequest {
          |req|
          logging.verbose("#{req.request.method} #{req.url}");

          // set standard headers:
          req.response.setHeader("Server", "Conductance"); // XXX version

          // execute handler function:
          try {
            var matchResult;
            var [route, matchResult] = findMatchingRoute(routes, req);
            if (!route) continue;
            route.handle(req, matchResult);
          }
          catch(e) {
            if (isHttpError(e)) {
              if(!req.response.finished) {
                if(!req.response.headersSent) {
                  e.writeTo(req);
                } else {
                  logging.verbose("HTTPError #{e.code} thrown after headersSent; ignoring");
                }
              }
            } else {
              logging.warn("Unknown error handling request: #{e}");
            }
          }
        }
      }
    }
  }

  //----------------------------------------------------------------------
  // main program:


  waitfor {
    cutil.waitforAll(runServer, servers);
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
  servers .. each {|[_, _, routes]|
    routes .. each(r -> r.__finally__());
  }
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
    throw NotFound("No handler matched request");
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
    this.filters.push(f);
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

  if (logging.isEnabled(logging.DEBUG)) {
    // augment matcher function with debug info
    var orig = this.matchesHost;
    this.matchesHost = function(host) {
      var rv = orig.apply(this, arguments);
      logging.debug("Host(#{hostName}) #{rv ? "matched" : "did not match"} host: #{host}");
      return rv;
    };
  }

  if (!Array.isArray(routes)) routes = [routes];
  this.routes = flatten(routes);
});

HostProto.__finally__ = function() {
  this.routes .. each(r -> r.__finally__());
};

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

var stringMatchesPath = function(s) {
  var match = [s];
  match.index = 0;
  match.input = s;
  return function(path) {
    if (path === s) {
      return match;
    }
  }
}

var RouteProto = Object.create(Responder);
RouteProto._init = func.seq(RouteProto._init, function(matcher, handlers) {
  if (arguments.length == 1) {
    handlers = matcher;
    matcher = null;
  }

  this.handlers = handlers;
  if (matcher == null) {
    matcher = /^/;
  }
  
  // set up `this.matchesPath() based on type of matcher
  // note that the return value should always look like a regexp match object
  if (string.isString(matcher)) {
    this.matchesPath = stringMatchesPath(matcher);
  } else {
    // assume regexp
    this.matchesPath = (p) -> matcher.exec(p);
  }

  if (logging.isEnabled(logging.DEBUG)) {
    // augment matcher function with debug info
    var orig = this.matchesPath;
    this.matchesPath = function(path) {
      var rv = orig.apply(this, arguments);
      logging.debug("Route(#{matcher}) #{rv ? "matched" : "did not match"} path: #{path}");
      return rv;
    };
  }

  if (RouteProto.isPrototypeOf(this.handlers)) this.handlers = [this.handlers];

  if (Array.isArray(this.handlers)) {
    // if we have sub-routes, use the nested handle function
    this._handle = this._handleNested;
  } else {
    // otherwise, handle requests directly
    this._handle = this._handleDirect;
  }
});
RouteProto.__finally__ = function() {
  if(Array.isArray(this.handlers)) {
    this.handlers .. each(h -> h.__finally__());
  } else {
    this.handlers.__finally__ && this.handlers.__finally__();
  }
}

RouteProto._clone = function() {
  var rv = Object.create(RouteProto);
  rv._initClone(this);
  rv._handle = this._handle;
  rv.matchesPath = this.matchesPath;
  rv.handlers = clone(this.handlers);
  return rv;
}

RouteProto._handleNested = function(req, pathMatches) {
  var path = pathMatches.input.slice(pathMatches.index + pathMatches[0].length);
  var [route, pathMatches] = findMatchingRoute(this.handlers, req, path);
  if (!route) return;
  route.handle(req, pathMatches);
};

RouteProto._handleDirect = function(req, pathMatches) {
  // check if there's a handler function for the given method:
  var handler = this.handlers[req.request.method] || this.handlers['*'];
  if (!handler) {
    req.response.setHeader('Allow', keys(this.handlers) .. join(', '));
    throw HttpError(405, 'Method not allowed');
  }
  handler.call(this.handlers, req, pathMatches);
};

/**
  @class Route
  @function Route
  @param {optional RexExp|String} [path] Path to match
  @param {Object|Array} [handlers] handler object or array of sub-routes
  @desc
    **Note**: `path` is matched against the request path, *without* the leading slash.
    So to handle a HTTP request for "/foo/bar", you would use
    `Route(/^foo\/bar$/, ...)` or `Route("foo/bar", ...)`

    A `null` or missing `path` parameter is treated as if it were `/^/`
    (i.e match any path and consume nothing).

    If `handlers` is an array, it must contain only [::Route] objects. If `path`
    matches a request's path, the matched portion will be removed and the remaining
    path will be used to find the appropriate sub-route.

    If `handlers` is not an Array, it should be an object with a property for each
    supported HTTP request type. The `"*"` property may be used to handle methods
    that aren't explicitly mentioned.

    Each property value of `handlers` should be a function which will be called with
    `req` (a [sjs:nodejs/http::ServerRequest]) and `matches`, which is the result of `path.exec(requestPath)`
    when `path` is a regular expression. If `path` is a string, then `match` is
    the match object you would get if `path` were `new RegExp(/^#{regexp.escape(path)}$/)`
    (i.e a RegExp matching the exact `path` string).

    ### Example:

        Route(/^dir\/(.*)/, {
          GET: function(req, [path, remainder]) {
            req.response.end("GOT: #{remainder}");
          },
          '*': function(req) {
            logging.info("Unsupported method requested: #{req.request.method}");
            throw HttpError(405, 'Method not allowed');
          }
        });

    It's worth pointing out that the default behaviour of a request method with no
    matching handler is to send a 405 HTTP response, so you rarely need to do this
    explicitly.
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
  this._config = {};
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

PortProto.useOpenFileDescriptor = function(fd) {
  this._config.fd = fd;
  return this;
};

PortProto.config = function(conf) {
  this._config .. extend(conf);
  return this;
};

/**
  @function Port.getAddress
  @summary Return address (hostname:port) as a string.
  @return {String}
*/
PortProto.getAddress = function() {
  return (this.address == null ? '': this.address + ":") + String(this.port || 0);
};

PortProto.getConfig = function() {
  var sslConfig = this.sslConfig || {ssl:false};
  return merge(this.defaultConfig, this._config, sslConfig, {
    address: this.getAddress(),
  });
};

exports.Port = Constructor(PortProto);

