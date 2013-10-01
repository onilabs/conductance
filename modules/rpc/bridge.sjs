/*
 * 'rpc/bridge' module
 * API bridge
 *
 * Version: 'unstable'
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
   @summary API bridge: High-level API remoting. Work in progress
   @home    mho:server/rpc/bridge
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
var { each, toArray, map, filter, transform, isStream, Stream} = require('sjs:sequence');
var { pairsToObject, ownPropertyPairs } = require('sjs:object');
var { isArrayLike } = require('sjs:array');
var { isString } = require('sjs:string');
var { isFunction } = require('sjs:function');
var { keys, propertyPairs } = require('sjs:object');

//----------------------------------------------------------------------
// marshalling

/**
   @function setMarshallingDescriptor
   @summary XXX
*/
function setMarshallingDescriptor(obj, descr) {
  obj.__oni_marshalling_descriptor = descr;
  return obj;
}
exports.setMarshallingDescriptor = setMarshallingDescriptor;

/**
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

function marshall(value, connection) {

  var blobs = [];

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
    else if (value instanceof Error) {
      var props = {};
      props.message = value.toString(); // we want toString() to get callstack
      ownPropertyPairs(value) .. each {|[name, val]|
        if(name.charAt(0) === '_' || !val .. isFunction() || name === 'toString') continue;
        props[name] = prepare(val);
      }
      value = { __oni_type: 'error', props: props };
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
      else {
        // a normal object -> traverse it
        value = propertyPairs(value) .. 
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
    // XXX we want to batch up streams
    return Stream(unmarshallFunction(obj, connection));
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
    return unmarshallError(obj.props, connection);
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
  props .. ownPropertyPairs .. each {|[name, val]|
    if (name === 'message') continue;
    err[name] = unmarshallComplexTypes(val);
  }
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

var ConnectionErrorProto = new Error("Connection error");
function ConnectionError(message, connection) {
  var err = Object.create(ConnectionErrorProto);
  err.message = message;
  err.connection = connection;
  return err;
}

//----------------------------------------------------------------------

/**
  @function isConnectionError
  @param {Error} [err]
  @return Boolean
  @summary Returns whether `err` is a bridge connection error
*/
exports.isConnectionError = function(e) {
  return ConnectionErrorProto.isPrototypeOf(e);
}

/**
   @class BridgeConnection
   
   @variable BridgeConnection.transport
   @variable BridgeConnection.api
*/
function BridgeConnection(transport, base_api, ignore_errors) {
  var pending_calls  = {}; // calls in progress, made to the other side
  var executing_calls = {}; // calls in progress, made to our side; call_no -> stratum
  var call_counter   = 0;
  var published_apis = {};
  var published_funcs = {};
  var published_func_counter = 0;
  var closed = false;

  if (base_api)
    published_apis[0] = base_api;

  var connection = {
    transport: transport,
    sent_blob_counter: 0, // counter for identifying data blobs (see marshalling above)
    received_blobs: {},
    sendBlob: function(id, obj) {
      transport.sendData(id, obj);
      return id;
    },
    makeCall: function(api, method, args) {
      var call_no = ++call_counter;
      waitfor {
        // initiate waiting for return value:
        waitfor (var rv, isException) {
          pending_calls[call_no] = resume;
        }
        retract {
          // make the call:
//          console.log('ISSUE RETRACTION');
          transport.send(marshall(['abort', call_no], connection));
        }
        finally {
          delete pending_calls[call_no];
        }
      }
      and {
        // make the call:
        transport.send(marshall(['call', call_no, api, method, toArray(args)], 
                                connection));
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
      transport.__finally__();
    },
  };

  function receiver() {
    while (1) {
      try {
        var packet = transport.receive();
      } catch(e) { 
        if(closed || ignore_errors === true) break;
        throw ConnectionError(e.message || String(e));
      }
      if (packet.type == 'message')
        receiveMessage(packet);
      else if (packet.type == 'data')
        receiveData(packet);
      else {
        logging.warn("Unknown packet '#{packet.type}' received");
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
      executing_calls[message[1]] = spawn (function(call_no, api_id, method, args) {
        // xxx asynchronize, so that executing_calls[call_no] will be filled in:
        hold(0);
        var isException = false;
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
        try {
          transport.send(marshall(["return#{isException? '_exception':''}", 
                                   call_no, rv],
                                  connection));
        }
        catch (e) {
          // transport closed -> ignore
          // XXX anything else we need to do?
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
  
  connection._ended = spawn receiver();
  return connection;
}

/**
   @function connect
   @summary To be documented
   @param {String} [api_name]
   @param {optional Function} [block]
   @return {::BridgeConnection}
   @desc
     **Note**: connecting to a server-side API does a require() on the
     module in the server's process. Currently there is no way to
     force the server to reload the module other than restarting the
     server process.
*/
exports.connect = function(api_name, block) {
  return exports.connectWith(null, api_name, block);
};

/**
   @function connectWith
   @summary To be documented
   @param {optional Transport|String} [transport|server] A transport object or server address
   @param {String} [api_name]
   @param {Function} [block]
   @return {::BridgeConnection}
*/
exports.connectWith = function(transport, api_name, block) {
  if (!transport || typeof transport != 'object') {
    transport = require('./aat-client').openTransport(transport);
  }  
  var connection = BridgeConnection(transport);

  // retrieve server api:
  // XXX we want the api_name to be relative to the current app's base; not
  // sure how that's going to work from the server-side (sys:resolve??)
  connection.api = connection.makeCall(0, 'getAPI', [api_name]);

  if (block) {
    using(connection) {
      waitfor {
        return block(connection);
      } or {
        connection._ended.waitforValue();
      }
    }
  }
  else return connection;
}

/**
   @function accept
   @summary To be documented
   @param {Function} [getAPI]
   @param {Transport} [transport]
   @return {::BridgeConnection}
*/
exports.accept = function(getAPI, transport) {
  var connection = BridgeConnection(transport, {getAPI:getAPI}, true);
  return connection;
};
