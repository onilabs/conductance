var fs     = require('sjs:nodejs/fs');
var nodefs = require('fs');
var stream = require('sjs:nodejs/stream');
var path = require('path');
var { override } = require('sjs:object');
var { each, any } = require('sjs:sequence');
var { debug, info, verbose } = require('sjs:logging');
var { BaseFileFormatMap } = require('./formats');
var { setStatus, writeRedirectResponse, writeErrorResponse } = require('./response');

//----------------------------------------------------------------------
// formatResponse:
// takes a `ServerRequest`, an `item` and a `settings` object
// formats item, and may write the item to the
// response. Returns whether the item was written.
//
// An item must contain the following keys:
//  - extension
//  - input (a stream of data)
//  - format
// Optionally:
//  - etag:  etag of the input stream
//  - apiid: (for api files; only if settings.allowApis == true)
function formatResponse(req, item, settings) {
  var { input, extension, format, apiid } = item;

  var filedesc = settings.formats[extension] || settings.formats["*"];
  if (!filedesc) {
    verbose("Don't know how to serve item with extension '#{extension}'");
    // XXX should we generate an error?
    return false;
  }

  var formatdesc = filedesc[format.name];
  if (!formatdesc && !format.mandatory)
    formatdesc = filedesc["none"];
  if (!formatdesc) {
    verbose("Can't serve item with extension '#{extension}' in format '#{format.name}'");
    // XXX should we generate an error?
    return false;
  }

  // try to construct an etag, based on the file's & (potential) filter's etag:
  var etag;
  if (item.etag) {
    if (formatdesc.filter && formatdesc.filterETag)
      etag = "\"#{formatdesc.filterETag()}-#{item.etag}\"";
    else if (!formatdesc.filter)
      etag = "\"#{item.etag}\"";
  }

  // check for etag match
  if (etag) {
    if (req.request.headers["if-none-match"]) {
      debug("If-None-Matched: #{req.request.headers['if-none-match']}");
      // XXX wrt '-gzip': Apache attaches this prefix to ETags. We remove it here
      // if present, so that we can run conductance behind an Apache reverse proxy.
      // Clearly this is hackish and not a good place for it :-/
      if (req.request.headers["if-none-match"].replace(/-gzip$/,'') == etag) {
        req .. setStatus(304);
        req.response.end();
        return true;
      }
      else {
        debug("#{req.url} outdated");
      }  
    }
    else {
      debug("#{req.url}: requested without etag");
    }
  }
  else {
    debug("no etag for #{req.url}");
  }

  // construct header:
  var contentHeader = formatdesc.mime ? {"Content-Type":formatdesc.mime} : {};
  if (etag)
    contentHeader["ETag"] = etag;
  
  if(formatdesc.filter) {
    // There is a filter function defined for this filetype.

    req .. setStatus(200, contentHeader);

    if (req.request.method == "GET") { // as opposed to "HEAD"
      if (formatdesc.cache && etag) {
        // check cache:
        var cache_entry = formatdesc.cache.get(req.request.url);
        if (!cache_entry || cache_entry.etag != etag) {
          var data_stream = new (stream.WritableStringStream);
          formatdesc.filter(input(), data_stream, { request: req, apiid: apiid });
          cache_entry = { etag: etag, data: data_stream.data };
          info("populating cache #{req.url} length: #{cache_entry.data.length}");
          formatdesc.cache.put(req.request.url, cache_entry, cache_entry.data.length);
        }
        // write to response stream:
        verbose("stream from cache #{req.url}");
        stream.pump(new (stream.ReadableStringStream)(cache_entry.data), req.response);
      }
      else // no cache or no etag -> filter straight to response
        formatdesc.filter(input(), req.response, { request: req, apiid: apiid });
    }
  } 
  else {
    // No filter function -> serve the file straight from disk

    if (item.length) {
      contentHeader["Content-Length"] = item.length;
      contentHeader["Accept-Ranges"] = "bytes";
    }
    var range;
    if (item.length && req.request.headers["range"] && 
        (range=/^bytes=(\d*)-(\d*)$/.exec(req.request.headers["range"]))) {
      // we honor simple range requests
      var from = range[1] ? parseInt(range[1]) : 0;
      var to = range[2] ? parseInt(range[2]) : item.length-1;
      to = Math.min(to, item.length-1);
      if (isNaN(from) || isNaN(to) || from<0 || to<from)
        req .. setStatus(416); // range not satisfiable
      else {
        contentHeader["Content-Length"] = (to-from+1);
        contentHeader["Content-Range"] = "bytes "+from+"-"+to+"/"+item.length;
        req .. setStatus(206, contentHeader);
        if (req.request.method == "GET") // as opposed to "HEAD"
          stream.pump(input({start:from, end:to}), req.response);
      }
    }
    else {
      // normal request
      req .. setStatus(200, contentHeader);

      if (req.request.method == "GET") // as opposed to "HEAD"
        stream.pump(input(), req.response);
    }
  }
  req.response.end();
  return true;
};

//----------------------------------------------------------------------
// directory listing server

function listDirectory(req, root, branch, format, settings) {
  
  var listing = {
    path: branch,
    directories: [],
    files: []
  };
  
  // add ".." unless we're listing the root
  if(branch != '/') {
    listing.directories.push("..");
  }

  fs.readdir(path.join(root, branch)) .. each {
    |filename|
    var filepath = path.join(root, branch, filename);

    if (fs.isDirectory(filepath)) {
      listing.directories.push(filename);
    }
    else if (fs.isFile(filepath)) {
      var size = fs.stat(filepath).size;
      listing.files.push({name: filename, size: size});
      if (settings.allowGenerators && path.extname(filename) === '.gen')
        listing.files.push({name: filename.substr(0, filename.length-4), generated: true });
    }
  }
  var listingJson = JSON.stringify(listing);
  return formatResponse(
    req,
    { input: -> new stream.ReadableStringStream(listingJson),
      extension: "/",
      format: format
    },
    settings);
}


//----------------------------------------------------------------------
// file serving

// attempt to serve the given file; return 'false' if not found or
// can't be served in the requested format
function serveFile(req, filePath, format, settings) {
  try {
    var stat = fs.stat(filePath);
  }
  catch (e) {
    return settings.allowGenerators ? generateFile(req, filePath, format, settings) : false;
  }
  if (!stat.isFile()) return false;
  
  var apiid;
  var extension = path.extname(filePath).slice(1);
  if (settings.allowApis && extension == 'api') {
    apiid = require('./api-registry').registerAPI(filePath);
    console.log("registered API #{filePath} -> #{apiid}");
  }

  return formatResponse(
    req,
    { input: opts ->
              // XXX hmm, might need to destroy this somewhere
              nodefs.createReadStream(filePath, opts),
      length: stat.size,
      apiid: apiid,
      extension: path.extname(filePath).slice(1),
      format: format,
      etag: stat.mtime.getTime()
    },
    settings);
}
exports.serveFile = serveFile;

function generateFile(req, filePath, format, settings) {
  try {
    var stat = fs.stat("#{filePath}.gen");
  }
  catch (e) {
    return false;
  }
  if (!stat.isFile()) return false;
  
  var generator_file_mtime = stat.mtime.getTime();

  var resolved_path = require.resolve("#{filePath}.gen").path;

  // purge module if it is loaded already, but the mtime doesn't match:
  var module_desc = require.modules[resolved_path];
  if (module_desc && module_desc.etag !== generator_file_mtime) {
    console.log("reloading generator file #{resolved_path}; mtime doesn't match");
    delete require.modules[resolved_path];
  }

  var generator = require(resolved_path);
  require.modules[resolved_path].etag = generator_file_mtime;

  return formatResponse(
    req,
    { input: -> new stream.ReadableStringStream(generator.content(req.url.queryKey)),
      extension: path.extname(filePath).slice(1),
      format: format,
//      length: generator.content().length,
      etag: "#{generator_file_mtime}-#{generator.etag ? generator.etag(req.url.queryKey) : Date.now()}",
    },
    settings);
}

//----------------------------------------------------------------------

// Maps a directory on disk into the server fs.
// - The 'pattern' regex under which the handler will be filed needs to
//   have capturing parenthesis around the relative path that will be mapped
//   e.g.:  pattern: /^/virtual_root(\/.*)?$/
// - 'root' is the absolute on-disk path prefix.
// - XXX settings
// - Can handle 'GET' or 'HEAD' requests
exports.MappedDirectoryHandler = function(root, settings) {

  settings = { mapIndexToDir:   true,
               allowDirListing: true,
               allowGenerators: true,
               allowApis:       true,
               formats: BaseFileFormatMap, 
             } .. 
    override(settings || {});

  function handler_func(matches, req) {
    var [relativePath, format]  = (matches[1] || '/').split('!');
    if (format !== undefined) 
      format = { name: format, mandatory: true };
    else
      format = { name: req.url.queryKey.format || 'none' };

    var file = relativePath ? path.join(root, relativePath) : root;
    if (process.platform == 'win32')
      file = file.replace(/\\/g, '/');

    if (fs.isDirectory(file)) {
      if (file[file.length-1] != '/') {
        // Make sure we have a canonical url with '/' at the
        // end. Otherwise relative links will break.
        var newUrl = "#{relativePath}/";
        if (format.mandatory)
          newUrl += "!#{format.name}";
        return req .. writeRedirectResponse(newUrl, 301); // moved permanently
      }
      // ... else
      var served = false;
      if (settings.mapIndexToDir) {
        served = ['index.html', 'index.app'] ..
          any(name -> serveFile(req, "#{file}/#{name}", format, settings));
      }
      if (!served) {
        if (settings.allowDirListing)
          served = listDirectory(req, root, relativePath, format, settings);
        if (!served) {
          info("Could not render '#{file}' in the requested format");
          req .. writeErrorResponse(406, 'Not Acceptable', 
                                    'Could not find an appropriate representation');
        }
      }
    }
    else {
      // a normal file
      if (!serveFile(req, file, format, settings)) {
        info("File '#{file}' not found");
        req .. writeErrorResponse(404, 'Not Found', "File '#{relativePath}' not found");
      }
    }
  }

  return { 
    "GET":  handler_func, 
    "HEAD": handler_func
  };
}

