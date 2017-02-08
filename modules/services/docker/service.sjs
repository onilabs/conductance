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
  @summary Docker API access
*/

@ = require([
  'mho:std'
]);

/**
   @class DockerServiceConfig
   @summary Docker service configuration object, as e.g. created by [mho:services::configUI]
*/

//----------------------------------------------------------------------
// helpers
// XXX can consolidate these with google_api/helpers.sjs
__js function getMissingParams(params, required) {
  var missing = required .. @filter(r -> params[r] == undefined) .. @toArray;
  return missing.length > 0 ? missing : null;
}

__js function buildPath(path, params) {
  return @supplant(path, params, x -> x .. encodeURIComponent);
}

function request(request_inner, args) {

  var request_opts = {
    method: args.method || 'GET'
  };
  var missingParams = getMissingParams(args.params, args.requiredParams);
  if (missingParams) {
    throw new Error("Missing required parameters: #{missingParams.join(', ')}");
  }

  var path = buildPath(args.url, args.params);

  request_opts.query = args.queryParams ..
    @filter(name -> args.params[name] !== undefined) ..
    @transform(name -> [name,args.params[name]]) ..
    @pairsToObject;

  var rv = request_inner(path, request_opts);

  return rv;
}

//----------------------------------------------------------------------
/**
   @function run
   @summary Run an instance of the Docker server
   @param {::DockerServiceConfig} [config] Configuration object
   @param {Function} [block] Function bounding lifetime of service; will be passed a DockerAPIClient instance to be used with the Docker API libraries ([mho:services/docker/::]).
   @desc
      Usually implicitly run by [mho:services::withServices]
*/
exports.run = function(config, block) {

  function request_inner(relative, request_opts) {
    // XXX get base url from config
    return @http.request("http://unix:/var/run/docker.sock:"+ relative, request_opts);
  }

  var client = {
    toString: -> "[Docker API Client]",
    /* internal interface */
    performRequest: function(args) {
      return request(request_inner, args);
    }
  };

  try {
    block(client);
  }
  finally {
    // nothing to clean up
  }
};
