/* backwards-compatibility for Conductance < 0.5 */
/** @nodoc */
waitfor {
	require('sjs:logging').warn("The mho:observable module is deprecated, please use sjs:observable directly");
} and {
	module.exports = require('sjs:observable');
}
