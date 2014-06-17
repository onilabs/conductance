exports.optionalNumber = function(n) {
	console.log("Testing: " + n + " // " + (!(/^[0-9]*$/.test(n))));
	if (!(/^[0-9]*$/.test(n))) throw new Error("Not a number");
};

exports.required = function(n) {
	if (n == '') throw new Error("required");
};

