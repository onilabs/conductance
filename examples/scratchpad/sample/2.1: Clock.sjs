/**
 * # Clock
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
var { Widget, Mechanism, appendWidget } = require("mho:surface");
var { Observable, Computed } = require('mho:observable');

var date = Observable(new Date());

// Create some computed values that will be
// recalculated whenever `date` changes.
var seconds = Computed(date, d -> d.getSeconds());
var time = Computed(date, d -> "#{d.getHours()}:#{d.getMinutes()}");

var counter = Widget( "div",
	`The time is: <strong>$time</strong> (and $seconds seconds...)`
	) .. Mechanism(function(elem) {
		// update the `date` value once per second
		while (true) {
			date.set(new Date());
			hold(1000);
		}
	}

document.body .. appendWidget(counter);
