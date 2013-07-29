var { Widget, Mechanism, appendWidget, withWidget, OnClick } = require("mho:surface");
var cutil = require('sjs:cutil');
var logging = require('sjs:logging');

// When the element is removed from the document, the mechanism
// is retracted if it's still running. This can be caught much
// like an exception, using the try/retract syntax.
var greeting = Widget("div", "Hello, World!") .. Mechanism {|elem|
	var visible = true;
	try {
		while(true) {
			elem.style.opacity = visible ? '1.0' : '0.5';
			visible = !visible;
			hold(500); // 0.5 seconds
		}
	} retract {
		logging.info("Goodbye!");
	}
};

// Create a "stop" condition (a condition is like an
// event that will only happen once).
var stopped = cutil.Condition();

var stopButton = Widget("button", "stop that...")
	.. OnClick(-> stopped.set());

// `withWidget` is like `appendWidget`, but will
// remove the element once the block ends:
document.body .. withWidget([greeting, stopButton]) {|elem|
	stopped.wait();
}
