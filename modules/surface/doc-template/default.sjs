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
  @type template
  @summary The default template for [surface::Document] objects.
  @hostenv nodejs
  @desc
    This template includes Twitter Bootstrap (with Conductance styling), but provides no [mho:app::] module.

    It is most appropriate for creating static HTML documents on the
    server-side, see [mho:surface::Document] for an example.

  @directive @template-title
  @summary Set the document title
  @desc
    This allows you to set an initial <title> content for
    the .app.

    ### Example:

        /**
          @template-title Conductance Chat Demo
         *\/

*/

var frag = require('../doc-fragment');

exports.Document = settings ->
`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${frag.bootstrapCss()}
    ${frag.conductanceCss()}
    ${ settings.head }
    ${ settings.script }
  </head>
  <body>${settings.body}
    ${frag.bootstrapJavascript()}
  </body>
</html>`;
