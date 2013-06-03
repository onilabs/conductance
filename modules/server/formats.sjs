var { conductanceVersion } = require('./env');
var { pump, readAll } = require('sjs:nodejs/stream');
var { map, toArray } = require('sjs:sequence');

// XXX this should be configurable separately somewhere
var SJSCache = require('sjs:lru-cache').makeCache(10*1000*1000); // 10MB

//----------------------------------------------------------------------
// filters XXX these should maybe go in their own module

//----------------------------------------------------------------------
// helper filter to wrap a file in a jsonp response:
function json2jsonp(src, dest, aux) {
  var callback = aux.request.url.queryKey['callback'];
  if (!callback) callback = "callback";
  dest.write(callback + "(");
  pump(src, dest);
  dest.write(")");
}

//----------------------------------------------------------------------
// filter that compiles sjs into '__oni_compiled_sjs_1' format:
function sjscompile(src, dest, aux) {
  src = readAll(src);
  try {
    src = __oni_rt.c1.compile(src, {globalReturn:true, filename:"__onimodulename"});
  }
  catch (e) {
    console.log("sjscompiler: #{aux.request.url} failed to compile at line #{e.compileError.line}: #{e.compileError.message}");
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
  dest.write(
    "<!DOCTYPE html>
     <html>
       <head>
         <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
         <meta name='viewport' content='width=device-width, initial-scale=1.0'>
         <script src='/__sjs/oni-apollo.js'></script>
         <script type='text/sjs'>
           require.hubs.push(['mho:', '/__mho/']);
           require.hubs.push(['\u2127:', 'mho:']);
           require('#{app_name}!sjs');
         </script>
       </head>
       <body></body>
     </html>");
}

//----------------------------------------------------------------------
// filter that generates html for a directory listing:
function gen_dir_html(src, dest, aux) {
  // src is json:
  var dir = JSON.parse(readAll(src));
  // XXX shoud this preserve !format fragment when linking to other directories?
  var header = "<h1>Contents of " + dir.path + "</h1>";
  var folderList = dir.directories .. 
    map(d ->
        //XXX xml escaping!
        "<li><a href=\"" + d + "/\">" + d + "/</a></li>") ..
    toArray;

  var fileList = dir.files ..
    map(function(f) {
      var desc;
      if (f.generated) {
        desc = 'generated';
      }
      else if (f.size < 1024)
        desc = f.size + " B";
      else if (f.size < 1024 * 1024)
        desc = Math.round(f.size/1024*10)/10+ " kB";
      else
        desc = Math.round(f.size/1024/1024*10)/10+ " MB";
      
      return "<li><a href='#{f.name}'>#{f.name}</a> (#{desc})</li>";
    }) ..
    toArray;

  dest.write("#{header}<ul>#{folderList.join("\n")}#{fileList.join("\n")}</ul>");
}

//----------------------------------------------------------------------
// filter that generates import sjs for an api:
function apiimport(src, dest, aux) {
  if (!aux.apiid) 
    throw new Error("API access not enabled");
  dest.write("\
var bridge = require('mho:rpc/bridge');
var api    = bridge.connect('#{aux.apiid}').api;
exports.api = api;
");
}

//----------------------------------------------------------------------

var BaseFileFormatMap = {
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
           jsonp: { mime: "text/javascript",
                    filter: json2jsonp }
         },
  sjs  : { none     : { mime: "text/plain" }, 
           compiled : { mime: "text/plain",
                        filter: sjscompile,
                        // filterETag() returns a tag that will be added onto 
                        // the base file's modification date to derive an etag for
                        // the filtered file.
                        filterETag: -> conductanceVersion(),
                        // cache is an lru-cache object which caches requests to filtered
                        // files (requires presence of filterETag() ):
                        cache: SJSCache
                      },
           src      : { mime: "text/plain" },
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
  app  : { none     : { mime: "text/html",
                        filter: gen_app_html
                      },
           sjs      : { mime: "text/plain",
                        filter: sjscompile,
                        filterETag: -> conductanceVersion(),
                        cache: SJSCache
                      },
           src      : { mime: "text/plain" }
         },
  api  : { none     : { mime: "text/plain",
                        filter: apiimport
                      },
           src      : { mime: "text/plain" }
         }
};
exports.BaseFileFormatMap = BaseFileFormatMap;
