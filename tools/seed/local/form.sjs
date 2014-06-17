@ = require(['mho:std', 'mho:app']);
@validate = require('seed:validate');

var formStyle = @Style('{ }');
var saveButton = `<button type="submit" class="btn btn-default">Save</button>`;


function formBlock(errors, configs) {
	return function(elem) {
		elem .. @events('submit', {handle: @stopEvent}) .. @each {||
			hold(0); // allow errors to propagate
			if (!errors .. @first() .. @eq({})) {
				console.warn("validation errors remaining - ignoring submit");
				continue;
			}

			configs .. @each.par {|[obs, current]|
				obs.modify(function(val) {
					return val .. @merge(current);
				});
			}

			console.log("SUBMIT");
			break;
		}
	};
};

function InputBuilder(source, errors) {
	return function Input(name, desc, validators) {
		var err = errors .. @transform(o -> o[name]);
		var obs = @ObservableVar(source[name]);
		if (validators && !Array.isArray(validators)) validators = [validators];
		obs.set = function(v) {
			v = v.trim();
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


		var errorText = err .. @transform(function(e) {
			if (e) return @Span(e) .. @Class("errorDescription help-text text-danger");
		});

		return [
			@Div(`
				<label for="$name" class="col-sm-2">$desc:</label>
				<div class="col-sm-8">
					${@TextInput(obs, {'class':'form-control col-sm-6'})}
					$errorText
				</div>`, {'class':"form-group"}) .. @Class('has-error', err)
				.. @Style("{width:500px}")
			,
		];
	}
};

var serverConfigEditor = exports.serverConfigEditor = function(container, conf) {
	var current = conf .. @first();
	var errors = @ObservableVar({});
	var Input = InputBuilder(current, errors);

	container.querySelector('.edit-container') .. @appendContent(
		@Form([
			Input('name', 'Name', @validate.required),
			Input('host', 'Host', @validate.required),
			Input('port', 'Port', [@validate.optionalNumber, @validate.required]),
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
	var LocalInput = InputBuilder(currentLocal, errors);
	var CentralInput = InputBuilder(currentCentral, errors);

	sibling .. @insertAfter(
		@Form([
			CentralInput('name', 'Name', @validate.required),
			LocalInput('path', 'Local path', @validate.required),
			saveButton,
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle(),
		formBlock(errors, [[central, currentCentral], [local, currentLocal]])
	);
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
			{
				width: 100%;
				height: 200px;
			}
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
