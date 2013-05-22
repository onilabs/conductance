var html  = require('./surface/html');
var { values, propertyPairs } = require('sjs:object');
var { map, join, each } = require('sjs:sequence');

//----------------------------------------------------------------------
exports.CSSDocument = function(content, parent_class) {
  parent_class = parent_class || '';
  return require('./surface/css').scope(content, parent_class);
};

//----------------------------------------------------------------------

exports.Document = function(content) {

  content = html.collapseFragmentTree(content);

  return "\
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    #{
        values(content.getStyleDefs()) .. 
        map(def -> def.getHtml()) .. 
        join('\n')
    }
    <script src='/__sjs/oni-apollo.js'></script>
    <script type='text/sjs'>
      require.hubs.push(['mho:', '/__mho/']);
      require.hubs.push(['\u2127:', 'mho:']);
      #{
        // XXX need to escape </script> -> <\/script> in #{code} below!!!
        propertyPairs(content.getMechanisms()) .. 
        map([id, code] -> "function __oni_mechanism_#{id}(){ #{code} }") ..
        join('\n')
      }

      #{
        content.getMechanismUses() ..
        map([mech_id, use_id] -> 
          "spawn __oni_mechanism_#{mech_id}.apply(document.querySelector('[data-oni-mechanism~=\"#{use_id}\"]'));") ..
        join('\n')
      }
    </script>
  </head>
  <body>#{content.getHtml()}</body>
</html>
";
};

//----------------------------------------------------------------------

exports.Style = html.Style;
exports.Mechanism = html.Mechanism;

//----------------------------------------------------------------------

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

//----------------------------------------------------------------------
// dynamic surface:
// if hostenv == xbrowser

// global ref counted resource registry that adds/removes resources to the document
var stylesInstalled = {};
var mechanismsInstalled = {};
var mechanismsUsed = {};

var resourceRegistry = {
  withMechanisms: function(mechanisms, block) {
    propertyPairs(mechanisms) .. each {
      |[id, code]|
      var desc;
      if (!(desc = mechanismsInstalled[id])) {
        desc = mechanismsInstalled[id] = { 
          ref_count: 1, 
          func: require('builtin:apollo-sys').eval("(function(){#{code}})")
        };
      }
      else {
        ++desc.ref_count;
      }
    }

    try {
      block();
    }
    finally {
      // remove functions 
      // XXX should we just leave them be?
      propertyPairs(mechanisms) .. each {
        |[id, code]|
        var desc = mechanismsInstalled[id];
        if (--desc.ref_count === 0) {
          delete mechanismsInstalled[id];
        }
      }
    }
  },

  withMechanismUses: function(uses, block) {
    uses .. each {
      |[mech_id, use_id]|
      mechanismsUsed[use_id] = spawn mechanismsInstalled[mech_id].func.apply(document.querySelector("[data-oni-mechanism~=\"#{use_id}\"]"));
    }
    
    try {
      block();
    }
    finally {
      // kill any running strata
      uses .. each {
        |[mech_id, use_id]|
        mechanismsUsed[use_id].abort();
        delete mechanismsUsed[use_id];
      }
    }
  },

  withStyleDefs: function(defs, block) {
    propertyPairs(defs) .. each { 
      |[id, def]|
      var desc;
      if (!(desc = stylesInstalled[id])) {
        desc = stylesInstalled[id] = { ref_count: 1, elem: def.createElement() };
        (document.head || document.getElementsByTagName("head")[0] /* IE<9 */).appendChild(desc.elem);
      }
      else {
        ++desc.ref_count;
      }
    }

    try {
      block();
    }
    finally {
      // remove style defs

      propertyPairs(defs) .. each {
        |[id, def]|
        var desc = stylesInstalled[id];
        if (--desc.ref_count === 0) {
          desc.elem.parentNode.removeChild(desc.elem);
          delete stylesInstalled[id];
        }
      }
    }
  }
};
exports.resourceRegistry = resourceRegistry;

function withUI(parent, ft, block) {
  ft = html.ensureWidget(ft);
  
  resourceRegistry.withStyleDefs(ft.getStyleDefs()) {
    ||

    var elem = ft.createElement();

    try {
      parent.appendChild(elem);

      resourceRegistry.withMechanisms(ft.getMechanisms()) {
        ||
        resourceRegistry.withMechanismUses(ft.getMechanismUses()) {
          ||
          block(elem);
        }
      }
    }
    finally {
      parent.removeChild(elem);
    }
  }
}
exports.withUI = withUI;
