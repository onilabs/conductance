@ = require(['sjs:object', 'sjs:sequence']);
@func = require('sjs:function');
@bundle = require('sjs:bundle');
@logging = require('sjs:logging');
@fs = require('sjs:nodejs/fs');
@url = require('sjs:url');

exports.moduleTimestamp = function() {
  var t = new Date().getTime().toString();
  return -> t;
}

var CachedBundle = exports.CachedBundle = function(settings) {
  var self = {};
  var _cache = null;
  var _stale = true;
  var isStale = self.isStale = function() {
    // sets _stale, which short-circuits future calls until
    // it's cleared by refresh()
    _stale = _stale || !_cache || maxMtime(_cache.sources) > _cache.mtime;
    return _stale;
  };

  var refresh = @func.sequential(function() {
    if (isStale()) {
      var curr = { generated: new Date() };
      @logging.verbose("bundle.findDependencies: ", settings);
      var deps = curr.deps = @bundle.findDependencies(settings.sources, settings);
      curr.sources = deps.modules
        .. @ownValues
        .. @filter(mod -> mod.loaded)
        .. @map(mod -> mod.path .. @url.toPath);
      curr.mtime = maxMtime(curr.sources);
      _cache = curr;
      _stale = false;
    }
    return _cache;
  });

  var maxMtime = function(sources) {
    var max = 0;
    sources .. @each {|source|
      var mt = @fs.stat(source).mtime.getTime();
      if (max < mt) max = mt;
    }
    return max;
  };

  self.etag = -> refresh().mtime .. String();

  self.content = @func.sequential(function() {
    var curr = refresh();
    if (!curr.content) {
      var content = @bundle.generateBundle(curr.deps, settings);
      curr.content = settings.output ? @fs.readFile(settings.output) : content .. @join("\n");
    } else {
      @logging.verbose("Reusing generated bundle");
    }
    return curr.content;
  });

  self.modifySettings = function(s) {
    settings = s;
    _cache = null;
  }

  return self;
};

var BundleGenerator = exports.BundleGenerator = function(settings) {
  var bundle = CachedBundle(settings);
  return {
    content: -> bundle.content(),
    etag: -> bundle.etag(),
  };
};
