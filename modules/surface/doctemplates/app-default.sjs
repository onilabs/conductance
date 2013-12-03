var { readFile } = require('sjs:nodejs/fs');
var { toPath } = require('sjs:url');


exports.Document = settings ->
  "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <link rel='stylesheet' href='/__mho/surface/bootstrap/bootstrap-vanilla-3.css' media='screen'>
    <script>#{readFile(require.url('../rainbow.min.js') .. toPath)};
      rainbow.config({barColors:['#e91100']});
    </script>
    <script type='text/sjs' module='app:std.sjs'>


      //----------------------------------------------------------------------
      // BUSY INDICATOR 

      var busy_indicator_refcnt = 0, busy_indicator_stratum;

      function showBusyIndicator(delay) {
        delay = delay || 500;
        if (++busy_indicator_refcnt === 1) {
          busy_indicator_stratum = spawn (function() {
            hold(delay);
            try {
              rainbow.show();
              hold();
            }
            finally {
              rainbow.hide();
            }          
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
            busy_indicator_stratum.abort();
            busy_indicator_stratum = undefined;
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
          _connectionIndicatorStyle = exports.Style('
            {
              position: fixed;
              top:1em;
              left:0;
              right:0;
              height:0;
              text-align: center;
            }
            .alert {
              display: inline-block;
              text-align:left;
              color:black;
              padding: 3px;
              border-radius: 0;
            }
          ');
        return _connectionIndicatorStyle(ft);
      }

      function Countdown(seconds) {
        return exports.Span(seconds) .. exports.Mechanism(function(node) {
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
                document.body .. exports.withWidget(
                  exports.Div(`<div class='alert alert-warning'>Connecting...</div>`) .. ConnectionIndicatorStyle()) {
                  ||
                  hold();
                }
              }
            }) {
              |connection|
              // we're connected; reset connection delay
              delay = 1000;
              try {
                exports.mainContent.style.opacity = '1';
                block(connection.api);
              }
              finally {
                exports.mainContent.style.opacity = '.5';
              }
            }
          }
          catch(e) {
            if (isTransportError(e)) {
              hold(300); // small delay before showing ui feedback
              document.body .. exports.withWidget(
              exports.Div(`<div class='alert alert-warning'>Not connected. Reconnect in ${Countdown(Math.round(delay/1000))}s. ${exports.A(`Try Now`, {href:'#'})}</div>`) .. ConnectionIndicatorStyle()
        ) {
              |ui|
               waitfor { 
                hold(delay); 
                delay *= 1.5;
                if (delay > 60*1000*10) // cap at 10 minutes
                  delay = 60*1000*10;
            
               } 
               or { 
                 ui.querySelector('a') .. exports.wait('click', {handle:exports.preventDefault}); 
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

        @ = require('mho:std');

        //----------------------------------------------------------------------
        // export symbols for app:std

        // general app vocabulary:
        exports .. @extend(require(['mho:std', 
                                    {id:'mho:surface/bootstrap/html',
                                     exclude: ['Style', 'Map']
                                    }
                                   ]));

        // ui entry points:
        exports.body = document.body;
        exports.mainContent = document.body.firstChild;
        exports.withBusyIndicator = withBusyIndicator;
        exports.withAPI = withAPI;
      }
    </script>
    #{ settings.head }
    #{ settings.script }
  </head>
  <body><div class='container'>#{settings.body}</div></body>
  <script src='/__mho/surface/bootstrap/jquery-1.10.2.min.js'></script>
  <script src='/__mho/surface/bootstrap/bootstrap.min.js'></script>
</html>";
