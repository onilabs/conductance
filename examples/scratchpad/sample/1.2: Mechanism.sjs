/**
 * # Mechanisms
 *
 * A [Mechanism] is a function attached to a widget that
 * will be run whenever the widget is added to the document.
 *
 * In this example, we use a mechanism with an infinite loop
 * to periodically alter the greeting's opacity.
 *
 * [Mechanism]: /modules/surface/html.sjs#Mechanism
 */
var { Widget, Mechanism,
      appendWidget } = require("mho:surface");

var greeting = Widget("div", "Hello, World!")
	.. Mechanism(function(elem) {
		var visible = true;
		while(true) {
			elem.style.opacity = visible ? '1.0' : '0.5';
			visible = !visible;
			hold(500); // 0.5 seconds
		}
	});

document.body .. appendWidget(greeting);
