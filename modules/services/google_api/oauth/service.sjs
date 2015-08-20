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
  @summary OAuth-based Google Web API access
*/

@ = require([
  'mho:std',
  {id:'mho:server/oauth', name:'oauth'}
]);

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::configUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a [::OAuthService] instance.
   @desc
      Usually implicitly run by [mho:services::run]
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


      // helper for refreshing token:
      function refreshGoogleAuthorization() {
        
        var tokens = Tokens .. @current;
        if (!tokens || !tokens.refresh_token) throw new Error("No refresh token");
        
        
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
            }
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
        var rv = JSON.parse(reply);        
        return tokens .. @merge(rv);
      }

      //----------------------------------------------------------------------
      /**
         @class GoogleOAuthAPIClient
         @summary Google OAuth API client
         @inherit GoogleAPIClient
      */
      return {
        /**
           @variable GoogleOAuthAPIClient.AccessToken
           @summary XXX write me
        */
        AuthTokens: Tokens,


        /**
           @function GoogleOAuthAPIClient.promptUserAuthorization
           @summary XXX write me
        */
        promptUserAuthorization: function(scopes, runWindow, origin) {
          var params = @oauth.waitForOAuthCallback(
            id -> runWindow(@url.build('https://accounts.google.com/o/oauth2/auth',
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
        },
        
        /* internal interface */
        _request: function(url, opts) {
          var access_token = ((Tokens .. @current()) || {}).access_token;
          if (!access_token) return "Authorize Google API first!";

          var refreshed = false;
          
          while (1) {
            var rv = @http.request(url, {
              method: opts.method,
              query: opts.query,
              headers: {
                'Authorization': 'Bearer '+access_token
              },
              throwing: false,
              response: 'full'
            });
            try {
              rv = JSON.parse(rv.content);

              // xxx could make this logic more specific
              // xxx could preemptively reauth when we know the token is expired
              if (rv.error && !refreshed) {
                refreshed = true;
                var new_tokens = refreshGoogleAuthorization();
                if (!(access_token = new_tokens.access_token)) throw new Error("access not granted");

                Tokens.set(new_tokens);
                continue;
              }
            }
            catch(e) {
              rv = {error: rv.status}
            }
            return rv;
          }
        }

      }
    }
  };

  try {
    block(instance);
  }
  finally {
    console.log("Shutting down Google Web APIs OAuth client");
  }
};
