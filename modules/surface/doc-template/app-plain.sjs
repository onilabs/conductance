/**
  @summary A minimal template for `.app` modules
  @desc
    This template includes no default styles or additional javascript.
*/

exports.Document = settings ->
  `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <script type='text/sjs' module='mho:app'>
      module.exports = require([ {id:'mho:surface/html', exclude: ['Style'] } ]);
      exports.body = document.body;
      exports.mainContent = document.body;
    </script>
    ${ settings.head }
    ${ settings.script }
  </head>
  <body>#{settings.body}</body>
</html>`;
