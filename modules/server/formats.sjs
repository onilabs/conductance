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
  var [template, metadata] = docutil.getPrefixedProperties('template');
  if (!template) template = 'default';
  var externalScripts = metadata['externalScript'];
  if (externalScripts) {
    if (Array.isArray(externalScripts)) {
      documentSettings.externalScripts = documentSettings.externalScripts.concat(externalScripts);
    } else {
      documentSettings.externalScripts.push(externalScripts);
    }
  }

  var { Document, loadTemplate } = require('../surface');
  dest.write(
    Document(null, documentSettings .. merge({
      template: loadTemplate(template || 'default', aux.request.url.source),
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
  var listing = require('../server-ui/dirlisting').generateDirListing(JSON.parse(readAll(src)));

  dest.write(require('../surface').Document(listing));
}

//----------------------------------------------------------------------
// filter that generates docs for an sjs module:
function gen_moduledocs_html(src, dest, aux) {
  var docs = require('../server-ui/moduledocs').generateModuleDocs(aux.request.url.path, readAll(src));
  dest.write(require('../surface').Document(docs));
}


//----------------------------------------------------------------------
// filter that generates import sjs for an api:
function apiimport(src, dest, aux) {
  var serverRoot = Url.normalize('/', aux.request.url);
  dest.write("\
var server = require('builtin:apollo-sys').hostenv !== 'xbrowser' ? #{JSON.stringify(serverRoot)};
waitfor {
  var bridge = require('mho:rpc/bridge');
} and {
  var http = require('sjs:http');
} and {
  var object = require('sjs:object');
}
exports.connect = function(opts, block) {
  if (arguments.length == 1) {
    block = opts;
    opts = {};
  }
  opts = object.clone(opts);

  if (!opts.server) opts.server = server;
  if (!opts.disconnectHandler) opts.disconnectHandler = bridge.AutoReconnect();
  var apiinfo = http.json([module.id, {format:'json'}]);
  if (apiinfo.error) throw new Error(apiinfo.error);
  var rv;
  bridge.connect(apiinfo.id, opts) {|connection|
    rv = block(connection.api, connection);
  }
  return rv;
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
  var docs = require('../server-ui/markdownfile').generateMarkdown(readAll(src));
  dest.write(require('../surface').Document(docs));
}

//----------------------------------------------------------------------

/**
  @variable StaticFormatMap
  @summary a format map appropriate for serving untrusted, static files.
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
};

// TODO: export this?
var withFormats = function(map, extensions) {
  var rv = clone(map);
  extensions .. ownPropertyPairs .. each {|[extension, formats]|
    rv[extension] = merge(rv[extension], formats);
  }
  return rv;
}

/**
  @function Code
  @summary return a copy of `base` with mappings for serving application code
  @desc
    This function enables:
     - server-side compilation of .sjs files
     - serving .sjs files as HTML module documentation content
*/
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
                        filterETag: -> env.conductanceVersion(),
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
  });
exports.Code = Code;

/**
  @function Jsonp
  @summary return a copy of `base` with mappings for serving JSON files via jsonp
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
  @summary return a copy of `base` with mappings for serving trusted files
  @desc
    Adds:
       - .api, for SJS modules that are run only on the server and exported to the client
       - .app, as SJS apps executed on the client
       - .md, for rendering as HTML

    Note that the source of .api files is accessible via the `src` format.

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
                          filterETag: -> env.conductanceVersion(),
                          cache: SJSCache
                        },
                 bundle:{ mime: "text/javascript",
                          filter: gen_sjs_bundle,
                          filterETag: gen_sjs_bundle_etag,
                        },
                 src  : { mime: "text/plain" }
               },
  });
exports.Executable = Executable;
