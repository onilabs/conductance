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
  @summary websocket server/client library
  @desc
    Uses the https://github.com/websockets/ws library on the server side.
*/

@ = require([
  'sjs:std'
]);

if (@sys.hostenv === 'nodejs') {
  @WebSocket = require('ws');
}
else { // xbrowser implied
  @WebSocket = WebSocket;
}

//----------------------------------------------------------------------
/**
   @class WebSocketError
   @inherit Error
   @summary Error class raised by [::withWebSocketClient] for communication errors or unexpected socket closures.
   
   @function isWebSocketError
   @param {Object} [e] Object to test
   @summary Returns `true` if `e` is a [::WebSocketError]
*/
__js {
  function WebSocketError(mes) {
    var err = new Error("Websocket Error: #{mes}");
    err.__oni_web_socket_error = true;
    return err;
  }

  function isWebSocketError(e) {
    return e && e.__oni_web_socket_error === true;
  }
  exports.isWebSocketError = isWebSocketError;
} // __js 

//----------------------------------------------------------------------
/**
   @class IWebSocketSession
   @summary [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) session interface
   @desc
     Session interface as created by [::withWebSocketClient].

   @function IWebSocketSession.receive
   @summary Returns an unbuffered and unmirrored [sjs:sequence::Stream] of received data
   @desc 
     The stream items will either be Strings or ArrayBuffers, depending on the sent item.
   @return {sjs:sequence::Stream}

   @function IWebSocketSession.send
   @param {String|Buffer|ArrayBuffer} [data]
   @summary Send the given data
*/


//----------------------------------------------------------------------
/**
   @function withWebSocketClient
   @altsyntax withWebSocketClient(url, session_f)
   @altsyntax withWebSocketClient(settings) { |session| ... }
   @altsyntax withWebSocketClient(url) { |session| ... }
   @summary Run a websocket client
   @param {Object} [settings]
   @setting {String} [url] URL to connect to
   @setting {String|Array} [protocols] List of Subprotocols
   @setting {Boolean} [rejectUnauthorized=true] **nodejs-only** Whether to reject 'wss' connections not authorized as per builtin CAs.
   @param {Function} [session_f] Function that will be passed a [::IWebSocketSession] interface object.
   @desc
     Establishes a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) client
     connection to `url`, and calls `session_f` with a [::IWebSocketSession] object.
     When `session_f` exits (normally, by exception, or retraction), the connection will automatically be closed.
     
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

function withWebSocketClient(settings, session_f) {
  if (typeof settings === 'string')
    settings = { url: settings };

  if (@sys.hostenv === 'nodejs') {
    var nodejs_opts = {
      rejectUnauthorized: true
    } .. @override(settings);
  }

  settings = {
    url: undefined,
    websocket: undefined,
    protocols: undefined
  } .. @override(settings);

  // for internal use by WebSocketServer, we allow initialization with a websocket instead
  // of url string:
  var socket;
  if (settings.websocket)
    socket = settings.websocket;
  else {
    if (@sys.hostenv === 'nodejs')
      socket = new @WebSocket(settings.url, settings.protocols, nodejs_opts);
    else
      socket = new @WebSocket(settings.url, settings.protocols);
  }
  socket.binaryType = 'arraybuffer';
  try {
    waitfor {
      try {
        var error = socket .. @wait('error');
        throw WebSocketError(error);
      }
      finally {
        // ignore errors, so that we don't get things like
        // "WebSocket was closed before the connection was
        //  establised" on performing the socket.close() 
        //  below.
        __js socket.onerror = ignore;
      }
    }
    or {
      socket .. @wait('close');
      throw WebSocketError("websocket#{socket.url ? ' to '+socket.url : ''} closed");
    }
    or {
      if (socket.readyState !== @WebSocket.OPEN)
        socket .. @wait('open');

      var receive_stream = socket .. @events('message');
      if (@sys.hostenv !== 'nodejs')
        receive_stream = receive_stream .. @transform(__js x->x.data);

      session_f({
        receive: -> receive_stream,
        send: data -> socket.send(data)
      });
    }
  }
  finally {
    socket.close();
  }
}
exports.withWebSocketClient = withWebSocketClient;
