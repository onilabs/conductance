/* (c) 2013-2019 Oni Labs, http://onilabs.com
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

@ = require([
  'sjs:std'
]);
var { ensureElement, Mechanism, collapseHtmlFragment, Class, Attrib, ContentGenerator, MECH_PRIORITY_STREAM, MECH_PRIORITY_PROP } = require('./base');
var { withDOMContext } = require('./nodes');
var { ownPropertyPairs, ownKeys, merge } = require('sjs:object');
var { isStream, Stream, toArray, map, filter, each, reverse, concat, first, take, indexed, takeWhile, transform } = require('sjs:sequence');
var { split } = require('sjs:string');
var { events, wait } = require('sjs:event');

// DOM Node Types:
var ELEMENT_NODE = 1;
var TEXT_NODE    = 3;
var COMMENT_NODE = 8;

//----------------------------------------------------------------------

__js {
  // XXX helper for insertHtml that should go elsewhere
  function PrioritySet() { return {}; }

  function PrioritySet_push(ps, elem, priority) {
    if (typeof priority !== 'number') throw new Error("PrioritySet_push requires a numerical priority (saw '#{priority}'");
    if (ps[priority] === undefined)
      ps[priority] = [elem];
    else
      ps[priority].push(elem);
  }

  function PrioritySet_stream(ps) { 
    return @Stream(function(r) {
      Object.keys(ps) .. @transform(__js k -> [k,ps[k]]) .. 
        @transform([priority, elems] -> [Number(priority), elems]) .. 
        @sortBy('0') .. @each {
          |[,elems]| 
          elems .. @each(r);
        }
    });
  }
}

__js {
// XXX DOM module backfill?
// returns a stream of comment nodes:
function CommentNodes(node) {
  return @Stream(function(r) {
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
    @filter({nodeValue} -> nodeValue.indexOf('surface_stream')!== -1);
}
} // __js


//----------------------------------------------------------------------
// global ref counted resource registry that adds/removes resources to
// the document
var cssInstalled = {};
var mechanismsInstalled = {};

var resourceRegistry = {
  useCSSDefs: function(defs) {
    ownPropertyPairs(defs) .. each {
      |[id, [cnt,def]]|
      var desc;
      if (!(desc = cssInstalled[id])) {
        desc = cssInstalled[id] = { ref_count: cnt, elem: def.createElement(), mechanism: def.mechanism };
        if (def.prepend) {
          document.head.insertBefore(desc.elem, document.head.firstChild);
        }
        else {
          document.head.appendChild(desc.elem);
        }
        if (desc.mechanism) {
          withDOMContext(desc.elem) {
            ||
            desc.elem.__oni_mech = spawn(desc.mechanism.call(desc.elem, desc.elem));
          }
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
    ownKeys(defs) .. each { 
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
      __js desc.elem.parentNode.removeChild(desc.elem);
      __js delete cssInstalled[id];
    }
  },
  // XXX no real need to go through the whole use/unuse machinery for
  // typeof code == function
  useMechanisms: function(mechs) {
    ownPropertyPairs(mechs) .. each {
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
      if (!desc) continue; // this is probably a static mechanism which is not in our dynamic 'mechanismsInstalled' hash (see bootScript in static.sjs)
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

function stopMechanisms(parent, include_parent) {
  var nodes = StreamNodes(parent);
  if (parent.querySelectorAll)
    nodes = @concat(parent.querySelectorAll('._oni_mech_'), nodes);
  if (include_parent)
    nodes = @concat([parent], nodes);
  
  nodes .. @each {
    |node|
    if (!node.__oni_mechs) continue;
    node.__oni_mechs .. @each.par {
      |stratum|
      stratum.abort();
    }
    delete node.__oni_mechs;
  }
}

// helper for insertHtml
function awaitStratumError(s) {
  // ignores stratum cancellation
  try {
    s.value();
  } catch(e) {
    if (!(e instanceof @StratumAborted)) throw e;
  }
};

function insertHtml(html, block, doInsertHtml) {
  html = collapseHtmlFragment(html);
  
  // load external scripts:
  ownKeys(html.getExternalScripts()) .. each {
    |url| require('sjs:xbrowser/dom').script(url);
  }

  // load external css:
  ownKeys(html.getExternalCSS()) .. each {
    |url| require('sjs:xbrowser/dom').css(url);
  }

  // install css and mechanisms
  var css = html.getCSSDefs();
  resourceRegistry.useCSSDefs(css);
  var mechs = html.getMechanisms();
  resourceRegistry.useMechanisms(mechs);

  var started_mechs = [];
  try {
    var inserted = doInsertHtml(html) .. toArray;

    var mechs = PrioritySet();
    __js function addMech(elem, [mech, priority]) {
      mechs .. PrioritySet_push([elem, mechanismsInstalled[mech]], Number(priority));
    }
    
    inserted .. @each {|elem|
      if (elem.nodeType === ELEMENT_NODE) {
        
        var elems = (elem.hasAttribute('data-oni-mechs') ? [elem] : []) ..
          @concat(elem.querySelectorAll('[data-oni-mechs]')) ..
          @toArray;
        
        var streams = StreamNodes(elem) .. @toArray;
        
        elems .. @each {
          |elem|
          elem.__oni_mechs = [];
          elem.getAttribute('data-oni-mechs').split(' ') ..
            @filter .. // only truthy elements
            @each {
              |mech|
              elem .. addMech(mech.split('!'));
            }
        }
        
        // add stream mechanisms:
        streams .. @each { 
          |node|
          var [,mech] = node.nodeValue.split("|");
          node.__oni_mechs = [];
          node .. addMech([mech, MECH_PRIORITY_STREAM]);
        }
      }
      else if (elem.nodeType === COMMENT_NODE &&
               elem.nodeValue.indexOf('surface_stream') !== -1) {
        var [,mech] = elem.nodeValue.split("|");
        elem.__oni_mechs = [];
        elem .. addMech([mech, MECH_PRIORITY_STREAM]);
      }
    }
    
    // at this point 'mechs' contains all of our mechanisms sorted by priority.
    // let's start them:
    mechs .. PrioritySet_stream .. @each {
      |[elem, mech]|
      var s = spawn withDOMContext(elem) { || mech.func.call(elem, elem) };
      elem.__oni_mechs.push(s);
      started_mechs.push(s);
    };
  }
  catch (e) {
    resourceRegistry.unuseCSSDefs(css);
    throw e;
  }
  finally {
    // now they have been run (or not), we can tell the resource registry to
    // remove the mechanisms again
    resourceRegistry.unuseMechanisms(ownPropertyPairs(mechs) .. map([id, code] -> id) .. toArray);
  }


  var dom_context = inserted .. filterElementsAndComments .. toArray;
  if (block) {
    waitfor {
      withDOMContext(dom_context) {
        ||
        return block.apply(null, dom_context);
      }
    } 
    or {
      @waitforAll(awaitStratumError, started_mechs);
      hold();
    }
    finally {
      // XXX each.par here?
      inserted .. each(removeNode);
    }
  } else {
    return dom_context;
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

     * Any [::Mechanism]s contained in `html` will be started in order of their priority setting. Mechanisms of the same priority will be started in pre-order (i.e. mechanisms on outer 
       DOM nodes before mechanisms on more inner DOM nodes).

     * If no function `block` is provided, `appendContent` returns an
       array containing the DOM elements and comment nodes that have
       been appended. Note that this array does not contain any
       top-level text that has been inserted.

     * If a function (or blocklambda) `block` is provided, it will be passed as arguments
       the DOM elements and comment nodes that have been appended. Furthermore, 
       `block` will be executed with an implicit [::DynamicDOMContext] set to the 
       appended DOM elements & comment nodes.
       When `block` 
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
  
  return insertHtml(html, block, __js function(html) {
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

  return insertHtml(html, block, __js function(html) {
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

  return insertHtml(html, block, __js function(html) {
    if (sibling.insertAdjacentHTML)
      sibling.insertAdjacentHTML('beforebegin', html.getHtml());
    else {
      // we're inserting before a non-element node (or on an old
      // browser without `insertAdjacentHTML` support) 
      var parent = sibling.parentNode;
      var container = document.createElementNS(parent.namespaceURI, parent.nodeName.toLowerCase());
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

  return insertHtml(html, block, __js function(html) {
    if (sibling.insertAdjacentHTML)
      sibling.insertAdjacentHTML('afterend', html.getHtml());
    else {
      // we're inserting before a non-element node (or on an old
      // browser without `insertAdjacentHTML` support) 
      var parent = sibling.parentNode;
      var container = document.createElementNS(parent.namespaceURI, parent.nodeName.toLowerCase());
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
  // make unabortable:
  try {} finally {
    // stop our mechanism and all mechanisms below us
    stopMechanisms(node, true);
    __js if (node.parentNode)
      node.parentNode.removeChild(node);
    
    // if node is an element, unuse our CSS and all CSS used below us
    if (node.querySelectorAll)
      concat([node], node.querySelectorAll('._oni_css_')) ..
      unuseCSS();
  }
}
exports.removeNode = removeNode;


//----------------------------------------------------------------------

/**
  @function Prop
  @altsyntax element .. Prop(name, value)
  @summary An [::ElementWrapper] that adds a javascript property to an element
  @param {::Element} [element]
  @param {String} [name] Property name
  @param {Object} [value] Property value
  @return {::Element}
  @hostenv xbrowser
  @desc
    Sets a javascript property
    on the element's DOM node once it is inserted into the document.
    Executes at the priority [::MECH_PRIORITY_PROP].

    See also [::Attrib].
*/
function Prop(html, name, value) {
  return html .. Mechanism(function(node) {
      node[name] = value;
  },
                          {priority: MECH_PRIORITY_PROP});
}
exports.Prop = Prop;

//----------------------------------------------------------------------
/**
  @function Enabled
  @altsyntax element .. Enabled(obs)
  @summary An [::ElementWrapper] that adds a `disabled` attribute to element when obs is not truthy
  @param {::Element} [element]
  @param {sjs:sequence::Stream} [obs] Stream of true/false values (typically an [sjs:observable::Observable])
  @return {::Element}
  @hostenv xbrowser
  @desc
     Works on most elements that accept user input, such as buttons, input element, checkboxes.
     
     `obs` is iterated in a [::DynamicDOMContext] set to `element`s DOM node.

  @demo
     @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
     var Flag = @ObservableVar(false);

     @mainContent .. @appendContent(
       @demo.CodeResult("\
       @ = require(['mho:std','mho:app']);

       var Flag = @ObservableVar(false);

       @mainBody .. @appendContent([
         @Button('Test') .. @Enabled(Flag),
         @Input('Test') .. @Enabled(Flag)
       ]);

       while (true) {
         hold(2000);
         Flag.modify(val -> !val);
       }",
       [@Button('Test') .. @Enabled(Flag),
        @Input('Test') .. @Enabled(Flag) .. @Style('margin-top:5px')]));
      
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
  @summary An [::ElementWrapper] that adds an event handler on an element
  @param {::Element} [element]
  @param {String} [event] Name of the event, e.g. 'click'
  @param {optional Object} [settings] Settings as described at [sjs:event::events].
  @param {Function} [event_handler] 
  @return {::Element}
  @hostenv xbrowser
  @desc
    Sets an event handler on the element's DOM once it is inserted into the document.

    `event_handler` will be passed the DOM event object (possibly amended by the provided `settings` - see [sjs:event::events]), and executed with an implicit [::DynamicDOMContext] set to `element`s DOM node.

    Note that no buffering of events takes place: any events emitted
    while `event_handler` is blocked will have no effect.

    Also note that `event_handler` will be aborted if `element` is removed from the DOM while `event_handler` is running.
    See also the 'Reentrant abortion' section under [::Mechanism].

  @demo
     @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
     @mainContent .. @appendContent(
       @demo.CodeResult(
         "@Button('mouse me over') .. 
       @On('mouseover', ev -> @mainContent ..
                                @appendContent(String(ev)))",
         @Button('mouse me over') .. 
           @On('mouseover', ev -> @mainContent .. 
             @appendContent(String(ev)))
       ));
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
  @summary An [::ElementWrapper] that adds a 'click' event handler on an element
  @param {::Element} [element]
  @param {optional Object} [settings] Settings as described at [sjs:event::events].
  @param {Function} [event_handler] 
  @return {::Element}
  @hostenv xbrowser
  @desc
    See also [::On].

    Note that, as for [::On], no buffering of events takes place: any events emitted
    while `event_handler` is blocked will have no effect.     

    Also note that `OnClick` has a different abort behavior than mechanisms or [::On]:
    Once the event handler is triggered it will NOT be aborted when `element` is removed from the DOM.
    See also the 'Reentrant abortion' section under [::Mechanism].

  @demo
     @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
     @mainContent .. @appendContent(
       @demo.CodeResult(
         "@Button('click me') ..
       @OnClick({handle: @stopEvent},
          ev -> @mainContent .. @appendContent(String(ev)))",
        @Button('click me') ..
          @OnClick({handle: @stopEvent},
          ev -> @mainContent ..
                          @appendContent(String(ev)))
       ));
*/
function OnClick(html, opts, f) {
  if (f === undefined) {
    f = opts;
    opts = undefined;
  }
  return html .. On('click', opts, function(ev) { var S = spawn f(ev); return S.value();});
}
exports.OnClick = OnClick;

/**
   @function ContentGenerator
   @summary A [::HtmlFragment] consisting of content generated dynamically after inserting in the DOM
   @return {::HtmlFragment}
   @param {Function} [generator] Function that will generate content
   @desc
     `generator` is a function of signature `f(append, node)`. It will be called when the ContentGenerator
     is inserted into the DOM (directly or indirectly via a parent of the ContentGenerator 
     being inserted into the DOM).

     The `append` parameter is a function that `generator` can use to insert content into the DOM. 
     `node` is the (comment) node that anchors the ContentGenerator in the DOM and next to which the 
     generated content will be inserted. `append` returns an array of inserted DOM nodes.

     The generator function will be executed at priority [::MECH_PRIORITY_STREAM].
*/
exports.ContentGenerator = ContentGenerator; // from ./base.sjs

/**
   @function CollectStream
   @hostenv xbrowser
   @summary A [::HtmlFragment] for inserting all elements of a stream into the DOM
   @param {sjs:sequence::Stream} [stream]
   @param {optional Object} [settings]
   @setting {optional Function} [post_append] Function to execute for each appended item. Will be called with the inserted DOM (an array) as first argument
   @return {::HtmlFragment}
   @desc
     `stream` will be iterated when the CollectStream is inserted into the DOM (directly or indirectly via a 
     parent of the CollectStream being inserted into the DOM).

     Elements of `stream` will be appended to the DOM as they are produced.
*/
var CollectStream = (stream, settings) -> ContentGenerator ::
                          function(append) {
                            var appended = [];
                            try {
                              stream .. each {
                                |item|
                                var dom = append(item);
                                appended = appended.concat(dom);
                                if (settings && settings.post_append) settings.post_append(dom);
                              }
                              hold();
                            }
                            finally {
                              if (appended.length)
                                appended .. each(removeNode);
                            } 
                          };
exports.CollectStream = CollectStream;

/**
   @function ReplaceStream
   @hostenv xbrowser
   @summary A [::HtmlFragment] for inserting the most recent element of a stream into the DOM, replacing the previous element
   @param {sjs:sequence::Stream} [stream]
   @param {optional Object} [settings]
   @setting {optional Function} [post_update] Function to execute after each time a stream element has been inserted into the DOM. Will be called with the inserted DOM (an array) as first argument
   @return {::HtmlFragment}
   @desc
     `stream` will be iterated when the ReplaceStream is inserted into the DOM (directly or indirectly via a 
     parent of the ReplaceStream being inserted into the DOM).

     Elements of `stream` will be inserted into the DOM as they are produced.
*/
var ReplaceStream = (stream, settings) -> ContentGenerator ::
                          function(append) {
                            stream .. each.track {
                              |item|
                              try {
                                var dom = append(item);
                                if (settings && settings.post_update) settings.post_update(dom);
                                hold();
                              }
                              finally {
                                if (dom.length)
                                  dom .. each(removeNode);
                              }
                            }
                            hold();
                          };
exports.ReplaceStream = ReplaceStream;

/**
   @function ScrollStream
   @hostenv xbrowser
   @summary A [::HtmlFragment] for inserting elements of a stream into the DOM as the user scrolls vertically
   @param {sjs:sequence::Stream} [stream]
   @param {optional Object} [settings]
   @setting {Integer} [tolerance=0] Distance (in pixels) that an element needs to be off-screen before we stop appending elements and wait for scrolling
   @setting {Function} [post_append] Function `f(appended_node_array)` to call after each item in the stream has been appended. 
   @setting {::HtmlFragment} [in_progress_html] [::HtmlFragment] to show while the stream is still being iterated. Will be appended at the end and removed when `stream` is finished.
   @setting {::HtmlFragment} [empty_html] [::HtmlFragment] to show if the stream is empty. 
   @return {::HtmlFragment}
   @desc
     `stream` will be iterated when the ScrollStream is inserted into the DOM (directly or indirectly via a 
     parent of the ScrollStream being inserted into the DOM).

     Elements of `stream` will be appended to the DOM as they are produced and only up the point where they overflow
     the window. When the user scrolls the last element into view, more elements will be inserted.

     If a `post_append` function is provided, it will be called with an array of the top DOM nodes of each appended element. If `post_append` returns a truthy value, no overflow check will be made, and the next element from `stream` will be appended.
*/

__js function elemPartiallyWithinViewport(elem, tolerance) {
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var boundingRect = elem.getBoundingClientRect();
  return (boundingRect.left < viewportWidth+tolerance &&
          boundingRect.right > -tolerance &&
          boundingRect.top < viewportHeight+tolerance &&
          boundingRect.bottom > -tolerance);
}
  
var AncestorScrollEvents = function(node) {
  var events = [];
  while (node) {
    events.push(node .. @events('scroll'));
    node = node.parentNode;
  }
  return @combine.apply(null, events);
};

var ScrollStream = (stream,settings) -> ContentGenerator ::
  function(append) {
    settings = {
      tolerance: 0,
      post_append: undefined,
      in_progress_html: undefined,
      empty_html: undefined
    } .. @override(settings);

    // XXX it sucks that we have to keep track of all elements to remove them in the
    // finally clause, when in 90% of the time a container would take care of element
    // removal (and shutdown of their mechanisms)
    var appended = [];

    try {
      
      if (settings.in_progress_html) {
        var in_progress_anchor = append(settings.in_progress_html);
        // override append function to insert before anchor:
        append = html -> in_progress_anchor[0] .. insertBefore(html);
      }
    
      stream .. each {
        |item|
        appended = appended.concat(item = append(item));
        if (settings.post_append)
          if (settings.post_append(item)) continue;
        // check if the last piece we appended is within window:
        while (!elemPartiallyWithinViewport(appended[appended.length - 1], settings.tolerance)) {
          AncestorScrollEvents(appended[appended.length -1]) .. @wait();
        }
      }

      if (!appended.length && settings.empty_html) {
        appended.concat(append(settings.empty_html));
      }

      if (in_progress_anchor) {
        in_progress_anchor .. each(removeNode);
        in_progress_anchor = undefined;
      }

      hold();
    }
    finally {
      if (appended.length)
        appended .. each(removeNode);
      if (in_progress_anchor)
        in_progress_anchor .. each(removeNode);
    } 
  };
exports.ScrollStream = ScrollStream;

//----------------------------------------------------------------------

/**
   @function focus
   @param {DOMNode} [node] DOM node to focus
   @summary Focus given node or, if node is not focussable, first focussable child thereof
   @hostenv xbrowser
   @desc
     `focus(node)` will attempt to focus `node`, or, if that doesn't succeed, the first
     child of `node` that matches the selector `input, a[href], area[href], iframe`.
*/
exports.focus = function(node) {
  node.focus();
  if (document.activeElement !== node) {
    var focusable = node.querySelector('input, a[href], area[href], iframe');
    if (focusable)
      focusable.focus();
  }
};
