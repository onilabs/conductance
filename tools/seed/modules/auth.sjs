var msg = "Authentication error";
var AuthenticationError = exports.AuthenticationError = function() {
  var rv = new Error(msg);
  return rv;
}

// NOTE: this is deliberately weak, otherwise we'd have to do
// something more fancy to ensure attributes get persisted across the bridge:
exports.isAuthenticationError = e -> e.message === msg;
//exports.isAuthenticationError = e -> e.authentication_error === true;
