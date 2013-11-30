/*
 * 'rpc/bridge' module
 * API bridge
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
  @module  server/rpc/bridge
  @summary API bridge: High-level API remoting
  @desc
    The RPC bridge is used for bidirectional communication between client
    and server. It can serialize (send / receive) the following types:

    Primitive types

     - String
     - Number
     - Null
     - Date

    Complex types:

     - Array (containing serializable types)
     - Object
       - only "own" properties are serialized (no inherited properties)
       - the prototype chain is *not* preserved
     - Function
     - Error
     - [sjs:sequence::Stream]
     - All [../observable::] types
     - [::API]

    ### Wrapped functions

    Functions wrapped by the bridge are wrapped into function proxies on the receiving end.
    When invoked, all arguments are serialized and sent over the bridge to the
    original function. After executing the function (where it was originally defined),
    the return value is sent across the bridge and returned to the caller as if it
    were a regular (suspending) function call.
    
    This means that all argument and return values for functions exposed over a
    bridge must themselves be serializable.

    ### Custom types:

    For custom object types where the default `Object` serialization does
    not suffice, you can implement custom serialization using [::setMarshallingDescriptor].
*/


/*
Protocol:

  ['call', call#, API, METHOD, [ARG1, ARG2, ARG3, ...]]

  ['return', call#, RV ]

  ['return_exception', call#, RV]

  ['abort', call# ]


  Marshalling: values are being serialized as JSON
  special objects get an __oni_type attribute

*/

var logging = require('sjs:logging');
var { each, toArray, map, filter, transform, isStream, Stream, at, Observable } = require('sjs:sequence');
var { hostenv } = require('sjs:sys');
var { pairsToObject, ownPropertyPairs, ownValues, merge } = require('sjs:object');
var { isArrayLike } = require('sjs:array');
var { isString } = require('sjs:string');
var { isFunction, exclusive } = require('sjs:function');
var { Emitter } = require('sjs:events');
var { keys, propertyPairs } = require('sjs:object');


/**
  @function isTransportError
  @param {Error} [err]
  @return Boolean
  @summary Returns whether `err` is a [::TransportError]
*/
var { isTransportError, TransportError } = require('./error');

/**
  @class TransportError
  @summary The error type raised by connection errors in a [::BridgeConnection]
*/
exports.isTransportError = isTransportError;

//----------------------------------------------------------------------
// marshalling

/**
  @function setMarshallingDescriptor
  @summary set the marshalling descriptor for a given object / prototype
  @param {Object} [obj] object or prototype
  @param {Function} [desc] marshalling descriptor
  @desc

    Typically `obj` will be an object prototype, so that all objects
    inheriting from it will be serialized consistently. But
    `setMarshallingDescriptor` can also be used on individual objects.

    If called on an object prototype, all objects inherited from that
    prototype will use this marshalling descriptor.

    `descr` must be an object with the following properties:

     - wrapLocal: A method accepting a single `localObject` argument,
       and returning a serializable object. This return value can
       be any serializable object, including nested properties,
       functions and any other types that are supported by bridge.

     - wrapRemote: An array of `[modulename, functionName]`. After
       the serialized object is sent over the bridge, the named function
       will be called (on the receiver) with this sertialized object
       as an argument. This function should return some object that
       will act as a proxy for the original remote object.

*/
function setMarshallingDescriptor(obj, descr) {
  obj.__oni_marshalling_descriptor = descr;
  return obj;
}
exports.setMarshallingDescriptor = setMarshallingDescriptor;

/**
   @class API
   @summary Remotable
   @desc
    The API class is a (transparent) wrapper around a module's exports,
    for the purpose of remoting.

    It is used internally by conductance to provide remote API
    access (see [#features/api-module::]).

   @function API
   @summary Wrap an object into a remotable API
   @param {Object} [obj] 
   @return {Object} 
*/

var api_counter = 1;
function API(obj, isBaseAPI) {
  return { __oni_type: 'api', 
           id : isBaseAPI ? 0 : api_counter++,
           obj:obj 
         };
}  
exports.API = API;

/**
   @function Blob
   @summary Mark an object as binary data
   @param {Object} [obj] Binary object (e.g. Blob or Buffer)
   @return {Object}
*/
function Blob(obj) {
  return { __oni_type: 'blob',
           obj: obj
         };
}
exports.Blob = Blob;


var isNodeJSBuffer;
if (hostenv === 'nodejs')
  isNodeJSBuffer = value -> Buffer.isBuffer(value);
else
  isNodeJSBuffer = -> false;

function marshall(value, connection) {

  // XXX we can't use JSON.stringify(., replacer), because certain
  // values (such as Dates) will have been converted to strings by the
  // time the replacer sees them *sigh*
  // Instead we prepare a 'stringifyable object first:
 
  var stringifyable = {};

  function prepare(value) {
    if (typeof value === 'function') {
      if (isStream(value)) {
        // XXX we want to batch up streams
        value = { __oni_type: 'stream', id: connection.publishFunction(value) }
      }
      else {
        // a normal function
        // XXX we'll be calling the function with the wrong 'this' object
        value = { __oni_type: 'func', id: connection.publishFunction(value) };
      }
    }
    else if (value instanceof Date) {
      value = { __oni_type: 'date', val: value.getTime() };
    }
    else if (isArrayLike(value)) {
      value = value .. map(prepare);
    }
    else if (typeof value === 'object' && value !== null) {
      var descriptor;
      if ((descriptor = value.__oni_marshalling_descriptor) !== undefined) {
        value = prepare(descriptor.wrapLocal(value));
        value = { __oni_type: 'custom_marshalled', proxy: value, wrap: descriptor.wrapRemote };
      }
      else if (value instanceof Error || value._oniE) {
        value = { __oni_type: 'error', message: value.message, stack: value.__oni_stack };
      }
      else if (value.__oni_type == 'api') {
        // publish on the connection:
        connection.publishAPI(value);
        // serialize as "{ __oni_type:'api', methods: ['m1', 'm2', ...] }"
        var methods = keys(value.obj) .. 
          filter(name -> typeof value.obj[name] === 'function') ..
          toArray;
        value = { __oni_type:'api', id: value.id, methods: methods};
      }
      else if (value.__oni_type == 'blob') {
        // send the blob as 'data'
        var id = ++connection.sent_blob_counter;
        connection.sendBlob(id, value.obj);
        value = { __oni_type: 'blob', id:id };
      }
      else if (isNodeJSBuffer(value)) {
        //XXX
        throw new Error("Cannot serialize nodejs buffers across the bridge yet");
      }
      else {
        // a normal object -> traverse it
        value = propertyPairs(value) ..
          filter([name,_] -> name != 'toString') ..
          transform([name, val] -> [name, prepare(val)]) ..
          pairsToObject;
      }
    }
    return value;
  }

  var rv = value .. prepare .. JSON.stringify;
  //console.log(require('sjs:debug').inspect(rv));
  return rv;
}

function unmarshall(str, connection) {
  var obj = JSON.parse(str);
  // unmarshall special types:
  return unmarshallComplexTypes(obj, connection);
}

function unmarshallComplexTypes(obj, connection) {
  if (typeof obj != 'object' || obj === null) return obj;
  if (obj.__oni_type == 'func') {
    return unmarshallFunction(obj, connection);
  }
  else if (obj.__oni_type == 'stream') {
    return unmarshallStream(obj, connection);
  }
  else if (obj.__oni_type == 'api') {
    return unmarshallAPI(obj, connection);
  }
  else if (obj.__oni_type == 'blob') {
    return unmarshallBlob(obj, connection);
  }
  else if (obj.__oni_type == 'date') {
    return new Date(obj.val);
  }
  else if (obj.__oni_type == 'error') {
    return unmarshallError(obj, connection);
  }
  else if (obj.__oni_type == 'custom_marshalled') {
    return require(obj.wrap[0])[obj.wrap[1]](unmarshallComplexTypes(obj.proxy, connection));
  }
  else {
    keys(obj) .. each {
      |key|
      obj[key] = unmarshallComplexTypes(obj[key], connection);
    }
    return obj;
  }
}

function unmarshallBlob(obj, connection) {
  var id = obj.id;
  var blob;
  if (!id || (blob = connection.received_blobs[id]) === undefined) 
    throw new Error("Cannot find blob #{id}");
  delete connection.received_blobs[id];
  return blob;
}

function unmarshallError(props, connection) {
  var err = new Error(props.message);
  err.__oni_stack = props.stack;
  return err;
}

function unmarshallAPI(obj, connection) {
  // make a proxy for the api:
  var proxy = { };

  obj.methods .. each {
    |m| 
    proxy[m] = function() { 
//      console.log("making call to #{obj.id}:#{m}"); 
      return connection.makeCall(obj.id, m, arguments);
    };
  }
  return proxy;
}

function unmarshallFunction(obj, connection) {
  // make a proxy for the function:
  return function() {
    return connection.makeCall(-1, obj.id, arguments);
  };
}

function unmarshallStream(obj, connection) {
  // Blocklambda return/break don't work across spawn boundaries
  // (yet), but many stream primitives (such as `first`) depend on
  // them. 
  // To fix this, we introduce an intermediate `getter` function:

  return Stream(
    function(receiver) {
      var have_val, want_val;
      function getter(x) {
        waitfor {
          waitfor() { want_val = resume; }
        }
        and {
          have_val(x);
        }
      }

      waitfor {
        while (1) {
          waitfor(var val) { have_val = resume }
          receiver(val);
          want_val();
        }
      }
      or {
        connection.makeCall(-1, obj.id, [getter]);
      }
    });
}


//----------------------------------------------------------------------

/**
  @class BridgeConnection
  @summary A connection to a remote conductance API
  @desc
    The bridge connection handles all serializing and deserializing of
    data types and function calls across an RPC transport.

    `BridgeConnection` instances cannot be constructed directly, see [::connect] or
    [#features/api-modules::].

    Depeding on the `disconnectHandler` function supplied, a `BridgeConnection`
    object may be able to reconnect and recover from small network outages.

    If this happens, calls made and values returned during the outage will be
    sent once connectivity is restored. If connectivity cannot be restored,
    [::BridgeConnection::sessionLost] wil be emitted, and any outstanding or
    new RPC calls made on the bridge will rase a [::TransportError].

  @variable BridgeConnection.status
  @type sjs:sequence:Observable::
  @summary The current connection status
  @desc
    `status` is an [sjs:sequence::Observable] object with the following properties:

      - connected (boolean): Whether the connection is active
      - connecting (boolean): Whether this connection is currently
        attempting to reconnect

    The disconnect handler may additionally set properties on this object, for
    example an [::AutoReconnect] handler will set the `nextAttempt`
    property.

    **Note:** If `opts.status` is not `true`, this property will not be set or updated.

  @function BridgeConnection.reconnect
  @summary Attempt to reconnect
  @return {Boolean} whether the attempt succeeded

  @variable BridgeConnection.disconnected
  @type sjs:events::Emitter
  @summary Disconnect event

  @variable BridgeConnection.reconnected
  @type sjs:events::Emitter
  @summary Successful reconnect event

  @variable BridgeConnection.sessionLost
  @type sjs:events::Emitter
  @summary Reconnection failed

  @function BridgeConnection.__finally__
  @summary Terminate and clean up this connection
*/
function BridgeConnection(transport, opts) {
  var pending_calls  = {}; // calls in progress, made to the other side
  var executing_calls = {}; // calls in progress, made to our side; call_no -> stratum
  var call_counter   = 0;
  var published_apis = {};
  var published_funcs = {};
  var published_func_counter = 0;
  var closed = false;
  var throwing = opts.throwing !== false;
  var statusObs = opts.status ? Observable({connected: true});
  var _lastTransport = transport;
  var disconnectHandler = opts.disconnectHandler;

  var disconnected = Emitter(); // emitted once a dropout is detected
  var sessionLost = Emitter(); // session has been lost (may be dead, or reconnected with a different session)
  var reconnected = Emitter(); // emitted when establishing a new session after a dropout

  if (opts.publish)
    published_apis[0] = opts.publish;

  var setStatusProp = function(key, val) {
    if(!statusObs) return;
    var s = statusObs.get() || {};
    s[key] = val;
    statusObs.set(s);
  }

  var transportRetry = function(block) {
    var count=0;
    while(count++<3) {
      if (!transport) {
        // transport is known to be down - just wait for it to come back
        reconnected.wait();
      }
      try {
        return block(transport);
      } catch(e) {
        if (!isTransportError(e)) throw e;
        attemptReconnect();
        continue;
      }
    }
  }

  // attempt reconnect (or wait for an existing attempt to complete).
  // returns on success, throws on failure
  var attemptReconnect = exclusive(function (err) {
    disconnected.emit();
    try {
      if(transport) {
        _lastTransport = transport;
        transport = null;
      }

      if(closed) return;
      logging.debug("rpc/bridge: connection lost,", disconnectHandler ? "attempting reconnect" : "no disconnectHandler");
      err = err || TransportError("transport disconnected");
      if (!disconnectHandler) throw err;
      setStatusProp('connected', false);
      setStatusProp('connecting', false);

      var finish = function(err) {
        logging.debug("rpc/bridge: reconnect #{err ? "failed" : "succeeded"}");
        _lastTransport.__finally__();
        if (err) {
          connection.__finally__();
          sessionLost.emit(err);
          throw err;
        }
      }

      try {
        disconnectHandler(connection, err, statusObs);
        if(!transport) throw new Error("Failed to automatically reconnect bridge");
      } catch(e) {
        finish(e);
      } retract {
        finish(err);
      }
      finish();
    } finally {
      if (_lastTransport) _lastTransport.__finally__();
    }
  }, true);

  var connection = {
    sent_blob_counter: 0, // counter for identifying data blobs (see marshalling above)
    received_blobs: {},
    disconnected: disconnected,
    reconnected: reconnected,
    sessionLost: sessionLost,
    status: statusObs,
    sendBlob: function(id, obj) {
      return transportRetry(function(t) {
        t.sendData(id, obj);
        return id;
      });
    },
    reconnect: exclusive(function(f) {
      // reconnects to the server, returning bool (true = success)
      // On success, `transport` will be set
      // to the connected transport
      var t;
      if (!_lastTransport.reconnect) throw new Error("transport does not support reconnections");
      logging.debug("rpc/bridge: reconnecting ...");
      setStatusProp('connecting', true);
      var sameSession;
      try {
        [t, sameSession] = _lastTransport.reconnect();
      } catch(e) {
        logging.debug("rpc/bridge: transport.reconnect() failed");
        return false;
      } finally {
        setStatusProp('connecting', false);
      }
      transport = t;
      setStatusProp('connected', true);
      reconnected.emit();
      if (!sameSession) {
        logging.warn("session lost");
        // if getAPI fails, we kill the connection because the server no longer
        // provides this API ID (it was probably restarted)
        getAPI();
        sessionLost.emit();
      }
      return true;
    }, true),
    makeCall: function(api, method, args) {
      var call_no = ++call_counter;
      waitfor {
        waitfor {
          // initiate waiting for return value:
          waitfor (var rv, isException) {
            //logging.debug("awaiting result for call #{call_no} (#{method})");
            pending_calls[call_no] = resume;
          }
          retract {
            //logging.debug("call #{call_no} (#{method}) retracted");
            if(transport) spawn (function() { 
              try {
                transport.send(marshall(['abort', call_no], connection));
              }
              catch(e) { /* ignore; transport is dead */ }
            })();
          }
          finally {
            //logging.debug("deleting call responder #{call_no} (#{method})");
            delete pending_calls[call_no];
          }
          //logging.debug("got result for call #{call_no} - #{rv}");
        }
        and {
          // make the call.
          var args = marshall(['call', call_no, api, method, toArray(args)], connection);
          transportRetry(t -> t.send(args));
        }
      } or {
        var err = sessionLost.wait();
        this.__finally__(); // XXX this should be a recoverable error, but we kill the connection
                            // for now as a workaround for mechanisms that drop unhandled errors
        throw err || TransportError("session lost");
      }
      
      if (isException) throw rv;
      return rv;
    },
    publishAPI: function(api) {
      if (published_apis[api.id]) return; // already published
      published_apis[api.id] = api.obj;
    },
    publishFunction: function(f) {
      var id = ++published_func_counter;
      published_funcs[id] = f;
      return id;
    },
    __finally__: function() {
      closed = true;
      spawn(this.stratum.abort());
      if (transport) {
        transport.__finally__();
        transport = null;
      }
    },
  };

  function receiver() {
    while (1) {
      waitfor {
        try {
          var packet = transport.receive();
        } catch(e) {
          if(closed || !throwing) break;
          logging.debug("transport error in receive(): #{e}");
          attemptReconnect(TransportError(e.message || String(e)));
          continue; // above code will throw() if it can't reconnect
        }
        logging.debug("received packet", packet);
        if (packet.type == 'message')
          receiveMessage(packet);
        else if (packet.type == 'data')
          receiveData(packet);
        else {
          logging.warn("Unknown packet '#{packet.type}' received");
        }
      } or {
        // restart the loop when reconnected (no point in
        // listening to a stale transport
        reconnected.wait();
      }
    }
  }

  function receiveData(packet) {
    connection.received_blobs[packet.header] = packet.data;
  }

  function receiveMessage(packet) {
    var message = unmarshall(packet.data, connection);
//    console.log(message);
    switch (message[0]) {
    case 'return':
      var cb = pending_calls[message[1]];
      if (cb)
        cb(message[2], false);
      break;
    case 'return_exception':
      var cb = pending_calls[message[1]];
      if (cb)
        cb(message[2], true);
      break;
    case 'call':
      if (executing_calls[message[1]]) break; // duplicate call
      executing_calls[message[1]] = spawn (function(call_no, api_id, method, args) {
        // xxx asynchronize, so that executing_calls[call_no] will be filled in:
        hold(0);
        var isException = false;
        waitfor {
          try {
            var rv;
            if (api_id == -1)
              rv = published_funcs[method].apply(null, args);
            else
              rv = published_apis[api_id][method].apply(published_apis[api_id], args);
          }
          catch (e) {
            rv = e;
            isException = true;
          }

          var args = marshall(["return#{isException? '_exception':''}", call_no, rv], connection);
          try {
            transportRetry(t -> t.send(args));
          }
          catch (e) {
            // ignore - we already tried to reconnect in `transportRetry`
            logging.debug("transport closed");
          }
        } or {
          sessionLost.wait();
        }
        finally {
          delete executing_calls[call_no];
        }
      })(message[1], message[2], message[3], message[4]);
      break;
    case 'abort':
      var executing_call = executing_calls[message[1]];
      if (executing_call) {
//        console.log("ABORTING PENDING CALL");
        executing_call.abort();
      }
      break;
    }
  }

  // XXX we want the api_name to be relative to the current app's base; not
  // sure how that's going to work from the server-side (sys:resolve??)
  var getAPI = -> connection.makeCall(0, 'getAPI', [opts.api]);
  
  connection.stratum = spawn receiver();
  if (opts.api)
    connection.api = getAPI();
  return connection;
}

/**
  @function connect
  @summary Connect to a remote API
  @param {String} [api_name] API id
  @param {Settings} [settings]
  @param {optional Function} [block]
  @setting {String} [server] Server address
  @setting {Transport} [transport] An existing transport to use
  @setting {Function} [disconnectHandler] Disconnect handler, e.g produced by [::AutoReconnect]
  @setting {Boolean} [status] Maintain an observable `connection.status` property
  @return {::BridgeConnection} if block is not given
  @desc
    If `block` is given, it will be called with a single [::BridgeConnection]
    argument. This block will be retracted automatically when the connection
    throws an exception (e.g the connection is disconnected and cannot reconnect).

    When the block finishes execution (either normally or via an exception), the
    connection object will be closed automatically.

    It is recommended to pass a `block` argument, rather than relying on
    `connect` to return the connection, since using a return value means that
    you will need to monitor the connection's [::BridgeConnection::sessionLost]
    event yourself and:

     - close the connection (using [::BridgeConnection::__finally__] or a
       [sjs:#language/syntax::using] block)
     - abort any code that relies upon the (now dead) connection.

    ### disconnectHandler

    The disconnectHandler option is an optional function which will be invoked
    when the connection to the server encounters an error (e.g the client or
    server goes offline).

    When a connection error occurs, `disconnectHandler` will be called with
    the following arguments:

     - connection (the [::BridgeConnection])
     - error (the error that caused the disconnection)
     - status (the [::BridgeConnection::status] object)

    This function typically makes multiple attempts to call
    `connection.reconnect()`, waiting some time between attempts.
    Once `connection.reconnect()` succeeds, this function should return.

    To "give up", this function can simply return without successfully
    reconenecting.

    Disconnect handlers produced by [::AutoReconnect] attempt to
    reconnect with progressively longer pauses between attempts, and
    a configurable time after which they will give up entirely.
*/
exports.connect = function(api_name, opts, block) {
  var transport = opts.transport;
  if (!transport) {
    transport = require('./aat-client').openTransport(opts.server);
  }
  var connection = BridgeConnection(transport, opts .. merge({throwing:true, api:api_name}));

  if (block) {
    using(connection) {
      waitfor {
        try {
          connection.stratum.waitforValue();
        } catch(e) {
          logging.warn("Bridge connection lost: #{e}");
          throw new Error("Bridge connection lost");
        }
      } or {
        return block(connection);
      }
    }
  }
  else return connection;
}

/**
  @function accept
  @param {Function} [getAPI]
  @param {Transport} [transport]
  @return {::BridgeConnection}
*/
exports.accept = function(getAPI, transport) {
  var connection = BridgeConnection(transport, {publish: {getAPI:getAPI}, throwing:false});
  return connection;
};

/**
  @function AutoReconnect
  @summary Create a custom disconnect handler for a bridge connection
  @param {Settings} [opts]
  @setting {Number} [initialDelay=1] Initial delay time (in seconds)
  @setting {Number} [backoff=1.5] Amount to multiply the delay by between successive failed connection attempts.
  @setting {Number} [timeout=30] Time (in seconds) after which to give up. Pass `null` for inifinite retry.
  @return {Function}
  @desc
    The returned disconnect handler is intended to be used for a
    [::BridgeConnection]'s `disconnectHandler` setting.

    The function will wait for `initialDelay` seconds before
    attempting to reconnect. After each failed reconnect attempt,
    the current delay will be multiplied by `backoff` (so backoff
    should be greater than 1).

    After `timeout` seconds have passed, the handler will give up.

    If the connection has a [::BridgeConnection::status], it will be updated with
    the `nextAttempt` property set to the Date object when the next
    connection attempt will be made. This property will be deleted
    when no further attempts are planned.
*/

exports.AutoReconnect = function(opts) {
  opts = opts || {};
  var backoff = opts.backoff || 1.5;
  var timeout;
  if(opts.timeout !== null)
    timeout = (opts.timeout || 30) * 1000;
  return function(connection, err, status) {
    logging.debug("AutoReconnect start");
    var waitTime = (opts.initialDelay || 1) * 1000;
    waitfor {
      while(1) {
        if(status) {
          var now = new Date();
          var s = status.get() || {};
          s.nextAttempt=new Date(now.getTime() + waitTime);
          status.set(s);
        }

        hold(waitTime);
        waitTime = waitTime * backoff;
        logging.debug("AutoReconnect: attempting reconnect");
        if (connection.reconnect()) return;
      }
    } or {
      hold(timeout);
      logging.debug("AutoReconnect timed out");
    } finally {
      if(status) {
        var s = status.get() || {};
        delete s.nextAttempt;
        status.set(s);
      }
    }
  };
}
