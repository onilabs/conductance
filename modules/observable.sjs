var { Emitter } = require('sjs:events');
var { slice, toArray, each, map, any, at, transform, zipLongest, sortBy } = require('sjs:sequence');
var { isArrayLike } = require('builtin:apollo-sys');
var { getPath } = require('sjs:object');
var { setMarshallingDescriptor } = require('./rpc/bridge');

var NonSpecificChange = {type: 'set'};
var toPath = function(p) {
  if (p === undefined) return [];
  if (isArrayLike(p)) return p .. toArray;
  return p.split(".");
}

var ObservableProtoBase = {};

ObservableProtoBase.observePath = function(path, o) {
  path = toPath(path);
  if (path.length == 0) return this.observe(o);
  var last = undefined;
  this.observe {|val, change|
    // TODO: smartly process events of type=update
    var newVal = val .. getPath(path, undefined);
    // TODO: this will skip mutations
    if (newVal === last) continue;
    last = newVal;
    o(newVal, NonSpecificChange);
  }
};

/**
  @class ObservableBase
  @summary Base class for all Observable object types
*/

var ObservableProto = Object.create(ObservableProtoBase) .. 
  setMarshallingDescriptor({
    wrapLocal: local -> { get: -> local.get(), 
                          set: val -> local.set(val),
                          observe: o -> local.observe(o) },
    wrapRemote: ['mho:observable', 'wrapRemoteObservable']
  });

// XXX not complete and not optimal; just a proof-of-principle at this moment
function wrapRemoteObservable(proxy) {
  var rv = Object.create(ObservableProto);
  rv.get = -> proxy.get();
  rv.set = val -> proxy.set(val);
  rv.observe = o -> proxy.observe(o); // XXX want to observe locally
  return rv;
}
exports.wrapRemoteObservable = wrapRemoteObservable;

ObservableProto._emit = function(c) {
  this.revision++;
  this.emitter.emit(c);
};

/**
  @function ObservableBase.get
  @summary Get the current value of this observable
*/
ObservableProto.get = function() { return this.val };

/**
  @function Observable.setPath
  @summary Like [sjs:object::setPath] for an observable object
*/
ObservableProto.setPath = function(path, v) {
  path = toPath(path);
  if (path.length == 0) return this.set(v);
  var par = path.length == 1 ? this.val : this.val .. getPath(path.slice(0,-1));
  par[path .. at(-1)] = v;
  this._emit({type: 'update', path: path});
};

/**
  @function ObservableBase.set
  @param {Object} [value]
  @summary Set a new value for this observable
*/
ObservableProto.set = function(v) {
  this.val = v;
  this._emit(NonSpecificChange);
};

/**
  @function ObservableBase.observe
  @param {Function} [observer]
  @summary Watch this observable for changes
  @desc

    Each time the observable changes (via `set`, `setPath`, or a change any
    input value for a [::Computed] observable), `observer` will be called with
    two arguments. The first is the new value, and the second is the change object
    (which may contain specific information about the change that occurred).

    Example use:

        var obs = Observable("initial");
        waitfor {
          obs.observe {|val, change|
            console.log("New value: #{val} (change type: #{change.type})");
          }
        } or {
          obs.set("second");
          hold(1000);
          obs.set("third");
          hold(1000);
        }

        // prints:
        // New value: initial (change type: set)
        // New value: second (change type: set)
        // New value: third (change type: set)

    **Note:** when observe() is called, the `observer` function will be
    invoked immediately with the current value of this observable. This is
    necessary to avoid missing updates when dealing with remote observables,
    but you may want to ignore the first update from an observable if you only
    care about future changes.
*/
ObservableProto.observe = function(o) { var lastrev, val; var change =
NonSpecificChange; while(true) { while(lastrev !== this.revision) { lastrev =
this.revision; o(this.val, change);
      // missed updates have no specific change information
      change = NonSpecificChange; } change = this.emitter.wait(); } };

function initObservable(obj, initial_val) {
  obj.revision = 0;
  obj.val = initial_val;
  obj.emitter = Emitter();
  return obj;
}

/**
  @class Observable
  @inherit ::ObservableBase
  @summary A value that can be set, retrieved ans observed.

  @function Observable
  @param {optional Object} [val] initial value
*/
function Observable(initial_val) {
  var rv = Object.create(ObservableProto);
  rv .. initObservable(initial_val);
  return rv;
}

exports.Observable = Observable;


//----------------------------------------------------------------------

/**
  @function isObservable
  @param {Object} [object]
  @summary Return whether the given object is an [::ObservableBase]
  @return {Boolean}
*/
function isObservable(obj) {
  return (ObservableProtoBase.isPrototypeOf(obj));
}
exports.isObservable = isObservable;

/**
  @function isMutatable
  @summary **TODO**
*/
function isMutatable(obj) {
  return (ObservableProto.isPrototypeOf(obj));
}
exports.isMutatable = isMutatable;

//----------------------------------------------------------------------

// it's important to inherit from ObservableProto, not
// ObservableProtoBase, so that isMutatable() is true for ObservableArrays

/**
  @class ObservableArray
  @inherit ::Observable
  @summary An Observable Array
  @desc

    An ObservableArray is like a regular Observable, but with additional
    methods for efficiently adding / removing elements rather than replacing
    the entire array on each update.
*/
var ObservableArrayProto = Object.create(ObservableProto) ..
  setMarshallingDescriptor({
    wrapLocal: local -> { get: -> local.get(), 
                          set: val -> local.set(val),
                          observe: o -> local.observe(o),
                          splice: -> local.splice.apply(local, arguments),
                          pop: -> local.pop(),
                          push: val -> local.push(val),
                          shift: -> local.shift(),
                          unshift: val -> local.unshift(val),
                          reverse: -> local.reverse(),
                          sort: -> local.sort.apply(local, arguments),
                          at: index -> local.at(index),
                          length: -> local.length(),
                          indexOf: (searchElem, fromIndex) -> local.indexOf(searchElem, fromIndex)
                        },
    wrapRemote: ['mho:observable', 'wrapRemoteObservableArray']
  });

// XXX not complete and not optimal; just a proof-of-principle at this moment
function wrapRemoteObservableArray(proxy) {
  var rv = Object.create(ObservableArrayProto);
  rv.get = -> proxy.get();
  rv.set = val -> proxy.set(val);
  rv.observe = o -> proxy.observe(o); // XXX want to observe locally
  rv.splice = -> proxy.splice.apply(proxy, arguments);
  rv.pop = -> proxy.pop();
  rv.push = val -> proxy.push(val);
  rv.shift = -> proxy.shift();
  rv.unshift = val -> proxy.unshift(val);
  rv.reverse = -> proxy.reverse();
  rv.sort = -> proxy.sort.apply(proxy, arguments);
  rv.at = index -> proxy.at(index);
  rv.length = -> proxy.length();
  rv.indexOf = (searchElem, fromIndex) -> proxy.indexOf(searchElem, fromIndex);

  return rv;
}
exports.wrapRemoteObservableArray = wrapRemoteObservableArray;


/**
  @function isObservableArray
  @param {Object} [obj]
  @summary Return whether `obj` is an [::ObservableArray]
*/
function isObservableArray(obj) {
  return (ObservableArrayProto.isPrototypeOf(obj));
}
exports.isObservableArray = isObservableArray;

/**
  @function ObservableArray.splice
  @summary Array.splice implementation for an [::ObservableArray]
  @param {Number} [index]
  @param {Object} [removed]
  @param {Object} [replacement ...]
*/
ObservableArrayProto.splice = function(index, removed /*,element1, ...*/) {

  // make sure we have canonical forms of index, removed, for the change notification:
  if (index < 0) index = index.length + index;
  if (index < 0) index = 0;
  if (index > this.val.length) index = this.val.length;
  removed = Math.min(this.val.length - index, removed);
  var added = arguments.length - 2;
  var appending = added && index+removed == this.val.length;

  this.val.splice.apply(this.val, arguments);
  this._emit({type:'splice',
                     index: index, removed: removed, added: added, appending: appending});
};

/**
  @function ObservableArray.pop
  @summary Array.pop implementation for an [::ObservableArray]
  @return {Object}
*/
ObservableArrayProto.pop = function() {
  var rv = this.val.pop();
  this._emit({type:'splice', index:this.val.length, removed: 1, added: 0, appending: false});
  return rv;
};

/**
  @function ObservableArray.push
  @summary Array.push implementation for an [::ObservableArray]
  @param {Object} [value]
*/
ObservableArrayProto.push = function(v) {
  var l = this.val.push(v);
  this._emit({type:'splice', index:l-1, removed: 0, added: 1, appending:true});
  return l;
};

/**
  @function ObservableArray.shift
  @summary Array.shift implementation for an [::ObservableArray]
  @return {Object}
*/
ObservableArrayProto.shift = function() {
  var rv = this.val.shift();
  this._emit({type:'splice', index:0, removed: 1, added: 0, appending:false});
  return rv;
};

/**
  @function ObservableArray.unshift
  @summary Array.unshift implementation for an [::ObservableArray]
  @param {Object} [value]
*/
ObservableArrayProto.unshift = function(v) {
  var l = this.val.unshift(v);
  this._emit({type:'splice', index:0, removed: 0, added: 1, appending:false});
  return l;
};

/**
  @function ObservableArray.reverse
  @summary Array.reverse implementation for an [::ObservableArray]
*/
ObservableArrayProto.reverse = function() {
  this.val.reverse.apply(this.val, arguments);
  this._emit({type:'reverse'});
};

/**
  @function ObservableArray.sort
  @summary Array.sort implementation for an [::ObservableArray]
  @param {Function} [cmp]
*/
ObservableArrayProto.sort = function(/*args*/) {
  this.val.sort.apply(this.val, arguments);
  this._emit({type:'sort'});
};

/**
  @function ObservableArray.sortBy
  @summary [sjs:sequence::sortBy] implementation for an [::ObservableArray]
  @param {Function|String} [key]
*/
ObservableArrayProto.sortBy = function(key) {
  this.val = sortBy(this.val, key);
  this._emit({type:'sort'});
};

/**
  @function ObservableArray.at
  @summary Array index operator for an [::ObservableArray]
  @param {Number} [index]
*/
ObservableArrayProto.at = index -> this.val[index];

/**
  @function ObservableArray.length
  @return {Number} The underlying array's current `length`
*/
ObservableArrayProto.length = -> this.val.length;

/**
  @function ObservableArray.indexOf
  @summary Array.indexOf implementation for an [::ObservableArray]
*/
ObservableArrayProto.indexOf = function(searchElement, fromIndex) {
  return this.val.indexOf(searchElement, fromIndex || 0);
};


/**
  @function ObservableArray
  @param {optional Array} [initial]
*/
function ObservableArray(initial_val) {
  var rv = Object.create(ObservableArrayProto);
  rv .. initObservable(initial_val || []);
  return rv;
}

exports.ObservableArray = ObservableArray;

//----------------------------------------------------------------------

/**
  @class Computed
  @inherit ::ObservableBase
  @summary A computed value derived from one or more [::ObservableBase] objects.

  @function Computed
  @param {Computed} [input ...]
  @param {Function} [compute]
  @desc
    Computed objects allow you to represent computed values of observables
    directly. When they are constructed, you pass in any number of [::Observable]
    inputs, followed by a final argument which is the `compute` function.

    Every time any of the inputs changes, the `compute` function will be called
    to generate the current value from the inputs. It is passed the current value of
    all input observables, in the same order they were passed to the `Computed`
    constructor.

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
        var latestRanking = ObservableArray([8, 2, 5, 7, 1, 3]);

        var personStatus = Computed(runner, latestRanking, function(runnerVal, rankingVal) {
          return `$(runnerVal.firstName) came #$(rankingVal.indexOf(runner.id)+1) in the last race`;
        });

        // If `personStatus` is displayed in a [surface::Widget], the UI would
        // initially read "John came #3 in the last race", and would update
        // whenever `runner` or `latestRanking` changed.

    **Note**: The value of a `Computed` is only recomputed as necessary. In practice, this means:

     - whenever `get()` is called, *or*
     - whenever any input changes while this value is being observed

    If computing a the current value from inputs is expensive, you should use a [::Computed.Cached],
    which has exactly the same semantics as a regular [::Computed], but only recomputes the
    value when `get()` is called if any input has changed since the last call to `get()`.

*/
var ComputedProto = Object.create(ObservableProtoBase);

ComputedProto.init = function(/* var1, ..., f */) {
  this._deps = arguments .. slice(0,-1) .. toArray;
  this._f = arguments[arguments.length-1];
  this._emitter = Emitter();
  this._observers = 0;
  this._observeStratum = null;
};

ComputedProto.set = function() { throw new Error("Cannot set a computed observable"); };

ComputedProto.observe = function(o) {
  try {
    if (++this._observers == 1)
      this._observeStratum = spawn this._deps .. each.par { |d| d.observe(=> this._emitter.emit())};
    
    while(true) {
      waitfor {
        this._emitter.wait();
      } and {
        o(this.get(), NonSpecificChange);
      }
    }
  }
  finally {
    if (--this._observers == 0)
      this._observeStratum.abort();
  }
}

/**
  @class Computed.Cached
  @inherit ::Computed
  @summary A caching version of [::Computed]

  @function Computed.Cached
  @param {Computed} [input ...]
  @param {Function} [compute]
  @desc
    Computed.Cached is the same as a regular [::Computed] object, but caches
    the computed value and returns this value from future calls to `get()`
    for as long as no input has changed.
*/
var CachedComputedProto = Object.create(ComputedProto);
CachedComputedProto.init = function() {
  ComputedProto.init.apply(this, arguments);
  this.revision = 0;

  var self = this;
  var lastValue;
  var depRevisions = this._deps .. transform(getRevision);
  var lastRevisions = [];
  var dirty = -> lastRevisions .. zipLongest(depRevisions) .. any([a,b] -> a !== b);
  var calcStratum;

  this.get = function() {
    if (calcStratum) calcStratum.waitforValue();
    calcStratum = null;

    if (dirty()) {
      var revisions = [], inputs = [];
      self._deps .. each {|d|
        inputs.push(d.get()); // may block
        revisions.push(getRevision(d));
      }

      if (dirty()) {
        calcStratum = spawn(function() {
          lastValue = self._f.apply(self._deps, inputs); // may block
          lastRevisions = revisions;
          self.revision++;
          calcStratum = null;
        }());
      }
    }

    if (calcStratum) calcStratum.waitforValue();
    return lastValue;
  };
};


function CachedComputed(/* var1, ..., f */) {
  var deps = arguments .. slice(0,-1) .. toArray;

  if (!(deps .. any(isObservable))) {
    // TODO: do we ever use this?
    // not dependent on any observables
    return f.apply(null, deps);
  }
  else {
    if (deps .. any(d -> d.revision === undefined)) {
      // no point caching computations that depend
      // on a non-cacheable input
      return ImpureComputed.apply(null, arguments);
    }

    var rv = Object.create(CachedComputedProto);
    rv.init.apply(rv, arguments);
    return rv;
  }
}

function ImpureComputed(/* var1, ..., f */) {
  var rv = Object.create(ComputedProto);
  rv.init.apply(rv, arguments);
  rv.get = function() { return this._f.apply(this._deps, this._deps .. map(d -> d.get())) };
  return rv;
};
exports.Computed = ImpureComputed;
exports.Computed.Cached = CachedComputed;

/**
  @function observe
  @summary `observe()` multiple [::ObservableBase] objects at once
  @param {::Observable} [input ...]
  @param {Function} [observer]
  @desc
    This function acts like [::ObservableBase::observe], but calls `observer`
    whenever any of the inputs changes.

    The arguments passed to `observer` are the current values of each `input`,
    followed by a final `change` argument (as in the second argument to a
    regular [::ObservableBase::observe] call).
*/
exports.observe = function(/* var1, ... , f */) {
  // TODO: this could be done without creating a dummy Computed value
  var deps = arguments .. slice(0, -1) .. toArray();
  var f = arguments .. at(-1);
  var args = deps.concat([-> deps .. map(d -> d.get())]);
  return ImpureComputed.apply(null, args).observe(vals -> f.apply(null, vals.concat([NonSpecificChange])));
};


//----------------------------------------------------------------------
// polymorphic accessors: these work for 'base' objects or observables

function get(obj) {
  return isObservable(obj) ? obj.get() : obj;
}
exports.get = get;

function at(arr, index) {
  return isObservable(arr) ? arr.at(index) : arr[index];
}
exports.at = at;

function length(arr) {
  return isObservable(arr) ? arr.length() : arr.length;
}
exports.length = length;

//----------------------------------------------------------------------

var MapProto = Object.create(ObservableProtoBase);

/**
  @function Map
  @summary Create an ObservableArray from the result of `arr .. map(fn)`
  @param {ObservableArray} [source] Input array
  @param {Function} [fn] Map function
  @desc
    This function is like [sjs:sequence::map], but produces an observable
    result which is recomputed as necessary:

        var input = ObservableArray([1,2,3]);

        var incremented = input .. Map(elem -> elem + 1);
        incremeented.get();
        // -> [2,3,4]

    This is similar to using a `Computed`:

        var incremented = Computed(input, arr -> arr .. map(elem -> elem + 1));

    Except that the result has the read-only methods from [::ObservableArray], such as `length` and `at`.

    In the future, it's likely that `Map` will use change information to recompute only
    the elements that have changed, but this is not yet implemented.
*/
function Map(arr, f) {
  var rv = Object.create(MapProto);

  rv.get    = -> get(arr) .. map(f);
  rv.set    = function() { throw new Error("Cannot set a computed map"); };
  rv.at     = index -> f(arr .. at(index));
  rv.length = -> arr .. length;

  rv.observe = function(o) {
    arr.observe(function(val, change) {
      o(val .. map(f), change);
    })
  };

  return rv;
}
exports.Map = Map;

__js var getRevision = function(o) {
  var r = o.revision;
  if (typeof r == "function") return r.call(o);
  return r;
};

//----------------------------------------------------------------------

var PropertyProto = Object.create(ObservableProtoBase);

PropertyProto._init = function (root, prop /*, ... */) {
  if (!isObservable(root)) throw new Error("object is not observable");
  this._root = root;
  this._path = (arguments .. toArray).slice(1);
};

PropertyProto.observe = (o) -> this._root.observePath(this._path, o);
PropertyProto.observePath = (p, o) -> this._root.observePath(this._path.concat(p));
PropertyProto.get = (o) -> this._root.get() .. getPath(this._path);
PropertyProto.set = (v) -> this._root.setPath(this._path, v);
PropertyProto.setPath = (p, v) -> this._root.setPath(this._path.concat(p), v);
PropertyProto.revision = -> this._root.revision;

/**
  @class Property
  @summary An (optionally) nested Observable tracking a property of a parent [::Observable]
  @param {Observable} [observable] parent object
  @param {String} [property ...] property name (multiple arguments specify nested properties)
  @description
    Create a [::Computed] object which tracks a single
    property of the parent observable. This property
    is both gettable and settable - setting it will modify
    the given property of the parent observable.

    ### Example:

        var person = Observable({
          firstName: "Ben",
          lastName: "Smith",
          age: 42
        });

        var firstName = person .. Property("firstName");
        firstName.get();
        // -> "Ben"

        firstName.set("Benjamin")
        person.get().firstName;
        // -> "Benjamin"

*/
var Property = exports.Property = function() {
  var rv = Object.create(PropertyProto);
  rv._init.apply(rv, arguments);
  return rv;
};


