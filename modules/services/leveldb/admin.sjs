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
  @summary Configuration helpers for LevelDB Service
  @hostenv xbrowser
*/

@ = require(['mho:std', 'mho:app']);

exports.configui = function() {
  return   [
             @field.Field('path') ::
               @FormGroup ::
                 [
                   @ControlLabel('Path to LevelDB DB directory on disk'),
                   @Input(),
                   @P() .. @Class('help-block') ::
                   `'\$configRoot/' will be substituted for the directory containing the config.mho file for this project.`
                 ]
           ]
};
