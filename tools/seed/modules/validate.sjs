exports.optionalNumber = function(n) {
	console.log("Testing: " + n + " // " + (!(/^[0-9]*$/.test(n))));
	if (!(/^[0-9]*$/.test(n))) throw new Error("Not a number");
};

exports.required = function(n) {
	if (!n || n == '') throw new Error("required");
};

exports.alphanumeric = function(name) {
	if (/^_?[a-zA-Z0-9]+$/.test(name)) {
		return name;
	}
	throw new Error("Not alphanumeric: #{name}");
}

