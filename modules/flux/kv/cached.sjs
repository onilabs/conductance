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

function Cached(input, settings) {
  settings = {
    maxsize: 10000
  } .. @override(settings);

  var db = input[@kv.ITF_KVSTORE];

  var items = @makeCache(settings.maxsize);

  var listener = spawn db.changes ..@each(function (info) {
    info ..@each(function (info) {
      if (info.type === 'put' || info.type === 'del') {
        items.discard(JSON.stringify(info.key));

      } else {
        throw new Error("Invalid type: #{info.type}");
      }
    });
  });

  var out = {};

  out[@kv.ITF_KVSTORE] = {
    close: function () {
      listener.abort();
      listener = null;
      items = null;
      db = null;
    },

    changes: db.changes,

    get: function (key) {
      var json_key = JSON.stringify(key);

      var entry = items.get(json_key);
      if (entry === null) {
        var value = db.get(key);
        if (value !== undefined) {
          items.put(json_key, value);
        }
        return value;

      } else {
        return entry;
      }
    },

    // No need to manually clear out the cache: it will be cleared out by the spawn up above
    put: db.put,

    // TODO use cache for this too
    query: db.query,

    // TODO use cache for this too
    observe: db.observe,

    // TODO use cache for transactions as well
    withTransaction: db.withTransaction
  };

  return out;
}
exports.Cached = Cached;
