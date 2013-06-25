var { Emitter } = require('sjs:events');
var { slice, toArray, each, map, any } = require('sjs:sequence');

var ObservableProtoBase = {};

var ObservableProto = Object.create(ObservableProtoBase);

ObservableProto.get = function() { return this.val };
ObservableProto.set = function(v) {
  this.val = v;
  this.emitter.emit({type: 'set'});
};
ObservableProto.observe = function(o) {
  while (true) {
    o(this.emitter.wait()); // xxx need a queue here
  }
};

function initObservable(obj, initial_val) {
  obj.val = initial_val;
  obj.emitter = Emitter();
  return obj;
}

function Observable(initial_val) {
  var rv = Object.create(ObservableProto);
  rv .. initObservable(initial_val);
  return rv;
}

exports.Observable = Observable;

//----------------------------------------------------------------------

function isObservable(obj) {
  return (ObservableProtoBase.isPrototypeOf(obj));
}
exports.isObservable = isObservable;

function isMutatable(obj) {
  return (ObservableProto.isPrototypeOf(obj));
}
exports.isMutatable = isMutatable;

//----------------------------------------------------------------------

// it's important to inherit from ObservableProto, not
// ObservableProtoBase, so that isMutatable() is true for ObservableArrays
var ObservableArrayProto = Object.create(ObservableProto);

ObservableArrayProto.push = function(v) {
  this.val.push(v);
  this.emitter.emit({type:'push', index:this.val.length-1});
};

ObservableArrayProto.at = index -> this.val[index];

ObservableArrayProto.length = -> this.val.length;


function ObservableArray(initial_val) {
  var rv = Object.create(ObservableArrayProto);
  rv .. initObservable(initial_val || []);
  return rv;
}

exports.ObservableArray = ObservableArray;

//----------------------------------------------------------------------

var ComputedProto = Object.create(ObservableProtoBase);

function Computed(/* var1, ..., f */) {
  var deps = arguments .. slice(0,-1) .. toArray;
  var f = arguments[arguments.length-1];

  if (!(deps .. any(isObservable))) {
    // not dependent on any observables
    return f.apply(null, deps);
  }
  else {
    var rv = Object.create(ComputedProto);
    var emitter = Emitter();
    var observers = 0;  
    var observeStratum;
    rv.get = function() { return f.apply(null, deps .. map(d -> d.get())) };
    rv.set = function() { throw new Error("Cannot set a computed observable"); };
    
    rv.observe = function(o) {
      try {
        if (++observers == 1) 
          observeStratum = 
          spawn deps .. each.par { |d| d.observe { |change| emitter.emit({type:'set'}) } };
        
        while (true) {
          o(emitter.wait()); // xxx need a queue here
        }
        
      }
      finally {
        if (--observers == 0)
          observeStratum.abort();
      }
    }
    
    return rv;
  }
}
exports.Computed = Computed;

//----------------------------------------------------------------------
// polymorphic accessors

function Value(obj) {
  return isObservable(obj) ? obj.get() : obj;
}
exports.Value = Value;

function At(arr, index) {
  return isObservable(arr) ? arr.at(index) : arr[index];
}
exports.At = At;

function Length(arr) {
  return isObservable(arr) ? arr.length() : arr.length;
}
exports.Length = Length;

//----------------------------------------------------------------------

var MapProto = Object.create(ObservableProtoBase);

function Map(arr, f) {
  var rv = Object.create(MapProto);

  rv.get    = -> Value(arr) .. map(f);
  rv.set    = function() { throw new Error("Cannot set a computed map"); };
  rv.at     = index -> f(arr .. At(index));
  rv.length = -> arr .. Length;

  rv.observe = function(o) { arr.observe(o) };

  return rv;
}
exports.Map = Map;

