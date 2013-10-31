@ = require.merge('sjs:object', 'sjs:sequence');
@func = require('sjs:function');
@bundle = require('sjs:bundle');
@logging = require('sjs:logging');
@fs = require('sjs:nodejs/fs');
@url = require('sjs:url');

exports.moduleTimestamp = function() {
  var t = new Date().getTime().toString();
  return -> t;
}

var CachedBundle = function(settings) {
  var _cache = null;
  var refresh = @func.sequential(function() {
    var needsRefresh = (!_cache || maxMtime(_cache.sources) > _cache.mtime);
    if (needsRefresh) {
      var curr = { generated: new Date() };
      @logging.verbose("bundle.findDependencies: ", settings);
      var deps = curr.deps = @bundle.findDependencies(settings.sources, settings);
      curr.sources = deps.modules
        .. @ownValues
        .. @filter(mod -> mod.loaded)
        .. @map(mod -> mod.path .. @url.toPath);
      curr.mtime = maxMtime(curr.sources);
      _cache = curr;
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

  this.etag = -> refresh().mtime .. String();

  this.content = @func.sequential(function() {
    var curr = refresh();
    if (!curr.content) {
      var content = @bundle.generateBundle(curr.deps, settings);
      curr.content = settings.output ? @fs.readFile(settings.output) : content .. @join("\n");
    } else {
      @logging.verbose("Reusing generated bundle");
    }
    return curr.content;
  });
};

var BundleGenerator = exports.BundleGenerator = function(settings) {
  var bundle = new CachedBundle(settings);
  return {
    content: -> bundle.content(),
    etag: -> bundle.etag(),
  };
};
