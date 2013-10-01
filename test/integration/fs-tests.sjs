var { context, test, assert } = require('sjs:test/suite');
var http = require('sjs:http');
var url = require('sjs:url');
var helper = require('../helper');

context("serving files") {||
	var rel = p -> helper.url('test/integration/fixtures/' + p);
	test("Listing a directory with special characters") {||
		var contents = http.get(rel(''));
		contents .. assert.contains('<a href="%2520special%3A%20characters/">%20special: characters/</a>');
	}

	test("Listing a file with special characters") {||
		var contents = http.get(rel(url.encode('%20special: characters') + '/'));
		contents .. assert.contains('<a href="%2520awkward%20%252f%20characters.sjs">%20awkward %2f characters.sjs</a>');
	}

	test("Accessing a file with special characters") {||
		// will raise if there's an http error
		http.get(rel(url.encode('%20special: characters') + '/' + url.encode('%20awkward %2f characters.sjs'))) .. assert.ok();
	}
}

