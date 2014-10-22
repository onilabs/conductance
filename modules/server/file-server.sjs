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
  @nodoc
*/

var fs     = require('sjs:nodejs/fs');
var nodefs = require('fs');
var stream = require('sjs:nodejs/stream');
var path   = require('path');
var url    = require('sjs:url');
var logging = require('sjs:logging');
var { isString } = require('sjs:string');
var { override } = require('sjs:object');
var { each, any } = require('sjs:sequence');
var { debug, info, verbose } = require('sjs:logging');
var { StaticFormatMap } = require('./formats');
var { setStatus, setHeader, writeRedirectResponse, HttpError, NotFound } = require('./response');
var { _applyEtag } = require('./route');
var lruCache = require('sjs:lru-cache');

var Forbidden = -> HttpError(403, 'Forbidden', 'Invalid Path' );

function checkEtag(t) {
  if (!isString(t)) throw new Error("non-string etag: #{t}");
  return t;
}

// XXX this should be consolidated with the caching in formats.sjs
var generatorCache = lruCache.makeCache(10*1000*1000); // 10MB

//----------------------------------------------------------------------
// formatResponse:
// takes a `ServerRequest`, an `item` and a `settings` object
// formats item, and writes the item to the
// response, or, if no suitable representation is found, writes an error response
//
// An item must contain the following keys:
//  - filetype (usually the extension of the file being served, but can be overridden for *.gen files)
//  - input (a stream of data)
//  - format
// Optionally:
//  - etag:  etag of the input stream
//  - apiinfo: (for api files; only if settings.allowApis == true)
function formatResponse(req, item, settings) {
  var { input, filePath, filetype, format, apiinfo } = item;

  var notAcceptable = HttpError(406, 'Not Acceptable',
                                'Could not find an appropriate representation');
  var filedesc = settings.formats[filetype] || settings.formats["*"];
  if (!filedesc) {
    verbose("Don't know how to serve item of type '#{filetype}'");
    throw notAcceptable;
  }

  var formatdesc = filedesc[format.name];
  if (!formatdesc && !format.mandatory)
    formatdesc = filedesc["none"];
  if (!formatdesc) {
    info("Can't serve item of type '#{filetype}' in format '#{format.name}'");
    throw notAcceptable;
  }

  // try to construct an etag, based on the file's & (potential) filter's etag:
  var etag;
  if (item.etag) {
    if (formatdesc.filter && formatdesc.filterETag)
      etag = "\"#{formatdesc.filterETag(req, filePath) .. checkEtag}-#{item.etag .. checkEtag}\"";
    else if (!formatdesc.filter)
      etag = "\"#{item.etag .. checkEtag}\"";
  }

  if (_applyEtag(req, etag)) {
    // sent 304; no further action needed
    return;
  }

  // construct header:
  if (formatdesc.mime) req .. setHeader("Content-Type", formatdesc.mime);
  if (formatdesc.expires) req .. setHeader("Expires", formatdesc.expires().toUTCString());
  if(formatdesc.filter) {
    // There is a filter function defined for this filetype.

    req .. setStatus(200);

    if (req.request.method == "GET") { // as opposed to "HEAD"
      if (formatdesc.cache && etag) {
        // check cache:
        var cache_entry = formatdesc.cache.get(req.request.url);
        if (!cache_entry || cache_entry.etag != etag) {
          var data_stream = new (stream.WritableStringStream);
          formatdesc.filter(input(), data_stream, { request: req, apiinfo: apiinfo });
          cache_entry = { etag: etag, data: data_stream.data };
          info("populating cache #{req.url} length: #{cache_entry.data.length}");
          formatdesc.cache.put(req.request.url, cache_entry, cache_entry.data.length);
        }
        // write to response stream:
        verbose("stream from cache #{req.url}");
        stream.pump(new (stream.ReadableStringStream)(cache_entry.data), req.response);
      }
      else // no cache or no etag -> filter straight to response
        formatdesc.filter(input(), req.response, { request: req, apiinfo: apiinfo });
    }
  } 
  else {
    // No filter function -> serve the file straight from disk

    if (item.length) {
      req .. setHeader("Content-Length", item.length);
      req .. setHeader("Accept-Ranges", "bytes");
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
        req .. setHeader("Content-Length", (to-from+1));
        req .. setHeader("Content-Range", "bytes "+from+"-"+to+"/"+item.length);
        req .. setStatus(206);
        if (req.request.method == "GET") // as opposed to "HEAD"
          stream.pump(input({start:from, end:to}), req.response);
      }
    }
    else {
      // normal request
      req .. setStatus(200);

      if (req.request.method == "GET") // as opposed to "HEAD"
        stream.pump(input(), req.response);
    }
  }
  req.response.end();
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
  if(branch && branch !== '/') {
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
  formatResponse(
    req,
    { input: -> new stream.ReadableStringStream(listingJson, true),
      filetype: "/",
      format: format
    },
    settings);
}


//----------------------------------------------------------------------
// file serving

// attempt to serve the given file; return 'false' if not found
function serveFile(req, filePath, format, settings) {
  try {
    var stat = fs.stat(filePath);
  }
  catch (e) {
    return settings.allowGenerators ? generateFile(req, filePath, format, settings) : false;
  }
  if (!stat.isFile()) return false;
  
  var apiinfo;
  var extension = path.extname(filePath).slice(1);
  if (settings.allowGenerators && extension == 'gen') {
    return false;
  }

  if (settings.allowApis && extension == 'api' && format.name == 'json') {
    try {
      var apiid = require('./api-registry').registerAPI(filePath .. url.fileURL);
      logging.info("registered API #{filePath} -> #{apiid}");
      apiinfo = {id: apiid};
    } catch(e) {
      apiinfo = {error: String(e) }
    }
  }

  formatResponse(
    req,
    { input: opts ->
              // XXX hmm, might need to destroy this somewhere
              nodefs.createReadStream(filePath, opts),
      filePath: filePath,
      length: stat.size,
      apiinfo: apiinfo,
      filetype: extension,
      format: format,
      etag: settings.etag(stat, filePath),
    },
    settings);
  return true;
}
exports.serveFile = serveFile;

function generateFile(req, filePath, format, settings) {
  var genPath = filePath + ".gen";
  try {
    var stat = fs.stat(genPath);
    genPath = fs.realpath(genPath);
  }
  catch (e) {
    return false;
  }
  if (!stat.isFile()) return false;
  
  var generator_file_mtime = stat.mtime.getTime();

  var resolved_path = require.resolve(genPath .. url.fileURL).path;

  // purge module if it is loaded already, but the mtime doesn't match:
  var module_desc = require.modules[resolved_path];
  if (module_desc && module_desc.etag !== generator_file_mtime) {
    logging.verbose("reloading generator file #{resolved_path}; mtime doesn't match");
    delete require.modules[resolved_path];
  }

  var generator = require(resolved_path);
  if (!generator.content) throw new Error("Generator #{filePath} has no `content` method");

  if (!require.modules[resolved_path])
    throw new Error("Module at #{resolved_path} not populated in require.modules");

  require.modules[resolved_path].etag = generator_file_mtime;
  var etag = generator.etag;
  var params = req.url.params();
  etag = "#{generator_file_mtime}-#{etag ? checkEtag(etag.call(req, params)) : Date.now()}";

  formatResponse(
    req,
    {
      input: function() {
        // check cache: 
        // XXX this caching functionality should move to formats.sjs
        var cache_entry = generatorCache.get(req.request.url);
        if (!cache_entry || cache_entry.etag !== etag) {
          var data = generator.content.call(req, params);
          if (!isString(data) && data.read) {
            data = stream.readAll(data);
          }
          cache_entry = { etag: etag, data: data }
          generatorCache.put(req.request.url, cache_entry, cache_entry.data.length);
        }

        return new stream.ReadableStringStream(cache_entry.data, true);
      },
      
      filetype: generator.filetype ? generator.filetype : path.extname(filePath).slice(1),
      format: format,
//      length: generator.content().length,
      etag: etag,
    },
    settings);
  return true;
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

  // NOTE: these settings MUST be safe by default, suitable for
  // serving untrusted files.
  // ExecutableDirectory and CodeDirectory will selectively enable more dynamic
  // (and less safe) behaviour.
  
  root = path.normalize(root);

  settings = { mapIndexToDir:   true,
               allowDirListing: true,
               allowGenerators: false,
               allowApis:       false,
               context:         null,
               formats: StaticFormatMap,
               etag: null,
             } ..
    override(settings || {});

  if (!settings.etag) {
    settings.etag = defaultEtagFormatter(root);
  }

  function handler_func(req, matches) {
    req.context = settings.context;
    var relativeURI = req.url.path;
    var [relativePath, format] = matches.input.slice(matches.index + matches[0].length).split('!');
    var relativePath = decodeURIComponent(relativePath);

    if (format !== undefined)
      format = { name: format, mandatory: true };
    else
      format = { name: req.url.params().format || 'none' };


    var file = relativePath ? path.join(root, relativePath) : root;

    if (file.indexOf(root) !== 0) {
      throw Forbidden();
    }

    if (process.platform == 'win32')
      file = file.replace(/\\/g, '/');

    if (fs.isDirectory(file)) {
      if (relativeURI && relativeURI[relativeURI.length-1] != '/') {
        // Make sure we have a canonical url with '/' at the
        // end. Otherwise relative links will break.
        var newUrl = "#{relativeURI}/";
        if (format.mandatory)
          newUrl += "!#{format.name}";
        return req .. writeRedirectResponse(newUrl, 302); // moved temporarily
      }
      // ... else
      var served = false;
      if (settings.mapIndexToDir) {
        served = ['index.html', 'index.app'] ..
          any(name -> serveFile(req, path.join(file, name), format, settings));
      }
      if (!served) {
        if (settings.allowDirListing)
          listDirectory(req, root, relativePath, format, settings);
      }
    }
    else {
      // a normal file
      if (!serveFile(req, file, format, settings)) {
        info("File '#{file}' not found");
        throw NotFound('Not Found', "File '#{relativePath}' not found");
      }
    }
  }

  return {
    "GET":  handler_func,
    "HEAD": handler_func
  };
}

// guesses the best etag strategy for directory `root`
var defaultEtagFormatter = function(root) {
  var st;
  try {
    st = fs.stat(root);
  } catch(e) { /* probably enoent */ }
  if (st) {
    if (st.mtime.getTime() <= 1000) {
      // mtimes are probably not meaningful (e.g nix store)
      return exports.etag.fileIdentity;
    }
  }
  return exports.etag.mtime;
};

exports.etag = {};
exports.etag.mtime = function(st) {
  return st.mtime.getTime() .. String;
};

exports.etag.fileIdentity = function(st) {
  return "#{st.mtime.getTime()}-#{st.dev}-#{st.ino}";
};
