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
   @nodoc
   @hostenv nodejs
   @summary API for accessing the [Google Cloud Datastore](https://developers.google.com/datastore/)
   @desc
     **Notes**

     * Uses the [google-oauth-jwt library](https://github.com/extrabacon/google-oauth-jwt) 
       for obtaining access tokens.

     * Uses version [v1beta2](https://developers.google.com/datastore/docs/apis/v1beta2/) of 
       the Google Cloud Datastore API.
     
*/

@ = require('sjs:logging');
var { override, get, extend } = require('sjs:object');
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

var { readAll } = require('sjs:nodejs/stream');

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
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [./backend::] module description.
  */
  allocateIds: function(req) {
    return this._request('allocateIds', req .. extend({mode:'TRANSACTIONAL'}));
  },
  
  /**
     @function Context.blindWrite
     @param {Object} [req] "BlindWriteRequest" message
     @return {Object} "BlindWriteResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [./backend::] module description.
  */
  blindWrite: function(req) { //console.log(require('sjs:debug').inspect(req, false, 10));
    return this._request('commit', req .. extend({mode:'NON_TRANSACTIONAL'}));
  },

  /**
     @function Context.lookup
     @param {Object} [req] "LookupRequest" message
     @return {Object} "LookupResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [./backend::] module description.
   */
  lookup: function(req) {
    return this._request('lookup', req);
  },

  /**
     @function Context.runQuery
     @param {Object} [req] "RunQueryRequest" message
     @return {Object} "RunQueryResponse" message
     @desc
       Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [./backend::] module description.
  */
  runQuery: function(req) {
//    console.log(require('sjs:debug').inspect(datastore_schema['api.services.datastore.RunQueryRequest'].serialize(req) ..
//                datastore_schema['api.services.datastore.RunQueryRequest'].parse, false, 10));

    return this._request('runQuery', req);
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
    var transaction_id = context._request('beginTransaction', {isolationLevel:isolationLevel}).transaction;

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
         Note: For details on the request and response object, see the corresponding message definitions in the [datastore schema](./protobuf/datastore_v1.proto) and consult the notes on protobuf-json mapping in the [./backend::] module description.
       */
      commit: function(req) {
        if (committed) throw new Error('Transaction already committed');
        req.transaction = transaction_id;
        var rv = context._request('commit', req);
        committed = true;
        return rv;
      }
    }

    try {
      block(transaction);
    }
    finally {
      if (!committed) {
        @verbose("rolling back transaction");
        try {
          context._request('rollback',{ transaction: transaction_id});
        }
        catch (e) {
          @verbose("Silently ignoring rollback error: #{e}");
        }
      }
    }
  }
};

/**
   @function Context
   @param {Object} [settings]
   @setting {String} [dataset] Identifies the dataset.
   @setting {Boolean} [devel=false] Use the local development server.   
   @setting {String} [email] The email address of the service account (required). This information is obtained via the API console.
   @setting {String} [key] Cryptographic key (contents of PEM file). The key will be used to sign the JWT for validation by Google OAuth. One of *key* or *keyFile* is required.
   @setting {String} [keyFile] Path to the PEM file to use for the cryptographic key. Ignored if *key* is also given. If *devel* is not set, One of *key* or *keyFile* is required.
   @setting {optional String} [delegationEmail] If access is being granted on behalf of someone else, specifies who is impersonating the service account
   @desc
      If `devel` is set to true, `email`, `key`, `keyFile` and
      `delegationEmail` will be ignored, and instead of connecting to
      the web service, the backend will connect to the url specified
      by the DATASTORE_HOST environment variable (or
      http://localhost:8080 if not specified) and
      if a DATASTORE_DATASET variable is set it will override `dataset`
*/
function Context(attribs) {
  var dataset, req_f, req_base;
  if (attribs.devel) {
    // development mode, using the local development server as
    // specificed through the DATASTORE_DATASET/DATASTORE_HOST
    // environment vars

    dataset = process.env.DATASTORE_DATASET || attribs.dataset;
    req_base = process.env.DATASTORE_HOST || 'http://localhost:8080';
    @verbose("Google Cloud Datastore backend running from #{req_base}, dataset: #{dataset}");

    req_f = request;
  }
  else {
    // production mode, using the google service
    var jwt = {
      email: undefined,
      key: undefined,
      keyFile: undefined,
      delegationEmail: undefined,
      debug: true
    } .. override(attribs);
    // xxx for some reason we always seem to require both of these
    // scopes, even though the docs say we need *one* of them
    jwt.scopes = ['https://www.googleapis.com/auth/datastore',
                  'https://www.googleapis.com/auth/userinfo.email'];

    dataset = attribs .. get('dataset');
    req_f = function(url, opts) {
      // XXX convert this tokens.get() function to use SJS's request()
      waitfor(var err, token) {
        tokens.get(jwt, resume);
      }
      if (err) throw new Error("Google Cloud Datastore Authentication Error: #{err}");
      opts.headers.authorization = "Bearer #{token}";
      opts.agent = keepaliveAgent;
      return request(url, opts);
    };
    req_base = 'https://www.googleapis.com/';
  }

  var rv = Object.create(ContextProto);

  // we deliberately define `_request` in the closure here and not on
  // the prototype so that we don't need to expose `attribs` on the
  // object
  rv._request = function(api_func, req_body) {  
    var max_retries = 10; // make configurable
    var retries = 0;
    //console.log("#{req_base}/datastore/v1beta2/datasets/#{dataset}/#{api_func}");
    // console.log(req_body .. JSON.stringify());//null, '    '));
    req_body = req_body .. JSON.stringify;
    while (true) {
      var response = req_f(
        "#{req_base}/datastore/v1beta2/datasets/#{dataset}/#{api_func}",
        { 
          headers: {'Content-Type':'application/json',
                    'Connection':'Keep-Alive'
                   },
          method: 'POST',
          body: req_body,
          response: 'raw',
          throwing: false
        }
      );

      // extract content into a buffer:
      var content = readAll(response, 'utf8');
      console.log(response.req._headers);

      if (response.statusCode !== 200) {

        if (response.statusCode == 0)
          @info("google-cloud-datastore backend: #{response.error}"); 

        if (api_func !== 'commit' && // for transaction commits we need to fall through and execute the whole transaction again
          (response.statusCode >= 500 || // server error
             response.statusCode == 409 || // too much contention (should only happen for commits)
             response.statusCode == 0) && 
            retries < max_retries) {
          @verbose("google-cloud-datastore backend #{response.statusCode}; retrying");
          // xxx should we have some backoff?
          ++retries;
          continue;
        }
        throw new DatastoreError(api_func, response, content, req_body);
      }
      return JSON.parse(content);
    }
  };

  return rv;
}
exports.Context = Context;

/**
   @class DatastoreError
   @summary Datastore Error
   @inherit Error
*/
function DatastoreError(func, response, content, req_body) {
  /**
     @variable DatastoreError.func
  */
  this.func = func;
  /**
     @variable DatastoreError.response
  */
  this.response = response;
  /**
     @variable DatastoreError.statusCode
  */
  this.statusCode = response.statusCode;
  
  /**
     @variable DatastoreError.type
  */
  this.type = response.statusCode >= 500 ? 'server' : 'client';

  /**
     @variable DatastoreError.content
  */
  this.content = content;

  this.message = " Google Cloud Datastore #{this.type} failure calling '#{this.func}'. HTTP(#{this.statusCode}): #{this.content} (request body size: #{(req_body||'').length/1024}kB)";
}
DatastoreError.prototype = new Error();
exports.DatastoreError = DatastoreError;
