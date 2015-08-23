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

/**
   @nodoc
*/

@ = require([
  'mho:std'
]);


// These helpers follow the logic in
// https://github.com/google/google-api-nodejs-client/blob/master/lib/apirequest.js
// very closely

function getMissingParams(params, required) {
  var missing = [];

  required .. @each {
    |param|
    // Is the required param in the params object?
    if (! params[param]) {
      missing.push(param);
    }
  }

  // If there are any required params missing, return their names in array, otherwise return null
  return missing.length > 0 ? missing : null;
}

__js function buildPath(path, params) {
  return @supplant(path, params, x -> x .. encodeURIComponent);
}

exports.performRequest = function(_request, parameters) {
  var params = parameters.params ? parameters.params .. @clone : {};

  var request_opts = {
    method: parameters.method || 'GET',
  };

  var missingParams = getMissingParams(params, parameters.requiredParams);
  if (missingParams) {
    // Some params are missing - stop further operations and inform the developer which required
    // params are not included in the request
    throw new Error("Missing required parameters: #{missingParams.join(', ')}");
  }

  var media = params.media || {};
  var resource = params.resource;

  delete params.media;
  delete params.resource;

  var url;
  if (parameters.mediaUrl && media.body) {
    // a request with media part

    if (!media.mimeType) throw new Error("Missing media.mimeType parameter");
    url = buildPath(parameters.mediaUrl, params);

    if (resource) {
       params.uploadType = 'multipart';
      // build multipart payload:
      var parts = [
        [
          'Content-Type: application/json',
          JSON.stringify(resource)
        ],
        [
          "Content-Type: #{media.mimeType}",
          media.body 
        ]
      ];

      var boundary = '024487622349072263461321oni';
      request_opts.headers = {
        'Content-Type':'multipart/related; boundary=\"'+boundary+'\"'
      };

      parts = parts .. @map(function([header, body]) {
        return Buffer.concat([
          new Buffer('\r\n--'+boundary+'\r\n'),
          new Buffer(header+'\r\n\r\n'),
          body .. Buffer.isBuffer ? body : new Buffer(body)
        ]);
                             
      });
      parts.push(new Buffer('\r\n--'+boundary+'--'));

      request_opts.body = Buffer.concat(parts);
    } else {
      params.uploadType = 'media';
      request_opts.headers = {
        'Content-Type': media.mimeType
      };
      request_opts.body = media.body;
    }
  } 
  else { 
    // a request without media part

    url = buildPath(parameters.url, params);

    if (resource) {
      try {
        request_opts.body = resource .. JSON.stringify;
      }
      catch(e) {
        throw new Error("resource must be JSON-serializable (#{e})");
      }

      request_opts.headers = {'Content-Type':'application/json'};
    }
  }

  // Delete path parameters from the params object so they do not end up in query
  parameters.pathParams .. @each {
    |param|
    delete params[param];
  }

  request_opts.query = params;

  var rv = _request(url, request_opts);

  if (rv.error) {
    if (typeof rv.error === 'string') {
      throw new Error(rv.error);
    }
    else {
      throw new Error(rv.error .. JSON.stringify);
    } 
  }
  return rv;
};
