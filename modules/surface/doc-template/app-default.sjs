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
  @summary The default template for ".app" modules
  @desc
    This template includes Bootstrap styles, as well as exposing
    a fully-featured [mho:app::] module.

  @require mho:surface/bootstrap/html
  @require mho:surface/bootstrap/notice
  @require mho:surface/api-connection
  @require mho:surface
  @require sjs:xbrowser/dom
  @require sjs:event
*/

var frag = require('../doc-fragment');
var { toBool } = require('sjs:docutil');

exports.Document = function(data, settings) {
  var content = data.body;
  var showErrorDialog = settings.showErrorDialog .. toBool;
  var showBusyIndicator = settings.showBusyIndicator .. toBool;
  var wrapContent = settings.wrapContent ..toBool;
  var appModule = settings.appModule .. toBool;
  var includeBootstrap = settings.useBootstrap .. toBool;

  if (wrapContent !== false) content = `<div class='container'>${data.body}</div>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${includeBootstrap !== false ? frag.bootstrapCss()}
    ${showErrorDialog !== false ? frag.errorHandler()}
    ${frag.busyIndicator(showBusyIndicator === true)}
    ${appModule !== false ? `
    <script type='text/sjs' module='mho:app'>
      withBusyIndicator {
        ||

        waitfor {
          exports = module.exports = require([
                                    'mho:surface/bootstrap/html',
                                    {id:'mho:surface/api-connection',
                                      include: ['withAPI']
                                    },
                                    {id:'mho:surface/bootstrap/notice',
                                      include: ['Notice']
                                    }
                                  ]);
        } and {
          @ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:event']);
        }

        // ui entry points:
        exports.body = document.body;
        exports.mainContent = document.body.firstChild;
        exports.withBusyIndicator = withBusyIndicator;
      }
    </script>`}
    ${ data.head }
    ${ data.script }
  </head>
  <body>${content}
    ${includeBootstrap !== false ? frag.bootstrapJavascript()}
  </body>
</html>`;
}

