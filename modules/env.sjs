if (require('builtin:apollo-sys').hostenv === 'xbrowser') {
  module.exports = require('sjs:service').Registry();
} else {
  module.exports = require('./server/env');
}

