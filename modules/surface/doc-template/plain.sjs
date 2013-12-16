/**
  @summary A minimal template for [surface::Document] objects.
  @desc
    This template is the most minimal document template - it contains
    no default CSS styles or additional javascript.
*/
exports.Document = settings -> `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    #{ settings.head }
    #{ settings.script }
  </head>
  <body>#{settings.body}</body>
</html>`;
