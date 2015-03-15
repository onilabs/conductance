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
             { id: '../kv', name: 'kv' },
             { id: 'sjs:sjcl', name: 'sjcl' }]);

function Encrypted(input, settings) {
  function encrypt(value) {
    return @sjcl.json.encrypt(settings.password, JSON.stringify(value));
  }

  function decrypt(value) {
    return JSON.parse(@sjcl.json.decrypt(settings.password, value));
  }

  function decodeKV([key, value]) {
    return [key, decrypt(value)];
  }

  function wrap(input, in_transaction) {
    var db = input[@kv.ITF_KVSTORE];

    var out = {};

    out[@kv.ITF_KVSTORE] = {
      changes: db.changes ..@transform(function (info) {
        return info ..@map(function (info) {
          if (info.type === 'put' || info.type === 'del') {
            return info;

          } else {
            throw new Error("Invalid type: #{info.type}");
          }
        });
      }),

      get: function (key) {
        var value = db.get(key);
        if (value === undefined) {
          return value;
        } else {
          return decrypt(value);
        }
      },
      put: function (key, value) {
        if (value === undefined) {
          return db.put(key, value);
        } else {
          return db.put(key, encrypt(value));
        }
      },
      query: function (range, options) {
        return db.query(range, options) ..@transform(decodeKV);
      },
      observe: function (key) {
        return db.observe(key) ..@transform(decrypt);
      },
      withTransaction: function (options, block) {
        if (in_transaction) {
          return block(out);

        } else {
          return db.withTransaction(options, function (input) {
            return block(wrap(input, true));
          });
        }
      }
    };

    return out;
  }

  return wrap(input, false);
}
exports.Encrypted = Encrypted;
