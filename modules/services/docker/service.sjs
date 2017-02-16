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
   @summary Docker service configuration object, as e.g. created by [mho:services::provisioningUI]
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

  if (args.block) {
    request_opts.response = 'raw';
  }
  else {
    request_opts.response = 'full';
  }

  var request_rv = @http.request(base_url+path, request_opts);

  if (request_rv.status == 0) throw new Error("Fatal request error");

  if (args.block) {
    if (request_rv.statusCode < 299) {
      try {
        args.block(request_rv);
        return;
      }
      finally {
        request_rv.destroy();
      }
    }
    else {
      // construct a parsed request_rv object, and latch onto the error handling below
      var original_rv = request_rv; 
      request_rv = {
        status: original_rv.statusCode,
        content: (original_rv .. @stream.contents('utf8')) .. @join(''),
        getHeader: name -> original_rv.headers[name.toLowerCase()]
      };
    }
  }

  var contentType = request_rv.getHeader("Content-Type");

  // parse return body
  var rv;
  if (contentType !== undefined) {
    if (contentType === 'application/json') {
      try {
        rv = JSON.parse(request_rv.content);
      }
      catch(e) {
        throw new Error("Error parsing API response '#{request_rv.content}'");
      }
    }
    else if (contentType.indexOf('text/plain') !== -1) {
      rv = request_rv.content;
    }
    else {
      throw new Error("Unknown content type '#{contentType}'");
    }
  }

  // handle request errors:
  if (request_rv.status > 299) {
    throw new Error((rv && rv.message) || request_rv.status);
  }

  // process successful request return value:
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
