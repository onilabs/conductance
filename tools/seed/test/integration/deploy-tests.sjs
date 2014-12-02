@ = require('../lib/common');
@context {||
@addTestHooks({clearAround:'all'});

@context("deploy a simple app") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s .. @actions.signup(true);
			var appList = @waitforSuccess(s.appList);
			appList .. @map(el -> el.textContent) .. @assert.eq([]);
			s.createAppButton() .. s.driver.click();
			var form = @waitforSuccess( -> s.modal('form'));
			var appPath = @stub.testPath('integration/fixtures/hello_app');
			var appName = 'app-one';
			form .. s.fillForm({
				name: appName,
				path: appPath,
			});
			form .. @trigger('submit');
			s.waitforNoModal();
			var appList;
			@waitforCondition(-> (appList = s.appList()).length > 0);
			appList .. @map(el -> el.textContent) .. @assert.eq([appName]);
			appList[0] .. @elem('a') .. s.driver.click();

			var main = s.mainElem = s.driver.elem('.app-display');
			var appLink = @waitforSuccess(-> main .. @elem('h3 a', el -> el.textContent === appName)).getAttribute('href') + 'ping';
			// show the console output, for debugging
			var outputToggle = @waitforSuccess( -> main .. @elem('.output-toggle'));
			outputToggle .. s.driver.click();
			main .. s.clickButton(/deploy/);
			var origUrl = @url.parse(appLink);
			var appId = origUrl.host.replace(/\.localhost.*$/, '');
			appId .. @assert.eq("#{appName}-#{s.creds .. @get('username')}");

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

			var outputContent = main .. @elem('.output-content');
			@waitforSuccess(-> String(outputContent.textContent) .. @assert.contains('Conductance serving address:'), null, 5);
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
}.skipIf(!(@isBrowser && @stub.getEnv('docker-enabled')));
