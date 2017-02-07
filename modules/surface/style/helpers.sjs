/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
  'sjs:std'
]);

//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

////////////////////////////////////////////////////////////////////////
// Animation

/*
Standard curve; any animations that are visible from start to finish (e.g. a FAB transforming into a toolbar)
*/
var Animation_curve_fast_out_slow_in = exports.Animation_curve_fast_out_slow_in =  'cubic-bezier(0.4, 0, 0.2, 1)';

/*
Animations that cause objects to enter the screen (e.g. a fade in)
*/
var Animation_curve_linear_out_slow_in = exports.Animation_curve_linear_out_slow_in = 'cubic-bezier(0, 0, 0.2, 1)';

/*
Animations that cause objects to leave the screen (e.g. a fade out)
*/
var Animation_curve_fast_out_linear_in = exports.Animation_curve_fast_out_linear_in = 'cubic-bezier(0.4, 0, 1, 1)';

////////////////////////////////////////////////////////////////////////
// Elevation


var elevation_umbra_map = [
  "0px 0px 0px 0px",
  "0px 2px 1px -1px",
  "0px 3px 1px -2px",
  "0px 3px 3px -2px",
  "0px 2px 4px -1px",
  "0px 3px 5px -1px",
  "0px 3px 5px -1px",
  "0px 4px 5px -2px",
  "0px 5px 5px -3px",
  "0px 5px 6px -3px",
  "0px 6px 6px -3px",
  "0px 6px 7px -4px",
  "0px 7px 8px -4px",
  "0px 7px 8px -4px",
  "0px 7px 9px -4px",
  "0px 8px 9px -5px",
  "0px 8px 10px -5px",
  "0px 8px 11px -5px",
  "0px 9px 11px -5px",
  "0px 9px 12px -6px",
  "0px 10px 13px -6px",
  "0px 10px 13px -6px",
  "0px 10px 14px -6px",
  "0px 11px 14px -7px",
  "0px 11px 15px -7px"
];

var elevation_penumbra_map = [
  "0px 0px 0px 0px",
  "0px 1px 1px 0px",
  "0px 2px 2px 0px",
  "0px 3px 4px 0px",
  "0px 4px 5px 0px",
  "0px 5px 8px 0px",
  "0px 6px 10px 0px",
  "0px 7px 10px 1px",
  "0px 8px 10px 1px",
  "0px 9px 12px 1px",
  "0px 10px 14px 1px",
  "0px 11px 15px 1px",
  "0px 12px 17px 2px",
  "0px 13px 19px 2px",
  "0px 14px 21px 2px",
  "0px 15px 22px 2px",
  "0px 16px 24px 2px",
  "0px 17px 26px 2px",
  "0px 18px 28px 2px",
  "0px 19px 29px 2px",
  "0px 20px 31px 3px",
  "0px 21px 33px 3px",
  "0px 22px 35px 3px",
  "0px 23px 36px 3px",
  "0px 24px 38px 3px"
];

var elevation_ambient_map = [
  "0px 0px 0px 0px",
  "0px 1px 3px 0px",
  "0px 1px 5px 0px",
  "0px 1px 8px 0px",
  "0px 1px 10px 0px",
  "0px 1px 14px 0px",
  "0px 1px 18px 0px",
  "0px 2px 16px 1px",
  "0px 3px 14px 2px",
  "0px 3px 16px 2px",
  "0px 4px 18px 3px",
  "0px 4px 20px 3px",
  "0px 5px 22px 4px",
  "0px 5px 24px 4px",
  "0px 5px 26px 4px",
  "0px 6px 28px 5px",
  "0px 6px 30px 5px",
  "0px 6px 32px 5px",
  "0px 7px 34px 6px",
  "0px 7px 36px 6px",
  "0px 8px 38px 7px",
  "0px 8px 40px 7px",
  "0px 8px 42px 7px",
  "0px 9px 44px 8px",
  "0px 9px 46px 8px"
];

// 0 < zvalue < 25
function Elevation(zvalue) {
  return `box-shadow:
            ${elevation_umbra_map[zvalue]} rgba(0,0,0, .2),
            ${elevation_penumbra_map[zvalue]} rgba(0,0,0, .14),
            ${elevation_ambient_map[zvalue]} rgba(0,0,0, .12);`
}
exports.Elevation = Elevation;

var ElevationTransition = exports.ElevationTransition = `
  transition: box-shadow 280ms $Animation_curve_fast_out_slow_in;
  will-change: box-shadow;
`;
