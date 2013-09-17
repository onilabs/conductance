var { makeCache } = require('sjs:lru-cache');
var { each } = require('sjs:sequence');

exports.Cache = function(size, upstream) {

  var items = makeCache(size);

  var updater_stratum = spawn upstream.watch {
    |changes|
    changes .. each { |id| console.log("discard #{id}"); items.discard(id) }
  };


  var rv = {
    write: function(entity) {
      // discard will happen automatically via `watch` loop
      return upstream.write(entity);
    },
    read: function(entity) {
      var entry = items.get(entity.id);
      if (entry) {
        console.log("cache hit on #{entity.id}");
        return JSON.parse(entry);
      }
      else 
        console.log("cache miss on #{entity.id}");

      var rv = upstream.read(entity);
      if (rv) {
        console.log("putting #{rv.id} into cache");
        items.put(rv.id, JSON.stringify(rv));
      }
      return rv;
    },
    query: function(entity) {
      return upstream.query(entity);
    }
  };
  return rv;
};