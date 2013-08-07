var seq = require('sjs:sequence');
var {each, join } = seq;

var ui = require('./ui');

var Symbol = exports.Symbol = function(library, modulePath, symbolPath) {
	this.library = library;
	this.className = symbolPath.length == 2 ? symbolPath[0];
	this.modulePath = modulePath;
	this.symbolPath = symbolPath;
};

Symbol.prototype.docs = function() {
	ui.LOADING.block { ||
		return this.library.loadDocs(this.modulePath, this.symbolPath)
	}
};

Symbol.prototype.requirePath = -> this.library.root + this.modulePath.join('');

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

var MissingLibrary = exports.MissingLibrary = function(moduleUrl, symbolPath) {
	this.moduleUrl = moduleUrl;
	this.symbolPath = symbolPath;
};
MissingLibrary.prototype.toString = -> "Symbol #{this.symbolPath .. join("::")} of missing module #{this.moduleUrl}";
MissingLibrary.prototype.parentLinks = function() {
	var rv = [];
	var href = this.moduleUrl;
	rv.push([href, href]);
	this.symbolPath .. each {|p|
		href += '::' + p;
		rv.push([href, p]);
	}
	return rv;
};

