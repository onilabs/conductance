@ = require(['mho:std', 'mho:app']);
@validate = require('seed:validate');
@form = require('./generic-form');

var formStyle = @CSS('{ }');
var saveButton = `<button type="submit" class="btn btn-primary">Save</button>`;
var loginButton = `<button type="submit" class="btn btn-primary">Connect</button>`;
var signupButton = `<a class="btn btn-success signup">Sign up</a>`;

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

function formControlGroup(form, cons, extras) {
	return function(field) {
		return [
			@Div([
				extras.before,
				cons(field.value, {'class':'form-control'}) .. @On('blur', field.validate),
				extras.after,
			], {'class':'input-group'}),
			field.error .. @form.formatError,
		]
	};
};

function formControl(form, cons) {
	return function(field) {
		return [
			cons(field.value, {'class':'form-control'}) .. @On('blur', field.validate),
			field.error .. @form.formatError,
		];
	};
};

var formGroup = function(desc, cons, val) {
	return @Div(`<label for="${val.name}" class="col-xs-4">$desc:</label>
		<div class="col-xs-8">
			$cons(val)
		</div>`,
		{'class':"form-group"});
};

var serverConfigEditor = exports.serverConfigEditor = function(container, conf) {
	var current = conf .. @first();
	@info("Got server config:", current);
	var form = @form.Form(current);
	var Input = form .. formControl(@TextInput);
	var Checkbox = form .. formControl(@Checkbox);

	var useSsh = form.field('ssh', {validate: @assert.bool, transform: x -> x === undefined ? false : x });
	var usernameInput = formGroup('User', Input, form.field('username'));
 
	container .. @appendContent(
		@Form([
			formGroup('Name', Input, form.field('name', {validate:@validate.required})) .. initialFocus('input'),
			formGroup('Host', Input, form.field('host', {validate:@validate.required})),
			formGroup('Port', Input, form.field('port', {validate:[@validate.required, @validate.optionalNumber]})),
			formGroup('Use SSH', Checkbox, useSsh),
			usernameInput .. @Class("hidden", useSsh.value .. @transform(x -> !x)),
			@Div(saveButton, {'class':'pull-right'}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()
	) {|elem|
		var newvals = form.wait(elem);
		conf.modify(current -> current .. @merge(newvals));
	};
};

var fileBrowseCss = @CSS('
	.browse-display {
		clear:both;
		background: white;
		border-radius: 4px;
		border: 1px solid #ccc;
		margin-bottom: 15px;
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
			max-width: 100%;
			padding-top: 0.2em;
			white-space: nowrap;
			direction:rtl;
			text-align:left;
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
');
var appConfigEditor = exports.appConfigEditor = function(parent, api, conf) {
	var { central, local } = conf;
	waitfor {
		var centralForm = @form.Form(central .. @first());
	} and {
		var currentLocal = local .. @first();
	}

	var localForm = @form.Form(currentLocal, {validate: function(vals) {
		if(!vals.path) throw new Error("Local path is required");
	}});

	var Button = function(contents, action, attrs) {
		return @Button(contents, attrs) .. @OnClick({handle:@stopEvent}, action);
	};

	var fileSortOrder = function(a,b) {
		return @cmp(
			[a.directory ? 0 : 1, a.name],
			[b.directory ? 0 : 1, b.name]
		);
	};

	var entireForm = {
		validate: -> [centralForm, localForm] .. @all(f -> f.validate()),
	};

	var TextInput = entireForm .. formControl(@TextInput);
	var Checkbox = entireForm .. formControl(@Checkbox);
	var showBrowser = @ObservableVar(false);
	var pathField = localForm.field('path');

	parent .. @appendContent(
		@Form([
			localForm.error .. @form.formatError,
			formGroup('Name', TextInput, centralForm.field('name', {validate: @validate.required})) .. initialFocus('input'),

			showBrowser .. @transform(function(show) {
				if (show) {
					@warn("starting file browser at #{pathField.value.get()}");
					var fileBrowser = api.fileBrowser(pathField.value.get());
					var currentLocation = fileBrowser.location .. @mirror();
					//var isConductanceDirectory = currentLocation .. @transform(
					//	loc -> loc.contents .. @find(entry -> entry.name === 'config.mho', null) !== null
					//);
					function select() {
						pathField.value.set((currentLocation .. @first()).path);
						showBrowser.set(false);
					};
					return @Div(@Form([
							Button("x", -> showBrowser.set(false)) .. @Class('pull-right btn btn-xs'),
							@P(@Strong("Local path:")),
							@Div([
								@Div([
										Button(@Icon("chevron-up"), -> fileBrowser.goUp()),
										//Button(@Icon("home"), -> fileBrowser.goHome()),
										currentLocation .. @transform(l -> `&lrm;${l.path}&lrm;`) .. @Class('location'),
									],
									{'class':'top-bar'}),
								@Ul(
									currentLocation .. @transform(function(loc) {
										return loc.contents .. @sort(fileSortOrder) .. @map(function(entry) {
											var isDirectory = entry.directory;
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
							Button("Select", select, {'class':'pull-right btn-primary'}) /* .. @Enabled(isConductanceDirectory) */,
						], {'role':'form'}),
						{'class':'file-browser'}) .. fileBrowseCss;
				} else {
					return [
						formGroup(
							'Local path',
							entireForm .. formControlGroup(@TextInput,
								{after: @Span(
									@A('...', {'class':'btn btn-default'}) .. @OnClick({handle:@stopEvent}, -> showBrowser.modify(c -> !c)),
									{'class':'input-group-btn'})
								}
							),
							pathField
						),
						@Div(saveButton, {'class':'pull-right'}),
					];
				}
			}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()
	) {
		|elem|
		elem .. @events('submit', {handle:@stopEvent}) .. @each {||
			if(!entireForm.validate()) continue;
			@withBusyIndicator {||
				waitfor {
					@warn("modifying central config: ", centralForm.values());
					central.modify(v -> v .. @merge(centralForm.values()));
				} and {
					@warn("modifying local config: ", localForm.values());
					local.modify(v -> v .. @merge(localForm.values()));
				}
			}
			return true;
		}
	}
};

exports.loginDialog = function(parent, conf, actions) {
	var current = conf .. @first();
	@info("Got server config:", current);
	var password = @ObservableVar();
	var form = @form.Form(current);

	var TextInput = form .. formControl(@TextInput);

	var userField = form.field('username', {validate:@validate.required});

	var passwordField = @form.Field(password, {
		source: password,
		form: form,
		validate: @validate.required,
	});

	var passwordInput = formGroup('Password', TextInput, passwordField);
	// if username is given, focus the password field
	if (current.username) passwordInput = passwordInput .. initialFocus('input');

	parent .. @appendContent(
		@Form([
			form.error .. @form.formatError,
			formGroup('User', TextInput, userField),
			passwordInput,
			signupButton,
			@Div(loginButton, {'class':'pull-right'}),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()
	) {|formElem|

		var credentials = -> [
			@first(userField.value) || "",
			@first(password) || "",
		];
		
		var actionLoop = function(elem, events, actionName) {
			@assert.ok(actions[actionName]);
			elem .. @events(events, {handle:@stopEvent}) .. @each {||
				form.error.set(null);
				if(!form.validate()) continue;
				@info("performing #{actionName} action");
				var creds = credentials();
				try {
					var token = actions[actionName].apply(null, creds);
				} catch(e) {
					//@warn(String(e));
					form.error.set(e.message);
					continue;
				}

				if (token) {
					creds.push(token);
					return creds;
				} else {
					form.error.set("Invalid credentials");
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
