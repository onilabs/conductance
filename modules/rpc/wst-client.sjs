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
  {id:'./error', include:['TransportError', 'isTransportError']},
  {id:'mho:msgpack', name:'msgpack'},
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

// constants for 'Traffic' dispatcher:
var RECEIVE_TRAFFIC = 1;
var SEND_TRAFFIC = 2;

function runTransportSession(ws, session_f) {
  var Q = @Queue(1000);

  var Traffic = @Dispatcher();
  var Keepalives = @Dispatcher();
  
  waitfor {
    @generate(ws.receive) .. @each {
      |mes|
      if (typeof mes == 'string' && mes.length === 0) {
        Keepalives.dispatch();
      }
      else {
        __js mes = @msgpack.decode(mes);
        if (__js !(mes instanceof Uint8Array)) {
          Traffic.dispatch(RECEIVE_TRAFFIC);
          Q.put({type:'message', data:mes});
        }
        else {
          Traffic.dispatch(RECEIVE_TRAFFIC);
          // data message; typeof = Uint8Array
          __js {
            var mes_buffer = mes.buffer;
            var mes_length = mes.byteLength;
            var mes_offset = mes.byteOffset;
            var header_length = (new DataView(mes_buffer,mes_offset)).getUint16(0);
            var header = UTF8Decoder.decode(new Uint8Array(mes_buffer,2+mes_offset,header_length)) .. JSON.parse;
            var data = new Uint8Array(mes.buffer, 2+header_length+mes_offset);
          }
          Q.put({type:'data', header: header, data: data});
        }
      }
    }
  }
  or {
    /* 
       Keepalive logic:

       * After any sent or received message, either side in the connection expects to receive 
         either a message or a ping within (KEEPALIVE_T0 + KEEPALIVE_T_LAT) from the other side.
       * While there is no message traffic, either side expects a ping from the other side with
         increasing intervals (INTERVAL + KEEPALIVE_T_LAT), where INTERVAL=2^N*KEEPALIVE_T0 up to
         a maximum of KEEPALIVE_T_MAX.

       Idea behind the keepalive relaxation logic:

       * Generally bridge traffic consists of 'dialogs', where one side initiates a call, waits
         for a reply, which might trigger another reply, etc. Our main goal is to ensure
         that clients are informed as soon as possible into one of these dialogs if the connection
         breaks. 
       * At the same time we don't want to tie up too much bandwidth with needless keep-alives.
       * The relaxation logic strikes a balance, sending out keepalives at intervals at which we
         reasonably might expect messages. 

       Quirks:
       
       * The simple wst protocol doesn't send any (logical) timestamps, so we cannot match up 
         pings with their respective triggering message. As a result, the keepalive receive
         logic might sometimes open up the 'expected receive interval' in response to a keepalive 
         that was sent by the other side BEFORE the last triggering message. In effect, the 
         receiver will allow more time for each follow-on ping than necessary: Where the sender 
         sends a ping after an interval of 2^X*KEEPALIVE_T0, the receiver will allow an interval
         2^(X+1)*KEEPALIVE_T0 (or maybe even X+N, N>1?). 
         In such a situation, the receiver might only act on a connection break at a later 
         than would be possible if messages were matched up perfectly (on average by X*KEEPALIVE_T0?)
         Given that this scenario is relatively uncommon and self-resetting (both when new 
         messages are exchanged, or when the keepalive interval hits KEEPALIVE_T_MAX), in practice
         it is probably not worth 'fixing' this.
    */

    waitfor {
      // keepalive receive logic
      while (1) {
        var t_r = KEEPALIVE_T0;
        waitfor {
          hold(t_r + KEEPALIVE_T_LAT);
          console.log("Transport timeout within t_r+lat="+(t_r+KEEPALIVE_T_LAT)+"ms");
          throw @TransportError("timeout");
        }
        or {
          @events(Traffic) .. @filter(t->t===RECEIVE_TRAFFIC) .. @first();
          continue; // reset t
        }
        or {
          Keepalives.receive();
        }
        // follow-on loop:
        waitfor {
          while (1) {
            t_r *= 2;
            if (t_r > KEEPALIVE_T_MAX) t_r = KEEPALIVE_T_MAX;
            waitfor {
              hold(t_r + KEEPALIVE_T_LAT);
              console.log("Transport timeout 2 within t_r+lat="+(t_r+KEEPALIVE_T_LAT)+"ms");
              throw @TransportError("timeout");            
            }
            or {
              Keepalives.receive();
            }
          }
        }
        or {
          Traffic.receive();
        }
      }
    }
    and {
      // keepalive send logic
      while (1) {
        var t_s = KEEPALIVE_T0;
        // initial keepalive (not resettable by received traffic)
        waitfor {
          hold(t_s);
          collapse;
          ws.send('');
        }
        or {
          @events(Traffic) .. @filter(t->t===SEND_TRAFFIC) .. @first();
          continue; // reset t
        }
        // follow-on loop
        waitfor {
          while (1) {
            t_s *= 2;
            if (t_s > KEEPALIVE_T_MAX) t_s = KEEPALIVE_T_MAX;
            hold(t_s);
            ws.send('');
          }
        }
        or {
          Traffic.receive();
        }
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
        ws.send(__js @msgpack.encode(message));
        Traffic.dispatch(SEND_TRAFFIC);
      },
      sendData: function(header, bytes) {
        if (transport_itf.closed) throw @TransportError("connection closed");
        __js {
          header = UTF8Encoder.encode(JSON.stringify(header));
          var packet = new ArrayBuffer(2 + header.byteLength + bytes.byteLength);
          (new DataView(packet)).setUint16(0,header.byteLength);
          var payload = (new Uint8Array(packet, 2));
          payload.set(header,0);
          payload.set(bytes,header.byteLength);
        }
        ws.send(__js @msgpack.encode(new Uint8Array(packet)));
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
      return session_f(transport_itf);
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
   @param {optional String} [server] WST server to connect to (default = server where this module is served from)
   @return {::Transport}
*/
function openTransport(server, requestOpts) {
  var rv;
  (function() {
    server = server || @url.normalize(SERVER_PREFIX, module.id);
    server = server.replace(/^http/,'ws') + SERVER_PATH + '/' + WST_VERSION;
    //console.log("OPEN WST TRANSPORT TO #{server}");
    @withWebSocketClient(server) {
      |ws|
      runTransportSession(ws) {
        |transport|
        rv = transport;
        // continue stratum in background:
        var service_stratum = reifiedStratum;
        @sys.spawn(function() { 
          try {
            service_stratum.capture();
          }
          catch(e) {
            if (!@isWebSocketError(e) && !@isTransportError(e)) {
              console.log('wst-client: Uncaught exception '+e);
            }
            // else ignore
          }
        });
        // hold transport open; session will close (with transport error) when 
        // transport closed from either our or the other side:
        hold();
      }
    }
  })();
  return rv;
}

exports.openTransport = openTransport;
