var { Widget, RequireStyle, Mechanism, Class, Attrib }  = require('./html');
var { map, join, each } = require('sjs:sequence');

// theme->styles cache; we want to cache these, because each
// `RequireStyle` constructor generates a new scope id
var styles = {
  'default' : RequireStyle("/__mho/surface/bootstrap.css")
};

var BootstrapStyle = function(html, theme) {
  if (!theme) theme = 'default';
  var style = styles[theme];
  if (!style)
    style = styles[theme] = RequireStyle("/__mho/surface/bootstrap.css?theme=#{theme}");
  return html .. style;
};

// We run a few common mechanisms globally for Bootstrap() elements. Other, less common ones, like mechanisms.accordion, are run locally.
var BootstrapMechanism = Mechanism("
  // XXX we only need the 'mechanisms' module, but we preload some of *its* dependencies in parallel, for performance reasons. When we implement dependency bundling of sorts, this will be unnecessary
  waitfor { require('sjs:array'); }
  and { require('sjs:cutil');     }
  and { require('sjs:events');    }
  and { require('sjs:xbrowser/dom');       }
  and { var mechanisms = require('mho:surface/bootstrap/mechanisms'); }

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

/**
   @function Label
*/
exports.Label = (type, title) ->
  Widget('span', title, {'class':"label #{type? "label-#{type}" : ''}"});

/**
   @Accordion
*/
// The accordion mechanism works a bit different to bootstrap's. We use a data-toggle='accordion' attribute and don't require the href/id's of bootstrap's scheme
var AccordionMechanism = Mechanism("
  require('mho:surface/bootstrap/mechanisms').accordion(this);
");

exports.Accordion = (groups) -> 
  Widget('div', 
         groups .. 
         map([heading,body] -> 
             `<div class='accordion-group'>
                <div class='accordion-heading'>
                  <div class='accordion-toggle' 
                       data-toggle='accordion'>$heading</div>
                </div>
                <div class='accordion-body collapse'>
                  <div class='accordion-inner'>$body</div>
                </div>
              </div>`),
         {'class':'accordion'}) .. AccordionMechanism;

/**
   XXX we could factor out the accordion toggle to provide more flexibiliy in accordion headers, but TBH this is probably overkill

   @AccordionToggle
exports.AccordionToggle = (content) ->
  Widget('a', content) .. Class('accordion-toggle') .. Attrib('data-toggle', 'accordion') .. Attrib('href','#');
*/