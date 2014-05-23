@ = require('sjs:std');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@storage = require('mho:server/storage');
@crypto = require('nodejs:crypto');

var config_root = @path.join(process.env .. @get('XDG_CONFIG_HOME', @path.join(process.env .. @get('HOME'), '.config')), 'conductance');
@debug("CONFIG_ROOT:", config_root);

@mkdirp(config_root);
var store = @storage.Storage(@path.join(config_root, 'deployment.db'));

var isNotFound = e -> e.type === 'NotFound';

var prefixed = function(prefix) {
	return @Stream(function(emit) {
		store.query({
			start: prefix,
		}) .. @each {|pair|
			pair[0] = pair[0].toString('ascii');
			if (!pair[0] .. @startsWith(prefix)) {
				break;
			}
			emit(pair);
		}
	});
};

var keysWithPrefix = function(prefix) {
	return prefixed(prefix) .. @transform ([k,v] -> k.slice(prefix.length));
};

var cleanup = function() {
	;['app:','server:'] .. @each{|prefix|
		prefixed(prefix) .. @toArray .. @each {|[k,v]|
			//console.log("checking key #{k}, ", v);
			v = v.toString('utf-8') .. JSON.parse();
			if (!v.name) {
				console.log("Terfing incomplete #{k}");
				store.del(k);
			}
		}
	}
};
cleanup();


var defaultSettings = {
	app: {
		version: 1,
	},
	server: {
		version: 1,
	},
};

var dbLock = @Semaphore();
var objectCache = (function() {
	var cache = {};
	return function(key, collection, cons) {
		@assert.string(key);
		var rv;
		if (cache .. @hasOwn(key)) {
			rv = cache[key];
			//rv.values.reload();
		} else {
			cache[key] = rv = cons(key);
			collection.update();
		}
		return rv;
	};
})();

var suppressIdentical = function(s) {
	return @Stream(function(emit) {
		var last = undefined;
		s .. @each {|val|
			if (!val .. @eq(last)) {
				last = val;
				emit(val);
			}
		}
	});
};

var Settings = function(key) {
	@assert.string(key);
	var values = @ObservableVar();
	var rv = values .. suppressIdentical;
	rv.reload = function() {
		console.log("loading settings for #{key}");
		values.set(store.get(key).toString('utf-8') .. JSON.parse());
	};

	rv._save = function() {
		console.log("saving settings for #{key}:");
		store.put(
			new Buffer(key, 'ascii'),
			new Buffer(values.get() .. JSON.stringify(), 'utf-8'), {sync:true});
	}

	rv.modify = function(f) {
		if (values.modify(f)) {
			rv._save();
		}
	};

	rv.reload();
	return rv;
};

var genUnique = function(genKey, doc) {
	var key, id;
	var contents = new Buffer(JSON.stringify(doc), 'utf-8');
	dbLock.synchronize {||
		while(true) {
			id = @crypto.randomBytes(4).toString('hex');
			key = genKey(id);
			var keyBuf = new Buffer(key, 'ascii');
			var conflict;
			try{
				store.get(keyBuf);
				conflict = true;
			} catch(e) {
				if (e .. isNotFound())
					conflict = false;
				else
					throw e;
			}

			if (!conflict) {
				store.put(keyBuf, contents);
				break;
			}
		}
	}
	return [key, id];
};

var identity = x -> x;
var Collection = function(prefix, cons) {
	var rv = @ObservableVar(keysWithPrefix(prefix) .. @transform(cons));
	rv.items = rv .. @transform(identity);
	rv.update = -> rv.modify(identity); // stream is lazy, so we don't actually need to change its value
	return rv;
};

var servers = Collection('server:', getServer);
function getServer(serverId) {
	@assert.optionalString(serverId, 'serverId');
	var genKey = id -> "server:#{id}";
	var [key, serverId] = serverId ? [genKey(serverId), serverId] : genUnique(genKey, defaultSettings .. @get('server'));

	return objectCache(key, servers, function() {
		var serverId = key .. @split(':', 1) .. @at(1);
		var prefix = "app:#{serverId}/";

		var apps = Collection(prefix, getApp);
		function getApp(appId) {
			@assert.optionalString(appId, 'appId');
			var genKey = id -> prefix + id;
			var [key, appId] = appId ? [genKey(appId), appId] : genUnique(genKey, defaultSettings .. @get('app'));
			var rv = objectCache(key, apps, function() {
				console.log("app: key=#{key}");
				return {
					id: appId,
					values: Settings(key),
				};
			});
			return rv;
		};

		console.log("server: key=#{key}");
		return {
			id: serverId,
			values: Settings(key),
			apps: apps.items,
			app: getApp,
		};
	});
};
exports.server = getServer;
exports.servers = servers.items;

if (require.main === module) {
	console.log("---- dump ----");
	store.query() .. @each {|[k,v]|
		console.log(k.toString("utf-8") + "=" + v.toString("utf-8"));
	}
	console.log("---- end -----");
}
