/**
 * # Widget interactions
 *
 * Widgets can interact with each other via their mechanisms.
 *
 * In this example, we create a `stop` [Condition] object.
 * When the stop button is clicked, it sets the `stop` condition.
 *
 * We also make use of surface's [withWidget] function. This
 * acts much like [appendWidget], but it also takes a block
 * function. When the function completes, the widget is removed
 * cleanly, retracting any Mechanisms attached to the widget or its
 * children.
 *
 * In this example, the block function just waits for the `stop`
 * condition to be set.
 *
 * [Condition]: /__sjs/doc/modules.html#cutil::Condition
 * [withWidget]: /__sjs/doc/modules.html#/modules/surface/html::withWidget
 * [appendWidget]: /__sjs/doc/modules.html#/modules/surface/html::appendWidget
 */

var cutil = require('sjs:cutil');
var logging = require('sjs:logging');
var { Widget, Mechanism,
      withWidget, OnClick } = require("mho:surface");


var stopped = cutil.Condition();

// make a stop button
var stopButton = Widget("button", "stop that...")
	.. OnClick(-> stopped.set());

// make the greeting
var greeting = Widget("div", "Hello, World!")
	.. Mechanism {|elem|
		var visible = true;
		try {
			while(true) {
				elem.style.opacity = visible ? '1.0' : '0.5';
				visible = !visible;
				hold(500); // 0.5 seconds
			}
		} retract {
			// Retraction is what happens when a code path
			// is abandoned / aborted. Retraction can be
			// caught much like an exception, by using
			// this `try/retract` syntax.
			//
			// any `finally` blocks will also be called
			// upon retraction.
			logging.info("Goodbye!");
		}
	};


// add both widgets to the document
document.body .. withWidget([greeting, stopButton]) {||
	stopped.wait();
}
