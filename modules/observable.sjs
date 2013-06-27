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

function isObservableArray(obj) {
  return (ObservableArrayProto.isPrototypeOf(obj));
}
exports.isObservableArray = isObservableArray;

ObservableArrayProto.splice = function(index, removed /*,element1, ...*/) {

  // make sure we have canonical forms of index, removed, for the change notification:
  if (index < 0) index = index.length + index;
  if (index < 0) index = 0;
  if (index > this.val.length) index = this.val.length;
  removed = Math.min(this.val.length - index, removed);
  var added = arguments.length - 2;
  var appending = added && index+removed == this.val.length;

  this.val.splice.apply(this.val, arguments);
  this.emitter.emit({type:'splice', 
                     index: index, removed: removed, added: added, appending: appending});
};

ObservableArrayProto.pop = function() {
  var rv = this.val.pop();
  this.emitter.emit({type:'splice', index:this.val.length, removed: 1, added: 0, appending: false});
  return rv;
};

ObservableArrayProto.push = function(v) {
  var l = this.val.push(v);
  this.emitter.emit({type:'splice', index:l-1, removed: 0, added: 1, appending:true});
  return l;
};

ObservableArrayProto.shift = function() {
  var rv = this.val.shift();
  this.emitter.emit({type:'splice', index:0, removed: 1, added: 0, appending:false});
  return rv;
};

ObservableArrayProto.unshift = function(v) {
  var l = this.val.unshift(v);
  this.emitter.emit({type:'splice', index:0, removed: 0, added: 1, appending:false});
  return l;
};

ObservableArrayProto.reverse = function() {
  this.val.reverse.apply(this.val, arguments);
  this.emitter.emit({type:'reverse'});
};

ObservableArrayProto.sort = function(/*args*/) {
  this.val.sort.apply(this.val, arguments);
  this.emitter.emit({type:'sort'});
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
    rv.get = function() { return f.apply(deps, deps .. map(d -> d.get())) };
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

function Map(arr, f) {
  var rv = Object.create(MapProto);

  rv.get    = -> get(arr) .. map(f);
  rv.set    = function() { throw new Error("Cannot set a computed map"); };
  rv.at     = index -> f(arr .. at(index));
  rv.length = -> arr .. length;

  rv.observe = function(o) { arr.observe(o) };

  return rv;
}
exports.Map = Map;

