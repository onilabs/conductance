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

			var appLink = s.appHeader.getAttribute('href') + 'ping';
			var origUrl = @url.parse(appLink);
			var appId = origUrl.host.replace(/\.localhost.*$/, '');
			appId .. @assert.eq("#{s.appName}-#{s.creds .. @get('username')}");

			var baseUrl = "http://localhost:#{@stub.getEnv('port-proxy')}/";
			s.appRequest = function(rel, opts) {
				var url = @url.normalize(rel, baseUrl);
				opts = opts ? opts .. @clone : {};
				opts.method = opts.method || 'GET';
				// XXX this doesn't really reflect reality (because we can't rely on vhosts in test).
				// But it tests the basic proxy setup.
				opts.headers = (opts.headers ||{}) .. @merge({'x-test-host': origUrl.host});
				@info("Fetching: #{url} with opts", opts);
				var rv = @stub.request(url, opts);
				@info("request to #{url} returned:", rv);
				return rv;
			}

			var outputContent = s.mainElem .. @elem('.output-content');
			@waitforSuccess(-> String(outputContent.textContent) .. @assert.contains('Conductance serving address:'), null, 20);
		}
	}

	@test("app is reachable") {|s|
		@waitforSuccess(-> s.appRequest('/ping') .. @assert.eq('pong!'));
	}

	@test("fs API can read/write files") {|s|
		s.appRequest('/write/foo', {method:'POST', body: "contents of `foo`"});
		s.appRequest('/read/foo', {method:'POST'}) .. @assert.eq('contents of `foo`');
	}

	@test("fs ENOENT") {|s|
		var response = s.appRequest('/read/nothere', {method:'POST', throwing:false, response:'full'});
		@info("Got response: #{response.body}");
		response.code .. @assert.eq(500);
		response = response.body .. JSON.parse();
		response.errno .. @assert.eq('ENOENT');
	}

	@test("fs attempting to access a relative path") {|s|
		['../', '/'] .. @each {|path|
			var response = s.appRequest('/read/' + encodeURIComponent(path), {method:'POST', throwing:false, response:'full'});
			@info("Got response (for #{path}): #{response.body}");
			response.code .. @assert.eq(500);
			response = response.body .. JSON.parse();
			response.errno .. @assert.eq('EACCES');
		}
	}

	@test("fs contents are persisted across restarts") {||
		@assert.fail("TODO");
	}
}
}.skipIf(!(@isBrowser && @stub.getEnv('docker-enabled')));
