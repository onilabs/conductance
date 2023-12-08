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
   @module rpc/wst-client
   @summary Websocket Transport Client
   @desc
     Designed to be used as a transport for the [bridge::] module.
     
   @nodoc
*/

@ = require([
  'sjs:std',
  'mho:websocket',
  {id:'./error', include:['TransportError', 'isTransportError', 'markAsTransportError']},
  {id:'mho:msgpack', name:'msgpack'},
]);


//----------------------------------------------------------------------
// helper (should go into sjs):

__js function concat_typed_arrays(typed_arrays) {
  var length = typed_arrays .. @reduce(0, (sum, a)->sum+a.byteLength);
  //console.log("LENGTH=#{length}");
  var buf = new Uint8Array(length);
  var offset = 0;
  typed_arrays .. @each {
    |a|
    buf.set(a, offset);
    offset += a.byteLength;
  }
    
  return buf;
}

//----------------------------------------------------------------------
// common wst-client/wst-server code:

var MAX_MESSAGE_BYTES = 100*1024;

var KEEPALIVE_T0 = 600; // time from traffic to first keepalive packet
var KEEPALIVE_T_MAX = 30000; // max time between keepalives
var KEEPALIVE_T_LAT = 1500; // time to budget for round-trip latency (note: XXX this needs to account for full transmission time of initiating normal traffic packet too; i.e. it could be problematic for large messages)

/*

  we use 2 types of messages:

  - empty strings:        keep-alive messages
  - binary:               msgpack-encoded data chunks

*/

__js {
  // messages passed through send/receive are always 
  // of the format [json-encodable data, [ ... array buffers ]]
  // msgpack cannot send arraybuffers, but *can* send Uint8Arrays. We need to do some converting:
  
  function marshall(msg) {
    return [msg[0], msg[1] .. @map(buf -> new Uint8Array(buf))];
  }

  function unmarshall(msg) {
    // XXX it sucks that we have to copy the buffer here, but downstream expects zero-offset, exact buffers :/
    return [msg[0], msg[1] .. @map(buf -> buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.length))];
  }

} // __js

// constants for 'Traffic' dispatcher:
var RECEIVE_TRAFFIC = 1;
var SEND_TRAFFIC = 2;

function runTransportSession(ws, is_server, receive_buffer_size, session_f) {
  // min capacity 1, so that we can flush in finally below to kill any pending receive calls. Note: the sync flag is important if receive_buffer_size===0, so that RQ gets cleared by pending gets before the next put... we need to avoid blocking:
  receive_buffer_size = Math.max(receive_buffer_size, 1);
  var RQ = @Queue(receive_buffer_size, true); 
  var SQ = @Queue(1000);

  var ReconstitutionIDCounter = 0;
  var ReconstitutionBuffer = {};

  var Traffic = @Dispatcher();
  var Keepalives = @Dispatcher();
  
  waitfor {
    // RECEIVE LOGIC:
    @generate(ws.receive) .. @each(__js function(mes) {
      // this function must never block, so we check RQ count:
      if (RQ.count() === receive_buffer_size) 
        throw new Error("Receive buffer is full");
      if (typeof mes == 'string' && mes.length === 0) {
        Keepalives.dispatch();
      }
      else {
        mes = @msgpack.decode(mes);
        Traffic.dispatch(RECEIVE_TRAFFIC);
        if (Array.isArray(mes) && mes[0] === '@wst') {
          if (mes[1] === 'split') {
            console.log("wst-client: rcv split message");
            var parts = ReconstitutionBuffer[mes[2]];
            if (!parts) {
              parts = ReconstitutionBuffer[mes[2]] = [];
            }
            parts.push(mes[3]);
          }
          else if (mes[1] === 'final') {
            var parts = ReconstitutionBuffer[mes[2]];
            parts.push(mes[3]);
            var data = concat_typed_arrays(parts);
            console.log("wst-client: reconstitute split message");
            data = @msgpack.decode(data);
            delete ReconstitutionBuffer[mes[2]];
            RQ.put(unmarshall(data));
          }
          else if (mes[1] === 'cancel') {
            console.log("wst-client: rcv split message cancel");
            delete ReconstitutionBuffer[mes[2]];
          }
          else throw new Error("wst-client: Received unknown internal @wst message");
        }
        else
          RQ.put(unmarshall(mes));
      }
    }); // @generate(ws.receive)
    hold(0); // needed?
  }
  or {
    // SEND LOGIC
    @generate(->SQ.get()) .. @each {
      |data|
      if (data.byteLength <= MAX_MESSAGE_BYTES) {
        ws.send(data);
        Traffic.dispatch(SEND_TRAFFIC);
      }
      else {
        console.log('wst-client: splitting message for transfer');
        var offset = data.byteOffset;
        var remain = data.byteLength;
        var id = ++ReconstitutionIDCounter;
        while (1) {
          var sending = Math.min(remain, MAX_MESSAGE_BYTES);
          var view = data.subarray(offset, sending+offset);
          remain -= sending;
          if (remain > 0) {
            offset += sending;
            ws.send(@msgpack.encode(['@wst','split',id,view]));
            Traffic.dispatch(SEND_TRAFFIC);
            // XXX This hold() would allow concurrent sends, but
            // because bridge.sjs will re-order messages
            // and process them sequentially it ultimately doesn't
            // help with anything (e.g. to keep the bridge 'live'
            // when there's a huge message)
            hold(0);
          }
          else {
            ws.send(@msgpack.encode(['@wst','final',id,view]));
            Traffic.dispatch(SEND_TRAFFIC);
            break;
          }
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
         In such a situation, the receiver might only act on a connection break later 
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
        var start_time = new Date();
        waitfor {
          hold(t_s);
          var mid_time = new Date();
          if (mid_time - start_time -t_s > .1*t_s) {
            console.log("Transport violation: Initial keepalive timer took #{mid_time-start_time}ms - should have been #{t_s}ms");
          }
          collapse;
          ws.send('');
        }
        or {
          @events(Traffic) .. @filter(t->t===SEND_TRAFFIC) .. @first();
          continue; // reset t
        }
        finally {
          var end_time = new Date();
          if (end_time - start_time - t_s > .1*t_s) {
            console.log("Transport violation: Initial keepalive took #{end_time-start_time}ms - should have been ~#{t_s}ms");
          }
        }
        // follow-on loop
        waitfor {
          while (1) {
            var start_time = new Date();
            t_s *= 2;
            if (t_s > KEEPALIVE_T_MAX) t_s = KEEPALIVE_T_MAX;
            hold(t_s);
            ws.send('');
            var end_time = new Date();
            if (end_time - start_time - t_s > .1*t_s) {
              console.log("Transport violation: Follow-on keepalive took #{end_time-start_time}ms - should have been ~#{t_s}ms");
            }
          }
        }
        or {
          Traffic.receive();
        }
      }
    }
  }
  or {
    var transport_itf = {
      server: is_server,
      closed: false,
      send: function(message) {
        if (transport_itf.closed) throw @TransportError("connection closed");
        __js var data = @msgpack.encode(marshall(message));
        SQ.put(data);
      },
      receive: function() { if (transport_itf.closed) throw @TransportError("connection closed");
                            var rv = RQ.get();
                            if (transport_itf.closed) {
                              throw @TransportError("connection closed");
                            }
                            return rv;
                          }
    };
    try {
      return session_f(transport_itf);
    }
    finally {
      // XXX is this needed?
      transport_itf.closed = true;
      
      // flush the queue with some dummy data, so that any pending receive call gets aborted
      if (RQ.count() === 0) RQ.put(undefined);
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
   @function withWSTClientTransport
   @summary XXX
*/
exports.withWSTClientTransport = function(server, settings, session_f) {
  server = server || @url.normalize(SERVER_PREFIX, module.id);
  server = server.replace(/^http/, 'ws')  +SERVER_PATH + '/' + WST_VERSION;
  try {
    @withWebSocketClient({url:server, rejectUnauthorized:settings.rejectUnauthorized}) {
      |ws|
      return runTransportSession(ws, false, settings.receive_buffer_size, session_f);
    }
  }
  catch (e) {
    if (e .. @isWebSocketError()) {
      e .. @markAsTransportError();
    }
    throw e;
  }
};
