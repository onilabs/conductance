// invert the idea of `withBusyIndicator` - show the indicator
// whenever `withoutBusyIndicator`'s block is _not_ executing
exports.withoutBusyIndicator = function(block) {
	console.log("CONTENT START");
	withBusyIndicator.hide();
	try {
		return block();
	} finally {
		console.log("CONTENT END");
		withBusyIndicator.show();
	}
};

