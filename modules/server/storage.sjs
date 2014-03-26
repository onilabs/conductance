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
  @summary Simple fast and efficient persistent local key-value storage backed by [LevelDB](http://en.wikipedia.org/wiki/LevelDB)
  @desc
    Uses [node-leveldown](https://github.com/rvagg/node-leveldown) under the hood
*/

@ = require('sjs:std');

/**
   @class Storage
   @summary LevelDB database session
   @function Storage
   @altsyntax Storage(location, [options]) { |itf| ... }
   @param {String} [location] Location of DB on disk
   @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
   @param {optional Function} [block] Lexical block to scope the Storage object to
*/
function Storage(location, options, block) {
  // untangle args
  if (arguments.length == 1) {
    options = {};
  }
  else if (arguments.length < 3 && typeof options === 'function') {
    block = options;
    options = {};
  }

  var db = require('leveldown')(location);
  
  // slightly round-about way of opening to gracefully handle closing
  // of the db if we are being retracted while opening
  var open = spawn (function() { 
    waitfor (var error) {
      db.open(options, resume);
    }
    return error;
  })();

  try {
    var err = open.value();
  }
  retract {
    // make sure db gets closed
    spawn (function() {
      var err = open.value();
      if (!err) db.close(@fn.nop);
    })()
  }
  if (err) throw new Error("Failed to open database at #{location}: #{err}");
  
  var itf = {
    /**
       @function Storage.put
       @param {String|Buffer} [key]
       @param {String|Buffer} [value]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownputkey-value-options-callback.
       @summary  Create or overwrite an entry in the DB.
    */
    put: function(key, value, options) {
      waitfor (var err) {
        db.put(key, value, options || {}, resume);
      }
      if (err) throw new Error(err);
    },
    /**
       @function Storage.get
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowngetkey-options-callback.
       @return {Buffer}
       @summary  Fetch an entry from the DB.
       @desc
         Throws an exception if the entry is not found
    */
    get: function(key, options) {
      waitfor (var err, val) {
        db.get(key, options || {}, resume);
      }
      if (err) throw new Error("Error retrieving #{key} from database at #{location}: #{err}");
      return val;
    },
    /**
       @function Storage.del
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowndelkey-options-callback
       @summary  Delete an entry from the DB.
    */
    del: function(key, options) {
      waitfor (var err) {
        db.del(key, options || {}, resume);
      }
      if (err) throw new Error("Error deleting #{key} from database at #{location}: #{err}");
    },
    /**
       @function Storage.batch
       @param {Array} [ops] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback.
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback
       @summary  Perform multiple operations on the DB atomically.
    */
    batch: function(ops, options) {
      waitfor (var err) {
        db.batch(ops, options || {}, resume);
      }
      if (err) throw new Error("Error in batch operation for database at #{location}: #{err}");
    },
    /**
       @function Storage.query
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowniteratoroptions
       @return {sjs:sequence::Stream} Stream of [key, value] query results
       @summary  Query the DB for a contiguous range of keys.
    */
    query: function(options) {
      return @Stream(function(receiver) { 
        var iterator = db.iterator(options || {});
        try {
          while (true) {
            waitfor (var err, key, value) {
              iterator.next(resume);
            }
            if (err) throw new Error("Error advancing iterator for database at #{location}");
            if (!key) return; // end
            receiver([key, value]);
          }
        }
        finally {
          waitfor (var err) {
            iterator.end(resume);
          }
          if (err) throw new Error("Error closing iterator for database at #{location}");
        }
      });
    },
    /**
       @function Storage.close
       @summary  Close the DB.
    */
    close: function() { 
      waitfor (var err) {
        db.close(resume);
      }
      if (err) throw new Error("Error closing database at #{location}");
      db = undefined; 
    }
  }
  
  if (block) {
    try {
      block(itf);
    }
    finally {
      if (db) itf.close();
    }
  }
  else
    return itf;
}
exports.Storage = Storage;
