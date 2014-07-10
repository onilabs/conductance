@ = require('sjs:std');

var msg = "Authentication error";
var AuthenticationError = exports.AuthenticationError = function() {
  var rv = new Error(msg);
  return rv;
}

// NOTE: this is deliberately weak, otherwise we'd have to do
// something more fancy to ensure attributes get persisted across the bridge:
exports.isAuthenticationError = e -> e.message === msg;
//exports.isAuthenticationError = e -> e.authentication_error === true;

/** NOTE:
 *  the presence of a User object infers
 *  that user's authority - you should not create this
 *  object manually unless required by some task
 *  with ambient authority
 */
var User = exports.User = function(id, nickname) {
  @assert.ok(id != null, "user id is null");
  this.id = id;
  this.nickname = nickname;
};
