/* (c) 2013-2014 Oni Labs, http://onilabs.com
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
  @hostenv nodejs
  @inlibrary mho:std as route when nodejs
  @desc
    See [server::run] and [#features/mho-file::] for more details
    on configuring and running the Conductance web server.
*/

var { conductanceRoot, sjsRoot } = require('./env');
var { setStatus, setHeader, writeRedirectResponse, writeErrorResponse, isHttpError, HttpError, ServerError } = require('./response');
var { flatten } = require('sjs:array');
var { isString, sanitize, endsWith, rstrip } = require('sjs:string');
var { each, join, map } = require('sjs:sequence');
var { keys, ownPropertyPairs, merge } = require('sjs:object');
var { Route } = require('../server');
var fs = require('sjs:nodejs/fs');
var nodePath = require('nodejs:path');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var url = require('sjs:url');

function checkEtag(t) {
  if (!isString(t)) throw new Error("non-string etag: #{t}");
  return t;
}

//----------------------------------------------------------------------

/**
  @function AllowCORS
  @param {../server::Responder|Array} [responder]
  @param {optional String|Function} [allow="*"] Access-Control-Allow-Origin value or filter
  @param {optional Object} [options]
  @setting {String} [methods="GET,PUT,POST,HEAD,DELETE"] Access-Control-Allow-Methods value
  @setting {String} [headers="origin, content-type"] Access-Control-Allow-Headers value
  @summary Allow Cross-Origin-Resource-Sharing for the given responder
  @return {../server::Responder|Array} A copy of the given responder(s) with CORS enabled.
  @desc
    If `allow` is a function, it will be called as `allow.call(req, origin)`.
    It should return `true` if the given origin is allowed, `false` otherwise.
*/
function AllowCORS(route, allow, settings) {
  if (arguments.length == 2) {
    // for backwards compatibility, we treat an `allow` object as `settings`
    // (the previous API only had a single `settings` arg)
    if (typeof(allow) == 'object' && !allow .. isString()) {
      settings = allow;
      allow = settings.origins;
    }
  }
  if (allow == null) allow = "*";
  if (!settings) settings = {};
  var allowedMethods = (settings && settings.methods) || "GET,PUT,POST,HEAD,DELETE";
  var allowedHeaders = (settings && settings.headers) || "origin, content-type";
  var setAllow;
  if (allow .. isString()) {
    setAllow = req -> req.response.setHeader("Access-Control-Allow-Origin", allow);
  } else {
    setAllow = function(req) {
      var origin = req.request.headers.origin;
      if (!origin) return;
      if (allow.call(req, origin)) {
        req.response.setHeader("Access-Control-Allow-Origin", origin);
      }
    }
  }
  return route
    .. Filter(function(req, block) {
      setAllow(req);
      if (req.request.method === 'OPTIONS') {
        // preflight requests should be preventable by giving POST
        // requests a text/plain mime type
        logging.verbose('Performance warning: preflight OPTIONS request.');
        req.response.setHeader("Access-Control-Allow-Methods", allowedMethods),
        req.response.setHeader("Access-Control-Allow-Headers", allowedHeaders),
        req .. setStatus(200);
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
  @function ErrorFilter
  @altsyntax responder .. ErrorFilter(handler_function)
  @param {../server::Responder|Array} [responder]
  @param {Function} [handler_function] 
  @return {../server::Responder|Array} A copy of `responder` with error filtering applied
  @summary Handle request errors
  @desc
    When `responder` generates a [./response::HttpError] "err", `ErrorFilter` calls 
    `handler_function(err, req)` (where `req` is the current request object). 

    `handler_function` should return a string consisting of the HTML
    body to be sent to the client for the given error. If `handler_function` doesn't 
    want to handle a particular error, it should pass this on by rethrowing `err`.
*/
exports.ErrorFilter = function(responder, handler_function) {
  return responder .. Filter(function(req, block) {
    try {
      block();
    } catch(e) {
      if (req.response.headersSent) {
        logging.warn("Couldn't handle error response in ErrorFilter - headers already sent");
        throw e;
      }
      var originalError = e;
      if (!isHttpError(e)) {
        e = ServerError(e.message);
      } 

      var body = handler_function(e, req);

      if (typeof(body) !== 'string') {
        logging.warn("ErrorFilter return value is not a string");
        throw originalError;
      }

      req .. setStatus(e.code, e.statusText, {'Content-type':'text/html'});
      req.response.end(body);
    }
  });
};


//----------------------------------------------------------------------

/**
   @function PortRedirect
   @param {optional RegExp|String} [path] Path to match
   @param {Integer} [port] Port to redirec to
   @param {optional Integer} [status=302] HTTP response code
   @return {../server::Route}
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
      logging.verbose("redirect #{req.url.toString()} to #{url}"); 
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
   @return {../server::Route}
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
      logging.verbose("redirect #{req.url.toString()} to #{url}"); 
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
   @return {../server::Route}
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
      logging.verbose("redirect #{req.url.toString()} to #{url}"); 
      req .. writeRedirectResponse(url, status);
    }
  });
}
exports.Redirect = Redirect;

//----------------------------------------------------------------------

var formats = require('./formats');

//XXX document
var createDirectoryMapper = exports.createDirectoryMapper = function(settings) {
  return function(path, root, overrides) {
    if (arguments.length == 1) {
      root = path;
      path = /^/;
    } else {
      if (isString(path)) path = new RegExp("^#{require('sjs:regexp').escape(path)}");
    }

    root = fs.realpath(root .. url.coerceToPath);
    var opts = overrides ? merge(settings, overrides) : settings;
    return Route(path, require('./file-server').MappedDirectoryHandler(root, opts));
  }
};

/**
   @function ExecutableDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem (path or 'file:' url)
   @param {optional Object} [options]
   @setting {Boolean} [allowDirListing=true] If `true`, directory listings will be served (if there is no index.* file in a directory)
   @setting {Boolean} [mapIndexToDir=true] If `true`, requests to a directory will be mapped onto the `index.app`, `index.html`, `index.app.gen`, or `index.html.gen` file in the given directory.
   @setting {String} [bridgeRoot] Override root location for bridge connections
   @return {../server::Route}
   @summary Creates a [../server::Route] that serves executable, code and static files from the local filesystem
   @desc

      It is hopefully obvious from the name, but you should **only** ever use
      this route type for *trusted content* that you control. Serving any user-generated files
      using this route can trivially lead to users executing arbitrary SJS code
      on your server. You should instead serve user-generated files using the
      [::StaticDirectory] route type.

      - Serves the given directory with [./formats::StaticFormatMap] as well as the [./formats::Code] and [./formats::Executable] extensions.

      - `path` can be a regexp or a string. If `path` is ommited it defaults to the
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
  allowREST:       true,
  allowApis:       true,
  formats: formats.StaticFormatMap .. formats.Code() .. formats.Executable(),
});

/**
   @function CodeDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem (path or 'file:' url)
   @param {optional Object} [options]
   @setting {Boolean} [allowDirListing=true] If `true`, requests to a directory will generate a directory listings (if there is no index.* file in the directory)
   @setting {Boolean} [mapIndexToDir=true] If `true`, requests to a directory will be mapped onto the `index.app`, `index.html`, `index.app.gen`, or `index.html.gen` file in the given directory.
   @return {../server::Route}
   @summary Creates a [../server::Route] that serves code and static files from the local filesystem
   @desc
      You should **only** ever use this route type for *trusted content* that you control. Serving any
      user-generated files using this route can lead to sensitive content being exposed (e.g. through the use of 
      the [#features/app-file::@bundle] directive in *.app files).

      - Serves the given directory with [./formats::StaticFormatMap] as well as the [./formats::Code] extension.

      - See the description for [::ExecutableDirectory] for details on how to specifiy `path` and `root`.
*/
var CodeDirectory = exports.CodeDirectory = createDirectoryMapper({
  formats: formats.StaticFormatMap .. formats.Code(),
});

/**
   @function StaticDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem (path or 'file:' url)
   @param {optional Object} [options]
   @setting {Boolean} [allowDirListing=true] If `true`, directory listings will be served (if there is no index.* file in a directory)
   @setting {Boolean} [mapIndexToDir=true] If `true`, requests to a directory will be mapped onto the `index.app`, `index.html`, `index.app.gen`, or `index.html.gen` file in the given directory.
   @return {../server::Route}
   @summary Creates a [../server::Route] that serves static files from the local filesystem
   @desc
      - Serves the given directory with [./formats::StaticFormatMap].

      - See the description for [::ExecutableDirectory] for details on how to specifiy `path` and `root`.
*/
exports.StaticDirectory = createDirectoryMapper({});

//----------------------------------------------------------------------

/**
   @function RoutedDirectory
   @param {optional RegExp|String} [path] Path to match
   @param {String} [root] Directory on local filesystem (path or 'file:' url)
   @return {../server::Route}
   @summary Creates a [../server::Route] that serves a 'routed frontend directory'
   @desc
     This function is part of a new experimental 'routed frontend directories' feature; see [mho:server/routed-directory::RoutedFrontendDirectory]
*/
exports.RoutedDirectory = -> require('./routed-directory').RoutedDirectory.apply(this, arguments);

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

    SystemRoutes is composed of [::SystemCodeRoutes], [::SystemBridgeRoutes], and [::SystemAuxRoutes]
*/
function SystemRoutes() {
  return exports.SystemCodeRoutes().concat(exports.SystemBridgeRoutes()).concat(exports.SystemAuxRoutes());
}
exports.SystemRoutes = SystemRoutes;

/**
   @function SystemCodeRoutes
   @summary Standard system routes (for serving code only)
   @desc
    These routes can be used in place of [::SystemRoutes] if your
    server does not make use of any bridge features
    (`.api` modules or [mho:rpc/bridge/] services).
*/
function SystemCodeRoutes() {
  return [
    CodeDirectory('__sjs/', "#{sjsRoot}"),
    CodeDirectory('__mho/', "#{conductanceRoot}modules/"),
  ];
}
exports.SystemCodeRoutes = SystemCodeRoutes;

/**
   @function SystemBridgeRoutes
   @summary Standard system routes (for bridge functionality only)
*/
function SystemBridgeRoutes() {
  return [
    Route(
      /^__aat_bridge\/(2)$/,
      require('mho:rpc/aat-server').createTransportHandler(
        function(transport) {
          require('mho:rpc/bridge').accept(
            require('./api-registry').getAPIbyAPIID,
            transport);
        }
      )
    )
  ];
}
exports.SystemBridgeRoutes = SystemBridgeRoutes;

/**
   @function SystemAuxRoutes
   @summary Standard system routes for auxiliary services (keyhole, oauth)
*/
function SystemAuxRoutes() {
  return [
    Route(
      /^__keyhole\/([^\/]+)\/(.*)$/,
      require('./keyhole').createKeyholeHandler()
    ),
    Route(
      '__oauthcallback',
      require('./oauth').createOAuthCallbackHandler()
    )
  ];
}
exports.SystemAuxRoutes = SystemAuxRoutes;


/**
  @function SetHeaders
  @altsyntax responder .. SetHeaders(headers)
  @param {../server::Responder|Array} [responder]
  @param {Object} [headers]
  @summary Set multiple response headers
  @return {../server::Responder|Array} A copy of `responder` which sets the given headers for every request.
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
  @return {../server::Responder|Array} A copy of `responder` which sets the given header for every request.
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
  @return {../server::Responder|Array} A copy of `responder` with development mode enabled
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
        logging.warn("Couldn't send stacktrace response - headers already sent:\n#{additional || e}");
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
  @return {../server::Responder|Array} A copy of `responder` which logs request boundaries (start/end) at the given log level
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
  @return {../server::Responder|Array} A copy of `responder` with the given filter.
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
            logging.debug("#{req.request.method} request took #{diff} ms");
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


/* not documented, used mainly by DocumentationBrowser below */
var DocumentationIndex = exports.DocumentationIndex = function(path, root) {
  // XXX: this scans the source dir recursively on every request.
  // Probably fine for localhost use, as long as production
  // deploys pregenerate their doc indexes rather than using this
  // filter.
  
  if (arguments.length == 1) {
    root = path;
  }

/*  if(!fs.exists(nodePath.join(root, 'sjs-lib-index.txt'))) {
    throw new Error("Directory #{root} doesn't contain an sjs-lib-index.txt file");
  }
*/
  if (path.length > 0 && !path .. endsWith("/")) {
    path = path + "/";
  }

  root = nodePath.resolve(root);
  return Route(
    path + 'sjs-lib-index.json',
    { GET:
      function(req) {
        var docs = require('sjs:compile/doc').summarizeLib(root);
        req .. setStatus(200, {'Content-Type': 'text/json'});
        req.response.end(JSON.stringify(docs));
      }
    }
  );
}

/**
  @function DocumentationBrowser
  @summary Generate routes for serving a conductance documentation browser
  @param {String} [path] Route prefix
  @param {Array} [hubs] An array of hubs to include in the documentation browser
  @param {optional Object} [settings]
  @setting {optional Boolean} [defaultHubs=true] If set to `false`, the default `sjs:` and `mho:` hubs are not included
  @return {Array} An array of [../server::Responder]s
  @desc
    This function returns an array of [../server::Responder]s which will serve a
    Conductance documentation browser under `<path>/`.

    ## Hubs

    The `hubs` argument should be an array of objects which all contain a `name` property.
    These hubs will be included in the documentation browser.

    You can opt to have conductance serve your hub automatically if you pass `serve:true`
    as well as a `path` attribute (the _on-disk_ location of your code as a path string or 'file:' url string). Alternatively,
    you can point to existing libraries by passing a (full or relative) `url` property.

    ## Accidentally serving secret content

    You should be careful when setting `serve:true` in any `hub` argument. This
    will currently make the _entire_ contents of the hub's `path` available
    to all users of your server, regardless of file type.
    For this reason, you should generally only
    use this function when serving locally in development mode.

    ## Documentation index

    For each served hub that doesn't contain a compiled documentation index (`sjs-lib-index.json`) file,
     the documentation index will be re-generated 
    each time it is accessed. This is not very efficient, but it's convenient
    for local development use. If you are serving documentation publically, you should
    use the [sjs:compile/doc::] module to generate an `sjs-lib-index.json` file ahead of time.

    ## Example:

        @server.run({
          address: /* ... *\/,
          routes: [
            @route.SystemRoutes()
            @route.DocumentationBrowser("docs", [
              {
                name: "app:",
                path: path.join(serverRoot, "modules"),
                serve: true,
              },
              {
                name: "foolib:",
                url: "http://example.com/foolib/modules/",
              },
            ]),

            // ...

          ]
        });

    This will serve the conductance documentation browser at `/docs/`, including
    the `app:` and `foolib:` hubs. The source code for `app:` will be
    automatically served under `http://localhost/docs/hubs/app%3A/`, while
    the `foolib` hub will be loaded directly from its remote location.
*/
var DocumentationBrowser = exports.DocumentationBrowser = function(path, hubs, settings) {
  var servedHubs = null;
  if(!settings) settings = {};
  if(!hubs) hubs = {};
  var docHubs = (settings.defaultHubs === false) ? {} : {'sjs:': null, 'mho:': null};
  var rv = [];

  hubs .. each {|hub|
    if (hub.serve) {
      var sourcePath = hub.path .. url.coerceToPath;
      assert.string(sourcePath, "hub.path");

      var hubRoute = "hubs/#{encodeURIComponent(hub.name)}";
      var fullHubRoute = "#{path .. rstrip('/')}/#{hubRoute}";

      if(!fs.exists(nodePath.join(sourcePath, 'sjs-lib-index.json'))) {
        // add a handler to auto-generate documentation index
        rv.push(DocumentationIndex(fullHubRoute, sourcePath));
      }
      rv.push(exports.StaticDirectory(fullHubRoute, nodePath.resolve(sourcePath)));
      docHubs[hub.name] = hubRoute;
    } else {
      assert.string(hub.url, "hub.url");
      docHubs[hub.name] = hub.url;
    }
  }

  // serve the /doc subdirectory of conductance under <path>/
  rv.push(exports.ExecutableDirectory(path, url.normalize('../../doc', module.id) .. url.toPath()) .. exports.Filter(function(req, block) {
    req.documentationHubs = docHubs;
    block();
  }));

  return rv;
}


// helper for ETagFilter, but also used by the file-server
// module. Returns `true` if etag matched (and thus requires
// no further response)
var applyEtag = exports._applyEtag = function(req, currentEtag) {
  if (currentEtag) {
    // check for etag match
    var lastSeen = req.request.headers["if-none-match"];
    if (lastSeen) {
      logging.debug("If-None-Matched: #{lastSeen}, current = #{currentEtag}");
      // XXX wrt '-gzip': Apache attaches this prefix to ETags. We remove it here
      // if present, so that we can run conductance behind an Apache reverse proxy.
      // Clearly this is hackish and not a good place for it :-/
      if (lastSeen.replace(/-gzip$/,'') == currentEtag) {
        req .. setStatus(304);
        req.response.end();
        return true;
      }
      else {
        logging.debug("#{req.url} outdated");
      }
    }
    else {
      logging.debug("#{req.url}: requested without etag");
    }
    req .. setHeader("ETag", currentEtag);
  }
  return false;
};

/**
  @function ETagFilter
  @param {../server::Responder|Array} [responder]
  @param {Function} [getETag]
  @summary Add ETag header processing to a given route
  @desc
    This filter will terminate incoming requests
    with a 304 not modified if the client's `If-None-Matched`
    header matches the value returned by `getETag.call(req, params)`.

    If the "If-None-Matched" header is missing or does not match the
    current ETag value, the request is processed as normal but with the
    "ETag" response header set to the current value.

    **Note**: you should typically include a module-import timestamp in generated
    ETag values, so that cached responses from a previous version of your server
    are invalidated.
*/
exports.ETagFilter = function(handlers, getEtag) {
  return Filter(handlers, function(req, block) {
    var etag = "\"#{getEtag.call(req, req.url.params()) .. checkEtag}\"";
    if (req .. applyEtag(etag, block)) return;

    block();
  });
}

