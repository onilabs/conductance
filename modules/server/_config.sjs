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

/** @nodoc */
var url = require('sjs:url');
var pathMod = require('nodejs:path');
var fs = require('sjs:nodejs/fs');
var env = require('../env');
var logging = require('sjs:logging');
var url = require('sjs:url');

exports.loadConfig = function(path) {
  var configfile = path || exports.defaultConfig();
  
  // Note: configfile *might* already be a file URL.
  // We need to ensure a url for require():
  configfile = configfile .. url.coerceToURL();

  // But we also want a plain path for config.path and logging
  var configpath = configfile .. url.toPath();

  //----------------------------------------------------------------------
  // load config file

  logging.info("Loading config from #{configpath}");
  
  // XXX make sure configPath is set early, for .mho modules that rely on it:
  env.set('config', {path:configpath});

  var config = require(configfile);
  env.set('config', {path:configpath, module: config});
  return config;
}

exports.defaultConfig = function() {
  var builtin = "#{env.conductanceRoot}default_config.mho";
  var local = pathMod.join(process.cwd(), 'config.mho');
  return (fs.exists(local)) ? local : builtin;
}

