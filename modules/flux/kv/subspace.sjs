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
  @nodoc
*/

@ = require(['sjs:std',
             { id: './util', name: 'util' },
             { id: '../kv', name: 'kv' }]);

function Subspace(input, prefix) {
  __js {
    prefix = @util.normalizeKey(prefix);
    
    function prefixKey(key) {
      return prefix.concat(key);
    }
    
    function unprefixKey(key) {
      if (!Array.isArray(key)) {
        throw new Error("Invalid key");
      }
      
      for (var i = 0; i < prefix.length; ++i) {
        // TODO better equality check
        if (key[i] !== prefix[i]) {
          throw new Error("Invalid prefix");
        }
      }
      
      return key.slice(i);
    }

    function unprefixKV([key, value]) {
      return [unprefixKey(key), value];
    }
  } // __js

  function wrap(input, in_transaction) {
    __js {
      var db = input[@kv.ITF_KVSTORE];
      
      var out = {};
    } // __js

    out[@kv.ITF_KVSTORE] = {
      get: __js function(key) {
        return db.get(prefixKey(key));
      },
      put: __js function(key, value) {
        return db.put(prefixKey(key), value);
      },
      query: function(range, options) {
        return db.query(@util.transformKeyRange(range, prefixKey), options) .. @transform(unprefixKV);
      },
      observe: __js function(key) {
        return db.observe(prefixKey(key));
      },
      observeQuery: function(range, options) {
        return db.observeQuery(@util.transformKeyRange(range, prefixKey), options) .. @transform(results -> results .. @transform(unprefixKV));
      },

      withTransaction: function(options, block) {
        if (in_transaction) {
          return block(out);

        } else {
          return db.withTransaction(options, __js function (input) {
            return block(wrap(input, true));
          });
        }
      }
    };

    return out;
  }

  return wrap(input, false);
}
exports.Subspace = Subspace;
