@bridge = require('mho:rpc/bridge');
var msg = "Authentication error";
var AuthenticationError = exports.AuthenticationError = function() {
  var rv = new Error(msg);
  rv.authenticationError = true;
  rv .. @bridge.setMarshallingProperties(['authenticationError']);
  return rv;
}

exports.isAuthenticationError = e -> e.authenticationError === true;
