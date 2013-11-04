@ = require(['mho:stdlib', {id:'mho:surface/bootstrap/html', exclude:['Map','Style'] }]);

var LinenumberStyle = @Style("
  { padding-right:1em; 
    white-space: nowrap;
    vertical-align: top;
  }
  a { color: #ccc; }
");

exports.generateModuleDocs = function(path, src) {
  return @Container(
    `$@PageHeader(`$path <small class='pull-right'>(<a href='${@url.build(path,{format:"src"})}'>raw source</a>)</small>`)
     <pre><table><tbody>${
       src.split('\n') .. @indexed(1) ..
         @map([i,line] -> `<tr id='L$i'>${@Td(`<a href='#L$i'>$i</a>`) .. LinenumberStyle}</td><td>$line</td></tr>`)
     }</tbody></table></pre>
    `);
};