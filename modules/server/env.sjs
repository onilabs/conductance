// conductance server environment
// server-side only
var sys = require("sjs:sys");
var path = require("nodejs:path");
var url = require("sjs:url");
var { stat } = require('sjs:nodejs/fs');
var sjsRoot = path.dirname(sys.executable);
var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();
var conductanceVersion = "1-#{
                              (new Date(
                                  stat(require.resolve('sjs:../stratified-node.js').path .. url.toPath(7)).mtime
                              )).getTime()
                            }";

var env_vars;
exports.init = function(vars) {
  env_vars = vars;
};

exports.update = function(key, val) {
  env_vars[key] = val;
}

exports.executable         = path.join(conductanceRoot, 'conductance');
exports.conductanceRoot    = conductanceRoot;
exports.sjsRoot            = sjsRoot
exports.conductanceVersion = -> conductanceVersion;
exports.config          = -> env_vars && env_vars.config;
exports.configPath      = -> env_vars && env_vars.config.path; // TODO: remove
exports.configRoot      = -> env_vars && url.normalize('./', env_vars.config.path); // TODO: remove
