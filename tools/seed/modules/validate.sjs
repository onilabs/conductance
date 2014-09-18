@ = require('sjs:sequence');

exports.optionalNumber = function(n) {
	console.log("Testing: " + n + " // " + (!(/^[0-9]*$/.test(n))));
	if (!(/^[0-9]*$/.test(n))) throw new Error("Number required");
};

exports.username = function(name) {
	if (/^[a-zA-Z][-_a-zA-Z0-9]*$/.test(name)) {
		return name;
	}
	throw new Error(exports.username.errorMessage);
};
exports.username.errorMessage = "Username must start with a letter and contain only numbers, letters, dashes and underscores";

exports.required = function(n) {
	if (!n || n == '') throw new Error("Required");
};

exports.email = function(n) {
	if (!/@.*\./.test(n)) throw new Error("Email required");
};

exports.keySafe = function(name) {
	// safe in general for a key component - nothing but alphanumerics,
	// dashes and underscores. Internal
	if (/^[-_a-zA-Z0-9]+$/.test(name)) {
		return name;
	}
	throw new Error("Not key safe: #{name}");
}

exports.onlyWhen = function(cond, validators) {
	return function(value) {
		if(cond .. @first()) {
			validators .. @each(v -> v(value));
		}
	};
};
