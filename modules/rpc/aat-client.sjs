/* (c) 2013-2014 Oni Labs, http://onilabs.com
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
   @desc    AAT is an efficient bi-directional message exchange protocol over HTTP
   @nodoc
*/

@ = require(['sjs:string', 'sjs:object', 'sjs:sequence']);
var http = require('sjs:http');
var url  = require('sjs:url');
var func = require('sjs:function');
var { TransportError } = require('./error');

var AAT_VERSION   = '2';
var SERVER_PATH   = '__aat_bridge';
var SERVER_PREFIX = '/';
exports.setServerPrefix = (s) -> SERVER_PREFIX = s;

// The maximum time that the server will take to answer our poll
// requests + a little grace period. Coordinated with
// aat-server::PING_INTERVAL.
var SERVER_PING_INTERVAL = 1000*(40+5); 

// time (in ms) over which to batch aat calls:
/* 
  Why we set a non-zero call batch period:

  With CALL_BATCH_PERIOD set to 0, only 'temporally adjacent' calls
  will batched into a single request, i.e. calls that don't have a
  hold(0) (or longer) in between them. 

  Several library functions, such as each.par/transform.par, etc, have
  hold(0)'s built-in to limit recursion depth. 
  In a call such as

    data .. @transform.par(50, datum -> server.foo(datum)) .. ...

  there will be a built-in hold(0) for every 10's concurrent invocation of 
  server.foo.
  Thus a value of CALL_BATCH_PERIOD = 0 would cause only 10 server.foo calls to be batched up 
  into the same request, and not 50 as the code might suggest. 
*/
var CALL_BATCH_PERIOD = 20;

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
function openTransport(server) {
  server = server || url.normalize(SERVER_PREFIX, module.id);
  
  var transport_id_suffix = '';

  var receive_q = [];
  var resume_receive;
  var poll_stratum;

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
              response: 'arraybuffer'
            });
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
        receive_q = receive_q.concat(messages);

        // prod receiver:
        if (receive_q.length && resume_receive) resume_receive();
      }
    }
    catch (e) {
      transport.closed = true;
      if(resume_receive) resume_receive(e);
      // if resume_receive is not set, an error will still be thrown by the next receive()
      // because the transport is inactive
    }
  }

  function sendCommand(url, opts, default_id) {
    if (!this.active) throw TransportError("inactive transport");
    var response;
    try {
      try {
        response = http.request(url, opts .. @extend({response:'arraybuffer'}));
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
      receive_q = receive_q.concat(messages);

      // prod receiver:
      if (receive_q.length && resume_receive) resume_receive();
    } catch (e) {
      this.close(e);
    }
  }


  //----

  var transport = {
    active: true,

    send: func.unbatched(function(messages) {
      // XXX we actually don't want to use 'unbatched' here, because
      // we don't need to map the return value. We want some async
      // equivalent to 'unbatched'
      sendCommand.call(this,
        [server, SERVER_PATH, AAT_VERSION,
        {
          cmd: "send#{transport_id_suffix}"
        }
        ],
        { method: 'POST', 
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
          body: JSON.stringify(messages)
        });
      return messages; // XXX no point in mapping the return value
    },
                        {batch_period:CALL_BATCH_PERIOD}),

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
        waitfor(var e) {
          resume_receive = resume;
        }
        finally {
          resume_receive = undefined;
        }
      }
      if (e) throw e; // exception thrown

      return receive_q.shift();
    }),

    close: function(e) {
      if (!this.closed) {
        this.closed = true;
        if (transport_id_suffix.length) {
          spawn (function() {
            try {
              http.post([
                server, SERVER_PATH, AAT_VERSION,
                { cmd: "close#{transport_id_suffix}" } ]);
            } catch (e) { /* close is a courtesy; ignore errors */ }
          })();
        }
      }
      this.active = false;
      if (poll_stratum) poll_stratum.abort();
      if (resume_receive) {
        spawn(resume_receive(new Error("transport closed#{e ? ": " + e.message : ""}")));
      } else {
        if (e) throw e;
      }
    }
  };

  transport.__finally__ = transport.close;
  return transport;
}
exports.openTransport = openTransport;
