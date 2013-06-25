//----------------------------------------------------------------------
// dynamic surface:
// if hostenv == xbrowser

var { ensureWidget, Mechanism, collapseHtmlFragment } = require('./html');
var { propertyPairs, keys } = require('sjs:object');
var { Stream, toArray, map, filter, each, reverse, combine } = require('sjs:sequence');
var { split } = require('sjs:string');
var { wait } = require('sjs:events');
var { isObservable, Value } = require('../observable');

//----------------------------------------------------------------------
// global ref counted resource registry that adds/removes resources to
// the document
var stylesInstalled = {};
var mechanismsInstalled = {};

var resourceRegistry = {
  useStyleDefs: function(defs) {
    propertyPairs(defs) .. each {
      |[id, [cnt,def]]|
      var desc;
      if (!(desc = stylesInstalled[id])) {
        desc = stylesInstalled[id] = { ref_count: cnt, elem: def.createElement() };
        (document.head || document.getElementsByTagName("head")[0] /* IE<9 */).appendChild(desc.elem);
        // wait for stylesheet to load for an arbitrary maximum of 2s; 
        // display warning in console if it hasn't loaded by then.
        // XXX we should refactor the code to allow loading of stylesheets in parallel!
        waitfor {
          desc.elem .. wait('load');
        }
        or {
          hold(2000);
          console.log("Warning: Stylesheet #{def} taking long to load");
        }
      }
      else {
        desc.ref_count += cnt;
      }
    }   
  },
  unuseStyleDefs: function(defs) {
    keys(defs) .. each { 
      |id|
      this.unuseStyle(id);
    }
  },
  unuseStyle: function(id) {
    console.log("Unusing style #{id}");
    var desc = stylesInstalled[id];
    if (!desc) console.log("Warning: Trying to unuse unknown style #{id}")
    if (--desc.ref_count === 0) {
      // XXX might actually want to cache this for a while
      desc.elem.parentNode.removeChild(desc.elem);
      delete stylesInstalled[id];
    }
  },
  // XXX no real need to go through the whole use/unuse machinery for
  // typeof code == function
  useMechanisms: function(mechs) {
    propertyPairs(mechs) .. each {
      |[id, code]|
      var desc;
      if (!(desc = mechanismsInstalled[id])) {
        desc = mechanismsInstalled[id] = {
          ref_count: 1,
          func: (typeof code === 'function') ? 
            code :
            require('builtin:apollo-sys').eval("(function(){#{code}})")
        };
      }
      else {
        ++desc.ref_count;
      }
    }
  },
  unuseMechanisms: function(ids) {
    ids .. each {
      |id|
      var desc = mechanismsInstalled[id];
      --desc.ref_count;
      /*
        we don't actually want to purge the mechanism immediately... we want 
        to cache mechanisms for a while

        XXX implement lru caching or something similar

      if (--desc.ref_count === 0) {
        delete mechanismsInstalled[id];
      }
      */
    }
  },

};
exports.resourceRegistry = resourceRegistry;


//----------------------------------------------------------------------
// main dynamic api

// helpers

function stopMechanisms(elems) {
  elems .. each {
    |elem|
    (elem.__oni_mechs || []) .. each {
      |stratum|
      stratum.abort();
    }
    delete elem.__oni_mechs;
  }
}

function unuseStyles(elems) {
  elems .. each {
    |elem|
    elem.getAttribute('class') .. split(' ') .. each {
      |cls|
      var matches = /_oni_style(\d+)_/.exec(cls);
      if (!matches) continue;
      resourceRegistry.unuseStyle(matches[1]);
    }
  }
}

function runMechanisms(elem, content_only) {
  elem.querySelectorAll('[data-oni-mechanisms]') ..
    combine((!content_only && elem.hasAttribute('data-oni-mechanisms')) ? [elem] : []) ..
    reverse .. // we want to start mechanisms in post-order; querySelectorAll is pre-order
    each {
      |elem|
      elem.__oni_mechs = [];
      elem.getAttribute('data-oni-mechanisms').split(' ') ..
        filter .. // only truthy elements
        each {
          |mech|
          elem.__oni_mechs.push(spawn mechanismsInstalled[mech].func.call(elem, elem));
        }
    }
}

function insertHtml(html, doInsertHtml) {
  html = collapseHtmlFragment(html);
  
  // install styles and mechanisms
  var styles = html.getStyleDefs();
  resourceRegistry.useStyleDefs(styles);
  var mechs = html.getMechanisms();
  resourceRegistry.useMechanisms(mechs);

  try {
    doInsertHtml(html);
  }
  catch (e) {
    resourceRegistry.unuseStyleDefs(styles);
    throw e;
  }
  finally {
    // now they have been run (or not), we can tell the resource registry to
    // remove the mechanisms again
    resourceRegistry.unuseMechanisms(propertyPairs(mechs) .. map([id, code] -> id) .. toArray);
  }
}

// generate a stream of nodes between the two boundary points
function nodes(parent, before_node, after_node) {

  // make sure we have stable reference points; text nodes get
  // collected together when we insert something
  while (before_node && before_node.nodeType != 1) before_node = before_node.previousSibling;
  while (after_node && after_node.nodeType != 1) after_node = after_node.nextSibling;

  return Stream(function(r) {
    var node = before_node ? before_node.nextSibling :
      parent.firstChild;
    while (node != after_node) {
      if (node.nodeType == 1) r(node);
      node = node.nextSibling;
    }
  });
}


/**
   @function replaceContent
*/
function replaceContent(parent_node, html) {
  insertHtml(html, function(html) {
    parent_node.querySelectorAll('._oni_mech_') .. stopMechanisms();
    parent_node.querySelectorAll('._oni_style_') .. unuseStyles();

    parent_node.innerHTML = html.getHtml();

    parent_node .. runMechanisms(true);
  });
}
exports.replaceContent = replaceContent;

/**
   @function replaceElement
*/
function replaceElement(old_elem, html) {
  var inserted_nodes = nodes(old_elem.parentNode, old_elem.previousSibling, old_elem.nextSibling);
  insertHtml(html, function(html) {
    combine([old_elem], old_elem.querySelectorAll('._oni_mech_')) .. stopMechanisms();
    combine([old_elem], old_elem.querySelectorAll('._oni_style_')) .. unuseStyles();
    
    old_elem.outerHTML = html.getHtml();
    
    inserted_nodes .. each(runMechanisms);
  });
}
exports.replaceElement = replaceElement;

/**
   @function appendContent
*/
function appendContent(parent_node, html) {
  insertHtml(html, function(html) {
    var inserted_nodes = nodes(parent_node, parent_node.lastChild, null);
    parent_node.insertAdjacentHTML('beforeend', html.getHtml());
    inserted_nodes .. each(runMechanisms);
  });
}
exports.appendContent = appendContent;

/**
   @function prependContent
*/
function prependContent(parent_node, html) {
  var inserted_nodes = nodes(parent_node, null, parent_node.firstChild);
  insertHtml(html, function(html) {
    parent_node.insertAdjacentHTML('afterbegin', html.getHtml());
    inserted_nodes .. each(runMechanisms);
  });
}
exports.prependContent = prependContent;

/**
   @function insertBefore
*/
function insertBefore(sibling, html) {
  var inserted_nodes = nodes(sibling.parentNode, sibling.previousSibling, sibling);
  insertHtml(html, function(html) {
    sibling.insertAdjacentHTML('beforebegin', html.getHtml());
    inserted_nodes .. each(runMechanisms);
  });
}
exports.insertBefore = insertBefore;

/**
   @function insertAfter
*/
function insertAfter(sibling, html) {
  var inserted_nodes = nodes(sibling.parentNode, sibling, sibling.nextSibling);
  insertHtml(html, function(html) {
    sibling.insertAdjacentHTML('afterend', html.getHtml());
    inserted_nodes .. each(runMechanisms);
  });
}
exports.insertAfter = insertAfter;


/**
   @function removeElement
*/
function removeElement(elem) {
  // stop our mechanism and all mechanisms below us
  combine([elem], elem.querySelectorAll('._oni_mech_')) ..
    stopMechanisms();

  if (elem.parentNode)
    elem.parentNode.removeChild(elem);
  
  // unuse our styles and all styles below us
  combine([elem], elem.querySelectorAll('._oni_style_')) ..
    unuseStyles();
}
exports.removeElement = removeElement;


/**
   @function appendWidget
*/
function appendWidget(parent_node, html) {
  html= ensureWidget(html);
  
  var elem = html.createElement();

  insertHtml(html, function(html) {
    parent_node.appendChild(elem);

    // run mechanisms:
    elem .. runMechanisms();
  });

  return elem;
}
exports.appendWidget = appendWidget;


/**
   @function withWidget
*/
function withWidget(parent_node, html, block) {
  var elem = parent_node .. appendWidget(html);
  try {
    block(elem);
  }
  finally {
    removeElement(elem);
  }
}
exports.withWidget = withWidget;

//----------------------------------------------------------------------

// set a property on a widget
function Prop(html, name, value) {
  return html .. Mechanism(function(node) {
    if (!isObservable(value)) 
      node[name] = value;
    else {
      node[name] = value.get();
      value.observe {
        |change|
        node[name] = Value(value);
      }
    }
  });
}
exports.Prop = Prop;

//----------------------------------------------------------------------

// set an event handler:

var OnEvent = (html, event, f) -> html .. Mechanism(function(node) {
  // xxx should use queue
  while (1) {
    var ev = node .. wait(event);
    f(ev);
  }
});
exports.OnEvent = OnEvent;

var OnClick = (html, f) -> html .. OnEvent('click', f);
exports.OnClick = OnClick;



