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

module.setCanonicalId('mho:surface/nodes');

@ = require([
  'sjs:std',
  {id:'sjs:type', include: ['Interface']}
]);

/**
   @variable CTX_DOMROOT
   @summary XXX document me
*/
var CTX_DOMROOT = exports.CTX_DOMROOT = @Interface(module, "ctx_domroot");

/**
   @function withDOMRootContext
   @summary XXX document me
*/
function withDOMRootContext(root, block) {
  @sys.withDynVarContext {
    ||
    @sys.setDynVar(CTX_DOMROOT, root);
    block();
  }
};
exports.withDOMRootContext = withDOMRootContext;

/**
   @function Node
   @summary XXX document me
*/
function Node(/* [root], [selector] */) {

  // untangle arguments:
  var root, selector;
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'string')
      selector = arguments[0];
    else
      root = arguments[0];
  }
  else if (arguments.length === 2) {
    root = arguments[0];
    selector = arguments[1];
  }
  else if (arguments.length !== 0)
    throw new Error("Surplus arguments supplied to Node()");

  // if we don't have a dom root, try to obtain it from the environment:
  if (root === undefined) {
    root = @sys.getDynVar(CTX_DOMROOT, undefined);
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
    root .. @each {
      |node|
      if (node .. @dom.matchesSelector(selector))
        return node;
      var match = node.querySelector(selector);
      if (match) return match;
    }
    throw new Error("Selector '#{selector}' not found in DOM root context");
  }
};
exports.Node = Node;
