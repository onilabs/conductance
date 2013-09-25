var { makeCache } = require('sjs:lru-cache');
var { each, map } = require('sjs:sequence');

exports.Cache = function(size, upstream) {

  var items = makeCache(size);

  var updater_stratum = spawn upstream.watch {
    |changes|
    changes .. each { |id| console.log("discard #{id}"); items.discard(id) }
  };


  var rv = {
    write: function(entities) {
      // discard will happen automatically via `watch` loop
      return upstream.write(entities);
    },
    read: function(entities) {
      var found = {};
      var remotes = [];
      
      entities .. each { 
        |entity|
        var entry = items.get(entity.id);
        if (entry) {
//          console.log("cache hit on #{entity.id}");
          found[entity.id] = entry; // XXX can't do this because of date -> JSON.parse(entry);
        }
        else {
          console.log("cache miss on #{entity.id}");
          remotes.push(entity);
        }
      }

      if (remotes.length) {
        upstream.read(remotes) .. each {
          |entity|
          found[entity.id] = entity;
//XXX          items.put(entity.id, JSON.stringify(entity));
          items.put(entity.id, entity);
        }
      }

      // XXX we need to handle cache invalidates that happened while getting remotes

      // consolidate found entities with input array
      return entities .. map({id} -> found[id]);
    },
    query: function(entity, idsOnly) {
      return upstream.query(entity, idsOnly);
    },
    withTransaction: function(options, block) {
      upstream.withTransaction(options, block);
    }
  };
  return rv;
};