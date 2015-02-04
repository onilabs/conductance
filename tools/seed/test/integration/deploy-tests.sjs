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

			var appId = @url.parse(s.appLink()).host.replace(/\.localhost.*$/, '');
			appId .. @assert.eq("#{s.appName}-#{s.creds .. @get('username')}");

			var baseUrl = "http://localhost:#{@stub.getEnv('port-proxy')}/";
			s.appRequest = @appRequester(s, baseUrl);

			@waitforSuccess(-> s.outputContent() .. @assert.contains('Conductance serving address:'), null, 20);
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
		@waitforSuccess(-> s.outputContent() .. @assert.contains('message from client: Hello!'));
	}
}

@context("broken app") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s .. @setUploadPath(@stub.testPath('integration/fixtures/fail_app'));
			s.mainElem .. s.clickButton(/deploy/);

			var baseUrl = "http://localhost:#{@stub.getEnv('port-proxy')}/";
			s.appRequest = @appRequester(s, baseUrl);
		}
	}
	
	@test("failure output is shown") {|s|
		@waitforSuccess(-> s.outputContent() .. @assert.contains('Error: SJS syntax error in '), null, 20);
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
