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

/*

  Helpers for mechanisms that are used both in a static and dynamic context

  XXX This file is now deprecated. 

  It is still being used by static.sjs which will be retired at some point.

  It is not used any longer by dynamic.sjs. The code from `runMechanisms` has
  been folded into `insertHtml`, because in the case where `insertHtml` is 
  called with a `block` argument, the mechanisms did not have a return path
  to the caller of `insertHtml`: This information was lost because 
  `runMechanisms` was not active any longer by the time mechanisms executed.
  Because of this lack of return path, blocklambda return calls from mechanisms
  would not work correctly (and not at all anymore since the blocklambda logic
  had been changed for 0.8.0).
  This concerns e.g. the following scenario:
  function dialog() {
    parent .. @appendContent(@Button .. @OnClick({|| return; })) {
      ||
      hold();
    }
  }
*/

/**
  @nodoc
  @noindex
*/


@ = require([
  {id: 'sjs:sys', name:'sys'},
  'sjs:cutil',
  'sjs:sequence'
]);

// WARNING: this value needs to be synchronized with the equivalent value in base.sjs!!!
var MECH_PRIORITY_STREAM = 500;

var { withDOMContext } = require('./nodes');

// DOM Node Types:
var ELEMENT_NODE = 1;
var TEXT_NODE    = 3;
var COMMENT_NODE = 8;

//----------------------------------------------------------------------

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
exports.StreamNodes = StreamNodes;
} // __js

//----------------------------------------------------------------------


__js {
  // XXX helper for runMechanisms that should go elsewhere
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

//----------------------------------------------------------------------

__js var fakeArray = { push: -> null };

// XXX see note at top of this file
function runMechanisms(elems, mechanismsInstalled, await) {
  var rv = await ? [] : fakeArray;

  var mechs = PrioritySet();
  __js function addMech(elem, [mech, priority]) {
    mechs .. PrioritySet_push([elem, mechanismsInstalled[mech]], Number(priority));
  }

  elems .. @each {|elem|
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
    var s = @sys.spawn(-> withDOMContext(elem, function() { mech.func.call(elem, elem) }));
    elem.__oni_mechs.push(s);
    rv.push(s);
  };
  if (await) {
    return @sys.spawn(function() {
      var parent = reifiedStratum;
      rv .. @each(s -> parent.adopt(s));
    });
  }
}

exports.runMechanisms = runMechanisms;
