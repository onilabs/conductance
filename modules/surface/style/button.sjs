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

var Button = `
  /* default = flat button */
  .mho-button {
    display: inline-block;
    position: relative;
    min-width: 64px;
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 2px;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    line-height: 36px;
    text-align: center;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    box-sizing: border-box;
    -webkit-appearance: none;
    color: #000;
    letter-spacing: 0.04em;
    text-decoration: none;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transition: opacity 120ms ${@helpers.Animation_curve_fast_out_slow_in};
      border-radius: inherit;
      background: currentColor;
      content: "";
      opacity: 0;
    }

    &:focus::before, &:hover::before {
      transition: opacity 120ms ${@helpers.Animation_curve_linear_out_slow_in};
      opacity: .12;
    }
    &:active::before {
      transition: opacity 120ms ${@helpers.Animation_curve_linear_out_slow_in};
      opacity: .18;
    }
    &:focus:active::before {
      transition-timing-function: ${@helpers.Animation_curve_fast_out_slow_in};
    }
    &:active {
      outline: none;
    }
    &:hover {
      cursor: pointer;
    }
    &::-moz-focus-inner {
      padding: 0;
      border: 0;
    }

    &--dense {
      height: 32px;
      font-size: 13px;
      line-height: 32px;
    }

    &--compact {
      padding: 0 8px;
    }

    &--raised {
      min-width: 88px;
      ${@helpers.Elevation(2)}
      ${@helpers.ElevationTransition}
      &:active {
        ${@helpers.Elevation(8)};
      }
    }

    &--primary {
      color: var(--mho-theme-primary);

      &.mho-button--raised {
        background-color: var(--mho-theme-primary);
        color: #fff;
      }
    }

    &--accent {
      color: var(--mho-theme-accent);
      
      &.mho-button--raised {
        background-color: var(--mho-theme-accent);
        color: #fff;
      }
    }

    &:disabled {
      color: rgba(0, 0, 0, .26);
      cursor: default;
      pointer-events: none;
    }

    &--raised:disabled {
      ${@helpers.Elevation(0)};
      background-color: rgba(0,0,0,.12);
      pointer-events: none;
    }    
  }
`;
exports.Button = Button;
