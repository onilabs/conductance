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

/**
  @nodoc
*/

var sjcl   = require('sjs:sjcl');
var fs     = require('sjs:nodejs/fs');
var buffer = require('nodejs:buffer');

var f = fs.open('/dev/random', 'r');
var buf = new (buffer.Buffer)(128);
while (!sjcl.random.isReady()) {
//  console.log('adding entropy to random number generator');
  fs.read(f, buf, 0, 128);
  sjcl.random.addEntropy(buf.toString('hex'), 1024);
}
fs.close(f);

exports.createID = function(words) {
  words = words || 4;
  return sjcl.codec.base64.fromBits(sjcl.random.randomWords(words), true).replace(/\//g,'_').replace(/\+/g, '-');
};

