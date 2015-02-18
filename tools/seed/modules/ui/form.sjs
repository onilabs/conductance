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

function formControl(form, cons, cls) {
	return function(field) {
		return [
			cons(field.value, {'class':cls === false ? '' : 'form-control', 'name':field.name}),
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

var Button = function(contents, action, attrs) {
	return @Button(contents, attrs) .. @OnClick({handle:@stopEvent}, action);
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
		// there are no `fs` options - if it's present, it's enabled
		id: 'fs',
		name: "Seed persistence",
		info: `Persistent filesystem & DB access: <strong>enabled</strong>`,
		form: function(form) {
			return [];
		},
		config: function(values) {
			return {enable: true};
		},
	},

	{
		id: 'mandrill',
		name: "Mandrill email API",
		info: `Store mandrill API key`,
		form: function(form) {
			var TextInput = form .. formControl(@TextInput);
			return [
				formGroup('API Key', TextInput, form.field('apikey'))
			];
		},
		env: function(vals) {
			return {'mandrill-api-key': vals.apikey};
		},
	},

	(function() {
		var types = {
			string: x -> x,
			'boolean': Boolean,
			'JSON': JSON.parse,
		};
		// used for both validation and storing
		var processField = function(field) {
			var t = field .. @get('type');
			var v = field .. @get('value');
			var conversion = types[t];
			if(!conversion) throw new Error("Unknown type: #{t}");
			try {
				return conversion(v);
			} catch(e) {
				throw new Error("Invalid #{t}");
			}
		};

		return {
			id: 'env',
			name: "Custom settings",
			info: `Add custom values to <code>mho:env</code>:`,
			form: function(form) {

				var fieldsField = form.field('fields', {
					'default': [],
				});
				var fields = fieldsField.value;

				// note: we store an in-memory cache of observables
				// corresponding to each element in `fields`, generated
				// on-demand. We never mutate `fields` aside from appending
				// more, and the current value of `fields` is only used to
				// seed the initial observable. Upon form submission, the
				// values are retrieved from this cache, instead of `fields`.
				//
				// This is all so that we have a stable form while filling it
				// out, since the entire form is regenerated each time
				// `fields` is modified.
				var editedValues = [];
				var editableField = function([i, initial]) {
					@assert.number(i);
					@assert.ok(initial);
					var rv = editedValues[i];
					if(!rv) {
						initial = { type: 'string', value: null} .. @merge(initial);
						var obs = @ObservableVar(initial);
						var form = @form.Form(obs,
							{ validate: [processField, uniqueField] }
						);
						var TextInput = form .. formControl(@TextInput);

						var key = form.field('key');
						var value = form.field('value');
						var type = form.field('type');
						var valueWidget = type.value .. @transform(function(type) {
							var cons;
							switch(type) {
								case 'string':
									cons = @TextInput;
									break;
								case 'boolean':
									cons = @Checkbox;
									break;
								case 'JSON':
									cons = @TextArea;
									break;
								default: throw new Error("Unknown type #{type}");
							}
							return cons(value.value, {'class':'form-control', 'name':'value'});
						});

						var widget = @Form(`
									${form.error .. @form.formatError()}
									${@A(@Icon("remove"), {'class':'remove'}) .. @OnClick({handle:@stopEvent}, -> obs.modify(c -> c .. @merge({deleted:true})))}
									${@Select({items: ['string','boolean','JSON'], selected:type.value}, {name: 'type'})}
									${TextInput(key, {validate: @validate.required})}&nbsp;=&nbsp;${valueWidget}
								`,
								{'class':"form-group editable-field"})
						.. @Class('hidden', obs .. @transform(o -> o.deleted))
						.. @OnSubmit({handle:@stopEvent}, -> form.validate());

						rv = editedValues[i] = {
							value: obs,
							form: form,
							widget: widget,
						};
					}
					return rv;
				}

				var editableFields = function(fields) {
					fields .. Array.isArray() .. @assert.ok(`Not an array: $fields`);
					return fields .. @indexed .. @transform(editableField);
				}

				var activeEditableFields = fields .. @transform(fields -> fields
					.. editableFields
					.. @filter(editable -> !editable.value.get().deleted)
				);

				var uniqueKey = function(key) {
					// NOTE: we validate against the current editableField
					// values, not whatever's stored in the DB. Otherwise
					// you would have to save the form and reopen it before
					// recreating a deleted key (and other weirdness)
					@validate.required(key);
					if (activeEditableFields
						.. @first()
						.. @transform(field -> field.value.get() .. @get('key'))
						.. @hasElem(key)
					) {
						throw new Error("Duplicate key `#{key}`");
					}
				}

				var uniqueField = function(vals) {
					var key = vals .. @get('key');
					var count = activeEditableFields .. @first
						.. @filter(form -> form.value.get() .. @get('key') === key)
						.. @count();
					if(count > 1) throw new Error("Duplicate key");
				};

				var creationForm = @form.Form({});

				var rv = (function(form) {
					var TextInput = form .. formControl(@TextInput);
					var add = function(e) {
						if(!form.validate()) return;
						var newField = form.values();
						if(fields.modify(function(current, unchanged) {
							@info("Adding field:", newField);
							return current.concat([newField]);
						})) {
							form.fields .. @each(f -> f.value.set(null));
						}
					};

					var addButton = @A([@Icon('plus-sign'), 'add']) .. @OnClick({handle:@stopEvent}, add);

					return [@Form([
						fieldsField.error .. @form.formatErrorAlert(),
						form.error .. @form.formatError(),

						@Div([
							@Div(`<label for="key">Add key:</label>
									$TextInput(form.field('key', {
										validate: [@validate.required, uniqueKey]
									}))
									$addButton
								`,
								{'class':"form-group"}),
						], {'class':'col-xs-12'}),
					], {'class':'form-inline add-field'}) .. @OnSubmit({handle:@stopEvent}, add)];
				})(creationForm);

				rv.push(fields .. @transform(function(fields) {
					if(fields.length == 0) return null;
					return @Div(fields .. editableFields .. @map({widget} -> widget),
						{'class':'form-inline'});
				}));

				// XXX this is a little hacky. Because our values are split out amongst multiple forms,
				// we'll override the field's `values` and `validate` methods to collate the
				// actual values from each active field.
				fieldsField.validate = function() {
					// field is valid if all editable fields are valid (ignoring deleted ones)
					return activeEditableFields
						.. @first()
						// NOTE: we eagerly validate, so that all field
						// error messages are updated
						.. @map(val -> val.form.validate())
						.. @all();
				};
				fieldsField.value = activeEditableFields .. @transform(fields -> fields
					.. @transform(editable -> editable.value.get())
					.. @sortBy(field -> field.key)
					.. @toArray()
				);

				return rv;
			},
			env: function(values) {
				return values .. @get('fields', []) .. @map(function(field) {
					return [field.key, processField(field)];
				}) .. @pairsToObject();
			},
		}
	})(),


];

var ServiceOption = function(s, n) {
	return {
		service: s,
		toString: -> n || s.name,
	};
}

var browserUI = function(showBrowser, api, Button, pathField, entireForm) {
	var fileSortOrder = function(a,b) {
		return @cmp(
			[a.directory ? 0 : 1, a.name],
			[b.directory ? 0 : 1, b.name]
		);
	};

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
	var currentServiceSettings = currentCentral .. @getPath(['service', 'form'], {});
	var localForm = @form.Form(currentLocal, {validate: function(vals) {
		if(!vals.path) throw new Error("Local path is required");
	}});

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
				serviceData: service.serviceData || -> null,
				env: service.env || -> null,
				ui: service.form(form),
			};
		}
		//console.log("service(#{service.id}) -> ", serviceCache[service.id]);
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
			var service = selected.get().service;
			if(service === null) return;
			enabledServiceKeys.value.set(enabledServiceKeys.value.get() .. @union([service.id]));
		}, {'class':'btn btn-success pull-right add-service' }
		) .. @Attrib('disabled', selected .. @transform(sel -> !(sel && sel.service)));

		return @Div([ btn, select, ]) .. @CSS('select {
			width:auto;
			display:inline-block;
			margin-right:10px;
		}');
	});

	var submit = @Emitter();
	parent .. @appendContent(
		@Div([
			localForm.error .. @form.formatErrorAlert,
			@Form([
				formGroup('Name', TextInput, centralForm.field('name', {validate: [@validate.required, @validate.appName]})) .. initialFocus('input'),
				browserUI(showBrowser, api, Button, pathField, entireForm),
			], {'class':'mainSettings'}),

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
						@Div(service(i).ui, {'class':"clearfix svc-form-#{i.id}"}),
					]) .. @intersperse(@Hr()) .. @toArray,
				{'class':'well well-sm'})
				: @Hr()),
			],

			showBrowser .. @transform(show -> show ? [] : [
				@Div(Button('Save', -> submit.emit(), {'class':'btn btn-primary'}), {'class':'pull-right'}),
				extraActions,
			]),
		] , {'class':'form form-horizontal', 'role':'form'}) .. formStyle()
	) {
		|elem|
		var mainFormSubmissions = elem.querySelector('form.mainSettings')
			.. @events('submit', {handle:@stopEvent});
		@combine(submit, mainFormSubmissions) .. @each {||
			if(!entireForm.validate()) continue;
			@withBusyIndicator {||
				waitfor {
					var serviceValues = enabledServices .. @first()
						.. @map(service -> [service, service.form.values()]);

					var newConfig = @merge(
						centralForm.values(),
						{
							service: {
								form: serviceValues .. @map([s, vals] -> [s.id, vals]) .. @pairsToObject,
								data: serviceValues .. @map([s, vals] -> [s.id, s.serviceData(vals)]) .. @filter(pair -> pair[1] !== null) .. @pairsToObject,
								env: serviceValues .. @map([s, vals] -> s.env(vals)) .. @merge,
							}
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
