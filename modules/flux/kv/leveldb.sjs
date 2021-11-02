/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
  @nodoc Documented under ../kv.sjs
  @hostenv nodejs
  @summary Simple fast and efficient persistent local key-value storage backed by [LevelDB](http://en.wikipedia.org/wiki/LevelDB)
  @desc
    Uses [node-leveldown](https://github.com/rvagg/node-leveldown) under the hood
*/

@ = require(['sjs:std',
             { id: './wrap', name: 'wrap' },
             { id: './encoding', name: 'encoding' }]);

__js function annotateError(err, orig) {
  // XXX leveldown should really have better types
  var type = orig.message;
  var idx = type.indexOf(':');
  if (idx !== -1) type = type.slice(0, idx);
  err.type = type;
  return err;
}

/**
   @class LevelDB
   @inherits KVStore
   @summary LevelDB database session
   @function LevelDB
   @altsyntax LevelDB(location, [options]) { |itf| ... }
   @param {String} [location] Location of DB on disk
   @param {Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
   @setting {optional String} [leveldown='leveldown'] Name of alternative leveldown module to use (e.g. 'rocksdb/leveldown')
*/
function LevelDB(location, options) {
  var leveldown = 'leveldown';
  if (options && options.leveldown) {
    leveldown = options.leveldown;
    options = options .. @clone;
    delete options['leveldown'];
  }
  var db = require(leveldown)(location);

  // slightly round-about way of opening to gracefully handle closing
  // of the db if we are being retracted while opening

  var open = _task (function() {
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
    _task (function() {
      var err = open.value();
      if (!err) db.close(@fn.nop);
    })()
  }
  if (err) throw new Error("Failed to open database at #{location}: #{err}") .. annotateError(err);

  /*
    MutationEmitter receives all mutations in the form
    [{type:'put'|'del', key:encoded_key, value:encoded_value}, ...]
   */
  var MutationEmitter = @Emitter();

  __js var encoding_backend = {
    makeEncodingBuffer: Buffer.allocUnsafe,
    
    encodeString: function (str) {
      return Buffer.from(str, 'utf8');
    },
    
    decodeString: function (buf, start, end) {
      return buf.toString('utf8', start, end);
    },
    
    copy: function (from, to, to_start, from_start, from_end) {
      return from.copy(to, to_start, from_start, from_end);
    },
    
    concat: Buffer.concat
  };

  var base = {
    changes: MutationEmitter,

    encoding_backend : encoding_backend,


    encodeValue: __js function (value) {
      return @encoding.encodeValue(encoding_backend, value);
    },

    decodeValue: __js function (value) {
      return @encoding.decodeValue(encoding_backend, value);
    },


    /* ---- not part of interface: use batch
       @function LevelDB.put
       @param {String|Buffer} [key]
       @param {String|Buffer} [value]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownputkey-value-options-callback.
       @summary  Low-level LevelDB function to create or overwrite an entry.

    put: function(key, value, options) {
      waitfor (var err) {
        db.put(key, value, options || {}, resume);
      }
      if (err) throw new Error(err) .. annotateError(err);
      MutationEmitter.emit([{type:'put', key:key, value:value}]);
    },
    */
    /**
       @function LevelDB.get
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowngetkey-options-callback.
       @return {Buffer|undefined}
       @summary  Low-level LevelDB function to fetch an entry.
       @desc
         Throws an exception if the entry is not found
    */
    get: function(key, options) {
      waitfor (var err, val) {
        __js db.get(key, options || {}, resume);
      }
      if (err) {
        if (/NotFound/.test(err.message)) return undefined;
        throw new Error("Error retrieving '#{key}' from database at #{location}: #{err}") .. annotateError(err);
      }
      return val;
    },
    /* ---- not part of interface: use batch
       @function LevelDB.del
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowndelkey-options-callback
       @summary  Low-level LevelDB function to delete an entry.
    
    del: function(key, options) {
      waitfor (var err) {
        db.del(key, options || {}, resume);
      }
      if (err) throw new Error("Error deleting '#{key}' from database at #{location}: #{err}") .. annotateError(err);
      MutationEmitter.emit([{type:'del', key:key}]);
    },
    */
    /**
       @function LevelDB.batch
       @param {Array} [ops] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback.
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback
       @summary  Low-level LevelDB function to perform multiple operations atomically.
    */
    batch: function(ops, options) {
      waitfor (var err) {
        __js db.batch(ops, options || {}, resume);
      }
      if (err) throw new Error("Error in batch operation for database at #{location}: #{err}") .. annotateError(err);
      MutationEmitter.emit(ops);
    },
    /**
       @function LevelDB.query
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowniteratoroptions
       @return {sjs:sequence::Stream} Stream of [key, value] query results
       @summary  Low-level LevelDB function reading a contiguous range of keys
       @desc
         The returned stream will be based on a stable view of the database content as of the time that iteration starts.
    */
    query: function(options) {
      return @Stream(function(receiver) {
        var iterator = db.iterator(options || {});
        try {
          while (true) {
            waitfor (var err, key, value) {
              iterator.next(resume);
            }
            if (err) throw new Error("Error advancing iterator for database at #{location}") .. annotateError(err);
            if (!key) return; // end
            receiver([key, value]);
          }
        }
        finally {
          waitfor (var err) {
            iterator.end(resume);
          }
          if (err) throw new Error("Error closing iterator for database at #{location}") .. annotateError(err);
        }
      });
    },
    /**
       @function LevelDB.close
       @summary  Close the DB.
    */
    close: function() {
      if (db) {
        waitfor (var err) {
          db.close(resume);
        }
        if (err) throw new Error("Error closing database at #{location}") .. annotateError(err);
        db = undefined;
      }
    }
  };

  var itf = @wrap.wrapDB(base);
  itf.close = base.close;
  itf.db = db;
  return itf;
}
exports.LevelDB = LevelDB;

