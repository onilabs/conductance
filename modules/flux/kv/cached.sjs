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

  var lruCache = @makeCache(settings.maxsize);
  var hashes = {};
  var spawners = {};

  var itf = db[@kv.ITF_KVSTORE];

  function discard_from_cache(s_key) {
    var h = itf.hashKey(s_key, settings.buckets);

    if (h in hashes) {
      delete hashes[h][s_key];

      if (is_empty(hashes[h])) {
        spawners[h].abort();
        // TODO are these necessary ?
        delete hashes[h];
        delete spawners[h];
      }
    }
  }

  function add_to_cache(s_key, value) {
    var info = lruCache.put(s_key, value);

    info.discarded ..@each(discard_from_cache);

    var h = itf.hashKey(s_key, settings.buckets);

    if (!(h in hashes)) {
      hashes[h] = {};

      spawners[h] = spawn (function () {
        try {
          itf.waitForHashChange(h, settings.buckets);

        } finally {
          // TODO hasOwnProperty
          for (var key in hashes[h]) {
            lruCache.discard(key);
          }

          delete hashes[h];
          delete spawners[h];
        }
      })();
    }

    hashes[h][s_key] = true;
  }

  function get(key) {
    var s_key = JSON.stringify(key);

    var value = lruCache.get(s_key);
    if (value === null) {
      value = itf.get(key);

      if (value !== undefined) {
        add_to_cache(s_key, value);
      }
    }

    return value;
  }

  function close() {
    // TODO hasOwnProperty
    for (var s in spawners) {
      spawners[s].abort();
    }

    lruCache.clear();
    lruCache = null;
    hashes = null;
    spawners = null;
  }

  var out = {};

  out[@kv.ITF_KVSTORE] = {
    waitForHashChange: itf.waitForHashChange,

    hashKey: itf.hashKey,

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
