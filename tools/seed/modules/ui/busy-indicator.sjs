// invert the idea of `withBusyIndicator` - show the indicator
// whenever `withoutBusyIndicator`'s block is _not_ executing
exports.withoutBusyIndicator = function(block) {
	withBusyIndicator.hide();
	try {
		return block();
	} finally {
		withBusyIndicator.show();
	}
};

