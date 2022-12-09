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
   @module rpc/wst-server
   @summary Websocket Transport Server
   @hostenv nodejs
   @desc
     Designed to be used as a transport for the [bridge::] module.
     
   @nodoc
*/

@ = require([
  'sjs:std',
  'mho:websocket',
  './wst-client',
  {id:'./error', include:['TransportError', 'isTransportError']}
]);

/**
   @function createTransportHandler
   @summary Create an WST transport handler for use in a [server::Route].
   @param {Function} [transportSink] Service using transport - will be called with a 'withTransport' function as first parameter, and session_f as second.
*/
function createTransportHandler(transportSink) {
  var SocketServer = @WebSocketServer();

  function handler_func(req) {

    waitfor {
      // waitfor/resume, because we must not return before the upgrade has been performed.
      waitfor() {
        @sys.spawn(function() {
          try {
            function withTransport(inner_session_f) {     
              SocketServer.runWebSocketSession(req) {
                |ws|
                resume();
                @runTransportSession(ws, true) {
                  |transport_itf|
                  return inner_session_f(transport_itf);
                }
              }
            }
            transportSink(withTransport) {
              |itf|
              hold();
            }
          }
          catch(e) {
            if (!@isWebSocketError(e) || e.message !== 'Websocket Error: websocket closed')
              console.log("wst-server: Uncaught exception: ",e);
            // else ... websocket was closed; ignore
          }
        });
      }
    }
    or {
      // set a (very conservative) limit on the time for the upgrade:
      hold(5000);
      console.log("wst-server: socket upgrade timeout!");
      // XXX close socket?
    }
  }

  return {
    "UPGRADE": handler_func
  }
}
exports.createTransportHandler = createTransportHandler;
