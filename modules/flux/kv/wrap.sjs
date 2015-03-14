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
             {id: '../kv', name: 'kv'}, // TODO circular dependency
             {id: './util', name: 'util'},
             {id: './encoding', name: 'encoding'}]);

//----------------------------------------------------------------------
// high-level ITF_KVSTORE interface implementation
// TODO move all the @encoding stuff into itf
function wrapDB(itf) {
  var out = {};

  function kv_query(range, options) {
    var query_opts = {
      limit: -1,
      reverse: false,
      values: true
    } .. @override(options);
    query_opts.gte = range.begin;
    query_opts.lt = range.end;

    return itf.query(query_opts);
  }

  // helper to decode a key,val tuple:
  __js function decodeKV([k, v]) {
    return [ @encoding.decodeKey(itf, k),
             itf.decodeValue(v) ];
  }

  var kvstore_interface = {
    changes: itf.changes ..@transform(function (info) {
      return info ..@map(function (info) {
        if (info.type === 'put') {
          return {
            type: info.type,
            key: @encoding.decodeKey(itf, info.key),
            value: itf.decodeValue(info.value),
          };

        } else if (info.type === 'del') {
          return {
            type: info.type,
            key: @encoding.decodeKey(itf, info.key)
          };

        } else {
          throw new Error("Invalid type: #{info.type}");
        }
      });
    }),

    get: function(key) {
      key = @encoding.encodeKey(itf, key);
      return itf.decodeValue(itf.get(key));
    },
    // XXX collect multiple temporally adjacent calls
    put: function(key, value) {
      key = @encoding.encodeKey(itf, key);
      if (value === undefined) {
        return itf.batch([{ type: 'del', key: key }]);
      } else {
        value = itf.encodeValue(value);
        return itf.batch([{ type: 'put', key: key, value: value }]);
      }
    },
    query: function(range, options) {
      return kv_query(@encoding.encodeKeyRange(itf, range), options) ..@transform(decodeKV);
    },
    observe: function(key) {
      key = @encoding.encodeKey(itf, key);
      return @eventStreamToObservable(
        (itf.changes) ..
          @unpack ..
          @filter(kv -> kv.key .. @encoding.encodedKeyEquals(key)) ..
          @transform({value} -> itf.decodeValue(value)),
        -> itf.decodeValue(itf.get(key)));
    },
    /*observeQuery: function(range, options) {
      return @eventStreamToObservable(
        MutationEmitter ..
          @filter(kvs -> kvs .. @any(kv -> kv.key .. @encoding.encodedKeyInRange(begin, end))) ..
          @transform(-> kvstore_interface.range(begin, end, options)),
        -> kvstore_interface.query(range, options)
      );
    },*/
    // TODO use SortedDict rather than converting keys to hex strings
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
      var queries = [];

      var conflict = false;

      var T = {};
      T[@kv.ITF_KVSTORE] = {
        get: function(key) {
          key = @encoding.encodeKey(itf, key);

          var hex_key = @util.bytesToHexString(key);

          // check if we've written this key:
          var kv = pendingPuts[hex_key];
          if (kv) return itf.decodeValue(kv[1]);

          // else, check if we've already read it:
          var v = reads[hex_key];
          if (v) return itf.decodeValue(v);

          // else read from db:
          var val = itf.get(key);
          reads[hex_key] = val;
          return itf.decodeValue(val);
        },
        put: function(key, value) {
          key = @encoding.encodeKey(itf, key);
          if (value !== undefined) {
            value = itf.encodeValue(value);
          }
          pendingPuts[@util.bytesToHexString(key)] = [key, value];
        },
        query: function(range, options) {
          range = @encoding.encodeKeyRange(itf, range);
          queries.push([range.begin,range.end]);

          return @transform(decodeKV) ::
            @Stream(function(r) {
              var limit = options.limit;
              var reverse = options.reverse;

              // query and patches are streams of [k, v] pairs:
              var query = kv_query(range, options);
              var patches = pendingPuts .. @values .. @sort((a,b) ->
                                                            reverse ?
                                                              @encoding.encodedKeyCompare(b[0],a[0]) :
                                                            @encoding.encodedKeyCompare(a[0],b[0]));

              var preceding = reverse ? @encoding.encodedKeyGreater : @encoding.encodedKeyLess;

              @consume(patches) {
                |next_patch|
                var patch = next_patch();
                // find first patch, where patch[0] >= range.begin
                // (reverse case: first patch, where patch[0] < range.end)

                if (reverse) {
                  while (patch && @encoding.encodedKeyGtEq(patch[0], range.end))
                    patch = next_patch();
                }
                else {
                  while (patch && @encoding.encodedKeyLess(patch[0], range.begin))
                    patch = next_patch();
                }

                query .. @each {
                  |q|

                  // apply patches preceding q:
                  while (patch && preceding(patch[0], q[0])) {
                    if (patch[1] !== undefined) {
                      r(patch);
                      if (--limit === 0) return;
                    }
                    patch = next_patch();
                  }
                  if (patch && @encoding.encodedKeyEquals(patch[0], q[0])) {
                    if (patch[1] !== undefined) {
                      r(patch);
                      if (--limit === 0) return;
                    }
                    patch = next_patch();
                    continue; // patch overrides current value
                  }
                  // emit q:
                  r(q);
                  if (--limit === 0) return;
                }

                // emit remaining patches
                if (reverse) {
                  while (patch && @encoding.encodedKeyGtEq(patch[0], range.begin)) {
                    if (patch[1] !== undefined) {
                      r(patch);
                      if (--limit === 0) return;
                    }
                    patch = next_patch();
                  }
                }
                else {
                  while (patch && @encoding.encodedKeyLess(patch[0], range.end)) {
                    if (patch[1] !== undefined) {
                      r(patch);
                      if (--limit === 0) return;
                    }
                    patch = next_patch();
                  }
                }
              }
            });
        },
        observe: function(key) {
          throw new Error('write me');
        },
        observeQuery: function(range, options) {
          throw new Error('write me');
        },
        withTransaction: function(options, block) {
          return block(T);
        },
      };

      // retry transactions until they succeed:
      var rv;
      while (true) {
        rv = undefined;
        waitfor {
          rv = block(T);
        }
        or {
          // We are stricter than required here. All we need to
          // guarantee is that *multiple* reads/writes are consistent
          // with each other. But commonly a transaction would be used
          // for multiple reads/writes, so not much is gained by finer granularity.
          (itf.changes) .. @unpack .. @each {
            |{key}|
            var hex_key = @util.bytesToHexString(key);
            if (pendingPuts[hex_key] ||
                reads[hex_key] ||
                queries .. @any([b,e] -> key .. @encoding.encodedKeyInRange(b,e)))
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
          itf.batch(pendingPuts .. @values .. @map([key,value] -> { type: value === undefined ? 'del' : 'put', key: key, value: value}));
          return rv;
        }
        // go round loop and retry:
        pendingPuts = {};
        reads = {};
        conflict = false;
      }
    }
  };

  out[@kv.ITF_KVSTORE] = kvstore_interface;
  return out;
}
exports.wrapDB = wrapDB;
