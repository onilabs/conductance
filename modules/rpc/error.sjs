/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
module.setCanonicalId('mho:rpc/error');

@type = require('sjs:type');

__js {

  var TRANSPORT_ERROR_TOKEN = @type.Token(module, 'error', 'generic');

  exports.TransportError = function(message) {
    var err = new Error(message);
    err[TRANSPORT_ERROR_TOKEN] = true;
    return err;
  };

  exports.markAsTransportError = function(err) {
    err[TRANSPORT_ERROR_TOKEN] = true;
    return err;
  };
  
  exports.isTransportError = function(e) {
    return e && e[TRANSPORT_ERROR_TOKEN] === true;
  };

} // __js
