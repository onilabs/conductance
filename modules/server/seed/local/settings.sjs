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
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@crypto = require('nodejs:crypto');

var config_root = @path.join(process.env .. @get('XDG_CONFIG_HOME', @path.join(process.env .. @get('HOME'), '.config')), 'conductance');

var config_root = [
	['CONDUCTANCE_CONFIG_HOME'],
	['XDG_CONFIG_HOME', 'conductance'],
	['HOME', '.config','conductance'],
	null,
] .. @transform(function(path) {
	if(!path) throw new Error("Unable to determine config path ($HOME not set)");
	var base = process.env[path[0]];
	if(!base) return null;
	return @path.join.apply(null, [base].concat(path.slice(1)));
}) .. @filter() .. @first();

@debug("CONFIG_ROOT:", config_root);
@mkdirp(config_root);

var storePath = @path.join(config_root, 'deployment.json');
var storeLock = @Semaphore();
var NOT_FOUND = {};
var store = exports._store = (function() {
	var obs = @ObservableVar();
	var db = null;

	function reload() {
		try {
			db = @fs.readFile(storePath) .. JSON.parse();
		} catch(e) {
			if(e.code === 'ENOENT') {
				db = {};
			} else {
				throw e;
			}
		}
		obs.set(db);
		return db;
	};

	function save(newdb) {
		if (db .. @eq(newdb)) return;
		var tmp = storePath + '.tmp';
		tmp .. @fs.writeFile(JSON.stringify(newdb, null, '  '));
		@info("Wrote #{tmp}, renaming to #{storePath}");
		@fs.rename(tmp, storePath);
		reload();
	};

	function contents() {
		if (db === null) {
			reload();
		}
		return db;
	};

	function get(key, throwing) {
		@assert.string(key, "key");
		var rv = contents() .. @getPath(key, NOT_FOUND);
		if(rv === NOT_FOUND && throwing !== false) {
			throw new Error("Key not found: #{key}");
		}
		return rv;
	};

	function put(path, value) {
		var root = contents() .. @clone();
		var current = root;
		var pathParts = path .. @split('.');
		pathParts .. @slice(0,-1) .. @each {|p|
			var child;
			if (current .. @hasOwn(p)) {
				child = current[p] .. @clone();
			} else {
				child = {};
			}
			current[p] = child;
			current = child;
		};
		current[pathParts .. @at(-1)] = value;
		@debug("Saving: ", root);
		save(root);
	};

	return {
		root: config_root,
		items: obs .. @transform(x -> x),
		contents: function() {
			storeLock.synchronize {||
				return contents();
			}
		},

		genUnique: function(payloads) {
			storeLock.synchronize {||
				return payloads .. @find(function([key, payload]) {
					if (get(key, false) === NOT_FOUND) {
						put(key, payload);
						return true;
					}
					return false;
				});
			}
		},

		get: function(key, throwing) {
			storeLock.synchronize {||
				return get(key, throwing);
			}
		},

		reload: function() {
			storeLock.synchronize {||
				return reload();
			}
		},

		del: function(path) {
			return this.put(path, undefined);
		},

		put: function(path, value) {
			storeLock.synchronize {||
				return put(path, value);
			}
		},
	};
})();

var defaultSettings = {
	app: {
		version: 1,
	},
	server: {
		version: 1,
	},
};

var ObjectCache = function(path, cons) {
	var cache = {};
	var rv = function(key /* , ... */) {
		@assert.string(key);
		var rv;
		if (cache .. @hasOwn(key)) {
			rv = cache[key];
		} else {
			cache[key] = rv = cons.apply(null, arguments);
		}
		return rv;
	};
	rv.del = function(key) {
		delete cache[key];
	};
	return rv;
};

var Settings = function(path, base, missingOK) {
	var values = @ObservableVar();
	var rv = values .. @dedupe(@eq);
	rv.reload = function() {
		var val = store.get(path, !missingOK);
		if(val === NOT_FOUND) val = {};
		values.set(base .. @merge(val));
	};

	rv._save = function() {
		@info("saving settings for #{path}");
		@debug(values.get());
		store.put(path, values.get());
	};

	rv.destroy = function() {
		@info("destroying settings #{path}");
		store.del(path);
	};

	rv.modify = function(f) {
		if (values.modify(f)) {
			rv._save();
		}
	};

	rv.reload();
	return rv;
};

var genUnique = function(genKey) {
	var key, id;
	var contents = {};
	store.genUnique(@Stream(function(emit) {
		while(true) {
			id = @crypto.randomBytes(4).toString('hex');
			key = genKey(id);
			emit([key, contents]);
		}
	}));
	return [key, id];
};

var serverCache = ObjectCache('servers', function(key, serverId, props) {
	var vals = Settings(key, defaultSettings .. @get('server'));
	if (props) { // allow specifying properties upon construction
		vals.modify(obj -> obj .. @merge(props));
	}
	return {
		id: serverId,
		config: vals,
		destroy: function() {
			vals.destroy();
			objectCache.del(key);
		}.bind(this),
	};
});

function getServer(serverId, props, createIfMissing) {
	@assert.optionalString(serverId, 'serverId');
	var genKey = id -> "servers.#{id}";
	var [key, serverId] = serverId ? [genKey(serverId), serverId] : genUnique(genKey);
	if (createIfMissing) {
		if (store.get(key, false) === NOT_FOUND) {
			@info("Creating missing server #{key}");
			store.put(key, props || {});
		}
	}
	return serverCache(key, serverId, props);
};

exports.server = getServer;
exports.servers = store.items .. @transform(
	it -> it .. @get('servers', {}) .. @ownKeys .. @map(getServer)
) .. @dedupe(@eq);

var appCache = ObjectCache('apps', function(key, serverId, appId, props) {
	var vals = Settings(key, defaultSettings .. @get('app'), true);
	if (props) {
		vals.modify(o -> o .. @merge(props));
	}
	return {
		id: appId,
		config: vals,
	};
});

exports.app = function(serverId, appId, props) {
	@assert.string(serverId, 'serverId');
	@assert.optionalString(appId, 'appId');
	var genKey = id -> "apps.#{serverId}.#{id}";
	var [key, appId] = appId ? [genKey(appId), appId] : genUnique(genKey);

	var rv = appCache(key, serverId, appId, props);
	return rv;
};
