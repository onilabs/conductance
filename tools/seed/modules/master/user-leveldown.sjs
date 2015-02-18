@ = require('mho:std');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@kv = require('mho:flux/kv');

var config_root = @path.join(@env.get('data-root'), 'user');
@debug("CONFIG_ROOT:", config_root);

@mkdirp(config_root);
var dbLock = @Semaphore();

var _store = exports._store = @kv.LevelDB(@path.join(config_root, 'auth.db'));

var userKey = id -> ['user', id];

exports.isNotFound = @kv.isNotFound;

exports.synchronize = function(store, reason, block) {
	if(arguments.length == 2) {
		block = reason;
		reason = store;
		store = _store;
	}
	var ctx;
	var call = -> block(ctx, ctx._tx);
	if(this._tx) {
		ctx = this;
		return call();
	} else {
		return store .. @kv.withTransaction(function(store) {
			ctx = Object.create(exports);
			ctx._tx = store;
			return call();
		});
	}
};

var prefixed = function(prefix) {
	return @Stream(function(emit) {
		_store .. @kv.query({
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

exports.getUser = function(uid) {
	this.synchronize('getUser') {|_, store|
		var key = userKey(uid);
		return {
			id: key,
			props: store .. @kv.get(key),
		};
	}
};

exports.updateUser = function(id, props) {
	this.synchronize('updateUser') {|_, store|
		store .. @kv.set(id, props);
	}
};

exports.createUser = function(props) {
	this.synchronize('createUser') {|_, store|
		var uid = props.name;
		var key = userKey(uid);

		try {
			store .. @kv.get(key);
			throw new Error("Username already exists");
		} catch(e) {
			if (!e .. @kv.isNotFound) throw e;
		}
		store .. @kv.set(key, props);
	}
};

exports._deleteAllData = function() {
	this.synchronize('_deleteAllData') {|_, store|
		store .. @kv.query(@kv.RANGE_ALL) .. @each {|[k,_v]|
			store .. @kv.clear(k);
		};
	}
};



exports._main = function(args) {
	args = args || @argv();
	exports.synchronize('main') {|_, store|
		@stream = require('sjs:nodejs/stream');
		var load = function() {
			var o = {};
			store .. @kv.query(@kv.RANGE_ALL) .. @each {|[k,v]|
				//k = k.toString("utf-8");
				k = k .. @join('/');
				o[k] = v;
			}
			return o;
		};

		var dump = function(o, stream) {
			JSON.stringify(o, null, '  ') .. @stream.pump(stream, {end:false});
		};

		var arg = args[0];
		switch(arg) {
			case undefined:
			case '--help':
				console.warn("Usage: user.sjs [--edit|--dump]");
				process.exit(1);
				break;
			case '--edit':
				var old = load();
				require('sjs:nodejs/tempfile').TemporaryFile() {|f|
					var path = f.path;
					old .. dump(f.writeStream());
					f.close();

					var editor = process.env .. @get('EDITOR', 'vi');
					console.warn("Running: #{editor}");
					editor = editor.split();
					@childProcess.run(editor[0], editor.slice(1).concat([path]), {'stdio':'inherit'});
					console.warn("Saving results...");
					var result = @fs.readFile(path, 'utf-8') .. JSON.parse();
					result .. @ownPropertyPairs .. @each {|[k, v]|
						delete old[k];
						@assert.ok(v);
						store .. @kv.set(k .. @split('/'), v);
					}
					// old contains only keys not found in result, so delete them:
					old .. @ownKeys .. @each {|k|
						store .. @kv.clear(k .. @split('/'));
					}
				}
				break;
			case '--dump':
				load() .. dump(process.stdout);
				break;
			default:
				console.warn("Unknown flag #{arg}, try --help");
				process.exit(1);
				break;
		}
	}
}

if (require.main === module) {
	exports._main();
}


