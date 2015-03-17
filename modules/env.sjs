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
  @summary Application environment
  @desc
    This module is actually a [sjs:service::Registry] object. In
    a web browser, that's all it is - an empty shell to be
    used as you wish.

    In a nodejs environment, it contains a number of additional
    properties:

  @require sjs:service
*/

if (require('builtin:apollo-sys').hostenv === 'xbrowser') {
  module.exports = require('sjs:service').Registry();
} else {

  /**
    @variable executable
    @hostenv nodejs
    @summary String containing the full path to the `conductance` executable

    @variable conductanceRoot
    @hostenv nodejs
    @summary String containing the full path to the conductance root directory

    @function conductanceVersion
    @hostenv nodejs
    @summary Returns the current conductance version string

    @function compilerStamp
    @hostenv nodejs
    @summary Returns the current sjs compiler version

    @variable sjsRoot
    @hostenv nodejs
    @summary String containing the full path to the StratifiedJS root directory

    @function configPath
    @hostenv nodejs
    @summary Returns the full path to the config file which was used to start conductance (`undefined` if conductance was started without a config file, as in e.g. `conductance shell`)

    @function configRoot
    @hostenv nodejs
    @summary Returns the full path to the directory containing the config file which was used to start conductance (`undefined` if conductance was started without a config file, as in e.g. `conductance shell`)

  */
  module.exports = require('./server/env');
}

