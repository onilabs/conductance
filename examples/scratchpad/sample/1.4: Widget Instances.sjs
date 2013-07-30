/**
 * # Widget instances
 *
 * Every time a widget is added to the document, its
 * mechanisms will be run with the generated DOM node as the
 * first argument.
 *
 * Note that this means multiple instances of a widget's
 * mechanism can run independently, each associated with
 * a different DOM element.
 *
 * Click the "More!" button to add the greeting widget
 * multiple times to the same document.
 *
 * You can click on a greeting to remove it.
 * on it.
 */
var { Widget, Mechanism, appendWidget,
      withWidget, removeElement,
      OnClick } = require("mho:surface");

var events = require('sjs:events');
var logging = require('sjs:logging');

var greeting = Widget("div", "Hello, World!")
	.. Mechanism {|elem|
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

			// removeElement ensures associated
			// mechanisms are also aborted
			removeElement(elem);
		}
	};

var addMore = Widget("button", "More!")
	.. OnClick(-> document.body .. appendWidget(greeting));

document.body .. appendWidget([addMore, greeting]);
