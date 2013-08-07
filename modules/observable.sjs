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

ObservableProtoBase.observePath = function(path, o) {
  path = toPath(path);
  if (path.length == 0) return this.observe(o);
  var last = undefined;
  this.observe {|val, change|
    // TODO: smartly process events of type=update
    var newVal = val .. getPath(path, undefined);
    if (newVal === last) continue;
    last = newVal;
    o(newVal, NonSpecificChange);
  }
};


var ObservableProto = Object.create(ObservableProtoBase);

ObservableProto._emit = function(c) {
  this.revision++;
  this.emitter.emit(c);
};

ObservableProto.get = function() { return this.val };

ObservableProto.setPath = function(path, v) {
  path = toPath(path);
  if (path.length == 0) return this.set(v);
  var par = path.length == 1 ? this.val : this.val .. getPath(path.slice(0,-1));
  par[path .. at(-1)] = v;
  this._emit({type: 'update', path: path});
};

ObservableProto.set = function(/* [path], */ v) {
  this.val = v;
  this._emit(NonSpecificChange);
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
    var dirty = false;
    if (++this._observers == 1)
      this._observeStratum =
        spawn this._deps .. each.par { |d| d.observe { |change| dirty = true; this._emitter.emit() } };
    
    while (true) {
      this._emitter.wait();
      while(dirty) {
        dirty = false;
        o(this.get(), NonSpecificChange);
      }
    }
  }
  finally {
    if (--this._observers == 0)
      this._observeStratum.abort();
  }
}

var CachedComputedProto = Object.create(ComputedProto);
CachedComputedProto.init = function() {
  ComputedProto.init.apply(this, arguments);
  this.revision = 0;

  var self = this;
  var lastValue;
  var depRevisions = this._deps .. transform(d -> d.revision);
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
        revisions.push(d.revision);
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
exports.Computed = CachedComputed;

function ImpureComputed(/* var1, ..., f */) {
  var rv = Object.create(ComputedProto);
  rv.init.apply(rv, arguments);
  rv.get = function() { return this._f.apply(this._deps, this._deps .. map(d -> d.get())) };
  return rv;
};
exports.Computed.Always = ImpureComputed;


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

