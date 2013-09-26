var { Emitter } = require('sjs:events');
var { slice, toArray, each, map, any, at, transform, zipLongest } = require('sjs:sequence');
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

var Property = exports.Property = function() {
  var rv = Object.create(PropertyProto);
  rv._init.apply(rv, arguments);
  return rv;
};


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

ObservableArrayProto.indexOf = function(searchElement, fromIndex) {
  return this.val.indexOf(searchElement, fromIndex || 0);
};


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
    if (++this._observers == 1)
      this._observeStratum =
        spawn this._deps .. each.par { |d| d.observe { |change| this._emitter.emit() } };
    
    var changed = false;
    while (true) {
      this._emitter.wait();
      waitfor {
        while (true) {
          // collect change events while other branch is running
          changed = true;
          this._emitter.wait();
        }
      } or {
        while(changed) {
          changed = false;
          o(this.get(), NonSpecificChange);
        }
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

__js var getRevision = function(o) {
  var r = o.revision;
  if (typeof r == "function") return r.call(o);
  return r;
};
