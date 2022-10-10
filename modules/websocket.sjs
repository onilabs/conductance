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
     Session interface as created by [::withWebSocketClient] or [::WebSocketServer::runWebSocketSession]

   @function IWebSocketSession.receive
   @summary Blocks until the next message is received and returns it.
   @desc 
     * Any messages received while there is not an active `receive()` call will be lost.
     * `receive` can be turned into an [sjs:event::EventStream] using [sjs:sequence::generate].
     * The received messages will either be Strings or ArrayBuffers, depending on the sent item.
   @return {String|ArrayBuffer}

   @variable IWebSocketSession.Pings
   @hostenv nodejs
   @summary [sjs:sequence::Stream] of pings received by the websocket

   @variable IWebSocketSession.Pongs
   @hostenv nodejs
   @summary [sjs:sequence::Stream] of pongs received by the websocket

   @function IWebSocketSession.ping
   @hostenv nodejs
   @summary Send a ping

   @function IWebSocketSession.send
   @param {String|Buffer|ArrayBuffer|TypedArray|DataView} [data]
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
           'mho:websocket'
         ]);

         @withWebSocketClient('wss:ws.kraken.com') {
           |ws|
           waitfor { 
             @generate(ws.receive) .. @each {
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
      rejectUnauthorized: true,
      perMessageDeflate: false,
      skipUTF8Validation: false
    } .. @override(settings);
  }

  settings = {
    url: undefined,
    websocket: undefined,
    protocols: undefined,
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
        throw WebSocketError("Undeterminable error");
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

      @withEventListener(socket, 'message') {
        |receive|

        var itf = {
          receive: @sys.hostenv !== 'nodejs' ? -> receive().data : 
            function() { var m = receive(); if (m[1]) return m[0]; else return String(m[0]); },
          send: __js function(data) { try { return socket.send(data); } catch(e) { throw WebSocketError(e); } }
        };

        if (@sys.hostenv === 'nodejs') {
          itf.Pings = socket .. @events('ping');
          itf.Pongs = socket .. @events('pong');
          itf.ping = -> socket.ping();
        }
        
        //      console.log("WEBSOCKET EXTENSIONS=", socket.extensions);

        return session_f(itf);
      } // withEventListener
    }
  }
  finally {
//    console.log("Initiate websocket close on #{settings.url}");
    socket.close();
  }
}
exports.withWebSocketClient = withWebSocketClient;

//----------------------------------------------------------------------

if (@sys.hostenv === 'nodejs') {

/**
   @class WebSocketServer
   @summary [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) server abstraction
   @hostenv nodejs
   @function WebSocketServer
   @param {optional Object} [settings] Settings that will be passed to the underlying [https://github.com/websockets/ws] `WebSocket.Server` implementation. (Note: settings must be consistent with 'noServer' option)
*/
exports.WebSocketServer = function(config) {
  config = {
    noServer: true
  } .. @merge(config);

  var wss = new @WebSocket.Server(config);

  return {
    /**
       @function WebSocketServer.runWebSocketSession
       @altsyntax WebSocketServer.runWebSocketSession(req) { |itf| ... }
       @summary Run a web socket session off a [sjs:nodejs/http::ServerRequest]
       @param {sjs:nodejs/http::ServerRequest} [req] Initiating request; must be an 'upgrade' request
       @param {Function} [session_func] Function which will be executed with a [::IWebSocketSession]
       @desc
         `runWebSocketSession` is intended to be called on 'upgrade' requests. These will only 
         be created by a suitably configured web server. See **'Upgrade' handler** at [mho:server::Route] and **'upgradable' flag** at [sjs:nodejs/http::withServer].

         ### Example

             // config.mho:
             @ = require(['mho:std','mho:websocket']);

             var WSS = @WebSocketServer();

             exports.serve = function() {
               @server.run([
                 {
                   address: @Port(6060).config({upgradable:true}),
                   routes: [
                     @Route('some/path', {
                              UPGRADE: function(req) {
                                WSS.runWebSocketSession(req) {
                                  |ws|
                                  // use websocket ws here
                                }
                              }
                            })
                   ]
                 }
               ]);
             };
     */
    runWebSocketSession: function(req, session_f) {
      if (!req.upgrade)
        throw new Error("WebSocketServer::runWebSocketSession needs to be run off an 'upgrade' request");
      var { request, head, socket} = req;
      // prevent server logic from cleaning up the socket:
      // XXX maybe we should use a separate flag to indicate that requests have been handled;
      // overloading 'req.socket' in this way could be problematic if we do anything fancy
      // with requests before running sessions off them
      console.log("Websocket connection from #{socket.remoteAddress}");
      req.socket = null;
      try {
        waitfor (var ws) {
          waitfor {
            socket .. @wait('close');
            resume();
          }
          and {
            wss.handleUpgrade(request, socket, head, resume);
          }
        }
        if (ws)
          return withWebSocketClient({websocket:ws}, session_f);
        else
          throw WebSocketError("socket closed before connection established");
      }
      finally {
        // just in case of retraction; all other cases should be covered:
        if (!ws)
          socket.destroy();
      }
    }
  }
};

} // @sys.hostenv === 'nodejs'
