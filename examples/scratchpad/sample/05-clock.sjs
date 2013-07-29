var { Widget, Mechanism, appendWidget } = require("mho:surface");
var { Observable, Computed } = require('mho:observable');

// an Observable is an object whose value can change. When it does,
// values depending on it are recomputed
var date = Observable(new Date());

// Create some values that will be recomputed when `date` changes.
var seconds = Computed(date, d -> d.getSeconds());
var time = Computed(date, d -> "#{d.getHours()}:#{d.getMinutes()}");

var counter = Widget(
    "div",
    `The time is: <strong>$time</strong> (and $seconds seconds...)`
) .. Mechanism {|elem|
    // a Mechanism is a function that gets run when the element
    // becomes visible. It will be retracted when the element is
    // removed from the DOM.
    while (true) {
        date.set(new Date());
        hold(1000); // 1 second
    }
}

// now add our counter to the document
document.body .. appendWidget(counter);
