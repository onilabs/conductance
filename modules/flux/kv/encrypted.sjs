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
  @nodoc
*/

@ = require(['sjs:std',
             { id: '../kv', name: 'kv' },
             { id: 'sjs:sjcl', name: 'sjcl' }]);

function Encrypted(input, settings) {
  function encrypt(value) {
    try {
      return @sjcl.json.encrypt(settings.password, JSON.stringify(value));
    }
    catch (e) {
      // sjcl doesn't generate exceptions of type 'Error', so they
      // don't contain a stacktrace. We'll wrap them here for now:
      if (!(e instanceof Error))
        throw new Error("Encryption failed: #{e}");
      else
        throw e;
    }
  }

  function decrypt(value) {
    try {
      return JSON.parse(@sjcl.json.decrypt(settings.password, value));
    }
    catch (e) {
      // sjcl doesn't generate exceptions of type 'Error', so they
      // don't contain a stacktrace. We'll wrap them here for now:
      if (!(e instanceof Error))
        throw new Error("Decryption failed: #{e}");
      else
        throw e;
    }
  }

  function decodeKV([key, value]) {
    return [key, decrypt(value)];
  }

  function wrap(input, in_transaction) {
    var db = input[@kv.ITF_KVSTORE];

    var out = {};

    out[@kv.ITF_KVSTORE] = {
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
        return db.query(range, options) .. @transform(decodeKV);
      },
      observe: function (key) {
        return db.observe(key) .. @transform(decrypt);
      },
      observeQuery: function (range, options) {
        return db.observeQuery(range, options) .. @transform$map(decodeKV);
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
