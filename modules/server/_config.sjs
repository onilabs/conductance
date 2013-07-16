require('../../hub'); // install mho: hub
var url = require('sjs:url');
var { stat } = require('sjs:nodejs/fs');
var path = require('nodejs:path');
var fs = require('sjs:nodejs/fs');

var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();
var conductanceVersion = "1-#{
                              (new Date(
                                  stat(require.resolve('sjs:../stratified-node.js').path .. url.toPath(7)).mtime
                              )).getTime()
                            }";

exports.loadConfig = function(path) {
  var configfile = path || exports.defaultConfig();
  configfile = url.normalize(configfile, process.cwd() + '/');

  var env = require('./env');
  env.init({
    conductanceRoot    : conductanceRoot,
    configPath         : configfile,
    configRoot         : url.normalize('./', configfile),
    conductanceVersion : conductanceVersion,
  });


  //----------------------------------------------------------------------
  // load config file

  console.log("Loading config from #{configfile}");
  var config = require(configfile);
  env.update('config', config);
  return config;
}

exports.defaultConfig = function() {
  var builtin = "#{conductanceRoot}default_config.mho";
  var local = path.join(process.cwd(), 'config.mho');
  return (fs.exists(local)) ? local : builtin;
}

exports.printVersion = function() {
  var sys = require('sjs:sys');
  console.log("
  conductance version: #{conductanceVersion}
  conductance path:    #{conductanceRoot}

  SJS version:         #{sys.version}
  SJS path:            #{path.normalize(sys.executable, '..')}
");
}


