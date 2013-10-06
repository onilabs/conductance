var { makeCache } = require('sjs:lru-cache');
var { each, map, makeIterator, Stream } = require('sjs:sequence');
var { exclusive } = require('sjs:function');
var { ChangeBuffer } = require('./helpers');

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
        receiver(memoized_results[i++]);
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
exports.Cache = function(size, upstream) {

  var items = makeCache(size);

  var CHANGE_BUFFER_SIZE = 100; // XXX should this be configurable?
  var change_buffer = ChangeBuffer(CHANGE_BUFFER_SIZE);

  var updater_stratum = spawn upstream.watch {
    |changes|
    changes .. each { |id| console.log("discard #{id}"); items.discard(id) }
    change_buffer.addChanges(changes);
  };


  var rv = {
    write: function(entity) {
      // discard will happen automatically via `watch` loop
      return upstream.write(entity);
    },
    read: function(entity) {
      var found = {};
      var remotes = [];
      
      var entry = items.get(entity.id);
      if (!entry) {
        items.put(entity.id, entry = upstream.read(entity));
      }
      return entry;
    },
    query: function(entity) {
      // XXX expulsion; finalization
      var key = JSON.stringify(entity);
      var entry = items.get(key);
      if (!entry) {
        items.put(key, entry = MemoizedStream(upstream.query(entity)));
      }
      return entry;
    },
    withTransaction: function(options, block) {
      // for consistency, we need to have transactions handled directly by the backend:
      upstream.withTransaction(options, block);
    },
    watch: function(f) {
      var start_revision = change_buffer.revision, current_revision;
      while (true) {
        current_revision = change_buffer.emitter.wait();
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