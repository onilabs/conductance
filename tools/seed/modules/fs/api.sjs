@ = require(['mho:std', {id:'sjs:type',name:'type'}]);
var { @mkdirp } = require('sjs:nodejs/mkdirp');

var { keys: apiKeys, proto: apiProto } = require('./prototype');

var invalidPath = function(p) {
	var e = new Error("Invalid path: #{p}");
	e.code = 'EACCES';
	throw e;
};

exports.createAPI = function(apiRoot) {
	@mkdirp(apiRoot);
	var getPath = function(p) {
		// we normalize all path arguments against the api-specific
		// root, and never allow traversing above the root
		if (!@isString(p)) throw new Error("invalid path (not a string)");
		p = @path.normalize(@path.join(apiRoot, p));
		if (p .. @split('/') .. @any(d -> d == '..')) {
			invalidPath(p);
		}

		if(!p .. @startsWith(apiRoot)) {
			invalidPath(p);
		}
		return p;
	}

	// for bridge simplicity, we only expose a single function which
	// takes its key as the first arg.
	var api = Object.create(apiProto);
	api._init(getPath);
	return function(op, args) {
		if(!apiKeys .. @hasElem(op)) throw new Error("Unsupported `fs` method: #{op}");
		return api[op].apply(api, args);
	};
}

