@ = require(['mho:std', 'mho:app']);
@validate = require('seed:validate');

var formStyle = @CSS('{ }');
var saveButton = `<button type="submit" class="btn btn-primary">Save</button>`;
var loginButton = `<button type="submit" class="btn btn-primary">Connect</button>`;
var signupButton = `<a class="btn btn-success signup">Sign up</a>`;

var pairObject = function(k,v) {
	var rv = {};
	rv[k]=v;
	return rv;
}

var withoutKey = function(o, key) {
	o = o .. @clone();
	delete o[key];
	return o;
}

var initialFocus = (function() {
	var baseMech = @Mechanism(function(elem) {
		elem.focus();
	});
	return function(elem, sel) {
		if (arguments.length == 1) {
			return elem .. baseMech();
		} else {
			return elem .. @Mechanism(function(elem) {
				elem.querySelector(sel).focus();
			});
		}
	}
})();

function hasErrors(errors) {
	hold(0); // allow errors to propagate
	var currentErrors = errors .. @first();
	if (!currentErrors .. @eq({})) {
		@warn("validation errors remaining - ignoring submit", currentErrors);
		return true;
	}
	return false;
}

function formBlock(errors, configs, block) {
	return function(elem) {
		elem .. @events('submit', {handle: @stopEvent}) .. @each {||
			if (hasErrors(errors)) continue;
			if (block) {
				if (!block()) continue;
			}

			@withBusyIndicator {||
				configs .. @each.par {|[obs, current]|
					obs.modify(function(val) {
						return val .. @merge(current);
					});
				}
			}
			break;
		}
	};
};

var errorText = err -> err .. @transform(function(e) {
	if (e) return @Span(e) .. @Class("errorDescription help-text text-danger");
});


var inputField = function(name, desc, widget) {
	return @Div(`<label for="$name" class="col-xs-4">$desc:</label>
		<div class="col-xs-8">
			$widget
		</div>`,
		{'class':"form-group"});
};

function InputBuilder(source, errors) {
	if (!errors) errors = @ObservableVar({});
	function buildInput(cons, transform, name, desc, validators) {
			var latestValue = source[name];
			var obs = @ObservableVar(latestValue);
			var err = errors .. @transform(o -> o[name]);
			if (validators && !Array.isArray(validators)) validators = [validators];

			var validate = function(v) {
				//@info("Validating #{name} value: #{v}");
				if (validators) {
					try {
						validators .. @each(f -> f(v));
					} catch(e) {
						errors.modify(errors -> errors .. @merge(pairObject(name, e.message)));
						//@info("NOT OK: #{e.message}");
						return false;
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
				//@info("OK");
				return true;
			};

			obs.set = (function(orig) {
				return function(v) {
					v = transform(v);
					latestValue = transform(v);
					if (!validate(v)) return;
					source[name] = v;
					orig.apply(this,arguments);
				};
			})(obs.set);

			var rv = inputField(name, desc, [
						cons(obs, {'class':'form-control col-xs-6'})
							.. @On('blur', function(e) { validate(latestValue); })
						,errorText(err)
				])
				.. @Class('has-error', err);
			rv.value = obs;
			return rv;
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

	var useSsh = Checkbox('ssh', 'Use SSH');
	var usernameInput = Input('username', 'User', @validate.required);
 
	container .. @appendContent(
		@Form([
			Input('name', 'Name', @validate.required),
			Input('host', 'Host', @validate.required),
			Input('port', 'Port', [@validate.optionalNumber, @validate.required]),
			useSsh,
			usernameInput .. @Class("hidden", useSsh.value .. @transform(x -> !x)),
			@Div(saveButton, {'class':'pull-right'}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle(),
		formBlock(errors, [[conf, current]])
	);
};

var fileBrowseCss = @CSS('
	.browse-display {
		background: white;
		border-radius: 4px;
		border: 1px solid #ccc;
	}

	.file-list {
		height: 20em;
		overflow:auto;
		margin:0;
		padding:0;

		li {
			list-style-type:none;
			margin:0;
			padding:0.3em 0.4em;
			overflow:hidden;
			display:block;
			&:last-child {
				border-bottom: none;
			}
			.glyphicon {
				font-size:0.9em;
				padding-right: 0.7em;
				padding-left: 0.3em;
				color: #bbb;
			}
			&.file {
				color: #888;
			}
			&.directory {
				cursor:pointer;
				font-weight:bold;
			}
		}
	}

	.top-bar {
		width:100%;
		height:2em;
		border-bottom: 1px solid #ddd;
		position:relative;
		overflow:hidden;

		.location {
			z-index:0;
			color: #777;
			width: 100%;
			padding-top: 0.2em;
			white-space: nowrap;
			direction:rtl;
			padding-left: 3em;
			padding-right:0.5em;
			display:block;
		}

		button {
			z-index:99;
			text-align:center;
			width: 2.5em;
			height: 2em;
			position: absolute;
			left:0;

			background:white;
			border:none;
			border-right: 1px solid #ccc;
			border-radius: 0;
			border-top-left-radius:4px;
			padding: 0.3em 0.8em;
		}
	}

	{
		
	}
');
var appConfigEditor = exports.appConfigEditor = function(parent, api, conf) {
	var { central, local } = conf;
	waitfor {
		var currentCentral = central .. @first();
	} and {
		var currentLocal = local .. @first();
	}
	var errors = @ObservableVar({});
	var {Input: LocalInput} = InputBuilder(currentLocal, errors);
	var {Input: CentralInput} = InputBuilder(currentCentral, errors);

	var currentDir = currentLocal.path;

	var Button = function(contents, action) {
		return @Button(contents) .. @OnClick({handle:@stopEvent}, action);
	};

	var fileSortOrder = function(a,b) {
		return @cmp(
			[a.directory ? 0 : 1, a.name],
			[b.directory ? 0 : 1, b.name]
		);
	};
	var browseFiles = function(parent) {
		var fileBrowser = api.fileBrowser(currentDir);
		var currentLocation = fileBrowser.location .. @mirror();
		var result = @Condition();

		var isConductanceDirectory = currentLocation .. @transform(
			loc -> loc.contents .. @find(entry -> entry.name === 'config.mho', null) !== null
		);

		return parent .. @appendContent(@Div([
			@P(@Strong("Local path:")),
			@Div([
				@Div([
						Button(@Icon("chevron-up"), -> fileBrowser.goUp()),
						currentLocation .. @transform(l -> `&lrm;${l.path}&lrm;`) .. @Class('location'),
					],
					{'class':'top-bar'}),
				@Ul(
					currentLocation .. @transform(function(loc) {
						return loc.contents .. @sort(fileSortOrder) .. @map(function(entry) {
							var isDirectory = entry.directory;
							console.log(entry);
							var rv = @Li([
									@Icon(isDirectory ? 'folder-open' : 'file'),
									entry.name
								], {'class':isDirectory ? "directory":"file"});
							if (isDirectory) {
								rv = rv .. @OnClick({handle:@stopEvent}, -> fileBrowser.goInto(entry.name));
							}
							return rv;
						});
					}),
					{'class':'file-list'}
				),
			], {'class':'browse-display'}),
			Button("cancel", -> result.set(currentDir)),
			Button("select", -> result.set((currentLocation .. @first()).path))
				.. @Enabled(isConductanceDirectory)
				.. @Attrib("title", isConductanceDirectory .. @transform(valid -> valid ? null : "This directory doesn't contain a config.mho file"))
			,
		]) .. @Class("file-browser") .. fileBrowseCss, -> result.wait());
	};

	parent .. @appendContent(
		@Form([
			CentralInput('name', 'Name', @validate.required) .. initialFocus('input'),
			LocalInput('path', 'Local path', @validate.required),
			Button("browse...", e -> browseFiles(e.target.parentNode)),
			@Div(saveButton, {'class':'pull-right'}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle(),
		formBlock(errors, [[central, currentCentral], [local, currentLocal]])
	);
};

exports.loginDialog = function(parent, conf, actions) {
	var current = conf .. @first();
	var originalValues = conf .. @first();
	var errors = @ObservableVar({});

	var {Input} = InputBuilder(current, errors);
	@info("Got server config:", current);

	var password = @ObservableVar();
	var userInput = Input('username', 'User', @validate.required);
	var passwordInput = Input('password', 'Password', @validate.required);
	var password = passwordInput.value;
	// if username is given, focus the password field
	if (current.username) passwordInput = passwordInput .. initialFocus();

	parent .. @appendContent(
		@Form([
			errorText(errors .. @transform(e -> e.global)),
			userInput,
			passwordInput,
			signupButton,
			@Div(loginButton, {'class':'pull-right'}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()) {|formElem|

		var credentials = -> [
			@first(userInput.value) || "",
			@first(password) || "",
		];
		
		var actionLoop = function(elem, events, actionName) {
			@assert.ok(actions[actionName]);
			elem .. @events(events, {handle:@stopEvent}) .. @each {||
				errors.modify(c -> c .. withoutKey('global'));
				if (hasErrors(errors)) continue;
				@info("performing #{actionName} action");
				var creds = credentials();
				try {
					var token = actions[actionName].apply(null, creds);
				} catch(e) {
					//@warn(String(e));
					errors.modify(c -> c .. @merge({global:e.message}));
					continue;
				}

				if (token) {
					creds.push(token);
					return creds;
				} else {
					errors.modify(c -> c .. @merge({global:"Invalid credentials"}));
					continue;
				}
			}
		};

		waitfor {
			return formElem .. actionLoop('submit', 'login');
		} or {
			return formElem.querySelector(".signup").. actionLoop('click', 'signup');
		}
	}
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
