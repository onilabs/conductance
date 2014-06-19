var { context, test, assert } = require('sjs:test/suite');
var http = require('sjs:http');
var Url = require('sjs:url');
var {clone} = require('sjs:object');
var {each} = require('sjs:sequence');

context() {|| // browserOnly
var {Driver, waitforSuccess, waitforCondition} = require('sjs:xbrowser/driver');

var payloadString = "'quote\"s;&amp;%20&quot;</script><script>alert(\"XSS INJECTION\");</script><strong>";
var payloadObject = {
	key: payloadString
};
var payloadCss = "url('data:base64;#{payloadString.replace(/(')/g, '\\\'')}')";

var rel = p -> Url.normalize('./fixtures/' + p, module.id);

/// NOTE: context-aware encoding works only on "Element" boundaries. i.e:
// Element("script", content)
//    -> will escape `content` appropriately for a <script>, while
//
// Element("div", `<script>$content</script>`)
//    -> will escape $content for inside a <div>, rather than a <script>
//
// If we wanted to protect against the latter case, we'e dhave to actually parse
// each HTML snippet before inserting it.
//
// In practice conductance is usually the only one adding <script> and <style> tags
// explicitly, so this is OK. But we need to document it.

context("static file generation") {||

	test.beforeAll {|s|
		s.driver = Driver();
		s.driver.isLoaded = -> this.document() && this.document().getElementById("content");
		s.driver.mixInto(s);
	}

	test.afterEach {|s|
		var elem = s.document().getElementById("content");
		if (elem) elem.parentNode.removeChild(elem);
	}

	test.afterAll {|s|
		s.driver.close();
	}

	test("encodes data inside a regular html tag") {|s|
		s.navigate(Url.build([rel('injection'), {template: 'div', value: payloadString}]));
		var injected = waitforCondition(-> s.document().getElementById("content"));
		injected.textContent .. assert.eq(payloadString);
	}

	test("encodes data inside a <pre>") {|s|
		s.navigate(Url.build([rel('injection'), {template: 'div', value: payloadString}]));
		var injected = waitforCondition(-> s.document().getElementById("content"));
		injected.textContent .. assert.eq(payloadString);
	}

	test("encodes data inside a <script>") {|s|
		["script", "scriptQuasi"] .. each {|template|
			s.navigate(Url.build([rel('injection'), {template: 'script', value: JSON.stringify(payloadObject)}]));
			var injected = waitforCondition(-> s.window().injected);
			clone(injected) .. assert.eq(payloadObject);
		}
	}

	test("encodes data inside a CSS block") {|s|
		s.navigate(Url.build([rel('injection'), {template: 'style', value: "{background-image: #{payloadCss} }"}]));
		var injected = waitforCondition(-> s.document().getElementById("content"));
		waitforSuccess( ->
			s.window().getComputedStyle(injected)['background-image']
				.. assert.eq(payloadCss)
		);
	};
}

context("dynamic content generation") {||
	var {Element, appendContent, CSS} = require('mho:surface');

	test("encodes data inside a regular html tag") {||
		document.body .. appendContent(Element("div", payloadString)) {|elem|
			elem.textContent .. assert.eq(payloadString);
		}
	}

	test("encodes data inside a <script>") {||
		document.body .. appendContent(Element("script", "window.tmp = #{JSON.stringify(payloadObject)};")) {|elem|
			// XXX appendContent uses insertAdjacentHTML, which doesn't auto-eval
			// script tags. We don't really care about that here, just that the script
			// contents are escaped correctly
			eval(elem.textContent);
			window.tmp .. assert.eq(payloadObject);
		}
	}.ignoreLeaks("tmp");

	test("encodes data inside a <pre>") {|s|
		document.body .. appendContent(Element("pre", payloadString)) {|elem|
			elem.textContent .. assert.eq(payloadString);
		}
	}

	test("encodes data inside a CSS block") {|s|
		document.body .. appendContent(Element("div", "text") .. CSS("{background-image: #{payloadCss} }")) {|elem|
			// getComputedStyle is not always synchronous
			waitforSuccess(-> window.getComputedStyle(elem)['background-image'] .. assert.eq(payloadCss));
		}
	};

}
}.browserOnly();
