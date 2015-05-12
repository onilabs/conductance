/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
@ = require('sjs:std');
@ .. @extend(require('sjs:wraplib'));

var makeRequest = function(self, opts) {
	waitfor(var err, rv) {
		self._options.auth.request(opts, resume);
	}
	if(err) throw err;
	return rv;
};

function awaitOperationCompletion(compute, ret) {
	return function(op) {
		op.kind .. @assert.eq('compute#operation');
		@debug("awaiting completion of #{op.name} ...");
		var res;
		while(true) {
			res = compute .. makeRequest({ uri: op .. @get('selfLink') });
			var st = res .. @get('status');
			if(st === 'DONE') break;
			;["PENDING", "RUNNING"] .. @assert.contains(res.status, "unexpected operation status: #{st}");
			@debug("operation still pending: #{res.name}");
			hold(2000);
		}

		@debug("#{res.name} complete");
		if(res.warnings) {
			res.warnings .. @each(w -> @logging.warn(w.message))
		}
		if(res.error) {
			throw new Error(res.error.errors .. @map(e -> e.message) .. @join("\n"));
		}
		if(res.httpErrorMessage) {
			throw new Error("HTTP error from gce: #{res.httpErrorMessage}");
		}

		var rv;
		if(ret !== false && res.targetLink) {
			rv = compute .. makeRequest({uri: res.targetLink});
		}
		return rv;
	};
};

var googleapis = require('nodejs:googleapis');
var collectionMethods = obj -> {
	get: @wrapMethod(@async, true),
	list: @wrapMethod(@async, true),
	insert: @wrapMethod(@async, awaitOperationCompletion(obj)),
	'delete': @wrapMethod(@async, awaitOperationCompletion(obj, false)),
};
module.exports = googleapis .. @wrapObject({
	auth: @wrapProperty({
		JWT: @wrapConstructor(@sync, obj -> obj .. @wrapObject({
			authorize: @wrapMethod(@async(1), true),
		}, {inherit: true})),
	}),
	compute: @wrapMethod(@sync, obj -> obj .. @wrapObject({
		instances: @wrapProperty(collectionMethods(obj) .. @merge({
			getSerialPortOutput: @wrapMethod(@async, true),
		})),
		machineTypes: @wrapProperty({
			get: @wrapMethod(@async, true),
		}),
		networks: @wrapProperty(collectionMethods(obj)),
		firewalls: @wrapProperty(collectionMethods(obj)),
		disks: @wrapProperty(collectionMethods(obj)),
	}, {
		copy: ['_options'],
	})),
});
