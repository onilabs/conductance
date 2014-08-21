@ = require('mho:std');
var { @User } = require('../auth/user');
@user = require('./user');
@crypto = require('nodejs:crypto');
@response = require('mho:server/response');
var { @alphanumeric } = require('../validate');

var serverRoot = @env.get('publicAddress')('master');
var verificationUrl = (user) -> serverRoot + "auth/verify/#{user.id .. @alphanumeric}/#{user.verifyCode() .. @alphanumeric}";
exports.verifyRoute = /^auth\/verify\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$/;
exports.verifyHandler = function(req, [_, uid, code]) {
  exports.verify(uid, code);
  req .. @response.writeRedirectResponse('/static/verified.html');
}

exports.initialUserProperties = function() {
  return {
    verifyCode: @crypto.randomBytes(8).toString("hex"),
    verified: false,
  };
};

exports.sendConfirmationTo = function(user) {
  @assert.ok(user instanceof @User);
  if(user.verified()) return;
  var email = user.email();
  var url = verificationUrl(user);
  @warn("TODO: email activation url #{url} to #{email}");
};

exports.verify = function(uid, code) {
  @assert.string(uid);
  @assert.string(code);
  @user.withUserById(uid) {|user, save|
    if(user.verified()) return true; // refresh maybe; that's fine
    if(user.verifyCode() === code) {
      user.merge({
        verifyCode: undefined,
        verified: true,
      }) .. save();
      return true;
    } else {
      return false;
    }
  }
};
