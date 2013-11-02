@ = require(['mho:stdlib', {id:'mho:surface/bootstrap/html', exclude:['Map','Style'] }]);

//----------------------------------------------------------------------
//

/**
   @function generateMarkdown
   @param {String} [src] Markdown file source
   @return {HtmlFragment}
*/
exports.generateMarkdown = function(src) {

  try {
    return @Markdown(src, {sanitize:true});
  }
  catch (e) {
    return `
      <p>Error parsing markdown file (${e})</p>
      <pre>$src</pre>`;

  }    
};
