/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @summary service account-based Google Web API access
*/

@ = require([
  'mho:std',
  {id:'mho:server/oauth', name:'oauth'},
  {id:'../helpers', name:'helpers'},
  {id:'google-oauth-jwt', name:'jwt'}
]);

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::provisioningUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a [::GoogleServiceAccountAPIClient] instance.
   @desc
      Usually implicitly run by [mho:services::withServices]
 */
exports.run = function(config, block) {
  console.log("Starting Google Web APIs Service Account client");

  //----------------------------------------------------------------------
  /**
     @class GoogleServiceAccountAPIClient
     @summary Google Service Account API client
     @inherit GoogleAPIClient
  */

  // XXX get rid of [google-oauth-jwt library](https://github.com/extrabacon/google-oauth-jwt) 
  var tokens = new @jwt.TokenCache();

  var json_key_file = config.json_key_file .. JSON.parse;
  var scopes = config.scopes.split(',');

  var jwt = {
    email: json_key_file.client_email,
    key: json_key_file.private_key,
    scopes: scopes
  };

  function _request(url, opts) {
    waitfor (var err, token) {
      tokens.get(jwt, resume);
    }
    if (err) throw new Error("Google-api authentication error: #{err}");
    var rv = @http.request(url, {
      method: opts.method,
      query: opts.query,
      body: opts.body,
      headers: {
        'Authorization':'Bearer '+token
      } .. @extend(opts.headers),
      throwing: false,
      response: 'full'
    });
    try {
      rv = JSON.parse(rv.content);
    }
    catch (e) {
      rv = {error: rv.status};
    }
    return rv;
  }

  var client = {
    /* internal interface */
    performRequest: function(parameters) {
      return @helpers.performRequest(_request, parameters);
    }
  };

  try {
    block(client);
  }
  finally {
    console.log("Shutting down Google Web APIs Service Account client");
  }
};
