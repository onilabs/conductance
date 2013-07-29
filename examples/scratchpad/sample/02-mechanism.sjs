var { Widget, Mechanism, appendWidget } = require("mho:surface");

// a `Mechanism` is a function that will be run when the
// widget is added to the document.
var greeting = Widget("div", "Hello, World!") .. Mechanism {|elem|
	var visible = true;
	while(true) {
		elem.style.opacity = visible ? '1.0' : '0.5';
		visible = !visible;
		hold(500); // 0.5 seconds
	}
};

document.body .. appendWidget(greeting);
