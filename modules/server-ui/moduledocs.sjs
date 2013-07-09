var { parseModuleDocs } = require('sjs:docutil');
// XXX get rid of bootstrap dependency
var { Bootstrap, Container, Label, Accordion, Span, Icon } = require('../surface/bootstrap');
var { Attrib, Style, Unescaped } = require('../surface');
var { values } = require('sjs:object');
var { transform, filter, intersperse, find, join } = require('sjs:sequence');
var { convert } = require('sjs:marked');

//----------------------------------------------------------------------

// resolve a link of the form:
//   module_url::
//   module_url::symbol
//   ::symbol
function resolveLink(id) {
  if (id.indexOf('::') == -1) return id; // ids we care about contain '::'
  var [, opt, module, symbol] = /\s*(optional)?\s*([^:]*)::(.*)/.exec(id);
  var rv;
  if (module) {
    if (symbol)
      rv = "<a href='#{module}.sjs##{symbol}'>#{module}::#{symbol}</a>";
    else
      rv = "<a href='#{module}.sjs'>#{module}</a>";
  }
  else {
    // link into our module:
    rv = "<a href='##{symbol}'>#{symbol}</a>";
  }

  if (opt) 
    rv = 'optional '+rv;
  return rv;
}

// resolve all links [...::...] 
function resolveLinks(html) {
  return html.replace(/\[([^\]]*::[^\]]*)\]/g, function(m,p) { return resolveLink(p); }); 
}

var DocsMarkdown = txt -> 
  convert(txt, {escapeCode:false}) .. 
  resolveLinks ..
  Unescaped;

//----------------------------------------------------------------------
// Style

// style overrides applying to all our docs:
var DocsStyle   = Style('
  td > p   { margin:0 }
');

var OptArgStyle = Style('{color:#888}');
var DefvalStyle = Style('{font-style:italic}');

//----------------------------------------------------------------------
// function to markup types:
var type = (ts) -> 
  (ts||'').split('|') .. 
  transform(t -> t.trim() .. resolveLink) .. 
  intersperse(' | ') .. join .. Unescaped;

//----------------------------------------------------------------------
// function signature for the given function symbol `f` and (possibly undefined) class `cls`:
var signature = (f, cls) -> 
  `<h2>${f.type=='ctor'&&!f.nonew? 'new '}${cls? cls.toLowerCase()+'.'}${f.name}($paramlist(f.param||[]))${
      f['return']? ` $Icon('arrow-right') $type(f['return'].valtype)`
    }</h2>`;
var paramlist = (ps) -> 
  ps .. 
  transform(function(p) {
    var rv = p.name || '.';
    if (p.valtype && p.valtype.indexOf('optional')!=-1)
      rv = Span(`[$rv]`) .. OptArgStyle;
    return rv;
  }) ..
  intersperse(', ');
   
//---------------------------------------------------------------------- 
// table of function parameters:
var paramtable = (ps) ->
  `<h3>Parameters:</h3>
   <table class='table table-striped table-bordered'>
     <tbody>
      ${ps .. transform(paramrow)}
     </tbody>
   </table>`;

var paramrow = (p) ->
  `<tr>
     <td>${p.name}</td>
     <td>$type(p.valtype)${p.defval? `<br>Default: ${p.defval}` .. DefvalStyle}</td>
     <td>${p.summary ? DocsMarkdown(p.summary)}</td>
   </tr>`

//----------------------------------------------------------------------
// table of settings:
var settingtable = (ss) ->
  `<h3>Settings:</h3>
   <table class='table table-striped table-bordered'>
     <tbody>
       ${ss .. transform(paramrow)}
     </tbody>
   </table>`;

//----------------------------------------------------------------------
// return value details:
var returnvalue = (rv) ->
  `<h3>Return Value:</h3>
   <table class='table table-striped table-bordered'>
     <tbody>
       <trow>
         <td>$type(rv.valtype)</td><td>${rv.summary? DocsMarkdown(rv.summary)}</td>
       </trow>
     </tbody>
   </table>`;

//----------------------------------------------------------------------
// list of functions constructed from the hash 'symbols'

var functionslist = (symbols, cls, ftype) -> Accordion(values(symbols) .. 
    filter({type} -> type==ftype) ..
    transform(symbol -> 
              [`<a id='${ftype=='ctor'? symbol.name+'::'}${cls? cls+'::'}${symbol.name}'></a>$signature(symbol, cls)
                ${symbol.summary? DocsMarkdown(symbol.summary)}`,
               `${symbol.param ? paramtable(symbol.param)}
                ${symbol['return'] ? returnvalue(symbol['return'])}
                ${symbol.setting ? settingtable(symbol.setting)}
                ${symbol.desc? DocsMarkdown(symbol.desc)}`
              ]));

//----------------------------------------------------------------------
// list of classes constructed from the hash 'classes'

var classlist = classes -> Accordion(values(classes) ..
    transform(cls ->
              [`<a id='${cls.name}'></a><h2>${cls.name}</h2>
                ${cls.summary? DocsMarkdown(cls.summary)}`,
               `
               <h3>Constructor:</h3>
               ${cls.symbols? functionslist(cls.symbols, undefined, 'ctor')}
               <hr>
               <h3>Methods:</h3>
               ${cls.symbols? functionslist(cls.symbols, cls.name, 'function')}
               <hr>
               ${cls.desc? DocsMarkdown(cls.desc)}
               `
              ]));

//----------------------------------------------------------------------
//

/**
   @function generateModuleDocs
   @param {String} [src] Module source code
   @return {HtmlFragment}
*/
exports.generateModuleDocs = function(name, src) {

  try {
    var docs = parseModuleDocs(src);
  }
  catch (e) {
    return `
      <p>Error parsing docs: $e</p>
      <hr>
      <h1>$name</h1>
      <pre>$src</pre>`;
  }    

  return Bootstrap(Container(
    `
      <div class='page-header'>
        <h1>${docs.module ? `The ${docs.module} module` : name}
          ${docs.summary ? `<br><small>$DocsMarkdown(docs.summary)</small>`}
        </h1>

      ${docs.hostenv ? 
        `<p>$Label('warning', 'Note') This module only works in the '${docs.hostenv}' host environment.</p>`
       }

      ${docs.desc ? DocsMarkdown(docs.desc) }
      <hr>
      <h2>Functions:</h2>
      $functionslist(docs.symbols, undefined, 'function')
      <hr>
      <h2>Classes:</h2>
      $classlist(docs.classes)
      <hr>
      <h2>Source code:</h2>
      <pre>$src</pre>
      <hr>
      <h3>Output from docs parsing (just temporarily for debugging):</h3>
      <pre>${require('sjs:debug').inspect(docs, false, 6)}</pre>
    `)) .. DocsStyle;
};

