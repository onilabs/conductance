exports.Document = settings ->
  "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <script type='text/sjs' module='app:std.sjs'>
      @ = require('mho:stdlib');
      exports .. @extend(require(['mho:stdlib', 
                                  {id:'mho:surface/html',
                                   exclude: ['Style', 'Map']
                                  }
                                 ]));
      exports.body = document.body;
      exports.mainContent = document.body;
    </script>
    #{ settings.head }
    #{ settings.script }
  </head>
  <body>#{settings.body}</body>
</html>";
