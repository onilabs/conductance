@ = require(['mho:std', 'mho:app', './busy-indicator']);
@bridge = require('mho:rpc/bridge');
@validate = require('seed:validate');
@form = require('./generic-form');
@auth = require('seed:auth');

var formStyle = @CSS('{
	.btn.pull-right {
		margin-left:5px;
	}
	.well hr {
		margin: 10px 0;
		border-color: #e7e7e7;
	}
}');
var saveButton = `<button type="submit" class="btn btn-primary">Save</button>`;
var loginButton = `<button type="submit" class="btn btn-primary">Log in</button>`;
var signupButton = `<button type="submit" class="btn btn-success signup">Sign up</button>`;

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
				cons(field.value, {'class':'form-control', 'name':field.name}),
				extras.after,
			], {'class':'input-group'}),
			field.error .. @form.formatError,
		]
	};
};

function formControl(form, cons) {
	return function(field) {
		return [
			cons(field.value, {'class':'form-control', 'name':field.name}),
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
		var newvals = @withoutBusyIndicator( -> form.wait(elem));
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

var showServiceUI = false;
var availableServices = [
	{
		id: 'mandrill',
		name: "Mandrill",
		info: `<a href="https://mandrill.com/">Mandrill</a> email service`,
		form: function(form) {
			var TextInput = form .. formControl(@TextInput);
			return [
				formGroup('API Key', TextInput, form.field('apikey'))
			];
		},
		config: function(values) {
			return {
				MANDRILL_API_KEY: values.apikey,
			};
		},
	},

	{
		id: 'seed-db',
		name: "Seed DB",
		info: `Conductance Seed database`,
		form: function(form) {
			return [
				formGroup('Enable', form .. formControl(@Checkbox), form.field('enable'))
			];
		},
		config: function(values) {
			var rv = {};
			if(values.enable) {
				rv.SEED_DB = 'TODO';
			}
			return rv;
		},
	},
];

var ServiceOption = function(s, n) {
	return {
		service: s,
		toString: -> n || s.name,
	};
}

var browserUI = function(showBrowser, pathField, entireForm) {
	return showBrowser .. @transform(function(show) {
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
					Button('Cancel', -> showBrowser.set(false)) .. @Class('pull-right btn'),
					@P(' ',{'class':'clearfix'}),
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
				)
			];
		}
	});
};

var appConfigEditor = exports.appConfigEditor = function(parent, api, conf, extraActions) {
	var { central, local } = conf;
	waitfor {
		var currentCentral = central .. @first();
	} and {
		var currentLocal = local .. @first();
	}

	var centralForm = @form.Form(central .. @first());
	var currentServiceSettings = currentCentral.service || {};
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
		validate: -> [centralForm, localForm]
			.. @concat(enabledServices .. @first() .. @map(s -> s.form))
			.. @all(f -> f.validate()),
	};

	var TextInput = entireForm .. formControl(@TextInput);
	var Checkbox = entireForm .. formControl(@Checkbox);
	var showBrowser = @ObservableVar(false);
	var pathField = localForm.field('path');

	var enabledServiceKeys = centralForm.field('services', {'default':[]});
	var serviceCache = { };
	var service = function(service) {
		if(!serviceCache .. @hasOwn(service.id)) {
			var form = @form.Form(currentServiceSettings[service.id] || {});
			serviceCache[service.id] = {
				id: service.id,
				info: service.info,
				form: form,
				env: () -> service.config(form.values()),
				ui: service.form(form),
			};
		}
		console.log("service(#{service.id}) -> ", serviceCache[service.id]);
		return serviceCache[service.id];
	};
	var enabledServices = enabledServiceKeys.value .. @transform(enabled ->
		availableServices .. @filter(s -> enabled .. @hasElem(s.id)) .. @map(service)
	);

	var disabledServices = enabledServiceKeys.value .. @transform(enabled ->
		availableServices .. @filter(s -> !enabled .. @hasElem(s.id)) .. @toArray);
	var showServiceDropdown = disabledServices .. @transform(s -> s.length > 0) .. @dedupe();

	var serviceDropdown = showServiceDropdown .. @transform(function(show) {
		if(!show) return null;
		var selected = @ObservableVar();
		var select = @Select({
			items: disabledServices .. @transform(function(services) {
				return [ServiceOption(null, 'Add a new service')].concat(services .. @map(ServiceOption));
			}),
			selected: selected,
		}) .. @Class(['form-control', 'pull-right']);

		var btn = Button("Add", function(e) {
			e .. @stopEvent();
			var service = selected.get().service;
			if(service === null) return;
			enabledServiceKeys.value.set(enabledServiceKeys.value.get() .. @union([service.id]));
		}, {'class':'btn btn-success pull-right' }
		) .. @Attrib('disabled', selected .. @transform(sel -> !(sel && sel.service)));

		return @Div([ btn, select, ]) .. @CSS('select {
			width:auto;
			display:inline-block;
			margin-right:10px;
		}');
	});

	parent .. @appendContent(
		@Form([
			localForm.error .. @form.formatErrorAlert,
			formGroup('Name', TextInput, centralForm.field('name', {validate: [@validate.required, @validate.appName]})) .. initialFocus('input'),
			browserUI(showBrowser, pathField, entireForm),

			showServiceUI ? [
				@Hr(),
				serviceDropdown,
				@H4("Services", {'class':'services', 'style':'padding-top:10px;'}),
				@P("", {'class':'clearfix'}),
				//@Pre(enabledServiceKeys.value .. @transform(JSON.stringify)),
				enabledServices .. @transform(services -> services.length > 0 ? @Div(
					services .. @map(i -> [
						@P([
							@A(@Icon("remove"), {'class':'pull-right'})
								.. @OnClick({handle:@stopEvent}, -> enabledServiceKeys.value.set(
									enabledServiceKeys.value.get() .. @difference([i.id])
								)
							),
							i.info,
						]),
						service(i).ui .. @Class('clearfix'),
					]) .. @intersperse(@Hr()) .. @toArray,
				{'class':'well well-sm'})
				: @Hr()),
			],

			showBrowser .. @transform(show -> show ? [] : [
				@Div(saveButton, {'class':'pull-right'}),
				extraActions,
			]),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()
	) {
		|elem|
		elem .. @events('submit', {handle:@stopEvent}) .. @each {||
			if(!entireForm.validate()) continue;
			@withBusyIndicator {||
				waitfor {
					var newConfig = @merge(
						centralForm.values(),
						{
							'service': enabledServices .. @first()
								.. @map(service -> [service.id, service.form.values()])
								.. @pairsToObject(),
							'environment': enabledServices .. @first()
								.. @map(service -> service.env())
								.. @merge(),
						}
					);
					@info("modifying central config: ", newConfig);
					central.modify(v -> v .. @merge(newConfig));
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
	var form = @form.Form(current);

	var TextInput = form .. formControl(@TextInput);
	var PasswordInput = form .. formControl(-> @TextInput.apply(null, arguments) .. @Attrib('type', 'password'));

	var userField = form.field('username', {validate:[@validate.required, @validate.username]});
	var passwordField = form.field('password', { validate: @validate.required });

	var passwordInput = formGroup('Password', PasswordInput, passwordField);
	// if username is given, focus the password field
	if (current.username) passwordInput = passwordInput .. initialFocus('input');

	var isSignup = @ObservableVar(false);
	var isLogin = isSignup .. @transform(x -> !x);
	var emailField = form.field('email', {validate:
		@validate.onlyWhen(isSignup, [@validate.required, @validate.email])
	})
	var emailInput = formGroup('Email', TextInput, emailField);
	var resentConfirmation = @ObservableVar(false);

	var signupOnly = el -> el .. @Class('hidden', isLogin);
	var loginError = `<strong>Invalid credentials</strong>.<br/>
		If you have just registered, make sure you have confirmed your email address.
		${@observe(userField.value, resentConfirmation, function(user, alreadySent) {
			if(user) return [
				@Br(),
				!alreadySent ? @A('Resend confirmation email') .. @OnClick({handle:@stopEvent}, function() {
						actions.resendConfirmation(user);
						resentConfirmation.set(true);
					})
			];
		})}
	`;
	function toggleSignup() {
		isSignup.set(!isSignup.get());
		form.error.set(null);
	};

	var values;
	var login = function(values) {
		values.token = actions.login(values);
		return values;
	};

	parent .. @appendContent(
		@Form([
			form.error .. @form.formatErrorAlert,
			formGroup('User', TextInput, userField),
			emailInput .. signupOnly(),
			passwordInput,
			@Div([
				@Div(isSignup .. @transform(signup -> signup
					? signupButton
					: loginButton
				), {'class':'pull-right'}),
				@P(@A(isSignup .. @transform(signup -> signup
					? `&laquo; login`
					: `&raquo; register new account`
				),{'class':'clickable'}) .. @OnClick(toggleSignup)),
			]),
		] , {'class':'form-horizontal', 'role':'form'}) .. formStyle()
	) {|formElem|

		while(true) {
			try {
				values = @withoutBusyIndicator( -> formElem .. form.wait());
				if (isSignup.get()) {
					actions.signup(values);
					break;
				} else {
					return login(values);
				}
			} catch(e) {
				@warn("Caught error: #{e}");
				if(@auth.isAuthenticationError(e)) form.error.set(loginError);
				else if(@bridge.isTransportError(e)) throw e;
				else form.error.set(e.message);
			}
		}
	}

	var message = @ObservableVar(`
		<h3>Nearly there!</h3>
		<p>
			We've sent a confirmation email to <strong>${values.email}</strong> with
			your activation code. You'll need to visit the link in that email before
			continuing.
		</p>
		<p>
		${@Button('Done', {'class':'btn-primary'})}
	`);
	parent .. @appendContent(@Div(message) .. @CSS('h1,h2,h3 { margin-top:0; }')) {|elem|
		while(true) {
			@withoutBusyIndicator( -> elem.querySelector('button') .. @wait('click'));
			try {
				return login(values);
			} catch(e) {
				if (@auth.isAuthenticationError(e)) {
					message.set(`
						<h3>Login failed.</h3>
						<p>
							Oops - that didn't seem to work.
						</p>
						<p>
							Please make sure you've clicked the confirmation link we emailed you.
						</p>
						${@Button('Try again...', {'class':'btn-primary'})}
					`);
				} else { throw e }
			}
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
