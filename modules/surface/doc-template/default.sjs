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
  @summary The default template for [surface::Document] objects.
  @desc
    This template includes twitter Bootstrap and jQuery.
*/

var frag = require('../doc-fragment');

exports.Document = settings ->
`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${frag.bootstrapCss()}
    ${ settings.head }
    ${ settings.script }
  </head>
  <body>${settings.body}
    ${frag.bootstrapJavascript()}
  </body>
</html>`;
