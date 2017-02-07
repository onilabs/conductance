/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
   @module  server/rpc/aat-client
   @summary Asymmetric AJAX Transport Client v2 for modern browsers
   @desc    
     AAT is an efficient bi-directional message exchange protocol over HTTP

     #### Notes

     - AAT is mainly designed to be used as a transport for the [bridge::] module.

     - AAT makes no guarantees about the order in which messages will be received.
       Any message M(sent=t+x) sent after a message M(sent=t) might arrive out of order
       at the other end: M(sent=t+x, received=T), M(sent=t, received=T+y)
       
   @nodoc
*/

@ = require(['sjs:string', 'sjs:object', 'sjs:sequence', 'sjs:event']);
var http = require('sjs:http');
var url  = require('sjs:url');
var func = require('sjs:function');
var logging = require('sjs:logging');
var { TransportError } = require('./error');

var AAT_VERSION   = '2';
var SERVER_PATH   = '__aat_bridge';
var SERVER_PREFIX = '/';
exports.setServerPrefix = (s) -> SERVER_PREFIX = s;

// The maximum time that the server will take to answer our poll
// requests + a little grace period. Coordinated with
// aat-server::PING_INTERVAL.
var SERVER_PING_INTERVAL = 1000*(40+15); 

// maximum number of calls to batch:
var MAX_CALL_BATCH = 200;


/* 
  NB
  Why we use two hold(0)'s in TemporalBatcher

  With one hold(0), only 'temporally adjacent' calls
  will batched into a single request, i.e. calls that don't have a
  hold(0) (or longer) in between them. 

  Several library functions, such as each.par/transform.par, etc, have
  hold(0)'s built-in to limit recursion depth. We say they produce "hold(0)-adjacent results".
  In a call such as

    data .. @transform.par(50, datum -> server.foo(datum)) .. ...

  there will be a built-in hold(0) for every 10's concurrent invocation of 
  server.foo.
*/
function TemporalBatcher(flush) {
  var batch;

  function batcher(initial) {
    var args = [initial];
    batch = @Emitter();
    while (1) {
      waitfor {
        args.push(batch .. @wait());
        if (args.length >= MAX_CALL_BATCH)
          break;
      }
      or {
        // see comment above on why there are two holds here
        hold(0);
        hold(0);
        break;
      }
    }
    batch = undefined;
    try {
      // XXX we might flush reentrantly. the transport should be able to cope with that
      flush(args);
    }
    catch(e) { console.log('aat-client: error flushing:'+e); }
  }

  return function(arg) {
    if (batch) { 
      batch.emit(arg);
    }
    else
      spawn batcher(arg);
  }
}


/*

 2 messages: send, poll

  // this always returns "immediately":
 ['send_'+ID, MES*] -> ['ok',MES*] | ['error_id'] | ['error_xx'] | data_payload
 ['send', MES*] -> ['ok_'+ID, MES*] | ['error_xx']


 // this returns after polling interval (or earlier):
 ['poll_'+ID, MES*] -> ['ok',MES*] | ['error_id'] | ['error_xx'] | data_payload

 // this returns "immediately" (equivalent to 'send'):
 ['poll', MES*] -> ['ok_'+ID, MES*] | ['error_xx']

 All payload encoded as json, apart from 'data_payload', which is:

  character 'd'=100    (1 byte)
  length of header (2 bytes uint16, BE)
  json header      
  binary octets

*/

/**
   @class Transport
   @summary To be documented
   
   @function Transport.send
   @summary To be documented

   @function Transport.sendData
   @summary To be documented
   
   @function Transport.receive
   @summary To be documented

   @function Transport.close
   @summary To be documented
*/

__js function parseResponse(content) {
  var rv;
  var view = new DataView(content);
  if (view.getUint8(0) === 100 /* 'd' */) {
    // a data message
    var header_length = view.getUint16(1);
    var header = content .. @arrayBufferToOctets(3, header_length) .. @utf8ToUtf16 .. JSON.parse;
    var payload = new Uint8Array(content, 3 + header_length);
    var rv = ['ok',
              [{
                type:'data',
                header: header,
                data: payload
              }]
             ];
  }
  else {
    rv =  JSON.parse(content .. @arrayBufferToOctets .. @utf8ToUtf16);
    rv = [rv[0], rv .. @skip(1) .. @map(mes -> {type:'message', data:mes})];
  }

  return rv;
}

/**
   @function openTransport
   @summary  Establish an AAT transport to the given server
   @param {optional String} [server='/'] AAT server to connect to
   @return {::Transport}
*/
function openTransport(server, requestOpts) {
  server = server || url.normalize(SERVER_PREFIX, module.id);
  
  var transport_id_suffix = '';

  var receive_q = [];
  var resume_receive;
  function fail(e) {
    receive_q.push({type:'error', data: e});
    if(resume_receive) resume_receive();
  }
  var poll_stratum;
  if (!requestOpts) requestOpts = null;
  var pendingMessages = [];
  var collectPending = function(messages) {
    var rv = messages ? messages.concat(pendingMessages) : pendingMessages;
    pendingMessages = [];
    return rv;
  }

  function poll_loop() {
    try {
      while (1) {
        // assert(transport_id_suffix)
        waitfor {
          var response = http.request(
            [server, SERVER_PATH, AAT_VERSION,
             {
               cmd: "poll#{transport_id_suffix}"
             }
            ],
            { method: 'POST',
              headers: {'Content-Type': 'text/plain; charset=utf-8'},
              response: 'arraybuffer',
              body: collectPending(),
            } .. @extend(requestOpts));
        }
        or {
          hold(SERVER_PING_INTERVAL);
          throw TransportError("server poll timeout");
        }

        var [status_code, messages] = parseResponse(response.content);

        // check for error response:
        if (status_code != 'ok') {
          throw TransportError("response is not ok: #{status_code}");
        }
        
        // put any messages in receive queue:
/*        
        if (messages.length)
          console.log('<< '+messages.length+' messages from poll');
        else
          console.log('<< empty poll');
*/
        receive_q = receive_q.concat(messages);

        // prod receiver:
        if (receive_q.length && resume_receive) resume_receive();
      }
    }
    catch (e) {
      transport.closed = true;
      fail(e);
    }
  }

  function sendCommand(url, opts, default_id) {
    if (!this.active) return; // receive() will throw, don't need to do anything here
    var response;
    try {
      try {
        response = http.request(url, opts .. @extend({response:'arraybuffer'}) .. @extend(requestOpts));
      } catch(e) {
        throw TransportError(e.message);
      }
      
      var [status_code, messages] = parseResponse(response.content);

      // check for error response:
      if (typeof status_code !== 'string' || status_code.indexOf('ok') != 0)
        throw TransportError("response is not ok: #{status_code}");

      if (!transport_id_suffix) {
        // we're expecting an id
        transport_id_suffix = status_code.substr(2) || default_id || "";
        if (!transport_id_suffix)
          throw TransportError("Missing transport ID");
        
        // ok, all good, we've got an id:
        this.id = transport_id_suffix.substr(1);
        
        // start our polling loop:
        poll_stratum = spawn (hold(0),poll_loop());
      }
      else if (status_code != 'ok')
        throw TransportError("response not ok: #{status_code}");

      // put any messages in receive queue:
/*      if (messages.length)
        console.log('<< '+messages.length+' received from send');
*/
      receive_q = receive_q.concat(messages);

      // prod receiver:
      if (receive_q.length && resume_receive) resume_receive();
    } catch (e) {
      this.close();
      fail(e);
    }
  }


  //----

  var transport = {
    active: true,

    send: TemporalBatcher(function(messages) { 
/*      if (messages.length === 1) {
        console.log(messages[0]);
      }
      else
        console.log('>> sending '+messages.length);
*/
      sendCommand.call(transport,
        [server, SERVER_PATH, AAT_VERSION,
        {
          cmd: "send#{transport_id_suffix}"
        }
        ],
        { method: 'POST',
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
          body: JSON.stringify(collectPending(messages))
        });
    }),

    enqueue: function(message) {
      // add a non-timely message to be sent out with the next
      // poll / command (or never, if the connection ends before then)
      pendingMessages.push(message);
    },

    sendData: function(header, data) {
      sendCommand.call(this,
        [server, SERVER_PATH, AAT_VERSION,
        {
          cmd: "data#{transport_id_suffix}",
          header: JSON.stringify(header)
        }
        ],
        {
          method: 'POST',
          headers: {'Content-Type': 'text/plain'},
          body: data
        });
    },

    receive: func.sequential(function() {
      if (!this.active) throw TransportError("inactive transport");

      if (!receive_q.length) {
        waitfor() {
          resume_receive = resume;
        }
        finally {
          resume_receive = undefined;
        }
      }
      return receive_q.shift();
    }),

    close: function() {
      if (!this.closed) {
        this.closed = true;
        if (transport_id_suffix.length) {
          spawn (function() {
            try {
              http.post([
                server, SERVER_PATH, AAT_VERSION,
                { cmd: "close#{transport_id_suffix}" } ],
                requestOpts);
            } catch (e) {
              logging.debug("Error closing transport: #{e}");
            }
          })();
        }
      }
      this.active = false;
      if (poll_stratum) poll_stratum.abort();
    }
  };

  transport.__finally__ = transport.close;
  return transport;
}
exports.openTransport = openTransport;
