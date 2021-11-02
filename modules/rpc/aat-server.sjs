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
   @module  rpc/aat-server
   @summary Asymmetric AJAX Transport Server
   @hostenv nodejs
   @desc    AAT is an efficient bi-directional message exchange protocol over HTTP
   @nodoc
*/

@ = require(['sjs:std']);

var logging = require('sjs:logging');
var cutil   = require('sjs:cutil');
var event   = require('sjs:event');

var { each, map, toArray } = require('sjs:sequence');
var { ownValues } = require('sjs:object');
var { startsWith } = require('sjs:string');
var { createID } = require('../server/random');
var { TransportError } = require('./error');
var { hostenv } = require('sjs:sys');
var { toBuffer } = require('sjs:bytes');

var REAP_INTERVAL = 1000*60; // 1 minute
var PING_INTERVAL = 1000*40; // 40 seconds

// maximum number of return messages to batch:
var MAX_RETURN_BATCH = 200;

__js {
  var isNodeJSBuffer;
  if (hostenv === 'nodejs') {
    isNodeJSBuffer = value -> Buffer.isBuffer(value);
  }
  else {
    isNodeJSBuffer = -> false;
  }
}

//----------------------------------------------------------------------
// default transport sink (for testing):
function defaultTransportSink(transport) {
  _task (function() {
    try {
      while (1) {
        var message = transport.receive();
        logging.info("TransportSink #{transport.id}: #{message}");
        if (message == 'time')
          transport.send(new Date());
        else if (message == 'delay') 
          _task (hold(1000),transport.send('delayed!'));
      }
    }
    catch (e) {
      logging.error("TransportSink #{transport.id}: #{e}");
    }
  })();
}

//----------------------------------------------------------------------
// Transports

// transports indexed by transport id:
var transports = {};

function createTransport(finish) {

  var send_q = [];
  var receive_q = [];
  var resume_receive;
  var reset_reaper;
  
  var resume_poll;
  var exchange_in_progress = false;

  var transport = {
    id: createID(),
    active: true,
    exchangeMessages: function(in_messages, flush) {
      // assert(this.active)

      // put new incoming messages into our receive_q:
      in_messages .. each {
        |mes|
        receive_q.unshift(mes);
      }

      if (exchange_in_progress || !flush) {
        // Reentrant call to exchangeMessages
        // we're not going to wait for outgoing messages; there is
        // already an exchange in progress that will pick those up
        if (in_messages.length && resume_receive) {
          resume_receive();
        }
        if (flush)
          flush([]);
        return;
      }

      try {
        var out_messages = [];
        try {
          exchange_in_progress = true;
          
          // now resume our receiver; this might lead to
          // re-entrant calls to send(), which is good, because then
          // we can flush out the given messages immediately
          if (in_messages.length && resume_receive) {
            resume_receive();
            if (!flush) return;
            // wait for temporally adjacent calls:
            if (send_q.length === 0)
              hold(0);
          }
          
          // construct our out_messages queue. this will either be
          // a single binary message, or an arbitrary number of textual 
          // messages (which will be encoded as JSON):
          while (send_q.length && out_messages.length < MAX_RETURN_BATCH) {
            if (isNodeJSBuffer(send_q[0])) {
              if (out_messages.length === 0)
                out_messages.push(send_q.shift());
              break;
            }
            out_messages.push(send_q.shift());
            // accumulate 'hold(0)-adjacent calls' (see also TemporalBatcher in aat-client):
            if (send_q.length === 0) {
              hold(0);
              if (send_q.length === 0)
                hold(0);
            }
          }
        }
        finally {
          // reset our reaper:
          if (reset_reaper)
            reset_reaper();

          exchange_in_progress = false;
        }

        flush(out_messages);

        // if we only sent part of the messages (because we have to
        // send binary & json messages separately), make sure we prod
        // any pending poll to pick up messages immediately:
        if (send_q.length && resume_poll) { 
          resume_poll();
        }

      } retract {
        // out_messages didn't actually make it - re-queue them
        // for the next response.
        if(out_messages.length) {
          send_q = out_messages.concat(send_q);
        }
      }
    },

    pollMessages: function(in_messages) {
      if (resume_poll) {
        logging.warn('multiple poll');
        // Can only have one active poll
        return 'poll_in_progress';
      }
      if (in_messages.length) {
        __js in_messages .. each(m -> receive_q.push(m));
        if(resume_receive) resume_receive();
      }

      if (!send_q.length) {
        waitfor {
          waitfor(var e) { resume_poll = resume; }
          finally { resume_poll = undefined; }
          if (e === false) return; // cancelled
          if (e) { throw e; } // XXX is this the right thing to do; or send error?
        }
        or {
          hold(PING_INTERVAL);
        }
        
      }
    },

    // external API:
    send: function(message) {
      if (!this.active) return; // receive() will throw, don't need to do anything here
      send_q.push(message);
      if (resume_poll && !exchange_in_progress) resume_poll();
    },

    sendData: function(header, data) {
      if (!this.active)
        throw new Error("inactive transport");
      data = data .. toBuffer();
      
      header = Buffer.from(JSON.stringify(header));
      var pre = Buffer.allocUnsafe(3);
      pre.writeUInt8(100, 0); // 100 = 'd'
      pre.writeUInt16BE(header.length, 1);
      send_q.unshift(Buffer.concat([pre, header, data]));
      if (resume_poll && !exchange_in_progress) resume_poll();
    },

    receive: function() {
      if (!this.active) throw new Error("inactive transport");
      if (!receive_q.length) {
        waitfor(var e) {
          resume_receive = resume;
        }
        finally {
          resume_receive = undefined;
        }
        if (e) throw e; // exception thrown
      }
      // assert (receive_q.length)
      return receive_q.pop();
    },
    __finally__: function() {
      delete transports[this.id];
      this.active = false;
      if (this._reaper) {
        _task this._reaper.abort();
        this._reaper = null;
      }
      if (resume_receive)
        resume_receive(TransportError('transport closed'));
      logging.info("aat transport #{this.id} closed");
    }
  };

  function reaper() {
    while (1) {
      waitfor {
        waitfor () {
          reset_reaper = resume;
        }
        finally {
          reset_reaper = undefined;
        }
      }
      or {
        hold(REAP_INTERVAL);
        break;
      } or {
        finish.wait();
        break;
      }
    }
    // ok, we've been reaped; clean up transport:
    transport.__finally__();
  }

  transport._reaper = _task reaper();

  transports[transport.id] = transport;

  return transport;
}

//----------------------------------------------------------------------
// Transport handler; main entrypoint:

/**
   @function createTransportHandler
   @summary create an AAT transport handler for use in a [server::Route].
   @param {Function} [transportSink] Function to pass  accepted [aat-client::Transport] objects to
*/
function createTransportHandler(transportSink) {
  if (!transportSink) transportSink = defaultTransportSink;
  var finish = cutil.Condition();

  function handler_func(req, matches) {
    logging.debug("AAT request", matches);

    // ok_code is just used for additional info (e.g transport ID)
    // if neither ok_code or error_code is set, the response is just "ok"
    var ok_code = null;
    var error_code = null;

    // incoming messages
    var in_messages;

    var command = req.url.params().cmd;
    
    if (command == 'send') {
      // message is arriving via a new transport -> create one:
      var transport = createTransport(finish);
      
      transportSink(transport);
      
      // XXX should parse up to a maximum size here to prevent DOS attacks
      var body = req.body('utf8') .. @join;
      in_messages = 
        (body.length ? JSON.parse(body) : []) .. 
        map(mes -> { type: 'message', data: mes}) .. toArray;

      logging.debug("messages: ", in_messages);
      
      logging.info("new transport #{transport.id}");
      ok_code = transport.id;
    }
    else if (command .. startsWith('send_')) {
      // find the transport:
      var transport = transports[command.substr(5)];
      if (!transport) {
        logging.warn("#{command}: transport not found");
        error_code = 'id';
      }
      else {
        // XXX should parse up to a maximum size here to prevent DOS attacks
        var body = req.body('utf8') .. @join;
        in_messages = 
          (body.length ? JSON.parse(body) : []) ..
          map(mes -> { type: 'message', data: mes}) .. toArray;
      }
    }
    else if (command .. startsWith('data_')) {
      // find the transport:
      var transport = transports[command.substr(5)];
      if (!transport) {
        logging.warn("#{command}: transport not found");
        error_code = 'id';
      }
      else {
        in_messages = [
          { type: 'data', 
            header: JSON.parse(req.url.params().header),
            // XXX should parse up to a maximum size here to prevent DOS attacks
            // XXX better yet, we should pass through the stream, rather than accumulate the data
            data: req.body() .. @join
          }]; 
      }
    }
    else if (command .. startsWith('poll_')) {
      // find the transport:
      var transport = transports[command.substr(5)];
      if (!transport) {
        logging.warn("#{command}: transport not found");
        error_code = 'id';
      }
      else {
        // XXX should parse up to a maximum size here to prevent DOS attacks
        var body = req.body('utf8') .. @join;
        error_code = transport.pollMessages(
          body.length ? JSON.parse(body) : []
        );
      }
    }
    else if (command .. startsWith('close_')) {
      var transport = transports[command.substr(6)];
      if (transport) transport.__finally__();
      req.response.end("");
      return;
    }
    else if (command == 'poll') {
      // XXX poll without id not supported yet
      // we expect client to always perform a 'send' first
      error_code = 'unsupported_poll';
    }
    else
      error_code = 'unknown_message';
    
    if (error_code) {
      req.response.end(JSON.stringify(["error_#{error_code}"]));
    }
    else if (ok_code) {
      req.response.end(JSON.stringify(["ok_#{ok_code}"]));
      transport.exchangeMessages(in_messages || []);
    }
    else {
      transport.exchangeMessages(in_messages || []) {
        |out_messages|
        if (out_messages.length === 1 &&
            isNodeJSBuffer(out_messages[0])) {
          // send as binary
          req.response.end(out_messages[0]);
        }
        else {
          // send as json
          out_messages = out_messages.slice();
          out_messages.unshift("ok");
          req.response.end(JSON.stringify(out_messages));
        }
      }
    }
  }

  return {
    "GET": handler_func,
    "POST": handler_func,
    __finally__: -> finish.set(),
  }
}
exports.createTransportHandler = createTransportHandler;

