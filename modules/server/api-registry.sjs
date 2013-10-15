var { createID } = require('./random');
var { API } = require('mho:rpc/bridge');

var api_by_apiid = {};

// returns an apiid
exports.registerAPI = function(moduleid) {
  var resolved_path = require.resolve(moduleid).path;
  // ensure module is loaded:
  require(resolved_path);
  
  // retrieve module descriptor:
  var module_desc = require.modules[resolved_path];

  if (module_desc.apiid) {
    // already registered
    return module_desc.apiid;
  }

  var apiid = module_desc.apiid = createID(4);
  api_by_apiid[apiid] = API(module_desc.exports);

  return apiid;
};

exports.getAPIbyAPIID = function(apiid) {
  var rv = api_by_apiid[apiid];
  if (!rv) throw new Error("API ID not registered");
  return rv;
};

