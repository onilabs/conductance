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

function request(base_url, args) {

  if (!args.params)
    args.params = {};

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

  request_opts.throwing = false;
  request_opts.response = 'full';
  request_opts.headers = {};

  if (args.bodyParams.length) {
    // exactly one body parameter is implied
    var bodyParam = args.params[args.bodyParams[0]];
    if (bodyParam !== undefined) {
      if (args.body === 'json') {
        request_opts.headers['Content-Type'] = 'application/json';
        request_opts.body = bodyParam .. JSON.stringify;
      }
      else {
        throw new Error("Don't know how to handle body of type '#{args.body}' yet. XXX write me");
      }
    }
  }

  var request_rv = @http.request(base_url+path, request_opts);
  
  // handle request errors:

  if (request_rv.status > 299) {
    var error;
    // try to extract a JSON error message:
    try {
      error = JSON.parse(request_rv.content).message;
    }
    catch(e) { /* ignore */ }
    if (!error)
      error = request_rv.status;
    throw new Error(error);      
  }

  // process successful request return value:

  var rv;

  if (args.rv === 'json') {
    try {
      rv = JSON.parse(request_rv.content);
    }
    catch (e) {
      throw new Error(" (Error parsing return value '#{request_rv.content}')");
    }
  }
  else if (args.rv === 'string') {
    rv = request_rv.content;
  }
  else 
    throw new Error("Unknown return type '#{args.rv}'");

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

  var client = {
    toString: -> "[Docker API Client]",
    /* internal interface */
    performRequest: function(args) {
      // XXX get base url from config
      return request("http://unix:/var/run/docker.sock:", args);
    }
  };

  try {
    block(client);
  }
  finally {
    // nothing to clean up
  }
};
