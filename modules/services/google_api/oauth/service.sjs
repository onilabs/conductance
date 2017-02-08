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
  @summary OAuth-based Google Web API access
*/

@ = require([
  'mho:std',
  {id:'mho:server/oauth', name:'oauth'},
  {id:'../helpers', name:'helpers'}
]);

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::configUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a [::OAuthService] instance.
   @desc
      Usually implicitly run by [mho:services::withServices]
 */
exports.run = function(config, block) {
  console.log("Starting Google Web APIs OAuth client");

  /**
     @class OAuthService
     @summary Google OAuth Service
  */
  var instance = {
    /**
       @function OAuthService.APISession
       @summary XXX write me
       @return {::GoogleOAuthAPIClient}
    */
    APISession: function(initial_tokens) {

      var Tokens = @ObservableVar(initial_tokens);

      var Authorized = @ObservableVar(false);
      // check if we're authorized already with the initial_tokens. This will set 'Authorized':
      refreshGoogleAuthorization();

      // the inner request handler:
      function _request(url, opts) {
        var access_token = ((Tokens .. @current()) || {}).access_token;
        if (!access_token) throw new Error("Authorize Google API first!");
        
        var refreshed = false;
        
        while (1) {
          var rv = @http.request(url, {
            method: opts.method,
            query: opts.query,
            body: opts.body,
            headers: {
              'Authorization': 'Bearer '+access_token
            } .. @extend(opts.headers),
            throwing: false,
            response: 'full'
          });
          if (rv.status == 401) {
            if (!refreshed) {
              // xxx could preemptively reauth when we know the token is expired
              if (!refreshGoogleAuthorization())
                throw new Error("no access");
              refreshed = true;
              if (!(access_token = new_tokens.access_token)) throw new Error("access not granted");
              refreshed = true;
              continue; // retry request
            }
            else {
              // we have refreshed, but are still not authorized;
              // this probably means that we haven't got all scopes we need for the request
              Tokens.set(undefined);
              Authorized.set(false);
            }
          }
          try {
            rv = JSON.parse(rv.content);
          }
          catch(e) {
            rv = {error: "Cannot parse reply (#{rv.status})"};
          }
          return rv;
        }
      }

      // helper for refreshing token:
      // XXX THIS SHOULD BE A CRITICAL SECTION
      function refreshGoogleAuthorization() {
        
        var tokens = Tokens .. @current;
        console.log("TOKENS:"+tokens..@inspect);
        if (!tokens || !tokens.refresh_token) return false;
        
        // get new access token:
        var reply = @http.post(
          @url.build('https://www.googleapis.com/oauth2/v3/token'), 
          @url.buildQuery({
            refresh_token: tokens.refresh_token,
            client_id: config.client_id,
            client_secret: config.client_secret,
            grant_type: 'refresh_token'
          }),
          {
            headers: {
              'Content-Type':'application/x-www-form-urlencoded'
            },
            throwing: false,
            response: 'full'
          }
        );
        
        // reply should be an object looking like this:
        /*
          {
          "access_token": "...",
          "token_type": "Bearer",
          "expires_in": 3600,
          }
        */
        
        if (reply.status !=  200) {
          console.log("On attempting to refresh token: "+reply .. JSON.stringify(null, '  '));
          Tokens.set(undefined);
          Authorized.set(false);
          return false;
        }
        else {
          tokens = tokens .. @merge(JSON.parse(reply.content));
          Tokens.set(tokens);
          Authorized.set(true);
          return true;
        }
      }

      //----------------------------------------------------------------------
      /**
         @class GoogleOAuthAPIClient
         @summary Google OAuth API client
         @inherit GoogleAPIClient
      */
      var client = {
        /**
           @variable GoogleOAuthAPIClient.AuthTokens
           @summary XXX write me
        */
        AuthTokens: Tokens,

        /**
           @variable GoogleOAuthAPIClient.Authorized
           @summary XXX write me
        */
        Authorized: Authorized,

        /**
           @function GoogleOAuthAPIClient.promptUserAuthorization
           @summary XXX write me
           @param {Array} [scopes] Array of scope strings to seek authorization for
           @param {Function} [displayURL] Function that will receive URL of authorization page; must be displayed in browser
           @param {String} [origin] URL origin for redirecting; should be `window.location.origin` of the browser initiating the authorization
        */
        promptUserAuthorization: function(scopes, displayURL, origin) {
          var params = @oauth.waitForOAuthCallback(
            id -> displayURL(@url.build('https://accounts.google.com/o/oauth2/auth',
                                       {
                                         response_type:'code',
                                         client_id: config.client_id,
                                         redirect_uri:"#{origin}/__oauthcallback",
                                         scope: scopes.join(' '),
                                         state:id,
                                         approval_prompt: 'force',
                                         access_type:'offline'
                                       })));
          if (params.error) { 
            console.log("Google authentication error", params);
            return false;
          }
          // exchange code for access token:
          var reply = @http.post(
            @url.build('https://www.googleapis.com/oauth2/v3/token'), 
            @url.buildQuery({
              code: params.code,
              client_id: config.client_id,
              client_secret: config.client_secret,
              redirect_uri: "#{origin}/__oauthcallback",
              grant_type: 'authorization_code'
            }),
            {
              headers: {
                'Content-Type':'application/x-www-form-urlencoded'
              }
            }
          );
      
          // reply should be an object looking like this:
          /*
            {
            "access_token": "...",
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": "..."
            }
          */
          var tokens = JSON.parse(reply);
          Tokens.set(tokens);
          Authorized.set(true);
          return tokens;
        },
        
        /* internal interface */
        performRequest: function(parameters) {
          return @helpers.performRequest(_request, parameters);
        }
      };
      return client;
    }
  };

  try {
    block(instance);
  }
  finally {
    console.log("Shutting down Google Web APIs OAuth client");
  }
};
