var cutil = require('sjs:cutil');
var { Stream, toArray, slice, integers, each, transform } = require('sjs:sequence');

/**
  @class Observable
  @inherit Stream
  @summary A value which can be modified and watched for changes.

  @function Observable
  @param {Object} [val] Initial value
  @desc
    TO BE WRITTEN

  @function Observable.get
  @summary TODO

  @function Observable.set
  @summary TODO

  @function Observable.modify
  @summary TODO
*/

var unchanged = {};
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

  rv.modify = function(f) {
    var newval;
    waitfor {
      change.wait();
      collapse;
      throw ConflictError("value changed during modification");
    } or {
      newval = f(val, unchanged);
    }
    if (newval !== unchanged) this.set(newval);
  };

  rv.get = -> val;
  return rv;
}
exports.Observable = Observable;

/**
  @class ConflictError
  @inherits Error
  @summary The error raised by [::Observable::modify] in the case of a conflict
*/
var ConflictErrorProto = new Error();
var ConflictError = exports.ConflictError = function(msg) {
  var rv = Object.create(ConflictErrorProto);
  rv.message = msg;
};

/**
  @function isConflictError
  @inherits Error
  @return {Boolean}
  @summary Return whether `e` is a [::ConflictError]
*/
exports.isConflictError = function(ex) {
  return Object.prototype.isPrototypeOf.call(ConflictErrorProto, ex);
};


/**
  @function Computed
  @return [sjs:sequence::Stream]
  @summary Create stream of values derived from one or more [sjs:sequence::Stream] inputs (including [::Observable]s).

  @param {Function} [compute]
  @desc
    Computed objects allow you to represent computed values of observables / streams
    directly. When they are constructed, you pass in any number of [sjs:sequence::Stream]
    inputs, followed by a final argument which is the `compute` function.

    When the returned stream is being iterated, the `compute` function will be called
    to generate the current value whenever one of the inputs changes.
    `compute` is passed the most recent value of all inputs, in the same order
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
    any code iterating over `fullName` will see the new value immediately.

    You can create a Computed stream from multiple source streams:

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
  return ObservableTuple.apply(null, deps) .. transform(args -> f.apply(null, args));
}
exports.Computed = Computed;

/**
   @function ObservableTuple
   @param {Stream} [input ...]
   @summary Create a stream of tuples with 'Observable semantics'.
   @desc
      TO BE WRITTEN
*/
var ObservableTuple = exports.ObservableTuple = function() {
  var deps = arguments;
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
          receiver(inputs.slice());
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

/**
  @function observe
  @summary `observe()` multiple [sjs:sequence::Stream] objects at once
  @param {sjs:sequence::Stream} [input ...]
  @param {Function} [block]
  @desc
    This function acts like [sjs:sequence::each] does on a single Observable,
    except that `block` is called whenever any of the inputs changes.

    The arguments passed to `observer` are the current values of each `input`.
*/
exports.observe = function() {
  var len = arguments.length;
  var items = Array.prototype.slice.call(arguments, 0, len-1);
  var block = arguments[len-1];
  return ObservableTuple.apply(null, items) .. each(args -> block.apply(null, args));
}

