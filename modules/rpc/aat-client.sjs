/*
 * 'rpc/aat-client' module
 * Asymmetric AJAX Transport Client
 *
 * Version: '0.1.0-1-development'
 * http://onilabs.com
 *
 * (c) 2012-2013 Oni Labs, http://onilabs.com
 *
 * This file is licensed under the terms of the MIT License:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
/**
   @module  server/rpc/aat-client
   @summary Asymmetric AJAX Transport Client v2 for modern browsers
   @home    mho:server/rpc/aat-client
   @desc    AAT is an efficient bi-directional message exchange protocol over HTTP
*/

var http = require('sjs:http');
var url  = require('sjs:url');
var { each } = require('sjs:sequence');
var func = require('sjs:function');
var logging = require('sjs:logging');
var { TransportError } = require('./error');

var AAT_VERSION   = '2';
var SERVER_PATH   = '__aat_bridge';
var SERVER_PREFIX = '/';
exports.setServerPrefix = (s) -> SERVER_PREFIX = s;

/*

 2 messages: send, poll

  // this always returns "immediately":
 ['send_'+ID, MES*] -> ['ok',MES*] | ['error_id'] | ['error_xx']
 ['send', MES*] -> ['ok_'+ID, MES*] | ['error_xx']


 // this returns after polling interval (or earlier):
 ['poll_'+ID, MES*] -> ['ok',MES*] | ['error_id'] | ['error_xx']

 // this returns "immediately" (equivalent to 'send'):
 ['poll', MES*] -> ['ok_'+ID, MES*] | ['error_xx']

 // this returns "immediately" (reestablish connection):
 ['reconnect_'+ID] -> ['ok'] | ['ok_'+NEW_CONN_ID] | ['error_xx']
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

   @function Transport.reconnect
   @summary To be documented
*/



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
        var messages = http.request(
          [server, SERVER_PATH, AAT_VERSION,
           {
             cmd: "poll#{transport_id_suffix}"
           }
          ],
          { method: 'POST',
            headers: {'Content-Type': 'text/plain; charset=utf-8'}
          });
        messages = JSON.parse(messages);
        
        // check for error response:
        if (!messages[0] || messages[0] != 'ok') {
          throw TransportError("response is not ok: #{messages[0]}");
        }
        
        // put any messages in receive queue:
        messages.shift();

        messages .. each {
          |mes| 
          receive_q.unshift({ type: 'message', data: mes });
        }
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
    var result;
    try {
      try {
        result = http.request(url, opts);
      } catch(e) {
        throw TransportError(e.message);
      }
      
      result = JSON.parse(result);

      // check for error response:
      if (!result[0] || result[0].indexOf('ok') != 0)
        throw TransportError("response is not ok: #{result[0]}");

      if (!transport_id_suffix) {
        // we're expecting an id
        transport_id_suffix = result[0].substr(2) || default_id || "";
        if (!transport_id_suffix)
          throw TransportError("Missing transport ID");
        
        // ok, all good, we've got an id:
        this.id = transport_id_suffix.substr(1);
        
        // start our polling loop:
        poll_stratum = spawn (hold(0),poll_loop());
      }
      else if (result[0] != 'ok')
        throw TransportError("response not ok: #{result[0]}");

      // put any messages in receive queue:
      result.shift();
      result .. each {
        |mes|
        receive_q.unshift({ type: 'message', data: mes });
      }
      // prod receiver:
      if (receive_q.length && resume_receive) resume_receive();
    } catch (e) {
      this.close();
      throw e;
    }
  }


  //----

  var transport = {
    active: true,

    reconnect: function() {
      this.closed = true; // mark this transport as dead; preventing server-side cleanup
      this.__finally__();
      var t = openTransport(server);
      return [t, t._reconnect(transport_id_suffix)];
    },

    send: func.unbatched(function(messages) {
      // XXX we actually don't want to use 'unbatched' here, because
      // we don't need to map the return value. We want some async
      // equivalent to 'unbatched'
      //console.log(messages);
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
    }),

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
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
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

      return receive_q.pop();
    }),

    _reconnect: function(id_suffix) {
      if(!id_suffix) throw new Error("can't reconnect - transport ID is empty");
      sendCommand.call(this, [
        server, SERVER_PATH, AAT_VERSION, { cmd: "reconnect#{id_suffix}" }
      ], undefined, id_suffix);
      return id_suffix === transport_id_suffix;
    },

    close: function() {
      if (!this.closed) {
        this.closed = true;
        if (transport_id_suffix.length) {
          try {
            http.post([
              server, SERVER_PATH, AAT_VERSION,
              { cmd: "close#{transport_id_suffix}" } ]);
          } catch (e) { /* close is a courtesy; ignore errors */ }
        }
      }
      this.active = false;
      if (poll_stratum) poll_stratum.abort();
      if (resume_receive) spawn(resume_receive(new Error('transport closed')));
    }
  };

  transport.__finally__ = transport.close;
  return transport;
}
exports.openTransport = openTransport;
