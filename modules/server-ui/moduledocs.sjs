var { parseModuleDocs } = require('sjs:docutil');
// XXX get rid of bootstrap dependency
var { Bootstrap, Container, Label } = require('../surface/bootstrap');
var { Markdown } = require('../surface');

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
      <h3>Source code:</h3>
      <pre>$src</pre>
      <hr>
      <h3>Output from docs parsing (just temporarily for debugging):</h3>
      <pre>${require('sjs:debug').inspect(docs)}</pre>
    `));
};

