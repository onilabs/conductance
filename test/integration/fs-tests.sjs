@ = require('sjs:test/std');
var { context, test, assert, isBrowser } = require('sjs:test/suite');
var http = require('sjs:http');
var url = require('sjs:url');
var helper = require('../helper');

var rel = p -> helper.url('test/integration/fixtures/' + p);

context("serving files") {||
	test("Listing a directory with special characters") {||
		var contents = http.get(rel(''));
		contents .. assert.contains('<a href="%2520special%20characters/">%20special characters/</a>');
	}

	test("Listing a file with special characters") {||
		var contents = http.get(rel(url.encode('%20special characters') + '/'));
		contents .. assert.contains('<a href="%2520awkward%20%252f%20characters.sjs">%20awkward %2f characters.sjs</a>');
	}

	test("Accessing a file with special characters") {||
		// will raise if there's an http error
		http.get(rel(url.encode('%20special characters') + '/' + url.encode('%20awkward %2f characters.sjs'))) .. assert.ok();
	}

	test("Accessing a file outside the document root") {||
		assert.raises(
			{filter: e -> e.status === 404},
			-> http.get(rel('../../../../../etc/hosts')));
	}

	test("Accessing a file outside the document root (encoded path components)") {||
		assert.raises(
			{filter: e -> e.status === 403},
			-> http.get(rel('%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/hosts')));
	}.skipIf(isBrowser);

	test("Can't access source code of .api files") {||
		var executable_url = rel('hello.api');
		var code_url = executable_url.replace('/test/','/test_as_code/');
		code_url .. @assert.notEqual(executable_url);
		http.get(executable_url) .. assert.contains('rpc/bridge'); // client-side connection code
		http.get(code_url) .. assert.contains('rpc/bridge'); // client-side connection code

		// we can access the content, but should not be able to get at the source code
		;[
			[executable_url, ['', '?format=src','?format=notarealformat','!none','!src']],
			[executable_url, ['', '?format=src','?format=notarealformat','!none']],
		] .. @each {|[base_url, formats]|
			formats .. @each {|fmt|
				var url = base_url + fmt;
				var contents = http.get(url);
				contents .. assert.notContains('is_source_code', "raw api contents served at #{url}");
			}
		}
	}

	test("Can't access source code of .gen files") {||
		var url = rel('hello.txt');
		http.get(url) .. assert.eq('world!');
		assert.raises({filter: e -> e.status === 404}, -> http.get(url + '.gen'));
	}
}

// TODO
context("Server only") {||
	var { contents } = require("sjs:nodejs/stream");

	test("gzipping a large file") {||
		var size = 1024 * 50;
		var rv = http.get(rel("bigfile.txt?size=#{size}"), {
			headers: {'accept-encoding':'gzip'},
			response: 'raw',
		});
		rv.headers['content-encoding'] .. @assert.eq('gzip', "content was not gzipped!");
		var contents = (rv .. require('sjs:nodejs/gzip').decompress .. @join()).toString('ascii');
		var expected = require('./fixtures/bigfile.txt.gen').build(size);
		contents.length .. @assert.eq(expected.length);
		contents .. @assert.eq(expected);
	}.skip("BROKEN");

	test("Range requests") {||
		var length = 6;
		var file = "hello.txt";

		function test(from, to, expected) {
			var rv = http.get(rel(file), {
				headers: { 'range': "bytes=#{from}-#{to}" },
				response: 'raw',
			});

			var buffer = new Buffer(expected);
			@assert.eq(rv ..contents ..@join(), buffer);
			@assert.eq(rv.headers['content-length'], "" + buffer.length);
			@assert.eq(rv.statusCode, 206);

			if (from !== "") {
				@assert.eq(rv.headers['content-range'], "bytes #{from}-#{buffer.length + from - 1}/#{length}");
			} else {
				if (to > length) {
					to = length;
				}

				@assert.eq(rv.headers['content-range'], "bytes #{length - to}-#{length - 1}/#{length}");
			}
		}

		function test_failure(from, to) {
			var rv = http.get(rel("hello.txt"), {
				headers: { 'range': "bytes=#{from}-#{to}" },
				throwing: false,
				response: 'raw',
			});

			@assert.eq(rv.statusCode, 416);
			@assert.eq(rv.headers['content-range'], "bytes */#{length}");
			@assert.eq(rv ..contents ..@join(), "");
		}

		test(0, 2, "wor");
		test(3, 4, "ld");
		test(0, 4, "world");
		test(0, 5, "world!");
		test(0, 9001, "world!");
		test(0, "", "world!");
		test(1, "", "orld!");

		test("", 1, "!");
		test("", 2, "d!");
		test("", 6, "world!");
		test("", 9001, "world!");

		test_failure("", "");
		test_failure(-1, "");
		test_failure(1, 0);
		test_failure(6, 7);
		test_failure("", 0);
	};

	test("HEAD") {||
		var rv = http.request(rel("hello.txt"), {
			method: 'HEAD',
			response: 'raw'
		});

		@assert.eq(rv.statusCode, 200);
		@assert.eq(rv ..contents ..@join(), '');
	};
}.serverOnly();
