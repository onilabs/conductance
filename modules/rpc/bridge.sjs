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
  @module  server/rpc/bridge
  @summary API bridge: High-level API remoting
  @require ./wst-client
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
     - Set
     - Function, including streams and observables
     - Error

     - For all types apart from Error, "own" properties are serialized (but no inherited properties)
     - the prototype chain is *not* preserved


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
    `_task foo(x,y,z)`. The latter calls both cause the other end of the bridge connection to send
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

     - abortion across the bridge is synchronous

       Retracting a pending call waits for the abortion on the other end of the bridge
       to return or the bridge connection to terminate/time out.


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

  ['C', call#, dynvar_call_ctx, 0, [API_ID]] // call to retrieve initial API

  ['C', call#, dynvar_call_ctx, FUNCTION_ID, [ARG1, ARG2, ARG3, ...]] // generic call

  ['R', call#, RV ] // return

  ['Q', call#, eid ] // blocklambda return; eid prefixed with bridge-id for remote

  ['B', call#, eid ] // blocklambda break; eid prefixed with bridge-id for remote

  ['E', call#, RV] // return exception

  ['A', call# ] // abort

  ['P', call# ] // pseudo-abort (abort that doesn't call `retract`)

  ['S', FUNCTION_ID, [ARG1, ARG2, ARG3, ...]] // signalled call

  ['U', id] // unpublish a function (garbage collection across bridge)

  Marshalling: values are being serialized as JSON
  special objects get an __oni_bridge_type attribute

*/

/*
BRIDGE-TRANSPORT INTERFACE
==========================

We have 2 low-level transports: aat (asymmetric AJAX), 
which has now been superseded by wst (websocket). 
Both implement the same interface:

Errors:
- TransportError
- isTransportError

Transport:
- closed (bool flag)
- send: function(json message)
- sendData: function(json header, binary data)
- __finally__: close transport
- receive: function() -> {type:'message|data', data: json|binary, header: json(data only)}

*/

@ = require([
  'sjs:std',
  {id:'sjs:bytes', name:'bytes'},
  {id:'sjs:crypto', name:'crypto'},
  {id:'./error', include: ['isTransportError', 'TransportError']}
]);

var apiRegistry, weak;
if (@sys.hostenv !== 'xbrowser') {
  apiRegistry = require('../server/api-registry')
  try {
    weak = require('nodejs:weak');
  } catch(e) {
    // ignore missing `weak` module
  }
  function unpublishFunction(id, conn) {
    return function(obj) {
      conn.unpublish(id);
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

/**
  @class TransportError
  @summary The error type raised by connection errors in a [::BridgeConnection]
*/
exports.isTransportError = @isTransportError;

exports.TransportError = @TransportError;

//----------------------------------------------------------------------
// blocklambda controlflow

__js {

  function ReceivedControlFlowException() {};

  function isReceivedControlFlowException(obj) { return (obj instanceof ReceivedControlFlowException) }

  function makeBlocklambdaReturnControlFlowException(eid, val) {
    var rv = Object.create(ReceivedControlFlowException.prototype);
    rv.postLocally = function() {
      var cfx = __oni_rt.Return(val);
      cfx.eid = eid;
      return cfx;
    };
    return rv;
  }

  function makeBlocklambdaBreakControlFlowException(eid) {
    var rv = Object.create(ReceivedControlFlowException.prototype);
    rv.postLocally = function() {
      var cfx = __oni_rt.BlBreakOld({blbref:{sid:eid}});
      return cfx;
    };
    return rv;
  }

} // __js

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

    `desc` must be an object with the following properties:

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
    descr = descr .. @merge({
      wrapRemote: [{__oni_apiid: remoteMod.__oni_apiid}, remoteKey],
    });
  }
  obj.__oni_marshalling_descriptor = descr;
  return obj;
}
exports.setMarshallingDescriptor = setMarshallingDescriptor;

var defaultMarshallers = [];

exports.defaultMarshallers = defaultMarshallers;

__js {
  var coerceBinary, isNodeJSBuffer, nodejs = @sys.hostenv === 'nodejs';
  var toIterableBytes = @fn.identity;
  var isBytes = @bytes.isBytes;
  if (nodejs) {
    isNodeJSBuffer = value -> Buffer.isBuffer(value);
    coerceBinary = function(b, t) {
      switch(t) {
        case 'b': return b .. @bytes.toBuffer();
        case 'a': return b .. @bytes.toUint8Array();
        default: throw new Error("Unknown binary type #{t}");
      }
    };
    // nodejs can't send an ArrayBuffer as a request body
    toIterableBytes = b -> b instanceof ArrayBuffer ? b .. @bytes.toUint8Array : b;
  } else {
    isNodeJSBuffer = -> false;
    // browser can only represent binary data as TypedArray
    coerceBinary = @fn.identity;
    if(typeof(Blob) !== 'undefined') {
      // treat browser `Blob` as bytes
      isBytes = (b) -> @bytes.isBytes(b) || b instanceof Blob;
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

    function processProperties(value) {
      __js var k = @ownKeys(value) .. @filter(name ->
                                              name !== 'toString' && 
                                              name !== @fn.ITF_SIGNAL &&
                                              !__oni_rt.is_ef(value[name])
                                             );
      return k .. /*@monitor(k -> k .. @startsWith('__oni') ? console.log(k)) ..*/ @transform(name -> [name, prepare(value[name])]);
    }

    function withProperties(dest, value) {
      var props = dest.props = {};
      processProperties(value) .. @each {|[name, val]|
        props[name] = val;
      }
      return dest;
    }

    function prepare(value) {
      var rv = value;
      if (typeof value === 'function') {
        // XXX we'll be calling the function with the wrong 'this' object
        rv = { __oni_bridge_type: 'func', 
               id: connection.publishFunction(value), 
               props: processProperties(value) .. @pairsToObject };
      }
      else if (value instanceof Date) {
        rv = { __oni_bridge_type: 'date', val: value.getTime() };
      }
      else if (isBytes(value)) {
        // NOTE: this must go before `isArrayLike`, since a Uint8Array is both
        var id = ++connection.sent_blob_counter;
        connection.sendBlob(id, value);
        rv = { __oni_bridge_type: 'blob', id:id };
      }
      else if (@isArrayLike(value)) {
        rv = value .. @map(prepare);
      }
      else if (@isQuasi(value)) {
        rv = {__oni_bridge_type: 'quasi', val: prepare(value.parts) };
      }
      else if (typeof value === 'object' && value !== null) {
        var descriptor;
        if ((descriptor = value.__oni_marshalling_descriptor) !== undefined) {
          rv = prepare(descriptor.wrapLocal(value));
          rv = { __oni_bridge_type: 'custom_marshalled', proxy: rv, wrap: descriptor.wrapRemote };
        }
        else if (value instanceof Error || value._oniE) {
          rv = { __oni_bridge_type: 'error', message: value.message, stack: value.__oni_stack };
          // many error APIs provide errno / code to distinguish error types, so include
          // those if present
          ['errno','code'] .. @each {|k|
            if(value[k] === undefined) continue;
            if(!rv.props) rv.props = {};
            rv.props[k] = value[k];
          };
        }
        else if (@isSet(value)) {
          rv = { __oni_bridge_type: 'set', val: value .. @map(prepare) }
        }
        else {
          // a generic object -> traverse it
          rv = processProperties(value) .. @pairsToObject;
        }
      }
      else if (typeof value === 'undefined') {
        // We need to treat 'undefined' specially, because JSON doesn't
        // allow it, and worse: 
        // JSON.stringify([undefined]) yields "[null]"!!
        rv = { __oni_bridge_type:'undef' };
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

  __js {

  // XXX ideally we would like 'unmarshallComplexTypes' to be fully __js, but the presence of blobs and
  // potentially asynchronous localWrappers makes this impossible atm.

  var rv, potentially_async = false;

  if (obj.__oni_bridge_type == 'func') {
    rv = unmarshallFunction(obj, connection); //__js
  }
  else if (obj.__oni_bridge_type == 'date') { // __js
    rv = new Date(obj.val);
  }
  else if (obj.__oni_bridge_type == 'error') { // __js
    rv = unmarshallError(obj, connection);
  }
  else if (obj.__oni_bridge_type === 'undef') { // __js
    rv = undefined;
  }
  else
    potentially_async = true;

  } // __js
  

  if (potentially_async) {

    if (obj.__oni_bridge_type == 'blob') {
      rv = unmarshallBlob(obj, connection); // NOT __JS
    }
    else if (obj.__oni_bridge_type == 'quasi') {
      rv = @Quasi(obj.val .. @map(v -> unmarshallComplexTypes(v, connection)));
    }
    else if (obj.__oni_bridge_type == 'set') {
      rv = @Set(obj.val .. @map(v -> unmarshallComplexTypes(v, connection)));
    }
    else if (obj.__oni_bridge_type == 'custom_marshalled') {
      var mod;
      var apiid = obj.wrap[0].__oni_apiid;
      if(apiid !== undefined) {
        mod = apiRegistry.getAPIbyAPIID(apiid);
      } else {
        if (connection.localWrappers &&
            connection.localWrappers .. @find(w -> w .. @eq(obj.wrap), false)
           ) {
          mod = require(obj.wrap[0]);
        } else {
          throw new Error("Unsupported marshalling descriptor: #{obj.wrap}");
        }
      }
      rv = mod[obj.wrap[1]](unmarshallComplexTypes(obj.proxy, connection));
    }
    else {
      // generic object -> descend recursively
      @ownKeys(obj) .. @each {
        |key|
        obj[key] = unmarshallComplexTypes(obj[key], connection);
      }
      return obj;
    }
  }

  if (obj .. @hasOwn('props')) {
    @ownKeys(obj.props) .. @each {
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

    // XXX Now that we use wst-transport, we can review this logic:

    // data received by aat-server will always arrive before it is
    // being referenced (because we send it as a request and wait for
    // the response before sending the referencing call. data received
    // by the aat-client, however, might arrive *after* the
    // referencing call: aat-server doesn't get a "notification" when
    // the data has arrived at the client, since it is being sent in a
    // http response. Hence the `wait` here:
    connection.dataReceived .. @wait();
  }
  delete connection.received_blobs[id];
  return blob;
}

__js function unmarshallError(props, connection) {
  var err = new Error(props.message);
  err.__oni_stack = props.stack;
  return err;
}

__js {
function unmarshallFunction(obj, connection) {
  // make a proxy for the function:
  var f = function() { 
    return connection.makeCall(obj.id, arguments);
  };
  f[@fn.ITF_SIGNAL] = function(this_obj, args) {
    return connection.makeSignalledCall(obj.id, args);
  };
  if(weak) {
    weak(f, unpublishFunction(obj.id, connection));
  }
  return f;
}
} // __js

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
  // bridge_id to uniquely identify this connection
  /*
    Among other things, the bridge_id is used to route blocklambda breaks/returns.
    In most cases, there will only be one bridge connection across which these 
    controlflows are routed, but it is conceivable that we have complicated 
    multi-server scenarios where a blocklambda return/break is routed across multiple
    bridges that don't know of each other. Therefore bridge_id needs to be GLOBALLY
    unique.
    As the number of bridges participating in any such controlflow is likely to be very
    small (2 most of the time), 64bit random bridge ids should be plenty big enough.
    As per birthday problem, if we assume 100 bridges participating in routing a 
    single blocklambda break/return, we would get a collision probability on the order
    of 10^-16
    
   */
  var bridge_id = @crypto.randomID(2); // 64 bits, see above
  var pending_calls  = {}; // calls in progress, made to the other side
  var executing_calls = {}; // calls in progress, made to our side; call_no -> stratum
  var pending_returns = {}; // target_frame_id -> return value
  var call_counter   = 0;
  var published_funcs = {};
  var published_func_counter = 0;
  var closed = false;
  var throwing = opts.throwing !== false;

  var sessionLost = @Emitter(); // session has been lost
  
  // emitter that gets prodded every time a binary data packet is received;
  // see note under `unmarshallBlob` for details
  var dataReceived = @Emitter(); 

  if (opts.api_getter)
    published_funcs[0] = opts.api_getter;
  else
    published_funcs[0] = function() { throw new Error("This end of the bridge does not expose an API"); }

  function send(data, dont_throw) {
    if (closed || transport.closed) {
      //console.log("session lost trying to send #{data .. @inspect(false, 4)}");
      if (dont_throw)
        return;
      throw @TransportError('Bridge connection lost');
    }

    var args = marshall(data, connection);

    // XXX
    // it is important that once a message has a sequence number, it
    // does get sent. Therefore we don't wait for transport.send to return (the 
    // return value is not needed anyway).
    //__js 

    if (transport) {
      try {
        transport.send({ seq: ++connection.msg_seq_counter, msg:args });
      }
      catch(e) {
        if (dont_throw) 
          return;
        throw @TransportError(e);
      }
    }
  }

  var connection = {
    sent_blob_counter: 0, // counter for identifying data blobs (see marshalling above)
    msg_seq_counter: 0, // sequence counter to facilitate ordering of (non-data) messages; aat doesn't guarantee order
    received_blobs: {},
    sessionLost: sessionLost,
    dataReceived: dataReceived,
    localWrappers: opts.localWrappers,

    sendBlob: function(id, obj) {
      // in nodejs 4.5 and later, Buffers are also Uint8Arrays, so we need to test for isBuffer, and not this:
      //var t = @bytes.isArrayBuffer(obj) || @bytes.isUint8Array(obj) ? 'a' : 'b'; // array | buffer
      // XXX at some point we should harmonize uint8arrays and buffers
      var t = isNodeJSBuffer(obj) ? 'b' : 'a';
      transport.sendData({id: id, t:t}, obj .. toIterableBytes);
      return id;
    },
    makeSignalledCall: function(function_id, args) {
      send(['S', function_id, @toArray(args)])
    },
    unpublish: function(id) {
      var args = marshall(['U', id], connection);
      if (transport) transport.send({msg: args});
    },
    makeCall: function(function_id, args) {
      var call_no = ++call_counter;
      waitfor {
        // initiate waiting for return value:
        waitfor (var rv, isException) {
          //@logging.debug("awaiting result for call #{call_no} (#{function_id})");

          // in addition to `resume`, we store the current dyn var context, so that it can be restored when
          // we get reentrant callback calls from the other side of the bridge:
          pending_calls[call_no] = [resume, @sys.getCurrentDynVarContext()];
        }
        finally (e) {
          //@logging.debug("deleting call responder #{call_no} (#{function_id})");
          delete pending_calls[call_no];
          
          if (e[2]) {
          // We have an abort.
          // Wait for other side to be retracted.
          // If the bridge gets torn down before the other side answers, our finalization
          // code will generate a 'session lost' error that will resume the waitfor/resume
            // but note that this can take a looooong time if bridge communication is interrupted
            waitfor (var abort_rv, abort_isException) {
              pending_calls[call_no] = [resume, @sys.getCurrentDynVarContext()];
              var is_pseudo = e[3];
              send([is_pseudo ? 'P' : 'A', call_no]);
            }
            catch(e) {
              if (!@isTransportError(e)) throw e;
              // ... else we couldn't send, because of a transport error.
              // -> ignore
            }
            finally {
              delete pending_calls[call_no];
            }
            if (__js abort_isException) {
              if (isReceivedControlFlowException(abort_rv)) {
                // retraction of the other side yielded a blk-lambda break/return. post it:
                abort_rv.postLocally();
                throw new Error('not reached');
              }
              else if (!@isTransportError(abort_rv)) {
                throw abort_rv;
              }
            }
          } 
          throw e;
        }
        //@logging.debug("got result for call #{call_no} - #{rv}");
      }
      and {
        // make the call:

        // check if the current stratum originates from a call from the other side of the bridge, and
        // if yes, tell the other side about any dynamic variable context it needs to restore:
        var dynvar_call_ctx = @sys.getDynVar("__mho_bridge_#{bridge_id}_dynvarctx", 0); // default 0 == no context to restore
        send(['C', call_no, dynvar_call_ctx, function_id, @toArray(args)]);
      }
      if (isException) {
        if (isReceivedControlFlowException(rv)) {
          rv.postLocally();
          throw new Error('not reached');
        }
        throw rv;
      }
      return rv;
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
//      console.log(">>>>>>>>>> CLOSING BRIDGE #{bridge_id} <<<<<<<<<<<<<<<<<");
      _task this.stratum.abort();

      if (transport) {
        transport.__finally__();
        transport = null;
      }

      executing_calls .. @ownValues .. @each {|s|
        _task(function() {
          try {
            s.abort();
          } catch(e) {
            @logging.warn("Error while aborting executing call: #{e}");
          }
        }());
      }
      executing_calls = {};

      pending_calls .. @ownPropertyPairs .. @each {|[id,[r]]|
        _task(function() {
          try {
//            console.log("Abort pending call #{id} with session lost...");
            r(@TransportError('session lost'), true);
          } catch(e) {
            @logging.warn("Error while aborting pending call: #{e}");
          }
        }());
      }
      pending_calls = {};

      /* XXX we could clear up pending returns by executing clearOrphanedBLR 
         every time a pending_call gets aborted or excepted:
         If we want to enable this, we need to edit vm1.js.in to reflect 'ef' onto the
         resume function - grep for 'clearOrphanedBLR' in vm1.js.in.
         __js function clearOrphanedBLR(pending_call) {
           var p = pending_call[0].ef.parent;
           var max_levels = 15;
           while (max_levels--) {
             if (p.env.blscope) {
               var sid = p.env.blscope.sid;
               for (eid in pending_returns) {
                 if (sid == eid) {
                   delete pending_returns[eid];
                   return;
                 }
               }
             }
             if (!(p = (p.parent||p.env.blrref))) break;
           }
         }
           //
         }
      */
      pending_returns .. @ownPropertyPairs .. @each {
        |[id,val]|
        console.log("Warning: Undelivered blocklambda return value for frame #{id}. Val='#{val}'");
      }
      pending_returns = {};

    },
  };


  var expected_msg_seq = 1;
  var msg_reorder_buffer = {};
  var queued_msg_count = 0;
  function receiver() {

    function inner() {
      var packet = transport.receive();
      //@logging.debug("received packet", packet);
      waitfor {
        if (packet.type === 'message') {
          var data = packet.data;
          if (data.seq === undefined) {
            receiveMessage(data.msg);
          }
          else if (data.seq !== expected_msg_seq) {

            // XXX wst-transport guarantees ordering, so we shouldn't hit this anymore:

            msg_reorder_buffer[data.seq] = data.msg;
            ++queued_msg_count;
            console.log("QUEUED MESSAGE FOR REORDERING (expect=#{expected_msg_seq} found=#{data.seq}");
            if (queued_msg_count > MAX_MSG_REORDER_BUFFER)
              throw @TransportError("Message reorder buffer exhausted"); 
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
        else if (packet.type === 'error') {
          throw(packet.data);
        }
        else {
          @logging.warn("Unknown packet '#{packet.type}' received");
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
      if (@isTransportError(e)) {
        @logging.debug("Transport Error while receiving; terminating BridgeConnection: #{e}");
      }
      else {
        @logging.error("Error while receiving; terminating BridgeConnection: #{e}");
      }
      if (!throwing) {
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


  __js {
    function performReceivedCallSync(call_no, function_id, args) {
      var rv;
      try {
        rv = published_funcs[function_id].apply(null, args);
      }
      catch (e) { 
        if (e && e.__oni_cfx) {
          // a control-flow exception
          if (e.type === 'blb_old') {
            return makeBlocklambdaBreakMessage(e.eid, call_no);
          }
          else if (e.type === 'r' && e.eid) { // blocklambda return
            return makeBlocklambdaReturnMessage(e.eid, e.val, call_no);
          }
          else {
            // Can this ever happen??
            console.log("Unexpected controlflow in conductance bridge");
            throw new Error("Unexpected controlflow in conductance bridge");
          }
          return;
        }

        return ['E', call_no, e];
      }
      return ['R', call_no, rv];
    }
  }

  __js function makeBlocklambdaBreakMessage(eid, call_id) {
    var rv;
    if (typeof eid === 'number') {
      rv = ['B', call_id, "#{bridge_id}/#{eid}"];
    }
    else {
      // this is a remote eid
      rv = ['B', call_id, eid];
    }
    return rv;
  }

  __js function makeBlocklambdaReturnMessage(eid, val, call_id) {
    var rv;
    if (typeof eid === 'number') {
      // this is a local eid
      pending_returns[eid] = val;
      rv = ['Q', call_id, "#{bridge_id}/#{eid}"];
    }
    else {
      // this is a remote eid
      rv = ['Q', call_id, eid];
    }
    return rv;
  }

  function receiveMessage(message) {
    var message = unmarshall(message, connection);

    switch (message[0]) {
    case 'R': // return
      var cb = pending_calls[message[1]];
      if (cb)
        cb[0](message[2], false);
      // XXX log if not found?
      break;
    case 'Q': // blocklambda return
      // inject a blocklambda return into pending call
      __js {
        var cb = pending_calls[message[1]];
        if (cb) {
          var eid = message[2];
          var val = undefined;
          if (eid.split('/')[0] == bridge_id) {
            // resolve local blocklambda return
            eid = Number(eid.split('/')[1]);
            val = pending_returns[eid];
            delete pending_returns[eid];
          }
//          console.log("INJECT blocklambda return with eid=#{eid} into pending call #{message[1]}");
          cb[0](makeBlocklambdaReturnControlFlowException(eid,val), true);
        }
      } // __js
      break;
    case 'B': // blocklambda break
      // inject a blocklambda break into pending call
      __js {
        var cb = pending_calls[message[1]];
        if (cb) {
          var eid = message[2];
          if (eid.split('/')[0] == bridge_id) {
            // resolve local blocklambda break
            eid = Number(eid.split('/')[1]);
          }
//          console.log("INJECT blocklambda break with eid=#{eid} into pending call #{message[1]}");
          cb[0](makeBlocklambdaBreakControlFlowException(eid), true);
        }
      } // __js
      break;
    case 'E': // exception
      var cb = pending_calls[message[1]];
      if (cb)
        cb[0](message[2], true);
      break;
    case 'S': // signalled call
      published_funcs[message[1] /*function_id*/] .. @signal(null, message[2] /*args*/);
      break;
    case 'U': // unpublish a function
      delete published_funcs[message[1]];
      break;
    case 'C': // call

      if (executing_calls[message[1]]) break; // duplicate call
      
      // we'll attempt to perform the call synchronously. this will return
      // an execution frame if the call went async. in that case we spawn a
      // stratum to manage the call.

      // If this is a reentrant bridge call, restore dynvar context of the original call we made to the other side:
      var dynvar_proto;

      __js if (message[2] /* dynvar_call_ctx */) {
        var originating_call = pending_calls[message[2]];
        if (!originating_call) {
          console.log("Warning: Cannot restore dynamic variable context from a non-nested spawned bridge call");
          dynvar_proto = @sys.getCurrentDynVarContext();
        }
        else
          dynvar_proto = originating_call[1];
      }
      else
        dynvar_proto = @sys.getCurrentDynVarContext();

      @sys.withDynVarContext(dynvar_proto) { ||
        @sys.setDynVar("__mho_bridge_#{bridge_id}_dynvarctx", message[1]);

        __js var call_rv = performReceivedCallSync(message[1], //call_no
                                                   message[3], // function_id
                                                   message[4] // args
                                                  );
        if (call_rv === undefined) break;

        if (__oni_rt.is_ef(call_rv[2])) {
          // go async
          executing_calls[message[1]] = 
            _task(function(ef, call_id) { 
              var rv;
              try {
                ef.wait();
              }
              finally (e) { 
                delete executing_calls[call_id];
                if (e[1]) { // exception
                  if (e[0].type === 'blb_old') {
                    __js rv = makeBlocklambdaBreakMessage(e[0].eid, call_id);
                    // prevent further blocklambda break handling:
                    e = [undefined];
                  }
                  else if (e[0].type === 'r' && e[0].eid) {
                    __js rv = makeBlocklambdaReturnMessage(e[0].eid, e[0].val, call_id);
                    // prevent further blocklambda return handling:
                    e = [undefined];
                  }
                  else if (e[0].type === 't') {
                    // report exception to other side, but don't return it from this
                    // executing call on our side.
                    // XXX maybe log it?
                    rv = ['E', call_id, e[0].val];
                    e = [undefined];
                  }
                  else {
                    // abort or similar. this is either in response to an 'a' or 'p'
                    // message from the other side, or because we're aborted as part
                    // of bridge shutdown.
                    rv = ['R', call_id, 'abort-ok'];
                  }
                } // exception
                else { // no exception
                  rv = ['R', call_id, e[0]];
                  // no need to return the rv to our side:
                  e = [undefined];
                }
                if (rv) {
                  send(rv, true);
                }
                throw e;
              }
            })(call_rv[2], message[1])
        }
        else {
          send(call_rv);
        }
      } /* @sys.withDynVarContext */
      break;

    case 'A': // abort
    case 'P': // pseudo-abort
      var executing_call = executing_calls[message[1]];
      if (executing_call) {
        // XXX should try aborting synchronously first - see the code for case 'C', above
        _task (function(call_id) {
          try {
            executing_call.abort(message[0] === 'P');
          }
          catch(e) {
            @logging.warn("Error while aborting active bridge call: #{e}");
            if (!@isTransportError(e)) {
              try {
                send(['E', call_id, e]);
              }
              catch(e) {
                if (!@isTransportError(e)) throw e;
                // else swallow transport error
              }
            }
          }
        })(message[1]);
      }
      else {
        send(['E', message[1], new Error("Didn't find bridge call to abort")]);
      }
      break;
    case 'unserializable':
      var e = message[2];
      message = message[1];
      var id = message[1];
      switch(message[0]) {
        case 'C': // a call
          send(["E", id, e]);
          break;
        case 'R': // a return call
          // turn it into an exception
          var cb = pending_calls[id];
          if (cb) cb[0](e, true);
          break;
      }
      break;
    }
  }

  // XXX we want the api_name to be relative to the current app's base; not
  // sure how that's going to work from the server-side (sys:resolve??)
  var getAPI = -> connection.makeCall(0, [opts.api]);

  connection.stratum = _task receiver();
  waitfor {
    // to make sure errors are routed while the getAPI call is in progress
    /* reify().adopt(connection.stratum); // will be readopted when handed over to `connect` */
    connection.stratum.waitforValue();
  }
  or {
    if (opts.api)
      connection.api = getAPI();
  }

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
    var apiinfo = @http.json([api_name, {format:'json'}], opts);
  }
  catch(e) {
    throw @TransportError(e.message);
  }
  // catch syntax errors in the api module; don't throw as transport errors:
  if (!apiinfo) throw new Error("Error resolving #{api_name}");
  if (apiinfo.error) throw new Error(apiinfo.error);
  if (!nodejs && !api_name .. @contains('://')) {
    // resolve relative paths in browser
    api_name = @url.normalize(api_name, document.location.href);
  }
  apiinfo.server =@url.normalize(apiinfo.root || '/', api_name);
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
  if (@isString(apiinfo)) {
    apiinfo = exports.resolve(apiinfo);
  }

  waitfor {
    if (!transport) {
      var server = opts.server || apiinfo.server;
      transport = require('./wst-client').openTransport(server);
    }
    var marshallers = defaultMarshallers.concat(opts.localWrappers || []);
    var connection = BridgeConnection(transport, opts .. @merge({
      throwing: !!block,
      api:apiinfo .. @get('id'),
      localWrappers: marshallers
    }));
  }
  or {
    if (opts.connectMonitor) {
      opts.connectMonitor();
      throw @TransportError("connect monitor abort");
    }
    else
      hold();
  }

  if (block) {
    waitfor {
      try {
        /* reify().adopt(connection.stratum) XXXX we need to catch the error though */
        connection.stratum.waitforValue();
      }
      catch (e) {
        //console.log("BRIDGE CONNECTION LOST IN CONNECT(BLOCK)");
        @logging.verbose("Bridge connection lost: #{e}");
      }

      // xxx if there are unretractable active calls in `block`
      // (i.e. something like try{}finally{api.call()}, we will end
      // up with deadlock here, unless we clean up those calls right here:
      //XXX

      throw @TransportError("Bridge connection lost");
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
  var connection = BridgeConnection(transport, {api_getter: getAPI, throwing:false, localWrappers: false});
  return connection;
};

