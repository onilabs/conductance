var url = require('sjs:url');
var path = require('nodejs:path');
var fs = require('sjs:nodejs/fs');
var env = require('./env');
var logging = require('sjs:logging');
/** @nodoc */

exports.loadConfig = function(path) {
  var configfile = path || exports.defaultConfig();
  configfile = url.normalize(configfile, process.cwd() + '/');

  env.init({
    configPath         : configfile,
    configRoot         : url.normalize('./', configfile),
  });


  //----------------------------------------------------------------------
  // load config file

  logging.info("Loading config from #{configfile}");
  var config = require(configfile);
  return config;
}

exports.defaultConfig = function() {
  var builtin = "#{env.conductanceRoot()}default_config.mho";
  var local = path.join(process.cwd(), 'config.mho');
  return (fs.exists(local)) ? local : builtin;
}

