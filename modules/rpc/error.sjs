/** @nodoc */
var TransportErrorProto = new Error();
exports.TransportError = function(message, connection) {
  var err = Object.create(TransportErrorProto);
  err.message = message;
  err.connection = connection;
  return err;
}

exports.isTransportError = function(e) {
  return TransportErrorProto.isPrototypeOf(e);
}
