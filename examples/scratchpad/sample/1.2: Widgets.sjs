/**
 * A [Widget] is surface's HTML building block.
 *
 * A widget always has a single top-level HTML element,
 * which you specify when calling the [Widget] function.
 *
 * Surface functions that accept widgets will also accept
 * a number of other types, and convert them to a widget as
 * necessary.
 *
 * The most useful type for dynamic templating is the [QuasiQuote].
 * These are strings delimited by backticks, and can have embedded values
 * using `${ ... }` syntax. Unlike typical string interpolation,
 * rich objects can be embedded without converting them to
 * strings.
 */

var { Widget, appendWidget } = require("mho:surface");

var div = Widget("p", "Regular strings are <not> interpreted as HTML");

var things = "values (which are automatically <escaped>)";
var quasi = `
	Quasi-quotes (delimited by <strong>backticks</strong>)
	are interpreted as HTML text, and can have embedded $things
`;

var array = Widget("p", [
	"Multiple widgets ",
	Widget("em", "can be concatenated "),
	Widget("small", "by passing in an array")
]);

var nested = Widget("p",
	`Of course, widgets can be ${
		Widget("strong", ["arbitrarily ", "nested"])
	}`);

document.body .. appendWidget([div, quasi, array, nested]);

