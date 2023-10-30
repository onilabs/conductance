/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
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

@ = require([
  'sjs:std'
]);

//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

var Color = `
  .mho-color--primary         { color: rgba(0, 0, 0, .87); }
  .mho-color--secondary       { color: rgba(0, 0, 0, .54); }
  .mho-color--primary-inverse { color: rgba(255, 255, 255, 1); }
  .mho-color--secondary-inverse { color: rgba(255, 255, 255, .7); }
`;
exports.Color = Color;
