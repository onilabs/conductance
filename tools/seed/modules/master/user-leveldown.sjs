@ = require('mho:std');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
@storage = require('mho:server/storage');

var config_root = @path.join(@env.get('data-root'), 'user');
@debug("CONFIG_ROOT:", config_root);

@mkdirp(config_root);
var dbLock = @Semaphore();

var store = exports._store = @storage.Storage(@path.join(config_root, 'auth.db'));

exports.isNotFound = e -> e.type === 'NotFound';

var userKey = id -> new Buffer("user:#{id}", 'ascii');

var EXPORTS_WITH_LOCK = Object.create(exports);

exports.synchronize = function(reason, block) {
	if(this === EXPORTS_WITH_LOCK) {
		return block(EXPORTS_WITH_LOCK);
	}
	dbLock.synchronize(->block(EXPORTS_WITH_LOCK));
};

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

exports.getUser = function(uid) {
	this.synchronize('getUser') {||
		var key = userKey(uid);
		return {
			id: key.toString('ascii'),
			props: store.get(key) .. JSON.parse(),
		};
	}
};

exports.updateUser = function(id, props) {
	this.synchronize('updateUser') {||
		store.put(id, props .. JSON.stringify());
	}
};

exports.createUser = function(props) {
	this.synchronize('createUser') {||
		var uid = props.name;
		var key = userKey(uid);

		try {
			store.get(key);
			throw new Error("Username already exists");
		} catch(e) {
			if (!e .. exports.isNotFound) throw e;
		}
		store.put(key, props .. JSON.stringify());
	}
};

exports._deleteAllData = function() {
	this.synchronize('_deleteAllData') {||
		store.query() .. @each {|[k,_v]|
			store.del(k);
		};
	}
};



if (require.main === module) {
	@stream = require('sjs:nodejs/stream');
	var load = function() {
		var o = {};
		store.query() .. @each {|[k,v]|
			//k = k.toString("utf-8");
			v = v.toString("utf-8");
			var isJson = v.charAt(0) === '{' && v .. @at(-1, '') === '}';
			if(isJson) {
				v = JSON.parse(v);
			}
			o[k] = {json: isJson, value: v};
		}
		return o;
	};

	var dump = function(o, stream) {
		stream .. @stream.write(JSON.stringify(o, null, '  '));
	};

	var arg = @argv()[0];
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
					var isJson = v.json;
					v = v.value;
					@assert.ok(v);
					if(isJson) v = JSON.stringify(v);
					store.put(k, v);
				}
				// old contains only keys not found in result, so delete them:
				old .. @ownKeys .. @each {|k|
					store.del(k);
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


