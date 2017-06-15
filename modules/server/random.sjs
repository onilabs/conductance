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
  @summary Cryptographically strong random number utilities
  @hostenv nodejs
  @deprecated Use module sjs:crypto
*/

var sjcl   = require('sjs:sjcl');
var crypto = require('sjs:crypto');

/**
   @function createID
   @deprecated Use sjs:crypto::randomID
   @summary Create a cryptographically strong ID
   @param {optional Integer} [words=4] Number of 32bit random words to use for constructing the id 
   @return {String}
   @desc
     * The returned string is the base64 encoding of `words` 32bit random numbers.
     * The character set used for the encoding is `A`-`Z`, `a`-`z`, `0`-`9`, `-`, `_`.
*/
exports.createID = crypto.randomID;

