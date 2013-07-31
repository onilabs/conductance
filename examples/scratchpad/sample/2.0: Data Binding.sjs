/**
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

var { TextInput, appendWidget } = require('mho:surface');
var { Observable, Computed } = require('mho:observable');

var firstName = Observable("John");
var lastName  = Observable("Smith");

// Computed() takes any number of observable
// arguments, plus a function to compute the
// value based on those inputs.
var fullName = Computed(
	firstName,
	lastName,
	(first, last) -> "#{first} #{last}");

document.body .. appendWidget(`
	<form>
		<div>
			<label>First:</label>
			${TextInput(firstName)}
		</div>
		<div>
			<label>Last:</label>
			${TextInput(lastName)}
		</div>
	</form>

	<p>Hi there, <em>$fullName</em></p>
`);
