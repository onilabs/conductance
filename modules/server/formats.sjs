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
  @summary File-format configuration for the conductance server
  @hostenv nodejs
*/

@ = require([
  'sjs:std', 
  {id:'../env', name: 'env'},
  {id:'./generator', include: ['CachedBundle']},
  {id:'sjs:lru-cache', name:'lruCache'},
  {id:'./routed-directory', name: 'routed_directory'}
]);

// XXX this should be configurable separately somewhere
// XXX see also the separate *.gen caching in file-server.sjs
var SJSCache = @lruCache.makeCache(10*1000*1000); // 10MB
var bundleCache = @lruCache.makeCache(10*1000*1000); // 10MB

//----------------------------------------------------------------------
// filters XXX these should maybe go in their own module

//----------------------------------------------------------------------
// filter that compiles sjs into '__oni_compiled_sjs_1' format:
var COMPILED_SRC_TAG = "/*__oni_compiled_sjs_1*/";
var COMPILED_SRC_TAG_REGEX = /^\/\*\__oni_compiled_sjs_1\*\//;

function sjscompile(src, aux) {
  if (typeof src !== 'string') src = String(src .. @join());
  __js if (!COMPILED_SRC_TAG_REGEX.exec(src)) {
    try {
      src = COMPILED_SRC_TAG + __oni_rt.c1.compile(src, {globalReturn:true, filename:"__onimodulename"});
    }
    catch (e) {
      @error("sjscompiler: #{aux.request.url} failed to compile at line #{e.compileError.line}: #{e.compileError.message}");
      // communicate the compilation error to the caller in a little bit
      // of a round-about way: We create a compiled SJS file that throws
      // our compile error as an exception on execution
      var error_message =
        "'SJS syntax error in \\''+__onimodulename+'\\' at line #{e.compileError.line}: #{e.compileError.message.toString().replace(/\'/g, '\\\'')}'";
      src = COMPILED_SRC_TAG + __oni_rt.c1.compile("throw new Error(#{error_message});", {globalReturn:true, filename:"'compilation@rocket_server'"});
    }
  }
//  else {
//    console.log("#{aux.request.url} already compiled:", src);
//  }
  return [src];
}

//----------------------------------------------------------------------
// filter that generates the html boilerplate for *.app files:
function gen_app_html(src, aux) {
  var app_name = aux.appurl || aux.request.url.file || "index.app";

  var documentSettings = {
    init: "require(\"#{app_name}!sjs\");",
    externalScripts: [],
  };
  var docutil = require('sjs:docutil');
  var docs = docutil.parseModuleDocs(@decode(src .. @join(''), 'utf-8'));

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

  if (docs['no-bundle'] .. docutil.toBool !== true) {
      documentSettings.externalScripts.push("#{aux.appurl || app_name}!bundle");
  }

  var { Document, loadTemplate } = require('../surface');
  var d = Document(null, documentSettings .. @merge({
    template: loadTemplate(template, aux.filepath .. @url.fileURL),
    templateData: metadata,
    title: metadata.title,
  }));
  return [d];
}

//----------------------------------------------------------------------
// filter that generates a .js bundle from a source module
var {gen_sjs_bundle, gen_sjs_bundle_etag} = (function() {
  function getSettings(path, url) {
    var pathUrl = path .. @url.fileURL;
    var defaultSettings = {
      resources: [
        // Assume relative paths are co-located.
        // This will not work if .app files import paths from their parent,
        // but we can't handle that in the general case without deep knowledge of routes.
        [@url.normalize('./', pathUrl), @url.normalize('./', url.source)],
      ],
      skipFailed: false,
      compile: true
    };
    var appSettings = @env.get('bundleSettings', defaultSettings);
    var docutil = require('sjs:docutil');

    var [_, sourceSettings] = @fs.readFile(path)
      .. docutil.parseModuleDocs()
      .. docutil.getPrefixedProperties('bundle');

    var settings = appSettings .. @merge(sourceSettings, { sources: [pathUrl] });
    return settings;
  };

  var bundleAccessor = function(path) {
    @assert.ok(path);
    var get = bundleCache.get(path);
    if (!get) {
      // serialize requests for the given path, as we don't
      // want to regenerate the same bundle in parallel
      get = (function() {
        var b;
        return @fn.sequential(function(url) {
          if (!b) {
            b = @CachedBundle(getSettings(path, url));
          } else if (b.isStale(false)) {
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
    gen_sjs_bundle: function(src, aux) {
      var getBundle = bundleAccessor(aux.filepath);
      var bundle = getBundle(aux.request.url);
      var content = bundle.content();
      // overwrite cache entry each time to update cache length
      bundleCache.put(aux.filepath, getBundle, content.length);
      return [content];
    },
    gen_sjs_bundle_etag: function(request, filePath) {
      return bundleAccessor(filePath)(request.url).etag();
    },
  };
})();

//----------------------------------------------------------------------
// filter that generates html for a directory listing:
function gen_dir_html(src, aux) {
  // TODO src needs to be ascii encoding
  var listing = require('../server-ui/dir-listing').generateDirListing(JSON.parse(src .. @join('')));
  var d = require('../surface').Document(listing);
  return [d];
}

//----------------------------------------------------------------------
// filter that generates docs for an sjs module:
function gen_moduledocs_html(src, aux) {
  var docs = require('../server-ui/module-doc').generateModuleDoc(aux.request.url.path, @decode(src .. @join(''), 'utf-8'));
  var d = require('../surface').Document(docs);
  return [d];
}


//----------------------------------------------------------------------
// filter that generates import sjs for an api:
function apiimport(src, aux) {
  return ["\
exports.connect = function(opts, session_f) {
  var bridge = require('mho:rpc/bridge');
  if (typeof(opts) == 'function') {
    session_f = opts;
    opts = null;
  }
  if (session_f) {
    bridge.connect(module.id, opts) {
      |connection|
      session_f(connection.api);
    }
  }
  else {
    waitfor (var rv) {
      @require('sjs:sys').spawn(function() {
        try {
          bridge.connect(module.id, opts) { 
            |connection| 
            resume(connection.api);
            hold();
          }
        }
        catch(e) { console.log('API '+module.id+' uncaught: ',e); }
      });
    }
    return rv;
  }
};
"];
}

// filter that generates JSON info about api endpoint:
function apiinfo(src, aux) {
  if (!aux.apiinfo)
    throw new Error("API access not enabled");
  return [JSON.stringify(aux.apiinfo())];
}

// filter that generates a safe version of the api's source code:
// (extracting just the comments)
function apisrc(src, aux) {
  var docutil = require('sjs:docutil');
  var comments = [];
  // TODO what if src is a Buffer?
  docutil.parseSource(src .. @join('')) {
    |comment|
    // extract only comments beginning with '/**'
    if (comment .. @startsWith('/**'))
      comments.push(comment);
  }
  comments.unshift('/* SOURCE CODE REDACTED */');
  return [comments .. @join('\n')];
}

//----------------------------------------------------------------------
// filter that generates html for markdown (*.md) files:
function gen_markdown_html(src, aux) {
  var docs = require('../server-ui/markdown-file').generateMarkdown(@decode(src .. @join(''), 'utf-8'));
  var d = require('../surface').Document(docs);
  return [d];
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
                    filter: gen_dir_html,
                    compress: true
                  },
           json : { mime: "application/json",
                    compress: true
                  }
         },
  html : { none : { mime: "text/html",  compress: true },
           src  : { mime: "text/plain", compress: true }
         },
  js   : { none : { mime: "text/javascript", compress: true },
           src  : { mime: "text/plain", compress: true }
         },
  json : { none : { mime: "application/json", compress: true },
           src  : { mime: "text/plain", compress: true },
         },
  sjs  : { none : { mime: "text/plain", compress: true },
         },
  xml  : { none : { mime: "text/xml", compress: true },
           src  : { mime: "text/plain", compress: true }
         },
  png  : { none : { mime: "image/png" } },
  jpg  : { none : { mime: "image/jpeg" } },
  gif  : { none : { mime: "image/gif" } },
  mp4  : { none : { mime: "video/mp4" } },
  wav  : { none : { mime: "audio/wav" } },
  svg  : { none : { mime: "image/svg+xml", compress: true } },
  txt  : { none : { mime: "text/plain", compress: true } },
  css  : { none : { mime: "text/css", compress: true },
           src  : { mime: "text/plain", compress: true },
         },
  "*"  : { none : { /* serve without mimetype */ }
         },
  app  : { none : { mime: "text/plain", compress: true } },
  api  : { none : { mime: "text/plain", compress: true } },
  md   : { none : { mime: "text/plain", compress: true } },

  ttf  : { none : { mime: "application/font-ttf",
                    // give fonts an expiry of access + 1 month:
                    expires: -> new Date(Date.now() + 1000*60*60*24*30)
                  }
         },
  woff : { none : { mime: "application/font-woff",
                    // give fonts an expiry of access + 1 month:
                    expires: -> new Date(Date.now() + 1000*60*60*24*30)
                  }
         },
  woff2 : { none : { mime: "application/font-woff2",
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
  var rv = @clone(map);
  extensions .. @ownPropertyPairs .. @each {|[extension, formats]|
    rv[extension] = @merge(rv[extension], formats);
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

    .api/.REST/.gen files will be served non-executable and with their source code
    redacted (only documentation comments will be returned).

    #### Warning

    You should never use these filters for locations containing untrusted or
    user-submitted code.
    Certain module features (e.g. app-file bundling - see [#features/app-file::@no-bundle]) could be used 
    to expose sensitive content from the server in some circumstances.

*/
var conductanceVersionEtag = "#{@env.conductanceVersion()}-#{@env.compilerStamp()}";
var Code = (base) -> base
  .. withFormats({
    sjs: { none     : { mime: "text/html",
                        filter: gen_moduledocs_html,
                        compress: true
                      },
           compiled : { mime: "text/plain",
                        filter: sjscompile,
                        // filterETag() returns a tag that will be added onto
                        // the base file's modification date to derive an etag for
                        // the filtered file.
                        filterETag: -> conductanceVersionEtag,
                        // cache is an lru-cache object which caches requests to filtered
                        // files (requires presence of filterETag() ):
                        cache: SJSCache,
                        compress: true
                      },
           src      : { mime: "text/plain", compress: true },
           bundle   : { mime: "text/javascript",
                        filter: gen_sjs_bundle,
                        filterETag: gen_sjs_bundle_etag,
                        compress: true
                      },
         },
    md       : { none : { mime: "text/html",
                          filter: gen_markdown_html,
                          compress: true
                        },
                 src  : { mime: "text/plain", compress: true },
    },
    app      : { none : { mime: "text/html",
                          filter: gen_app_html,
                          compress: true
                        },
                 sjs  : { mime: "text/plain",
                          filter: sjscompile,
                          filterETag: -> conductanceVersionEtag,
                          cache: SJSCache,
                          compress: true
                        },
                 bundle:{ mime: "text/javascript",
                          filter: gen_sjs_bundle,
                          filterETag: gen_sjs_bundle_etag,
                          compress: true
                        },
                 src  : { mime: "text/plain", compress: true }
               },
    api      : { none : { mime: "text/plain",
                          filter: apisrc,
                          compress: true
                        }
               },
    REST     : { none: { mime: "text/plain",
                         filter: apisrc,
                         compress: true
                       }
               },
    gen      : { none: { mime: "text/plain",
                         filter: apisrc,
                         compress: true
                       }
               }
  });
exports.Code = Code;


/**
  @function Executable
  @altsyntax base .. Executable
  @param {::FormatMap} [base]
  @summary return a copy of `base` with mappings for serving trusted files
  @desc
    This function adds the following mappings in the returned [::FormatMap]:

       - .api, for SJS modules that are run only on the server and exported to the client

    Note that the redacted source (only documentation comments) of .api files is
    accessible via the `src` format.
    Similarly, the redacted source of .gen and .REST files is accessible when these files are 
    accessed directly (e.g. a request to foo.REST rather than foo)

    #### Warning

    You should never use these filters for locations containing untrusted or
    user-submitted content, as they enable arbitrary code execution on the server.
*/
var Executable = (base) -> base
  .. withFormats({
    api      : { none : { mime: "text/plain",
                          filter: apiimport,
                          compress: true
                        },
                 json : { mime: "application/json",
                          filter: apiinfo,
                          compress: true
                        },
                 src  : { mime: "text/plain",
                          filter: apisrc,
                          compress: true
                        }
               },
    REST     : { none: { mime: "text/plain",
                         filter: apisrc,
                         compress: true
                       }
               },
    gen      : { none: { mime: "text/plain",
                         filter: apisrc,
                         compress: true
                       }
               }
  });
exports.Executable = Executable;

/**
  @function Routed
  @altsyntax base .. Routed
  @param {::FormatMap} [base]
  @summary return a copy of `base` with mappings for serving a 'routed frontend directory'
  @desc
    This function is part of a new experimental 'routed frontend directories' feature; see ; see [mho:server/routed-directory::RoutedFrontendDirectory]

    This function adds the following mappings in the returned [::FormatMap]:

       - .page, .container: For pages and containers that will be routed automatically on the client-side with [mho:surface/navigation::RoutingTable]
       - .yaml!bundle: For serving the bundle associated with the routed frontend, as specified in the frontend-config.yaml file

    #### Warning

    You should never use these filters for locations containing untrusted or
    user-submitted content, as they enable arbitrary code execution on the server.
*/
var Routed = (base) -> base ..
  withFormats({
    page:      { none     : { mime: "text/html",
                              filter: @routed_directory.gen_routed_page,
                              compress: true
                            },
                 compiled : { mime: "text/plain",
                              filter: sjscompile,
                              compress: true
                            }
               },
    container: { none     : { mime: "text/html",
                              compress: true
                            },
                 compiled : { mime: "text/plain",
                              filter: sjscompile,
                              compress: true
                            }
               },
    yaml:      { 
                 // XXX this is a bit hackish; we actually only want this bundled representation for one file:
                 // frontend-config.yaml
                 bundle   : { mime: "text/javascript",
                              filter: @routed_directory.gen_frontend_bundle,
                              filterETag: @routed_directory.gen_frontend_bundle_etag,
                              compress: true
                            }
               }
  });
exports.Routed = Routed;
