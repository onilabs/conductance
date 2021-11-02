@ = require('sjs:test/std');

@context(function() {
@url = require('sjs:url');
@logging = require('sjs:logging');

var {Route, Host} = require('mho:server');
var {Filter, AllowCORS} = require('mho:server/route');
var { @mockRequest } = require('./util');

var serve = function(route, req) {
	var path = req.url.path.slice(1);
	var match = route.matchesPath(path);
	if (!match) throw new Error("no match for path: #{path}");
	route.handle(req, match);
	return req.result();
};

var respondOK = {'*': req -> req.response.end('OK') };

@context('flattening', function() {
	@test('route handlers are flattened', function() {
		Route('dir', [
			[1,2,3],
			4,
			5
		]).handlers .. @assert.eq([1,2,3,4,5]);
	});

	@test('host routes are flattened', function() {
		Host('dir', [
			[1,2,3],
			4,
			5
		]).routes .. @assert.eq([1,2,3,4,5]);
	});
});

@context("matching", function() {
	@test("string routes match exactly", function() {
		var route = Route('file', respondOK);
		@assert.ok(route.matchesPath('file'));
		@assert.notOk(route.matchesPath('/file'));
		@assert.notOk(route.matchesPath('file/'));
	});

	@test("regex routes match un-anchored", function() {
		var route = Route(/file/, respondOK);
		@assert.ok(route.matchesPath('file'));
		@assert.ok(route.matchesPath('somefile'));
		@assert.ok(route.matchesPath('file.ext'));
		@assert.notOk(route.matchesPath('something_else'));
	});

	@test("regex routes pass on matched groups to handler", function() {
		var route = Route(/^file (\d+)$/,
			{'GET': (req, [all, num]) -> req.response.end("num is #{num}")}
		);
		route .. serve(@mockRequest({
			url: 'http://example.com/file 23'
		})) .. @get('body') .. @assert.eq('num is 23');
	});
});

@context('filters', function() {
	@test('filters from multiple nested routes are applied in the correct order', function() {
		var events = [];
		var logMessage = function(m) {
			@logging.info('EVENT:', m);
			events.push(m);
		}
		var logFilter = function(resp, m) {
			@logging.info("Adding filter with msg #{m}");
			return resp .. Filter(function(req, block) {
				logMessage("begin: #{m}");
				block();
				logMessage("end: #{m}");
			});
		};

		var route = Host("example.com",
			[
				Route(/^1\//, [
					Route("2", {GET: function(r) {logMessage("serve: route 1/2"); r.response.end();} }) .. logFilter("route 1/2")
				]) .. logFilter("route 1"),
			] .. logFilter("array inner") .. logFilter("array outer")
		) .. logFilter("host");

		route.handle({
			url: @url.parse("http://example.com/1/2"),
			request: {
				method: 'GET',
			},
			response: {
				setHeader: -> null,
				writeHead: -> null,
				end: -> null,
			},
		});

		events .. @assert.eq([
			'begin: host',
			'begin: array outer',
			'begin: array inner',
			'begin: route 1',
			'begin: route 1/2',

			'serve: route 1/2',

			'end: route 1/2',
			'end: route 1',
			'end: array inner',
			'end: array outer',
			'end: host',
		]);
	});
});


@context('nested', function() {
	;[
		['regex', /^dir\//],
		['string', 'dir/']
	] .. @each { |[type, prefix]|
		@test("#{type} routes can be nested", function() {
			Route(prefix,
				[
					Route("file", {
						GET: function(r) {r.response.end('OK');}
					})
				]
			) .. serve(@mockRequest({url:'http://example.com/dir/file'})) .. @get('body') .. @assert.eq('OK');
		});
	}
});

@context("AllowCORS", function() {
	var make = function() {
		var noop = Route(/^/, {'*':->null});
		var route = AllowCORS.apply(null, [noop].concat(arguments .. @toArray));
		return function(opts) {
			var req = @mockRequest(opts);
			route.handle(req);
			return req;
		}
	}
	var ALLOW_ORIGIN = 'Access-Control-Allow-Origin';

	@test("accepts a single settings object", function() {
		var get = make({origins: "foo", methods: "GET,PUSH,POKE", headers: "origin, x-version"});
		var result = get({ method: 'OPTIONS'}).result();
		result.getHeader('Access-Control-Allow-Origin') .. @assert.eq("foo");
		result.getHeader("Access-Control-Allow-Methods") .. @assert.eq("GET,PUSH,POKE");
		result.getHeader("Access-Control-Allow-Headers") .. @assert.eq("origin, x-version");
	});

	@test("only sets allow-methods and allow-headers on OPTIONS preflights", function() {
		var result = make()().result();
		result.getHeader('Access-Control-Allow-Methods') .. @assert.eq(undefined);
		result.getHeader('Access-Control-Allow-Headers') .. @assert.eq(undefined);
	});

	@test("accepts a single string", function() {
		var headers = make("example.com")().result().getHeader(ALLOW_ORIGIN) .. @assert.eq("example.com");
	});

	@test("accepts a single function", function() {
		var get = make((origin) -> origin == "myapp.com");
		get({headers: {origin: 'myapp.com'}}).result().getHeader(ALLOW_ORIGIN) .. @assert.eq("myapp.com");
		get({headers: {origin: 'elswehere.ville'}}).result().getHeader(ALLOW_ORIGIN) .. @assert.eq(undefined);
	});

	@test("accepts both `accept` and `settingss`", function() {
		var get = make(-> true, {methods: "GET,PUSH,POKE"});
		var result = get({ method: 'OPTIONS', headers: {origin: "foo.com"}}).result();
		result.getHeader('Access-Control-Allow-Origin') .. @assert.eq("foo.com");
		result.getHeader("Access-Control-Allow-Methods") .. @assert.eq("GET,PUSH,POKE");
	});

	@test("treats a boolean function as a filter", function() {
		var get = make(-> true)({ headers: {origin: "foo.com"}}).result().getHeader(ALLOW_ORIGIN) .. @assert.eq("foo.com");
		var get = make(-> false)({ headers: {origin: "foo.com"}}).result().getHeader(ALLOW_ORIGIN) .. @assert.eq(undefined);
	});
});

}).serverOnly();
