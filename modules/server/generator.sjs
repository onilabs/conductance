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

@ = require(['sjs:object', 'sjs:sequence']);
@func = require('sjs:function');
@bundle = require('sjs:bundle');
@logging = require('sjs:logging');
@fs = require('sjs:nodejs/fs');
@url = require('sjs:url');
var {@murmur3_32} = require('sjs:crypto/murmur');

/**
  @summary Utilities for generator (`.gen`) modules
  @hostenv nodejs
  @inlibrary mho:std when nodejs
*/

/**
  @function moduleTimestamp
  @summary Generates a function that always returns the current date
  @return {Function}
  @desc
    It can be difficult to create a correct etag for a given
    generator (e.g because it has a lot of dependencies). In this case it's often
    easier to use the module import time as an etag. This ensures that the contents
    of a generator will be cached for the lifetime of the module,
    but will be re-generated when the module is reloaded (or the server process is
    restarted).

    ### Example:

        exports.etag = @moduleTimestamp();
*/
    
__js exports.moduleTimestamp = function() {
  var t = new Date().getTime().toString();
  return -> t;
}

var CachedBundle = exports.CachedBundle = function(settings) {
  var self = {};
  var _cache = null;
  var _stale = true;
  var isStale = self.isStale = function(compute_etag) {
    // sets _stale, which short-circuits future calls until
    // it's cleared by refresh()
    _stale = _stale || !_cache || (compute_etag && (genEtag(_cache.sources) !== _cache.etag));
    return _stale;
  };

  var refresh = @func.sequential(function(compute_etag) {
    if (isStale(compute_etag)) {
      var curr = { generated: new Date() };
      @logging.verbose("bundle.findDependencies: ", settings);
      var deps = curr.deps = @bundle.findDependencies(settings.sources, settings);
      curr.sources = deps.modules
        .. @ownValues
        .. @filter(mod -> mod.loaded)
        .. @map(mod -> mod.path .. @url.toPath);
      curr.etag = genEtag(curr.sources);
      _cache = curr;
      _stale = false;
    }
    return _cache;
  });

  var genEtag = function(sources) {
    var max = 0;
    var inodes = sources .. @map.par(10,
      function(source) {
        var st = @fs.stat(source);
        var mt = st.mtime.getTime();
        if (max < mt) max = mt;
        return st.ino;
      });
    return "#{max}-#{inodes.join('-') .. @murmur3_32(0)}";
  };

  self.etag = -> refresh(true).etag .. String();

  self.content = @func.sequential(function() {
    var curr = refresh(false);
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

/**
  @function BundleGenerator
  @summary Create a generator for an SJS bundle
  @param {Object} [settings] bundle settings
  @return {Object}
  @desc
    A BundleGenerator implements a server-side generator for
    serving a compiled bundle based on `settings`, on demand.
    See [sjs:bundle::create] for a description of possible settings.

    ### Example:

        # bundle.js.gen
        module.exports = @BundleGenerator({
          sources: [ "./main.sjs" ],
          compile: true,
        });

    The returned object implements `content` and `etag` methods,
    to ensure that the bundle is cached where possible, but is
    regenerated when _any_ file in the bundle is modified.
*/
var BundleGenerator = exports.BundleGenerator = function(settings) {
  var bundle = CachedBundle(settings);
  return {
    content: -> bundle.content(),
    etag: -> bundle.etag(),
  };
};
