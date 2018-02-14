/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
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
@ = require('sjs:std');

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

  function normalizeKey(key) {
    if (Array.isArray(key)) {
      return key ..@flatten;
    } else {
      return [key];
    }
  }
  exports.normalizeKey = normalizeKey;


  function transformKeyRange(range, f) {
    if (typeof range === 'object' && !Array.isArray(range)) {
      return {
        begin: f(range.begin),
        end: (range.end !== undefined ? f(range.end) : range.end)
      };
    } else {
      return f(range);
    }
  }
  exports.transformKeyRange = transformKeyRange;
  
  function normalizeKeyRange(range) {
    return transformKeyRange(range, normalizeKey);
  };
  exports.normalizeKeyRange = normalizeKeyRange;
} // __js
