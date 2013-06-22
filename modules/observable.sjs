var { Emitter } = require('sjs:events');
var { slice, toArray, each, map } = require('sjs:sequence');

var ObservableProtoBase = {};

var ObservableProto = Object.create(ObservableProtoBase);

function Observable(initial_val) {
  var rv = Object.create(ObservableProto);

  var val = initial_val;
  var emitter = Emitter();

  rv.get = function() { return val };

  rv.set = function(v) { 
    val = v;  
    emitter.emit([val, {type: 'replace'}]);
  };

  rv.observe = function(o) {
    while (true) {
      o.apply(null, emitter.wait()); // xxx need a queue here
    }
  };

  return rv;
}

exports.Observable = Observable;

function isObservable(obj) {
  return (ObservableProtoBase.isPrototypeOf(obj));
}
exports.isObservable = isObservable;

//----------------------------------------------------------------------

var ComputedProto = Object.create(ObservableProtoBase);

function Computed(/* var1, ..., f */) {
  var rv = Object.create(ComputedProto);
  var deps = arguments .. slice(0,-1) .. toArray;
  var f = arguments[arguments.length-1];
  var emitter = Emitter();
  var observers = 0;  
  var observeStratum;

  rv.get = function() { return f.apply(null, deps .. map(d -> d.get())) };
  rv.set = function() { throw new Error("Cannot set a computed observable"); };
  
  rv.observe = function(o) {
    try {
      if (++observers == 1) 
        observeStratum = 
        spawn deps .. each.par { |d| d.observe { |v| emitter.emit([rv.get(), {type:'replace'}]) } };

      while (true) {
        o.apply(null, emitter.wait()); // xxx need a queue here
      }
      
    }
    finally {
      if (--observers == 0)
        observeStratum.abort();
    }
  }
  
  return rv;
}
exports.Computed = Computed;
