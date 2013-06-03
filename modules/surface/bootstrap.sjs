var html  = require('./html');

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

function Btn(content) {
  content = content || 'Btn';
  return html.Widget(content, 'button', {'class':'btn'});
}
exports.Btn = Btn;

exports.Container = content -> html.Widget(content, 'div', {'class':'container'});

exports.Dropdown = items -> 
  `<ul class='dropdown-menu'>${
      items .. map(({name, url}) -> `<li><a tabindex='-1' href='${url||'#'}'>$name</a></li>`)
    }</ul>` .. html.Widget('div', {'class':'dropdown'});

