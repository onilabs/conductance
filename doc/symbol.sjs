var seq = require('sjs:sequence');
var {each, join, at, toArray} = seq;
var assert = require('sjs:assert');
var Library = require('./library');
var logging = require('sjs:logging');

var ui = require('./ui');

var Symbol = exports.Symbol = function(library, modulePath, symbolPath) {
	this.library = library;
	this.className = symbolPath.length == 2 ? symbolPath[0];
	this.modulePath = modulePath;
	this.symbolPath = symbolPath;
	this.path = seq.concat([this.library.name], this.modulePath, this.symbolPath) .. toArray;
	this.name = this.path .. at(-1);
};

Symbol.prototype.docs = function() {
	ui.LOADING.block { ||
		return this.library.loadDocs(this.modulePath, this.symbolPath)
	}
};

Symbol.prototype.moduleLink = function() {
	return [this.library.name + this.modulePath.join(''), this.modulePath.join('')];
}

Symbol.prototype.link = function() {
	var ext = this.modulePath.join('') + this.symbolPath.join('::')
	return [this.library.name + ext, ext];
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


exports.resolveLink = function(link, libraries) {
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

	return new Symbol(library, modulePath, symbolPath);
};
