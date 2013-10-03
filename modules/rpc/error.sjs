/** @nodoc */
var ConnectionErrorProto = new Error("Connection error");
exports.ConnectionError = function(message, connection) {
  var err = Object.create(ConnectionErrorProto);
  err.message = message;
  err.connection = connection;
  return err;
}

exports.isConnectionError = function(e) {
  return ConnectionErrorProto.isPrototypeOf(e);
}
