/* (c) 2013 Oni Labs, http://onilabs.com
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
  @summary Routing objects for use in the Conductance web server
  @desc
    See [server::run] and [#features/mho-file::] for more details
    on configuring and running the Conductance web server.
*/

var { conductanceRoot, sjsRoot } = require('./env');
var { setStatus, writeRedirectResponse, writeErrorResponse, isHttpError, HttpError, ServerError } = require('./response');
var { flatten } = require('sjs:array');
var { isString, sanitize } = require('sjs:string');
var { each, join, map } = require('sjs:sequence');
var { keys } = require('sjs:object');
var { Route } = require('../server');
var fs = require('sjs:nodejs/fs');
var logging = require('sjs:logging');

//----------------------------------------------------------------------

/**
  @function AllowCORS
  @param {../server::Responder|Array} [responder]
  @param {Settings} [options]
  @setting {String} [origins] Access-Control-Allow-Origin value
  @default "*"
  @setting {String} [methods] Access-Control-Allow-Methods value
  @default "GET,PUT,POST,HEAD,DELETE"
  @setting {String} [headers] Access-Control-Allow-Headers value
  @default "origin, content-type"
  @summary Allow Cross-Origin-Resource-Sharing for the given responder
  @return A copy of the given responder with CORS enabled.
*/
function AllowCORS(route, settings, allowedMethods) {
  var allowedOrigins = (settings && settings.origins) || "*";
  var allowedMethods = (settings && settings.methods) || "GET,PUT,POST,HEAD,DELETE";
  var allowedHeaders = (settings && settings.headers) || "origin, content-type";
  return route
    .. Filter(function(req, block) {
      req.response.setHeader("Access-Control-Allow-Origin", allowedOrigins);
      if (req.method === 'OPTIONS') {
        // preflight requests should be preventable by giving POST
        // requests a text/plain mime type
        logging.verbose('Performance warning: preflight OPTIONS request.');
        req .. setStatus(200,
                        {
                          "Access-Control-Allow-Origin": allowedOrigins,
                          "Access-Control-Allow-Methods": allowedMethods,
                          "Access-Control-Allow-Headers": allowedHeaders,
                        });
        req.response.end();
      } else {
        block();
      }
    });
}
exports.AllowCORS = AllowCORS;

//----------------------------------------------------------------------

/**
   @function SimpleRedirect
   @param {RegExp|String} [path] Path to match
   @param {String} [dest] Redirect destination
   @param {optional Number} [status=302] HTTP status code
   @summary Respond with a HTTP redirect to a different path on this server
   @desc
     Any query paramaters on the original URL are included in the redirection.
*/
function SimpleRedirect(path, new_base, status) {
  status = status || 302;
  return Route(path, {
    '*': function(req) {
      req .. writeRedirectResponse("#{new_base}#{req.url.query? "?#{req.url.query}":''}#{req.url.anchor? "##{req.url.anchor}":''}", status);
    }
  });
}
exports.SimpleRedirect = SimpleRedirect;

//----------------------------------------------------------------------

/**
   @function ErrorResponse
   @param {optional RegExp|String} [path] Path to match
   @param {Integer} [code]
   @param {optional String} [statusText]
   @param {optional String} [description]
   @return {../server::Route}
   @summary Creates a [../server::Route] that responds with a given HTTP status
*/
function ErrorResponse(/* path, code, status, descr */) {
  // untangle args
  var path, code, status, descr;
  if (typeof arguments[0] === 'number')
    [code, status, descr] = arguments;
  else
    [path, code, status, descr] = arguments;

  if (typeof code !== 'number') throw new Error("ErrorResponse expects a numeric 'code' argument, but argument '#{code}' has type '#{typeof code}'");
  
  return Route(path, {
    '*': function(req) {
      throw HttpError(code, status, descr);
    }
  });  
}
exports.ErrorResponse = ErrorResponse;

//----------------------------------------------------------------------

/**
   @function PortRedirect
   @param {optional RegExp|String} [path] Path to match
   @param {Integer} [port] Port to redirec to
   @param {optional Integer} [status=302] HTTP response code
   @returns {../server::Route}
   @summary Creates a [../server::Route] that redirects requests to a different port on the same server
*/
function PortRedirect(/*path, port, status*/) {
  // untangle args
  var path, port, status;
  if (arguments.length >= 3)
    [path,port,status] = arguments;
  else if (arguments.length == 2) {
    if (typeof arguments[0] === 'number')
      [port,status] = arguments;
    else
      [path, port] = arguments;
  }
  else 
    [port] = arguments;

  if (typeof port !== 'number') throw new Error("PortRedirect expects a numeric 'port' argument, but argument '#{port}' has type '#{typeof port}'");
  status = status || 302;

  return Route(path, {
    '*': function(req) {
      var url = "#{req.url.protocol}://#{req.url.host}:#{port}#{req.url.relative ? req.url.relative : ''}";
      logging.info("redirect #{req.url.toString()} to #{url}"); 
      req .. writeRedirectResponse(url, status);
    }
  });
}
exports.PortRedirect = PortRedirect;

//----------------------------------------------------------------------

/**
   @function HostRedirect
   @param {optional RegExp|String} [path] Path to match
   @param {String} [host] Fully qualified URL of host to redirect to (without trailing slash)
   @param {optional Integer} [status=302] HTTP response code
   @returns {../server::Route}
   @summary Creates a [../server::Route] that redirects requests to a different host 
*/
function HostRedirect(/* path, host, status */) {
  // untangle args
  var path, host, status;
  if (arguments.length >= 3)
    [path,host,status] = arguments;
  else if (arguments.length == 2) {
    if (typeof arguments[1] === 'number')
      [host,status] = arguments;
    else
      [path, host] = arguments;
  }
  else 
    [host] = arguments;

  status = status || 302;

  return Route(path, {
    '*': function(req) {
      var url = "#{host}#{req.url.relative ? req.url.relative : ''}";
      logging.info("redirect #{req.url.toString()} to #{url}"); 
      req .. writeRedirectResponse(url, status);
    }
  });
}
exports.HostRedirect = HostRedirect;

//----------------------------------------------------------------------

/**
   @function Redirect
   @param {optional RegExp|String} [path] Path to match
   @param {Function} [rewrite] URL rewriting function
   @param {optional Integer} [status=302] HTTP response code
   @returns {../server::Route}
   @summary Creates a [../server::Route] that redirects requests to a different host 
   @desc
     `rewrite` will be called with a request URL encoded as an object by [sjs:url::parse], and needs to return the rewritten URL as a string

     **Example**:

         // redirect to https on port `ssl_port`:
         Redirect(url -> "https://#{url.host}:#{ssl_port}#{url.relative? url.relative : ''}") 
*/

function Redirect(/* path, rewrite, status */) {
  // untangle args
  var path, rewrite, status;
  if (arguments.length >= 3)
    [path,rewrite,status] = arguments;
  else if (arguments.length == 2) {
    if (typeof arguments[0] === 'function')
      [rewrite,status] = arguments;
    else
      [path, rewrite] = arguments;
  }
  else 
    [rewrite] = arguments;

  if (typeof rewrite !== 'function') 
    throw new Error("Redirect expects a functional 'rewrite' argument, but argument '#{rewrite}' has type '#{typeof rewrite}'");
  status = status || 302;

  return Route(path, {
    '*': function(req) {
      var url = rewrite(req.url);
      logging.info("redirect #{req.url.toString()} to #{url}"); 
      req .. writeRedirectResponse(url, status);
    }
  });
}
exports.Redirect = Redirect;

//----------------------------------------------------------------------

var formats = require('./formats');

//XXX document
var createDirectoryMapper = exports.createDirectoryMapper = function(settings) {
  return function(path, root) {
    if (arguments.length == 1) {
      root = path;
      path = /^/;
    } else {
      if (isString(path)) path = new RegExp("^#{require('sjs:regexp').escape(path)}");
    }

    root = fs.realpath(root);
    return Route(path, require('./file-server').MappedDirectoryHandler(root, settings));
  }
};

/**
   @function ExecutableDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem
   @returns {../server::Route}
   @summary Creates a [../server::Route] that serves executable, code and static files from the local filesystem
   @desc

      It is hopefully obvious from the name, but you should **only** ever use
      this route type for *trusted content* that you control. Serving any user-generated files
      using this route can trivially lead to users executing arbitrary SJS code
      on your server. You should instead serve user-generated files using the
      [::StaticDirectory] route type.

      - Serves the given directory with [./formats::StaticFormatMap] as well as the [./formats::Code] and [./formats::Executable] extensions.

      - `path` can be a regexp or a string, as described in
        [../server::Route]. If `path` is ommited it defaults to the
        empty string (i.e. all requests will be matched by the route).

      - The file to be served is determined by stripping the prefix
        matched by `path` from the request path, and appending the
        remainder to `root`.

      - It doesn't matter if `root` contains a '/' at the end or
        not. `ExecutableDirectory('foo/', '/Users/oni/bar/')` and
        `ExecutableDirectory('foo/', '/Users/oni/bar')` are equivalent.

      - If supplied, `path` should contain a '/' at the end. Note that
        a mapping of the form `ExecutableDirectory('foo/',
        '/Users/oni/bar')` will only map urls that contain `'foo/'`,
        e.g. `http://MYSERVER/foo/` (which would map to
        `/Users/oni/bar/`) or `http://MYSERVER/foo/baz.txt` (which
        would map to `/Users/oni/bar/baz.txt`). If you also want to
        map `http://MYSERVER/foo`, set `path` to a regexp like
        `/foo\/?/`. This will result in `http://MYSERVER/foo` being
        automatically redirected to `http://MYSERVER/foo/`.

*/
var ExecutableDirectory = exports.ExecutableDirectory = createDirectoryMapper({
  allowGenerators: true,
  allowApis:       true,
  formats: formats.StaticFormatMap .. formats.Code() .. formats.Executable(),
});

/**
   @function CodeDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem
   @returns {../server::Route}
   @summary Creates a [../server::Route] that serves code and static files from the local filesystem
   @desc
      - Serves the given directory with [./formats::StaticFormatMap] as well as the [./formats::Code] extension.

      - See the description for [::ExecutableDirectory] for details on how to specifiy `path` and `root`.
*/
var CodeDirectory = exports.CodeDirectory = createDirectoryMapper({
  formats: formats.StaticFormatMap .. formats.Code(),
});

/**
   @function StaticDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem
   @returns {../server::Route}
   @summary Creates a [../server::Route] that serves static files from the local filesystem
   @desc
      - Serves the given directory with [./formats::StaticFormatMap].

      - See the description for [::ExecutableDirectory] for details on how to specifiy `path` and `root`.
*/
exports.StaticDirectory = createDirectoryMapper({});


//----------------------------------------------------------------------

/**
   @function SystemRoutes
   @summary Standard system routes
   @desc
    These routes are required for standard operation of the Conductance
    server - you should always include them in your server configuration
    if you use Conductance features.

    They provide mappings for serving builtin conductance and StratifiedJS
    modules, as well as routes to handle bidirectional bridge communication.

    All included routes begin with with `/__` (e.g `/__mho/` and `/__sjs/`), so
    you should avoid defining your own routes beginning with `/__` to
    avoid the possibility of a clash.
*/
function SystemRoutes() {
  return exports.SystemCodeRoutes().concat([
    Route(
      /^__aat_bridge\/(2)$/,
      require('mho:rpc/aat-server').createTransportHandler(
        function(transport) {
          require('mho:rpc/bridge').accept(
            require('./api-registry').getAPIbyAPIID,
            transport);
        }
      )
    ),
    Route(
      /^__keyhole\/([^\/]+)\/(.*)$/,
      require('./keyhole').createKeyholeHandler()
    )
  ]);
}
exports.SystemRoutes = SystemRoutes;

/**
   @function SystemCodeRoutes
   @summary Standard system routes (for serving code only)
   @desc
    These routes can be used in place of [::SystemRoutes] if your
    server does not make use of any bridge features
    (`.api` modules or [::rpc/bridge/] services).
*/
function SystemCodeRoutes() {
  return [
    CodeDirectory('__sjs/', "#{sjsRoot}"),
    CodeDirectory('__mho/', "#{conductanceRoot}modules/"),
  ];
}
exports.SystemCodeRoutes = SystemCodeRoutes;

/**
  @function SetHeaders
  @altsyntax responder .. SetHeaders(headers)
  @param {../server::Responder|Array} [responder]
  @param {Object} [headers]
  @summary Set multiple response headers
  @return A copy of `responder` which sets the given headers for every request.
  @desc
    ### Example:
    
        routes .. SetHeaders({
          "Cache-control": "no-cache",
          "Expires": "-1",
        });
*/
exports.SetHeaders = function(responder, headers) {
  return responder .. Filter(function(req, blk) {
    headers .. ownPropertyPairs .. each { |[k,v]|
      req.response.setHeader(k,v);
    }
    blk();
  });
};

/**
  @function SetHeader
  @altsyntax responder .. SetHeader(headerName, value)
  @param {../server::Responder|Array} [responder]
  @param {String} [headerName]
  @param {String} [value]
  @summary Set a single response header
  @return A copy of `responder` which sets the given header for every request.
  @desc
    See also [::SetHeaders]
*/
exports.SetHeader = function(responder, k, v) {
  return responder .. Filter(function(req, blk) {
    req.response.setHeader(k,v);
    blk();
  });
};

/**
  @function DeveloperMode
  @altsyntax responder .. DeveloperMode()
  @param {../server::Responder|Array} [responder]
  @return A copy of `responder` with development mode enabled
  @summary Include stack traces for server-side errors
  @desc
    Developer mode sends server-side errors to the client as a stacktrace.

    It also sets the `development` property to `true` on each request object
    it handles, which can be used elsewhere in your app to conditionally
    enable development features.
*/
exports.DeveloperMode = function(responder) {
  return responder .. Filter(function(req, block) {
    req.development = true;
    try {
      block();
    } catch(e) {
      var originalError = e;
      var desc = String(e);
      var additional;
      if (!isHttpError(e)) {
        additional = e.message;
        e = ServerError();
      } else {
        additional = e.description;
      }
      if (req.response.headersSent) {
        logging.warn("Couldn't send stacktrace response - headers already sent");
      } else {
        try {
          req .. writeErrorResponse(e.code, e.statusText, `
            ${additional ? `<h2>Error: ${additional}</h2>`}
            <h3>Stack trace:</h3>
            <pre>${String(desc)}</pre>
          `);
        } catch(_e) { /* ignore */ }
      }
      throw originalError;
    }
  });
};


/**
  @function LogRequests
  @param {../server::Responder|Array} [responder]
  @param {Number} [level] A log level from [sjs:logging::]
  @summary Log requests via the [sjs:logging::] module
  @return A copy of `responder` which logs request boundaries (start/end) at the given log level
*/
exports.LogRequests = function(responder, level) {
  if (level === undefined) level = logging.INFO;
  return responder .. Filter(function(req, block) {
    logging.info("Start request: #{req.url}");
    try {
      block();
    } finally {
      logging.info("End request: #{req.url}");
    }
  });
};

/**
  @function Filter
  @summary Add a filter function to the given route(s) or host(s)
  @param {../server::Responder|Array} [responder]
  @param {Function} [func] The filter to add
  @return A copy of `responder` with the given filter.
  @desc
  
    The filter function will receive two arguments: `req` and `block`.
    `block` is effectively "the rest of the request handler" - you
    should always call it unless your filter fully handles the request.


    ### Example:

        Route(/^hello$/,
          { GET: (r) -> r.response.end("hi!") }
        ) .. Filter(function(req, block) {
          var startTime = new Date().getTime();
          try {
            // call next filter / handler
            block();
          } finally {
            var diff = startTime - (new Date().getTime());
            logging.debug("#{req.method} request took #{diff} ms");
          }
        });


    Filters are added to the outside of existing filters. So if you have:

        Route( ... ) .. Filter(f1) .. Filter(f2);

    Then `f2` will be called first, then `f1`, then the original Route handler.
*/
var Filter = exports.Filter = function(responder, fn) {
  var apply = function(r) {
    if (!r.addFilter) throw new Error("Filter must be applied to a Responder (Route or Host) object");
    r = r._clone();
    r.addFilter(fn);
    return r;
  };
  return (Array.isArray(responder)) ? flatten(responder) .. map(apply) : apply(responder);
};

