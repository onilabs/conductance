exports.Document = settings -> "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    #{ settings.head }
    #{ settings.script }
  </head>
  <body>#{settings.body}</body>
</html>";
