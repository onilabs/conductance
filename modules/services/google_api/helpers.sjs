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

exports.performRequest = function(client, parameters) {
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

  var defaultMime = typeof media.body === 'string' ? 'text/plain' : 'application/octet-stream';
  delete params.media;
  delete params.resource;

  // Parse urls and urlescape path params
  var url;
  if (parameters.url) {
    url = buildPath(parameters.url, params);
  }
  else {
    url = buildPath(parameters.mediaUrl, params);
  }
 
  // Delete path parameters from the params object so they do not end up in query
  parameters.pathParams .. @each {
    |param|
    delete params[param];
  }

  if (parameters.mediaUrl && media.body) {
    throw new Error("XXX multipart not implemented yet");
/*    if (resource) {
       params.uploadType = 'multipart';
      request_opts.multipart = [
        {
          'Content-Type': 'application/json',
          body: JSON.stringify(resource)
        },
        {
          'Content-Type': media.mimeType || resource && resource.mimeType || defaultMime,
          body: media.body // can be a readable stream or raw string!
        }
      ];
    } else {
      params.uploadType = 'media';
      request_opts.headers = {
        'Content-Type': media.mimeType || defaultMime
      };

      if (isReadableStream(media.body)) {
        var body = media.body;
      } else {
        request_opts.body = media.body;
      }
    }
*/
  } else {
    if (resource) 
      throw new Error("XXX request with resource not implemented yet");
    //request_opts.json = resource || (
    //  (options.method === 'GET' || options.method === 'DELETE') ? true : {}
    //);
  }

  request_opts.query = params;

  var rv = client._request(url, request_opts);

  if (rv.error) {
    if (typeof rv.error === 'string') {
      throw new Error(rv.error);
    }
    else if (Array.isArray(rv.error.errors)) {
      throw new Error(rv.error.errors .. @map(err -> err.message) .. @join('\n'));
    }
    else {
      throw new Error(rv.error.message);
    } 
  }
  return rv;

//if (body) {
//  body.pipe(req);
//}
 
};
