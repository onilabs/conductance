/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/* backwards-compatibility for Conductance < 0.5 */
/** @nodoc */
waitfor {
	require('sjs:logging').warn("The mho:observable module is deprecated, please use sjs:observable directly");
} and {
	module.exports = require('sjs:observable');
}
