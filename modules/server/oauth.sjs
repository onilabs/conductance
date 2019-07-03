/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
   @summary Server-side OAuth2 infrastructure helpers
   @hostenv nodejs
*/

@ = require(['mho:std', 
             {id:'./random', name:'random'}
            ]);


//----------------------------------------------------------------------

var OAuthProcesses = {};

/**
   @function waitForOAuthCallback
   @param {Function} [initiator] A function that will receive a random id and should build a client-side authorization window
   @summary Wait until an OAuth2 callback has been received on a handler created with [::createOAuthCallbackHandler]
*/
function waitForOAuthCallback(initiator) {
  var id = @random.createID();
  waitfor {
    waitfor(var rv) {
      OAuthProcesses[id] = resume;
    }
    finally {
      delete OAuthProcesses[id];
    }
  }
  and {
    initiator(id);
  }
  return rv;
}
exports.waitForOAuthCallback = waitForOAuthCallback;

/**
   @function createOAuthCallbackHandler
   @summary Helper to create a [mho:server::Route] for handling OAuth2 callbacks.
   @desc
      [mho:server/route::SystemRoutes] & [mho:server/route::SystemAuxRoutes] use this
      function to create an oauth2 handler under the url '__oauthcallback'
*/
function createOAuthCallbackHandler() {
  function handler_func(req, matches) {
    // find the OAuth callback process:

    var id = req.url.params().state;
    var process = OAuthProcesses[id];
    if (!process) {
      throw @response.NotFound('Not Found', 'Unexpected OAuth Callback');
    }

    // xxx at the moment 'process' never returns anything, but that might change in future
    var rv = process(req.url.params());

    if (!rv) {
      rv = "<html></html>";
    }

    req .. @response.setStatus(200);
    req.response.end(rv);
  }
  return {
    GET: handler_func
  }
}
exports.createOAuthCallbackHandler = createOAuthCallbackHandler;
