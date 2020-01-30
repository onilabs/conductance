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
  @summary Application environment
  @inlibrary mho:std as env
  @desc
    This module implements a process-global registry of properties, with functions for setting and retrieving
    those properties in different ways.

    In a 'nodejs' hostenv, the environment contains a number of predefined application properties as descripted below.

    In the 'xbrowser' hostenv it is just an empty shell to be used as you wish.

    The module object itself is also a function - calling `require('mho:env')(key)` is
    a shortcut for `require('mho:env').get(key)`.

*/

var { get, extend, hasOwn, ownKeys, ownPropertyPairs } = require('sjs:object');
var { isFunction } = require('sjs:function');
var { transform, each, sort, join } = require('sjs:sequence');

var RegistryProto = {};

/**
  @function factory
  @param {String} [key]
  @param {Function} [fn]
  @summary Define a value that is recomputed every time it is accessed
  @desc
    Each time `get` is called for `key`, it will return the result
    of calling `fn` with the `mho:env` module as the first argument.

    See also [::lazy].
*/
RegistryProto.factory = function(key, factory) {
  if (!isFunction(factory)) {
    throw new Error("Not a function: #{factory}");
  }
  this._db[key] = { factory: factory, cache: false };
};

/**
  @function value
  @param {String} [key]
  @param {Object} [value]
  @summary Define a value
  @return {Object} the value passed in
  @desc
    Future calls to `get(key)` will return `val`.

  @function set
  @param {String} [key]
  @param {Object} [value]
  @summary Alias for [::value]
*/
RegistryProto.value = RegistryProto.set = function(key, val) {
  this._db[key] = { instance: val };
  return val;
};

/**
  @function lazy
  @param {String} [key]
  @param {Function} [fn]
  @summary Define a value that is initialized the first time it is accessed
  @desc
    The first time `key` is requested, `fn` will be called
    with the `mho:env` module as the first argument. The return
    value of `fn` will in turn be returned from `get`, and
    will be cached for future calls to `get` with the same `key`.

    All cached values can be deleted by calling [::clearCached],
    which will cause all lazy values in the environment to be
    recomputed the next time they are accessed.
*/
RegistryProto.lazy = function(key, factory) {
  this._db[key] = {
    factory: factory,
    cache: true,
  };
};



/**
  @function get
  @param {String} [key]
  @param {optional Object} [default]
  @summary Get the current value for a given key
  @return {Object}
  @desc
    If the value has not been defined in the environment,
    `default` will be returned or an error thrown if no `default` given.
*/
RegistryProto._NotFound = function(key) {
  return new Error("Key '#{key}' not found in #{this}");
};

RegistryProto.get = function(key, _default) {
  var pair = this._get(key);
  if (!pair) {
    if (arguments.length > 1) return _default;
    throw this._NotFound(key);
  }

  var [owner, service] = pair;
  if (service .. hasOwn('instance')) {
    return service.instance;
  } else {
    var instance = service.factory.call(owner, owner);
    if (service.cache) service.instance = instance;
    return instance;
  }
};

RegistryProto._get = function(key) {
  if (this._has(key)) return [this, this._db[key]];
  if (this._parent) return this._parent._get(key);
};

/* like _has, but this instance only - no inherited keys from _parent */
RegistryProto._has = function(key) {
  return this._db .. hasOwn(key);
};

/**
  @function has
  @param {String} [key]
  @summary Return whether a key is defined
  @return {Boolean}
  @desc
    Returns `true` if the value is defined in this environment,
    `false` otherwise.
*/
RegistryProto.has = function(key) {
  return Boolean(this._get(key));
};

/**
  @function hasCached
  @param {String} [key]
  @summary Return whether a lazy value has been cached
  @return {Boolean}
  @desc
    Returns `true` if the key is defined as a [::lazy], and its
    value has already been generated.
*/
RegistryProto.hasCached = function(key) {
  var pair = this._get(key);
  if(pair) {
    var service = pair[1];
    return service .. hasOwn('factory') && service .. hasOwn('instance');
  }
  return false;
};

/**
  @function clearCached
  @summary Delete cached [::lazy] results from the environment
  @param {optional Array|String} [keys] Clear specific keys
  @desc
    If `keys` is specified (as either a String or an Array of Strings), those
    specific keys are cleared.

    It is an error to give a key which is not defined, however it is _not_
    an error if the given key is not actually `lazy`, or has not been generated.
    
    Otherwise, all cached value defined will be cleared.
*/
RegistryProto.clearCached = function(keys) {
  if(!keys) {
    keys = this._db .. ownKeys; // .. each {|[key, val]|
  } else {
    if (!Array.isArray(keys)) keys = [keys];
  }
  keys .. each {|key|
    var val = this._get(key);
    if(!val) throw this._NotFound(key);
    val = val[1];
    if (val .. hasOwn('factory')) {
      delete val.instance;
    }
  };
};

RegistryProto.toString = function() {
  var keys = this._db .. ownKeys .. sort .. join(',');
  var additional = this._parent ? " (has parent)" : "";
  return "<#Environment: #{keys}#{additional}>";
};

var Registry = function(parent) {
  var rv = function() { return rv.get.apply(rv, arguments); };
  rv .. extend(RegistryProto);
  rv._db = {};
  rv._parent = parent;
  return rv;
};


module.exports = Registry();
if (require('builtin:apollo-sys').hostenv === 'nodejs') {
  /**
    @variable executable
    @summary String containing the full path to the `conductance` executable

    @variable conductanceRoot
    @hostenv nodejs
    @summary String containing the full path to the conductance root directory

    @function conductanceVersion
    @hostenv nodejs
    @summary Returns the current conductance version string

    @function compilerStamp
    @hostenv nodejs
    @summary Returns the current sjs compiler version

    @variable sjsRoot
    @hostenv nodejs
    @summary String containing the full path to the StratifiedJS root directory

    @function configPath
    @hostenv nodejs
    @summary Returns the full path to the config file which was used to start conductance (`undefined` if conductance was started without a config file, as in e.g. `conductance shell`)

    @function configRoot
    @hostenv nodejs
    @summary Returns the full path to the directory containing the config file which was used to start conductance (`undefined` if conductance was started without a config file, as in e.g. `conductance shell`)

  */
  require('./server/_env').fillEnv(module.exports);
}

