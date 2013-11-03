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
    `$@PageHeader(path)
     <pre><table><tbody>${
       src.split('\n') .. @indexed(1) ..
         @map([i,line] -> `<tr>${@Td(`<a href='#$i'>$i</a>`) .. LinenumberStyle}</td><td>$line</td></tr>`)
     }</tbody></table></pre>
    `);
};