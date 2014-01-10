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

/** @nodoc */
var url = require('sjs:url');
var path = require('nodejs:path');
var fs = require('sjs:nodejs/fs');
var env = require('./env');
var logging = require('sjs:logging');

exports.loadConfig = function(path) {
  var configfile = path || exports.defaultConfig();
  configfile = url.normalize(configfile, process.cwd() + '/');



  //----------------------------------------------------------------------
  // load config file

  logging.info("Loading config from #{configfile}");
  var config = require(configfile);
  env.set('config', {path:configfile, module: config});
  return config;
}

exports.defaultConfig = function() {
  var builtin = "#{env.conductanceRoot}default_config.mho";
  var local = path.join(process.cwd(), 'config.mho');
  return (fs.exists(local)) ? local : builtin;
}

