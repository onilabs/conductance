/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
   (to be documented as mho:surface)
*/

module.setCanonicalId('mho:surface/transitions');

@ = require([
  'sjs:std',
  './dynamic',
  {id:'sjs:type', include: ['Interface']}
]);

/* - undocumented
   @variable ITF_TRANSITION
*/
var ITF_TRANSITION = exports.ITF_TRANSITION = @Interface(module, "itf_transition");

//----------------------------------------------------------------------
// helpers

// (maybe to go into sjs lib?)
function nextAnimationFrame() {
  waitfor (var rv) {
    requestAnimationFrame(resume);
  }
  return rv;
}


//----------------------------------------------------------------------

/**
  @feature DynamicTransitionContext
  @summary An implicitly defined dynamic transition context
  @hostenv xbrowser
  @desc

     The transition context has *dynamic extent*, meaning that nested function calls (and even spawned calls) will receive this context.
*/


/**
   @function transition
   @param {Integer} [duration_ms]
   @param {Function} [block]
   @summary Execute `block` with a [::DynamicTransitionContext]
   @hostenv xbrowser
   @desc
      The transition context is injected as a dynamically-scoped variable using [sjs:sys::withDynVarContext].
*/
function transition(duration_ms, block) {
  var T = new @ObservableVar(0);
  var Tstream = @Stream(function(r) {
    T .. @each { 
      |t|
      r(t);
      if (t === 1) return;
    }
  });

  waitfor {
    @sys.withDynVarContext {
      ||
      @sys.setDynVar(ITF_TRANSITION, Tstream);
      block();
    }
  }
  or {
    try {
      var t1 = performance.now();
      var t2;
      while ( (t2 = nextAnimationFrame()) - t1 < duration_ms ) {
        T.set((t2-t1)/duration_ms);
      }
    }
    finally {
      // XXX examine swallowed exception here
      T.set(1);
    }
    hold();
  }
};
exports.transition = transition;

/**
   @variable transitionFrames
   @hostenv xbrowser
   @summary XXX write me
*/

var NoTransition = [1];

__js {
  var transitionFrames = @Stream(function(r) {
    var transition = @sys.getDynVar(ITF_TRANSITION, NoTransition);
    return transition .. @each(r);
  });
  exports.transitionFrames = transitionFrames;
}

__js {
  function easeInOutQuintic(t) {
    var t3 = t*t*t;
    var t4 = t3*t;
    var t5 = t4*t;
    return 6*t5 - 15*t4 + 10*t3;
  }
  exports.easeInOutQuintic = easeInOutQuintic;
}

function fadeIn(node) {
  var start_opacity = node.style.opacity;
  transitionFrames .. @each {
    |t|
    if (t > start_opacity)
      node.style.opacity = t;
  }
}
exports.fadeIn = fadeIn;

function fadeOut(node) {
  var start_opacity = node.style.opacity;
  console.log("start opacity = #{start_opacity}");
  transitionFrames .. @each {
    |t|
    if (t > 1-start_opacity)
      node.style.opacity = 1-t;
  }
}
exports.fadeOut = fadeOut;
