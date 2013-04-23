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

