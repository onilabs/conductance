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
   @module rpc/wst-client
   @summary Websocket Transport Client
   @desc
     Designed to be used as a transport for the [bridge::] module.
     
   @nodoc
*/

@ = require([
  'sjs:std',
  'mho:websocket',
  {id:'./error', include:['TransportError', 'isTransportError']}
]);

//----------------------------------------------------------------------
// common wst-client/wst-server code:

var KEEPALIVE_T0 = 300; // time from traffic to first keepalive packet
var KEEPALIVE_T_MAX = 30000; // max time between keepalives
var KEEPALIVE_T_LAT = 1500; // time to budget for round-trip latency (note: XXX this needs to account for full transmission time of initiating normal traffic packet too; i.e. it could be problematic for large messages)

/*

  we use 3 types of messages:

  - empty strings:        keep-alive messages
  - non-empty strings:    json messages ('send')
  - binary (ArrayBuffer): binary data ('sendData')

*/

// helpers for encoding/decoding headers for binary data:
var UTF8Encoder = new TextEncoder();
var UTF8Decoder = new TextDecoder();

// constants for 'Traffic' emitter:
var RECEIVE_TRAFFIC = 1;
var SEND_TRAFFIC = 2;

function runTransportSession(ws, session_f) {
  var Q = @Queue(1000);

  var Traffic = @Emitter();
  var Keepalives = @Emitter();

  waitfor {
    ws.receive() .. @each {
      |mes|
      if (typeof mes === 'string') {
        if (mes.length === 0) {
          Keepalives.emit();
        }
        else {
          Traffic.emit(RECEIVE_TRAFFIC);
          Q.put({type:'message', data:JSON.parse(mes)});
        }
      }
      else if (mes instanceof ArrayBuffer) {
        Traffic.emit(RECEIVE_TRAFFIC);
        // data message; typeof = Uint8Array
        var header_length = (new DataView(mes)).getUint16(0);
        var header = UTF8Decoder.decode(new Uint8Array(mes,2,header_length)) .. JSON.parse;
        var data = new Uint8Array(mes, 2+header_length);
        Q.put({type:'data', header: header, data: data});
      }
      else 
        throw new Error("Unexpected message type");
    }
  }
  or {
    /* 
       keepalive logic:

       * kicks in when there hasn't been any message traffic for KEEPALIVE_T0 ms.
       * party who last _received_ a message sends a keepalive to the sender. This, in turn,
         gets acknowledged with a keepalive by the sender within KEEPALIVE_T_LAT.
       * parties continue sending/acknowledging keepalives, with intervals increasing by 
         factor of 2 after every round, up to a maximum of KEEPALIVE_T_MAX.
       * logic resets as soon as any proper message sent/received. 

       Idea behind the relaxation logic:

       * Generally bridge traffic consists of 'dialogs', where one side initiates a call, waits
         for a reply, which might trigger another reply, etc. Our main goal is to ensure
         that clients are informed as soon as possible into one of these dialogs if the connection
         breaks. 
       * At the same time we don't want to tie up too much bandwidth with needless keep-alives.
       * The relaxation logic strikes a balance, sending out keepalives at intervals at which we
         reasonably might expect messages. 

    */
    Traffic .. @each.track {
      |direction|
      var t = KEEPALIVE_T0;
      while (1) {
        waitfor {
          hold(t + KEEPALIVE_T_LAT);
          throw @TransportError("timeout");
        }
        or {
          if (direction === RECEIVE_TRAFFIC) {
            hold(t);
            ws.send(''); // send keepalive
          }
          Keepalives .. @wait();
          if (direction === SEND_TRAFFIC) {
            ws.send(''); // send keepalive
          }
        }
        t *= 2;
        if (t > KEEPALIVE_T_MAX) t = KEEPALIVE_T_MAX;
      }
    }
  }
  or {
    waitfor() {
      var close = resume;
    }
    throw @TransportError("connection closed");
  }
  or {
    var transport_itf = {
      closed: false,
      send: function(message) {
        if (transport_itf.closed) throw @TransportError("connection closed");
        ws.send(JSON.stringify(message));
        Traffic.emit(SEND_TRAFFIC);
      },
      sendData: function(header, bytes) {
        if (transport_itf.closed) throw @TransportError("connection closed");
        header = UTF8Encoder.encode(JSON.stringify(header));
        var packet = new ArrayBuffer(2 + header.byteLength + bytes.byteLength);
        (new DataView(packet)).setUint16(0,header.byteLength);
        var payload = (new Uint8Array(packet, 2));
        payload.set(header,0);
        payload.set(bytes,header.byteLength);

        ws.send(packet);
      },
      receive: function() { if (transport_itf.closed) throw @TransportError("connection closed");
                            var rv = Q.get();
                            if (transport_itf.closed) {
                              throw @TransportError("connection closed");
                            }
                            return rv;
                          },
      __finally__: function() {
        close();
        transport_itf.closed = true;
        // flush the queue with some dummy data:
        Q.put(undefined);
      }
    };
    try {
      session_f(transport_itf);
    }
    finally {
      // XXX is this needed?
      transport_itf.closed = true;
      // flush the queue with some dummy data:
      Q.put(undefined);
    }
  }
}

// exported for use by wst-server:
exports.runTransportSession = runTransportSession;

//----------------------------------------------------------------------

var WST_VERSION   = '1';
var SERVER_PATH   = '__wst_bridge';
var SERVER_PREFIX = '/';
exports.setServerPrefix = (s) -> SERVER_PREFIX = s;


/**
   @function openTransport
   @summary  Establish an WST transport to the given server
   @param {optional String} [server='/'] WST server to connect to
   @return {::Transport}
*/
function openTransport(server, requestOpts) {
  waitfor (var rv) {
    spawn (function() {
      try {
        server = server || @url.normalize(SERVER_PREFIX, module.id);
        server = server.replace(/^http/,'ws') + SERVER_PATH + '/' + WST_VERSION;
//        console.log("OPEN WST TRANSPORT TO #{server}");
        @withWebSocketClient(server) {
          |ws|
          runTransportSession(ws) {
            |transport|
            resume(transport);
            // hold transport open; session will close (with transport error) when 
            // transport closed from either our or the other side:
            hold();
          }
        }
      }
      catch(e) {
        if (!@isWebSocketError(e) && !@isTransportError(e)) {
          console.log('wst-client: Uncaught exception '+e);
        }
        // else ignore
      }
    })();
  }
  return rv;
}

exports.openTransport = openTransport;
