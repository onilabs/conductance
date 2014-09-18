@ = require('mho:std');
var { @User } = require('../auth/user');
var { @AuthenticationError } = require('../auth');
@gcd = require('./gcd');


var STRING = {__type: 'string' };
var INT = {__type: 'integer' };
var BOOL = {__type: 'bool' };
var BYTES = {__type: 'text' }; // XXX binary?


var NotFoundProto = new Error("not found");
var NotFound = -> Object.create(NotFoundProto);

exports.Create = function(appName) {
	if(!appName) appName = "seed";
	var rootKey = "app:#{appName}";

	var userSchema = {
		__parent: rootKey,
		name: {__type: 'primary'},
		verified: BOOL,
		verifyCode: BOOL,
		password: {
			iterations: INT,
			keylen: INT,
			salt: BYTES,
		},
	};

	var db = @gcd.GoogleCloudDatastore({
		context: {
			devel: !@env.get('production'),
			dataset: @env.get('gcd-dataset'),
		},
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

	rv.createUser = function(props) {
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

	rv.synchronize = function(block) {
		db.withTransaction() {|db|
			return block(dbApi(db));
		}
	}
	return rv;
};


/* NOTES:

 - taking a string schema name is ugly (and shouldn't it be a separate argument so you can pre-bind it?)
 - taking an empty object to fill in the `data` method (read) is weird, not very chainy
 - keys can't have special characters in them (both ":" and "/" ?)
 - check how binary data works
 - why do you need to manually apply unpack to query results?

 - It's failing in `blindWrite`. This function name scares me.

 - `update` doesn't let me specify my own key?
*/

if (require.main === module) {
	var db = exports.Create();
	//var key = db.userKey("tim");
	//exports.put(exports.userKey("tim"), {
	//	username: "tim",
	//	password: {
	//		iterations: 100,
	//		salt: new Buffer([0]),
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
	//	console.log(new Buffer(result.data.password.salt));
	//}
	//exports.get('user:#5629499534213120') .. console.log();

	exports.createUser({name:"timbo"});
}
