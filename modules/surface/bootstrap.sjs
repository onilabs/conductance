var { Widget, RequireStyle, Mechanism }  = require('./html');
var { map, join, each } = require('sjs:sequence');

var BootstrapStyle = (html, theme) -> 
  html .. RequireStyle("/__mho/surface/bootstrap.css#{theme? "?theme=#{theme}" : '' }");

var BootstrapMechanism = Mechanism("
  var mechanisms = require('mho:surface/bootstrap/mechanisms');
  waitfor { mechanisms.dropdowns(this);     }
  and     { mechanisms.dismissAlerts(this); }
  and     { mechanisms.tabbing(this);       }
");

/**
   @function Bootstrap
*/
function Bootstrap(content, theme) {
  return Widget('div', content) .. BootstrapStyle(theme) .. BootstrapMechanism;
}
exports.Bootstrap = Bootstrap;

/**
   @function Container
*/
exports.Container = content -> Widget('div', content, {'class':'container'});

/**
   @function H1
*/
exports.H1 = content -> Widget('h1', content);
/**
   @function H2
*/
exports.H2 = content -> Widget('h2', content);
/**
   @function H3
*/
exports.H3 = content -> Widget('h3', content);

/**
   @function Span
*/
exports.Span = content -> Widget('span', content);

/**
   @function Icon
*/
exports.Icon = name -> Widget('i', undefined, {'class':"icon-#{name}"});

/**
   @function Btn
*/
var Btn = content -> Widget('button', content || 'Btn', {'class':'btn'});
exports.Btn = Btn;


/**
   @function Select
*/
exports.Select = options ->
  Widget('select',
         options .. map({title,value} -> `<option value='$value'>$title</option>`));

var DropdownMenu = items -> 
  Widget('ul',
         items .. 
         map(({name, url}) -> 
             `<li><a tabindex='-1' href='${url||'#'}'>$name</a></li>`),
         {'class':'dropdown-menu'});


/**
   @function BtnDropdown
*/
exports.BtnDropdown = (title, items) ->
  Widget('div',
         `<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>
         ${title}
         <span class='caret'></span>
         </a>
         $DropdownMenu(items)
         `,
         {'class':'btn-group'});
