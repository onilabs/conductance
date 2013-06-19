var html  = require('./html');
var { values, propertyPairs } = require('sjs:object');
var { map, join, each } = require('sjs:sequence');

//----------------------------------------------------------------------
exports.CSSDocument = function(content, parent_class) {
  parent_class = parent_class || '';
  return require('./css').scope(content, parent_class);
};

//----------------------------------------------------------------------

exports.Document = function(content) {

  content = html.collapseHtmlFragment(content);

  return "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    #{
        values(content.getStyleDefs()) .. 
        map([ref_count,def] -> def.getHtml()) .. 
        join('\n')
    }
    <script src='/__sjs/stratified.js'></script>
    <script type='text/sjs'>
      require.hubs.push(['mho:', '/__mho/']);
      require.hubs.push(['\u2127:', 'mho:']);

      #{
         // keep static & dynamic worlds from colliding; see comment at top of html.sjs
         html._getDynOniSurfaceInit()
      }

      (function () {
        var mechs = {};
        #{
          // XXX need to escape </script> -> <\/script> in #{code} below!!!
          propertyPairs(content.getMechanisms()) .. 
          map(function([id, code]) {
            if (typeof code !== 'string')
              throw new Error('Static surface code cannot contain mechanisms with function objects');
            return "mechs[#{id}] = function(){ #{code} };"
          }) ..
          join('\n')
        }

        var { reverse, each, filter } = require('sjs:sequence');
        (document.body.querySelectorAll('._oni_mech_') || []) .. 
          reverse .. // we want to start mechanisms in post-order; querySelectorAll is pre-order
          each {
            |elem|
            elem.__oni_mechs = [];
            elem.getAttribute('data-oni-mechanisms').split(' ') .. 
            filter .. // only truthy elements
            each { 
              |mech|
              elem.__oni_mechs.push(spawn mechs[mech].call(elem, elem));
            }
          }
        })();
    </script>
  </head>
  <body>#{content.getHtml()}</body>
</html>
";
};
