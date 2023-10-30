/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @summary The Conductance webserver
  @hostenv nodejs
  @inlibrary mho:std as server when nodejs
*/

var cutil = require('sjs:cutil');
var http = require('sjs:nodejs/http');
var { each, map, filter, find, toArray, join } = require('sjs:sequence');
var { flatten } = require('sjs:array');
var { override, propertyPairs, ownKeys, merge, clone, extend } = require('sjs:object');
var { isHttpError, HttpError, NotFound } = require('./server/response');
var logging = require('sjs:logging');
var {Constructor} = require('sjs:object');
var func = require('sjs:function');
var assert = require('sjs:assert');
var string = require('sjs:string');
var conductanceVersion = require('./env').conductanceVersion().split('.').slice(0, 2).join('.');

/**
  @function run
  @summary Run a conductance server
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

    If `block` is given, the server will call `block(servers)` when
    it's started listening on all ports. Once block() returns,
    the server will shut down.

    The `servers` argument passed to block is an array of [sjs:nodejs/http::Server]
    objects (one per listening address). This is mostly useful when you
    need to access some low-level detail in the underlying nodejs server object
    (e.g the allocated port when using `Port(0)`).
    
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
      throw new Error("Configuration specifies #{servers.length} ports, but we were passed #{fdCount} $LISTEN_FDS");
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

  function runServer(spec) {
    var [app, address, routes] = spec;
    var port_config = address.getConfig();
    port_config.print = false;
    logging.debug("server config: ", port_config);

    // run a http(s) server on the port:
    http.withServer(port_config) {
      |server|
      spec.server = server;
      logging.print("Conductance serving address:", server.address);
      if (--unstartedServers == 0) {
        ready.set();
      }
      waitfor {
        shutdown.wait();
        server.stop();
      } or {
        server.eachRequest {
          |req|
          logging.verbose("#{req.request.method} #{req.url.path}");

          // set standard headers (but only on non-upgrade requests):
          if (!req.upgrade)
            req.response.setHeader("server", "Conductance/#{conductanceVersion}");

          // execute handler function:
          try {
            var matchResult;
            var [route, matchResult] = findMatchingRoute(routes, req);
            if (!route) continue;
            route.handle(req, matchResult);
          }
          catch(e) {
            // XXX we only support error replies for non-upgrade requests atm
            if (isHttpError(e) && !req.upgrade) {
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
        block(servers .. map(s -> s.server));
      } finally {
        shutdown.set();
      }
    }
  }
  //logging.print("\nOni Conductance finished");
  servers .. each {|[ , , routes]|
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
      return !!(matchResult = route.matches(req, path));
    }
  }, undefined);
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
  handle: __js function(req,matches) {
    if (this.filters.length === 0)
      return this._handle(req,matches);
    else
      return this._handleComplex(req, matches);
  },
  _handleComplex: function(req) {
    // XXX do we really need to build the handler dynamically *every time* here???
    var args = arguments;
    var self = this;
    // each concrete class defines _handle
    var blk = -> self._handle.apply(self, args);
    this.filters .. each {|filter|
      // `b` alias avoids closing over `blk` (infinite loop)
      blk = (function(b) { return -> filter(req, b);})(blk);
    };
    return blk();
  },
  _initClone: function(source) {
    this.filters = source.filters.slice();
  },
};

/**
  @class Host
  @inlibrary mho:std when nodejs
  @summary Host descriptor for use in a [::run] server configuration.
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

var stringMatchesPath = function(s, prefix) {
  if (prefix) {
    return function(path) {
      var match = [s];
      match.index = 0;
      match.input = path;
      if (path .. string.startsWith(s)) {
        return match;
      }
    }
  } else {
    // use a constant `match`, since it's unaffected by `path`
    var match = [s];
    match.index = 0;
    match.input = s;
    return function(path) {
      if (path === s) {
        return match;
      }
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

  if (RouteProto.isPrototypeOf(this.handlers)) this.handlers = [this.handlers];
  var isNested = Array.isArray(this.handlers);

  // set up `this.matchesPath() based on type of matcher
  // note that the return value should always look like a regexp match object
  if (string.isString(matcher)) {
    this.matchesPath = stringMatchesPath(matcher, isNested);
  } else if (typeof matcher === 'function') {
    this.matches = matcher;
  } else {
    // assume regexp
    this.matchesPath = (p) -> matcher.exec(p);
  }

  if (logging.isEnabled(logging.DEBUG)) {
    // augment matcher function with debug info
    var orig = this.matchesPath ||this.matches;
    this.matchesPath = function(path) {
      var rv = orig.apply(this, arguments);
      logging.debug("Route(#{matcher}) #{rv ? "matched" : "did not match"} path: #{path}");
      return rv;
    };
  }

  if (isNested) {
    // if we have sub-routes, use the nested handle function
    this._handle = this._handleNested;
    this.handlers = flatten(this.handlers);
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
  rv.matches = this.matches;
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
  var handler = req.upgrade ? this.handlers.UPGRADE : (this.handlers[req.request.method] || this.handlers['*']);
  if (!handler) {
    if (!req.upgrade) {
      req.response.setHeader('Allow', ownKeys(this.handlers) .. join(', '));
      throw HttpError(405, 'Method not allowed');
    }
    else {
      console.log("invalid upgrade request to #{req.url}; closing socket");
      req.socket.write('HTTP/1.1 400 Bad Request\r\n\r\nUpgrade requests not supported to this URL\r\n');
      req.socket.destroy();
      req.socket = null;
      return;
    }
  }
  handler.call(this.handlers, req, pathMatches);
};

/**
  @class Route
  @summary Route descriptor for use in a [::run] server configuration.
  @inlibrary mho:std when nodejs
  @function Route
  @param {optional RexExp|String|Function} [matcher] Path/request matcher
  @param {Object|Array} [handlers] handler object or array of sub-routes
  @desc
    #### Matchers

    If `matcher` is a string or regexp, it will be used to match the request's **path without the leading slash**.

    So to handle a HTTP request for "/foo/bar", you would use
    `Route(/^foo\/bar$/, ...)` or `Route("foo/bar", ...)`

    A `null` or missing `matcher` parameter is treated as if it were `/^/`
    (i.e match any path and consume nothing).

    If `matcher` is a function, then this function will called with the request object 
    (a [sjs:nodejs/http::ServerRequest]) as first argument, and the request's path 
    (possibly truncated by ancestor handlers - see section on handlers below) as second argument. 
    It must return a truthy value to indicate that a
    request matches this route, or a non-truthy value otherwise. For compatibility with 
    sub-routes that perform sub-path matching, and other handlers that depend on path matching information, 
    the truthy result value should be an object equivalent to the result of a regexp match on 
    the request path (`matching_regexp.exec(requestPath)`).


    #### Handlers

    If `handlers` is an array, it must contain only [::Route] objects. If `matcher`
    matches a request's path, the matched portion will be removed and the remaining 
    path will be used to find the appropriate sub-route.

    If `handlers` is not an Array, it should be an object with a property for each
    supported HTTP request type (`GET`, `POST`, etc). The `"*"` property may be used to handle methods
    that aren't explicitly mentioned.

    Each property value of `handlers` should be a function which will be called with
    `req` (a [sjs:nodejs/http::ServerRequest]) and `matches`, which is the result of `matcher.exec(requestPath)`
    when `matcher` is a regular expression. If `matcher` is a string, then `match` is
    the match object you would get if `matcher` were `new RegExp(/^#{regexp.escape(matcher)}$/)`
    (i.e a RegExp matching the exact `matcher` string).

    ##### 'UPGRADE' handler
    
    When a [::Port] has been configured as `'upgradable'` (the default, which can be changed via [::Port::config]),
    requests that contain an 'Upgrade' header will be handled differently to 'normal' requests:

    * Such 'Upgrade' requests will not trigger execution of `GET`, `POST`, `*` etc, handlers, 
      even if the request method matches a configured handler. Instead, the server logic looks for a 
      handler called `UPGRADE`.

    * If no `UPGRADE` handler is found for an 'Upgrade' request, the server will reply with a 400 error.

    * When a `UPGRADE` request handler throws a [server/response::HttpError], the server will not 
      translate this exception into a corresponding html response (as it would for 'normal' request handlers).
      A 500 error will be generated instead.

    * The request object passed into the `UPGRADE` handler will be an 'upgrade' [sjs:nodejs/http::ServerRequest] 
      object which contains some different fields than a 'normal' request (in particular the 'response' field is
      missing, and there is a 'socket' field instead).

    * Some filters, such as [./server/route::ErrorFilter], only operate on 'normal' requests.



    #### Example:

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
  @summary Port descriptor for use in a [::run] server configuration.
  @inlibrary mho:std when nodejs
  @function Port
  @param {Number} [port]
  @param {optional String} [address] interface (IP address) to listen on
  @desc
    If `address` is not given, the server will listen on all available interfaces.

    If `port` is not given, or is falsy, a random available port will be used.

    By default, ports are configured to be 'upgradable' - see the "UPGRADE handler" section
    in the [::Route] documentation for details. This default can be changed via [::Port::config].

  @variable Port.port
  @type Number
*/
//TODO: how do you find out what port was used?
var PortProto = {};
PortProto.defaultConfig = {
  capacity: 100,
  max_connections: 1000,
  upgradable: true
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
 @param {Object} [ssl_parameters]
 @return {::Port}
 @summary Enable SSL with the given ssl parameters
 @desc
   * Parameters provided here are passed to the underlying [sjs:nodejs/http::withServer] method under the `ssl` key
 */
PortProto.ssl = function(opts) {
  assert.is(this.sslConfig, null, "SSL already set");
  this.sslConfig = opts;
  return this;
};

PortProto.useOpenFileDescriptor = function(fd) {
  this._config.fd = fd;
  return this;
};

/**
   @function Port.config
   @param {Object} [settings]
   @summary Configure settings of the given port
   @return {::Port}
   @desc
     Settings provided here are passed to the underlying [sjs:nodejs/http::withServer] method.
*/
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
  var sslConfig = this.sslConfig || undefined;
  return merge(this.defaultConfig, this._config, { ssl: sslConfig}, {
    address: this.getAddress(),
  });
};

exports.Port = Constructor(PortProto);

