/**
  @summary The default template for ".app" modules
  @desc
    This template includes Bootstrap styles, as well as exposing
    a fully-featured [mho:app::] module.

  @require mho:surface/bootstrap/html
  @require mho:surface
  @require sjs:xbrowser/dom
  @require sjs:event
*/

var frag = require('../doc-fragment');

exports.Document = function(data, settings) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${frag.bootstrapCss()}
    ${settings.showErrorDialog !== 'false' ? frag.errorHandler()}
    ${frag.busyIndicator(settings.showBusyIndicator == 'true')}
    <script type='text/sjs' module='mho:app'>
      withBusyIndicator {
        ||

        waitfor {
          exports = module.exports = require([
                                    {id:'mho:surface/bootstrap/html',
                                      exclude: ['Style', 'Map']
                                    },
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
    </script>

    ${ data.head }
    ${ data.script }
  </head>
  <body><div class='container'>${data.body}</div>
    ${frag.bootstrapJavascript()}
  </body>
</html>`;
}

