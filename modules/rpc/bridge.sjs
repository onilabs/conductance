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
var { each, toArray, map, filter, find, join, transform, isStream, Stream, at, any } = require('sjs:sequence');
var { hostenv } = require('sjs:sys');
var { pairsToObject, ownPropertyPairs, ownValues, merge, hasOwn } = require('sjs:object');
var { isArrayLike } = require('sjs:array');
var { isString, startsWith } = require('sjs:string');
var { isFunction, exclusive } = require('sjs:function');
var { Emitter, wait } = require('sjs:event');
var { Quasi, isQuasi } = require('sjs:quasi');
var { ownKeys, keys, propertyPairs, get } = require('sjs:object');
var { eq } = require('sjs:compare');
var http = require('sjs:http');
var Url = require('sjs:url');
var global = require('sjs:sys').getGlobal();
var apiRegistry;
if (hostenv !== 'xbrowser') {
  apiRegistry = require('../server/api-registry')
}

// helper to identify binary data:
var BinaryCtors = ['Blob', 'ArrayBuffer', 'DataView', 
                   'Uint8Array', 'Uint16Array', 'Uint32Array', 
                   'Int8Array', 'Int16Array', 'Int32Array',
                   'Float32Array', 'Float64Array'] ..
  filter(x -> typeof global[x] == 'function') .. 
  map(x -> global[x]);
function isBinaryData(obj) {
  return BinaryCtors .. any(ctor -> obj instanceof ctor);
}

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
  try {

    // XXX we can't use JSON.stringify(., replacer), because certain
    // values (such as Dates) will have been converted to strings by the
    // time the replacer sees them *sigh*
    // Instead we prepare a 'stringifyable object first:
  
    var stringifyable = {};

    function processProperties(value, root) {
      return value .. propertyPairs ..
        filter([name,val] ->
          root[name] !== val && (
            name === '__oni_apiid' || (
              name != 'toString' && !name.. startsWith('_')
            )
          )
        ) ..
        transform([name, val] -> [name, prepare(val)]);
    }

    function withProperties(dest, value, root) {
      var props;
      processProperties(value, root) .. each {|[name, val]|
        if (!props) props = dest.props = {};
        props[name] = val;
      }
      return dest;
    }

    function prepare(value) {
      var rv = value;
      if (typeof value === 'function') {
        if (isStream(value)) {
          // XXX we want to batch up streams
          rv = { __oni_type: 'stream', id: connection.publishFunction(value) };
        }
        else {
          // a normal function
          // XXX we'll be calling the function with the wrong 'this' object
          rv = { __oni_type: 'func', id: connection.publishFunction(value) };
        }
        rv = rv .. withProperties(value, Function.prototype);
      }
      else if (value instanceof Date) {
        rv = { __oni_type: 'date', val: value.getTime() };
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
          rv = { __oni_type: 'error', message: value.message, stack: value.__oni_stack };
        }
        else if (value.__oni_type == 'api') {
          // publish on the connection:
          connection.publishAPI(value);
          // serialize as "{ __oni_type:'api', methods: ['m1', 'm2', ...] }"
          var methods = keys(value.obj) .. 
            filter(name -> typeof value.obj[name] === 'function') ..
            toArray;
          rv = { __oni_type:'api', id: value.id, methods: methods};
        }
        else if (value.__oni_type === 'blob') {
          // send the blob as 'data'
          var id = ++connection.sent_blob_counter;
          connection.sendBlob(id, value.obj);
          rv = { __oni_type: 'blob', id:id };
        }
        else if (isBinaryData(value) || isNodeJSBuffer(value)) {
          var id = ++connection.sent_blob_counter;
          connection.sendBlob(id, value);
          rv = { __oni_type: 'blob', id:id };
        }
        else {
          // a normal object -> traverse it
          rv = processProperties(value, Object.prototype) .. pairsToObject;
        }
      }
      return rv;
    }

    var rv = value .. prepare .. JSON.stringify;
    return rv;
  } catch(e) {
    e.message = "Error marshalling value: #{e.message || ""}";
    throw e;
  }
}

function unmarshall(str, connection) {
  var raw = JSON.parse(str);
  try {
    // unmarshall special types:
    return unmarshallComplexTypes(raw, connection);
  } catch(e) {
    return ['unserializable', raw, e];
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
    waitfor {
      connection.dataReceived .. wait();
    }
    or {
      connection.sessionLost .. wait();
      // XXX is this the right error to throw?
      throw new Error("session lost");
    }
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
    proxy[m] = function() { 
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
  var _lastTransport = transport;
  var disconnectHandler = opts.disconnectHandler;

  var sessionLost = Emitter(); // session has been lost
  
  // emitter that gets prodded every time a binary data packet is received;
  // see note under `unmarshallBlob` for details
  var dataReceived = Emitter(); 

  if (opts.publish)
    published_apis[0] = opts.publish;

  var connection = {
    sent_blob_counter: 0, // counter for identifying data blobs (see marshalling above)
    received_blobs: {},
    sessionLost: sessionLost,
    dataReceived: dataReceived,
    localWrappers: opts.localWrappers,

    sendBlob: function(id, obj) {
      transport.sendData(id, obj);
      return id;
    },
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
          if (transport) transport.send(args);
        }
      } or {
        var err = sessionLost .. wait();
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
    },
  };

  function receiver() {

    function inner() {
      var async = false;
      var packet = transport.receive();
      //logging.debug("received packet", packet);
      waitfor {
        if (packet.type === 'message')
          receiveMessage(packet);
        else if (packet.type === 'data')
          receiveData(packet);
        else {
          logging.warn("Unknown packet '#{packet.type}' received");
        }
//        if (!async) return;
      }
      and {
//        async = true;
        // XXX this asynchronisation is necessary because the
        // `this.stratum.abort()` call in __finally__ above happens
        // reentrantly, but the stratum doesn't abort until blocking
        hold(0);
        inner();
      }
    }

    // The while loop here (and the async flag logic, above) shouldn't
    // be necessary in theory because SJS is tail-call safe. 
    while (1) {
      try {
        inner();
      }
      catch (e) {
        if (!throwing) {
          sessionLost.emit(e);
          logging.verbose("Error while receiving; terminating BridgeConnection: #{e}");
          break;
        }
        throw e;
      }

    }
  }

  function receiveData(packet) { 
    connection.received_blobs[packet.header] = packet.data;
    dataReceived.emit();
  }

  function receiveMessage(packet) {
    var message = unmarshall(packet.data, connection);

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
        waitfor {
          var response;
          try {
            var rv;
            if (api_id == -1)
              rv = published_funcs[method].apply(null, args);
            else
              rv = published_apis[api_id][method].apply(published_apis[api_id], args);
            response = marshall(["return", call_no, rv], connection);
          }
          catch (e) {
            response = marshall(["return_exception", call_no, e], connection);
          }
          try {
            transport.send(response);
          }
          catch (e) {
            // ignore exception; transport will be closed
          }
        } or {
          sessionLost .. wait();
        }
        finally {
          delete executing_calls[call_no];
        }
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
          transport.send(marshall(["return_exception", id, e], connection));
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
  return connection;
}

/**
  @function connect
  @summary Connect to a remote API
  @param {String|Object} [api] .api URL (or pre-fetched apiinfo)
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
    you will need to monitor the connection's [::BridgeConnection::sessionLost]
    event yourself and:

     - close the connection (using [::BridgeConnection::__finally__] or a
       [sjs:#language/syntax::using] block)
     - abort any code that relies upon the (now dead) connection.
*/
exports.connect = function(api_name, opts, block) {
  var transport = opts.transport;
  var apiinfo = null;
  if (!isString(api_name)) {
    apiinfo = api_name;
    api_name = null;
  }
  waitfor {
    waitfor {
      if (!transport) {
        var server = opts.server || Url.normalize('/', api_name);
        transport = require('./aat-client').openTransport(server);
      }
    }
    and {
      if (!apiinfo) {
        try {
          apiinfo = http.json([api_name, {format:'json'}]);
        }
        catch(e) {
          throw TransportError(e.message);
        }
      }
      // catch syntax errors in the api module; don't throw as transport errors:
      if (apiinfo.error) throw new Error(apiinfo.error);
    }
    var marshallers = defaultMarshallers.concat(opts.localWrappers || []);
    var connection = BridgeConnection(transport, opts .. merge({
      throwing:true,
      api:apiinfo .. get('id'),
      localWrappers: marshallers,
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
    using(connection) {
      waitfor {
        try {
          connection.stratum.waitforValue();
        } catch(e) {
          logging.verbose("Bridge connection lost: #{e}");
          throw TransportError("Bridge connection lost");
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
  @summary Accept a connection request and return a [::BridgeConnection]
  @param {Function} [getAPI]
  @param {Transport} [transport]
  @return {::BridgeConnection}
*/
exports.accept = function(getAPI, transport) {
  var connection = BridgeConnection(transport, {publish: {getAPI:getAPI}, throwing:false, localWrappers: false});
  return connection;
};

