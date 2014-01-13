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

var LinenumberStyle = @Style("
  { padding-right:1em; 
    white-space: nowrap;
    vertical-align: top;
  }
  a { color: #ccc; }
");

exports.generateModuleDoc = function(path, src) {
  return @Container(
    `$@PageHeader(`$path <small class='pull-right'>(<a href='${@url.build(path,{format:"src"})}'>raw source</a>)</small>`)
     <pre><table><tbody>${
       src.split('\n') .. @indexed(1) ..
         @map([i,line] -> `<tr id='L$i'>${@Td(`<a href='#L$i'>$i</a>`) .. LinenumberStyle}</td><td>$line</td></tr>`)
     }</tbody></table></pre>
    `);
};
