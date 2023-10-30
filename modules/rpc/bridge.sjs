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
  {id:'sjs:thread', name:'thread'},
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
  @setting {optional Boolean} [acceptDFuncs=false] Whether our side of the bridge will accept [sjs:#language/syntax::dfunc]s. Note that dfuncs grant the remote side unlimited code execution capabilities
  @desc
    Throws a [::TransportError] if the connection attempt fails.

    If `api` is an apiinfo object (rather than a URL) string, you must also
    provide either a `server` or `transport` setting.

    `session_f` will be called with an argument `{api: remoteAPI}`.

    When `session_f` finishes execution (either normally or via an exception), the
    connection will be closed automatically.
*/

var constructWithThreadedTransport= server -> function(session_f) {
  //  return require('mho:rpc/wst-client').withWSTClientTransport(server, 0, session_f);
  // we're running the transport in a separate thread, so that keepalives keep better timing
  @thread.withThread(@{
    -> require('mho:rpc/wst-client').withWSTClientTransport
  }) {
    |[withClientTransport]|
    // we need some receive-buffering, because we cannot synchronously receive across the thread
    // barrier. arbitrarily set to 1000 here. 
    return withClientTransport(server, 1000, session_f);
  }
};

exports.connect = function(apiinfo, opts, session_f) {
  if (!opts) opts = {};
  if (@isString(apiinfo)) {
    apiinfo = exports.resolve(apiinfo);
  }
  var server = opts.server || apiinfo.server;
  
  @withVMBridge({withTransport:constructWithThreadedTransport(server),
                 local_itf: undefined,
                 acceptDFuncs: opts.acceptDFuncs ? true : false
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
  return @withVMBridge({withTransport: withTransport, 
                        acceptDFuncs: false,
                        local_itf: getAPI}, session_f);
};

