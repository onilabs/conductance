var { debug, info, verbose } = require('sjs:logging');
var { Constructor } = require('sjs:object');
var assert = require('sjs:assert');
var { sanitize } = require('sjs:string');
var { mapQuasi } = require('sjs:quasi');
var { collapseHtmlFragment } = require('../surface/base');

var HttpErrorProto = new Error();
HttpErrorProto._init = function(code, statusText, description) {
  assert.number(code, "HttpError code");
  assert.optionalString(statusText);
  this.code = code;
  this.statusText = statusText;
  this.description = description;
  // TODO: is this legit?
  Error.call(this, "HTTP #{this.code}: #{this.statusText}");
};

HttpErrorProto.writeTo = function(req) {
  req .. writeErrorResponse(this.code, this.statusText, this.description);
};

/**
  @class HttpError
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

function setStatus(req, code /*, ... */) {
  info("#{req.url} #{code}");
  req.response.writeHead.apply(req.response, 
                               Array.prototype.slice.call(arguments,1));
}
exports.setStatus = setStatus;

function writeRedirectResponse(req, location, status) {
  if (!status) status = 302; // moved temporarily
  var resp = "<html><head><title>"+status+" Redirect</title></head>";
  resp += "<body><h4>"+status+" Redirect</h4>";
  resp += "The document can be found at <a href='"+location+"'>"+location+"</a>.";
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
