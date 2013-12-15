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

var { readFile } = require('sjs:nodejs/fs');
var { toPath } = require('sjs:url');
var { _fixedNoticeStyle, _fixedNoticeAlertStyle } = require('../bootstrap/notice');
var { sanitize: escapeXML } = require('sjs:string');
var escapeCssAttr = (style) -> style.replace(/\s+/g, '') .. escapeXML;

exports.Document = function(data, settings) {
  return "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <link rel='stylesheet' href='/__mho/surface/bootstrap/bootstrap-vanilla-3.css' media='screen'>
    <script>#{readFile(require.url('../rainbow.min.js') .. toPath)};
      (function() {
        var loaded = false;
        rainbow.config({barColors:['#e91100'], barThickness: 2, shadowBlur: 1});
        #{settings.showBusyIndicator == 'true' ? "window.onload = function() {
          loaded = true;
          rainbow.show();
        };" : ""}

        #{settings.showErrorDialog == 'false' ? "" :
        "
        var errorIndicatorShown = false;
        function showErrorIndicator(e) {
          if (loaded) rainbow.hide();
          if (errorIndicatorShown) return;
          errorIndicatorShown = true;
          document.body.innerHTML = (
            \"<div style='#{_fixedNoticeStyle .. escapeCssAttr}'>\" +
              \"<div class='alert alert-danger' style='#{_fixedNoticeAlertStyle .. escapeCssAttr}'>\"+
                \"<strong>Error:</strong>\"+
                \" An uncaught error occurred, reload the page to try again.\"+
              \"</div>\"+
            \"</div>\");
        };
        window.onerror = showErrorIndicator;
        "}
      })();
    </script>
    <script type='text/sjs'>
      var busy_indicator_refcnt = 0, busy_indicator_stratum, busy_indicator_shown = #{settings.showBusyIndicator == 'true' ? 'true' : 'false'};

      function showBusyIndicator(delay) {
        delay = delay || 500;
        if (++busy_indicator_refcnt === 1) {
          busy_indicator_stratum = spawn (function() {
            hold(delay);
            rainbow.show();
            busy_indicator_shown = true;
          })();
        }
      }

      function hideBusyIndicator() {
        // we're spawning/holding to get some hysteresis: if someone
        // calls showBusyIndicator next, we
        // don't want to stop a currently running indicator
        spawn (function() {
          hold(10);
          if (--busy_indicator_refcnt === 0) {
            if (busy_indicator_stratum) {
              busy_indicator_stratum.abort();
              busy_indicator_stratum = null;
            }
            if(busy_indicator_shown) {
              rainbow.hide();
              busy_indicator_shown = false;
            }
          }
        })();
      }

      function withBusyIndicator(block) {
        try {
          showBusyIndicator();
          block();
        }
        finally {
          hideBusyIndicator();
        }
      }
      window.withBusyIndicator = withBusyIndicator;
    </script>

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
    #{ data.head }
    #{ data.script }
  </head>
  <body><div class='container'>#{data.body}</div>
    <script src='/__mho/surface/bootstrap/jquery-1.10.2.min.js'></script>
    <script src='/__mho/surface/bootstrap/bootstrap.min.js'></script>
  </body>
</html>";
}

