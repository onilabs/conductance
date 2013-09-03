var { createID } = require('./random');
var logging = require('sjs:logging');
var { NotFound } = require('./response');
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
  function handler_func(req, matches) {
    
    // find the keyhole descriptor:
    var descriptor;
    var keyhole_id, keyhole_path;
    [,keyhole_id, keyhole_path] = matches;
    logging.verbose("accessing keyhole #{keyhole_id} -- #{keyhole_path}");
    var keyhole = keyholes[keyhole_id];

    // no descriptor
    if (!keyhole || !(descriptor = keyhole[keyhole_path])) {
      logging.verbose("keyhole #{keyhole_id} -- #{keyhole_path} not found");
      throw NotFound();
    }

    if (descriptor.file) {
      // serve as file from the filesystem
      // XXX this format stuff is a bit of a song and dance
      var formats = { '*': { custom : { mime: descriptor.mime } } };
      if (!serveFile(req, descriptor.file, {name:'custom'}, {formats:formats})) {
        if (!req.response._header) {
          throw NotFound();
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
