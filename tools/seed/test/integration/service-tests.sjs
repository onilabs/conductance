@ = require(['../lib/common', '../lib/deploy']);
@context {||
@addTestHooks({clearAround:'all'});

@test.beforeAll {|s|
	s.appName = 'fs-test';
	s.screenshotOnFailure {||
		s .. @actions.signup(true);
		s .. @createApp(s.appName);
	}
}

@context("fs service") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s.appSettingsButton() .. s.driver.click();
			s .. @enableService('Seed FS');
			var form = s.modal('form');
			// each service's form is a sub-form, to prevent name collisions
			form .. @elem('.svc-form-fs') .. s.fillForm({
				enable: true,
			});
			form .. @trigger('submit');
			s.waitforNoModal();

			s .. @setUploadPath(@stub.testPath('integration/fixtures/fs_app'));
			s.mainElem .. s.clickButton(/deploy/);

			var baseUrl = "http://localhost:#{@stub.getEnv('port-proxy')}/";
			s.appRequest = @appRequester(s, baseUrl);

			@waitforSuccess(-> String(s.outputContent().textContent) .. @assert.contains('Conductance serving address:'), null, 20);
		}
	}

	@test("app is reachable") {|s|
		@waitforSuccess(-> s.appRequest('/ping') .. @assert.eq('pong!'));
	}

	@test("fs API can read/write files") {|s|
		s.appRequest('/write/foo', {method:'POST', body: "contents of `foo`"});
		s.appRequest('/read/foo', {method:'POST'}) .. @assert.eq('contents of `foo`');
		s.appRequest('/ls//', {method:'POST'}) .. JSON.parse() .. @assert.eq(['foo']);
	}

	@test("fs ENOENT") {|s|
		var response = s.appRequest('/read/nothere', {method:'POST', throwing:false, response:'full'});
		@info("Got response:",  response);
		response.status .. @assert.eq(500);
		response = response.content .. JSON.parse();
		response.code .. @assert.eq('ENOENT');
	}

	@test("fs attempting to access a disallowed path") {|s|
		['../'] .. @each {|path|
			var response = s.appRequest('/read/' + encodeURIComponent(path), {method:'POST', throwing:false, response:'full'});
			response.status .. @assert.eq(500);
			response = response.content .. JSON.parse();
			response.code .. @assert.eq('EACCES');
		}
	}

	@test("fs contents are persisted across restarts") {|s|
		s.appRequest('/write/foo', {method:'POST', body: "contents of `foo`"});
		s.mainElem .. s.clickButton({title:'stop'});
		@waitforSuccess(-> s.appRunning() .. @assert.eq(false), 10);

		s.mainElem .. s.clickButton({title:'start'});
		@waitforSuccess(-> s.appRunning() .. @assert.eq(true), 10);
		@waitforSuccess(-> s.appRequest('/read/foo', {method:'POST'}) .. @assert.eq('contents of `foo`'));
	}
}
}.skipIf(!(@isBrowser && @stub.getEnv('docker-enabled')));
