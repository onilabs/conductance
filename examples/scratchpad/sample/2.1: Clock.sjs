/**
 * TODO: description.
 */
var { Observable, Computed } = require('mho:observable');
var { Widget, Mechanism, appendWidget,
      Checkbox } = require("mho:surface");

var date = Observable(new Date());
var ampm = Observable(true);

// seconds depends only on the current date
var seconds = Computed(date, d -> d.getSeconds());

// the time display depends on both the current time and
// the state of the `ampm` flag
var time = Computed(date, ampm, function(date, ampm) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var suffix = "";
	if (ampm) {
		suffix = hours < 12 || hours >= 23 ? 'am' : 'pm';
		hours = hours % 12 || 12;
	}
	return "#{hours}:#{minutes} #{suffix}";
});

var display = Widget( "p",`
		The time is: <strong>$time</strong>
		(and $seconds seconds...)
		<br />
		$Checkbox(ampm) 12-hour
	`) .. Mechanism(function(elem) {
		while (true) {
			// update the `date` value once per second
			date.set(new Date());
			hold(1000);
		}
	});

document.body .. appendWidget(display);
