// XXX get rid of bootstrap dependency
var { Bootstrap, Container, Label, Accordion, Span, Icon } = require('../surface/bootstrap');
var { Markdown, Attrib, Style } = require('../surface');

//----------------------------------------------------------------------
//

/**
   @function generateMarkdown
   @param {String} [src] Markdown file source
   @return {HtmlFragment}
*/
exports.generateMarkdown = function(src) {

  try {
    return Bootstrap(Container(Markdown(src, {sanitize:true})));
  }
  catch (e) {
    return `
      <p>Error parsing markdown file</p>
      <pre>$src</pre>`;

  }    
};

