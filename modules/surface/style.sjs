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
  './style/color'
]);


//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io

var CSSSurfaceDefault = [
  @CSSNormalize,
  @GlobalCSS(`
  :root {
    --mho-theme-primary: #729f98;
    --mho-theme-accent: #aa863a;
    --mho-theme-background: #fafafa;
  }
  html, body {
    background-color: var(--mho-theme-background);
    -webkit-font-smoothing: antialiased;
  }     

  $@Color
  $@Typography
  $@Button
  $@TextField
  `)
];
exports.CSSSurfaceDefault = CSSSurfaceDefault;
