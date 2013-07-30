/**
 * # Chapter 2: Data Binding
 *
 * An [Observable] is a wrapper for a value that can change
 * When it changes, other values that depend on it are
 * recomputed.
 *
 * You can make a dependent value using the [Computed]
 * function, which takes any number of [Observable] objects,
 * plus a function to calulate the new value from the current
 * state of each of its inputs.
 *
 * Computed objects are in turn observable, so you
 * can depend on other computed values.
 */

var { Input } = require('mho:surface/widgets');

var user = {
	firstName: Observable("John"),
	lastName: Observable("Smith"),
};

document.body .. appendWidget(`
	<form>
		<input>$firstName</input>
		<input>$lastName</input>
	</form>

	<p>Hello, $firstName $lastName</p>
`);
