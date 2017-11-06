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
   @noindex
   (to be documented)
*/


@ = require([
  'sjs:std',
  'mho:surface',
  'mho:surface/html',
  'mho:surface/svg',
  {id:'mho:surface/field', name:'field'}
]);

var CSS_CircularProgress = @CSS(
`
  {
    width: 100%;
  }
  path.trail {
    stroke: #d6d6d6;
  }
  path.progress {
    stroke: #3e98c7;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease 0s;
  }
`);

function CircularProgress(settings) {
  settings = {
    Percentage: null,
    strokeWidth: 8
  } .. @override(settings);

  var radius = 50 - settings.strokeWidth/2;
  var circumference = Math.PI * 2 * radius;
  var path = "M 50,50 m 0,-#{radius} a #{radius},#{radius} 0 1 1 0,#{2*radius} a #{radius},#{radius} 0 1 1 0,-#{2*radius}";

  var DynamicStyle = settings.Percentage .. @project(
    percentage -> "stroke-dasharray: #{circumference}px #{circumference}px; stroke-dashoffset: #{(100-percentage)/100*circumference}px");

  return @Svg({viewBox:"0 0 100 100"}) .. CSS_CircularProgress :: [
    @Path({'class': 'trail', d: path, 'stroke-width':settings.strokeWidth+'px', 'fill-opacity': 0}),
    @Path({'class': 'progress', d: path, 'stroke-width':settings.strokeWidth+'px', 'fill-opacity': 0, style: DynamicStyle})
  ];
}
exports.CircularProgress = CircularProgress;
