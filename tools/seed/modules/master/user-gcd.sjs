@ = require('mho:std');
var { @User } = require('../auth/user');
var { @AuthenticationError } = require('../auth');
@gcd = require('./gcd');
@schema = @gcd.schema;


var STRING = {__type: 'string' };
var INT = {__type: 'integer' };
var BOOL = {__type: 'bool' };
var BYTES = {__type: 'text' }; // XXX binary?


var NotFoundProto = new Error("not found");
var NotFound = -> Object.create(NotFoundProto);

exports.Create = function(namespace) {
	@assert.string(namespace, "namespace");
	var appName = "seed";

	// XXX use proper GCD namespace, and make this root key "app:seed"
	var rootKey = "app:#{namespace}";

	var userSchema = {
		__parent: rootKey,
		name: {__type: 'primary'},
		email: STRING,
		verified: BOOL,
		verifyCode: STRING,
		tokens: [STRING],
		password: {
			iterations: INT,
			keylen: INT,
			salt: BYTES,
			hash: STRING,
		},
	};

	var credentials = @env.get('gcd-credentials');
	if (credentials) {
		credentials = {
			"email": credentials .. @get('email'),
			"dataset": credentials .. @get('project'),
			"key": credentials .. @get('key'),
		};
	} else {
		credentials = {
			devel: true,
		};
	}

	var db = @gcd.GoogleCloudDatastore({
		context: credentials,
		schemas: {
			user: userSchema,
		}
	});

	var userKey = id -> "#{rootKey}/user:#{id}";
	var rv = {};

	rv.isNotFound = err -> NotFoundProto.isPrototypeOf(err);

	rv._deleteAllData = function() {
		@assert.falsy(@env.get('production'));
		db.query({
			schema: 'user',
		}) .. @unpack .. @each {|item|
			db.write({
				id: item.id .. @assert.ok,
				schema: 'user',
				data:null,
			});
		};
	};

	var dbApi = function(db) {
		return {
			updateUser: function(id,props) {
				var record = db.write({
					schema: 'user',
					id: id,
					data: props
				});
			},

			getUser: function(uid) {
				var id = userKey(uid);
				var record = db.read({
					schema: 'user',
					id: id,
				});
				if(!record.data) throw NotFound();
				return {id: id, props: record.data};
			},
		}
	};

	rv .. @extend(dbApi(db)); // make toplevel objects

	var checkSchema = function(obj, schema) {
		if (typeof(obj) !== 'object') {
			// leaf node
			return;
		}
		obj .. @ownPropertyPairs .. @each {|[k,v]|
			if (!schema .. @hasOwn(k)) {
				throw new Error("Unexpected property (not in schema): #{k}");
			}
			checkSchema(v, schema[k]);
		}
	};

	rv.createUser = function(props) {
		checkSchema(props, userSchema);
		try {
			var record = db.write({
				schema: 'user',
				data: props
			});
		} catch(e) {
			if(e.statusCode === 400) {
				throw new Error("Username already exists");
			}
			throw e;
		}
	};

	rv.synchronize = function(reason, block) {
		return db.withTransaction(function(db) {
			return block(dbApi(db));
		})
	}
	return rv;
};


/* NOTES:

 - taking a string schema name is ugly (and shouldn't it be a separate argument so you can pre-bind it?)
 - check how binary data works
 - why do you need to manually apply unpack to query results?

 - `update` doesn't let me specify my own key?
*/

if (require.main === module) {
	var db = exports.Create();
	//var key = db.userKey("tim");
	//exports.put(exports.userKey("tim"), {
	//	username: "tim",
	//	password: {
	//		iterations: 100,
	//		salt: Buffer.from([0]),
	//		keylen: 20,
	//	}
	//}).. console.log;

	//db.query({
	//	schema: 'user',
	//	data: {
	//		username: 'tim',
	//	}
	//}) .. @unpack .. @map.par(db.read) .. @each {|result|
	//	result.data .. @assert.ok();
	//	console.log(result);
	//	console.log(Buffer.from(result.data.password.salt));
	//}
	//exports.get('user:#5629499534213120') .. console.log();

	exports.createUser({name:"timbo"});
}
