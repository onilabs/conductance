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
  @summary Key-Value Storage
  @hostenv nodejs
*/

module.setCanonicalId('mho:flux/kv');

@ = require(['sjs:std',
             { id: 'sjs:type', include: ['Interface'] },
             { id: './kv/util', name: 'util' }
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

         obj[ITF_KVSTORE].put(key, encoded_value) // set or delete (if value===undefined) entries in the store

         obj[ITF_KVSTORE].query(range, [options]) // return stream of [key,value] pairs in range

         obj[ITF_KVSTORE].observe(key) // return observable tracking key

         obj[ITF_KVSTORE].observeQuery(range, [options]) // return observable tracking range

         obj[ITF_KVSTORE].withTransaction([options], block) // call block with a transaction [::KVStore] object.

    Keys are automatically normalized before being passed to the ITF_KVSTORE functions.
    That means that the key `"foo"` is normalized to `["foo"]`, and the key `[["foo"]]`
    is normalized to `["foo"]`.

*/
__js var ITF_KVSTORE = exports.ITF_KVSTORE = module .. @Interface('kvstore');


/**
   @class Key
   @summary Structure serving as a key into a [::KVStore].
   @desc
      A `Key` is either a String or Integer, or a tuple of Strings and Integers
      represented by an (abitrarily nested) Array.

      Nested Array keys such as `['employee', ['name', 'alex']]` are equivalent
      to their flattened representations: `['employee', 'name', 'alex']`. Similarly the
      key `1` is equivalent to `[1]` and `'alex'` is equivalent to `['alex']`.
      API functions that return keys will always return the canonical flattened
      array representation.

      Keys are sorted in a way that preserves the ordering of the
      individual elements of a tuple key from left to right. This makes it possible to
      efficiently query [::KVStore]s for all children with a common prefix.

*/

/**
   @class Range
   @summary Structure serving as a range of keys into a [::KVStore].
   @desc
      A `Range` is either a [::Key], or an object `{ begin: Key, end: Key }`.

      In the first case, the range denotes all children with the given key as
      prefix.

      In the second case, the range begins with the first key in the
      datastore greater than or equal to `begin` and ends with the last key
      less than `end`.

      The `end` property can be omitted, in which case the range consists of all keys greater
      than or equal to `begin`.

*/

/**
   @variable RANGE_ALL
   @summary A [::Range] denoting all keys in the data store.
*/
var RANGE_ALL = [];
exports.RANGE_ALL = RANGE_ALL;

/**
   @class Value
   @summary Object that can be stored as a value in a [::KVStore]
   @desc
     A `Value` can be any JSON-serializable JavaScript object.
*/

//----------------------------------------------------------------------
// KV API

/**
   @function get
   @param {::KVStore} [kvstore]
   @param {::Key} [key]
   @param {optional Object} [default]
   @return {::Value|Object} Value stored under key.
   @summary Retrieve value stored under key.
   @desc
      If the value is not present, `default` will be returned if provided.
      Otherwise, a [::NotFound] error will be thrown.
*/
function get(store, key, dfl) {
  var rv = store[ITF_KVSTORE].get(@util.normalizeKey(key));
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
   @param {::Key} [key]
   @param {::Value} [value]
   @summary Sets key to the given value.
*/
function set(store, key, value) {
  // assert value !== undefined; that would be a 'clear' operation
  return store[ITF_KVSTORE].put(@util.normalizeKey(key), value);
}
exports.set = set;

/**
   @function clear
   @param {::KVStore} [kvstore]
   @param {::Key} [key]
   @summary Clears any value currently associated with key.
*/
function clear(store, key) {
  return store[ITF_KVSTORE].put(@util.normalizeKey(key), undefined);
}
exports.clear = clear;

/**
   @function query
   @param {::KVStore} [kvstore]
   @param {::Range} [range]
   @param {optional Object} [settings]
   @return {sjs:sequence::Stream}
   @setting {Boolean} [reverse=false] Reverse direction of range
   @setting {Integer} [limit=-1] Limit number of elements returned in range. (-1 == no limit)
   @summary Return a [sjs:sequence::Stream] of `[key, value]` pairs in the given [::Range].
   @desc
     The `limit` setting is applied *after* the `reverse` setting, so that
     it will first reverse the sequence, and will then limit it starting
     from the first element of the reversed sequence.
*/
function query(store, range, options) {
  return store[ITF_KVSTORE].query(@util.normalizeKeyRange(range), options || {});
}
exports.query = query;

/**
   @function clearRange
   @param {::KVStore} [kvstore]
   @param {::Range} [range]
   @summary Clears any values associated with keys in given range.
*/
function clearRange(store, range) {
  withTransaction(store, function (store) {
    // TODO this currently has to encode/decode the keys twice
    //      this can be made more efficient by only encoding/decoding them once
    // TODO this should use `{ values: false }` since we're only interested in the values
    query(store, range) .. @each([key] -> clear(store, key));
  });
}
exports.clearRange = clearRange;


/**
   @function observe
   @param {::KVStore} [kvstore]
   @param {::Key} [key]
   @return {sjs:observable::Observable}
   @summary Return an [sjs:observable::Observable] of the value associated with key.

*/
function observe(store, key) {
  return store[ITF_KVSTORE].observe(@util.normalizeKey(key));
}
exports.observe = observe;


/**
   @function observeQuery
   @param {::KVStore} [kvstore]
   @param {::Range} [range]
   @param {optional Object} [settings]
   @return {sjs:observable::Observable}
   @setting {Boolean} [reverse=false] Reverse direction of range
   @setting {Integer} [limit=-1] Limit number of elements returned in range. (-1 == no limit)
   @summary Return an [sjs:observable::Observable] of the [sjs:sequence::Stream] of `[key, value]` pairs in the given range.

*/
function observeQuery(store, range, options) {
  range = @encoding.encodeKeyRange(range);
  return store[ITF_KVSTORE].observeQuery(range, options) .. @transform(kvs -> kvs .. @transform(decodeKV));
}
exports.observeQuery = observeQuery;

/**
   @function withTransaction
   @altsyntax kvstore .. withTransaction { |transaction| ... }
   @param {::KVStore} [kvstore]
   @param {Function} [block] Function that will be passed a transaction object (a [::KVStore]).
   @summary Run code in `block` in a transaction.
   @desc
     The transaction object passed to `block` is a [::KVStore] itself
     and can be used with all the [./kv::] API functions ([::get],
     [::set], etc).

     The transaction will be committed when `block` exits normally
     (and aborted when e.g. code within `block` throws an Error).

     On committing, the transaction ascertains if there are any
     conflicts: If any of the keys read or written to within the
     transaction have been concurrently modified from outside of the
     transaction, `block` will be called again; indefinitely until no
     conflicts are detected. Then all mutations performed in `block`
     will be applied to the underlying database and `withTransaction`
     returns. This guarantees that after a `withTransaction` call
     returns, all reads and writes have been performed atomically,
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
*/
function withTransaction(store, options, block) {
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
  @summary Simple fast and efficient persistent local key-value storage backed by [LevelDB](http://en.wikipedia.org/wiki/LevelDB)
  @function LevelDB
  @altsyntax LevelDB(location, [options]) { |kvstore| ... }
  @param {String} [location] Location of DB on disk
  @param {optional Object} [options] See https://github.com/rvagg/node-leveldown#leveldownopenoptions-callback
  @param {optional Function} [block] Lexical block to scope the LevelDB object to

  @function LevelDB.close
  @summary  Close the DB.
*/
function LevelDB(location, options, block) {
  // untangle args
  if (arguments.length == 1) {
    options = {};
  } else if (arguments.length < 3 && typeof options === 'function') {
    block = options;
    options = {};
  }

  var itf = require('./kv/leveldb').WrappedLevelDB(location, options);

  if (block) {
    try {
      block(itf);
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
  @setting {optional String} [file] The file path to use for loading/saving the DB
  @desc
    * If you provide `localStorage`, the DB will be loaded/saved to
      `localStorage`, using the name provided. This can only be used in
      the browser.

    * If you provide `file`, the DB will be loaded/saved to a file. This
      can only be used in Node.js.

    * If you do not provide either, the DB will be stored in memory. That
      means it is **not** persistent: if you close and restart your program,
      the data in the DB *will be lost*, with no way to retrieve it.

    If two DBs are loaded with the same `localStorage` or `file`, they will
    be exactly the same DB:

        // true
        @LocalDB({ localStorage: 'foo' }) === @LocalDB({ localStorage: 'foo' });

    ----

    LocalDB should **not** be used to store very large keys/values. Partly
    because the performance is bad, and partly because `localStorage` has
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
    block(itf);
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
    block(itf);
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
  @param {::Key} [prefix]
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
    block(itf);
  } else {
    return itf;
  }
}
exports.Subspace = Subspace;
