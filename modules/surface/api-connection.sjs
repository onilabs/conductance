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

@ = require([
  'mho:surface',
  'sjs:std',
  {id: 'sjs:logging', include: ['warn']},
  {id: 'mho:rpc/bridge', name: 'bridge'}
]);

/**
  @summary API connection utility
  @hostenv xbrowser
*/


//----------------------------------------------------------------------
// new-style transparently reconnecting API connection

/**
   @function withResumingAPI
   @param {Object} [api] api module
   @param {Function} [block]
   @summary Connect and use an `.api` module; transparently reconnecting if
            the connection drops; EXPERIMENTAL
   @desc
     Like [::withAPI], but transparently reconnects when the connection 
     temporarily disconnects; keeping pending function calls waiting
*/

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
    //var rv = obj .. @indexed .. @map([key, val] -> proxyObj(val, Beta, key_path.concat(key))); 
    rv = [];
    obj .. @indexed .. @each {
      |[key, val]|
      rv[key] = proxyObj(val, Beta, key_path.concat(key)); 
    }
  }
  else if (typeof obj === 'function') {
    rv = proxyFunc(Beta, key_path);
    if (obj .. @isStream) {
      rv .. @extend(obj);
    }
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
            //console.log("API CALL #{key_path} > apply(#{gamma_args..@toArray})");
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
          if (!@bridge.isTransportError(e)) { 
            //throw new Error('api '+key_path+': '+e);
            // XXX it's a bad idea to change the error, like we did above, but maybe we can patch up the stack
            //if (e.__oni_stack) console.log(e.__oni_stack);
            throw e;
          }
          console.log("api-connection: caught resumable transport error at key path [#{key_path}]" + ': '+e);
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
      if (typeof val === 'function') {
        dest[key] = proxyFunc(-> base.wait(), path.concat(key));
        if (val .. @isStream) // XXX this is needed to get the stream tags & interfaces
                              // maybe we should do this for *all* functions
          dest[key] .. @extend(val);
        dest[key].proxiedFunc = val;
      }
      else if (typeof val === 'object') {
        dest[key] = Array.isArray(val) ? [] : {};
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

exports.withResumingAPI = function(api_module, block) {
  var API = ProxyAPI();

  waitfor {
    while (1) {
      try {
        @bridge.connect(api_module, {}) {
          |{api}|
          try {
            API.setBaseAPI(api);

            // now just hold until an error occurs or 'block' below returns
            hold();
          }
          finally {
            API.clearBaseAPI();
          }
        } /* bridge.connection */
      } /* try */
      catch (e) {
        if (!@bridge.isTransportError(e)) throw e;
      }
      // XXX should have exponential backoff here
      hold(200);
    } /* while (1) */
  }
  or {
    block(API.getAPI());
  }
};


//----------------------------------------------------------------------
// deprecated withAPI function

/**
  @function withAPI
  @param {Object} [api] api module
  @param {optional Settings} [settings] settings passed to [rpc/bridge::connect]
  @setting {Function} [notice] Notice constructor (default: [surface/bootstrap/notice::Notice])
  @setting {Function} [disconnectMonitor] Notice constructor (default: [surface/bootstrap/notice::Notice])
  @param {Function} [block]
  @summary Connect and use an `.api` module
  @desc
    `withAPI` opens a connection to the given API, and invokes
    `block` with the API's exports.

    If the API connection is lost, `block` is retracted and
    a UI notification is displayed informing the user that
    the app is disconnected, and displaying the time until the next
    connection attempt. `withAPI` will keep attempting to reconnect
    with an exponential backoff capped at 1 minute.

    **Note:** the notifications displayed by this utility make use of
    bootstrap styles. If your page us not using bootstrap styles, you
    may need to style these classes manually.
*/
exports.withAPI = function(api, opts, block) {
  if (arguments.length == 2) {
    block = opts;
    opts = {};
  }
  var initialDelay = 1000;
  var delay = initialDelay;
  var { @Countdown } = require('./widget/countdown');
  var Notice = opts.notice;
  if (!Notice) ({Notice}) = require('./bootstrap/notice');

  while (1) {
    try {
      @bridge.connect(api, opts .. @merge({
        connectMonitor: function() {
          hold(1000); // small delay before showing ui feedback
          document.body .. @appendContent(Notice('Connecting...', {'class':'alert-warning'}), -> hold());
        }
      })) {
        |connection|
        console.log("api-connection::withAPI: Bridge connection to #{api .. @inspect} established");
        // we're connected; reset connection delay
        delay = initialDelay;
        block(connection.api);
      }
    } catch(e) {
      if (@bridge.isTransportError(e)) {
        @warn("Connection error: #{e}");
        hold(300); // small delay before showing ui feedback
        if (window.onerror && window.onerror.triggered) return;

        var disconnectBody = function(elem) {
          (elem || document.body) .. @appendContent(Notice(
            `Not connected. Reconnect in ${@Countdown(Math.floor(delay/1000))}s. ${@Element('a', "Try Now", {href:'#'})}`,
            {'class':'alert-warning'}))
          {|elem|
            waitfor {
              hold(delay);
              delay *= 1.5;
              if (delay > 60*1000) // cap at 1 minute
                delay = 60*1000;
            } or {
              elem.querySelector('a') .. @wait('click', {handle:@preventDefault});
            }
          }
        };
        if (opts.disconnectMonitor)
          opts.disconnectMonitor(disconnectBody);
        else
          disconnectBody();

        continue;
      }
      else throw e;
    }
    break;
  }
}
