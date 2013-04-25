var { createID } = require('./random');
var logging = require('sjs:logging');
var { writeErrorResponse } = require('./response');
var { serveFile } = require('./file-server');

//----------------------------------------------------------------------
// 'keyhole' server for mapping files dynamically:

var keyholes = {};

function createKeyhole() {
  var mappings = {};
  var id = createID();
  keyholes[id] = mappings;

  return {
    id: id,
    mappings: mappings, // virtual_path -> { file, mime }
    close: -> delete keyholes[id]
  }
}
exports.createKeyhole = createKeyhole;

//----------------------------------------------------------------------

function createKeyholeHandler() {
  function handler_func(matches, req) {
    
    // find the keyhole descriptor:
    var descriptor;
    var keyhole_id, keyhole_path;
    [,keyhole_id, keyhole_path] = matches;
    logging.verbose("accessing keyhole #{keyhole_id} -- #{keyhole_path}");
    var keyhole = keyholes[keyhole_id];

    // no descriptor
    if (!keyhole || !(descriptor = keyhole[keyhole_path])) {
      logging.verbose("keyhole #{keyhole_id} -- #{keyhole_path} not found");
      writeErrorResponse(req, 404, "Not Found");
      return;
    }

    if (descriptor.file) {
      // serve as file from the filesystem
      // XXX this format stuff is a bit of a song and dance
      var formats = { '*': { custom : { mime: descriptor.mime } } };
      if (!serveFile(req, descriptor.file, {name:'custom'}, {formats:formats})) {
        if (!req.response._header) {
          writeErrorResponse(req, 404, "Not Found");
        }
        throw new Error("Cannot serve file");
      }
    }
  }

  return {
    "GET":  handler_func,
    "HEAD": handler_func
  }
}

exports.createKeyholeHandler = createKeyholeHandler;
