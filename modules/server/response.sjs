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
  @summary Utilities for generating and handling HTTP responses
*/

var { debug, info, verbose } = require('sjs:logging');
var { Constructor, ownPropertyPairs } = require('sjs:object');
var { each } = require('sjs:sequence');
var assert = require('sjs:assert');
var { sanitize } = require('sjs:string');
var { mapQuasi } = require('sjs:quasi');
var { pump } = require('sjs:nodejs/stream');
var { collapseHtmlFragment } = require('../surface/base');

var HttpErrorProto = new Error();
HttpErrorProto._init = function(code, statusText, description) {
  assert.number(code, "HttpError code");
  assert.optionalString(statusText);
  this.code = code;
  this.statusText = statusText;
  this.description = description;
  this.message = "HTTP #{this.code}: #{this.statusText}";
};

HttpErrorProto.writeTo = function(req) {
  req .. writeErrorResponse(this.code, this.statusText, this.description);
};

/**
  @class HttpError
  @summary HTTP error object
  @constructor HttpError
  @nonew
  @param {Number} [code]
  @param {optional String} [statusText]
  @param {optional String} [description]
*/
var HttpError = exports.HttpError = Constructor(HttpErrorProto);

/**
  @function isHttpError
  @param {Error} [error]
  @return {Boolean}
  @summary returns whether `error` is a [::HttpError].
*/
var isHttpError = exports.isHttpError = (e) -> HttpErrorProto.isPrototypeOf(e);

/**
  @function NotFound
  @param {optional String} [statusText]
  @param {optional String} [description]
  @return {::HttpError}
  @summary Shortcut for constructing a [::HttpError] with status code `404`.
*/
exports.NotFound = (msg, desc) -> HttpError(404, msg || "File not found", desc);

/**
  @function ServerError
  @param {optional String} [statusText]
  @param {optional String} [description]
  @return {::HttpError}
  @summary Shotrcut for constructing a [::HttpError] with status code `500`.
*/
exports.ServerError = (msg, desc) -> HttpError(500, msg || "Internal Server Error", desc);
// TODO: add more of these


//----------------------------------------------------------------------
// response helpers

/**
  @function setStatus
  @param {sjs:nodejs/http::ServerRequest} [request]
  @param {Number} [code] HTTP status code
  @param {optional String} [reasonPhrase]
  @param {optional Object} [headers]
  @summary Calls [writeHead](http://nodejs.org/api/http.html#http_response_writehead_statuscode_reasonphrase_headers) on the underlying response.
*/
function setStatus(req, code, reason, headers) {
  if(headers && !reason) throw new Error("blank `reasonPhrase` provided (you should omit this argument)");
  req.response.writeHead.apply(req.response, Array.prototype.slice.call(arguments,1));
}
exports.setStatus = setStatus;

/**
  @function send
  @param {optional Object} [settings]
  @setting {Number} [status=200]
  @setting {Object} [headers]
  @setting {String} [statusText]
  @param {String|Buffer|sjs::sequence::Sequence} [body]
  @summary Writes (and ends) an entire response, including headers & body.
*/
var send = exports.send = function send(req, options, body) {
  if(arguments.length === 2) {
    body = options;
    options = null;
  }
  if(!options) options = {};
  var status = options.status || 200;
  var headers = options.headers || null;
  var statusText = options.statusText;
  if(statusText) {
    req.response.writeHead(status, statusText, headers);
  } else {
    req.response.writeHead(status, headers);
  }
  if(body) pump(body, req.response);
  else req.response.end();
}

/**
  @function setHeader
  @param {sjs:nodejs/http::ServerRequest} [request]
  @param {String} [key]
  @param {String} [value]
  @summary Set a response header
*/
var setHeader = exports.setHeader = function setHeader(req, key, val) {
  req.response.setHeader(key, val)
}

/**
  @function setDefaultHeader
  @param {sjs:nodejs/http::ServerRequest} [request]
  @param {String} [key]
  @param {String} [value]
  @summary Set a response header (if not already set)
*/
var setDefaultHeader = exports.setDefaultHeader = function setDefaultHeader(req, key, val) {
  if (req.response.getHeader(key) == null) {
    req.response.setHeader(key, val)
  }
}

/**
  @function writeRedirectResponse
  @param {sjs:nodejs/http::ServerRequest} [request]
  @param {String} [location]
  @param {optional Number} [status=302]
  @summary Write a redirect response
*/
function writeRedirectResponse(req, location, status) {
  if (!status) status = 302; // moved temporarily
  var resp = "<html><head><title>"+status+" Redirect</title></head>";
  var locationHtml = sanitize(location);
  resp += "<body><h4>"+status+" Redirect</h4>";
  resp += "The document can be found at <a href='"+locationHtml+"'>"+locationHtml+"</a>.";
  resp += "<hr>Oni Conductance Server</body></html>";
  req .. setStatus(status, { "Content-Type":"text/html", "Location":location});
  req.response.end(resp);
}
exports.writeRedirectResponse = writeRedirectResponse;

function writeErrorResponse(req, status, title, text) {
  req .. setStatus(status, title, { "Content-Type":"text/html" });

  text = text || title;
  var resp = (
    `<html><head><title>$status $title</title></head>
      <body>
        <h4>$status $title</h4>
        $text
        <hr>
        Oni Conductance Server
      </body>
    </html>` .. collapseHtmlFragment()).getHtml();
  req.response.end(resp);
}
exports.writeErrorResponse = writeErrorResponse;
