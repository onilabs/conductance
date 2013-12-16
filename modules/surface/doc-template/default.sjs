/**
  @summary The default template for [surface::Document] objects.
  @desc
    This template includes twitter Bootstrap and jQuery.
*/

var frag = require('../doc-fragment');

exports.Document = settings ->
`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${frag.bootstrapCss()}
    ${ settings.head }
    ${ settings.script }
  </head>
  <body>${settings.body}
    ${frag.bootstrapJavascript()}
  </body>
</html>`;
