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
      }
    </script>
    #{ settings.head }
    #{ settings.script }
  </head>
  <body><div class='container'>#{settings.body}</div></body>
  <script src='/__mho/surface/bootstrap/jquery-1.10.2.min.js'></script>
  <script src='/__mho/surface/bootstrap/bootstrap.min.js'></script>
</html>";
