/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
  @summary Configuration helpers for LevelDB Service
  @hostenv xbrowser
  @nodoc
*/

// TODO: document

@ = require([
  'mho:std',
  'mho:surface/html',
  'mho:surface/components'
]);

exports.configui = function() {
  return   [
    @Div :: @TextField({
      name: 'path',
      label: 'Path to LevelDB DB directory on disk',
      help: `'\$configRoot/' will be substituted for the directory containing the config.mho file for this project.`
    })
  ];
};
