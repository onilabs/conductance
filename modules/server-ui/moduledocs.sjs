var { parseModuleDocs } = require('sjs:docutil');
// XXX get rid of bootstrap dependency
var { Bootstrap, Container, Label, Accordion, Span, Icon } = require('../surface/bootstrap');
var { Markdown, Attrib, Style } = require('../surface');
var { values } = require('sjs:object');
var { transform, filter, intersperse, find } = require('sjs:sequence');

//----------------------------------------------------------------------
// Style

// style overrides applying to all our docs:
var DocsStyle   = Style('
  td > p { margin:0 }
');

var OptArgStyle = Style('{color:#888}');
var DefvalStyle = Style('{font-style:italic}');

//----------------------------------------------------------------------
// function signature for the given function symbol `f` and (possibly undefined) class `cls`:
var signature = (f, cls) -> 
  `<h2>${f.type=='ctor'&&!f.nonew? 'new '}${cls? cls.toLowerCase()+'.'}${f.name}($paramlist(f.param||[]))${
      f['return']? ` $Icon('arrow-right') ${f['return'].valtype}`
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
     <td>${p.valtype}${p.defval? `<br>Default: ${p.defval}` .. DefvalStyle}</td>
     <td>${p.summary ? Markdown(p.summary)}</td>
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
         <td>${rv.valtype}</td><td>${rv.summary? Markdown(rv.summary)}</td>
       </trow>
     </tbody>
   </table>`;

//----------------------------------------------------------------------
// list of functions constructed from the hash 'symbols'

var functionslist = (symbols, cls, ftype) -> Accordion(values(symbols) .. 
    filter({type} -> type==ftype) ..
    transform(symbol -> 
              [`$signature(symbol, cls) 
                ${symbol.summary? Markdown(symbol.summary)}`,
               `${symbol.param ? paramtable(symbol.param)}
                ${symbol['return'] ? returnvalue(symbol['return'])}
                ${symbol.setting ? settingtable(symbol.setting)}
                ${symbol.desc? Markdown(symbol.desc)}`
              ]));

//----------------------------------------------------------------------
// list of classes constructed from the hash 'classes'

var classlist = classes -> Accordion(values(classes) ..
    transform(cls ->
              [`<h2>${cls.name}</h2>
                ${cls.summary? Markdown(cls.summary)}`,
               `
               <h3>Constructor:</h3>
               ${cls.symbols? functionslist(cls.symbols, undefined, 'ctor')}
               <hr>
               <h3>Methods:</h3>
               ${cls.symbols? functionslist(cls.symbols, cls.name, 'function')}
               <hr>
               ${cls.desc? Markdown(cls.desc)}
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
          ${docs.summary ? `<br><small>$Markdown(docs.summary)</small>`}
        </h1>

      ${docs.hostenv ? 
        `<p>$Label('warning', 'Note') This module only works in the '${docs.hostenv}' host environment.</p>`
       }

      ${docs.desc ? Markdown(docs.desc) }
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

