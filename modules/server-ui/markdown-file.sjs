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

@ = require(['mho:std', 'mho:surface/bootstrap/html']);

//----------------------------------------------------------------------
//

/**
   @function generateMarkdown
   @summary Generate HTML from a Markdown file
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
