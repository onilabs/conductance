@ = require('sjs:std');
var auth = require('../auth');

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
User.prototype.toString = function() {
  return "User(#{this.id}, #{this.nickname})";
};
