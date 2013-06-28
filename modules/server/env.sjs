// conductance server environment
// server-side only

var env_vars;
exports.init = function(vars) {
  env_vars = vars;
};

exports.update = function(key, val) {
  env_vars[key] = val;
}

exports.conductanceRoot = -> env_vars.conductanceRoot;
exports.configRoot      = -> env_vars.configRoot;
exports.configPath      = -> env_vars.configPath;
exports.config          = -> env_vars.config;
exports.conductanceVersion = -> env_vars.conductanceVersion;
