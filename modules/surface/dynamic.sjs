/**
  @nodoc
  @noindex
  (documented as mho:surface)
 */

//----------------------------------------------------------------------
// dynamic surface:
// if hostenv == xbrowser

var { ensureWidget, Mechanism, collapseHtmlFragment } = require('./base');
var { propertyPairs, keys, merge } = require('sjs:object');
var { isStream, Stream, toArray, map, filter, each, reverse, concat, first, take, indexed } = require('sjs:sequence');
var { split } = require('sjs:string');
var { wait, when } = require('sjs:event');

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
        desc = stylesInstalled[id] = { ref_count: cnt, elem: def.createElement(), mechanism: def.mechanism };
        (document.head || document.getElementsByTagName("head")[0] /* IE<9 */).appendChild(desc.elem);
        if (desc.mechanism) {
          desc.elem.__oni_mech = spawn(desc.mechanism.call(desc.elem, desc.elem));
        }
        if (def.waitforLoading) {
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
    var desc = stylesInstalled[id];
    if (!desc) { console.log("Warning: Trying to unuse unknown style #{id}"); return; }
    if (--desc.ref_count === 0) {
      if (desc.elem.__oni_mech) {
        desc.elem.__oni_mech.abort();
        delete desc.elem.__oni_mech;
      }
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
  }
};
exports.resourceRegistry = resourceRegistry;


//----------------------------------------------------------------------
// main dynamic api

// helpers

function stopMechanisms(parent, include_parent) {
  var nodes = concat(parent.querySelectorAll('._oni_mech_'), StreamNodes(parent));
  if (include_parent)
    nodes = concat([parent], nodes);

  nodes .. each {
    |node|
    if (!node.__oni_mechs) continue;
    node.__oni_mechs .. each {
      |stratum|
      stratum.abort();
    }
    delete node.__oni_mechs;
  }
}

function unuseStyles(elems) {
  elems .. each {
    |elem|
    (elem.getAttribute('class')||'') .. split(' ') .. each {
      |cls|
      var matches = /_oni_style(\d+)_/.exec(cls);
      if (!matches) continue;
      resourceRegistry.unuseStyle(matches[1]);
    }
  }
}

// XXX DOM module backfill?
// returns a stream of comment nodes:
function CommentNodes(node) {
  return Stream(function(r) {
    var walker = document.createTreeWalker(
      node, NodeFilter.SHOW_COMMENT, null, false);
    while (walker.nextNode()) {
      r(walker.currentNode);
    }
  });
}

function StreamNodes(elem) {
  return CommentNodes(elem) .. 
    filter({nodeValue} -> nodeValue.indexOf('surface_stream')!== -1);
}

function runMechanisms(elem, content_only) {
  if (elem.nodeType == 1) {
    elem.querySelectorAll('[data-oni-mechanisms]') ..
      concat((!content_only && elem.hasAttribute('data-oni-mechanisms')) ? [elem] : []) ..
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
    
    // start streams:
    StreamNodes(elem) .. each { 
      |node| 
      var [,mech] = node.nodeValue.split("|");
      node.__oni_mechs = [spawn mechanismsInstalled[mech].func.call(node, node)];
    }
  }
  else if (elem.nodeValue.indexOf('surface_stream') !== -1) {
    // we assume nodetype == 8 (comment node)
    var [,mech] = elem.nodeValue.split("|");
    elem.__oni_mechs = [spawn mechanismsInstalled[mech].func.call(elem,elem)];
  }
}

function insertHtml(html, doInsertHtml) {
  html = collapseHtmlFragment(html);
  
  // load external scripts:
  keys(html.getExternalScripts()) .. each {
    |url| require('sjs:xbrowser/dom').script(url);
  }

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

// generate a stream of element & comment nodes between the two
// boundary points. The stream will be used to start mechanisms on
function nodes(parent, before_node, after_node) {

  // make sure we have stable reference points; text nodes get
  // collected together when we insert something
  while (before_node && 
         before_node.nodeType != 1 && 
         before_node.nodeType != 8)
    before_node = before_node.previousSibling;
  while (after_node && 
         after_node.nodeType != 1 &&
         after_node.nodeType != 8) 
    after_node = after_node.nextSibling;

  return Stream(function(r) {
    var node = before_node ? before_node.nextSibling :
      parent.firstChild;
    while (node != after_node) {
      if (node.nodeType == 1 || node.nodeType == 8) r(node);
      node = node.nextSibling;
    }
  });
}


/**
   @function replaceContent
*/
function replaceContent(parent_node, html) {
  insertHtml(html, function(html) {
    stopMechanisms(parent_node);
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
  var rv;
  insertHtml(html, function(html) {
    stopMechanisms(old_elem, true);
    concat([old_elem], old_elem.querySelectorAll('._oni_style_')) .. unuseStyles();
    
    old_elem.outerHTML = html.getHtml();
    rv = inserted_nodes .. first(null);
    inserted_nodes .. each(runMechanisms);
  });
  return rv;
}
exports.replaceElement = replaceElement;

/**
   @function appendContent
*/
function appendContent(parent_node, html) {
  var rv;
  
  insertHtml(html, function(html) {
    var inserted_nodes = nodes(parent_node, parent_node.lastChild, null);

    parent_node.insertAdjacentHTML('beforeend', html.getHtml());
    
    rv = inserted_nodes .. first(null);
    inserted_nodes .. each(runMechanisms);
  });

  return rv;
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
  var rv;

  var inserted_nodes = nodes(sibling.parentNode, sibling.previousSibling, sibling);
  insertHtml(html, function(html) {
    sibling.insertAdjacentHTML('beforebegin', html.getHtml());

    rv = inserted_nodes .. first(null);
    inserted_nodes .. each(runMechanisms);
  });

  return rv;
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
  stopMechanisms(elem, true);
  if (elem.parentNode)
    elem.parentNode.removeChild(elem);
  
  // unuse our styles and all styles below us
  concat([elem], elem.querySelectorAll('._oni_style_')) ..
    unuseStyles();
}
exports.removeElement = removeElement;


/**
   @function appendWidget
*/
function appendWidget(parent_node, html) {
  html= ensureWidget(html);
  
  var [elem, content] = html.createElement();
  elem.innerHTML = content.getHtml();

  insertHtml(content, function(fragment) {
    parent_node.appendChild(elem);

    // run mechanisms:
    elem .. runMechanisms();
  });

  return elem;
}
exports.appendWidget = appendWidget;

/**
   @function prependWidget
*/
function prependWidget(parent_node, html) {
  html= ensureWidget(html);
  
  var [elem, content] = html.createElement();
  elem.innerHTML = content.getHtml();

  insertHtml(content, function() {
    parent_node.insertBefore(elem, parent_node.firstChild);

    // run mechanisms:
    elem .. runMechanisms();
  });

  return elem;
}
exports.prependWidget = prependWidget;


/**
   @function withWidget
*/
function withWidget(parent_node, html, block) {
  var elem = parent_node .. appendWidget(html);
  try {
    return block(elem);
  }
  finally {
    removeElement(elem);
  }
}
exports.withWidget = withWidget;

//----------------------------------------------------------------------

// set a property on a widget
/**
  @function Prop
  @summary Add a javascript property to a widget
  @param {::Widget} [widget]
  @param {String} [name] Property name
  @param {String|sjs:sequence::Stream} [value] Property value
  @return {::Widget}
  @desc
    Sets a javascript property
    on the widget's root node once it is inserted into the document.

    See also [::Attrib].
*/
function Prop(html, name, value) {
  return html .. Mechanism(function(node) {
    if (!isStream(value))
      node[name] = value;
    else {
      value .. each { |v|
        node[name] = v;
      }
    }
  });
}
exports.Prop = Prop;

//----------------------------------------------------------------------

// set an event handler:

var OnEvent = (html, event, opts, f) -> html .. Mechanism(function(node) {
  if (!f) {
    // opts not given
    f = opts;
    opts = {};
  }
  node .. when(event, {queue: true} .. merge(opts), f);
});
exports.OnEvent = OnEvent;

var OnClick = (html, opts, f) -> html .. OnEvent('click', opts, f);
exports.OnClick = OnClick;



