var { Widget, Mechanism, appendWidget, withWidget, OnClick } = require("mho:surface");
var events = require('sjs:events');
var logging = require('sjs:logging');

// Note that a mechanism will be run each time
// a widget is used in the document, with the `elem` argument
// corresponding to the specific DOM node.
var greeting = Widget("div", "Hello, World!") .. Mechanism {|elem|
	var visible = true;
	
	waitfor {
		while(true) {
			elem.style.opacity = visible ? '1.0' : '0.5';
			visible = !visible;
			hold(500); // 0.5 seconds
		}
	} or {
		// remove the element when it's clicked
		events.wait(elem, 'click');
		elem.remove();
	}
};

// widgets can be re-used multiple times in the same document,
// and will remain independent
var addMore = Widget("button", "More!")
	.. OnClick(-> document.body .. appendWidget(greeting));

document.body .. appendWidget([addMore, greeting]);
