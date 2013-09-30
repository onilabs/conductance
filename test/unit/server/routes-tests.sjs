var {test, context, assert} = require('sjs:test/suite');

context {||
var url = require('sjs:url');
var logging = require('sjs:logging');

var {Route, Host} = require('mho:server');
var {Filter} = require('mho:server/routes');

context('route filters') {||
	test('filters from multiple nested routes are applied in the correct order') {||
		var events = [];
		var logMessage = function(m) {
			logging.info('EVENT:', m);
			events.push(m);
		}
		var logFilter = function(resp, m) {
			logging.info("Adding filter with msg #{m}");
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
			url: url.parse("http://example.com/1/2"),
			request: {
				method: 'GET',
			},
			response: {
				setHeader: -> null,
				writeHead: -> null,
				end: -> null,
			},
		});

		events .. assert.eq([
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

}.serverOnly();
