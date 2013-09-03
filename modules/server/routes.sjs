var { conductanceRoot, sjsRoot } = require('./env');
var { setStatus, writeRedirectResponse, writeErrorResponse, isHttpError, ServerError } = require('./response');
var { flatten } = require('sjs:array');
var { isString, sanitize } = require('sjs:string');
var { each, join, map } = require('sjs:sequence');
var { keys } = require('sjs:object');
var { Route } = require('../server');
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

var formats = require('./formats');

function createDirectoryMapper(settings) {
  return function(path, root) {
    if (arguments.length == 1) {
      root = path;
      path = /^/;
    } else {
      if (isString(path)) path = new RegExp("^#{require('sjs:regexp').escape(path)}");
    }

    return Route(path, require('./file-server').MappedDirectoryHandler(root, settings));
  }
};

var ExecutableDirectory = exports.ExecutableDirectory = createDirectoryMapper({
  allowGenerators: true,
  allowApis:       true,
  formats: formats.StaticFormatMap .. formats.Code() .. formats.Executable(),
});

var CodeDirectory = exports.CodeDirectory = createDirectoryMapper({
  formats: formats.StaticFormatMap .. formats.Code(),
});

exports.StaticDirectory = createDirectoryMapper({});


//----------------------------------------------------------------------

function SystemRoutes() {
  return [
    CodeDirectory('__sjs/', "#{sjsRoot()}"),
    ExecutableDirectory('__mho/', "#{conductanceRoot()}modules/"),
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
  ];
}
exports.SystemRoutes = SystemRoutes;


/**
  @function SetHeaders
  @altsyntax responder .. SetHeaders(headers)
  @param {../server::Responder|Array} [responder]
  @param {Object} [headers]
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
        } catch(ee) { /* ignore */ }
      }
      throw e;
    }
  });
};


/**
  @function LogRequests
  @param {Object} [headers]
  @param {../server::Responder|Array} [responder]
  @return A copy of `responder` which logs request boundaries at the given log level
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

