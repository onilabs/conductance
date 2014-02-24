@ = require('sjs:test/std');

@context {||
@url = require('sjs:url');
@logging = require('sjs:logging');

var {Route, Host} = require('mho:server');
var {Filter} = require('mho:server/route');
var { @mockRequest } = require('./util');

var serve = function(route, req) {
	var path = req.url.path.slice(1);
	var match = route.matchesPath(path);
	if (!match) throw new Error("no match for path: #{path}");
	route.handle(req, match);
	return req.result();
};

var respondOK = {'*': req -> req.response.end('OK') };

@context('flattening') {||
	@test('route handlers are flattened') {||
		Route('dir', [
			[1,2,3],
			4,
			5
		]).handlers .. @assert.eq([1,2,3,4,5]);
	}

	@test('host routes are flattened') {||
		Host('dir', [
			[1,2,3],
			4,
			5
		]).routes .. @assert.eq([1,2,3,4,5]);
	}
}

@context("matching") {||
	@test("string routes match exactly") {||
		var route = Route('file', respondOK);
		@assert.ok(route.matchesPath('file'));
		@assert.notOk(route.matchesPath('/file'));
		@assert.notOk(route.matchesPath('file/'));
	}

	@test("regex routes match un-anchored") {||
		var route = Route(/file/, respondOK);
		@assert.ok(route.matchesPath('file'));
		@assert.ok(route.matchesPath('somefile'));
		@assert.ok(route.matchesPath('file.ext'));
		@assert.notOk(route.matchesPath('something_else'));
	}

	@test("regex routes pass on matched groups to handler") {||
		var route = Route(/^file (\d+)$/,
			{'GET': (req, [all, num]) -> req.response.end("num is #{num}")}
		);
		route .. serve(@mockRequest({
			url: 'http://example.com/file 23'
		})) .. @get('body') .. @assert.eq('num is 23');
	}
}

@context('filters') {||
	@test('filters from multiple nested routes are applied in the correct order') {||
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
	}
}


@context('nested') {||
	;[
		['regex', /^dir\//],
		['string', 'dir/']
	] .. @each { |[type, prefix]|
		@test("#{type} routes can be nested") {||
			Route(prefix,
				[
					Route("file", {
						GET: function(r) {r.response.end('OK');}
					})
				]
			) .. serve(@mockRequest({url:'http://example.com/dir/file'})) .. @get('body') .. @assert.eq('OK');
		}
	}
}

}.serverOnly();
