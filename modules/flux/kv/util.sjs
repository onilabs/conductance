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

/**
   @nodoc
 */
@ = require(['sjs:std','sjs:bytes']);

__js {
  function bytesToString(x) {

    if (@isBuffer(x)) { 
      return x.toString('binary'); }
    // else ... old hex string method:

    var out = new Array(x.length);
    for (var i = 0; i < x.length; ++i) {
      var s = x[i].toString(16);
      if (s.length === 1) {
        s = "0" + s;
      }
      out[i] = s;
    }
    return out.join('');
  }
  exports.bytesToString = bytesToString;

  function transformKeyRange(range, f) {
    return {
      begin: f(range.begin),
      end: f(range.end)
    };
  }
  exports.transformKeyRange = transformKeyRange;  
} // __js
