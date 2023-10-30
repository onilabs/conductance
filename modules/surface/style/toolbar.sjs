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
  'sjs:std',
  {id:'./helpers', name: 'helpers'}
]);

//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

var Toolbar = `
  .mho-appbar {
    position: fixed;
    width:100%;
    top:0;
    left:0;
    height: 56px;
    line-height:56px;
    z-index:1030;
    background-color: var(--mho-theme-primary);
    color: white;
    display: flex;
    flex-direction: row;
    ${@helpers.Elevation(4)}

    &__navicon {
      padding: 0 16px;
      width: 24px;
    }

    &__title {
      padding: 0 16px;
      font-size:20px;
      letter-spacing: 0.04em;
      font-weight: 500;
    }
  }
`;
exports.Toolbar = Toolbar;
