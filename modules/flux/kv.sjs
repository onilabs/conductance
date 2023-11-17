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
  @summary Key-Value Storage
*/

module.setCanonicalId('mho:flux/kv');

@ = require(['sjs:std',
             { id: 'sjs:type', include: ['Interface'] },
             { id: './kv/util', name: 'util' },
             { id: 'sjs:tuple-key-encoding', name:'encoding'}
            ]);

var NOT_FOUND = 'NotFound';

/**
   @class NotFound
   @inherit Error
   @summary Error thrown when accessing a nonexistent key.
   @desc
      See also [::isNotFound].

   @function isNotFound
   @param {Error} [error]
   @summary whether `error` is a [::NotFound] error.
   @return {Boolean}
*/
var throwError = function(key) {
   var e = new Error(key);
   e.code = key;
   throw e;
}

exports.isNotFound = function(e) {
   return e.code === NOT_FOUND;
}

/**
   @class KVStore
   @summary Key-value store abstraction
   @desc
     Objects of class KVStore implement the [::ITF_KVSTORE] interface. You
     can use them with the [./kv::] module API functions, in particular [::get],
     [::set], [::query], [::observe],
     [::observeQuery] and [::withTransaction].

     For a concrete implementation of KVStore, see [::LevelDB] or [::LocalDB].
*/

/**
   @variable ITF_KVSTORE
   @summary Internal interface for [::KVStore] objects
   @desc
    The interface is not intended to be used by client code directly, but through
    one of the [./kv::] API functions, in particular [::get], [::set], [::query], [::observe],
    [::observeQuery] and [::withTransaction].

     Objects implementing this interface must implement the following functions:

         obj[ITF_KVSTORE].get(key) // return value associated with key ('undefined' if not existant)

         obj[ITF_KVSTORE].put(key, value) // set or delete (if value===undefined) entries in the store.
                                          // potentially return amended value (see notes below)

         obj[ITF_KVSTORE].query(range, [options]) // return stream of [key,value] pairs in range

         obj[ITF_KVSTORE].observe(key) // return observable tracking key

         obj[ITF_KVSTORE].observeQuery(range, [options]) // return observable tracking range; must be a StructuredStream of type 'array.mutations'

         obj[ITF_KVSTORE].withTransaction([options], block) // call block with a transaction [::KVStore] object.


    - Key ranges passed to `query` or `observeQuery` will always be in the form `{begin:key, end: key}`

    - `put` return values other than `undefined` will be passed through as return values from [::set]. This is to facilitate
    layers that insert custom structured objects into the db for which they want to return a wrapper different than the value written into the db.

*/
__js var ITF_KVSTORE = exports.ITF_KVSTORE = module .. @Interface('kvstore');

/**
   @class TupleKeyRange
   @summary Right-open intervals of [sjs:tuple-key-encoding::TupleKey]s 
   @desc
     A TupleKeyRange is an object `{begin:K1, end:K2}`, where K1 and K2 are [sjs:tuple-key-encoding::TupleKey]s. A TupleKeyRange  represents a right-open interval. I.e. the interval is intended to be used in comparisons such as `K1 <= K < K2`. Often the boundaries of a TupleKeyRange involve out-of-bounds keys - see the discussion under [sjs:tuple-key-encoding::TupleKey].

     The following [sjs:tuple-key-encoding::TupleKey] constructors can be used help create ranges boundaries:

     - [::FIRST_KEY] is the smallest in-bounds key (`[null]`).
     - [::PAST_LAST_KEY] is an out-of-bounds key that is larger than every other key (`[RangeEnd]`).
     - [::FirstChildKey] constructs an in-bounds key to the first child of a given key.
     - [::PastChildrenKey] constructs an out-of-bounds key one-past the last child of a given key..
     - [::PastSiblingsKey] constructs an out-of-bounds key one-past the last right sibling of a given key.

     There are also the following [::TupleKeyRange] constructors to directly construct common ranges:

     - [::RANGE_ALL] is the range encompassing all keys (`{begin:FIRST_KEY, end:PAST_LAST_KEY}`).
     - [::RightSiblingTreesRange] constructs a range encompassing all of a given key's right siblings including their children (`{begin: PastChildrenKey(K), end: PastSiblingsKey(K)}`).
     - [::ChildrenRange] constructs a range encompassing all of a given key's children (`{begin: FirstChildKey(K), end: PastChildrenKey(K)}`).
     - [::TreeRange] constructs a range encompassing a given key and all of its children (`{begin:K, end: PastChildrenKey(K)}`).
*/

/**
   @variable FIRST_KEY
   @summary The smallest possible [sjs:tuple-key-encoding::TupleKey]
   @desc
     The in-bounds [sjs:tuple-key-encoding::TupleKey] `[null]`.
*/
__js var FIRST_KEY = exports.FIRST_KEY = [null];

/**
   @variable PAST_LAST_KEY
   @summary One-past the largest possible [sjs:tuple-key-encoding::TupleKey]
   @desc
     The out-of-bounds [sjs:tuple-key-encoding::TupleKey] `[RangeEnd]`. See also [sjs:tuple-key-encoding::RangeEnd].
*/
__js var PAST_LAST_KEY = exports.PAST_LAST_KEY = [@encoding.RangeEnd];

/**
   @variable RANGE_ALL
   @summary The [::TupleKeyRange] `{begin:[null], end:[RangeEnd]}` encompassing all keys
  */
__js var RANGE_ALL = exports.RANGE_ALL = {begin:FIRST_KEY, end:PAST_LAST_KEY};


/**
   @function FirstChildKey
   @summary Construct a [sjs:tuple-key-encoding::TupleKey] to the first child of `key`.
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {sjs:tuple-key-encoding::TupleKey}
   @desc
      - `key` must be an in-bounds key. The returned key will also be in-bounds.
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
 */
__js var FirstChildKey = exports.FirstChildKey = function(key) {
  var rv = [...key,null];
  return rv;
};

/**
   @function PastChildrenKey
   @summary Construct a [sjs:tuple-key-encoding::TupleKey] one-past the last child of `key`.
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {sjs:tuple-key-encoding::TupleKey}
   @desc
      - `key` must be an in-bounds key. The returned key will be out-of-bounds.
      - `PastChildren(key)` can also be used as a left boundary of `key`'s first right sibling.
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
 */
__js var PastChildrenKey = exports.PastChildrenKey = function(key) {
  var rv = [...key, @encoding.RangeEnd];
  return rv;
};

/**
   @function PastSiblingsKey
   @summary Construct a [sjs:tuple-key-encoding::TupleKey] one-past the last sibling of `key`.
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {sjs:tuple-key-encoding::TupleKey}
   @desc
      - `key` must be an in-bounds key. The returned key will be out-of-bounds.
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
 */
__js var PastSiblingsKey = exports.PastSiblingsKey = function(key) {
  return key.slice(0,key.length-1).concat(@encoding.RangeEnd);;
};


/**
   @function RightSiblingTreesRange
   @summary Construct a [::TupleKeyRange] encompassing all `key`'s right siblings including their children
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {::TupleKeyRange}
   @desc
      - `key` must be an in-bounds key.
      - Corresponds to the range `{begin: PastChildrenKey(key), end: PastSiblingsKey(key)}`
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
*/
__js exports.RightSiblingTreesRange = function(key) {
  return {begin: PastChildrenKey(key), end: PastSiblingsKey(key)};
};

/**
   @function ChildrenRange
   @summary Construct a [::TupleKeyRange] encompassing all `key`'s children
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {::TupleKeyRange}
   @desc
      - `key` must be an in-bounds key.
      - Corresponds to the range `{begin: FirstChildKey(key), end: PastChildrenKey(key)}`.
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
*/
__js exports.ChildrenRange = function(key) {
  return {begin: FirstChildKey(key), end: PastChildrenKey(key)};
};

/**
   @function TreeRange
   @summary Construct a [::TupleKeyRange] encompassing `key` and its children
   @param {sjs:tuple-key-encoding::TupleKey} [key] An in-bounds key
   @return {::TupleKeyRange}
   @desc
      - `key` must be a in-bounds key.
      - Corresponds to the range `{begin: key, end: PastChildrenKey(key)}`
      - See also the [sjs:tuple-key-encoding::TupleKey] documentation under 'Out-of-bounds tuple keys & key ranges'
*/
__js exports.TreeRange = function(key) {
  return {begin: key, end: PastChildrenKey(key)};
};


/**
   @class Value
   @summary Object that can be stored as a value in a [::KVStore]
   @desc
     * A `Value` can be any JSON-serializable JavaScript object.
     * Some stores, like in-memory [::LocalDB]s can store any JS value.
*/

//----------------------------------------------------------------------
// KV API

/**
   @function get
   @param {::KVStore} [kvstore]
   @param {sjs:tuple-key-encoding::TupleKey} [key]
   @param {optional Object} [default]
   @return {::Value|Object} Value stored under key.
   @summary Retrieve value stored under key.
   @desc
      If the value is not present, `default` will be returned if provided.
      Otherwise, a [::NotFound] error will be thrown.
*/
function get(store, key, dfl) {
  var rv = store[ITF_KVSTORE].get(key);
  if(rv === undefined) {
    if(arguments.length > 2) return dfl;
    throwError(NOT_FOUND);
  }
  return rv;
}
exports.get = get;

/**
   @function set
   @param {::KVStore} [kvstore]
   @param {sjs:tuple-key-encoding::TupleKey} [key]
   @param {::Value} [value]
   @return {::Value} Value inserted into the store (in the case of custom structured [::Value]s, this might be different to the value passed in. 
   @summary Sets key to the given value.
   @desc
      Note: `value` must not be `undefined`. To unset a key-value pair, use [::clear] instead.
*/
__js function set(store, key, value) {
  if (value === undefined) throw new Error("mho:flux/kv::set: 'undefined' is not a valid value");
  var rv = store[ITF_KVSTORE].put(key, value);
  if (rv === undefined) 
    return value;
  else
    return rv;
}
exports.set = set;

/**
   @function clear
   @param {::KVStore} [kvstore]
   @param {sjs:tuple-key-encoding::TupleKey} [key]
   @summary Clears any value currently associated with key.
*/
__js function clear(store, key) {
  return store[ITF_KVSTORE].put(key, undefined);
}
exports.clear = clear;

/**
   @function query
   @param {::KVStore} [kvstore]
   @param {::TupleKeyRange} [range]
   @param {optional Object} [settings]
   @return {sjs:sequence::Stream}
   @setting {Boolean} [reverse=false] Reverse direction of range
   @setting {Integer} [limit=-1] Limit number of elements returned in range. (-1 == no limit)
   @setting {Boolean} [values=true] If this is `false`, the kv may emit `undefined` instead of the real values (currently only the leveldb backend honors this).
   @setting {Boolean} [keys=true] If this is `false`, the kv may emit `undefined` instead of the real keys (currently only the leveldb backend honors this).
   @summary Return a [sjs:sequence::Stream] of `[key, value]` pairs in the given [::TupleKeyRange].
   @desc
     The returned stream will be based on a stable view of the database content as of the time that iteration starts.


     The `limit` setting is applied *after* the `reverse` setting, so that
     it will first reverse the sequence, and will then limit it starting
     from the first element of the reversed sequence.
*/
__js function query(store, range, options) {
  return store[ITF_KVSTORE].query(range, options || {});
}
exports.query = query;

/**
   @function isEmpty
   @param {::KVStore} [kvstore]
   @summary Returns `true` if `kvstore` doesn't contain any key-value pairs, `false` otherwise
*/
function isEmpty(store) {
  return store .. query(RANGE_ALL, {keys:false, values:false, limit:1}) .. @first(undefined) === undefined;
}
exports.isEmpty = isEmpty;

/**
   @function clearRange
   @param {::KVStore} [kvstore]
   @param {::TupleKeyRange} [range]
   @summary Clears any values associated with keys in given range.
*/
function clearRange(store, range) {
  withTransaction(store, function (store) {
    // TODO this currently has to encode/decode the keys twice
    //      this can be made more efficient by only encoding/decoding them once
    query(store, range, {values: false}) .. @each([key] -> clear(store, key));
  });
}
exports.clearRange = clearRange;


/**
   @function observe
   @param {::KVStore} [kvstore]
   @param {sjs:tuple-key-encoding::TupleKey} [key]
   @return {sjs:observable::Observable}
   @summary Return an [sjs:observable::Observable] of the value associated with key.
   @desc
     Note: If there is nothing stored under the key, or an existing value is [::clear]ed, 
     the value of the observable will be `undefined`.
*/
__js function observe(store, key) {
  return store[ITF_KVSTORE].observe(key);
}
exports.observe = observe;


/**
   @function observeQuery
   @param {::KVStore} [kvstore]
   @param {::TupleKeyRange} [range]
   @param {optional Object} [settings] no options yet
   @return {sjs:observable::Observable}
   @summary Return an [sjs:observable::Observable] of the array of `[key, value]` pairs in the given range.
   @desc
     ### Stream structuring details

     The returned stream is an [sjs:observable::Observable] of a `[key,value]` pair array encoded as a [sjs:sequence::StructuredStream] of type 'array.mutations'

*/
__js function observeQuery(store, range, options) {
  return store[ITF_KVSTORE].observeQuery(range, options || {});
}
exports.observeQuery = observeQuery;

/**
   @function withTransaction
   @altsyntax kvstore .. withTransaction(function(transaction) {... })
   @param {::KVStore} [kvstore]
   @param {Function} [block] Function that will be passed a transaction object (a [::KVStore]).
   @summary Run code in `block` in a transaction.
   @desc
     The transaction object passed to `block` is a [::KVStore] itself
     and can be used with all the [./kv::] API functions ([::get],
     [::set], etc).

     During the execution of `block`, withTransaction will check if there are
     any conflicts: If any of the keys read or written to within the
     transaction are being concurrently modified from outside of the 
     transaction, `block` will be immediately aborted and called again; indefinitely 
     until no conflicts are detected. 

     Transactions will be aborted, and `withTransaction` will return immediately, 
     if `block` throws an exception or (if block is
     a blocklambda) exits via a blocklambda return or blocklambda break.

     When `block` exits normally (i.e. not
     by throwing an exception, and not via a blocklambda return or blocklambda break),
     `withTransaction` will again check for conflicts while obtaining a global
     lock on the db. If a conflict is detected, `block` will be rerun. Otherwise
     all mutations performed in `block`
     will be applied to the underlying database and `withTransaction`
     returns the return value of `block`

     After a completed successful `withTransaction` call
     returns, all reads and writes will have been performed atomically,
     consistently, in isolation and durably.

     Transactions can be nested. The transaction will be committed
     when the outermost transaction block exits.

     [::get] and [::query] calls performed in the
     transactional context will reflect any prior mutations applied in
     the same transaction (before they are committed to the database).

     [::observe], [::observeQuery] calls
     performed in the transactional context will reflect any prior and
     future mutations applied in the same transaction (before they are
     committed to the database).


     ### Caveats of blocklambda controlflow

     In general it is a bad idea to use blocklambdas as `block`. Normal functions 
     are preferred.

     This is because controlflow such as blocklambda breaks or 
     returns will prevent any mutations in a transactions from becoming materialized in 
     the db. E.g. in the following transaction, the new account balances will **NOT** be
     written to the db, (even though the updated value is returned from the blocklambda 
     return):

         // INCORRECT BLOCKLAMBDA USAGE
         // transfer $x from a to b and return balance b:
         function transfer(x) {
           db .. withTransaction {
             |tx|
             var a = tx .. read('accountA');
             var b = tx .. read('accountB');
             // transfer $x from a->b:
             tx .. write('accountA', a-x);
             tx .. write('accountB', b+x);
             return tx .. read('accountB'); // blocklambda return ABORTS THE TRANSACTION!!!
           }
         }

     A version that uses a normal function works fine:

         // CORRECT VERSION
         // transfer $x from a to b and return balance b:
         function transfer(x) {
           return db .. withTransaction(function(tx) {
             var a = tx .. read('accountA');
             var b = tx .. read('accountB');
             // transfer $x from a->b:
             tx .. write('accountA', a-x);
             tx .. write('accountB', b+x);
             return tx .. read('accountB');
           });
         }

     ### Using transactions solely for consistent reads

     If a transaction is **solely being used to read data**, any relevant concurrent mutations 
     will cause the block to be aborted immediately and rerun.

     While it is arguably bad form, for these types of transactions it is technically ok to 
     use blocklambdas & bail early from `block` using blocklambda controlflow. 
     E.g.:

         db .. withTransaction {
           |tx| 
           var a = tx .. read('accountA');
           var b = tx .. read('accountB');
           return a+b; // it's ok to bail here, as we're not writing any data
         }

     If there are concurrent mutations to the db, the block might abort during 
     either of the reads and re-run.
     The 'return' line will only be reached once the values of 'a' and 'b' are 
     consistent with each other (i.e. there aren't any mutations of 'a' between
     reading 'a' and reading 'b').

 
*/
__js function withTransaction(store, options, block) {
  if (arguments.length === 2) {
    block = options;
    options = undefined;
  }
  return store[ITF_KVSTORE].withTransaction(options, block);
}
exports.withTransaction = withTransaction;

//----------------------------------------------------------------------
// KVStore implementations:

/**
  @class LevelDB
  @inherit ::KVStore
  @hostenv nodejs
  @summary Simple fast and efficient persistent local key-value storage backed by [RocksDB](http://rocksdb.org/)
  @function LevelDB
  @altsyntax LevelDB(location, [options]) { |kvstore| ... }
  @param {String} [location] Location of DB on disk
  @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
  @setting {optional String} [leveldown='leveldown'] Name of alternative leveldown module to use (e.g. 'npm:leveldown')
  @param {optional Function} [session_f] Session to scope the LevelDB object to
  @desc
    Note: To repair a corrupt rocksdb database you can use `require('mho:flux/rv/leveldb').repairLevelDB(location)`.


  @function LevelDB.close
  @summary  Close the DB.
*/
function LevelDB(location, options, session_f) {
  // untangle args
  if (arguments.length == 1) {
    options = {};
  } else if (arguments.length < 3 && typeof options === 'function') {
    session_f = options;
    options = {};
  }

  var itf = require('./kv/leveldb').LevelDB(location, options);

  if (session_f) {
    try {
      return session_f(itf);
    } finally {
      itf.close();
    }
  } else {
    return itf;
  }
}
exports.LevelDB = LevelDB;


/**
  @class LocalDB
  @inherit ::KVStore
  @summary Simple fast and efficient local key-value storage
  @function LocalDB
  @altsyntax LocalDB([options]) { |kvstore| ... }
  @param {optional Object} [settings]
  @param {optional Function} [block] Lexical block to scope the LocalDB object to
  @setting {optional String} [localStorage] The name to use in `localStorage` for loading/saving the DB
  @setting {optional String} [sessionStorage] The name to use in `sessionStorage` for loading/saving the DB
  @setting {optional String} [file] The file path to use for loading/saving the DB
  @setting {optional sjs:observable::ObservableVar} [string] A string [sjs:observable::ObservableVar] backing the DB
  @setting {optional Boolean} [readonly=false] If this is `true`, any mutation attempts will throw an exception
  @desc
  
    * `localStorage`, `sessionStorage`, `file`, and `string` are exclusive of each other.

    * If you provide `localStorage`, the DB will be loaded/saved to
      `localStorage`, using the name provided. This can only be used in
      the xbrowser host environment.

    * If you provide `sessionStorage`, the DB will be loaded/saved to
      `sessionStorage`, using the name provided. This can only be used in
      the xbrowser host environment.

    * If you provide `file`, the DB will be loaded/saved to a file. This
      can only be used in the nodejs host environment.

    * If you provide `string`, the DB will be loaded/saved to the string accessed through the [sjs:observable::ObservableVar].

    * If you do not provide either, the DB will be stored in memory. That
      means it is **not** persistent: if you close and restart your program,
      the data in the DB *will be lost*, with no way to retrieve it.

    * Note that external modifications to the backing store of the DB will *not* be reflected in the DB.

    * The serialization format is the same for all backing stores.

    * If two DBs are loaded with the same `localStorage`, `sessionStorage` or `file`, they will
      be exactly the same DB:

          // true
          @LocalDB({ localStorage: 'foo' }) === @LocalDB({ localStorage: 'foo' });

    * In-memory LocalDBs can store [::Value]s of any type; they are not limited to JSON-serializable
      values.

    ----

    LocalDB should **not** be used to store very large keys/values. Partly
    because the performance is bad, and partly because `localStorage`/`sessionStorage` have
    a very small size limit. If you go over the limit, you will get an
    error.
*/
function LocalDB(options, block) {
  // untangle args
  if (arguments.length == 0) {
    options = {};
  } else if (arguments.length < 2 && typeof options === 'function') {
    block = options;
    options = {};
  }

  var itf = require('./kv/localdb').LocalDB(options);

  if (block) {
    return block(itf);
  } else {
    return itf;
  }
}
exports.LocalDB = LocalDB;

/**
  @class Encrypted
  @inherit ::KVStore
  @summary A key-value storage that automatically encrypts its values

  @function Encrypted
  @altsyntax Encrypted(db, settings) { |kvstore| ... }
  @param {::KVStore} [db]
  @param {Object} [settings]
  @param {optional Function} [block] Lexical block to scope the Encrypted object to
  @setting {String} [password] The password / key to use for encrypting / decrypting
  @desc
    This function will return a wrapper for `db` which automatically
    encrypts / decrypts the values.

    Keys are *not* encrypted, so you should **not** store security-sensitive
    information in the keys.

    It will transparently encrypt / decrypt the values, which means that the
    values in `db` are *always* encrypted, but if you use the [::Encrypted]
    object it will automatically decrypt the values.

    Because it can wrap any [::KVStore], you get to choose how the database
    is stored:

        // In memory
        @Encrypted(@LocalDB(), { password: 'bar' });

        // In localStorage
        @Encrypted(@LocalDB({ localStorage: 'foo' }), { password: 'bar' });

        // In a file
        @Encrypted(@LocalDB({ file: 'foo' }), { password: 'bar' });

        // In LevelDB
        @Encrypted(@LevelDB('foo'), { password: 'bar' });
*/
function Encrypted(db, options, block) {
  var itf = require('./kv/encrypted').Encrypted(db, options);

  if (block) {
    return block(itf);
  } else {
    return itf;
  }
}
exports.Encrypted = Encrypted;

/**
  @class Subspace
  @inherit ::KVStore
  @summary A key-value storage that automatically adds a prefix to all the keys

  @function Subspace
  @altsyntax Subspace(db, prefix) { |kvstore| ... }
  @param {::KVStore} [db]
  @param {sjs:tuple-key-encoding::TupleKey} [prefix]
  @param {optional Function} [block] Lexical block to scope the Subspace object to
  @desc
    This function will return a wrapper for `db` which automatically
    adds / removes `prefix` from all of the keys.

        var sub = @Subspace(db, ['foo', 'bar']);

        // This...
        @set(sub, ['qux'], 5);

        // ...is equivalent to this:
        @set(db, ['foo', 'bar', 'qux'], 5);
*/
function Subspace(db, prefix, block) {
  var itf = require('./kv/subspace').Subspace(db, prefix);

  if (block) {
    return block(itf);
  } else {
    return itf;
  }
}
exports.Subspace = Subspace;
