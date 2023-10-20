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
             {id: '../kv', name: 'kv'}, // TODO circular dependency
             {id: './util', name: 'util'},
             {id: './encoding', name: 'encoding'}]);

//----------------------------------------------------------------------
// high-level ITF_KVSTORE interface implementation
// TODO move all the @encoding stuff into itf
function wrapDB(base) {

  /*
    Even though leveldb allows us to write in atomic batches, we need
    to sequentialize writing those batches with a mutex to ensure 
    transaction isolation.
  */
  var MutationMutex = @Semaphore(1, true);

  __js function kv_query(range, options) {
    var query_opts = {
      limit: -1,
      reverse: false,
      values: true,
      keys: true
    } .. @override(options);
    query_opts.gte = range.begin;
    query_opts.lt = range.end;

    return base.query(query_opts);
  }

  // helper to decode a key,val tuple:
  __js function decodeKV([k, v]) {
    return [ @encoding.decodeKey(k), v];
  }

  var kvstore_interface = {
    get: function(key) {
      __js key = @encoding.encodeKey(key);
      return base.get(key);
    },
    // XXX collect multiple temporally adjacent calls
    put: function(key, value) {
      __js key = @encoding.encodeKey(key);
      MutationMutex.synchronize { ||
        if (value === undefined) {
          return base.batch([{ type: 'del', key: key }]);
        } else {
          return base.batch([{ type: 'put', key: key, value: value }]);
        }
      }
    },
    query: function(range, options) {
      return kv_query(@encoding.encodeKeyRange(range), options) ..@transform(decodeKV);
    },
    observe: function(key) {
      key = @encoding.encodeKey(key);
      return @updatesToObservable(
        (base.changes) ..
          @unpack ..
          @filter(kv -> kv.key .. @encoding.encodedKeyEquals(key)) ..
          @transform({value} -> value),
        -> base.get(key));
    },

    observeQuery: function(range /*, options*/) {

      // XXX we might want an ObservableQuery that iterates over the data
      // lazily

      var encoded_range = @encoding.encodeKeyRange(range);

      return @StructuredStream('array.mutations') :: @Stream :: function(receiver) {

        base.changes .. 
          @buffer(1000, {drop:'throw'}) .. // XXX 1000 is arbitrary, and we don't want to throw. reset the map instead
          @withOpenStream {
            |changes|
            var QueryResult = @ObservableSortedMapVar({initial_elements:kv_query(encoded_range),
                                                       comparator: 'numericArray'});
            waitfor {
              @getStructuredStreamBase(
                QueryResult.Elements ..
                  @transform$map(decodeKV)
              )(receiver);
            }
            or {
              // XXX it would be great if we could batch-apply changes to QueryResult, maybe via
              // a mutate([actions]) method on ObservableSortedMapVar?
              changes .. 
                @unpack .. 
                @filter(__js {key} -> key .. @encoding.encodedKeyInRange(encoded_range.begin, encoded_range.end)) ..
                @each {
                |{key,value}|
                if (value === undefined) 
                  QueryResult.delete(key);
                else
                  QueryResult.set(key, value);
              }
            }
          }
      };
    },

    // TODO use SortedDict rather than converting keys to hex strings
    withTransaction: function(options, block) {

      /*
        LevelDB provides durability & atomicity via the 'batch'
        operation. We need to take care of consistency & isolation
        ourselves:
       */

      __js {
        // pending puts indexed by key in hex representation:
        var pendingPuts = {};
        
        // level-down doesn't have support for snapshots yet, so we
        // need to make sure that we get consistent reads:
        var reads = {};
        var queries = [];
        var T = {};
      }

      T[@kv.ITF_KVSTORE] = {
        get: function(key) {
          __js {
            key = @encoding.encodeKey(key);
          
            var string_key = @util.bytesToString(key);
            
            // check if we've written this key:
            var kv = pendingPuts[string_key];
          }
          if (kv) return kv[1];
          
          // else, check if we've already read it:
          __js var v = reads[string_key];
          if (v) return v;

          // else read from db:
          var val = base.get(key);
          __js reads[string_key] = val;
          return val;
        },
        put: __js function(key, value) {
          key = @encoding.encodeKey(key);
          pendingPuts[@util.bytesToString(key)] = [key, value];
        },
        query: function(range, options) {
          __js {
            range = @encoding.encodeKeyRange(range);
            queries.push([range.begin,range.end]);
          }
          return @transform(decodeKV) ::
            @Stream(function(r) {
              var limit = options.limit;
              var reverse = options.reverse;

              // query and patches are streams of [k, v] pairs:

              // we have to make sure that the query return values includes keys, 
              // so that we can correlate with patches.
              var query = kv_query(range, options .. @override({keys: true}));
              var patches = pendingPuts .. @ownValues .. @sort((a,b) ->
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
      while (true) {
        waitfor {
          // We are stricter than required here. All we need to
          // guarantee is that *multiple* reads/writes are consistent
          // with each other. But commonly a transaction would be used
          // for multiple reads/writes, so not much is gained by finer granularity.
          (base.changes) .. @unpack .. @each {
            |{key}|
            __js {
              var string_key = @util.bytesToString(key);
              var conflict = pendingPuts[string_key] ||
                             reads[string_key] ||
                             queries .. @any([b,e] -> key .. @encoding.encodedKeyInRange(b,e));
            }
            if (conflict) {
              console.log("DB transaction conflict on #{@encoding.decodeKey(key)}");
              break;
            }
          }
          // there is a conflict -> retry 
        }
        or {
          var rv = block(T);
          __js var ops = pendingPuts .. @ownValues .. @map([key,value] -> { type: value === undefined ? 'del' : 'put', key: key, value: value});
          if (ops.length === 0) return rv; // nothing to do.
          MutationMutex.acquire();
          collapse;
          try {
            base.batch(ops);
            return rv;
          }
          finally {
            MutationMutex.release();
          }
        }
        // go round loop and retry:
        pendingPuts = {};
        reads = {};
        console.log("conductance/modules/flux/kv/wrap.sjs: RETRY TRANSACTION");
      } /* while(true) */
    }
  };

  var rv = {};
  rv[@kv.ITF_KVSTORE] = kvstore_interface;
  return rv;
}
exports.wrapDB = wrapDB;
