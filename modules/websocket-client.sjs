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
  @summary websocket client
  @desc
    Uses the https://github.com/websockets/ws library on the server side.
*/

@ = require([
  'sjs:std'
]);

if (require('sjs:sys').hostenv === 'nodejs') {
  @WebSocket = require('ws');
}
else { // xbrowser implied
  @WebSocket = WebSocket;
}

/**
   @class WebSocketClient
   @summary [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) client as created by [::withWebSocketClient]
   @desc
     Call [::withWebSocketClient] to create a WebSocketClient in a block context.

   @function WebSocketClient.receive
   @summary Returns an unbuffered and unmirrored [sjs:sequence::Stream] of received messages
   @return {sjs:sequence::Stream}

   @function WebSocketClient.send
   @param {String|Buffer|ArrayBuffer} [data]
   @summary Send the given data
*/

/**
   @function withWebSocketClient
   @altsyntax withWebSocketClient(url) { |client| ... }
   @summary Run a websocket client
   @param {String} [url] URL to connect to
   @param {Function} [block] Function that will be passed a [::WebSocketClient] object
   @desc
     Establishes a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) client
     connection to `url`, and calls `block` with a [::WebSocketClient] object.
     When `block` exits (normally, by exception, or retraction), the connection will automatically be closed.
     
     ### Example

         @ = require([
           'mho:std',
           'mho:websocket-client'
         ]);

         @withWebSocketClient('wss:ws.kraken.com') {
           |ws|
           waitfor { 
             ws.receive() .. @each {
               |x|
               console.log(x);
             }
           }
           and {
             ws.send(JSON.stringify:: 
                       {
                         event:'subscribe', 
                         pair: ['BTC/USD'], 
                         subscription: { name: 'spread'}
                       });
           }
           and {
             process.stdin .. @stream.lines .. @each {
               |x|
               ws.send(x);
             }
           }
         }

*/

__js function ignore() {}

function withWebSocketClient(url, block) {
  __js var socket = new @WebSocket(url);
  try {
    waitfor {
      try {
        var error = socket .. @wait('error');
        throw new Error(error);
      }
      finally {
        // ignore errors, so that we don't get things like
        // "WebSocket was closed before the connection was
        //  establised" on performing the socket.close() 
        //  below.
        __js socket.on('error', ignore);
      }
    }
    or {
      socket .. @wait('close');
      throw new Error("websocket to '#{url}' closed");
    }
    or {
      socket .. @wait('open');
      block({
        receive: -> socket .. @events('message'),
        send: data -> socket.send(data)
      });
    }
  }
  finally {
    socket.close();
  }
}
exports.withWebSocketClient = withWebSocketClient;
