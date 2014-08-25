@ = require('../lib/common');
@addTestHooks();

var visibleElements = function(elem, sel) {
	return elem .. @elems(sel) .. @filter(e -> !e.classList.contains('hidden'));
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
}

@context("Signup") {||
	var signup = function(s) {
		s.waitforPanel(/Login to .*/);
		var form = @waitforSuccess( -> s.modal('form'));
		form .. @elems('a') .. @find(el -> /register new account/.test(el.textContent)) .. s.driver.click();
		var inputs = form .. formInputs();
		inputs .. @ownKeys .. @toArray .. @assert.eq(['username','email','password']);
		inputs.email .. @enter('test@example.com');
		inputs.username .. @enter('test1');
		inputs.password .. @enter('secret');
		form .. @trigger('submit');

		@waitforSuccess(-> s.modal('p', el -> /We've sent a confirmation email to/.test(el.textContent)));
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
}
