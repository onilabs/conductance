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

var Drawer = `
  .mho-permanent-drawer {
    background-color: var(--mho-theme-background);
    border-right: 1px solid #e4e4e4;
    display: inline-flex;
    flex-direction: column;
    width: 240px;
    box-sizing: border-box;
    overflow: hidden;


    .mho-list-group,
    .mho-list {
      padding-right: 0;
      padding-left: 0;
    }

    .mho-list-item {
      position: relative;
      padding: 0 16px;
      outline: none;
      color: inherit;
      text-decoration: none;

      font-size: 14px;
      line-height: 24px;
      font-weight: 500;
      letter-spacing: .04em;

      &.mho-list-item--selected {
        color: var(--mho-theme-primary);
      }

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition: opacity 120ms ${@helpers.Animation_curve_fast_out_linear_in}; /* XXX should this be slow_in? */
        border-radius: inherit;
        background: currentColor;
        content:"";
        opacity: 0;
      }
      &:focus::before, &:hover::before, &.mho-list-item--selected::before {
        transition: opacity 180ms ${@helpers.Animation_curve_linear_out_slow_in}; /* XXX should this be fast_out? */
        opacity: .12;
      }
      &:active::before {
        transition: opacity 180ms ${@helpers.Animation_curve_linear_out_slow_in}; /* XXX should this be fast_out? */
        opacity: .18;
      }
      &:active:focus::before {
        transition-timing-function: ${@helpers.Animation_curve_fast_out_slow_in}; 
      }

    }

  }
`;
exports.Drawer = Drawer;
