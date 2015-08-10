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
  @module  server/rpc/bridge
  @summary API bridge: High-level API remoting
  @require ./aat-client
  @desc
    The RPC bridge is used for bidirectional communication between client
    and server.
    
    It can serialize (send / receive) the following types:

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
     - All [sjs:observable::] types
     - [::API]

    ### Wrapped functions

    Functions wrapped by the bridge are wrapped into function proxies on the receiving end.
    When invoked, all arguments are serialized and sent over the bridge to the
    original function. After executing the function (where it was originally defined),
    the return value is sent across the bridge and returned to the caller as if it
    were a regular (suspending) function call.
    
    This means that all argument and return values for functions exposed over a
    bridge must themselves be serializable.

    ### Signalled calls

    When the caller of a function across the bridge is not interested in the return 
    value of the call (and doesn't want to block until the call has been acknowledged 
    by the other end), then network traffic can be conserved by making a 'signalled call' using
    the [sjs:function::signal] function: `foo .. @fn.signal(null, [x,y,z])` instead of `foo(x,y,z)` or 
    `spawn foo(x,y,z)`. The latter calls both cause the other end of the bridge connection to send
    out a return value when the call has finished there, whereas the signalled call does not.
    


    ### Custom types:

    For custom object types where the default `Object` serialization does
    not suffice, you can implement custom serialization using [::setMarshallingDescriptor].

    ### Limitations

     - `this` value in serialized functions

       Due to javascript semantics, the `this` value for serialized functions will
       rarely be useful. If you need to use `this` inside a function that is exposed
       via the bridge, you can use `Function.prototype.bind` to bind `this` ahead of
       time.

     - mutable object properties

       While object properties are serialized, modifications to object properties
       (on either side of the bridge) do not cause the same change to occur on
       remote versions of that object. If you have an object with properties that
       may change, you should expose them as methods (i.e `getFoo()` and `setFoo(newVal)`).

    ### Ordering guarantees

    The bridge module guarantees that calls/returns/exceptions are
    made on the receiver in the order that they are made on the
    sender. In particular, if the sender initiates two calls
    `receiver.foo()` and `receiver.bar()`, where `bar` is initiated
    after `foo` is initiated, e.g.:

        waitfor {
          receiver.foo();
        }
        and {
          receiver.bar();
        }


    then the calls will be initiated on the receiver in this order.


*/


/*
Protocol:

  ['call', call#, API, METHOD, [ARG1, ARG2, ARG3, ...]]

  ['return', call#, RV ]

  ['return_exception', call#, RV]

  ['abort', call# ]

  ['signal', API, METHOD, [ARG1, ARG2, ARG3, ...]]


  Marshalling: values are being serialized as JSON
  special objects get an __oni_type attribute

*/

var logging = require('sjs:logging');
var { each, toArray, map, filter, find, join, transform, isStream, isBatchedStream, BatchedStream, Stream, at, any } = require('sjs:sequence');
var { hostenv } = require('sjs:sys');
var { pairsToObject, allKeys, ownKeys, get, ownPropertyPairs, ownValues, merge, hasOwn } = require('sjs:object');
var { isArrayLike } = require('sjs:array');
var { isString, startsWith, contains } = require('sjs:string');
var { identity, isFunction, ITF_SIGNAL, signal } = require('sjs:function');
var { Emitter, wait } = require('sjs:event');
var { Quasi, isQuasi } = require('sjs:quasi');
var { eq } = require('sjs:compare');
var bytes = require('sjs:bytes');
var http = require('sjs:http');
var Url = require('sjs:url');
var global = require('sjs:sys').getGlobal();
var apiRegistry, weak;
if (hostenv !== 'xbrowser') {
  apiRegistry = require('../server/api-registry')
  try {
    weak = require('nodejs:weak');
  } catch(e) {
    // ignore missing `weak` module
  }
  function unpublishFunction(id, conn) {
    return function(obj) {
      conn.del('function', id);
    };
  };
}

//----------------------------------------------------------------------
// maximum number of messages we will buffer when packets from our
// transport arrive out of order:
var MAX_MSG_REORDER_BUFFER = 10000;


//----------------------------------------------------------------------

/**
  @function isTransportError
  @param {Error} [err]
  @return {Boolean}
  @summary Returns whether `err` is a [::TransportError]
*/
var { isTransportError, TransportError } = require('./error');

/**
  @class TransportError
  @summary The error type raised by connection errors in a [::BridgeConnection]
*/
exports.isTransportError = isTransportError;

exports.TransportError = TransportError;

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

    If you only wish to control which properties of an object are
    marshalled, see [::setMarshallingProperties].

    `descr` must be an object with the following properties:

     - wrapLocal: A method accepting a single `localObject` argument,
       and returning a serializable object. This return value can
       be any serializable object, including nested properties,
       functions and any other types that are supported by bridge.

     - wrapRemote: An array of `[module, functionName]`. After
       the serialized object is sent over the bridge, the named function
       will be called (on the receiver) with this serialized object
       as an argument. This function should return some object that
       will act as a proxy for the original remote object.

       For security, the allowed values for `wrapRemote` are narrow.
       When `setMarshallingDescriptor` is called on the client, `module` must
       be an `.api` module object obtained from the server. When called on the
       server, `module` should be a string, however only module & function
       name pairs which are explicitly listed in the `localWrappers` setting of
       the connection will actually be allowed.
*/
function setMarshallingDescriptor(obj, descr) {
  var wrapRemote = descr.wrapRemote;
  var [remoteMod, remoteKey] = wrapRemote;
  // turn an api object into a serializable reference
  if (remoteMod.__oni_apiid !== undefined) {
    descr = descr .. merge({
      wrapRemote: [{__oni_apiid: remoteMod.__oni_apiid}, remoteKey],
    });
  }
  obj.__oni_marshalling_descriptor = descr;
  return obj;
}
exports.setMarshallingDescriptor = setMarshallingDescriptor;

var defaultMarshallers = [];

exports.defaultMarshallers = defaultMarshallers;


/**
  @function setMarshallingProperties
  @summary control which properties are marshalled for an object
  @param {Object} [obj] object or prototype
  @param {Array} [props] list of (String) property names
  @desc
    When called on a plain object, the properties which will be marshalled
    are limited to `props`, rather than sending all properties defined on the object.

    For special objects which don't marshall properties by default (e.g
    `Function` or `Error` instances), the properties listed will be
    marshalled this in addition to the object's standard marshalling behaviour.
    Note that this is in addition to the default marshalling behaviour, i.e.
    the stack trace and `message` property will still be marshalled for an `Error`
    instance even when they aren't listed in `props`.

    For more control over how an object is marshalled, see [::setMarshallingDescriptor].
*/
exports.setMarshallingProperties = function (obj, props) {
  obj.__oni_marshalling_properties = props;
  return obj;
};

/**
   @class API
   @summary Remotable
   @desc
    The API class is a (transparent) wrapper around a module's exports,
    for the purpose of remoting.

    It is used internally by conductance to provide remote API
    access (see [#features/api-file::]).

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


__js {
  var coerceBinary, isNodeJSBuffer, nodejs = hostenv === 'nodejs';
  var toIterableBytes = identity;
  var isBytes = bytes.isBytes;
  if (nodejs) {
    isNodeJSBuffer = value -> Buffer.isBuffer(value);
    coerceBinary = function(b, t) {
      switch(t) {
        case 'b': return b .. bytes.toBuffer();
        case 'a': return b .. bytes.toUint8Array();
        default: throw new Error("Unknown binary type #{t}");
      }
    };
    // nodejs can't send an ArrayBuffer as a request body
    toIterableBytes = b -> b instanceof ArrayBuffer ? b .. bytes.toUint8Array : b;
  } else {
    isNodeJSBuffer = -> false;
    // browser can only represent binary data as TypedArray
    coerceBinary = identity;
    if(typeof(Blob) !== 'undefined') {
      // treat browser `Blob` as bytes
      isBytes = (b) -> bytes.isBytes(b) || b instanceof Blob;
    }
  }
}


function marshall(value, connection) {
  try {

    // XXX we can't use JSON.stringify(., replacer), because certain
    // values (such as Dates) will have been converted to strings by the
    // time the replacer sees them *sigh*
    // Instead we prepare a 'stringifyable object first:
  
    var stringifyable = {};

    function processProperties(value, root) {
      var k;
      if(value.__oni_marshalling_properties)
        k = value.__oni_marshalling_properties.concat('__oni_marshalling_properties');
      else
        k = allKeys(value) .. filter(name ->
          root[name] !== value[name] && (
            name === '__oni_apiid' || (
              name !== 'toString' && 
              !name.. startsWith('__oni') &&
              name !== ITF_SIGNAL  
            )
          )
        );
      return k .. transform(name -> [name, prepare(value[name])]);
    }

    function withProperties(dest, value, root) {
      var props = dest.props = {};
      processProperties(value, root) .. each {|[name, val]|
        props[name] = val;
      }
      return dest;
    }

    function withExplicitProperties(rv, value) {
      if(value.__oni_marshalling_properties) {
        rv = rv .. withProperties(value);
      }
      return rv;
    };

    function prepare(value) {
      var rv = value;
      if (typeof value === 'function') {
        if (isStream(value)) {
          rv = { __oni_type: 'stream', id: connection.publishFunction(value) };
          if (isBatchedStream(value))
            rv.batched = true;
        }
        else {
          // a normal function
          // XXX we'll be calling the function with the wrong 'this' object
          rv = { __oni_type: 'func', id: connection.publishFunction(value) } .. withExplicitProperties(value);
        }
        rv = rv .. withProperties(value, Function.prototype);
      }
      else if (value instanceof Date) {
        rv = { __oni_type: 'date', val: value.getTime() };
      }
      else if (isBytes(value)) {
        // NOTE: this must go before `isArrayLike`, since a Uint8Array is both
        var id = ++connection.sent_blob_counter;
        connection.sendBlob(id, value);
        rv = { __oni_type: 'blob', id:id };
      }
      else if (isArrayLike(value)) {
        rv = value .. map(prepare);
      }
      else if (isQuasi(value)) {
        rv = {__oni_type: 'quasi', val: prepare(value.parts) };
      }
      else if (typeof value === 'object' && value !== null) {
        var descriptor;
        if ((descriptor = value.__oni_marshalling_descriptor) !== undefined) {
          rv = prepare(descriptor.wrapLocal(value));
          rv = { __oni_type: 'custom_marshalled', proxy: rv, wrap: descriptor.wrapRemote };
        }
        else if (value instanceof Error || value._oniE) {
          rv = { __oni_type: 'error', message: value.message, stack: value.__oni_stack } .. withExplicitProperties(value);
          // many error APIs provide errno / code to distinguish error types, so include
          // those if present
          ['errno','code'] .. each {|k|
            if(value[k] === undefined) continue;
            if(!rv.props) rv.props = {};
            rv.props[k] = value[k];
          };
        }
        else if (value.__oni_type == 'api') {
          // publish on the connection:
          connection.publishAPI(value);
          // serialize as "{ __oni_type:'api', methods: ['m1', 'm2', ...] }"
          var methods = allKeys(value.obj) .. 
            filter(name -> typeof value.obj[name] === 'function') ..
            toArray;
          rv = { __oni_type:'api', id: value.id, methods: methods};
        }
        else {
          // a normal object -> traverse it
          rv = processProperties(value, Object.prototype) .. pairsToObject;
        }
      }
      else if (typeof value === 'undefined') {
        // We need to treat 'undefined' specially, because JSON doesn't
        // allow it, and worse: 
        // JSON.stringify([undefined]) yields "[null]"!!
        rv = { __oni_type:'undef' };
      }
      return rv;
    }

    var rv = value .. prepare;
    return rv;
  } catch(e) {
    e.message = "Error marshalling value: #{e.message || ""}";
    throw e;
  }
}

function unmarshall(message, connection) {
  try {
    // unmarshall special types:
    return unmarshallComplexTypes(message, connection);
  } catch(e) {
    return ['unserializable', message, e];
  }
}

function unmarshallComplexTypes(obj, connection) {
  if (typeof obj != 'object' || obj === null) return obj;
  var rv;
  if (obj.__oni_type == 'func') {
    rv = unmarshallFunction(obj, connection);
  }
  else if (obj.__oni_type == 'stream') {
    rv = unmarshallStream(obj, connection);
  }
  else if (obj.__oni_type == 'api') {
    rv = unmarshallAPI(obj, connection);
  }
  else if (obj.__oni_type == 'blob') {
    rv = unmarshallBlob(obj, connection);
  }
  else if (obj.__oni_type == 'date') {
    rv = new Date(obj.val);
  }
  else if (obj.__oni_type == 'quasi') {
    rv = Quasi(obj.val);
  }
  else if (obj.__oni_type == 'error') {
    rv = unmarshallError(obj, connection);
  }
  else if (obj.__oni_type == 'custom_marshalled') {
    var mod;
    var apiid = obj.wrap[0].__oni_apiid;
    if(apiid !== undefined) {
      mod = apiRegistry.getAPIbyAPIID(apiid);
    } else {
      if (connection.localWrappers &&
          connection.localWrappers .. find(w -> w .. eq(obj.wrap), false)
      ) {
        mod = require(obj.wrap[0]);
      } else {
        throw new Error("Unsupported marshalling descriptor: #{obj.wrap}");
      }
    }
    rv = mod[obj.wrap[1]](unmarshallComplexTypes(obj.proxy, connection));
  }
  else if (obj.__oni_type === 'undef') {
    rv = undefined;
  }
  else {
    ownKeys(obj) .. each {
      |key|
      obj[key] = unmarshallComplexTypes(obj[key], connection);
    }
    return obj;
  }
  if (obj .. hasOwn('props')) {
    ownKeys(obj.props) .. each {
      |key|
      rv[key] = unmarshallComplexTypes(obj.props[key], connection);
    }
  }
  return rv;
}

function unmarshallBlob(obj, connection) {
  var id = obj.id;
  var blob;
  while ((blob = connection.received_blobs[id]) === undefined) {
    // data received by aat-server will always arrive before it is
    // being referenced (because we send it as a request and wait for
    // the response before sending the referencing call. data received
    // by the aat-client, however, might arrive *after* the
    // referencing call: aat-server doesn't get a "notification" when
    // the data has arrived at the client, since it is being sent in a
    // http response. Hence the `wait` here:
    connection.dataReceived .. wait();
  }
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
    __js {
      var f = function() { 
        return connection.makeCall(obj.id, m, arguments);
      };
      f[ITF_SIGNAL] = function(this_obj, args) {
        return connection.makeSignalledCall(obj.id, m, args);
      };
      proxy[m] = f;
    }
  }

  return proxy;
}

function unmarshallFunction(obj, connection) {
  // make a proxy for the function:
  __js {
    var f = function() {
      return connection.makeCall(-1, obj.id, arguments);
    };
    f[ITF_SIGNAL] = function(this_obj, args) {
      return connection.makeSignalledCall(-1, obj.id, args);
    };
    if(weak) {
      weak(f, unpublishFunction(obj.id, connection));
    }
  }
  return f;
}

function unmarshallStream(obj, connection) {
  // Blocklambda return/break don't work across spawn boundaries
  // (yet), but many stream primitives (such as `first`) depend on
  // them. 
  // To fix this, we introduce an intermediate `getter` function:

  var ctor = obj.batched ? BatchedStream : Stream;

  return ctor(
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
    [#features/api-file::].

  @variable BridgeConnection.sessionLost
  @type sjs:event::EventStream
  @summary The session has been lost

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

  var sessionLost = Emitter(); // session has been lost
  
  // emitter that gets prodded every time a binary data packet is received;
  // see note under `unmarshallBlob` for details
  var dataReceived = Emitter(); 

  if (opts.publish)
    published_apis[0] = opts.publish;

  function send(data) {
    if (closed) throw TransportError('session lost');

    var args = marshall(data, connection);

    // it is important that once a message has a sequence number, it
    // does get sent. Therefore we don't wait for transport.send to return (the 
    // return value is not needed anyway).
    __js if (transport)
      transport.send({ seq: ++connection.msg_seq_counter, msg:args });
  }

  var connection = {
    sent_blob_counter: 0, // counter for identifying data blobs (see marshalling above)
    msg_seq_counter: 0, // sequence counter to facilitate ordering of (non-data) messages; aat doesn't guarantee order
    received_blobs: {},
    sessionLost: sessionLost,
    dataReceived: dataReceived,
    localWrappers: opts.localWrappers,

    sendBlob: function(id, obj) {
      var t = bytes.isArrayBuffer(obj) || bytes.isUint8Array(obj) ? 'a' : 'b'; // array | buffer
      transport.sendData({id: id, t:t}, obj .. toIterableBytes);
      return id;
    },
    makeSignalledCall: function(api, method, args) {
      send(['signal', api, method, toArray(args)])
    },
    del: function(type, id) {
      var args = marshall(['del', type, id], connection);
      if (transport) transport.enqueue({msg: args});
    },
    makeCall: function(api, method, args) {
      var call_no = ++call_counter;
      waitfor {
        // initiate waiting for return value:
        waitfor (var rv, isException) {
          //logging.debug("awaiting result for call #{call_no} (#{method})");
          pending_calls[call_no] = resume;
        }
        retract {
          //logging.debug("call #{call_no} (#{method}) retracted");
          send(['abort', call_no]);
        }
        finally {
          //logging.debug("deleting call responder #{call_no} (#{method})");
          delete pending_calls[call_no];
        }
        //logging.debug("got result for call #{call_no} - #{rv}");
      }
      and {
        // make the call.
        send(['call', call_no, api, method, toArray(args)]);
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
      if (closed) {
//        console.log('redundant BridgeConnection::__finally__');
        return;
      }
      closed = true;

      this.stratum.abort();

      if (transport) {
        transport.__finally__();
        transport = null;
      }

      executing_calls .. ownValues .. each {|s|
        spawn(function() {
          try {
            s.abort();
          } catch(e) {
            logging.warn("Error while aborting executing call: #{e}");
          }
        }());
      }
      executing_calls = {};

      pending_calls .. ownValues .. each {|r|
        spawn(function() {
          try {
            r(TransportError('session lost'), true);
          } catch(e) {
            logging.warn("Error while aborting pending call: #{e}");
          }
        }());
      }
      executing_calls = {};
    },
  };


  var expected_msg_seq = 1;
  var msg_reorder_buffer = {};
  var queued_msg_count = 0;
  function receiver() {

    function inner() {
      var packet = transport.receive();
      //logging.debug("received packet", packet);
      waitfor {
        if (packet.type === 'message') {
          var data = packet.data;
          if (data.seq === undefined) {
            receiveMessage(data.msg);
          }
          else if (data.seq !== expected_msg_seq) {
            msg_reorder_buffer[data.seq] = data.msg;
            ++queued_msg_count;
            if (queued_msg_count > MAX_MSG_REORDER_BUFFER)
              throw TransportError("Message reorder buffer exhausted"); 
          }
          else {
            receiveMessage(data.msg);
            ++expected_msg_seq;
            while (queued_msg_count > 0) {
              var msg;
              if (!(msg = msg_reorder_buffer[expected_msg_seq])) break;
              delete msg_reorder_buffer[expected_msg_seq];
              ++expected_msg_seq;
              --queued_msg_count;
              receiveMessage(msg);
            }
          }
        }
        else if (packet.type === 'data')
          receiveData(packet);
        else if (packet.type === 'error')
          throw(packet.data);
        else {
          logging.warn("Unknown packet '#{packet.type}' received");
        }
      }
      and {
        // XXX this asynchronisation is necessary because the
        // `this.stratum.abort()` call in __finally__ above happens
        // reentrantly, but the stratum doesn't abort until blocking
        hold(0);
        inner();
      }
    }

    try {
      inner();
    }
    catch (e) {
      if (!throwing) {
        logging.debug("Error while receiving; terminating BridgeConnection: #{e}");
        connection.__finally__();
        sessionLost.emit(e);
        return;
      }
      // in the throwing case, we call __finally__ later, after we've given the block
      // a chance to retract pending calls
      throw e;
    }
    throw new Error('not reached');
  }

  function receiveData(packet) {
    connection.received_blobs[packet.header.id] = coerceBinary(packet.data, packet.header.t);
    dataReceived.emit();
  }

  function receiveMessage(message) {
    var message = unmarshall(message, connection);

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
    case 'signal':
      if (message[1] /*api_id*/ == -1) {
        published_funcs[message[2] /*method*/] .. signal(null, message[3] /*args*/);
      }
      else {
        published_apis[message[1] /*api_id*/][message[2] /*method*/] .. 
          signal(published_apis[message[1]], message[3] /*args*/);
      }
      break;
    case 'del':
      switch(message[1]) {
        case 'function':
          delete published_funcs[message[2]];
          break;
      }
      break;
    case 'call':
      if (executing_calls[message[1]]) break; // duplicate call
      executing_calls[message[1]] = spawn (function(call_no, api_id, method, args) {
        // xxx asynchronize, so that executing_calls[call_no] will be filled in:
        hold(0);
        var response;
        try {
          var rv;
          if (api_id == -1)
            rv = published_funcs[method].apply(null, args);
          else
            rv = published_apis[api_id][method].apply(published_apis[api_id], args);
          response = ["return", call_no, rv];
        }
        catch (e) {
          response = ["return_exception", call_no, e];
        }
        finally {
          delete executing_calls[call_no];
        }
        send(response);
      })(message[1], message[2], message[3], message[4]);
      break;
    case 'abort':
      var executing_call = executing_calls[message[1]];
      if (executing_call) {
        executing_call.abort();
      }
      break;
    case 'unserializable':
      var e = message[2];
      message = message[1];
      var id = message[1];
      switch(message[0]) {
        case 'call':
          send(["return_exception", id, e]);
          break;
        case 'return':
          // turn it into return_exception
          var cb = pending_calls[id];
          if (cb) cb(e, true);
          break;
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

  connection._published_funcs = published_funcs;
  return connection;
}

/**
  @function resolve
  @summary Resolve an .api module by URL
  @param {String} [api] .api URL
  @param {Settings} [opts] options passed to [sjs:http::request]
  @return {Object} apiinfo
  @desc
    For advanced use only; called automatically by [::connect].
*/
exports.resolve = function(api_name, opts) {
  try {
    var apiinfo = http.json([api_name, {format:'json'}], opts);
  }
  catch(e) {
    throw TransportError(e.message);
  }
  // catch syntax errors in the api module; don't throw as transport errors:
  if (apiinfo.error) throw new Error(apiinfo.error);
  if (!nodejs && !api_name .. contains('://')) {
    // resolve relative paths in browser
    api_name = Url.normalize(api_name, document.location.href);
  }
  apiinfo.server = Url.normalize(apiinfo.root || '/', api_name);
  return apiinfo;
};


/**
  @function connect
  @summary Connect to a remote API
  @param {String|Object} [api] .api URL (or pre-fetched apiinfo from [::resolve])
  @param {Settings} [settings]
  @param {optional Function} [block]
  @setting {String} [server] Server root
  @setting {Transport} [transport] Optional existing transport to use
  @setting {Function} [connectMonitor] Optional function to run while connecting
  @setting {Array} [localWrappers] Local wrappers which are enabled for this connection (see [::setMarshallingDescriptor])
  @return {::BridgeConnection} if block is not given
  @desc
    Throws a [::TransportError] if the connection attempt fails.

    If a `connectMonitor` function is given, it will be called before a
    connection attempt is being made, and retracted upon a
    successful or unsuccessful connection. If `connectMonitor` returns
    before a connection is established, the pending connection attempt
    will be aborted and connect will throw a [::TransportError].

    If `api` is an apiinfo object (rather than a URL) string, you must also
    provide either a `server` or `transport` setting.

    If `block` is given, it will be called with a single [::BridgeConnection]
    argument. This block will be retracted automatically when the connection
    throws an exception (e.g the connection is disconnected and cannot reconnect).

    When the block finishes execution (either normally or via an exception), the
    connection object will be closed automatically.

    It is recommended to pass a `block` argument, rather than relying on
    `connect` to return the connection, since using a return value means that
    you will need to:
    
    - monitor the connection's [::BridgeConnection::sessionLost]
      event yourself to see if the connection is still alive

    and

    - close the connection manually (using [::BridgeConnection::__finally__])
*/
exports.connect = function(apiinfo, opts, block) {
  if(typeof(opts) == 'function') throw new Error("opts are required when passing a block to connect()");
  if(!opts) opts={};
  var transport = opts.transport;
  if (isString(apiinfo)) {
    apiinfo = exports.resolve(apiinfo);
  }

  waitfor {
    if (!transport) {
      var server = opts.server || apiinfo.server;
      transport = require('./aat-client').openTransport(server);
    }
    var marshallers = defaultMarshallers.concat(opts.localWrappers || []);
    var connection = BridgeConnection(transport, opts .. merge({
      throwing: !!block,
      api:apiinfo .. get('id'),
      localWrappers: marshallers
    }));
  }
  or {
    if (opts.connectMonitor) {
      opts.connectMonitor();
      throw TransportError("connect monitor abort");
    }
    else
      hold();
  }

  if (block) {
    waitfor {
      try {
        connection.stratum.waitforValue();
      }
      catch (e) {
        logging.verbose("Bridge connection lost: #{e}");
      }

      throw TransportError("Bridge connection lost");
    } or {
      return block(connection);
    }
    finally {
      connection.__finally__();
      connection.sessionLost.emit('session lost');
    }
  }
  else return connection;
}

/**
  @function accept
  @summary Accept a connection request and return a [::BridgeConnection]
  @param {Function} [getAPI]
  @param {Transport} [transport]
  @return {::BridgeConnection}
*/
exports.accept = function(getAPI, transport) {
  var connection = BridgeConnection(transport, {publish: {getAPI:getAPI}, throwing:false, localWrappers: false});
  return connection;
};

