var array = require('sjs:array');
var str = require('sjs:string');
var {Computed, ObservableArray} = require('mho:observable');
var {find, each, filter, map, at, join} = require('sjs:sequence');
var {ownValues, hasOwn, get} = require('sjs:object');
var docutil = require('sjs:docutil');
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

CollectionProto.resolveModule = function(url) {
	// url may be a shorthand (e.g sjs:foo),
	// or a full URL (http://examples.com/sjs/foo).
	//
	// Returns: [library, relativePath]
	
	// TODO: return from inner blocklambda
	var ret;
	if (url .. str.endsWith('.sjs')) url = url.slice(0, -4);
	this.get() .. ownValues .. each {|lib|
		[lib.name, lib.root] .. each {|prefix|
			if (url .. str.startsWith(prefix)) {
				var modulePath = url.slice(prefix.length).split('/');
				// end all components but the last with a slash
				for (var i=0; i<modulePath.length - 1; i++) {
					modulePath[i] = modulePath[i] + '/';
				}
				if (!modulePath .. at(-1)) modulePath.pop();
				ret = [lib, modulePath];
				break;
			}
		}
	}
	if (ret) return ret;
	throw new LibraryMissing(url);
};

CollectionProto.get = function(name) {
	if (arguments.length === 0) {
		return this._libraries.get();
	}
	var lib = this.get() .. ownValues .. find(l -> l.name == name);
	assert.ok(lib, "library not found: #{name}");
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

var LibraryMissing = exports.LibraryMissing = function(lib) {
	this.message = "Missing library: #{lib}";
	this.url = lib;
};
LibraryMissing.prototype = new Error();

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
	this.moduleCache = {};
}

Library.prototype.loadFile = function(path) {
	return http.get(this.root + path);
};

Library.prototype.loadModuleDocs = function(path) {
	path = path .. join("");
	if (!this.moduleCache .. hasOwn(path)) {
		var docs;
		if (path .. str.endsWith('/')) {
			docs = docutil.parseSJSLibDocs(this.loadFile(path + "sjs-lib-index.txt"));
		} else {
			docs = docutil.parseModuleDocs(this.loadFile(path + ".sjs?format=src"));
		}
		this.moduleCache[path] = docs;
	}
	return this.moduleCache[path];
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

Library.prototype.loadDocs = function(modulePath, symbolPath) {
	var moduleDocs = this.loadModuleDocs(modulePath);
	
	// TODO: integrate index info if it exists
	var obj = moduleDocs;
	symbolPath = symbolPath.slice();

	while(symbolPath.length > 0) {
		var children = symbolPath.length > 1 ? obj.classes : obj.symbols;
		obj = children .. get(symbolPath.shift());
	}
	return obj;
};
