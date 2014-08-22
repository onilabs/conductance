/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @nodoc
  @noindex
  (documented as mho:surface)
 */

//----------------------------------------------------------------------
// dynamic surface:
// if hostenv == xbrowser

var { ensureElement, Mechanism, collapseHtmlFragment, Class, Attrib } = require('./base');
var { propertyPairs, keys, merge } = require('sjs:object');
var { isStream, Stream, toArray, map, filter, each, reverse, concat, first, take, indexed, takeWhile, transform } = require('sjs:sequence');
var { split } = require('sjs:string');
var { events, wait } = require('sjs:event');
var { waitforAll, StratumAborted } = require('sjs:cutil');

// DOM Node Types:
var ELEMENT_NODE = 1;
var TEXT_NODE    = 3;
var COMMENT_NODE = 8;

//----------------------------------------------------------------------
// global ref counted resource registry that adds/removes resources to
// the document
var cssInstalled = {};
var mechanismsInstalled = {};

var resourceRegistry = {
  useCSSDefs: function(defs) {
    propertyPairs(defs) .. each {
      |[id, [cnt,def]]|
      var desc;
      if (!(desc = cssInstalled[id])) {
        desc = cssInstalled[id] = { ref_count: cnt, elem: def.createElement(), mechanism: def.mechanism };
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
  unuseCSSDefs: function(defs) {
    keys(defs) .. each { 
      |id|
      this.unuseCSS(id);
    }
  },
  unuseCSS: function(id) {
    var desc = cssInstalled[id];
    if (!desc) { console.log("Warning: Trying to unuse unknown css #{id}"); return; }
    if (--desc.ref_count === 0) {
      if (desc.elem.__oni_mech) {
        desc.elem.__oni_mech.abort();
        delete desc.elem.__oni_mech;
      }
      // XXX might actually want to cache this for a while
      desc.elem.parentNode.removeChild(desc.elem);
      delete cssInstalled[id];
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
      /*
        XXX: we don't actually want to purge the mechanism immediately... we want
        to cache mechanisms for a while -
        implement lru caching or something similar
      */

      if (--desc.ref_count === 0) {
        delete mechanismsInstalled[id];
      }
    }
  }
};
exports.resourceRegistry = resourceRegistry;


//----------------------------------------------------------------------
// main dynamic api

// helpers

function stopMechanisms(parent, include_parent) {
  var nodes = StreamNodes(parent);
  if (parent.querySelectorAll)
    nodes = concat(parent.querySelectorAll('._oni_mech_'), nodes);
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

function unuseCSS(elems) {
  elems .. each {
    |elem|
    (elem.getAttribute('class')||'') .. split(' ') .. each {
      |cls|
      var matches = /_oni_css(\d+)_/.exec(cls);
      if (!matches) continue;
      resourceRegistry.unuseCSS(matches[1]);
    }
  }
}

// XXX DOM module backfill?
// returns a stream of comment nodes:
function CommentNodes(node) {
  return Stream(function(r) {
    if (node.nodeType !== ELEMENT_NODE) return;
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

function awaitStratumError(s) {
  // ignores stratum cancellation
  try {
    s.value();
  } catch(e) {
    if (!(e instanceof StratumAborted)) throw e;
  }
};

__js var fakeArray = { push: -> null };

function runMechanisms(elems, await) {
  var rv = await ? [] : fakeArray;
  var addMech = function(elem, mech) {
    var s = spawn mechanismsInstalled[mech].func.call(elem, elem);
    elem.__oni_mechs.push(s);
    rv.push(s);
  };

  elems .. each {|elem|
    if (elem.nodeType === ELEMENT_NODE) {

      var elems = elem.querySelectorAll('[data-oni-mechanisms]') ..
        reverse .. // we want to start mechanisms in post-order; querySelectorAll is pre-order
        concat(elem.hasAttribute('data-oni-mechanisms') ? [elem] : []) ..
        toArray;

      var streams = StreamNodes(elem) .. toArray;

      elems .. each {
          |elem|
          elem.__oni_mechs = [];
          elem.getAttribute('data-oni-mechanisms').split(' ') ..
            filter .. // only truthy elements
            each {
              |mech|
              elem .. addMech(mech);
            }
        }
      
      // start streams:
      streams .. each { 
        |node| 
        var [,mech] = node.nodeValue.split("|");
        node.__oni_mechs = [];
        node .. addMech(mech);
      }
    }
    else if (elem.nodeValue.indexOf('surface_stream') !== -1) {
      // we assume nodetype == COMMENT_NODE
      var [,mech] = elem.nodeValue.split("|");
      elem.__oni_mechs = [];
      elem .. addMech(mech);
    }
  }

  if (await) {
    return spawn(function() {
      try {
        waitforAll(awaitStratumError, rv);
        hold();
      } finally { 
        rv .. each(s -> s.abort());
      }
    }());
  }
}

function insertHtml(html, block, doInsertHtml) {
  html = collapseHtmlFragment(html);
  
  // load external scripts:
  keys(html.getExternalScripts()) .. each {
    |url| require('sjs:xbrowser/dom').script(url);
  }

  // load external css:
  keys(html.getExternalCSS()) .. each {
    |url| require('sjs:xbrowser/dom').css(url);
  }

  // install css and mechanisms
  var css = html.getCSSDefs();
  resourceRegistry.useCSSDefs(css);
  var mechs = html.getMechanisms();
  resourceRegistry.useMechanisms(mechs);

  try {
    var inserted = doInsertHtml(html) .. toArray;
    var mechResult = inserted .. runMechanisms(block);
  }
  catch (e) {
    resourceRegistry.unuseCSSDefs(css);
    throw e;
  }
  finally {
    // now they have been run (or not), we can tell the resource registry to
    // remove the mechanisms again
    resourceRegistry.unuseMechanisms(propertyPairs(mechs) .. map([id, code] -> id) .. toArray);
  }


  if (block) {
    try {
      waitfor {
        return block.apply(null, inserted .. filterElementsAndComments .. toArray);
      } or {
        mechResult.value();
      }
    }
    finally {
      inserted .. each(removeNode);
    }
  } else {
    return inserted .. filterElementsAndComments .. toArray;
  }
}

// generate a stream of nodes between the two
// boundary points. 
function nodes(parent, before_node, after_node) {
  return Stream(function(r) {
    var node = before_node ? before_node.nextSibling :
      parent.firstChild;
    while (node != after_node) {
      r(node);
      node = node.nextSibling;
    }
  });
}

// filter elements & comment nodes from the given node stream:
var filterElementsAndComments = s -> s .. filter(node -> node.nodeType == ELEMENT_NODE ||
                                                         node.nodeType == COMMENT_NODE);

//----------------------------------------------------------------------

/**
   @function replaceContent
   @altsyntax parent_element .. replaceContent(html)
   @summary Replace the content of a DOM element with a [::HtmlFragment]
   @param {DOMElement} [parent_element]
   @param {::HtmlFragment} [html] Html to insert
   @param {optional Function} [block] Function bounding lifetime of inserted content
   @return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
   @hostenv xbrowser
   @desc
     * See [::appendContent] for notes on the semantics and return value.
     * The original content of `parent_element` is not restored when `block`
       completes - this function simply removes all existing content and then
       acts like [::appendContent] on the now-empty node.
*/
function replaceContent(parent_element, html, block) {
  var inserted_nodes = nodes(parent_element);
  return insertHtml(html, block, function(html) {
    while (parent_element.firstChild) {
      removeNode(parent_element.firstChild);
    };
    parent_element.innerHTML = html.getHtml();
    return inserted_nodes;
  });
}
exports.replaceContent = replaceContent;


/**
   @function appendContent
   @altsyntax parent_element .. appendContent(html) { |node1, node2, ...| ... }
   @summary Append a [::HtmlFragment] to a DOM element's content
   @param {DOMElement} [parent_element] 
   @param {::HtmlFragment} [html] Html to append
   @param {optional Function} [block] Function bounding lifetime of appended content
   @return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
   @hostenv xbrowser

   @desc

     * See also [::replaceContent], [::prependContent], [::insertBefore] and [::insertAfter].

     * Any [::Mechanism]s contained in `html` will be started in post-order (i.e. mechanisms on inner 
       DOM nodes before mechanisms on more outer DOM nodes).

     * If no function `block` is provided, `appendContent` returns an
       array containing the DOM elements and comment nodes that have
       been appended. Note that this array does not contain any
       top-level text that has been inserted.

     * If a function (or blocklambda) `block` is provided, it will be passed as arguments
       the DOM elements and comment nodes that have been appended. When `block` 
       exits (normally, by exception or by retraction), the appended nodes will be removed.
       Any [::Mechanism]s running on the inserted nodes will be aborted.

     ### Examples:

         document.body .. appendContent(
           `<div>This will show for only 5 seconds</div>`) {
           ||
           hold(5000); // wait 5s
         }

         document.body .. appendContent(
           `<button>foo</button>
            <button>bar</button>`) {
            |foo_elem, bar_elem|
            // 'foo_elem' and 'bar_elem' contain the DOM elements of the respective buttons
            ...
         }
*/
function appendContent(parent_element, html, block) {
  var inserted_nodes = nodes(parent_element, parent_element.lastChild, null);
  
  return insertHtml(html, block, function(html) {
    parent_element.insertAdjacentHTML('beforeend', html.getHtml());
    return inserted_nodes;
  });
}
exports.appendContent = appendContent;

/**
   @function prependContent
   @altsyntax parent_element .. prependContent(html) { |node1, node2, ...| ... }
   @summary Prepend a [::HtmlFragment] to a DOM element's content
   @param {DOMElement} [parent_element] 
   @param {::HtmlFragment} [html] Html to prepend
   @param {optional Function} [block] Function bounding lifetime of prepended content
   @return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
   @hostenv xbrowser

   @desc
     * See [::appendContent] for notes on the semantics and return value.
*/
function prependContent(parent_element, html, block) {
  var inserted_nodes = nodes(parent_element, null, parent_element.firstChild);

  return insertHtml(html, block, function(html) {
    parent_element.insertAdjacentHTML('afterbegin', html.getHtml());
    return inserted_nodes;
  });
}
exports.prependContent = prependContent;

/**
   @function insertBefore
   @altsyntax sibling_node .. insertBefore(html) { |node1, node2, ...| ... }
   @summary Insert a [::HtmlFragment] before the given sibling node
   @param {DOMNode} [sibling_node] Sibling before which to insert
   @param {::HtmlFragment} [html] Html to insert
   @param {optional Function} [block] Function bounding lifetime of inserted content
   @return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
   @hostenv xbrowser

   @desc
     * See [::appendContent] for notes on the semantics and return value.
*/
function insertBefore(sibling, html, block) {
  var inserted_nodes = nodes(sibling.parentNode, sibling.previousSibling, sibling);

  return insertHtml(html, block, function(html) {
    if (sibling.insertAdjacentHTML)
      sibling.insertAdjacentHTML('beforebegin', html.getHtml());
    else {
      // we're inserting before a non-element node (or on an old
      // browser without `insertAdjacentHTML` support) 
      var parent = sibling.parentNode;
      var container = document.createElement(parent.nodeName);
      container.innerHTML = html.getHtml();
      var node;
      while ((node = container.firstChild)) {
        parent.insertBefore(node, sibling);
      }
    }

    return inserted_nodes;
  });
}
exports.insertBefore = insertBefore;

/**
   @function insertAfter
   @altsyntax sibling_node .. insertAfter(html) { |node1, node2, ...| ... }
   @summary Insert a [::HtmlFragment] after the given sibling node
   @param {DOMNode} [sibling_node] Sibling before which to insert
   @param {::HtmlFragment} [html] Html to insert
   @param {optional Function} [block] Function bounding lifetime of inserted content
   @return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
   @hostenv xbrowser

   @desc
     * See [::appendContent] for notes on the semantics and return value.
*/
function insertAfter(sibling, html, block) {
  var inserted_nodes = nodes(sibling.parentNode, sibling, sibling.nextSibling);

  return insertHtml(html, block, function(html) {
    if (sibling.insertAdjacentHTML)
      sibling.insertAdjacentHTML('afterend', html.getHtml());
    else {
      // we're inserting before a non-element node (or on an old
      // browser without `insertAdjacentHTML` support) 
      var parent = sibling.parentNode;
      var container = document.createElement(parent.nodeName);
      container.innerHTML = html.getHtml();
      var ref = sibling.nextSibling;
      var node;
      while ((node = container.lastChild)) {
        parent.insertBefore(node, ref);
      }
    }
    return inserted_nodes;
  });
}
exports.insertAfter = insertAfter;


/**
   @function removeNode
   @param {DOMNode} [node] Node to remove
   @summary Remove a DOM node from the document
   @hostenv xbrowser
   @desc
     * This function can be used to remove any DOM node from
       document - whether it has been inserted using one of the surface
       module functions ([::appendContent], etc).

     * `removeNode` will abort any [::Mechanism]s running on the node
       and release any [::CSS] references.

     * Note that you can remove DOM nodes inserted using surface module functions also
       using normal DOM operations (e.g. removeChild), however any [::Mechanism]s that might
       be running on the content will not be aborted, and [::CSS] references will not be
       released. This might change in future versions of the library.
*/
function removeNode(node) {
  // stop our mechanism and all mechanisms below us
  stopMechanisms(node, true);
  if (node.parentNode)
    node.parentNode.removeChild(node);
  
  // if node is an element, unuse our CSS and all CSS used below us
  if (node.querySelectorAll)
    concat([node], node.querySelectorAll('._oni_css_')) ..
    unuseCSS();
}
exports.removeNode = removeNode;


//----------------------------------------------------------------------

/**
  @function Prop
  @altsyntax element .. Prop(name, value)
  @summary Add a javascript property to an element
  @param {::HtmlFragment} [element]
  @param {String} [name] Property name
  @param {Object|sjs:sequence::Stream} [value] Property value
  @return {::Element}
  @hostenv xbrowser
  @desc
    Sets a javascript property
    on the element's DOM node once it is inserted into the document.

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
/**
  @function Enabled
  @altsyntax element .. Enabled(obs)
  @summary Add a `disabled` attribute to element when obs is not truthy
  @param {::HtmlFragment} [element]
  @param {sjs:observable::Observable} [obs] Observable
  @return {::Element}
  @hostenv xbrowser
  @desc
     Works on most elements that accept user input, such as buttons, input element, checkboxes
  @demo
     @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
     var Flag = @ObservableVar(false);

     @mainContent .. @appendContent(
       @demo.CodeResult("\
       @ = require(['mho:std','mho:app']);

       var Flag = @ObservableVar(false);

       @mainBody .. @appendContent([
         @Button('Test') .. @Enabled(Flag),
         @TextInput('Test') .. @Enabled(Flag)
       ]);

       while (true) {
         hold(2000);
         Flag.modify(val -> !val);
       }",
       [@Button('Test') .. @Enabled(Flag),
        @TextInput('Test') .. @Enabled(Flag) .. @Style('margin-top:5px')]));
      
       resize();
       while (1) {
         hold(2000);
         Flag.modify(val -> !val);
       }
*/
exports.Enabled = (html, obs) -> html .. Attrib('disabled', obs .. transform(x->!x));


//----------------------------------------------------------------------


/**
  @function On
  @altsyntax element .. On(event, [settings], event_handler)
  @summary Adds an event handler on an element
  @param {::HtmlFragment} [element]
  @param {String} [event] Name of the event, e.g. 'click'
  @param {optional Object} [settings] Settings as described at [sjs:event::events].
  @param {Function} [event_handler] 
  @return {::Element}
  @hostenv xbrowser
  @desc
    Sets an event handler on the element's DOM once it is inserted into the document.

    Note that no buffering of events takes place: any events emitted
    while `event_handler` is blocked will have no effect.     
*/
var On = (html, event, opts, f) -> html .. Mechanism(function(node) {
  if (!f) {
    // opts not given
    f = opts;
    opts = {};
  }
  node .. events(event, opts) .. each(f);
});
exports.On = On;

/**
  @function OnClick
  @altsyntax element .. OnClick([settings], event_handler)
  @summary Adds a 'click' event handler on an element
  @param {::HtmlFragment} [element]
  @param {optional Object} [settings] Settings as described at [sjs:event::events].
  @param {Function} [event_handler] 
  @return {::Element}
  @hostenv xbrowser
  @desc
    See also [::On].
*/
var OnClick = (html, opts, f) -> html .. On('click', opts, f);
exports.OnClick = OnClick;



