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
  @nodoc Documented under ../kv.sjs
  @hostenv nodejs
  @summary Simple fast and efficient persistent local key-value storage backed by [LevelDB](http://en.wikipedia.org/wiki/LevelDB)
  @desc
    Uses [node-leveldown](https://github.com/rvagg/node-leveldown) under the hood
*/

@ = require(['sjs:std', 
             {id: '../kv', name: 'kv'}, 
             {id: './encoding', name: 'encoding'}
            ]);

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
   @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
   @param {optional Function} [block] Lexical block to scope the LevelDB object to
*/
function LevelDB(location, options, block) {
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
  if (err) throw new Error("Failed to open database at #{location}: #{err}") .. annotateError(err);

  /*
    MutationEmitter receives all mutations in the form
    [{type:'put'|'del', key:encoded_key, value:encoded_value}, ...]
   */
  var MutationEmitter = @Emitter();

  /*

    "itf" - the api object we'll be passing to 'block' - is composed
    of a low-level API, and of the ITF_KVSTORE interface

   */
  var itf = {
    /**
       @function LevelDB.put
       @param {String|Buffer} [key]
       @param {String|Buffer} [value]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownputkey-value-options-callback.
       @summary  Low-level LevelDB function to create or overwrite an entry.
    */
    put: function(key, value, options) {
      waitfor (var err) {
        db.put(key, value, options || {}, resume);
      }
      if (err) throw new Error(err) .. annotateError(err);
      MutationEmitter.emit([{type:'put', key:key, value:value}]);
    },
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
        db.get(key, options || {}, resume);
      }
      if (err) {
        if (/NotFound/.test(err.message)) return undefined;
        throw new Error("Error retrieving '#{key}' from database at #{location}: #{err}") .. annotateError(err);
      }
      return val;
    },
    /**
       @function LevelDB.del
       @param {String|Buffer} [key]
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowndelkey-options-callback
       @summary  Low-level LevelDB function to delete an entry.
    */
    del: function(key, options) {
      waitfor (var err) {
        db.del(key, options || {}, resume);
      }
      if (err) throw new Error("Error deleting '#{key}' from database at #{location}: #{err}") .. annotateError(err);
      MutationEmitter.emit([{type:'del', key:key}]);
    },
    /**
       @function LevelDB.batch
       @param {Array} [ops] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback.
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownbatchoperations-options-callback
       @summary  Low-level LevelDB function to perform multiple operations atomically.
    */
    batch: function(ops, options) {
      waitfor (var err) {
        db.batch(ops, options || {}, resume);
      }
      if (err) throw new Error("Error in batch operation for database at #{location}: #{err}") .. annotateError(err);
      MutationEmitter.emit(ops);
    },
    /**
       @function LevelDB.query
       @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldowniteratoroptions
       @return {sjs:sequence::Stream} Stream of [key, value] query results
       @summary  Low-level LevelDB function reading a contiguous range of keys.
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
      waitfor (var err) {
        db.close(resume);
      }
      if (err) throw new Error("Error closing database at #{location}") .. annotateError(err);
      db = undefined; 
    }
  }
  

  //----------------------------------------------------------------------
  // high-level ITF_KVSTORE interface implementation 
  var kvstore_interface = {
    get: function(key) {
      // XXX better error handling
      return itf.get(key);
    },
    put: function(key, value) {
      // XXX collect multiple temporally adjacent calls
      // XXX better error handling
      var rv = itf.batch([{ type: value === undefined ? 'del' : 'put', key: key, value: value}]);
      return rv;
    },
    range: function(begin, end, options) {      
      var query_opts = {
        limit: -1,
        reverse: false
      } .. @override(options);

      query_opts.gte = begin;
      if (end !== undefined)
        query_opts.lt = end;

      return itf.query(query_opts);
    },
    observe: function(key) {
      return @eventStreamToObservable(
        MutationEmitter .. 
          @unpack ..
          @filter(kv -> kv.key .. @encoding.encodedKeyEquals(key)) ..
          @transform({value} -> value),
        -> itf.get(key));

    },
    observeRange: function(begin, end, options) {
      return @eventStreamToObservable(
        MutationEmitter ..
          @filter(kvs -> kvs .. @any(kv -> kv.key .. @encoding.encodedKeyInRange(begin, end))) ..
          @transform(-> kvstore_interface.range(begin, end, options)),
        -> kvstore_interface.range(begin, end, options)
      );
    },
    withTransaction: function(options, block) {

      /*
        LevelDB provides durability & atomicity via the 'batch'
        operation. We need to take care of consistency & isolation
        ourselves:
       */
      
      // pending puts indexed by key in hex representation:
      var pendingPuts = {};

      // level-down doesn't have support for snapshots yet, so we
      // need to make sure that we get consistent reads:
      var reads = {};

      var conflict = false;

      var T = {}
      T[@kv.ITF_KVSTORE] = {
        get: function(key) {
          var hex_key = key.toString('hex');

          // check if we've written this key:
          var kv = pendingPuts[hex_key];
          if (kv) return kv[1];

          // else, check if we've already read it:
          var v = reads[hex_key];
          if (v) return v;

          // else read from db:
          var val = itf.get(key);
          reads[hex_key] = val;
          return val;
        },
        put: function(key, value) {
          pendingPuts[key.toString('hex')] = [key, value];
        },
        range: function(begin, end, options) {
          throw new Error('write me');
        },
        observe: function(key) {
          throw new Error('write me');
        },
        observeRange: function(begin, end, options) {
          throw new Error('write me');
        },
        withTransaction: function(options, block) {
          block(this);
        }
      };

      // retry transactions until they succeed:
      while (true) {
        waitfor {
          block(T);
        }
        or {
          // We are stricter than required here. All we need to
          // guarantee is that *multiple* reads/writes are consistent
          // with each other. But commonly a transaction would be used
          // for multiple reads/writes, so not much is gained by finer granularity.
          MutationEmitter .. @unpack .. @each {
            |{key}|
            var hex_key = key.toString('hex');
            if (pendingPuts[hex_key] || reads[hex_key])
              break;
          }
          conflict = true;
          hold();
        }
        
        // XXX we could maybe check conflicts earlier in ITF_KVSTORE
        // calls and throw a transaction exception. That might make
        // implementation of client code more complicated though.
        if (!conflict) {
          // we can commit our pending reads:
          return itf.batch(pendingPuts .. @propertyPairs .. @map([,[key,value]] -> { type: value === undefined ? 'del' : 'put', key: key, value: value}));
        }
console.log("RETRY transaction");
        // go round loop and retry:
        pendingPuts = {};
        reads = {};
        conflict = false;
      }
    }
  };

  itf[@kv.ITF_KVSTORE] = kvstore_interface;

  //----------------------------------------------------------------------

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
exports.LevelDB = LevelDB;
