var str = require('sjs:string');
var {find, each, filter, map, at, join, transform, first} = require('sjs:sequence');
var {ObservableVar} = require('sjs:observable');
var {remove} = require('sjs:array');
var {ownValues, hasOwn, get, clone, merge, pairsToObject} = require('sjs:object');
var docutil = require('sjs:docutil');
var http = require('sjs:http');
var logging = require('sjs:logging');
var sys = require('sjs:sys');
var assert = require('sjs:assert');

var CollectionProto = exports.CollectionProto = {};

CollectionProto._init = function() {
	this.val = ObservableVar([]);
	this._libraryCache = {};
	this._libraries = this.val .. transform(this._computeLibraries.bind(this));
};

CollectionProto._computeLibraries = function(hubs) {
	logging.debug(`hub change: ${hubs}`);
	var self = this;
	return hubs .. map(function([name, url]) {
		var cached = self._cacheUrl(url, name);
		cached.name = name;
		return [name, cached];
	}) .. pairsToObject();
};

CollectionProto._cacheUrl = function(url, name) {
	if (! this._libraryCache .. hasOwn(url)) {
		this._libraryCache[url] = new Library(url, name);
	}
	return this._libraryCache[url];
};

CollectionProto.resolveModule = function(url) {
	// url may be a shorthand (e.g sjs:foo),
	// or a full URL (http://examples.com/sjs/foo).
	//
	// Returns: [library, relativePath]
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
				// TODO: return from inner blocklambda
				ret = [lib, modulePath];
				break;
			}
		}
	}
	if (ret) return ret;
	logging.info("can't find library for #{url}");
	throw new LibraryMissing(url);
};

CollectionProto.get = function(name) {
	if (arguments.length === 0) {
		return this._libraries .. first();
	}
	var lib = this.get() .. ownValues .. find(l -> l.name == name, undefined);
	assert.ok(lib, "library not found: #{name}");
	return lib;
};

CollectionProto.add = function(name, url) {
	if(!name) throw new Error("Missing hub name");
	url = url ? url.trim();
	if (!url) {
		url = expandHub(name);
		if (url === name) url = "";
	}
	if(!url) throw new Error("Missing URL");
	if (this.val.get() .. find([n, u] -> u === url || n === name, false)) {
		throw new Error("Library already added");
	}
	this._cacheUrl(url, name);
  var val = this.val.get().slice();
  val.push([name,url])
	this.val.set(val);
};

CollectionProto.remove = function(name) {
	if (Array.isArray(name)) name = name[0];
	var current = this.val.get().slice();
	logging.debug("removing: ", name, 'from', current);
	var found = current .. find([n,url] -> n == name);
	current .. remove(found) .. assert.ok("Item not found: #{name}");
	this.val.set(current);
};

CollectionProto.toString = function() {
	return "[object Collection]";
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

var SymbolMissing = exports.SymbolMissing = function(m) {
	this.message = m || "Missing symbol";
};
SymbolMissing.prototype = new Error();


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
	this.loadModuleDocs();
	this.searchEnabled = ObservableVar(true);
}

Library.prototype.loadFile = function(path, params) {
	return http.get([
		this.root,
		path.split('/') .. map(encodeURIComponent) .. join('/'),
	params]);
};

Library.prototype.loadModuleDocs = function(path) {
	path = (path || []) .. join("");
	if (!this.moduleCache .. hasOwn(path)) {
		var docs = null;
		try {
			if (!path.length || path .. str.endsWith('/')) {
        try {
          var file = this.loadFile(path + "sjs-lib-index.txt");
        }
        catch (e) {
          // graciously handle missing sjs-lib-index.txt files
          console.log("Warning, no sjs-lib-index.txt file at #{this.root}#{path} (#{e})");
          file = "\n";
        }
				docs = docutil.parseSJSLibDocs(file);
			}
      else if (/.*\..*/.test(path)) {
        docs = docutil.parseModuleDocs(this.loadFile(path, { format:"src"}));
      }
      else {
				docs = docutil.parseModuleDocs(this.loadFile(path + ".sjs" , {format:"src"}));
			}
		} catch(e) {
			if (e.status != 404) throw e;
		}
		this.moduleCache[path] = docs;
	}
	var rv = this.moduleCache[path];
	if (!rv) throw new SymbolMissing("No module found at #{this.root}#{path}");
	return rv;
};

Library.prototype.loadIndex = function() {
  var result=null, is_exception;
  var me = this;
	var stratum = sys.spawn(function() {
		try {
			result = JSON.parse(me.loadFile('sjs-lib-index.json'));
		} catch(e) {
			if (e.status !== 404) {
        result = e;
        is_exception = true;
      }
			logging.info("Couldn't find index for #{this.root}: #{e}");
		} finally {
			//me._index = result;
			me.loadIndex = -> result;
			return result;
		}
	});
	this.loadIndex = function() { 
    stratum.wait(); 
    if (is_exception) throw result;
    return result;
  }
	return this.loadIndex();
};

Library.prototype.loadIndexFor = function(path) {
	var index = this.loadIndex();
	if (index != null) {
		path = path.slice();
		logging.debug("Traversing index", index, "for path", path);
		while(index && path.length > 0) {
			index = index.children .. get(path.shift(), null);
		}
	}
	return index;
};

Library.prototype.loadSkeletonDocs = function() {
	return this.loadIndex() || this.loadModuleDocs();
}

Library.prototype.loadDocs = function(modulePath, symbolPath) {
	var docs = this.loadModuleDocs(modulePath);

	if (symbolPath.length == 0) {
		// it's a module
		var index = this.loadIndexFor(modulePath);
		if (index != null) {
			docs = docs .. clone();
			// merge
			['children'] .. each {|key|
				docs[key] = merge(index[key], docs[key]);
			};

			// override
			['summary'] .. each {|key|
				docs[key] = docs[key] || index[key];
			};
			logging.debug("after index merge, docs are now:", docs);
		}
	} else {
		symbolPath = symbolPath.slice();
		while(docs && symbolPath.length > 0) {
			docs = docs.children .. get(symbolPath.shift(), null);
		}
	}
	if (!docs) throw new SymbolMissing("No such symbol: #{JSON.stringify({module: modulePath, symbol: symbolPath})}");
	return docs;
};

