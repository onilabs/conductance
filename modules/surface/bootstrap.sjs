var html  = require('./html');
var { map, join, each } = require('sjs:sequence');

var BootstrapStyle = html.RequireStyle('/__mho/surface/bootstrap.css');
var BootstrapMechanism = html.Mechanism("
  var mechanisms = require('mho:surface/bootstrap/mechanisms');
  waitfor { mechanisms.dropdowns(this);     }
  and     { mechanisms.dismissAlerts(this); }
  and     { mechanisms.tabbing(this);       }
");

function Bootstrap(content) {
  return html.Widget(content) .. BootstrapStyle .. BootstrapMechanism;
}
exports.Bootstrap = Bootstrap;

function H1(content) {
  return html.Widget(content, 'h1');
}
exports.H1 = H1;

exports.Icon = name -> html.Widget('', 'i', {'class':"icon-#{name}"});

function Btn(content) {
  content = content || 'Btn';
  return html.Widget(content, 'button', {'class':'btn'});
}
exports.Btn = Btn;

exports.Container = content -> html.Widget(content, 'div', {'class':'container'});

var DropdownMenu = items -> 
  `${
      items .. map(({name, url}) -> `<li><a tabindex='-1' href='${url||'#'}'>$name</a></li>`)
    }` .. html.Widget('ul', {'class':'dropdown-menu'});


exports.BtnDropdown = (title, items) ->
  `<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>
     ${title}
     <span class='caret'></span>
   </a>
   $DropdownMenu(items)
  ` .. 
  html.Widget('div', {'class':'btn-group'});