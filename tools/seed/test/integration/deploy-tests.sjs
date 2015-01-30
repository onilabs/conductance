@ = require(['../lib/common', '../lib/deploy']);
@context {||
@addTestHooks({clearAround:'all'});

@test.beforeAll {|s|
	s.appName = 'app-one';
	s.screenshotOnFailure {||
		s .. @actions.signup(true);
		s .. @createApp(s.appName);
	}
}

@context("deploy a simple app") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s .. @setUploadPath(@stub.testPath('integration/fixtures/hello_app'));
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

	@test("request headers are proxied") {|s|
		var headers = @waitforSuccess(-> s.appRequest('/headers', {headers:{'if-none-match':'1234'}}) .. JSON.parse);
		headers['x-forwarded-proto'] .. @assert.eq('http');
		headers['x-forwarded-host'] .. @assert.eq("localhost:#{@stub.getEnv('port-proxy')}");
		headers['x-forwarded-host'] .. @assert.eq("localhost:#{@stub.getEnv('port-proxy')}");
		headers['if-none-match'] .. @assert.eq("1234");
	}

	@test("console output is shown") {|s|
		var headers = @waitforSuccess(-> s.appRequest('/log', {body:'Hello!', method:'POST'}));
		var outputContent = s.mainElem .. @elem('.output-content');
		@waitforSuccess(-> outputContent.textContent .. @assert.contains('message from client: Hello!'));
	}
}

var maxmb = 10;
@test("upload size is limited to #{maxmb}mb") {|s|
	@stub.deployOfSize((maxmb * 1024) + 1) {|dir|
		s .. @setUploadPath(dir);
		s.mainElem .. s.clickButton(/deploy/);
		var errorDialog = @waitforSuccess( -> s.modal());

		var panel = s.waitforPanel('Application too large');
		(panel .. @elem('p')).textContent .. @assert.eq("Sorry, this application is a bit big. Applications are currently limited to #{maxmb}mb.");
		(panel .. @elem('button')) .. s.driver.click();
		s.waitforNoModal();
	}
}
}.skipIf(!(@isBrowser && @stub.getEnv('docker-enabled')));
