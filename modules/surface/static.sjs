var html  = require('./base');
var { values, propertyPairs, keys } = require('sjs:object');
var { sanitize } = require('sjs:string');
var { map, join, each } = require('sjs:sequence');

//----------------------------------------------------------------------
exports.CSSDocument = function(content, parent_class) {
  parent_class = parent_class || '';
  return require('./css').scope(content, parent_class);
};

//----------------------------------------------------------------------

/**
  @function Document
  @param {../surface::FragmentTree} [content] Document content
  @param {Settings} [settings]
  @setting {../surface::FragmentTree} [title] Document title
  @setting {../surface::FragmentTree} [head] Additional HTML content to appear in the document's <head> (before SJS is initialized)
  @setting {String} [init] SJS source code to run on the client once SJS is initialized
  @setting {String} [main] SJS module URL to run on the client
  @desc
    **Note:** the `head` and `title` settings can be any [../surface::FragmentTree] type,
    but since they're used for customising the HTML <head> before SJS is initialized, only the
    raw HTML value be used (i.e any mechanisms and other non-html content on these objects will be ignored).
*/
exports.Document = function(content, settings) {

  content = html.collapseHtmlFragment(content || undefined);

  var headContent, userInit, title, mainModule;
  if(settings) {
    title = settings.title;
    headContent = settings.head;
    userInit = settings.init;
    mainModule = settings.main;
  }

  headContent = headContent ? html.collapseHtmlFragment(headContent).getHtml() : "";
  if (title) {
    headContent += html.collapseHtmlFragment(`<title>$title</title>`).getHtml();
  }

  var mechanisms = propertyPairs(content.getMechanisms()) ..
    map(function([id, code]) {
      if (typeof code !== 'string')
        throw new Error('Static surface code cannot contain mechanisms with function objects');
      return "mechs[#{id}] = function(){ #{code} };"
    });
  var bootScript = "
    require.hubs.push(['mho:', '/__mho/']);
    require.hubs.push(['\u2127:', 'mho:']);
  ";
  
  // keep static & dynamic worlds from colliding; see comment at top of html.sjs
  bootScript += html._getDynOniSurfaceInit()

  if (mechanisms.length > 0) {
    bootScript += "
      (function () {
        var mechs = {};
        #{mechanisms .. join('\n')}
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
    ";
  }

  if(userInit) bootScript += "\n" + userInit;
  if(mainModule) bootScript += "\nrequire(\"#{sanitize(mainModule)}\", {main: true});";

  return "\
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    #{
      headContent
    }#{
      keys(content.getExternalScripts()) ..
      map(url -> "<script src=\"#{sanitize(url)}\"></script>") ..
      join('\n')
    }#{
      values(content.getStyleDefs()) ..
      map([ref_count,def] -> def.getHtml()) ..
      join('\n')
    }
    <script src='/__sjs/stratified.js' asyc='true'></script>
    <script type='text/sjs'>#{ html.escapeForTag(bootScript, 'script') }</script>
  </head>
  <body>#{content.getHtml()}</body>
</html>";
};
