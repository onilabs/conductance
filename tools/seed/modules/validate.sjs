@ = require('sjs:sequence');

exports.optionalNumber = function(n) {
	console.log("Testing: " + n + " // " + (!(/^[0-9]*$/.test(n))));
	if (!(/^[0-9]*$/.test(n))) throw new Error("Number required");
};

exports.required = function(n) {
	if (!n || n == '') throw new Error("Required");
};

exports.email = function(n) {
	if (!/@.*\./.test(n)) throw new Error("Email required");
};

exports.alphanumeric = function(name) {
	if (/^_?[a-zA-Z0-9]+$/.test(name)) {
		return name;
	}
	throw new Error("Not alphanumeric: #{name}");
}

exports.onlyWhen = function(cond, validators) {
	return function(value) {
		if(cond .. @first()) {
			validators .. @each(v -> v(value));
		}
	};
};
