var wraplib = require('sjs:wraplib');
var jwt = require('nodejs:jwt-async');

exports.JWT = jwt;
wraplib.annotate(exports, {
	JWT: {
		"this": wraplib.sync,
		getSupportedAlgorithms: wraplib.sync,
		base64urlDecode: wraplib.sync,
		base64urlUnescape: wraplib.sync,
		base64urlEncode: wraplib.sync,
		base64urlEscape: wraplib.sync,
		prototype: {
			sign: [1, wraplib.handle_error_and_value],
			verify: [1, wraplib.handle_error_and_value],
			encode: [1, wraplib.handle_error_and_value],
			verifyClaims: [1, wraplib.handle_error_and_value],
		},
	}
});

if (require.main === module) {
	require('sjs:wraplib/inspect').inspect(exports);
}
