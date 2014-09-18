@ = require('../lib/common');
@context {||
@addTestHooks();

// see ../../..//stratifiedjs/modules/xbrowser/driver.sjs

var visibleElements = function(elem, sel) {
	return elem .. @elems(sel) .. @filter(@isVisible);
}
var formInputs = function(elem) {
	var rv = {};
	elem .. visibleElements('input') .. @each {|elem|
		rv[elem.getAttribute('name') .. @assert.ok(elem)] = elem;
	}
	return rv;
}

var contentPredicate = function(str) {
	if(!str) return -> true;
	if(@isString(str)) return el -> str === el.textContent;
	return el -> str.test(el.textContent);
}

@test.beforeAll {|s|
	s.modal = (sel, pred) -> s.driver.elem(".overlay #{sel ? sel : ""}", pred);
	s.hasModal = (sel, pred) -> s.driver.elems(".overlay #{sel}", pred).length > 0;
	s.waitforPanel = function(title) {
		var matches = @isString(title) ? t -> t === title : t -> title.test(t);
		@waitforSuccess(function() {
			var panel = s.modal('.panel-title');
			@assert.ok(matches(panel.textContent));
		});
	}
	s.clickLink = (elem, text) -> elem .. @elems('a') .. @find(contentPredicate(text)) .. s.driver.click();
	s.clickButton = (elem, text) -> elem .. @elems('button') .. @find(contentPredicate(text)) .. s.driver.click();
	s.waitforNoModal = -> @waitforCondition(-> s.hasModal() === false, "modal dialog still present");
	s.creds = {
		username: "test1",
		email: "test@example.com",
		password: "secret",
	};
	s.fillForm = function(form, props, expectedFields) {
		var inputs = form .. formInputs();
		if(expectedFields) {
			inputs .. @ownKeys .. @sort() .. @assert.eq(expectedFields .. @sort);
		}
		inputs .. @ownPropertyPairs .. @each {|[key, elem]|
			@info("Entering #{props .. @get(key)} into elem #{elem}");
			elem .. @enter(props .. @get(key));
		}
	}
}

@context("Signup") {||
	var signup = function(s) {
		s.waitforPanel(/Login to .*/);
		var form = @waitforSuccess( -> s.modal('form'));
		form .. @elems('a') .. @find(el -> /register new account/.test(el.textContent)) .. s.driver.click();
		s.fillForm(form, s.creds, ['username','email','password']);
		form .. @trigger('submit');

		@waitforSuccess(-> s.modal('p', el -> /We've sent a confirmation email to/.test(el.textContent)));
	};

	var submitLogin = function(s, creds) {
		s.waitforPanel(/Login to .*/);
		if(!creds) creds = s.creds;
		var form = @waitforSuccess( -> s.modal('form'));
		s.fillForm(form, creds, ['username', 'password']);
		form .. @trigger('submit');
	};

	var activationLink = function(email) {
		var contents = email.response;
		var match = email.response.match(/activation code:\s+(https?:\/\/[^\r\n]+)/m);
		if(!match) throw new Error("Couldn't extract activation code from email:\n#{contents}");
		return match[1];
	}

	@test("with immediate activation") {|s|
		s .. signup();
		var email = @stub.emailQueue.get();

		var activationResponse = email .. activationLink() .. @http.get();
		// TODO: assert contents of activation page, maybe even load it in a new driver window?

		@info(activationResponse);
		s.modal('button') .. s.driver.click();
		s.waitforNoModal();
	}

	@test("attempt to continue without activating") {|s|
		s .. signup();
		s.modal('button') .. s.driver.click();
		@waitforSuccess( -> s.modal('.panel-body') .. @elem('h3') .. @get('textContent') .. @assert.eq("Login failed."));
		var container = s.modal('.panel-body');
		var button = container .. @elem('button');
		button.textContent .. @assert.eq("Try again...");
		button .. s.driver.click;

		@stub.emailQueue.get() .. activationLink() .. @http.get();
		container .. @elem('h3') .. @get('textContent') .. @assert.eq("Login failed.");
		button .. s.driver.click();

		s.waitforNoModal();
	}

	@test("resend activation link") {|s|
		s .. signup();
		var firstActivationLink = @stub.emailQueue.get() .. activationLink();
		s.driver.reload();
		s .. submitLogin();

		@waitforSuccess(-> s.modal('strong', el -> /Invalid credentials/.test(el.textContent)));
		@stub.emailQueue.count() .. @assert.eq(0);
		s.modal() .. s.clickLink("Resend confirmation email");

		@waitforSuccess(-> s.modal('em', el -> /Confirmation sent/.test(el.textContent)));

		var secondActivationLink = @stub.emailQueue.get() .. activationLink();
		secondActivationLink .. @assert.eq(firstActivationLink);
		secondActivationLink .. @http.get();

		s.modal() .. s.clickButton("Log in");

		s.waitforNoModal();
	}
}
}.browserOnly();
