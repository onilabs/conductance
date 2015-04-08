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

@ = require(['sjs:std',
             'sjs:lru-cache',
             { id: '../kv', name: 'kv' }]);

// TODO this should be someplace else
function is_empty(o) {
  for (var s in o) {
    if ({}.hasOwnProperty.call(o, s)) {
      return false;
    }
  }
  return true;
}

function Cached(db, settings) {
  // TODO figure out good defaults for these
  settings = {
    maxsize: 10000,
    buckets: 10000
  } .. @override(settings);

  var keyCache = @makeCache(settings.maxsize);
  var hashCache = @makeCache(settings.maxsize);
  var hashes = {};
  var spawners = {};

  function hashKey(key, buckets) {
    var s_key = JSON.stringify([key, buckets]);

    if (hashCache.has(s_key)) {
      return hashCache.get(s_key);

    } else {
      var hash = itf.hashKey(key, buckets);
      hashCache.set(s_key, hash);
      return hash;
    }
  }

  var itf = db[@kv.ITF_KVSTORE];

  var discarded = spawn keyCache.discarded ..@each(function (s_key) {
    var h = hashKey(JSON.parse(s_key), settings.buckets);

    if (h in hashes) {
      delete hashes[h][s_key];

      if (is_empty(hashes[h])) {
        spawners[h].abort();
        // TODO are these necessary ?
        delete hashes[h];
        delete spawners[h];
      }
    }
  });

  function wait_for_key(key, s_key) {
    var h = hashKey(key, settings.buckets);

    if (!(h in hashes)) {
      hashes[h] = {};

      spawners[h] = spawn (function () {
        try {
          itf.waitForHashChange(h, settings.buckets);

        } finally {
          hashes[h] ..@ownKeys ..@each(function (s_key) {
            keyCache.discard(s_key);
          });

          // TODO are these necessary ?
          delete hashes[h];
          delete spawners[h];
        }
      })();
    }

    hashes[h][s_key] = true;
  }

  function get(key) {
    var s_key = JSON.stringify(key);

    if (keyCache.has(s_key)) {
      return keyCache.get(s_key);

    } else {
      // TODO what about race conditions ?
      waitfor {
        var value = itf.get(key);
        keyCache.put(s_key, value);

      } and {
        wait_for_key(key, s_key);
      }

      return value;
    }
  }

  function close() {
    spawners ..@ownValues ..@each(function (x) {
      x.abort();
    });

    discarded.abort();
    keyCache.clear();
    hashCache.clear();

    keyCache = null;
    hashCache = null;
    discarded = null;
    hashes = null;
    spawners = null;
  }

  var out = {};

  out[@kv.ITF_KVSTORE] = {
    waitForHashChange: itf.waitForHashChange,

    hashKey: hashKey,

    get: get,

    // No need to manually clear out the cache: it will be cleared out by the spawn up above
    put: itf.put,

    // TODO use cache for this too
    query: itf.query,

    // TODO use cache for this too
    observe: itf.observe,

    // TODO use cache for this too
    withTransaction: itf.withTransaction
  };

  out.close = close;

  return out;
}

exports.Cached = Cached;
