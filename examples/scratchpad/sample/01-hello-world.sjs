/**
 * # A basic widget
 *
 * A [Widget] is surface's HTML building block.
 *
 * In this example, we construct a widget and append
 * it to the document.
 *
 * The _doube-dot_ syntax seen on the last line of this example
 * is equivalent to:
 *
 *     appendWidget(document.body, greeting);
 *
 * The `..` operator is conductance's syntax for calling
 * _extension methods_. These are similar to mixins in some
 * other languages like Ruby, but they are implemented as
 * plain functions - we haven't modified `document.body` to
 * make this mixin available, we've just imported it as
 * a local variable and applied it using `..`
 *
 * [Widget]: /modules/surface/html.sjs#Widget
 */
var { Widget, appendWidget } = require("mho:surface");

var greeting = Widget("div", "Hello, World!");

document.body .. appendWidget(greeting);
