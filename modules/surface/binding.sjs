/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @summary HTML 'Binding' abstraction
   @hostenv xbrowser
   @desc
     This module defines constructs for naming and retrieving nodes (or derived values) in DOM trees.
     For a general explanation of the scheme implemented by this module, see [::Bind].
*/

module.setCanonicalId('mho:surface/binding');

var { hostenv } = require('builtin:apollo-sys');

if (hostenv !== 'xbrowser') 
  throw new Error('The mho:surface/binding module can currently only be used in an xbrowser hostenv');

@ = require([
  'sjs:std',
  {id:'./base', include: ['Mechanism', 'MECH_PRIORITY_API']},
  {id:'sjs:type', include: ['Interface']},
  {id:'./nodes', include: ['getDOMITF', 'getDOMNodes']}
]);

/* - undocumented 
   @variable ITF_BINDING_CONTEXT
*/
var ITF_BINDING_CONTEXT = exports.ITF_BINDING_CONTEXT = @Interface(module, "itf_binding_context");

 
//----------------------------------------------------------------------

/**
   @function Bind
   @summary An [mho:surface::ElementWrapper] that binds its element (or a value derived thereof) under the given `name` in the closest enclosing [::BindingContext]
   @param {mho:surface::Element} [element]
   @param {String} [name] 
   @param {optional Function} [accessor=`node->node`] Accessor for the bound value (`node->value`). 
   @desc
     `Bind()` and the related functions in this module implement a scheme for naming and retrieving
     nodes (or derived values, such as APIs) in DOM trees.

     E.g. consider the case where some widget wants to display a status text in a status field that 
     is located elsewhere in the DOM:

         var LoadWidget = @Div :: @Button('Load') .. @OnClick(performLoad);

         function performLoad() {

           var status_field = ???;

           status_field .. @appendContent('Loading...') { 
             ||
             ... perform the load action
           }
         }

     If there is only one status field in the application, then one way to access it would be to give
     it a CSS class - say 'status-field' - and retrieve it with:

         var status_field = document.querySelector('.status-field');

     Of course the problem with this scheme is that it will break when there is more than one status 
     field in the DOM. E.g. there could be an application-wide status field, but the status field
     that we really want to access from LoadWidget is a status field that is part of a Load Dialog.

     One general observation is that typically when there are
     multiple candidate nodes of the same 'kind' ('kind' here being 'status field'), we want to find
     the node that is 'closest' in the DOM to the point of usage. 

     One way to accomplish this, would be by traversing the DOM tree up from the point of usage, and 
     executing `parent.querySelector('.status-field')` for each parent until the node is found.

     The scheme implemented by the [./binding::] module makes this a bit more tractable by introducing
     [::BindingContext]s under which named or 'bound' nodes (or values derived thereof) are aggregated.
     Then, instead of searching the subtree of every ancestor for a bound node, only the parents that
     are [::BindingContext]s need to be examined.

     The scheme consists of three parts:

     Firstly, there needs to be at least one [::BindingContext] as a common ancestor to the
     bound node and the place where the binding is accessed:

         var myHTML = @Div('load-dialog') .. @BindingContext :: [
                        ...
                        LoadWidget,
                        ...
                        StatusField
                      ]

     Secondly, the node to be named (or 'bound') needs to be decorated with `Bind`:

         var StatusField = @Div .. @Bind('status-field');

     In each binding context there can only be one binding of a given name at any one time - trying 
     to bind the same name will (silently) fail.

     Finally, the bindings can now be accessed with [::Binding]:
     
         var status_field = @Binding('status-field');

     If the binding is not found in the closest binding context, the next higher binding context
     will be consulted, and so forth.

     Bindings can also be used to bind any value derived from a node. E.g. an `Editor` widget might
     have two methods `load` and `save`. These could be exposed with the binding scheme as follows:

         var Toolbar = [@Button('load') .. @OnClick(-> @Binding('editor').load()),
                        ...];
     
         var myHTML = @Div('editor-pane') .. @BindingContext :: [
                        ...
                        Editor .. @Bind('editor', node -> {load: node.load, save: node.save}),
                        ...
                        Toolbar
                      ];


*/
function Bind(elem, name, accessor) {
  if (!accessor) accessor = @fn.identity;
  return elem .. @Mechanism(
    function(node) {
      var ctx = @getDOMITF(ITF_BINDING_CONTEXT);
      if (ctx) {
        try {
          if (!ctx.setBinding(name, accessor(node))) {
            console.log("Warning: Not binding #{name} from #{node}; name is already bound");
            return;
          }
          hold();
        }
        finally {
          ctx.removeBinding(name);
        }
      }
    },
    {priority: @MECH_PRIORITY_API}
  );
}
exports.Bind = Bind;

//----------------------------------------------------------------------

/**
   @function BindingContext
   @summary An [mho:surface::ElementWrapper] that marks its element as a context for bindings
   @param {mho:surface::Element} [element]
   @desc
     For a general explanation of the scheme implemented by the [./binding::] module, see [::Bind].

*/
var BindingContext = @Mechanism(
  function(node) {
    var bindings = {};
    node[ITF_BINDING_CONTEXT] = {
      setBinding: __js function(name,val) {
        if (bindings .. @hasOwn(name)) return false;
        bindings[name] = val;
        return true;
      },
      removeBinding: __js function(name) {
        delete bindings[name];
      },
      getBinding: __js function(name, defval) {
        if (bindings .. @hasOwn(name)) {
          return bindings[name];
        }
        if (arguments.length === 2)
          return defval;
        throw new Error("Binding #{name} not found");
      }
    };
  },
  {priority: @MECH_PRIORITY_API}
);
exports.BindingContext = BindingContext;


//----------------------------------------------------------------------

/**
   @function Binding
   @summary Retrieve a value previously set with [::Bind]
   @param {optional DOMNode} [node] Any child of the binding context from which the value should be retrieved; default: use the implicit [mho:surface::DynamicDOMContext].
   @param {String} [name] Name of bound value to retrieve
   @param {optional Object} [defval] Default value to return if no bound value found; if not specified, implementation will throw an error.
   @desc
     For a general explanation of the scheme implemented by the [./binding::] module, see [::Bind].

     Traverses all binding contexts enclosing `node` (or the [mho:surface::DynamicDOMContext]), from the inner-most context to the outer-most context.
     Returns the first found binding of the given `name`. If no binding is found
     in any enclosing context, `defval` will be returned, or if no `defval` is 
     specified, an error will be thrown.

     Note that if binding contexts are resolved via a [mho:surface::DynamicDOMContext] 
     that contains multiple nodes, then binding contexts will be resolved in a
     depth-first search, NOT a breadth-first search. This might lead to 
     unexpected results if the `name` being retrieved is set in multiple 
     enclosing contexts.
*/

__js {
  var BINDING_NO_DEFVAL = {};
  var BINDING_NOT_FOUND = {};
  function Binding(/* [node], name, [defval] */) {
    var nodes,name,defval=BINDING_NO_DEFVAL;
    
    if (arguments.length === 1) {
      name = arguments[0];
    }
    else if (arguments.length === 2) {
      if (arguments[0] .. @dom.isDOMNode) {
        nodes = [arguments[0]];
        name = arguments[1];
      }
      else {
        name = arguments[0];
        defval = arguments[1];
      }
    }
    else if (arguments.length === 3) {
      nodes = [arguments[0]];
      if (!@dom.isDOMNode(node[0]))
        throw new Error("Invalid argument to Binding(); DOM node expected, #{node} given");
      name = arguments[1];
      defval = arguments[2];
    }
    else throw new Error("Unexpected number of arguments to Binding()");
    
    if (!nodes) 
      nodes = @getDOMNodes() .. @toArray;

    // XXX we could change this to a breadth-first search. it might be more
    // useful.
    for (var i=0; i<nodes.length; ++i) {
      var node = nodes[i];
      while (node) {
        if (node[ITF_BINDING_CONTEXT]) {
          var rv = node[ITF_BINDING_CONTEXT].getBinding(name, BINDING_NOT_FOUND);
          if (rv !== BINDING_NOT_FOUND)
            return rv; // found!
        }
        node = node.parentNode;
      }
    }
    if (BINDING_NO_DEFVAL)
      throw new Error("Binding('#{name}') not found");
    else
      return defval;
  }
  exports.Binding = Binding;
} // __js 

