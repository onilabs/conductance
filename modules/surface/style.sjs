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
@summary Common CSS Style definitions
@hostenv xbrowser
*/


@ = require([
  'sjs:std',
  {id:'./base', include: ['GlobalCSS']},
  './style/normalize',
  './style/typography',
  './style/button',
  './style/textfield',
  './style/color',
  './style/list',
  './style/drawer',
  './style/toolbar',
  {id:'./style/fonts', name: 'fonts'}
]);


//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

var CSSSurfaceDefault = [
  @CSSNormalize,
  @GlobalCSS(`
  :root {
    --mho-theme-primary: #3f51b5/* #729f98 */;
    --mho-theme-accent: #ff4081/*#aa863a*/;
    --mho-theme-background: #fff/*#fafafa*/;
  }
  html, body {
    background-color: var(--mho-theme-background);
    -webkit-font-smoothing: antialiased;
  }     

  ${@fonts.Roboto({styles:['400', '500']})}
  $@Color
  $@Typography
  $@Button
  $@TextField
  $@List
  $@Drawer
  $@Toolbar
  `)
];
exports.CSSSurfaceDefault = CSSSurfaceDefault;
