/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @nodoc
  @noindex
  (documented as mho:surface)
*/

var html  = require('./base');
var { values, propertyPairs, keys, merge } = require('sjs:object');
var { sanitize, isString } = require('sjs:string');
var { map, join, each } = require('sjs:sequence');
var url = require('sjs:url');

//----------------------------------------------------------------------
exports.CSSDocument = function(content, parent_class) {
  parent_class = parent_class || '';
  return require('./css').scope(content, parent_class);
};

//----------------------------------------------------------------------

/**
  @function Document
  @hostenv nodejs
  @summary Generate a static document
  @return {string}
  @param {surface::HtmlFragment} [content] Document content
  @param {Settings} [settings]
  @setting {surface::HtmlFragment} [title] Document title
  @setting {surface::HtmlFragment} [head] Additional HTML content to appear in the document's <head> (before SJS is initialized)
  @setting {String} [init] SJS source code to run on the client once SJS is initialized
  @setting {String} [main] SJS module URL to run on the client
  @setting {Array}  [externalScripts] Array of Javascript script URLs to add to the page
  @setting {Object} [templateData] object which will be be passed through to the template function
  @setting {Function|String} [template="default"] Document template
  @desc
    **Note:** the `head` and `title` settings can be any [surface::HtmlFragment] type,
    but since they're used for customising the HTML <head> before SJS is initialized, only the
    raw HTML value be used (i.e any mechanisms and other non-html content on these objects will be ignored).

    If `template` is a function, it will be called with a single argument - an object containing the following properties:

     - head: html to be inserted into the <head> element
     - script: initialization, as a <script type="text/sjs"> tag
     - body: the main document content

    If `template` is a string, it will be passed to [::loadTemplate], and the returned
    function will be called as above.

    `template` must return a [sjs:quasi::Quasi].

*/
exports.Document = function(content, settings) {
  var headContent, userInit, title, mainModule, template, templateData, externalScripts;
  if(settings) {
    title = settings.title;
    headContent = settings.head;
    userInit = settings.init;
    mainModule = settings.main;
    template = settings.template;
    templateData = settings.templateData;
    externalScripts = settings.externalScripts;
  }

  content = (content || null) .. html.collapseHtmlFragment();

  template = template || 'default';
  if (template .. isString) template = exports.loadTemplate(template);

  headContent = [headContent];
  if (title) {
    headContent.push(`<title>$title</title>`);
  }

  var styleLinkTag = url -> `<link rel='stylesheet' href='${url}'>`;
  headContent = headContent.concat(keys(content.getExternalCSS()) .. map(styleLinkTag));

  var scriptTag = url -> `<script src="${url}"></script>`;
  headContent = headContent.concat(keys(content.getExternalScripts()) .. map(scriptTag));

  if(externalScripts)
    headContent = headContent.concat(externalScripts .. map(scriptTag));

  var cssDefs = values(content.getCSSDefs()) ..
      map([ref_count,def] -> def.getHtml() .. html.RawHTML());

  headContent = headContent.concat(cssDefs);

  headContent.push(`<script src='/__sjs/stratified.js' asyc='true'></script>`);

  headContent.push(
    `<script type="text/sjs">
      if (!window.location.origin)
        window.location.origin = "#{window.location.protocol}//#{window.location.hostname}#{window.location.port ? ":#{window.location.port}" : \'\'}";
      require.hubs.push(['mho:', "#{window.location.origin}/__mho/"]);
      require.hubs.push(['\u2127:', 'mho:']);
    </script>`
  );

  var mechanisms = propertyPairs(content.getMechanisms()) ..
    map(function([id, code]) {
      if (typeof code !== 'string')
        throw new Error('Static surface code cannot contain mechanisms with function objects');
      return "mechs[#{id}] = function(){ #{code} };"
    });

  var bootScript = "";
  // keep static & dynamic worlds from colliding; see comment at top of html.sjs
  bootScript += html._getDynOniSurfaceInit()

  if (userInit) bootScript += userInit + '\n';

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

  if(mainModule) bootScript += "\nrequire(\"#{sanitize(mainModule)}\", {main: true});";

  bootScript = html.Element('script', bootScript, {type:'text/sjs'});

  var fragment = template({ head: headContent,
                    script: bootScript,
                    body: content
                  },
                  templateData || {}) .. html.collapseHtmlFragment();
  return fragment.getHtml();
};

/**
  @function loadTemplate
  @hostenv nodejs
  @summary Load a template module
  @param {String} [name] template name or module URL
  @param {optional String} [base] base URL
  @desc
    Loads a template module by name or URL and returns its
    Document property (which should be a function).

    If `name` does not contain path separators it is assumed to name a module
    in [./surface/doc-template/::].

    Otherwise, `name` is normalized against `base` (using [sjs:url::normalize]). If
    you do not pass a `base` argument, `name` must be an absolute URL.
*/
exports.loadTemplate = function(name, base) {
  if (/^[^\:\/]+$/.test(name)) {
    // name is relative to ./doc-template/
    name = './doc-template/'+name;
  } else {
    name = url.normalize(name, base);
  }

  try {
    require.resolve(name);
  }
  catch(e) {
    throw new Error("Document Template #{name} not found");
  }

  var module = require(name);
  var fn = module.Document;
  if(!fn) throw new Error("#{name} is not a template module");
  return fn;
};
