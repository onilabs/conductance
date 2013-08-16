var { context, test, assert } = require('sjs:test/suite');
var http = require('sjs:http');
var Url = require('sjs:url');
var {clone} = require('sjs:object');
var helper = require('../../helper');

context() {|| // browserOnly

var payloadString = "'quote\"s;&amp;%20&quot;</script><script>alert('XSS INJECTION');</script><strong>";
var payloadObject = {
	key: payloadString
};
var rel = p -> Url.normalize('./fixtures/' + p, module.id);

context("static file generation") {||
	var {Driver, waitforCondition} = require('sjs:xbrowser/driver');

	test.beforeAll {|s|
		s.driver = Driver();
		s.driver.isLoaded = -> this.document().getElementById("content");
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
		injected.innerText .. assert.eq(payloadString);
	}

	test("encodes data inside a <pre>") {|s|
		s.navigate(Url.build([rel('injection'), {template: 'div', value: payloadString}]));
		var injected = waitforCondition(-> s.document().getElementById("content"));
		injected.innerText .. assert.eq(payloadString);
	}

	test("encodes data inside a <script>") {|s|
		s.navigate(Url.build([rel('injection'), {template: 'script', value: JSON.stringify(payloadObject)}]));
		var injected = waitforCondition(-> s.window().injected);
		clone(injected) .. assert.eq(payloadObject);
	}
}

context("dynamic content generation") {||
	var {Widget, withWidget} = require('mho:surface');

	test("encodes data inside a regular html tag") {||
		document.body .. withWidget(Widget("div", payloadString)) {|elem|
			elem.innerText .. assert.eq(payloadString);
		}
	}

	test("encodes data inside a <script>") {||
		document.body .. withWidget(Widget("script", "window.tmp = #{JSON.stringify(payloadObject)};")) {|elem|
			window.tmp .. assert.eq(payloadObject);
		}
	}.ignoreLeaks("tmp");

	test("encodes data inside a <pre>") {|s|
		document.body .. withWidget(Widget("pre", payloadString)) {|elem|
			elem.innerText .. assert.eq(payloadString);
		}

		document.body .. withWidget(Widget("div", `<pre>$payloadString</pre>`)) {|elem|
			elem.childNodes[0].innerText .. assert.eq(payloadString);
		}
	}

}
}.browserOnly();
