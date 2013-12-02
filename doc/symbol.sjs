var seq = require('sjs:sequence');
var {each, join, at, toArray, map, sortBy, hasElem} = seq;
var assert = require('sjs:assert');
var Library = require('./library');
var logging = require('sjs:logging');
var { startsWith, endsWith, rstrip, contains } = require('sjs:string');
var {ownValues, pairsToObject, ownPropertyPairs} = require('sjs:object');
var { inspect } = require('sjs:debug')

// parameterized to prevent (recursive) dependency on `ui`
// Gets set to ui.LOADING.block by index.sjs once both
// modules are loaded
var loadingIndicator = (block) -> block();
exports.setLoadingIndicator = f -> loadingIndicator = f;

var INTERNAL_LINK_RE = /\[([^ \]]+)\](?![\[\(])/g;
exports.replaceInternalMarkdownLinks = function(text, replacer) {
	return text.replace(INTERNAL_LINK_RE, function(orig, dest) {
		var resolved = replacer(dest);
		if (!resolved) return orig;
		return resolved;
	});
};

var Symbol = exports.Symbol = function(libraries, library, relativeModulePath, symbolPath) {
	this.libraries = libraries;
	this.library = library;
	if (!library) throw new Library.SymbolMissing();
	this.className = symbolPath.length == 2 ? symbolPath[0];
	this.relativeModulePath = relativeModulePath;
	this.fullModulePath = [this.library.name].concat(this.relativeModulePath);
	this.isDirectory = this.fullModulePath .. at(-1) .. endsWith('/');
	this.symbolPath = symbolPath;
	this.path = this.fullModulePath.concat(this.symbolPath);
	this.name = this.path .. at(-1);
};

// construct an instance for a symbol in the same library
Symbol.prototype._new = function(relativeModulePath, symbolPath) {
	return new Symbol(this.libraries, this.library, relativeModulePath, symbolPath);
};

Symbol.prototype.docs = function() {
	loadingIndicator { ||
		return this.library.loadDocs(this.relativeModulePath, this.symbolPath)
	}
};

Symbol.prototype.skeletonDocs = function() {
	// like docs(), but can be satisfied from index (if present)
	loadingIndicator { ||
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

Symbol.prototype.basePath = function() {
	// returns the containing directory for a symbol, or the full module path for a lib
	var p = this.fullModulePath;
	if(!this.isDirectory) {
		p = p.slice(0, -1);
	}
	return p;
}

Symbol.prototype.link = function() {
	var ext = this.relativeModulePath.join('');
	if (this.symbolPath.length) ext += '::' + this.symbolPath.join('::')
	return [this.library.name + ext, ext];
}

Symbol.prototype.childLink = function(name, info) {
	var [href] = this.link();
	if (!(['lib','module'] .. hasElem(info.type))) {
		href += '::'
	}
	return [href + name, name];
}

Symbol.prototype.child = function(name, type) {
	var mod = this.relativeModulePath;
	var sym = this.symbolPath;
	switch(type) {
		case 'lib':
		case 'module':
		case 'moduledocs':
			return this._new(mod.concat([name]), sym);
		default:
			return this._new(mod, sym.concat([name]));
	}
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

Symbol.prototype.resolveLink = function(dest) {
	if (dest.indexOf("::") == -1) return null; // ids we care about contain '::'
	logging.debug("resolving link: #{dest}");

	dest = dest .. rstrip(':');
	var url, desc = dest.replace(/^[\/\.:]+/g, '');

	var leadingComponent = dest.split("::", 1)[0];
	if (leadingComponent == "") {
		// absolute link within our module (eg "::Semaphore::acquire", or "::foo")
		[url] = this.moduleLink();
		logging.debug("absolute link within module #{url}");
		url += this.isDirectory ? dest.slice(2) : dest;
	}
	else if (leadingComponent .. startsWith(".")) {
		// relative link
		var base = this.basePath();
		logging.debug("relativizing #{dest} against #{base}");
		var match;
		while(match = /^(\.{1,2})\//.exec(dest)) {
			var dots = match[1];
			dest = dest.slice(dots.length + 1);
			if (dots.length === 2) base.pop();
		}
		url = (base .. join('')) + dest;
	}
	else if (leadingComponent .. contains(":")) {
		// leadingComponent has hub / protocol: treat it as an absolute link
		var dest = resolveSymbol(this.libraries, dest);
		if (!dest.link) return null;
		[url, desc] = dest.link();
	} else {
		logging.debug("Assuming library-relative link for #{dest}");
		url = this.library.name + dest;
	}

	logging.debug("resolved to #{url}");
	if (!url) return null;
	// escape markdown characters that might be present in a symbol name
	desc = desc.replace(/([_\*#])/g, '\\$1');
	return [url, desc];
}

Symbol.prototype.toString = -> "<#Symbol(#{inspect(this.path)}>";

var UnresolvedSymbol = exports.UnresolvedSymbol = function(moduleUrl, symbolPath) {
	this.moduleUrl = moduleUrl;
	this.symbolPath = symbolPath;
	this.name = [moduleUrl].concat(symbolPath) .. join('::');
};
UnresolvedSymbol.prototype.toString = -> "Symbol #{this.symbolPath .. join("::")} of missing module #{this.moduleUrl}";
UnresolvedSymbol.prototype.parent = function() { throw new Library.SymbolMissing(); };
UnresolvedSymbol.prototype.docs = function() { throw new Library.SymbolMissing(); };
UnresolvedSymbol.prototype.resolveLink = function() { throw new Library.SymbolMissing(); };
UnresolvedSymbol.prototype.parentLinks = -> [];

var RootSymbol = exports.RootSymbol = function(libraries) {
	this.libraries = libraries;
};

RootSymbol.prototype.relativeModulePath = [];
RootSymbol.prototype.path = [];
RootSymbol.prototype.name = "Library index";
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
RootSymbol.prototype.child = function(name, type) {
	return new Symbol(
		this.libraries,
		this.libraries.get(name),
		[], []);
};

RootSymbol.prototype.resolveLink = function(dest) {
	return _resolveLink(this.libraries, dest);
};

RootSymbol.prototype.toString = function() {
	return '[object RootSymbol]';
};


var resolveSymbol = exports.resolveSymbol = function(libraries, link) {
	assert.ok(Library.CollectionProto.isPrototypeOf(libraries), "not a library collection");
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

