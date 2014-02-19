/* (c) 2013-2014 Oni Labs, http://onilabs.com
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

var sjcl   = require('sjs:sjcl');
var buffer = require('nodejs:buffer');
var crypto = require('nodejs:crypto');

while (!sjcl.random.isReady()) {
  //console.log(new Date() + ' adding entropy to random number generator');
  waitfor(var err, buf) {
    crypto.randomBytes(128, resume);
  }
  if (err) {
    // Rarely fails, but the docs say it can
    // when there is insufficient entropy.
    console.warn("Error seeding RNG: #{err.message}");
    hold(1000);
  } else {
    sjcl.random.addEntropy(buf.toString('hex'), 1024);
  }
}

exports.createID = function(words) {
  words = words || 4;
  return sjcl.codec.base64.fromBits(sjcl.random.randomWords(words), true).replace(/\//g,'_').replace(/\+/g, '-');
};

