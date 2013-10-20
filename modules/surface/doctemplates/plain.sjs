exports.Document = settings -> "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    #{ settings.head }
    <script type='text/sjs'>
      @ = require.merge('mho:stdlib', 
                        {id:'mho:surface/html', exclude:['Map','Style']});
      @body = document.body;
    </script>
    #{ settings.script }
  </head>
  <body>#{settings.body}</body>
</html>";
