@ = require('sjs:sequence');

exports.optionalNumber = function(n) {
	console.log("Testing: " + n + " // " + (!(/^[0-9]*$/.test(n))));
	if (!(/^[0-9]*$/.test(n))) throw new Error("Number required");
};

var identifierRe = /^[a-zA-Z][_a-zA-Z0-9]*$/;
var appNameRe =    /^[a-zA-Z][-_a-zA-Z0-9]*$/; // identifier + dashes

var identifierValidator = function(desc) {
	var rv = function(val) {
		if (identifierRe.test(val)) {
			return val;
		}
		throw new Error(rv.errorMessage);
	};
	rv.errorMessage = "#{desc} must start with a letter and contain only numbers, letters and underscores";
	return rv;
};

exports.username = identifierValidator("Username");
exports.appName = function(val) {
	if (appNameRe.test(val)) {
		return val;
	}
	throw new Error(exports.appName.errorMessage);
};
exports.appName.errorMessage = "App name must start with a letter and contain only numbers, letters, dashes and underscores";

exports.required = function(n) {
	if (!n || n == '') throw new Error("Required");
};

exports.email = function(n) {
	if (!/@.*\./.test(n)) throw new Error("Email required");
};

var keySafeRe = /^[-_a-zA-Z0-9]+$/;

exports.keySafe = function(name) {
	// safe in general for a key component - nothing but alphanumerics,
	// dashes and underscores. Internal
	if (keySafeRe.test(name)) {
		return name;
	}
	throw new Error("Not key safe: #{name}");
}

exports.hex = function(name) {
	if (/^[0-9a-fA-f]+$/.test(name)) {
		return name;
	}
	throw new Error("Not hexadecimal: #{name}");
}

exports.onlyWhen = function(cond, validators) {
	return function(value) {
		if(cond .. @first()) {
			validators .. @each(v -> v(value));
		}
	};
};
