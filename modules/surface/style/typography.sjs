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
  'sjs:std'
]);

//----------------------------------------------------------------------
// Surface Default Theme; heavily inspired by https://getmdl.io & https://material.io


var Typography_display_3 = `
  font-size: 56px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.02em;
`;

var Typography_display_2 = `
  font-size: 45px;
  font-weight: 400;
  line-height: 48px;
`;

var Typography_display_1 = `
  font-size: 34px;
  font-weight: 400;
  line-height: 40px;
`;

var Typography_headline = `
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
`;

var Typography_title = `
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0.02em;
`;

var Typography_subhead = `
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.04em;
`;

var Typography_body_1 = `
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: .04em;
`;

var Typography = `
  html, body {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    margin: 0;
    $Typography_body_1
  }

  .mho-typo--display-3 { $Typography_display_3 }
  .mho-typo--display-2 { $Typography_display_2 }
  .mho-typo--display-1 { $Typography_display_1 }
  .mho-typo--headline  { $Typography_headline }
  .mho-typo--title     { $Typography_title }
  .mho-typo--subhead   { $Typography_subhead }
  .mho-typo--body-1    { $Typography_body_1 }

  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
    padding: 0;
  }
  h1 small, h2 small, h3 small, h4 small, h5 small, h6 small {
    $Typography_display_3
    opacity: 0.54;
    font-size: 0.6em;
  }
  h1 {
    $Typography_display_3
    margin-top: 24px;
    margin-bottom: 24px;
  }
  h2 {
    $Typography_display_2
    margin-top: 24px;
    margin-bottom: 24px;
  }
  h3 {
    $Typography_display_1
    margin-top: 24px;
    margin-bottom: 24px;
  }
  h4 {
    $Typography_headline
    margin-top: 24px;
    margin-bottom: 16px;
  }
  h5 {
    $Typography_title
    margin-top: 24px;
    margin-bottom: 16px;
  }
  h6 {
    $Typography_subhead
    margin-bottom: 16px;
  }
  p {
    $Typography_body_1
    margin-bottom: 16px;
  }
  a {
    color: var(--mho-theme-accent);
    font-weight: 500;
    text-decoration: none;
  }
  ul, ol {
    $Typography_body_1
  }
`;
exports.Typography = Typography;
