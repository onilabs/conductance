@ = require(['../lib/common', '../lib/deploy']);
@context {||
@addTestHooks({clearAround:'all'});

var appPath = @stub.testPath('integration/fixtures/services');
var baseUrl = "http://localhost:#{@stub.getEnv('port-proxy')}/";

@test.beforeAll {|s|
	s.appName = 'fs-test';
	s.screenshotOnFailure {||
		s .. @actions.signup(true);
		s .. @createApp(s.appName);
		s.appRequest = @appRequester(s, baseUrl);

		s.appSettingsButton() .. s.driver.click();
		s .. @enableService('Seed persistence');
		var form = s.modal('form');
		s .. @fillUploadPath(form, appPath);
		form .. @trigger('submit');
		s.waitforNoModal();
	}
}

@context("fs service") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s.mainElem .. s.clickButton(/deploy/);
			s .. @awaitRunningApp();
		}
	}

	@test("app is reachable") {|s|
		@waitforSuccess(-> s.appRequest('/ping') .. @assert.eq('pong!'));
	}

	@context('fs') {||
		@test("can read/write files") {|s|
			s.appRequest('/write/foo', {method:'POST', body: "contents of `foo`"});
			s.appRequest('/read/foo', {method:'POST'}) .. @assert.eq('contents of `foo`');
			s.appRequest('/ls//', {method:'POST'}) .. JSON.parse() .. @assert.eq(['foo']);
		}

		@test("ENOENT") {|s|
			var response = s.appRequest('/read/nothere', {method:'POST', throwing:false, response:'full'});
			@info("Got response:",  response);
			response.status .. @assert.eq(500);
			response = response.content .. JSON.parse();
			response.code .. @assert.eq('ENOENT');
		}

		@test("attempting to access a disallowed path") {|s|
			['../'] .. @each {|path|
				var response = s.appRequest('/read/' + encodeURIComponent(path), {method:'POST', throwing:false, response:'full'});
				response.status .. @assert.eq(500);
				response = response.content .. JSON.parse();
				response.code .. @assert.eq('EACCES');
			}
		}

		@test("contents are persisted across restarts") {|s|
			s.appRequest('/write/foo', {method:'POST', body: "contents of `foo`"});
			s.mainElem .. s.clickButton({title:'stop'});
			@waitforSuccess(-> s.appRunning() .. @assert.eq(false), 10);

			s.mainElem .. s.clickButton({title:'start'});
			@waitforSuccess(-> s.appRunning() .. @assert.eq(true), 10);
			@waitforSuccess(-> s.appRequest('/read/foo', {method:'POST'}) .. @assert.eq('contents of `foo`'));
		}
	}

	@context('db') {||
		@test("can read/write keys") {|s|
			var payload = { x: 1, y: "2"};
			s.appRequest('/kv/set/foo', {method:'POST', body: JSON.stringify(payload)});
			s.appRequest('/kv/get/foo', {method:'POST'}) .. JSON.parse() .. @assert.eq(payload);
			s.appRequest('/kv/get/no_such_key', {method:'POST'}) .. JSON.parse() .. @assert.eq(null);
		}
	}

}

@context("setting mho:env values") {||
	@test.beforeAll {|s|
		s.screenshotOnFailure {||
			s.appSettingsButton() .. s.driver.click();
			var form = s.modal('form');
			s .. @enableService('Custom settings');
			s .. @fillUploadPath(form, appPath);
			form .. @trigger('submit');
			s.waitforNoModal();
		}
	}

	@test.afterAll {|s|
		s .. @ensureStopped();
	}

	@test.beforeEach {|s|
		s.fields = -> s.form .. @elems('form.editable-field');
		s.addFieldForm = -> s.form .. @elem('form.add-field');
		s.fieldForKey = key -> s.fields()
			.. @find(f -> @elem(f, 'input[name="key"]').value === key);

		s.addField = function(key) {
			var existingFields = s.fields();
			var form = s.addFieldForm();
			form .. s.fillForm({
				key: key,
			});
			form .. @trigger('submit');
			var newFields = s.fields();
			if(newFields.length === existingFields.length) {
				@warn("field not added: #{key}");
				return null;
			}
			@assert.eq(newFields.length, existingFields.length+1);
			return newFields .. @at(-1);
		}

		s.populateField = function(form, props) {
			@assert.ok(form, "no form given");
			// props.type affects what _kind_ of field `value` is,
			// so edit that in a separate step
			if(props.type) {
				props = props .. @clone();
				form .. s.fillForm({type: props.type}, false);
				delete props.type;
			}
			form .. s.fillForm(props, false);
			form .. @trigger('submit');
			return form;
		};

		s.submit = function(successfully) {
			s.modal('.mainSettings') .. @trigger('submit');
			if(successfully === false) return;
			s.waitforNoModal();
		}

		s.deploy = function() {
			s .. @ensureStopped();
			s.mainElem .. s.clickButton(/deploy/);
			s .. @awaitRunningApp();
		}

		s.serviceForm = (name) -> s.modal(".svc-form-#{name}");

		s.screenshotOnFailure {||
			s.appSettingsButton() .. s.driver.click();
			// clear out all vars
			var form = s.modal('.form');

			s.form = s.serviceForm('env');
			s.fields() .. @each {|field|
				field .. @elem('.remove') .. s.driver.click();
			}
			s.submit();

			// reopen settings dialog
			s.appSettingsButton() .. s.driver.click();
			s.fields() .. @assert.eq([]);
			s.form = s.serviceForm('env');
		}
	}

	@test("adding variables") {|s|
		s.addField("stringKey") .. s.populateField({
			// "string" is the default type
			value: 'string value',
		});

		s.addField("boolTrue") .. s.populateField({
			type: 'boolean',
			value: true,
		});

		s.addField("boolFalse") .. s.populateField({
			type: 'boolean',
			value: false,
		});

		s.addField("jsonKey") .. s.populateField({
			type: "JSON",
			value: '["one", 2, true]',
		});

		s.submit();
		s.deploy();
		var env = @waitforSuccess(-> s.appRequest('/dump-env') .. JSON.parse());
		@info("Env:", env);
		var expected = {
			stringKey: 'string value',
			boolTrue: true,
			boolFalse: false,
			jsonKey: ['one', 2, true],
		};
		expected .. @ownKeys
			.. @map(k -> [k, env[k]]) .. @pairsToObject()
			.. @assert.eq(expected);
	}

	@test("modifying variables") {|s|
		s.addField("stringKey") .. s.populateField({
			// "string" is the default type
			value: 'string value',
		});

		s.addField("boolTrue") .. s.populateField({
			type: 'boolean',
			value: true,
		});

		s.addField("boolFalse") .. s.populateField({
			type: 'boolean',
			value: false,
		});

		s.addField("jsonKey") .. s.populateField({
			type: "JSON",
			value: '["one", 2, true]',
		});

		// edit key
		s.fieldForKey('jsonKey') .. s.populateField({
			key: "json key",
			type: 'string'
		});

		// edit value
		s.fieldForKey('stringKey') .. s.populateField({
			value: "string 2",
		});

		// change type
		s.fieldForKey('boolTrue') .. s.populateField({
			type: "string",
			value: "no longer a bool!",
		});

		// remove
		s.fieldForKey('boolFalse') .. @elem('.remove') .. s.driver.click();

		s.submit();
		s.deploy();
		var env = @waitforSuccess(-> s.appRequest('/dump-env') .. JSON.parse());
		@info("Env:", env);
		var MISSING = '<missing>';
		var expected = {
			stringKey: 'string 2',
			boolTrue: "no longer a bool!",
			'json key': '["one", 2, true]',
			jsonKey: MISSING,
			boolFalse: MISSING,
		};
		expected .. @ownKeys
			.. @map(k -> [k, env .. @get(k, MISSING)]) .. @pairsToObject()
			.. @assert.eq(expected);
	}

	@context("validation") {||
		@test("invalid value") {|s|
			s.addField("bad json") .. s.populateField({
				type: 'JSON',
				value: '{foo = bar}',
			}) .. @formErrors .. @assert.eq(['Invalid JSON']);
		}

		@context("duplicate keys") {||
			@test.beforeEach {|s|
				s.addField("key") .. @assert.ok();
			}
		
			@test("adding a duplicate key") {|s|
				s.addField("key") .. @assert.eq(null);
				s.addFieldForm() .. @formErrors .. @assert.eq(['Duplicate key `key`']);
			}

			@test("recreating a deleted key") {|s|
				s.fieldForKey('key') .. @elem('.remove') .. s.driver.click();
				s.addField('key') .. @assert.ok("unable to recreate 'key' field");
			}

			@test("editing a field to conflict with an existing key") {|s|
				s.addField('key2') .. s.populateField({
					key: 'key',
				});
				s.submit(false);
				// both fields should now be marked as duplicate
				s.fields()
					.. @map(field -> field .. @formErrors)
					.. @assert.eq([
						['Duplicate key'],
						['Duplicate key'],
					]);
			}
		}
	}

}
}.skipIf(!(@isBrowser && @stub.getEnv('docker-enabled')));
