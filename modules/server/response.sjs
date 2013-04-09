var { debug, info, verbose } = require('sjs:logging');

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
  resp += "The document can be found <a href='"+location+"'>"+location+"</a>.";
  resp += "<hr>Oni Conductance Server</body></html>";
  req .. setStatus(status, { "Content-Type":"text/html", "Location":location});
  req.response.end(resp);
}
exports.writeRedirectResponse = writeRedirectResponse;

function writeErrorResponse(req, status, title, text) {
  text = text || title;
  var resp = "<html><head><title>"+status+" "+title+"</title></head>";
  resp += "<body><h4>"+status+" "+title+"</h4>";
  resp += text;
  resp += "<hr>Oni Conductance Server</body></html>";
  req .. setStatus(status, title, { "Content-Type":"text/html" });
  req.response.end(resp);
}
exports.writeErrorResponse = writeErrorResponse;