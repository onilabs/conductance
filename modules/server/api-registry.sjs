/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
  @nodoc
*/

var { createID } = require('./random');
var { merge } = require('sjs:object');
var { API } = require('mho:rpc/bridge');

var api_by_apiid = exports._registry = {};

// returns an apiid
exports.registerAPI = function(moduleid, apiid) {
  var resolved_path = require.url(moduleid);
  // ensure module is loaded:
  require(resolved_path);
  
  // retrieve module descriptor:
  var module_desc = require.modules[resolved_path];

  if (module_desc.apiid) {
    if (apiid !== undefined && module_desc.apiid !== apiid) {
      throw new Error("API #{moduleid} already registered under different id");
    }
    // already registered
    return module_desc.apiid;
  }

  if (apiid === undefined) {
    apiid = module_desc.apiid = createID(4);
  }
  api_by_apiid[apiid] = merge(module_desc.exports, {__oni_apiid: apiid});

  return apiid;
};

exports.getAPIbyAPIID = function(apiid) {
  var rv = api_by_apiid[apiid];
  if (!rv) throw new Error("API ID not registered");
  return rv;
};

