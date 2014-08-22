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

@test.beforeAll {|s|
	s.modal = (sel, pred) -> s.driver.elem(".overlay #{sel}", pred);
	s.hasModal = (sel, pred) -> s.driver.elems(".overlay #{sel}", pred).length == 0;
	s.waitforPanel = function(title) {
		var matches = @isString(title) ? t -> t === title : t -> title.test(t);
		@waitforSuccess(function() {
			var panel = s.modal('.panel-title');
			@assert.ok(matches(panel.textContent));
		});
	}
}

@context("Signup") {||
	@test("create new account") {|s|
		s.waitforPanel(/Login to .*/);
		var form = @waitforSuccess( -> s.modal('form'));
		form .. @elems('a') .. @find(el -> /register new account/.test(el.textContent)) .. s.driver.click();
		var inputs = form .. formInputs();
		inputs .. @ownKeys .. @toArray .. @assert.eq(['username','email','password']);
		inputs.email .. @enter('test@example.com');
		inputs.username .. @enter('test1');
		inputs.password .. @enter('secret');
		form .. @trigger('submit');

		//hold(2000); s.modal('div') .. @elems('p') .. console.log();
		@waitforSuccess(-> s.modal('p', el -> /We've sent a confirmation email to/.test(el.textContent)));
		s.modal('button') .. s.driver.click();
		@assert.falsy(s.hasModal());
		@assert.ok(true);
	}
}
