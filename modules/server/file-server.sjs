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
var gzip   = require('sjs:nodejs/gzip');
var path   = require('path');
var url    = require('sjs:url');
var logging = require('sjs:logging');
var { isString } = require('sjs:string');
var { override, hasOwn } = require('sjs:object');
var { each, any, join, Stream, isSequence, toStream, toArray, concat, slice } = require('sjs:sequence');
var { debug, info, verbose } = require('sjs:logging');
var { StaticFormatMap } = require('./formats');
var { setStatus, setHeader, setDefaultHeader, writeRedirectResponse, HttpError, NotFound } = require('./response');
var { _applyEtag } = require('./route');
var lruCache = require('sjs:lru-cache');

var Forbidden = -> HttpError(403, 'Forbidden', 'Invalid Path' );

__js function checkEtag(t) {
  if (!isString(t)) throw new Error("non-string etag: #{t}");
  return t;
}

// http://tools.ietf.org/html/rfc2616#section-3.9
__js function isQvalue(s) {
  return /^(?:1(?:\.0{0,3})?|0(?:\.[0-9]{0,3})?)$/.test(s);
}

__js function canCompressFormat(encodings, format) {
  return encodings[format] != null && encodings[format] > 0;
}

// http://tools.ietf.org/html/rfc2616#section-14.3
// TODO should handle identity;q=0 and *;q=0
// TODO should more specific things like gzip;q=1 take precedence over *;q=0 ?
__js function canCompress(headers, format) {
  var encodings = { 'identity': 1 };
  var accept    = headers['accept-encoding'];

  if (accept != null) {
    accept.split(/ *, */) ..each(function (s) {
      var a = /^([^ ;]+) *(?:; *q *= *([\d\.]+))?$/.exec(s);
      // TODO should set status code to 406 if this is null
      if (a !== null) {
        var encoding = a[1];
        var qvalue   = a[2];

        if (qvalue == null) {
          encodings[encoding] = 1;

        // TODO should set status code to 406 if this is false
        } else if (isQvalue(qvalue)) {
          encodings[encoding] = +qvalue;
        }
      }
    });
  }

  return canCompressFormat(encodings, format) ||
         canCompressFormat(encodings, '*');
}

function compress(req, format, input) {
  if (format.compress && canCompress(req.request.headers, 'gzip')) {
    req ..setHeader('Content-Encoding', 'gzip');
    return gzip.compress(input);
  } else {
    return input;
  }
}

function range_output(req, buffer, from, to) {
  to = Math.min(to, buffer.length - 1);

  if (from < 0 || from > to || from >= buffer.length) {
    range_error(req, buffer);
  } else {
    var output = buffer.slice(from, to + 1);
    req .. setHeader("Content-Length", "" + (to - from + 1));
    req .. setHeader("Content-Range", "bytes #{from}-#{to}/#{buffer.length}");
    req .. setStatus(206);
    stream.pump(output, req.response);
  }
}

function range_error(req, buffer) {
  req .. setHeader("Content-Range", "bytes */#{buffer.length}");
  req .. setStatus(416);
  req.response.end();
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
//  - apiinfo: function returning API info object (for api files; only if settings.allowApis == true)
//  - appurl: name of app module (for use with _.app wildcard apps)
function formatResponse(req, item, settings) {
  var { input, filePath, filetype, format, apiinfo, appurl } = item;

  if (req.request.method !== "GET" && req.request.method !== "HEAD") {
    throw HttpError(405, "Method not allowed");
  }

  var notAcceptable = HttpError(406, 'Not Acceptable',
                                'Could not find an appropriate representation');

  var filedesc = settings.formats[filetype] || settings.formats["*"];
  if (!filedesc) {
    verbose("Don't know how to serve item of type '#{filetype}'");
    throw notAcceptable;
  }

  var formatdesc = filedesc[format.name];
  if (!formatdesc && !format.mandatory) {
    formatdesc = filedesc["none"];
  }
  if (!formatdesc) {
    info("Can't serve item of type '#{filetype}' in format '#{format.name}'");
    throw notAcceptable;
  }

  // try to construct an etag, based on the file's & (potential) filter's etag:
  var etag;
  if (item.etag) {
    if (formatdesc.filter && formatdesc.filterETag) {
      etag = "\"#{formatdesc.filterETag(req, filePath) .. checkEtag}-#{item.etag .. checkEtag}\"";
    } else if (!formatdesc.filter) {
      etag = "\"#{item.etag .. checkEtag}\"";
    }
  }

  if (_applyEtag(req, etag)) {
    // sent 304; no further action needed
    return;
  }

  if (etag) {
    req .. setDefaultHeader('Cache-control', 'must-revalidate');
  } else {
    // no etag given, assume dynamic
    req .. setDefaultHeader('Cache-control', 'no-cache');
  }
  req .. setDefaultHeader('Vary', 'Accept-encoding');

  var output = null;
  var status = 200;

  // construct header:
  if (formatdesc.mime) req .. setDefaultHeader("Content-Type", formatdesc.mime);
  if (formatdesc.expires) req .. setDefaultHeader("Expires", formatdesc.expires().toUTCString());

  if (req.request.method === "GET") { // as opposed to "HEAD"
    // There is a filter function defined for this filetype.
    if (formatdesc.filter) {
      if (formatdesc.cache && etag) {
        // check cache:
        var cache_entry = formatdesc.cache.get(req.request.url);

        if (!cache_entry || cache_entry.etag != etag) {
          output = formatdesc.filter(input(), { request: req, apiinfo: apiinfo, appurl: appurl, filepath: filePath });
          cache_entry = { etag: etag, data: output ..join('') };
          debug("populating cache #{req.url} length: #{cache_entry.data.length}");
          formatdesc.cache.put(req.request.url, cache_entry, cache_entry.data.length);
        }

        // write to response stream:
        verbose("stream from cache #{req.url}");
        output = cache_entry.data;

      // no cache or no etag -> filter straight to response
      } else {
        output = formatdesc.filter(input(), { request: req, apiinfo: apiinfo, appurl: appurl, filepath: filePath });
      }

    // No filter function -> serve the file straight from disk
    // normal request
    } else {
      output = input();
    }
  }

  if (output === null) {
    req .. setStatus(status);
    req.response.end();

  }
  else if (output === undefined) {
    // this is e.g. to support *.gen files that write redirect responses themselves and return 'undefined'
    if (!req.response.finished)
      throw new Error('request not handled');
  }
  else {
    if (isSequence(output)) {
      output = compress(req, formatdesc, output);
    } else {
      throw new Error("expected Sequence but got #{output}");
    }

    /*if (isFiniteResponse(output)) {
      output = compress(req, formatdesc, output);
      output = new Buffer(output ..join(''));
      req .. setHeader("Content-Length", output.length);
      req .. setHeader("Accept-Ranges", "bytes");
      output = [output];

    } else if (isInfiniteResponse(output)) {


    } else {

    }*/

    // TODO what about HEAD requests?
    if (req.request.headers["range"]) {
      var buffer = new Buffer(output .. join(''));

      // We only handle simple ranges
      var range = /^bytes=(\d*)-(\d*)$/.exec(req.request.headers["range"]);
      if (range) {
        var from = range[1];
        var to   = range[2];

        if (from) {
          from = +from;

          if (to) {
            to = +to;
          } else {
            to = buffer.length - 1;
          }

          range_output(req, buffer, from, to);

        } else if (to) {
          var offset = +to;
          from = buffer.length - offset;
          to   = buffer.length - 1;

          if (from < 0) {
            from = 0;
          }

          range_output(req, buffer, from, to);

        } else {
          range_error(req, buffer);
        }

      } else {
        range_error(req, buffer);
      }

    } else {
      req .. setStatus(status);
      stream.pump(output, req.response);
    }
  }
};

//----------------------------------------------------------------------
// directory listing server

function listDirectory(req, dir, uriPath, format, settings) {
  var listing = {
    path: uriPath,
    directories: [],
    files: []
  };

  // add ".." unless we're listing the root
  if(uriPath && uriPath !== '/') {
    listing.directories.push("..");
  }

  fs.readdir(dir) .. each {
    |filename|
    var filepath = path.join(dir, filename);

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
    { input: -> [listingJson],
      filetype: "/",
      format: format
    },
    settings);
}


//----------------------------------------------------------------------
// file serving

// if `serveFile` doesn't provide a custom apiinfo,
// throw an error if code tries to access it
var defaultApiinfo = function() { throw new Error("apiinfo not set"); }

// attempt to serve the given file; return 'false' if not found
function serveFile(req, filePath, format, settings) {
  var appurl;
  try {
    var stat = fs.stat(filePath);
  }
  catch (e) {
    try {
      // check if we've got a wildcard _.app file in one of our parent directories
      var p = filePath;
      var wildcardDepth = './';
      while (1) {
        // strip off last component of path:
        var idx = p.lastIndexOf('/');
        if (idx === -1) throw 'bail';
        p = p.substring(0, idx);

        // make sure we don't go below 'root':
        if (p.indexOf(settings.root) !== 0) throw 'bail';
        try {
          var stat = fs.stat(p + '/_.app');
          if (!stat.isFile()) continue;
          // success!
          filePath = p + '/_.app';
          appurl = wildcardDepth + '_.app';
          break;
        }
        catch (e) {
          // go a level higher
          wildcardDepth = wildcardDepth + '../';
        }
      }
    }
    catch (e) {
      if (settings.allowGenerators && generateFile(req, filePath, format, settings))
        return true;
      if (settings.allowREST && serveREST(req, filePath, format, settings))
        return true;
      return false;
    }
  }
  if (!stat.isFile()) return false;

  var extension = path.extname(filePath).slice(1);
/*
  we handle source code redaction through in entry in the formats map in formats.sjs
  if (settings.allowGenerators && extension == 'gen') {
    return false;
  }
*/

  var apiinfo = defaultApiinfo;
  if (settings.allowApis && extension == 'api') {
    apiinfo = function() {
      var relativeRoot = settings.bridgeRoot || null;
      if (relativeRoot == null) {
        // use relativeUri to construct a relative path back to
        // the server root
        var depth = req.url.path.split(/\//g);
        depth = depth.length - 2; // assume leading slash
        if(depth < 0) throw new Error("negative depth for server root");
        if(depth <= 0) {
          relativeRoot = './';
        } else {
          relativeRoot = '';
          while(depth>0) {
            relativeRoot += "../";
            depth--;
          }
        }
      }

      try {
        var apiid = require('./api-registry').registerAPI(filePath .. url.fileURL);
        logging.verbose("registered API #{filePath} -> #{apiid}");
        return {id: apiid, root: relativeRoot};
      } catch(e) {
        return {error: String(e) }
      }
    }
  }

  formatResponse(
    req,
    { input: opts -> Stream(function(r) {
                               fs.withReadStream(filePath, opts) {
                                 |file_stream|
                                 file_stream .. stream.contents .. each(r);
                               }
                             }),
      filePath: filePath,
      apiinfo: apiinfo,
      appurl: appurl,
      filetype: extension,
      format: format,
      etag: (settings.etag || exports.etag.mtime)(stat, filePath),
    },
    settings);
  return true;
}
exports.serveFile = serveFile;

function generateFile(req, filePath, format, settings) {
  var genPath = filePath + ".gen";
  var wildcardPath = undefined;
  try {
    var stat = fs.stat(genPath);
    if (!stat.isFile()) return false;
    genPath = fs.realpath(genPath);
  }
  catch (e) {

    // try to find a wildcard generator (_.gen file) in one of our
    // parent directories.

    genPath = filePath;
    wildcardPath = '';
    while (1) {
      // strip off last component of genPath:
      var idx = genPath.lastIndexOf('/');
      if (idx === -1) return false;
      wildcardPath = genPath.substring(idx) + wildcardPath;
      genPath = genPath.substring(0, idx);

      // we need to make sure we don't go below 'root':
      if (genPath.indexOf(settings.root) !== 0) return false;
      try {
        var stat = fs.stat(genPath+'/_.gen');
        if (!stat.isFile()) continue;
        genPath = fs.realpath(genPath+'/_.gen');
        break;
      }
      catch (e) {
        // go round loop again
      }
    }
  }

  var generator_file_mtime = stat.mtime.getTime();

  var resolved_path = require.resolve(genPath .. url.fileURL).path;

  // purge module if it is loaded already, but the mtime doesn't match:
  var module_desc = require.modules[resolved_path];
  var outOfDate = module_desc && module_desc.etag && module_desc.etag !== generator_file_mtime;
  if (outOfDate) logging.verbose("reloading generator file #{resolved_path}; mtime #{module_desc.etag} doesn't match stat #{generator_file_mtime}");

  var generator = require(resolved_path, {reload: outOfDate});
  if (!generator.content) throw new Error("Generator #{filePath} has no `content` method");

  if (!require.modules[resolved_path])
    throw new Error("Module at #{resolved_path} not populated in require.modules");

  require.modules[resolved_path].etag = generator_file_mtime;
  var etag = generator.etag;
  var params = req.url.params();

  // for wildcard generator files (_.gen), we pass the truncated path as a parameter 'path':
  if (wildcardPath) params.path = wildcardPath;

  if (etag) etag = checkEtag(etag.call(req, params));

  var respond = -> formatResponse(
    req,
    {
      input: function() {
        // check cache:
        // XXX this caching functionality should move to formats.sjs
        var data;
        var getContents = -> generator.content.call(req, params);
        if(etag) {
          // cache the generated content internally
          var cache_entry = generatorCache.get(req.request.url);
          if (!cache_entry || cache_entry.etag !== etag) {
            var contents = getContents();
            if (!isString(contents) && contents.read) {
              // force string for values we're caching
              contents = stream.readAll(contents);
            }
            cache_entry = { etag: etag, data: contents }
            generatorCache.put(req.request.url, cache_entry, cache_entry.data.length);
          }
          data = cache_entry.data;
        } else {
          data = getContents();
        }
        return data;
      },

      filetype: generator.filetype ? generator.filetype : path.extname(filePath).slice(1),
      format: format,
      etag: etag,
    },
    settings);
  if (generator.filter) {
    generator.filter(req, respond);
  } else {
    respond();
  }

  return true;
}

// XXX this logic should be consolidated with generateFile
function serveREST(req, filePath, format, settings) {
  var restFilePath = filePath + ".REST";
  var wildcardPath = undefined;
  try {
    var stat = fs.stat(restFilePath);
    if (!stat.isFile()) return false;
    restFilePath = fs.realpath(restFilePath);
  }
  catch (e) {

    // try to find a wildcard rest generator (_.REST file) in one of our
    // parent directories.

    restFilePath = filePath;
    wildcardPath = '';
    while (1) {
      // strip off last component of restFilePath:
      var idx = restFilePath.lastIndexOf('/');
      if (idx === -1) return false;
      wildcardPath = restFilePath.substring(idx) + wildcardPath;
      restFilePath = restFilePath.substring(0, idx);

      // we need to make sure we don't go below 'root':
      if (restFilePath.indexOf(settings.root) !== 0) return false;
      try {
        var stat = fs.stat(restFilePath+'/_.REST');
        if (!stat.isFile()) continue;
        restFilePath = fs.realpath(restFilePath+'/_.REST');
        break;
      }
      catch (e) {
        // go round loop again
      }
    }
  }

  var rest_file_mtime = stat.mtime.getTime();

  var resolved_path = require.resolve(restFilePath .. url.fileURL).path;

  // purge module if it is loaded already, but the mtime doesn't match:
  var module_desc = require.modules[resolved_path];
  var outOfDate = module_desc && module_desc.etag && module_desc.etag !== rest_file_mtime;
  if (outOfDate) logging.verbose("reloading REST generator file #{resolved_path}; mtime #{module_desc.etag} doesn't match stat #{rest_file_mtime}");

  var rest_generator = require(resolved_path, {reload: outOfDate});
  if (!rest_generator[req.request.method]) {
    throw HttpError(405, "Method not allowed");
  }

  if (!require.modules[resolved_path])
    throw new Error("Module at #{resolved_path} not populated in require.modules");

  require.modules[resolved_path].etag = rest_file_mtime;
  var params = req.url.params();

  // for wildcard rest generator files (_.REST), we pass the truncated path as a parameter 'path':
  if (wildcardPath) params.path = wildcardPath;

  rest_generator[req.request.method](req, params);
  if (!req.response.finished) {
    console.log("Module #{resolved_path} failed to handle #{req.request.method} request");
    throw new Error('request not handled');
  }

  return true;
}

//----------------------------------------------------------------------

// Maps a directory on disk into the server fs.
// - The 'pattern' regex under which the handler will be filed needs to
//   have capturing parenthesis around the relative path that will be mapped
//   e.g.:  pattern: /^/virtual_root(\/.*)?$/
// - 'root' is the absolute on-disk path prefix.
// - XXX settings
exports.MappedDirectoryHandler = function(root, settings) {

  // NOTE: these settings MUST be safe by default, suitable for
  // serving untrusted files.
  // ExecutableDirectory and CodeDirectory will selectively enable more dynamic
  // (and less safe) behaviour.

  root = path.normalize(root);

  settings = { mapIndexToDir:   true,
               allowDirListing: true,
               allowGenerators: false,
               allowREST:       false,
               allowApis:       false,
               context:         null,
               formats: StaticFormatMap,
               etag: null,
               bridgeRoot: null,
             } ..
    override(settings || {});

  if (process.platform == 'win32')
    settings.root = root.replace(/\\/g, '/');
  else
    settings.root = root;
  
  if (!settings.etag) {
    settings.etag = defaultEtagFormatter(root);
  }

  function handler_func(req, matches) {
    req.context = settings.context;
    var relativeURI = req.url.path;
    var [relativePath, format] = matches.input.slice(matches.index + matches[0].length).split('!');

/*
    // We must not decode %2f ('/') for our paths, because '/' has a special meaning in the file system.
    // However we also don't want to disallow it, in order to allow arbitrary path parameters

    // so instead of this:

    var restrictedUrlPathPattern = /%2f/i; // = '/'
    if(restrictedUrlPathPattern.test(relativePath)) {
      throw new HttpError(400, "Bad request");
    }

    // we escape the '%' before performing uri decoding:
*/
    relativePath = relativePath.replace(/%2f/ig, '%252f');


    var relativePath = decodeURIComponent(relativePath);

    if (format !== undefined)
      format = { name: format, mandatory: true };
    else
      format = { name: req.url.params().format || 'none' };


    var file = relativePath ? path.join(root, relativePath) : root;

    // the result of path.join is normalized; make sure that '..'
    // components in relativePath don't take us below our root
    // directory:
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
          listDirectory(req, file, relativeURI, format, settings);
        else
          throw Forbidden();
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
    "*":  handler_func
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
