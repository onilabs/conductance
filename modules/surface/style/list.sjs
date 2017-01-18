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

var List = `
  .mho-list {
    color: rgba(0,0,0,.87);
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
    letter-spacing: .04em;

    margin: 0;
    padding: 8px 16px 0;

    list-style-type: none;
  }

  .mho-list-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 48px;
  }
`;
exports.List = List;
