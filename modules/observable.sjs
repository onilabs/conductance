var cutil = require('sjs:cutil');
var { Stream, toArray, slice, integers, each } = require('sjs:sequence');

/**
   @function Observable
   @param {Object} [val] Initial value
   @return {sjs:sequence::Stream} Stream object with additional `get` and `set` methods.
   @summary Create a value which can be modified and watched for changes.
   @desc
      TO BE WRITTEN
*/

function Observable(val) {
  var rev = 1;
  var change = Object.create(cutil._Waitable);
  change.init();

  function wait(have_rev) {
    if (have_rev !== rev)
      return rev;
    return change.wait();
  }

  var rv = Stream(function(receiver) {
    var have_rev = 0;
    while (true) {
      wait(have_rev);
      have_rev = rev;
      receiver(val);
    }
  });

  rv.set = function(v) {
    val = v;
    change.emit(++rev);
  };

  rv.get = -> val;
  return rv;
}
exports.Observable = Observable;


/**
  @class Computed
  @inherit ::ObservableBase
  @summary A stream of values derived from one or more [sjs:sequence::Stream] inputs (including [::Observable]s).

  @param {Function} [compute]
  @desc
    Computed objects allow you to represent computed values of observables
    directly. When they are constructed, you pass in any number of [::Observable]
    inputs, followed by a final argument which is the `compute` function.

    When the returned stream it being iterated, the `compute` function will be called
    to generate the current value whenever one of the inputs changes.
    `compute` is passed the current value of all input observables, in the same order
    they were passed to the `Computed` constructor.

    For example, you might want to compute a deriverd property
    from a single observable:

        var person = Observable({
          firstName: "John",
          lastName: "Smith",
        });

        var fullName = Computed(person, function(current) {
          return "#{current.firstName} #{current.lastName}";
        });

    When `person` changes, `fullName` will be recomputed automatically, and
    any code observing `fullName` will see the new value immediately.

    You can create a Computed observable from multiple source observables:

        var runner = Observable({
          firstName: "John",
          lastName: "Smith",
          id: 5,
        });

        // The most recent race results:
        var latestRanking = Observable([8, 2, 5, 7, 1, 3]);

        var personStatus = Computed(runner, latestRanking, function(runnerVal, rankingVal) {
          return `$(runnerVal.firstName) came #$(rankingVal.indexOf(runner.id)+1) in the last race`;
        });

        // If `personStatus` is displayed in a [surface::Widget], the UI would
        // initially read "John came #3 in the last race", and would update
        // whenever `runner` or `latestRanking` changed.

*/
function Computed(/* var1, ...*/) {
  var deps = arguments .. slice(0,-1) .. toArray;
  var f = arguments[arguments.length-1];

  return Stream(function(receiver) {
    var inputs = [], primed = 0, rev=1;
    var change = Object.create(cutil._Waitable);
    change.init();

    waitfor {
      var current_rev = 0;
      while (1) {
        change.wait();
        if (primed < deps.length) continue;
        while (current_rev < rev) {
          current_rev = rev;
          receiver(f.apply(null, inputs));
        }
      }
    }
    or {
      cutil.waitforAll(
        function(i) {
          var first = true;
          deps[i] .. each {
            |x|
            inputs[i] = x;
            if (first) {
              ++primed;
              first = false;
            }
            else
              ++rev;
            change.emit();
          }
        },
        integers(0,deps.length-1) .. toArray);
    }
  });
}
exports.Computed = Computed;
