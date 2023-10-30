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
  @type template
  @summary A minimal template for `.app` files
  @desc
    ### Symbols exported in mho:app

    In addition to the symbols documented below, app-plain's `mho:app` module
    exports all the HTML builders provided by
    [surface/html::].

  @directive @template-title
  @summary Set the document title
  @desc
    This allows you to set an initial <title> content for
    the .app.

    ### Example:

        /**
          @template-title Conductance Chat Demo
         *\/


  @variable mainContent
  @summary Alias for (`document.body`)

  @directive @template-head
  @summary Content to go into document <head> section.
  @desc
     ### Example:

         /**
           @template-head
             <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
             <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          *\/

*/

@ = require('sjs:std');

exports.Document = function(data, settings) {
  return `<!DOCTYPE html>
<html>
  <head>
    <script type='text/sjs' module='mho:app'>
      var html = require('mho:surface/html');
      module.exports = require('sjs:object').merge(html, {
        body: document.body,
        mainContent: document.body
      });
    </script>
    ${ data.head }
    ${ data.script }
    ${settings.head ? [settings.head] .. @Quasi}
  </head>
  <body>${data.body}</body>
</html>`;
}
