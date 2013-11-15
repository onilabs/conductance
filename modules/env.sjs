/**
  @summary Application environment
  @desc
    This module is actually a [sjs:service::Registry] object. In
    a web browser, that's all it is - an empty shell to be
    used as you wish.

    In a nodejs environment, it contains a number of additional
    properties:
*/

if (require('builtin:apollo-sys').hostenv === 'xbrowser') {
  module.exports = require('sjs:service').Registry();
} else {

  /**
    @variable executable
    @hostenv nodejs
    @summary The full path to the `conductance` executable

    @variable conductanceRoot
    @hostenv nodejs
    @summary The full path to the conductance root directory

    @function conductanceVersion
    @hostenv nodejs
    @summary Returns the current conductance version string

    @variable sjsRoot
    @hostenv nodejs
    @summary The full path to the StratifiedJS root directory
  */
  module.exports = require('./server/env');
}

