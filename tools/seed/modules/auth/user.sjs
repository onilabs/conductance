@ = require('sjs:std');
@bridge = require('mho:rpc/bridge');

function prop(key) {
  return function(dfl){
    if(arguments.length == 0) {
      return this.props .. @get(key);
    } else {
      return this.props .. @get(key, dfl);
    }
  }
}

/** NOTE:
 *  the presence of a User object infers
 *  that user's authority - you should not create this
 *  object manually unless required by some task
 *  with ambient authority
 */
var User = exports.User = function(id, props) {
  @assert.ok(id != null, "user id is null");
  this.id = id;
  this.props = props;
};

;['email', 'name', 'verifyCode', 'verified', 'tokens'] .. @each {|key|
  User.prototype[key] = prop(key);
}

User.prototype.merge = function(p) {
  // returns a copy
  var props = this.props .. @clone();
  p .. @ownPropertyPairs .. @each {|[k,v]|
    if(v === undefined) {
      delete props[v];
    } else {
      props[k] = v;
    }
  }
  return new User(this.id, props);
}

User.prototype .. @bridge.setMarshallingDescriptor({
  wrapLocal: function() { throw new Error("Unserializable"); },
  wrapRemote: ['sjs:assert','fail'],
});

User.prototype.toString = function() {
  return "User(#{this.id}, #{this.name(null)})";
};

