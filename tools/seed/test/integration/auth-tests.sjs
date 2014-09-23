@ = require('../lib/common');
@context {||
@addTestHooks();

@context("Signup") {||
	@test("with immediate activation") {|s|
		s .. @actions.signup();
		s .. @actions.activate();

		s.modal('button') .. s.driver.click();
		s.waitforNoModal();
	}

	@test("attempt to continue without activating") {|s|
		s .. @actions.signup();
		s.modal('button') .. s.driver.click();
		@waitforSuccess( -> s.modal('.panel-body') .. @elem('h3') .. @get('textContent') .. @assert.eq("Login failed."));
		var container = s.modal('.panel-body');
		var button = -> container .. @elem('button');
		button().textContent .. @assert.eq("Try again...");
		button() .. s.driver.click;

		s .. @actions.activate();
		container .. @elem('h3') .. @get('textContent') .. @assert.eq("Login failed.");
		button() .. s.driver.click();

		s.waitforNoModal();
	}

	@test("resend activation link") {|s|
		s .. @actions.signup();
		// never accessed:
		var firstActivationLink = @stub.emailQueue.get() .. s.activationLink();
		s.driver.reload();
		s .. @actions.submitLogin();

		@waitforSuccess(-> s.modal('strong', el -> /Invalid credentials/.test(el.textContent)));
		@stub.emailQueue.count() .. @assert.eq(0);
		var resendButton = -> s.modal() .. @elems('a') .. @find(@contentPredicate("Resend confirmation email"), null);
		resendButton() .. s.driver.click();
		@waitforSuccess(-> resendButton() == null);

		var secondActivationLink = @stub.emailQueue.get() .. s.activationLink();
		secondActivationLink .. @assert.eq(firstActivationLink);
		secondActivationLink .. @http.get();

		s.modal() .. s.clickButton("Log in");

		s.waitforNoModal();
	}
}
}.browserOnly();
