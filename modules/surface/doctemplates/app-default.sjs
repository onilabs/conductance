/**
  @summary The default template for ".app" modules
  @desc
    This template includes Bootstrap styles, as well as exposing
    a fully-featured [mho:app::] module.
*/

var { readFile } = require('sjs:nodejs/fs');
var { toPath } = require('sjs:url');

var _fixedIndicatorStyle = "
        position: fixed;
        top:1em;
        left:0;
        right:0;
        height:0;
        text-align: center;
";
var _fixedIndicatorAlertStyle = "
        display: inline-block;
        text-align:left;
        color:black;
        padding: 8px;
        border-radius: 3px;
";

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
            \"<div style='#{_fixedIndicatorStyle.replace(/\s+/g, '')}'>\" +
              \"<div class='alert alert-danger' style='#{_fixedIndicatorAlertStyle.replace(/\s+/g, '')}'>\"+
                \"<strong>Error:</strong>\"+
                \" An uncaught error occurred, you must reload the page.\"+
              \"</div>\"+
            \"</div>\");
        };
        window.onerror = showErrorIndicator;
        "}
      })();
    </script>
    <script type='text/sjs' module='mho:app'>
      //----------------------------------------------------------------------
      // BUSY INDICATOR

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

      //----------------------------------------------------------------------
      // API IMPORTING

      var _connectionIndicatorStyle;
      function ConnectionIndicatorStyle(ft) {
        if(!_connectionIndicatorStyle)
          _connectionIndicatorStyle = @Style('
            {
              #{_fixedIndicatorStyle}
            }
            .alert {
              #{_fixedIndicatorAlertStyle}
            }
          ');
        return _connectionIndicatorStyle(ft);
      }

      function Countdown(seconds) {
        return exports.Span(seconds) .. @Mechanism(function(node) {
          while (seconds > 0) {
            hold(1000);
            node.innerHTML = --seconds;
          }
        });
      }

      function withAPI(api, block) {
        var delay = 1000;
        var { isTransportError, connect } = require('mho:rpc/bridge');

        while (1) {
          try {
            connect(api, {
              connectionMonitor: {
                ||
                hold(300); // small delay before showing ui feedback
                document.body .. @withWidget(
                  exports.Div(`<div class='alert alert-warning'>Connecting...</div>`) .. ConnectionIndicatorStyle()) {
                  ||
                  hold();
                }
              }
            }) {
              |connection|
              // we're connected; reset connection delay
              delay = 1000;
              block(connection.api);
            }
          }
          catch(e) {
            if (isTransportError(e)) {
              hold(300); // small delay before showing ui feedback
              document.body .. @withWidget(
                exports.Div(`<div class='alert alert-warning'>Not connected. Reconnect in ${Countdown(Math.floor(delay/1000))}s. ${exports.A(`Try Now`, {href:'#'})}</div>`) .. ConnectionIndicatorStyle()
              ) { |ui|
                waitfor {
                  hold(delay);
                  delay *= 1.5;
                  if (delay > 60*1000*10) // cap at 10 minutes
                    delay = 60*1000*10;
              
                }
                or {
                  ui.querySelector('a') .. @wait('click', {handle:@preventDefault});
                }
              }
              continue;
            }
            else
              throw e;
          }
          break;
        }
      }


      //----------------------------------------------------------------------

      withBusyIndicator {
        ||

        waitfor {
          exports = module.exports = require([
                                    {id:'mho:surface/bootstrap/html',
                                      exclude: ['Style', 'Map']
                                    }
                                  ]);
        } and {
          @ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:events']);
        }

        // ui entry points:
        exports.body = document.body;
        exports.mainContent = document.body.firstChild;
        exports.withAPI = withAPI;
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

