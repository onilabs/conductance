var array = require('sjs:array');
var str = require('sjs:string');
var {Computed, ObservableArray} = require('mho:observable');
var {find, each} = require('sjs:sequence');
var {ownValues, hasOwn} = require('sjs:object');
var http = require('sjs:http');
var logging = require('sjs:logging');

var assert = require('sjs:assert');

var CollectionProto = {};

CollectionProto._init = function() {
	this.val = ObservableArray([]);
	this._libraryCache = {};
	this._libraries = Computed(this.val, this._computeLibraries.bind(this));
};

CollectionProto._computeLibraries = function(hubs) {
	//logging.debug(`hub change: ${change}`);
	hubs .. each {|hub|
		var [name, url] = hub;
		console.log(name, url);

		if (! this._libraryCache .. hasOwn(url)) {
			this._libraryCache[url] = new Library(url, name);
		}
		this._libraryCache[url].name = name;
	}
	return this._libraryCache;
};

CollectionProto.get = function(name) {
	if (arguments.length === 0) {
		return this._libraries.get();
	}
	var lib = this.get() .. ownValues .. find(l -> l.name == name);
	assert.ok(lib, "library not fond: #{name}");
	return lib;
};

CollectionProto.add = function(name, url) {
	url = url ? url.trim();
	if (!url) {
		url = expandHub(name);
	}
	this.val.push([name,url]);
};

exports.Collection = function() {
	var rv = Object.create(CollectionProto);
	rv._init();
	return rv;
}

function expandHub(name) {
	require.hubs .. each {|[prefix, dest]|
		if (!str.isString(dest)) {
			// skip non-aliases
			continue;
		}
		if (name .. str.startsWith(prefix)) {
			return expandHub(dest + name.slice(prefix.length));
		}
	}
	return name;
}

function Library(url, name) {
	if (!url .. str.endsWith('/')) {
		url += '/';
	}
	this.root = url;
	this.name = name;
}

Library.prototype.loadFile = function(path) {
	return http.get(this.root + path);
};

Library.prototype.loadIndex = function() {
	var strata = spawn(function() {
		var result = null;
		try {
			result = JSON.parse(this.loadFile('sjs-lib-index.json'));
		} catch(e) {
			// TODO: probably a 404, but what if not?
			logging.info("Couldn't find index for #{this.root}: #{e}");
		} finally {
			this._index = result;
			this.loadIndex = -> result;
		}
	}.call(this));
	this.loadIndex = strata.waitforValue.bind(strata);
	return this.loadIndex();
};

