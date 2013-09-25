/**
   @module db/gcd/backend
   @summary API for accessing the [Google Cloud Datastore](https://developers.google.com/datastore/)
   @desc
     **Notes** 

     * Uses the [google-oauth-jwt library](https://github.com/extrabacon/google-oauth-jwt) 
       for obtaining access tokens.

     * Uses version [v1beta1](https://developers.google.com/datastore/docs/apis/v1beta1/) of 
       the Google Cloud Datastore API.

     **Notes on protobuf-json mapping**

     This module uses [protocol buffers](https://code.google.com/p/protobuf/) 
     to communicate with the Google Cloud Datastore. The mapping between
     json objects and protocol buffers is performed by the 
     [protobuf library](https://github.com/chrisdew/protobuf) using the 
     datastore schema [here](./protobuf/datastore_v1.proto).
     For more information and examples on how json objects equate to their
     corresponding entities in the schema, see [protobuf-for-node](https://code.google.com/p/protobuf-for-node/). The basic idea is that that all names 
     appearing in the schema will be camel-cased in JS, e.g.: 
     title_string -> titleString. 
     Furthermore 'repeated' elements map to arrays in JS.
     
*/

var { override } = require('sjs:object');
var { request } = require('sjs:http');
var { TokenCache } = require('google-oauth-jwt');
var { HttpsAgent } = require('agentkeepalive');

var keepaliveAgent = new HttpsAgent({
  maxSockets: 20,
  maxKeepAliveRequests: 0, // == unbounded
  maxKeepAliveTime: 30000 // keep alive for 30 seconds
});

// authentication token cache:
var tokens = new TokenCache(); 

// initialize protobuf marshalling:
// we use protobufs instead of json because e.g. 
// the local development server doesn't have a json option. 
var { Schema } = require('protobuf');
var { readFile } = require('sjs:nodejs/fs');
var { read:readStream } = require('sjs:nodejs/stream');
var { normalize, toPath } = require('sjs:url');

var datastore_schema = new Schema(readFile('./protobuf/datastore_v1.desc' .. normalize(module.id) .. toPath));

/**
   @class Context
   @summary Context for accessing the [Google Cloud Datastore](https://developers.google.com/datastore/).
*/

var ContextProto = {
  /**
     @function Context.allocateIds
     @param {Object} [req] "AllocateIdsRequest" message
     @return {Object} "AllocateIdsResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [db/gcd/backend::] module description.
  */
  allocateIds: function(req) {
    return this._request(
      'allocateIds', 
      datastore_schema['api.services.datastore.AllocateIdsRequest'].serialize(req),
      datastore_schema['api.services.datastore.AllocateIdsResponse']      
    );
  },
  
  /**
     @function Context.blindWrite
     @param {Object} [req] "BlindWriteRequest" message
     @return {Object} "BlindWriteResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [db/gcd/backend::] module description.
  */
  blindWrite: function(req) { //console.log(require('sjs:debug').inspect(req, false, 10));
    return this._request(
      'blindWrite', 
      datastore_schema['api.services.datastore.BlindWriteRequest'].serialize(req),
      datastore_schema['api.services.datastore.BlindWriteResponse']
    );
  },

  /**
     @function Context.lookup
     @param {Object} [req] "LookupRequest" message
     @return {Object} "LookupResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [db/gcd/backend::] module description.
   */
  lookup: function(req) {
    return this._request(
      'lookup', 
      datastore_schema['api.services.datastore.LookupRequest'].serialize(req),
      datastore_schema['api.services.datastore.LookupResponse']
    );
  },

  /**
     @function Context.runQuery
     @param {Object} [req] "RunQueryRequest" message
     @return {Object} "RunQueryResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [db/gcd/backend::] module description.
  */
  runQuery: function(req) {
//    console.log(require('sjs:debug').inspect(datastore_schema['api.services.datastore.RunQueryRequest'].serialize(req) ..
//                datastore_schema['api.services.datastore.RunQueryRequest'].parse, false, 10));

    return this._request(
      'runQuery', 
      datastore_schema['api.services.datastore.RunQueryRequest'].serialize(req),
      datastore_schema['api.services.datastore.RunQueryResponse']
    );
  },

  
  /**
     @function Context.withTransaction
     @altsyntax context.withTransaction([isolationLevel]) { |transaction| ... }
     @param {optional String} [isolationLevel='SNAPSHOT'] One of 'SNAPSHOT' or 'SERIALIZABLE'.
     @param {Function} [block] 
     @summary Execute *block* with a new [::Transaction] object. The transaction will automatically be rolled back if there is an error during committing.
  */
  withTransaction: function(/* [isolationLevel], block*/) {
    var isolationLevel, block;
    if (arguments.length == 1) {
      block = arguments[0];
    }
    else {
      [isolationLevel, block] = arguments;
    }
    if (!isolationLevel) 
      isolationLevel = 'SNAPSHOT';

    var context = this;
    var transaction_id = context._request(
      'beginTransaction', 
      datastore_schema['api.services.datastore.BeginTransactionRequest'].serialize({ isolationLevel: isolationLevel}),
      datastore_schema['api.services.datastore.BeginTransactionResponse']
    ).transaction;

    var committed = false;

    /**
       @class Transaction
       @summary Google Cloud Datastore Transaction Context
    */
    var transaction = {
      /**
         @function Transaction.lookup
         @param {Object} [req] "LookupRequest" message
         @return {Object} "LookupResponse" message
         @summary Same as [::Context::lookup], but in the context of a 
         transaction. The transaction id will automatically be spliced 
         into the request.
      */
      lookup: function(req) {
        if (!req.readOptions) req.readOptions = {};
        req.readOptions.transaction = transaction_id;
        return context.lookup(req);
      },
      /**
         @function Transaction.runQuery
         @param {Object} [req] "RunQueryRequest" message
         @return {Object} "RunQueryResponse" message
         @summary Same as [::Context::runQuery], but in the context of a 
         transaction. The transaction id will automatically be spliced 
         into the request.
      */
      runQuery: function(req) {
        if (!req.readOptions) req.readOptions = {};
        req.readOptions.transaction = transaction_id;
        return context.runQuery(req);
      },
      /**
         @function Transaction.commit
         @param {Object} [req] "CommitRequest" message
         @return {Object} "CommitResponse" message
         @desc
         Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [db/gcd/backend::] module description.
       */
      commit: function(req) {
        if (committed) throw new Error('Transaction already committed');
        req.transaction = transaction_id;
        var rv = context._request(
          'commit', 
          datastore_schema['api.services.datastore.CommitRequest'].serialize(req),
          datastore_schema['api.services.datastore.CommitResponse']);
        committed = true;
        return rv;
      }
    }

    try {
      block(transaction);
    }
    finally {
      if (!committed) {
        console.log("rolling back transaction");
        try {
          context._request(
            'rollback', 
            datastore_schema['api.services.datastore.RollbackRequest'].serialize({ transaction: transaction_id}));
        }
        catch (e) {
          console.log("Silently ignoring rollback error: #{e}");
        }
      }
    }
  }
};

/**
   @function Context
   @param {Object} [settings]
   @setting {String} [dataset] Identifies the dataset.
   @setting {Boolean} [devel=false] Use the local development server, with host and dataset taken from the environment, see [here](https://developers.google.com/datastore/docs/tools/devserver). *dataset*, *email*, *key*, *keyFile* and *delegatioEmail* will be ignored. 
   @setting {String} [email] The email address of the service account (required). This information is obtained via the API console.
   @setting {String} [key] Cryptographic key (contents of PEM file). The key will be used to sign the JWT for validation by Google OAuth. One of *key* or *keyFile* is required.
   @setting {String} [keyFile] Path to the PEM file to use for the cryptographic key. Ignored if *key* is also given. If *devel* is not set, One of *key* or *keyFile* is required.
   @setting {optional String} [delegationEmail] If access is being granted on behalf of someone else, specifies who is impersonating the service account
*/
function Context(attribs) {
  var dataset, req_f, req_base;
  if (attribs.devel) {
    // development mode, using the local development server as
    // specificed through the DATASTORE_DATASET/DATASTORE_HOST
    // environment vars

    dataset = process.env.DATASTORE_DATASET;
    if (!dataset) 
      throw new Error("Couldn't find DATASTORE_DATASET environment variable");
    req_base = process.env.DATASTORE_HOST || 'http://localhost:8080';

    req_f = request;
  }
  else {
    // production mode, using the google service

    dataset = attribs.dataset;
    req_f = function(url, opts) {
      // XXX convert this tokens.get() function to use SJS's request()
      waitfor(var err, token) {
        tokens.get(opts.jwt, resume);
      }
      if (err) throw new Error("Google Cloud Datastore Authentication Error: #{err}");
      opts.headers.authorization = "Bearer #{token}";
      return request(url, opts);
    }
    req_base = 'https://www.googleapis.com/';
    var jwt = {
      email: undefined,
      key: undefined,
      keyFile: undefined,
      delegationEmail: undefined,
//      debug: true
    } .. override(attribs);
    // xxx for some reason we always seem to require both of these
    // scopes, even though the docs say we need *one* of them
    jwt.scopes = ['https://www.googleapis.com/auth/datastore',
                  'https://www.googleapis.com/auth/userinfo.email'];
  }

  var rv = Object.create(ContextProto);

  // we deliberately define `_request` in the closure here and not on
  // the prototype so that we don't need to expose `attribs` on the
  // object
  rv._request = function(api_func, req_body, response_schema) {  
    var max_retries = 5; // make configurable
    var retries = 0;
    while (true) {
      var response = req_f(
        "#{req_base}/datastore/v1beta1/datasets/#{dataset}/#{api_func}",
        { 
          headers: {'Content-Type':'application/x-protobuf',
                    'Connection':'Keep-Alive'
                   },
          method: 'POST',
          encoding: null,
          body: req_body,
          jwt: jwt,
          response: 'raw',
          agent: keepaliveAgent,
          throwing: false
        }
      );

      // extract content into a buffer:
      var content = [];
      var data;
      while (data = readStream(response))
        content.push(data);
      content = Buffer.concat(content);
      
      if (response.statusCode !== 200) {
        if (response.statusCode >= 500 && retries < max_retries) {
          console.log("google-cloud-datastore backend #{response.statusCode}; retrying");
          // xxx should we have some backoff?
          ++retries;
          continue;
        }
        throw new DatastoreError(api_func, response, content);
      }
      
      return response_schema ? response_schema.parse(content);
    }
  };

  return rv;
}
exports.Context = Context;

/**
   @class DatastoreError
   @inherits Error
*/
function DatastoreError(func, response, content) {
  /**
     @var DatastoreError.func
  */
  this.func = func;
  /**
     @var DatastoreError.response
  */
  this.response = response;
  /**
     @var DatastoreError.statusCode
  */
  this.statusCode = response.statusCode;
  
  /**
     @var DatastoreError.type
  */
  this.type = response.statusCode >= 500 ? 'server' : 'client';

  /**
     @var DatastoreError.content
  */
  this.content = content;

  this.message = " Google Cloud Datastore #{this.type} failure calling '#{this.func}'. HTTP(#{this.statusCode}): #{this.content}";
}
DatastoreError.prototype = new Error();
exports.DatastoreError = DatastoreError;
