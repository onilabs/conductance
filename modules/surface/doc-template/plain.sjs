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
  @type template
  @summary A minimal template for [surface::Document] objects.
  @desc
    This template is the most minimal document template - it contains
    no default CSS styles or additional javascript.

    It is most appropriate for creating static HTML documents on the
    server-side, see [mho:surface::Document] for an example.

  @directive @template-title
  @summary Set the document title
  @desc
    This allows you to set an initial <title> content for
    the document.

    ### Example:

        /**
          @template-title Conductance Chat Demo
         *\/

*/
exports.Document = settings -> `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    ${ settings.head }
    ${ settings.script }
  </head>
  <body>${settings.body}</body>
</html>`;
