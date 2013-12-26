/* (c) 2013 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

var cutil = require('sjs:cutil');
var { Stream, toArray, slice, integers, each, transform } = require('sjs:sequence');

/**
  @class Observable
  @inherit Stream
  @summary A value which can be modified and watched for changes.

  @function Observable
  @param {Object} [val] Initial value

  @function Observable.get
  @summary Get the current observable value.

  @function Observable.set
  @summary Set a new observable value
  @desc
    **Note:** If this observable value is shared by multiple pieces of
    code, it is typically better to use [::Observable::modify], which
    will protect against concurrent modifications to the same object.

  @function Observable.modify
  @summary Modify the current observable value
  @param {Function} [change]
  @desc

    `modify` allows you to change the current value of the observable
    without the possibility of race conditions. Consider:

        var increment = function(observable) {
          observable.set(count.get() + 1);
        };

    While the above code will work fine for a local observable object,
    it could silently drop data if either of `get`, `set` or the
    modification function may suspend, or if you forget to get()
    the latest value before setting the new one.

    Instead, the following code is safe under all conditions:

        var increment = function(observable) {
          observable.modify(val -> val + 1);
        };

    If the observable has not changed between the call to the
    `change` function and its return, the value will be updated atomically.

    If the value has changed, the return value from the `change` function
    is no longer necessarily correct, so `modify` throws a [::ConflictError]
    and does not update the value. If you expect multiple concurrent updates
    to a single observable, you should catch this exception yourself and
    retry as appropriate.

    ### Warning: avoid mutation

    It is highly recommended that the `change` function
    should be pure. That is, it should *not* modify the current
    value, but instead return a new value based on `current`.

    That is, **don't** do this:

        val.modify(function(items) { items.push(newItem); return items; });

    Instead, you should do this:

        val.modify(function(items) { return items.concat(newItem); });

    If you mutate the current value but a conflict occurs with other
    code trying to modify the same value, the results will likely
    be inconsistent - the value may have changed, but no observers
    will be notified of the change.

    ### Cancelling a modification

    In some cicrumstances, you may call `modify`, only to find that
    the current value requires no modification. For this purpose,
    a sentinel value is provided as the second argument to `change`.
    If `change` returns this value, the modification is abandoned.

        var decrement = function(observable) {
          observable.modify(function(current, unchanged) {
            if (current == 0) return unchanged;
            return current - 1;
          }
        }

    This is better than simply returning the current value as the new
    value, as that would still cause observers to be notified of the
    "new" value.
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
    if (newval !== unchanged) rv.set(newval);
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

        // If `personStatus` is displayed in a [surface::HtmlFragment], the UI would
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
   @summary Create a stream of tuples with Observable semantics.
   @desc
      ObservableTuple combines a number of input streams into a single
      stream where each element is an array of the latest value from
      each `input` - whenever one input changes, a new tuple is emitted.

      If you want to make a derived value from multiple inputs
      (rather than just an array of latest values), you should use [::Computed].
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

