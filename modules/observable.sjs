var { Emitter } = require('sjs:events');
var { slice, toArray, each, map, any, at, transform, zipLongest } = require('sjs:sequence');
var { isArrayLike } = require('builtin:apollo-sys');
var { getPath } = require('sjs:object');

var NonSpecificChange = {type: 'set'};
var toPath = function(p) {
  if (p === undefined) return [];
  if (isArrayLike(p)) return p .. toArray;
  return p.split(".");
}

var ObservableProtoBase = {};

var ObservableProto = Object.create(ObservableProtoBase);

ObservableProto._emit = function(c) {
  this.revision++;
  this.emitter.emit(c);
};

ObservableProto.get = function() { return this.val };

ObservableProto.set = function(/* [path], */ v) {
  var path, type='set';
  if (arguments.length > 1) {
    path = toPath(arguments[0]);
    v = arguments[1];
    type = 'update';
    var par = path.length == 1 ? this.val : this.val .. getPath(path.slice(0,-1));
    par[path .. at(-1)] = v;
  } else {
    this.val = v;
  }
  this._emit({type: type, path: path});
};

ObservableProto.observe = function(o) {
  var lastrev, val;
  while(true) {
    var change = this.emitter.wait();
    while(lastrev !== this.revision) {
      lastrev = this.revision;
      o(this.val, change);
      // missed updates have no specific change information
      change = NonSpecificChange;
    }
  }
};

function initObservable(obj, initial_val) {
  obj.revision = 0;
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
  this._emit({type:'splice',
                     index: index, removed: removed, added: added, appending: appending});
};

ObservableArrayProto.pop = function() {
  var rv = this.val.pop();
  this._emit({type:'splice', index:this.val.length, removed: 1, added: 0, appending: false});
  return rv;
};

ObservableArrayProto.push = function(v) {
  var l = this.val.push(v);
  this._emit({type:'splice', index:l-1, removed: 0, added: 1, appending:true});
  return l;
};

ObservableArrayProto.shift = function() {
  var rv = this.val.shift();
  this._emit({type:'splice', index:0, removed: 1, added: 0, appending:false});
  return rv;
};

ObservableArrayProto.unshift = function(v) {
  var l = this.val.unshift(v);
  this._emit({type:'splice', index:0, removed: 0, added: 1, appending:false});
  return l;
};

ObservableArrayProto.reverse = function() {
  this.val.reverse.apply(this.val, arguments);
  this._emit({type:'reverse'});
};

ObservableArrayProto.sort = function(/*args*/) {
  this.val.sort.apply(this.val, arguments);
  this._emit({type:'sort'});
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
    var calcStratum;

    // dirty tracking
    rv.revision = 0;
    var lastValue;
    var depRevisions = deps .. transform(d -> d.revision);
    var lastRevisions = [];
    var dirty = -> lastRevisions .. zipLongest(depRevisions) .. any([a,b] -> a !== b);

    rv.get = function() {
      if (calcStratum) calcStratum.waitforValue();
      calcStratum = null;

      if (dirty()) {
        var revisions = [], inputs = [];
        deps .. each {|d|
          inputs.push(d.get()); // may block
          revisions.push(d.revision);
        }

        if (dirty()) {
          calcStratum = spawn(function() {
            lastValue = f.apply(deps, inputs); // may block
            lastRevisions = revisions;
            rv.revision++;
            calcStratum = null;
          }());
        }
      }

      if (calcStratum) calcStratum.waitforValue();
      return lastValue;
    };
    rv.set = function() { throw new Error("Cannot set a computed observable"); };
    
    rv.observe = function(o) {
      try {
        if (++observers == 1)
          observeStratum =
            spawn deps .. each.par { |d| d.observe { |change| emitter.emit(null) } };
        
        while (true) {
          emitter.wait();
          // force evaluation (and keep repeating until dirty() returns false)
          do {
            o(this.get(), NonSpecificChange);
          } while(dirty());
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

exports.observe = function(/* var1, ... , f */) {
  // TODO: this could be done without creating a dummy Computed value
  var deps = arguments .. slice(0, -1) .. toArray();
  var f = arguments .. at(-1);
  var args = deps.concat([-> deps .. map(d -> d.get())]);
  return Computed.apply(null, args).observe(vals -> f.apply(null, vals.concat([NonSpecificChange])));
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

