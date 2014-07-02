@ = require('sjs:std');

var InvalidToken = new Error("Invalid token");
InvalidToken.invalid_token = true;

var User = exports.User = function(id, nickname) {
  @assert.ok(id != null, "user id is null");
  this.id = id;
  this.nickname = nickname;
};

// TODO: actual authentication ;)
exports.getToken = function(username, password) {
  if (username !== password) {
    return null;
  }
  return {
    username: username,
    id: 123,
    ok: true,
  };
};

exports.authenticate = function(token) {
  var {id, ok, username} = token;
  if (!ok) {
    throw InvalidToken;
  }
  return new User(id, username);
}

exports.ANONYMOUS = new User('_local', null);
