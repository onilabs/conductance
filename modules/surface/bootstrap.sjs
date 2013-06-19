var html  = require('./html');
var { map, join, each } = require('sjs:sequence');

var BootstrapStyle = html.RequireStyle('/__mho/surface/bootstrap.css');
var BootstrapMechanism = html.Mechanism("
  var mechanisms = require('mho:surface/bootstrap/mechanisms');
  waitfor { mechanisms.dropdowns(this);     }
  and     { mechanisms.dismissAlerts(this); }
  and     { mechanisms.tabbing(this);       }
");

/**
   @function Bootstrap
*/
function Bootstrap(content) {
  return html.Widget('div', content) .. BootstrapStyle .. BootstrapMechanism;
}
exports.Bootstrap = Bootstrap;

/**
   @function Container
*/
exports.Container = content -> html.Widget('div', content, {'class':'container'});

/**
   @function H1
*/
exports.H1 = content -> html.Widget('h1', content);
/**
   @function H2
*/
exports.H2 = content -> html.Widget('h2', content);
/**
   @function H3
*/
exports.H3 = content -> html.Widget('h3', content);

/**
   @function Span
*/
exports.Span = content -> html.Widget('span', content);

/**
   @function Icon
*/
exports.Icon = name -> html.Widget('i', undefined, {'class':"icon-#{name}"});

/**
   @function Btn
*/
var Btn = content -> html.Widget('button', content || 'Btn', {'class':'btn'});
exports.Btn = Btn;


/**
   @function Select
*/
exports.Select = options ->
  html.Widget('select',
              options .. map({title,value} -> `<option value='$value'>$title</option>`));

var DropdownMenu = items -> 
  html.Widget('ul',
              items .. 
              map(({name, url}) -> 
                  `<li><a tabindex='-1' href='${url||'#'}'>$name</a></li>`),
              {'class':'dropdown-menu'});


/**
   @function BtnDropdown
*/
exports.BtnDropdown = (title, items) ->
  html.Widget('div',
              `<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>
               ${title}
              <span class='caret'></span>
              </a>
              $DropdownMenu(items)
              `,
              {'class':'btn-group'});
