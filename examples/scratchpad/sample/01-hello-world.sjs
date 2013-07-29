var { Widget, appendWidget } = require("mho:surface");

// A `widget` is surface's HTML building block.
var greeting = Widget("div", "Hello, World!");

// add the greeting to the document
document.body .. appendWidget(greeting);
