@ = require(['mho:std', 'mho:app']);
@validate = require('seed:validate');

var formStyle = @CSS('{ }');
var saveButton = `<button type="submit" class="btn btn-default">Save</button>`;
var loginButton = `<button type="submit" class="btn btn-default">Connect</button>`;

var pairObject = function(k,v) {
	var rv = {};
	rv[k]=v;
	return rv;
}

var initialFocus = @Mechanism(function(elem) {
	elem.focus();
});

function formBlock(errors, configs) {
	return function(elem) {
		elem .. @events('submit', {handle: @stopEvent}) .. @each {||
			hold(0); // allow errors to propagate
			if (!errors .. @first() .. @eq({})) {
				@warn("validation errors remaining - ignoring submit");
				continue;
			}

			configs .. @each.par {|[obs, current]|
				obs.modify(function(val) {
					return val .. @merge(current);
				});
			}
			break;
		}
	};
};

var errorText = err -> err .. @transform(function(e) {
	if (e) return @Span(e) .. @Class("errorDescription help-text text-danger");
});


var inputField = function(name, desc, widget) {
	return @Div(`<label for="$name" class="col-xs-2">$desc:</label>
		<div class="col-xs-8">
			$widget
		</div>`,
		{'class':"form-group"});
};

function InputBuilder(source, errors) {
	if (!errors) errors = @ObservableVar({});
	function buildInput(cons, transform, name, desc, validators) {
			var err = errors .. @transform(o -> o[name]);
			var obs = @ObservableVar(source[name]);
			if (validators && !Array.isArray(validators)) validators = [validators];
			obs.set = function(v) {
				v = transform(v);
				if (validators) {
					var ok = true;
					try {
						validators .. @each(f -> f(v));
					} catch(e) {
						errors.modify(errors -> errors .. @merge(pairObject(name, e.message)));
						return;
					}
					errors.modify(function(errors, unchanged) {
						if (!errors .. @hasOwn(name)) {
							return unchanged;
						}
						var rv = errors .. @clone();
						delete rv[name];
						return rv;
					});
				}
				source[name] = v;
			}

			return [
				inputField(name, desc, [
					cons(obs, {'class':'form-control col-xs-6'}),
					errorText(err)
				])
				.. @Class('has-error', err)
				.. @Style("width:500px"),
			];
	};
	return {
		Input: function (name, desc, validators) {
			return buildInput(@TextInput, (v -> v.trim()), name, desc, validators);
		},

		Checkbox: function(name, desc, validators) {
			var transform = function(v) {
				@assert.bool(v);
				return v;
			};
				
			return buildInput(@Checkbox, transform, name, desc, validators);
		},
	};
};

var serverConfigEditor = exports.serverConfigEditor = function(container, conf) {
	var current = conf .. @first();
	var errors = @ObservableVar({});
	var {Input, Checkbox} = InputBuilder(current, errors);
	@info("Got server config:", current);

	container.querySelector('.edit-container') .. @appendContent(
		@Form([
			Input('name', 'Name', @validate.required),
			Input('host', 'Host', @validate.required),
			Input('port', 'Port', [@validate.optionalNumber, @validate.required]),
			Input('username', 'User', @validate.required),
			Checkbox('ssh', 'Use SSH'),
			saveButton,
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle(),
		formBlock(errors, [[conf, current]])
	);
};

var appConfigEditor = exports.appConfigEditor = function(sibling, conf) {
	var { central, local } = conf;
	waitfor {
		var currentCentral = central .. @first();
	} and {
		var currentLocal = local .. @first();
	}
	var errors = @ObservableVar({});
	var {Input: LocalInput} = InputBuilder(currentLocal, errors);
	var {Input: CentralInput} = InputBuilder(currentCentral, errors);

	sibling .. @insertAfter(
		@Form([
			CentralInput('name', 'Name', @validate.required),
			LocalInput('path', 'Local path', @validate.required),
			saveButton,
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle(),
		formBlock(errors, [[central, currentCentral], [local, currentLocal]])
	);
};

exports.loginDialog = function(sibling, username, error) {
	var password = @ObservableVar();
	sibling .. @insertAfter(
		@Form([
			errorText(error),
			inputField('password', 'Password', @TextInput(password) .. initialFocus()),
			loginButton,
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()) {
		|elem|
		elem .. @events('submit', {handle: @stopEvent}) .. @each {||
			var pass = password .. @first();
			@info("returning password:", pass);
			if (pass.length > 0) return pass;
		}
	};
};

var editWidget = function(values) {
	var jsonVal = values .. @transform(x -> JSON.stringify(x, null, '  '));
	var err = @ObservableVar();
	var errDisplay = err .. @transform(function(err) {
		if (!err) return undefined;
		return @Div(err, {"class":"error"});
	});
	return @Div([
		errDisplay,
		@TextArea() .. @Style('
			width: 100%;
			height: 200px;
		') .. @Mechanism(function(elem) {
			waitfor {
				values .. @each {|val|
					elem.value = JSON.stringify(val, null, '  ');
				}
			} and {
				elem .. @events('change') .. @each {|evt|
					var val = elem.value;
					try {
						val = JSON.parse(val);
					} catch(e) {
						err.set("Invalid JSON");
						continue;
					}
					err.set(null);
					values.modify(o -> val);
				}
			}
		})
	]);
};
