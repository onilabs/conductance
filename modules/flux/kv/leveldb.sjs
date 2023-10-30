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
  @nodoc Documented under ../kv.sjs
  @hostenv nodejs
  @summary Simple fast and efficient persistent local key-value storage backed by [LevelDB](http://en.wikipedia.org/wiki/LevelDB)
  @desc
    Uses [node-leveldown](https://github.com/rvagg/node-leveldown) under the hood
*/

@ = require(['sjs:std',
             { id: './wrap', name: 'wrap' },
             { id: './encoding', name: 'encoding' }]);


// value encoding/decoding
__js {

  // XXX at the moment we encode everything as JSON.
  // later we should add in at least binary encoding (from Buffer/ArrayBuffer)

  var VALUE_TYPE_JSON = 1;
  // .. VALUE_TYPE_BINARY

  function encodeValue(unencoded) {
    return Buffer.from('\x01'+JSON.stringify(unencoded), 'utf8');
  }

  function decodeValue(encoded) {
    if (encoded == null || encoded.length == 0) return undefined;
    if (encoded[0] !== VALUE_TYPE_JSON)
      throw new Error("Unknown data type '#{encoded[0]}' in leveldb value");
    return JSON.parse(encoded.toString('utf8', 1, encoded.length));
  }

} // __js

// helper to gracefully handle cleanup of a resource when we're
// retracting during acquisition. 
// XXX This is useful for many nodejs libs that don't provide a way to
// abort acquisition, so it should go into some common library
// XXX we also use it in ssh-client.sjs
function delayed_retract(uninterrupted_acquire, delayed_retract) {
  var resource;
  var S = reifiedStratum.spawn(function() { resource = uninterrupted_acquire(); });
  try {
    S.wait();
    return resource;
  }
  retract {
    @sys.spawn(function() {
      reifiedStratum.adopt(S);
      S.wait();
      delayed_retract(resource);
    });
  }
}


__js function annotateError(err, orig) {
  // XXX leveldown should really have better types
  var type = orig.message;
  var idx = type.indexOf(':');
  if (idx !== -1) type = type.slice(0, idx);
  err.type = type;
  return err;
}

/**
   @function repairLevelDB
   @summary Attempt to repair a corrupt rocksdb database
   @param {String} [location] Location of DB on disk
*/
function repairLevelDB(location) {
  var leveldown = 'rocksdb/leveldown';
  waitfor (var err) {
    require(leveldown).repair(location, resume);
  }
  if (err) throw new Error(err);
}
exports.repairLevelDB = repairLevelDB;

/**
   @class LevelDB
   @inherits KVStore
   @summary LevelDB (actually RocksDB) database session
   @function LevelDB
   @altsyntax LevelDB(location, [options]) { |itf| ... }
   @param {String} [location] Location of DB on disk
   @param {Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
   @setting {optional String} [leveldown='rocksdb/leveldown'] Name of alternative leveldown module to use (e.g. 'npm:leveldown')
*/
function LevelDB(location, options) {
  var leveldown = 'rocksdb/leveldown';
  if (options && options.leveldown) {
    leveldown = options.leveldown;
    options = options .. @clone;
    delete options['leveldown'];
  }
  var db = require(leveldown)(location);

  // slightly round-about way of opening to gracefully handle closing
  // of the db if we are being retracted while opening
  var err;
  delayed_retract(
    function() {
      waitfor(err) { db.open(options, resume); }
    },
    function() {
      if (!err) db.close(@fn.nop);
    }
  );

  if (err) throw new Error("Failed to open database at #{location}: #{err}") .. annotateError(err);

  /*
    MutationDispatcher receives all mutations in the form
    [{type:'put'|'del', key:encoded_key, value:encoded_value}, ...]
   */
  var MutationDispatcher = @Dispatcher();

  var base = {
    changes: @events(MutationDispatcher),

    /* ---- not part of interface: use batch
       @function LevelDB.put
       @param {String|Buffer} [key]
       @param {String|Buffer} [value]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownputkey-value-options-callback.
       @summary  Low-level LevelDB function to create or overwrite an entry.

    put: function(key, value, options) {
      waitfor (var err) {
        db.put(key, encodeValue(value), options || {}, resume);
      }
      if (err) throw new Error(err) .. annotateError(err);
      MutationDispatcher.dispatch([{type:'put', key:key, value:value}]);
    },
    */
    /**
       @function LevelDB.get
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowngetkey-options-callback.
       @return {Buffer|undefined}
       @summary  Low-level LevelDB function to fetch an entry.
       @desc
         Returns `undefined` if the entry is not found
    */
    get: function(key, options) {
      waitfor (var err, val) {
        __js db.get(key, options || {}, resume);
      }
      if (err) {
        if (__js /NotFound/.test(err.message)) return undefined;
        throw new Error("Error retrieving '#{key}' from database at #{location}: #{err}") .. annotateError(err);
      }
      return decodeValue(val);
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
      MutationDispatcher.dispatch([{type:'del', key:key}]);
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
        __js db.batch(ops .. @map(__js op->{type:op.type, key: op.key, value:op.type === 'put' ? encodeValue(op.value)}), options || {}, resume);
      }
      if (err) throw new Error("Error in batch operation for database at #{location}: #{err}") .. annotateError(err);
      MutationDispatcher.dispatch(ops);
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
            receiver([key, decodeValue(value)]);
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
  //itf.db = db;
  return itf;
}
exports.LevelDB = LevelDB;

