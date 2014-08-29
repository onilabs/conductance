var { context, test, assert, isBrowser } = require('sjs:test/suite');
var http = require('sjs:http');
var url = require('sjs:url');
var helper = require('../helper');

context("serving files") {||
	var rel = p -> helper.url('test/integration/fixtures/' + p);
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
		var url = rel('hello.api');
		http.get(url) .. /rpc\/bridge/.test() .. assert.ok(); // client-side connection code
		assert.raises({filter: e -> e.status === 406}, -> http.get(url + '!src'));
	}

	test("Can't access source code of .gen files") {||
		var url = rel('hello.txt');
		http.get(url) .. assert.eq('world!');
		assert.raises({filter: e -> e.status === 404}, -> http.get(url + '.gen'));
	}
}

