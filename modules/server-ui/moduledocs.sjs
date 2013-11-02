@ = require(['mho:stdlib', {id:'mho:surface/bootstrap/html', exclude:['Map','Style'] }]);

var { parseModuleDocs } = require('sjs:docutil');
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
  @RawHTML;

//----------------------------------------------------------------------
// Style

// style overrides applying to all our docs:
var DocsStyle   = @Style('
  @global  { 
    body { padding-top: 70px; }
  } 
');

var OptArgStyle = @Style('{color:#888}');
var DefvalStyle = @Style('{font-style:italic}');

//----------------------------------------------------------------------
// function to markup types:
var type = (ts) -> 
  (ts||'').split('|') .. 
  @transform(t -> t.trim() .. resolveLink) .. 
  @intersperse(' | ') .. @join .. @RawHTML;

//----------------------------------------------------------------------
// function signature for the given function symbol `f` and (possibly undefined) class `cls`:
var signature = (name, f, cls) -> 
  `<div class='panel-heading'><h4>${f.type=='ctor'&&!f.nonew? 'new '}${cls? cls.toLowerCase()+'.'}${name}($paramlist(f.param||[]))${
      f['return']? `<div class='pull-right'>$@Icon('arrow-right') $type(f['return'].valtype)</div>`
    }${
      f.altsyntax? f.altsyntax .. @transform(s -> `<br>${s}`)
      }</h4></div>`;
var paramlist = (ps) -> 
  ps .. 
  @transform(function(p) {
    var rv = p.name || '.';
    if (p.valtype && p.valtype.indexOf('optional')!=-1)
      rv = @Span(`[$rv]`) .. OptArgStyle;
    return rv;
  }) ..
  @intersperse(', ');
   
//---------------------------------------------------------------------- 
// table of function parameters:
var paramtable = (ps) ->
  `<h5>Parameters:</h5>
   <table class='table table-striped table-bordered'>
     <tbody>
      ${ps .. @transform(paramrow)}
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
  `<h5>Settings:</h5>
   <table class='table table-striped table-bordered'>
     <tbody>
       ${ss .. @transform(paramrow)}
     </tbody>
   </table>`;

//----------------------------------------------------------------------
// return value details:
var returnvalue = (rv) ->
  `<h5>Return Value:</h5>
   <table class='table table-striped table-bordered'>
     <tbody>
       <trow>
         <td>$type(rv.valtype)</td><td>${rv.summary? DocsMarkdown(rv.summary)}</td>
       </trow>
     </tbody>
   </table>`;

//----------------------------------------------------------------------
// list of functions constructed from the hash 'symbols'

var functionslist = (symbols, cls, ftype) -> @Div(@propertyPairs(symbols) .. 
    @filter([,{type}] -> type==ftype) ..
    @transform([name, symbol] ->
               `<div class='panel panel-default'>
                  <a id='${ftype=='ctor'? name+'::'}${cls? cls+'::'}${name}'></a>$signature(name, symbol, cls)
                  <div class='panel-body'>
                    ${symbol.summary? DocsMarkdown(symbol.summary)}
                    ${symbol.param ? paramtable(symbol.param)}
                    ${symbol['return'] ? returnvalue(symbol['return'])}
                    ${symbol.setting ? settingtable(symbol.setting)}
                    ${symbol.desc? DocsMarkdown(symbol.desc)}
                  </div>
                </div>`));

//----------------------------------------------------------------------
// list of classes constructed from the hash 'classes'

var classlist = symbols -> @Div(@propertyPairs(symbols) ..
    @filter([,{type}] -> type=='class') ..
    @transform([name, cls] ->
               `<div class='panel panel-default'>
                  <a id='${name}'></a><div class='panel-heading'><h4>${name}</h4></div>
                  <div class='panel-body'>
                    ${cls.summary? DocsMarkdown(cls.summary)}
                    <h5>Constructor:</h5>
                    ${cls.children? functionslist(cls.children, undefined, 'ctor')}
                    <hr>
                    <h5>Methods:</h5>
                    ${cls.children? functionslist(cls.children, name, 'function')}
                    <hr>
                    ${cls.desc? DocsMarkdown(cls.desc)}
                  </div>
                </div>
               `
              ));

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

  return [     
    `<nav class='navbar navbar-default navbar-fixed-top' role='navigation'></nav>`,
    @Container(
    `
      <div class='page-header'>
        <h1>${docs.module ? `The ${docs.module} module` : name}
          ${docs.summary ? `<br><small>$DocsMarkdown(docs.summary)</small>`}
        </h1>

      ${docs.hostenv ? 
        `<p>$@Label('Note', {type:'warning'}) This module only works in the '${docs.hostenv}' host environment.</p>`
       }

      ${docs.desc ? DocsMarkdown(docs.desc) }
      <hr>
      <h2>Functions:</h2>
      $functionslist(docs.children, undefined, 'function')
      <hr>
      <h2>Classes:</h2>
      $classlist(docs.children)
      <hr>
      <h2>Source code:</h2>
      <pre>$src</pre>
      <hr>
      <h3>Output from docs parsing (just temporarily for debugging):</h3>
      <pre>${require('sjs:debug').inspect(docs, false, 6)}</pre>
    `)] .. DocsStyle;
};

