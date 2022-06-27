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
   @param {Function} [transportSink] Function to pass accepted [wst-client::Transport] objects to
*/
function createTransportHandler(transportSink) {

  var SocketServer = @WebSocketServer();

  function handler_func(req) {
    @sys.spawn(function() {
      try {
        SocketServer.runWebSocketSession(req) {
          |ws|
          @runTransportSession(ws) { 
            |transport_itf|
            transport_itf.server = true;
            transportSink(transport_itf);
            hold();
          }
        }
      }
      catch(e) {
        if (!@isWebSocketError(e) && !@isTransportError(e)) {
          console.log("wst-server: Uncaught exception "+e);
        }
        // else ignore
        console.log("ignored error:");
        console.log(e);
      }
    });
  }

  return {
    "UPGRADE": handler_func
  }
}
exports.createTransportHandler = createTransportHandler;
