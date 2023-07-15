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

module.setCanonicalId('mho:surface/nodes');

@ = require([
  'sjs:std',
  {id:'sjs:type', include: ['Interface']}
]);

/* - undocumented
   @variable ITF_DOMCONTEXT
*/
var ITF_DOMCONTEXT = exports.ITF_DOMCONTEXT = @Interface(module, "itf_domcontext");


/**
  @feature DynamicDOMContext
  @summary An implicitly defined dynamic DOM context
  @hostenv xbrowser
  @desc
     There are a number of functions in the [surface::] module that operate on 
     the DOM tree and need to be called with a DOM node argument, such as e.g. 
     [surface/field::Valid].

     This is problematic under some circumstances, because we sometimes want to 
     use these functions before the DOM tree has actually been built, and we haven't got a DOM node to pass to the function. E.g.:

         @Button('click me') .. @Enabled(@field.Valid(/* can't pass in a node here *\/))

     The [surface::] module solves this problem by having certain functions automatically inject a "dynamic DOM context" (using [::withDOMContext]) - a variable with dynamic (rather than lexical) scope that contains a reference DOM nodes (or array of DOM nodes).

     E.g. [::Mechanism] executes its mechanism function with a dynamic DOM context set to the DOM node that the mechanism will be executed on. Functions such as [surface/field::Valid] executed inside the mechanism function then automatically bind to this context if they are not explicitly bound to a DOM node:

         @Mechanism(function() { ... @field.Valid() ... } // automatically binds the
                                                          // @field.Valid call to
                                                          // the Mechanism's DOM node

     The injected DOM context has *dynamic extent*, meaning that nested function calls (and even spawned calls) from within the mechanism function will receive this context.

     Most surface functions that take a function as argument inject dynamic DOM contexts when calling that function argument. They include [::Mechanism], [::appendContent], [::replaceContent], [::prependContent], [::insertBefore], [::insertAfter], [::On], [::OnClick].
     
     Most surface functions that take a [sjs:sequence::Stream] argument inject dynamic DOM contexts when playing back the stream. They include [::Attrib], [::Class], [::Enabled].

     The current dynamic DOM context can be retrieved using [::getDOMNode] or [::getDOMNodes].

     Functions that take advantage of dynamically injected DOM contexts in lieu of an 
     explicit DOM node argument include [surface/field::getField], [surface/field::Valid], [surface/field::validate], [surface/field::ValidationState], [surface/field::Value].

*/


/**
   @function withDOMContext
   @param {DOMNode|Array} [context] DOM node or Array of DOM nodes
   @param {Function} [block]
   @summary Execute `block` with a [::DynamicDOMContext] set to `context`
   @hostenv xbrowser
   @desc
      The DOM node(s) are injected as a dynamically-scoped variable using [sjs:sys::withDynVarContext].

      As described under [::DynamicDOMContext], this function is called implicitly by many surface functions, 
      and is rarely useful in user code.
*/
function withDOMContext(context, block) {
  @sys.withDynVarContext {
    ||
    @sys.setDynVar(ITF_DOMCONTEXT, context);
    block();
  }
};
exports.withDOMContext = withDOMContext;

/**
   @function getDOMNode
   @param {optional DOMNode|Array} [context] DOM node or Array of DOM nodes (overrides use of the [::DynamicDOMContext])
   @param {optional String} [selector] CSS selector
   @hostenv xbrowser
   @summary Retrieve a DOM node from the implicit [::DynamicDOMContext] (or an explicit context if provided)
   @desc
      Retrieves the first DOM node in the current [::DynamicDOMContext] (or the explicit `context`, if provided) that matches `selector`. If no `selector` is given, the first node in the context will be returned.
*/
__js function getDOMNode(/* [root], [selector] */) {

  // untangle arguments:
  var root, selector;
  var args = arguments;
  if (args.length === 1) {
    if (typeof args[0] === 'string')
      selector = args[0];
    else
      root = args[0];
  }
  else if (args.length === 2) {
    root = args[0];
    selector = args[1];
  }
  else if (args.length !== 0)
    throw new Error("Surplus arguments supplied to Node()");

  // if we don't have a dom context, try to obtain it from the environment:
  if (root === undefined) {
    root = @sys.getDynVar(ITF_DOMCONTEXT, undefined);
    if (root === undefined)
      throw new Error("No DOM root to operate on");
  }

  // make sure our DOM root is an array (that's the general case):
  if (!Array.isArray(root))
    root = [root];

  // now resolve the node being queried:
  if (selector === undefined) {
    return root .. @first();
  }
  else {
    for (var i=0; i<root.length; ++i) {
      var node = root[i];
      if (node .. @dom.matchesSelector(selector))
        return node;
      var match = node.querySelector(selector);
      if (match) return match;
    }

    throw new Error("Selector '#{selector}' not found in DOM root context");
  }
};
exports.getDOMNode = getDOMNode;

/**
   @function getDOMNodes
   @return {sjs:sequence::Sequence}
   @param {optional DOMNode|Array} [context] DOM node or Array of DOM nodes (overrides use of the [::DynamicDOMContext])
   @param {optional String} [selector] CSS selector
   @hostenv xbrowser
   @summary Retrieve DOM nodes from the implicit [::DynamicDOMContext] (or an explicit context if provided)
   @desc
      Retrieves all DOM node in the current [::DynamicDOMContext] (or the explicit `context`, if provided) that matches `selector`. If no `selector` is given, an array of all root nodes in the context will be returned.
*/
function getDOMNodes(/* [root], [selector] */) {

  var args = arguments;
  
  return @Stream(function(receiver) {
    // untangle arguments:
    var root, selector;

    __js {
      if (args.length === 1) {
        if (typeof args[0] === 'string')
          selector = args[0];
        else
          root = args[0];
      }
      else if (args.length === 2) {
        root = args[0];
        selector = args[1];
      }
      else if (args.length !== 0)
        throw new Error("Surplus arguments supplied to Node()");
    }

    // if we don't have a dom root, try to obtain it from the environment:
    if (root === undefined) {
      root = @sys.getDynVar(ITF_DOMCONTEXT, undefined);
      if (root === undefined)
        throw new Error("No DOM root to operate on");
    }
    
    // make sure our DOM root is an array (that's the general case):
    if (!Array.isArray(root))
      root = [root];
    
    // now resolve the node being queried:
    if (selector === undefined) {
      root .. @each(receiver);
    }
    else {
      root .. @each {
        |node|
        if (node .. @dom.matchesSelector(selector))
          receiver(node);
        var matches = node.querySelectorAll(selector);
        if (matches)
          matches .. @each(receiver);
      }
    }
  });
}
exports.getDOMNodes = getDOMNodes;

//----------------------------------------------------------------------
// General node interface helpers for use with fields, cmds, etc.

/* not documented for now
*/
function getDOMITFNode(/* [node] , itf */) {
  // untangle arguments:
  var node, itf;
  var args = arguments;
  __js {
    if (args.length === 1) {
      itf = args[0];
    }
    else if (args.length === 2) {
      node = args[0];
      itf = args[1];
    }
    else
      throw new Error("Invalid argument count for getDOMITFNode");
  }

  if (node === undefined) 
    node = getDOMNode();

  @dom.traverseDOM(node, document) {
    |node|
    if (node[itf] !== undefined) return node;
  }
  return undefined;
}
exports.getDOMITFNode = getDOMITFNode;

/* not documented for now
*/
function getDOMITF(/* [node], itf */) {
  // untangle arguments:
  var node, itf;
  var args = arguments;
  __js {
    if (args.length === 1) {
      itf = args[0];
    }
    else if (args.length === 2) {
      node = args[0];
      itf = args[1];
    }
    else
      throw new Error("Invalid argument count for getDOMITF");
  }

  if (node === undefined) 
    node = getDOMNode();


  @dom.traverseDOM(node, document) {
    |node|
    if (node[itf] !== undefined) return node[itf];
  }
  return undefined;
}
exports.getDOMITF = getDOMITF;

/* not documented for now
*/
__js function makeDOMITFMethodAPI(itf_name, method_name, settings) {
  
  settings = {
    dom_node_passthrough: true
  } .. @override(settings);

  return function(/* node, other args */) {
    args = @clone(arguments);

    var node;
    if (@dom.isDOMNode(args[0])) {
      node = args[0];
      if (!settings.dom_node_passthrough)
        args.shift();
    }
    else {
      node = getDOMNode();
      if (settings.dom_node_passthrough)
        args.unshift(node);
    }
      
    var itf = node .. getDOMITF(itf_name);
    return itf[method_name].apply(itf, args);
  }
}
exports.makeDOMITFMethodAPI = makeDOMITFMethodAPI;

/* not documented for now
*/
__js function makeDOMITFVarAPI(itf_name, var_name) {
  return function(node) {
    return (node .. getDOMITF(itf_name))[var_name];
  }
}
exports.makeDOMITFVarAPI = makeDOMITFVarAPI;
