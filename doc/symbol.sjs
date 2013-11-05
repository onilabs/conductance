var seq = require('sjs:sequence');
var {each, join, at, toArray, map, sortBy} = seq;
var assert = require('sjs:assert');
var array = require('sjs:array');
var Library = require('./library');
var logging = require('sjs:logging');
var {ownValues, pairsToObject, ownPropertyPairs} = require('sjs:object');

var ui = require('./ui');

var Symbol = exports.Symbol = function(libraries, library, relativeModulePath, symbolPath) {
	this.libraries = libraries;
	this.library = library;
	this.className = symbolPath.length == 2 ? symbolPath[0];
	this.relativeModulePath = relativeModulePath;
	this.fullModulePath = [this.library.name].concat(this.relativeModulePath);
	this.symbolPath = symbolPath;
	this.path = this.fullModulePath.concat(this.symbolPath);
	this.name = this.path .. at(-1);
};

// construct an instance for a symbol in the same library
Symbol.prototype._new = function(relativeModulePath, symbolPath) {
	return new Symbol(this.libraries, this.library, relativeModulePath, symbolPath);
};

Symbol.prototype.docs = function() {
	ui.LOADING.block { ||
		return this.library.loadDocs(this.relativeModulePath, this.symbolPath)
	}
};

Symbol.prototype.skeletonDocs = function() {
	// like docs(), but can be satisfied from index (if present)
	ui.LOADING.block { ||
		return this.library.loadIndexFor(this.relativeModulePath.concat(this.symbolPath))
		    || this.library.loadDocs(this.relativeModulePath, this.symbolPath);
	}
};

Symbol.prototype.parent = function() {
	if (this.symbolPath.length) {
		return this._new(this.relativeModulePath, this.symbolPath.slice(0,-1));
	} else if (this.relativeModulePath.length) {
		return this._new(this.relativeModulePath.slice(0,-1), []);
	}
	return new RootSymbol(this.libraries);
};

Symbol.prototype.moduleLink = function() {
	return [this.fullModulePath.join(''), this.relativeModulePath.join('')];
}

Symbol.prototype.link = function() {
	var ext = this.relativeModulePath.join('');
	if (this.symbolPath.length) ext += '::' + this.symbolPath.join('::')
	return [this.library.name + ext, ext];
}

Symbol.prototype.childLink = function(name, info) {
	var [href] = this.link();
	if (!(['lib','module'] .. array.contains(info.type))) {
		href += '::'
	}
	return [href + name, name];
}

Symbol.prototype.child = function(name) {
	// TODO: do we ever need this for sub-modules?
	return this._new(this.relativeModulePath, this.symbolPath.concat([name]));
}

Symbol.prototype.parentLinks = function() {
	var rv = [];
	var href = "";
	this.fullModulePath .. each {|p|
		href += p;
		rv.push([href, p]);
	}

	this.symbolPath .. each {|p|
		href += '::' + p;
		rv.push([href, p]);
	}
	return rv;
};

Symbol.prototype.toString = -> require('sjs:debug').inspect([this.fullModulePath, this.symbolPath]);

var UnresolvedSymbol = exports.UnresolvedSymbol = function(moduleUrl, symbolPath) {
	this.moduleUrl = moduleUrl;
	this.symbolPath = symbolPath;
	this.name = [moduleUrl].concat(symbolPath) .. join('::');
};
UnresolvedSymbol.prototype.toString = -> "Symbol #{this.symbolPath .. join("::")} of missing module #{this.moduleUrl}";
UnresolvedSymbol.prototype.parent = function() { throw new Library.SymbolMissing(); };
UnresolvedSymbol.prototype.docs = function() { throw new Library.SymbolMissing(); };
UnresolvedSymbol.prototype.parentLinks = -> [];

var RootSymbol = exports.RootSymbol = function(libraries) {
	this.libraries = libraries;
};

RootSymbol.prototype.relativeModulePath = [];
RootSymbol.prototype.parent = -> null;
RootSymbol.prototype.docs = function() {
	var rv = {
		type: 'lib',
		lib: 'Available hubs',
		children: this.libraries.get() .. ownValues .. map(v -> [v.name, v.loadModuleDocs()]) .. pairsToObject
	};
	return rv;
}
RootSymbol.prototype.link = -> ['', 'All modules'];
RootSymbol.prototype.parentLinks = -> [];
RootSymbol.prototype.skeletonDocs = function() {
	return {
		children: this.libraries.get() .. ownValues .. map(lib -> [lib.name, {type: 'lib'}]) .. pairsToObject
	}
};
RootSymbol.prototype.childLink = (name) -> [name, name];


exports.resolveLink = function(link, libraries) {
	if (!link) {
		return new RootSymbol(libraries);
	}
	var match = /^(.*?[^:]*)(::.*)?$/.exec(link);
	assert.ok(match, "Invalid path: #{link}");
	var [_, moduleUrl, symbolPath] = match;
	symbolPath = symbolPath ? symbolPath.slice(2).split('::') : [];

	try {
		var [library, relativeModulePath] = libraries.resolveModule(moduleUrl);
	} catch(e) {
		if (!(e instanceof Library.LibraryMissing)) throw e;
		return new UnresolvedSymbol(e.url, symbolPath);
	}

	return new Symbol(libraries, library, relativeModulePath, symbolPath);
};
