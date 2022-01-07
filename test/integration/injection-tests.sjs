var { context, test, assert } = require('sjs:test/suite');
var http = require('sjs:http');
var Url = require('sjs:url');
var {clone} = require('sjs:object');
var {each} = require('sjs:sequence');
var logging = require('sjs:logging');

context(function() { // browserOnly
var {Driver, waitforSuccess, waitforCondition} = require('sjs:xbrowser/driver');

var payloadString = "'quote\"s;&amp;%20&quot;</script><script>alert(\"XSS INJECTION\");</script><strong>";
var payloadObject = {
	key: payloadString
};
var payloadCss = "'#{payloadString.replace(/(')/g, '\\\'')}'";

var expectedPayloadCSS = [
	payloadCss, // chrome, no interpretation
	'"' + payloadString.replace(/(["])/g,"\\$1") + '"', // new chrome returns a double-quoted string without
	'"' + payloadCss.slice(1, -1).replace(/(["])/g,"\\$1") + '"', // firefox returns a double-quoted string
	"'" + payloadCss.slice(1, -1) + "'", // phantomJS returns a single-quoted string
];

var rel = p -> Url.normalize('./fixtures/' + p, module.id);

/// NOTE: context-aware encoding works only on "Element" boundaries. i.e:
// Element("script", content)
//    -> will escape `content` appropriately for a <script>, while
//
// Element("div", `<script>$content</script>`)
//    -> will escape $content for inside a <div>, rather than a <script>
//
// If we wanted to protect against the latter case, we'd have to actually parse
// each HTML snippet before inserting it.
//
// In practice conductance is usually the only one adding <script> and <style> tags
// explicitly, so this is OK. But we need to document it.

context("static file generation", function() {

	test.beforeAll:: function(s) {
		s.driver = Driver();
		s.driver.isLoaded = -> this.document() && this.document().getElementById("content");
		s.driver.mixInto(s);
	};

	test.afterEach:: function(s) {
		var elem = s.document().getElementById("content");
		if (elem) elem.parentNode.removeChild(elem);
	};

	test.afterAll:: function(s) {
		s.driver.close();
	};

	test("encodes data inside a regular html tag", function(s) {
		s.navigate(Url.build([rel('injection'), {template: 'div', value: payloadString}]));
		var injected = waitforCondition(-> s.document().getElementById("content"));
		injected.textContent .. assert.eq(payloadString);
	});

	;['single','double','obj'] .. each {|quote|
		test("encodes data inside a #{quote}-quoted attribute", function(s) {
			var url = Url.build([rel('injection'), {template: "attr_#{quote}", value: payloadString}]);
			logging.info('url:', url);
			s.navigate(url);
			var injected = waitforCondition(-> s.document().getElementById("content"));
			injected.getAttribute('data-payload') .. assert.eq(payloadString);
		});
	}

	test("encodes data inside a <script>", function(s) {
		["script", "scriptQuasi"] .. each {|template|
			s.navigate(Url.build([rel('injection'), {template: 'script', value: JSON.stringify(payloadObject)}]));
			var injected = waitforCondition(-> s.window().injected);
			clone(injected) .. assert.eq(payloadObject);
		}
	});

	test("encodes data inside a CSS block", function(s) {
		var check = function() {
			var url = Url.build([rel('injection'), {template: 'style', value: "&:after {content: #{payloadCss} }"}]);
			logging.info("url:", url);
			s.navigate(url);
			var injected = waitforCondition(-> s.document().getElementById("content"));
			var content = s.window().getComputedStyle(injected, ':after').content;
			//console.log("GOT CONTENT: " + content);
			//expectedPayloadCSS .. each {|c|
			//	console.log("ALLOWED:     " + c);
			//}
			expectedPayloadCSS .. assert.contains(content);
			//content .. assert.eq(payloadCss);
		};

		// XXX phantomJS sometimes gets stuck and just returns a blank computed style
		// no matter how long we wait, so we retry the _whole_ test including initial navigation.
		waitforSuccess(check, null, 10);
	});
});

context("dynamic content generation", function() {
	var {Element, appendContent, CSS} = require('mho:surface');

	test("encodes data inside a regular html tag", function() {
		document.body .. appendContent(Element("div", payloadString)) {|elem|
			elem.textContent .. assert.eq(payloadString);
		}
	});

	test("encodes data inside an attribute object", function() {
		document.body .. appendContent(Element("div", null, {"data-payload": payloadString})) {|elem|
			elem.getAttribute('data-payload') .. assert.eq(payloadString);
		}
	});

	test("encodes data inside a double-quoted attribute", function() {
		document.body .. appendContent(`<div data-payload="$payloadString"></div>`) {|elem|
			elem.getAttribute('data-payload') .. assert.eq(payloadString);
		}
	});

	test("encodes data inside a single-quoted attribute", function() {
		document.body .. appendContent(`<div data-payload='$payloadString'></div>`) {|elem|
			elem.getAttribute('data-payload') .. assert.eq(payloadString);
		}
	});

	test("encodes data inside a <script>", function() {
		document.body .. appendContent(Element("script", "window.tmp = #{JSON.stringify(payloadObject)};")) {|elem|
			// XXX appendContent uses insertAdjacentHTML, which doesn't auto-eval
			// script tags. We don't really care about that here, just that the script
			// contents are escaped correctly
			eval(elem.textContent);
			window.tmp .. assert.eq(payloadObject);
		}
	}).ignoreLeaks("tmp");

	test("encodes data inside a <pre>", function(s) {
		document.body .. appendContent(Element("pre", payloadString)) {|elem|
			elem.textContent .. assert.eq(payloadString);
		}
	});

	test("encodes data inside a CSS block", function(s) {
		document.body .. appendContent(Element("div", "text") .. CSS("&:after{content: #{payloadCss}; }")) {|elem|
			// getComputedStyle is not always synchronous
			waitforSuccess(-> expectedPayloadCSS .. assert.contains(
				window.getComputedStyle(elem, ':after').content));
		}
	});

});
}).browserOnly();
