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
  @module  server/rpc/bridge
  @summary API bridge: High-level API remoting
  @require ./wst-client
  @desc
    The RPC bridge is used for bidirectional communication between client
    and server. It utilizes [sjs:vmbridge::].
*/    

@ = require([
  'sjs:std',
  'sjs:vmbridge',
  {id:'./error', include: ['isTransportError', 'TransportError']}
]);

//----------------------------------------------------------------------

/**
  @function isBridgeError
  @param {Error} [err]
  @return {Boolean}
  @summary Returns whether `err` is an error raised by bridge operation
*/

exports.isBridgeError = @isVMBridgeError;

/**
  @class TransportError
  @summary The error type raised by bridge connection errors
*/
exports.TransportError = @TransportError;

/**
  @function isTransportError
  @param {Error} [err]
  @return {Boolean}
  @summary Returns whether `err` was raised by connection/transport errors
*/
exports.isTransportError = @isTransportError;


/**
  @function resolve
  @summary Resolve an .api module by URL
  @param {String} [api] .api URL
  @param {Settings} [opts] options passed to [sjs:http::request]
  @return {Object} apiinfo
  @desc
    For advanced use only; called automatically by [::connect].
*/
exports.resolve = function(api_name, opts) {
  try {
    var apiinfo = @http.json([api_name, {format:'json'}], opts);
  }
  catch(e) {
    throw @TransportError(e.message);
  }
  // catch syntax errors in the api module; don't throw as transport errors:
  if (!apiinfo) throw new Error("Error resolving #{api_name}");
  if (apiinfo.error) throw new Error(apiinfo.error);
  if (@sys.hostenv !== 'nodejs' && !api_name .. @contains('://')) {
    // resolve relative paths in browser
    api_name = @url.normalize(api_name, document.location.href);
  }
  apiinfo.server =@url.normalize(apiinfo.root || '/', api_name);
  return apiinfo;
};


/**
  @function connect
  @summary Connect to a remote API
  @param {String|Object} [api] .api URL (or pre-fetched apiinfo from [::resolve])
  @param {Settings} [settings]
  @param {Function} [session_f]
  @setting {String} [server] Server root
  @setting {Transport} [transport] Optional existing transport to use
  @desc
    Throws a [::TransportError] if the connection attempt fails.

    If `api` is an apiinfo object (rather than a URL) string, you must also
    provide either a `server` or `transport` setting.

    `session_f` will be called with an argument `{api: remoteAPI}`.

    When `session_f` finishes execution (either normally or via an exception), the
    connection will be closed automatically.
*/
exports.connect = function(apiinfo, opts, session_f) {

  if (@sys.hostenv === 'xbrowser' && !document.isThread) {
    // let's run this in a thread
    console.log("---- Running api bridge in a thread ----");
    require('sjs:thread').withThread {
      |{eval}|
      var threaded_bridge = eval("require('mho:rpc/bridge');");
      return threaded_bridge.connect(apiinfo, opts, session_f);
    }
  }

  if (!opts) opts = {};
  if (@isString(apiinfo)) {
    apiinfo = exports.resolve(apiinfo);
  }
  var server = opts.server || apiinfo.server;
  var withTransport = session_f -> require('./wst-client').withWSTClientTransport(server, session_f);
  
  @withVMBridge({withTransport:withTransport,
                 local_itf: undefined
                }) {
    |itf|
    console.log(itf.id+' attempt to get '+(apiinfo .. @get('id'))+' during handshake');
    return session_f({api: itf.remote(apiinfo .. @get('id'))});
  }
};

/**
  @function accept
  @summary Accept a connection request
  @param {Function} [getAPI]
  @param {Function} [withTransport]
  @param {Function} [session_f]
*/
exports.accept = function(getAPI, withTransport, session_f) {
  @withVMBridge({withTransport: withTransport, 
                 local_itf: getAPI}) {
    ||
    session_f();
  }
};

