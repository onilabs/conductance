var { makeCache } = require('sjs:lru-cache');
var { each, map } = require('sjs:sequence');
var { ChangeBuffer } = require('./helpers');

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
      return upstream.query(entity);
    },
    withTransaction: function(options, block) {
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