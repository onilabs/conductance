/* (c) 2013-2014 Oni Labs, http://onilabs.com
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
   @summary API session management
*/

@ = require([
  'mho:app',
  'mho:std',
  {id:'lib:app-info', name:'app_info'},
  {id:'mho:rpc/bridge', name:'bridge'},
  {id:'./login', name:'login'}
]);

//----------------------------------------------------------------------
// helpers

/*

  beta-gamma algorithm for transparently reconnecting, arbitrarily
  nested APIs

  XXX document and clarify API rules (ideally all functions should be
  referentially transparent / idempotent, but don't necessarily have
  to be)

*/

function proxyObj(obj, Beta, key_path) {
  var rv;
  if (Array.isArray(obj)) {
    rv = [];
    obj .. @indexed .. @each {
      |[key, val]|
      rv[key] = proxyObj(val, Beta, key_path.concat(key)); 
    }
  }
  else if (typeof obj === 'function') {
    rv = proxyFunc(Beta, key_path);
    if (obj .. @isStream)
      rv = @Stream(rv);
    rv.proxiedFunc = obj;
  }
  else if (obj && typeof obj == 'object') {
    // generic structural object
    rv = {};
    obj .. @ownPropertyPairs .. @each {
      |[key, val]|
      rv[key] = proxyObj(val, Beta, key_path.concat(key)); 
    }
  }
  else {
    rv = obj;
  }
  return rv;
}

function proxyFunc(Beta, key_path) {

  return function() {
    var beta, gamma = true, gamma_args = arguments;
    
    function Gamma(old_gamma) {
      while (1) {
        try {
          if (old_gamma !== undefined && old_gamma === gamma) {
            
            beta = Beta(beta);
            var target = beta .. @getPath(key_path);
            // XXX ProxyAPI still uses old method of proxying without
            // proxiedFunc. Needs consolidation
            if (target.proxiedFunc) target = target.proxiedFunc;
            console.log("API CALL #{key_path} > apply(#{gamma_args..@toArray})");
            gamma = target.apply(null, gamma_args);
            gamma = gamma .. proxyObj(Gamma, []);
/*
            gamma = 
              (
                (
                  (beta = Beta(beta)) .. 
                    @getPath(key_path)
                ).proxiedFunc.apply(null, gamma_args)
              ) ..
                proxyObj(Gamma, []);
*/
          } 
          return gamma;
        }
        catch (e) {
          if (!@bridge.isTransportError(e)) throw new Error('api '+key_path+': '+e);
          console.log(key_path + ': '+e);
          /* else go round loop again */
        }
      }
    }
    var rv = Gamma(gamma);
    return rv;
  };
}



// helper to wrap an API into one that works across temporary server
// disconnects.
// The base API can be nested; all functions will be wrapped.
// The functions must all be idempotent!
function ProxyAPI() {
  var base = @Condition();
  var proxy = undefined;

  // XXX consolidate this with proxyObj
  function mirrorAPIProps(src, dest, path) {
    src .. @ownPropertyPairs .. @each {
      |[key, val]|
      // XXX it sucks that we have to treat streams different to normal functions here
      if (val .. @isStream) {
        dest[key] = @Stream(proxyFunc(-> base.wait(), path.concat(key)));
        dest[key].proxiedFunc = val;
      }
      else if (typeof val === 'function') {
        dest[key] = proxyFunc(-> base.wait(), path.concat(key));
        dest[key].proxiedFunc = val;
      }
      else if (typeof val === 'object') {
        dest[key] = {};
        mirrorAPIProps(src[key], dest[key], path.concat(key));
      }
      else { // static strings, numbers
        dest[key] = val;
      }
    }
  }

  function initializeProxyAPI(template) {
    var rv = {};
    
    mirrorAPIProps(template, rv, []);

    return rv;
  }

  return {
    getAPI: -> (base.wait(), proxy),
    setBaseAPI: function(base_api) {
      if (!proxy)
        proxy = initializeProxyAPI(base_api);
        base.set(base_api)
    },
    clearBaseAPI: -> base.clear()
  };
}


//----------------------------------------------------------------------

/**
   @variable Connected
   @summary [sjs:observable::Observable] indicating whether we're currently connected to the server (`true`) or not (`false`)
*/
var Connected = @ObservableVar(false);
exports.Connected = Connected;

/**
   @function logOut
   @summary xxx document
*/
var LogoutEmitter = @Dispatcher();
exports.logOut = function() {
  LogoutEmitter.dispatch();
}

//----------------------------------------------------------------------

/**
   @function runSession
   @summary Authenticate and run a server api session
   @param {Function} [block] Function bounding lifetime of session
*/

var session = null;

function runSession(block) {

  var UnauthenticatedAPI = ProxyAPI();
  var AuthenticatedAPI = ProxyAPI();
  var Credentials = @Condition();

  waitfor {

    var firstRun = true; 
    if (localStorage['credentials']) {
      try {
        Credentials.set(localStorage['credentials'] .. JSON.parse());
      }
      catch (e) {
        /* error parsing stored credentials */
        delete localStorage['credentials'];
      }
    }
    
    while (1) {
      try {
        @bridge.connect('./main.api', {} ) {
          |{api}|

          if (@app_info.version !== api.api_version) {
            // API has changed under our feet; only thing we can do is
            // reload 
            location.reload(true);            
          }
         
          // We have this separate inner try in the bridge.connect
          // block to ensure that our proxied apis get cleared
          // *before* any currently pending api calls are
          // retracted/errored and attempt to execute again (by virtue
          // of the while(1)-loop in proxyFunc, above)
          try {
            
            api = api.getUnauthenticatedAPI(window.location.origin);
            
            UnauthenticatedAPI.setBaseAPI(api);
            
            if (!firstRun && !Credentials.isSet) {
              // the session logic is not set up to show a login dialog and reauthenticate with
              // (possibly) different credentials, while the main app code is running, so 
              // let's start from the top: 
              console.log('Credentials went missing on api reconnect - should not happen.');
              return;
            }
            
            try {
              var authenticated_api = api.authenticate(Credentials.wait());
            }
            catch (e) {
              // our credentials were rejected.
              // clear them, and reload to display login dialog.
              // this should only really happen if something in the db changed under our feet
              // since the last login dialog (like the user account being closed). 
              console.log(e);
              delete localStorage['credentials'];
              return;
            }
            
            // ok, we're authenticated!
            
            session = authenticated_api;
            if (firstRun) {
              firstRun = false;
            }
            
            AuthenticatedAPI.setBaseAPI(authenticated_api);
            Connected.set(true);
            
            // now just hold until an error occurs or 'block' below returns;
            hold();
          } /* try */
          finally {
            // see comment at the top of our corresponding try block
            console.log('clearing base apis');
            Connected.set(false);
            UnauthenticatedAPI.clearBaseAPI();
            AuthenticatedAPI.clearBaseAPI();
            session = null;
          }
        } /* bridge.connect */
      } 
      catch (e) {
        if (!@bridge.isTransportError(e)) throw e;
        console.log('no connection to server');
      }
      // XXX should have an exponential backoff here
      hold(200);
    } /* while(1) */
  }
  or {
    // show a login dialog if we haven' got stored credentials.
    // like the main block, below, this sits in a separate waitfor/or clause, 
    // and uses a proxied api, so that the login dialog can survive 
    // temporary api disconnects.
    if (!Credentials.isSet) {
      Credentials.set(@login.doLoginDialog(UnauthenticatedAPI.getAPI()));
      if (!Credentials.value.anonymous)
        localStorage['credentials'] = Credentials.value .. JSON.stringify;
    }
    hold();
  }
  or {
    /* run the main block once we've got an AuthenticatedAPI connected;
       continue to keep it running even if the api temporarily goes away */
    
    var auth_api = AuthenticatedAPI.getAPI();
    
    // it is not really 'safe' to just perform the 
    // registration checking here on the client-side, but for now it will do:
    // (later we might decide to hide the authenticated api behind another 
    //  call, when the account is not confirmed)
    waitfor {
      auth_api.obsPendingConfirmation .. @any(pending -> !pending);
    }
    or {
      hold(200);
      WaitingForConfirmationSplash(auth_api);
      // XXX could use logout emitter from confirmation splash
      // returning from the splash means the user wants to login as someone else:
      delete localStorage['credentials'];
      return;
    }

    block(auth_api);
  }
  or {
    LogoutEmitter.wait();
    delete localStorage['credentials'];
  }
}
exports.runSession = runSession;

//----------------------------------------------------------------------

function WaitingForConfirmationSplash(api) {

  var Notice = @ObservableVar('Resend confirmation email');

  function resend() {
    Notice.set(`$@Icon('send') sending ...`);
    // show the sending notice for at least 3s
    waitfor {
      hold(1000);
      //api.resendConfirmationEmail()
    }
    or {
      hold(3000);
    }

    Notice.set(`$@Icon('ok') Sent! Please check your inbox`);
    // wait 10s before we act upon button press again:
    hold(10000);
    Notice.set(`Resend email $@B('again')`);
  }


  @mainContent .. @appendContent([
    @PageHeader :: @app_info.name,
    @H1 :: `Welcome, ${api.username}!`,
    @P  :: "Thank you for registering a #{@app_info.name} account.",
    @P  :: 'Please check your email and click the confirmation link.',
    @Btn('primary', Notice) .. 
      @OnClick(resend),
    `&nbsp;`,
    @Btn('default', 'Log in as someone else') ..
      @OnClick({|| return})
  ]) { 
    || 
    hold() 
  }
}
