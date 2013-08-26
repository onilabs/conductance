var seq = require('sjs:sequence');
var {each, join, at, toArray, map, sortBy} = seq;
var assert = require('sjs:assert');
var array = require('sjs:array');
var Library = require('./library');
var logging = require('sjs:logging');
var {ownValues, pairsToObject, ownPropertyPairs} = require('sjs:object');

var ui = require('./ui');

var Symbol = exports.Symbol = function(libraries, library, modulePath, symbolPath) {
	this.libraries = libraries;
	this.library = library;
	this.className = symbolPath.length == 2 ? symbolPath[0];
	this.modulePath = modulePath;
	this.symbolPath = symbolPath;
	this.path = seq.concat([this.library.name], this.modulePath, this.symbolPath) .. toArray;
	this.name = this.path .. at(-1);
};

// construct an instance for a symbol in the same library
Symbol.prototype._new = function(modulePath, symbolPath) {
	return new Symbol(this.libraries, this.library, modulePath, symbolPath);
}

Symbol.prototype.docs = function() {
	ui.LOADING.block { ||
		return this.library.loadDocs(this.modulePath, this.symbolPath)
	}
};

Symbol.prototype.skeletonDocs = function() {
	// like docs(), but can be satisfied from index (if present)
	ui.LOADING.block { ||
		return this.library.loadIndexFor(this.modulePath.concat(this.symbolPath))
		    || this.library.loadDocs(this.modulePath, this.symbolPath);
	}
};


Symbol.prototype.parent = function() {
	if (this.symbolPath.length) {
		return this._new(this.modulePath, this.symbolPath.slice(0,-1));
	} else if (this.modulePath.length) {
		return this._new(this.modulePath.slice(0,-1), []);
	}
	return new RootSymbol(this.libraries);
};

Symbol.prototype.moduleLink = function() {
	return [this.library.name + this.modulePath.join(''), this.modulePath.join('')];
}

Symbol.prototype.link = function() {
	var ext = this.modulePath.join('');
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

Symbol.prototype.parentLinks = function() {
	var rv = [];
	var href = this.library.name;
	rv.push([href, href]);
	this.modulePath .. each {|p|
		href += p;
		rv.push([href, p]);
	}

	this.symbolPath .. each {|p|
		href += '::' + p;
		rv.push([href, p]);
	}
	return rv;
};

Symbol.prototype.toString = -> require('sjs:debug').inspect([this.library.name, this.modulePath, this.symbolPath]);

var UnresolvedSymbol = exports.UnresolvedSymbol = function(moduleUrl, symbolPath) {
	this.moduleUrl = moduleUrl;
	this.symbolPath = symbolPath;
};
UnresolvedSymbol.prototype.toString = -> "Symbol #{this.symbolPath .. join("::")} of missing module #{this.moduleUrl}";
UnresolvedSymbol.prototype.parentLinks = function() {
	var rv = [];
	var href = this.moduleUrl;
	rv.push([href, href]);
	this.symbolPath .. each {|p|
		href += '::' + p;
		rv.push([href, p]);
	}
	return rv;
};

var RootSymbol = exports.RootSymbol = function(libraries) {
	this.libraries = libraries;
};

RootSymbol.prototype.parent = -> null;
RootSymbol.prototype.docs = function() {
	var rv = {
		type: 'lib',
		lib: 'Available hubs',
		children: this.libraries.get() .. ownValues .. map(v -> [v.name, v.loadModuleDocs()]) .. pairsToObject
	};
	console.log(rv);
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
	console.log("moduleUrl", moduleUrl);
	console.log("symbolPath", symbolPath);

	try {
		var [library, modulePath] = libraries.resolveModule(moduleUrl);
	} catch(e) {
		if (!(e instanceof Library.LibraryMissing)) throw e;
		return new UnresolvedSymbol(e.url, symbolPath);
	}

	return new Symbol(libraries, library, modulePath, symbolPath);
};
