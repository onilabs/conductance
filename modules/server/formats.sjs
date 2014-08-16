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
  @summary File-format configuration for the conductance server
  @hostenv nodejs
*/

var env = require('./env');
var { pump, readAll } = require('sjs:nodejs/stream');
var { map, each, toArray, join } = require('sjs:sequence');
var { clone, merge, ownPropertyPairs } = require('sjs:object');
var { matches } = require('sjs:regexp');
var { startsWith } = require('sjs:string');
var func = require('sjs:function');
var logging = require('sjs:logging');
var assert = require('sjs:assert');
var Url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var { CachedBundle } = require('./generator');
var lruCache = require('sjs:lru-cache');

// XXX this should be configurable separately somewhere
// XXX see also the separate *.gen caching in file-server.sjs
var SJSCache = lruCache.makeCache(10*1000*1000); // 10MB
var bundleCache = lruCache.makeCache(10*1000*1000); // 10MB

//----------------------------------------------------------------------
// filters XXX these should maybe go in their own module

//----------------------------------------------------------------------
// helper filter to wrap a file in a jsonp response:
function json2jsonp(src, dest, aux) {
  var callback = aux.request.url.params()['callback'];
  if (!callback) callback = "callback";
  dest.write(callback + "(");
  pump(src, dest);
  dest.write(")");
}

//----------------------------------------------------------------------
// filter that compiles sjs into '__oni_compiled_sjs_1' format:
function sjscompile(src, dest, aux) {
  if (typeof src !== 'string') src = readAll(src);
  try {
    src = __oni_rt.c1.compile(src, {globalReturn:true, filename:"__onimodulename"});
  }
  catch (e) {
    logging.error("sjscompiler: #{aux.request.url} failed to compile at line #{e.compileError.line}: #{e.compileError.message}");
    // communicate the compilation error to the caller in a little bit
    // of a round-about way: We create a compiled SJS file that throws
    // our compile error as an exception on execution
    var error_message = 
      "'SJS syntax error in \\''+__onimodulename+'\\' at line #{e.compileError.line}: #{e.compileError.message.toString().replace(/\'/g, '\\\'')}'";
    src = __oni_rt.c1.compile("throw new Error(#{error_message});", {globalReturn:true, filename:"'compilation@rocket_server'"});
  }

  dest.write("/*__oni_compiled_sjs_1*/"+src);
}

//----------------------------------------------------------------------
// filter that generates the html boilerplate for *.app files:
function gen_app_html(src, dest, aux) {
  var app_name = aux.request.url.file || "index.app";

  var documentSettings = {
    init: "require(\"#{app_name}!sjs\");",
    externalScripts: [],
  };
  var docutil = require('sjs:docutil');
  var docs = docutil.parseModuleDocs(readAll(src));

  var [template, metadata] = docutil.getPrefixedProperties(docs, 'template');
  if (!template) template = 'app-default';
  var externalScripts = metadata['externalScript'];
  if (externalScripts) {
    if (Array.isArray(externalScripts)) {
      documentSettings.externalScripts = documentSettings.externalScripts.concat(externalScripts);
    } else {
      documentSettings.externalScripts.push(externalScripts);
    }
  }

  if (docs['bundle'] .. docutil.toBool === true) {
      documentSettings.externalScripts.push("#{app_name}!bundle");
  }

  var { Document, loadTemplate } = require('../surface');
  dest.write(
    Document(null, documentSettings .. merge({
      template: loadTemplate(template, src.path .. Url.fileURL),
      templateData: metadata,
      title: metadata.title,
    }))
  );
}

//----------------------------------------------------------------------
// filter that generates a .js bundle from a source module
var {gen_sjs_bundle, gen_sjs_bundle_etag} = (function() {
  function getSettings(path, url) {
    var defaultSettings = {
      resources: [
        // Assume relative paths are co-located.
        // This will not work if .app files import paths from their parent,
        // but we can't handle that in the general case without deep knowledge of routes.
        [Url.normalize('./', path .. Url.fileURL), Url.normalize('./', url.source)],
      ],
      skipFailed: true,
    };
    var appSettings = env.get('bundleSettings', defaultSettings);
    var docutil = require('sjs:docutil');

    var [_, sourceSettings] = fs.readFile(path)
      .. docutil.parseModuleDocs()
      .. docutil.getPrefixedProperties('bundle');

    var settings = appSettings .. merge(sourceSettings, { sources: [path] });
    return settings;
  };

  var bundleAccessor = function(path) {
    assert.ok(path);
    var get = bundleCache.get(path);
    if (!get) {
      // serialize requests for the given path, as we don't
      // want to regenerate the same bundle in parallel
      get = (function() {
        var b;
        return func.sequential(function(url) {
          if (!b) {
            b = CachedBundle(getSettings(path, url));
          } else if (b.isStale()) {
            b.modifySettings(getSettings(path, url));
          }
          return b;
        });
      }());
      bundleCache.put(path, get, 0);
    }
    return get;
  };

  return {
    gen_sjs_bundle: function(src, dest, aux) {
      var getBundle = bundleAccessor(src.path);
      var bundle = getBundle(aux.request.url);
      var content = bundle.content();
      // overwrite cache entry each time to update cache length
      bundleCache.put(src.path, getBundle, content.length);
      dest.write(content);
    },
    gen_sjs_bundle_etag: function(request, filePath) {
      return bundleAccessor(filePath)(request.url).etag();
    },
  };
})();

//----------------------------------------------------------------------
// filter that generates html for a directory listing:
function gen_dir_html(src, dest, aux) {
  var listing = require('../server-ui/dir-listing').generateDirListing(JSON.parse(readAll(src)));

  dest.write(require('../surface').Document(listing));
}

//----------------------------------------------------------------------
// filter that generates docs for an sjs module:
function gen_moduledocs_html(src, dest, aux) {
  var docs = require('../server-ui/module-doc').generateModuleDoc(aux.request.url.path, readAll(src));
  dest.write(require('../surface').Document(docs));
}


//----------------------------------------------------------------------
// filter that generates import sjs for an api:
function apiimport(src, dest, aux) {
  // To facilitate redirecting apis, as in e.g.:
  //   @PortRedirect(/^database\/.*\.api/,  8082),
  // we'll make sure that the client makes all future access to the api 
  // module directly to our server:
  var moduleURL = "#{aux.request.url.protocol}://#{aux.request.url.authority}#{aux.request.url.path}";
  // XXX In addition to the `connect` function, we're currently also
  // exporting the `server` URL to the client. This is so that we can
  // correctly address keyhole files on a redirected server, which is
  // a bit of a hack. (The keyhole module need some redesigning; it
  // should itself be able to give full urls - but that would probably
  // require strata-local storage for communicating the request
  // downstream).
  var serverRoot = Url.normalize('/', aux.request.url.source);
  dest.write("\
var serverURL = #{JSON.stringify(serverRoot)};
var moduleURL = #{JSON.stringify(moduleURL)};
var bridge = require('mho:rpc/bridge');
var {merge} = require('sjs:object');
exports.server = serverURL;
exports.module = moduleURL;
var defaultOpts = {server:serverURL};

exports.connect = function(opts, block) {
  if (typeof(opts) == 'function') {
    block = opts;
    opts = null;
  }
  opts = opts ? (defaultOpts .. merge(opts)) : defaultOpts;

  if (block) {
    bridge.connect(moduleURL, opts) {
      |connection|
      block(connection.api);
    }
  }
  else
    return bridge.connect(moduleURL, opts).api;
};
");
}

// filter that generates JSON info about api endpoint:
function apiinfo(src, dest, aux) {
  if (!aux.apiinfo)
    throw new Error("API access not enabled");
  dest.write(JSON.stringify(aux.apiinfo));
}

//----------------------------------------------------------------------
// filter that generates html for markdown (*.md) files:
function gen_markdown_html(src, dest, aux) {
  var docs = require('../server-ui/markdown-file').generateMarkdown(readAll(src));
  dest.write(require('../surface').Document(docs));
}

//----------------------------------------------------------------------

/**
  @class FormatMap
  @summary File-type configuration for the conductance file-server
*/

/**
  @variable StaticFormatMap
  @summary a [::FormatMap] appropriate for serving untrusted, static files.
  @desc
    A [::StaticFormatMap] will not execute .api modules, nor will it compile
    .sjs modules. It is safe for serving untrusted content.
*/
exports.StaticFormatMap = {
  "/"  : { none : { mime: "text/html",
                    filter: gen_dir_html
                  },
           json : { mime: "application/json"
                  }
         },
  html : { none : { mime: "text/html" },
           src  : { mime: "text/plain" }
         },
  js   : { none : { mime: "text/javascript" },
           src  : { mime: "text/plain" }
         },
  json : { none : { mime: "application/json" },
           src  : { mime: "text/plain" },
         },
  sjs  : { none : { mime: "text/plain", },
         },
  xml  : { none : { mime: "text/xml" },
           src  : { mime: "text/plain" }
         },
  png  : { none : { mime: "image/png" } },
  jpg  : { none : { mime: "image/jpeg" } },
  gif  : { none : { mime: "image/gif" } },
  mp4  : { none : { mime: "video/mp4" } },
  wav  : { none : { mime: "audio/wav" } },
  svg  : { none : { mime: "image/svg+xml" } },
  txt  : { none : { mime: "text/plain" } },
  css  : { none : { mime: "text/css" },
           src  : { mime: "text/plain" },
         },
  "*"  : { none : { /* serve without mimetype */ }
         },
  app  : { none : { mime: "text/plain" } },
  api  : { none : { mime: "text/plain" } },
  md   : { none : { mime: "text/plain" } },

  ttf  : { none : { mime: "application/x-font-ttf",
                    // give fonts an expiry of access + 1 month: 
                    expires: -> new Date(Date.now() + 1000*60*60*24*30)
                  }
         },
  woff : { none : { mime: "application/font-woff",
                    // give fonts an expiry of access + 1 month: 
                    expires: -> new Date(Date.now() + 1000*60*60*24*30)
                  }
         }

};

/**
  @function withFormats
  @param {Object} [base]
  @param {Object} [additional]
  @summary Copies `base` formats object and adds all formats from `additional`.
  @desc
    This function returns a new object - neither argument is modififed.
*/
var withFormats = exports.withFormats = function(map, extensions) {
  var rv = clone(map);
  extensions .. ownPropertyPairs .. each {|[extension, formats]|
    rv[extension] = merge(rv[extension], formats);
  }
  return rv;
}

/**
  @function Code
  @altsyntax base .. Code
  @param {::FormatMap} [base]
  @summary return a copy of `base` with mappings for serving application code
  @return {::FormatMap}
  @desc
    This function adds the following mappings in the returned [::FormatMap]:

      - server-side compilation of .sjs files
      - serving .sjs files as HTML module documentation content
      - .app, as SJS apps executed on the client
      - .md, for rendering as HTML

    Note that the source of .app files is accessible via the `src` format.

*/
var conductanceVersionEtag = "#{env.conductanceVersion()}-#{env.compilerStamp()}";
var Code = (base) -> base
  .. withFormats({
    sjs: { none     : { mime: "text/html",
                        filter: gen_moduledocs_html
                      },
           compiled : { mime: "text/plain",
                        filter: sjscompile,
                        // filterETag() returns a tag that will be added onto
                        // the base file's modification date to derive an etag for
                        // the filtered file.
                        filterETag: -> conductanceVersionEtag,
                        // cache is an lru-cache object which caches requests to filtered
                        // files (requires presence of filterETag() ):
                        cache: SJSCache
                      },
           src      : { mime: "text/plain" },
          bundle    : { mime: "text/javascript",
                        filter: gen_sjs_bundle,
                        filterETag: gen_sjs_bundle_etag,
                      },
         },
    md       : { none : { mime: "text/html",
                          filter: gen_markdown_html
                        },
                 src  : { mime: "text/plain" },
    },
    app      : { none : { mime: "text/html",
                        filter: gen_app_html
                        },
                 sjs  : { mime: "text/plain",
                          filter: sjscompile,
                          filterETag: -> conductanceVersionEtag,
                          cache: SJSCache
                        },
                 bundle:{ mime: "text/javascript",
                          filter: gen_sjs_bundle,
                          filterETag: gen_sjs_bundle_etag,
                        },
                 src  : { mime: "text/plain" }
               },

  });
exports.Code = Code;

/**
  @function Jsonp
  @altsyntax base .. Jsonp
  @param {::FormatMap} [base]
  @summary return a copy of `base` with mappings for serving JSON files via jsonp
  @return {::FormatMap}
  @deprecated
*/
var Jsonp = (base) -> base
  .. withFormats({
    json: {
      jsonp    : { mime: "text/javascript", filter: json2jsonp }
    }
  });
exports.Jsonp = Jsonp;


/**
  @function Executable
  @altsyntax base .. Executable
  @param {::FormatMap} [base]
  @summary return a copy of `base` with mappings for serving trusted files
  @desc
    This function adds the following mappings in the returned [::FormatMap]:

       - .api, for SJS modules that are run only on the server and exported to the client

    You should never use these filters for locations containing untrusted or
    user-submitted content, as they enable arbitrary code execution on the server.
*/
var Executable = (base) -> base
  .. withFormats({
    api      : { none : { mime: "text/plain",
                          filter: apiimport
                        },
                 json : { mime: "application/json",
                          filter: apiinfo
                        }
               },
  });
exports.Executable = Executable;
