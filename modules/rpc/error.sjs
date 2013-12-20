/* (c) 2013 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

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
