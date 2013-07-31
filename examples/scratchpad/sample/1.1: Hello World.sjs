/**
 * The _doube-dot_ syntax on the last line of this example
 * is equivalent to:
 *
 *     appendWidget(document.body, "Hello, world!");
 *
 * The `..` operator is conductance's syntax for calling
 * _extension methods_. These are similar to mixins in some
 * other languages like Ruby, but they are implemented as
 * plain functions - we haven't modified `document.body` to
 * make this mixin available, we've just imported it as
 * a local variable and applied it using `..`
 *
 */
var { Widget, appendWidget } = require("mho:surface");

document.body .. appendWidget("Hello, world!");
