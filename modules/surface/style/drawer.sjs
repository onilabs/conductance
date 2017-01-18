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

@ = require([
  'sjs:std',
  {id:'./helpers', name: 'helpers'}
]);

//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

var Drawer = `
  .mho-permanent-drawer {
    background-color: var(--mho-theme-background);
    border-right: 1px solid #e4e4e4;
    display: inline-flex;
    flex-direction: column;
    width: 240px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
`;
exports.Drawer = Drawer;
