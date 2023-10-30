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

var { spawn } = require('sjs:sys');
var { makeCache } = require('sjs:lru-cache');
var { each, map, makeIterator, Stream } = require('sjs:sequence');
var { wait } = require('sjs:event');
var { override, clone } = require('sjs:object');
var { exclusive } = require('sjs:function');
var { ChangeBuffer, structuralClone } = require('./helpers');

/** @nodoc */

// XXX This functionality needs a rewrite that implements finalization

//----------------------------------------------------------------------
// sequence module backfill

// XXX implement finalization
function MemoizedStream(s) {
  var memoized_results = [], done = false;
  var iterator = makeIterator(s);
  var next = exclusive(function() {
    if (!iterator.hasMore())
      done = true;
    else
      memoized_results.push(iterator.next());
  }, true);

  var rv = Stream(function(receiver) {
    var i=0;
    while (true) {
      while (i< memoized_results.length)
        receiver(memoized_results[i++] .. structuralClone);
      if (done) return;
      next();
    }
  });

  // XXX can we use this?
//  rv.destroy = iterator.destroy();

  return rv;
}

//----------------------------------------------------------------------

// XXX need to figure out API for lifecycle - see https://app.asana.com/0/882077202919/7740493937036
exports.Cache = function(upstream, options) {

  options = {
    maxsize: 10000,
    cacheQueries: true
  } .. override(options);

  var items = makeCache(options.maxsize);

  // Items (queries) that need to be cleared from the cache when *any*
  // object with the given kind has changed.
  // Structure is : { schema_name: [item_key, ...], ... }
  // XXX doesn't get cleared if items are expunged from the lru cache yet
  var query_items = {};
  
  var CHANGE_BUFFER_SIZE = 100; // XXX should this be configurable?
  var change_buffer = ChangeBuffer(CHANGE_BUFFER_SIZE);

  var updater_stratum = spawn(-> upstream.watch {
    |changes|
    changes .. each { 
      |{id, schema}| 
      //console.log("discard #{id}"); 
      items.discard(id);
      
      var queries;
      //console.log("SCHEMA #{schema} has changed");
      if ((queries = query_items[schema])) {
        //console.log("#{queries.length} items affected");
        queries .. each {
          |id|
          //console.log("clearing #{id}");
          items.discard(id);
        }
        delete query_items[schema];
      }
    }
    change_buffer.addChanges(changes);
  });

  var pendingReads = {};

  var rv = {
    write: function(entity) {
      // discard will happen automatically via `watch` loop
      return upstream.write(entity);
    },
    read: function(entity) {
      var entry = items.get(entity.id);
      if (!entry) {
        if (!pendingReads[entity.id]) {
          waiting = 0;
          pendingReads[entity.id] = spawn (function(S) {
            S.entry = upstream.read(entity);
            items.put(entity.id, S.entry);
          });
        }
        try {
          ++pendingReads[entity.id].waiting;
          entry = pendingReads[entity.id].wait().entry;
        }
        finally {
          if (--pendingReads[entity.id].waiting === 0) {
            // XXX we *could* abort here, but it's an uncommon edge
            //case to have reads retracted, so we optimize for the 
            // common case where abort would be redundant (because the
            // read has succeeded).
            //pendingReads[entity.id].abort();
            delete pendingReads[entity.id];
          }
        }
      }
      return entry .. structuralClone;
    },
    query: function(entity) { 
      if (options.cacheQueries) {
        // XXX expulsion; finalization
        var key = JSON.stringify(entity);
        
        return Stream(function(receiver) {
          var entry = items.get(key);
          if (!entry) {
            items.put(key, entry = MemoizedStream(upstream.query(entity)));
            var hook;
            if (!(hook = query_items[entity.schema]))
              hook = query_items[entity.schema] = [];
            hook.push(key);
          }
          entry .. each(receiver);
        });
      }
      else {
        return upstream.query(entity);
      }
    },
    withTransaction: function(options, block) {
      // for consistency, we need to have transactions handled directly by the backend:
      upstream.withTransaction(options, block);
    },
    watch: function(f) {
      var start_revision = change_buffer.revision, current_revision;
      while (true) {
        current_revision = change_buffer.dispatcher.receive();
        while (current_revision !== start_revision) {
          f(change_buffer.getChanges(start_revision));
          start_revision = current_revision;
          current_revision = change_buffer.revision;
        }
      }
    }

  };
  return rv;
};
