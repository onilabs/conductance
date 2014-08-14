require('/modules/hub');
@ = require(['mho:std', 'mho:app', 'sjs:xbrowser/dom']);
@bridge = require('mho:rpc/bridge');
@form = require('./form');
@modal = require('./modal');
@user = require('seed:auth/user');
var { @route } = require('./my-route');
@logging.setLevel(@logging.DEBUG);

document.body .. @appendContent(@GlobalCSS("
	body {
		> .container {
			min-height: 500px;
			background: white;
			box-shadow: 0px 4px 20px rgba(0,0,0,0.3);
			padding-top: 1em;
		}
		background: #555562;
	}

	.clickable, a, button {
		cursor: pointer;
		&:hover {
			color: #b9090b;
		}
	}

	a.appLink, a.appLink:hover, a.appLink:visited {
		color:inherit;
	}
"));

var appListStyle = @CSS("
	{
		margin-top: 1em;
	}

	.glyphicon {
		float:right;
	}

	li {
		background: #f5f5f5;
		padding-left: 2em;
		font-size: 0.9em;
	}
	li:first-child {
		font-size: 1.1em;
		background: white;
		padding-left:1em;
	}
");

var appStyle = @CSS("
	.header .btn-group {
		float:right;
		//padding-top: 15px;
		font-size: 0.9em;
	}

	.log-panel .panel-heading {
		border-bottom-width: 0;
		border-bottom-left-radius:4px;
		border-bottom-right-radius:4px;
	}
	.log-panel.has-body .panel-heading {
		border-bottom-width: 1px;
		border-bottom-left-radius:0;
		border-bottom-right-radius:0;
	}

	.log-panel {
		margin-top: 5px;
		.panel-heading {
			padding: 10px;
			background-color: #fbfbfb;
			border-color: #DADADA;
		}
	}

	.log-panel .panel-body {
		padding:0;
		pre {
			margin:0;
			border: none;
			background: #444448;
			color: white;
			border-radius: 0;

			min-height: 50%;
			max-height: 500px;
			width: 100%;
			overflow:auto;
			white-space: pre;
			word-wrap: normal;
		}
	}
");

var constant = function(val) {
	return @Stream(emit -> (emit(val), hold()));
};

var confirmDelete = function(thing) {
	@modal.withOverlay({title:"Confirm Deletion"}) {|elem|
		elem .. @appendContent(`
			<div>
				<p>Really delete $thing?</p>
				<a class="btn pull-left btn-default">Cancel</a>
				<a class="btn pull-right btn-danger">Delete it</a>
			</div>
		`) {|elem|
			var buttons = elem.querySelectorAll('.btn');
			@assert.ok(buttons.length === 2, String(buttons.length));
			var cancel = buttons.item(0);
			var confirm = buttons.item(1);
			waitfor {
				cancel .. @wait('click');
				return false;
			} or {
				confirm .. @wait('click');
				return true;
			}
		}
	}
};

var appWidget = function(token, localApi, localServer, remoteServer, app) {
	@info("app: ", app);

	var endpoint = app.endpoint .. @mirror();

	var appState = @Stream(function(emit) {
		app.endpoint .. @each.track {|endpoint|
			if (!endpoint) {
				emit(endpoint);
			} else {
				try {
					endpoint.connect {|api|
						if (api.authenticate) api = api.authenticate(token);
						emit(api.getApp(app.id));
						hold();
					}
				} catch(e) {
					if (@bridge.isTransportError(e)) {
						@warn("lost connection to app slave");
						emit(null);
					} else {
						throw e;
					}
				}
			}
		}
	}) .. @mirror;

	var isRunning = @Stream(function(emit) {
		appState .. @each.track {|state|
			if (!state) {
				// could be either `null` (can't reach server) or `false` (not running; no server assigned)
				emit(state);
			} else {
				state.isRunning .. @each(emit);
			}
		}
	}) .. @mirror;


	var tailLogs = function(limit, block) {
		appState .. @each.track(function(state) {
			if (!state) hold();
			@info("tailing logs...");
			state.tailLogs(limit, block);
		});
	};

	var appNameStyle = @CSS("
		{
			white-space: nowrap;
			overflow:hidden;
		}
		.glyphicon {
			position: relative;
			top:0.2em;
		}
	");
	var appName = app.config .. @transform(a -> a.name);

	var statusClass = isRunning .. @transform(ok -> "glyphicon-#{ok ? "play" : ok === false ? "stop" : "flash"}");
	var statusColorClass = ['text-muted'] .. @concat(isRunning .. @transform(ok -> "text-#{ok ? "success" : ok === false ? "danger" : "warning"}"));

	// NOTE: isRunning can be `null`, in which case we don't know if the app is running (we can't reach the server)
	var disableStop = [true] .. @concat(isRunning .. @transform(ok -> ok !== true));
	var disableStart = [true] .. @concat(isRunning .. @transform(ok -> ok !== false));
	var endpointUnreachable = isRunning .. @transform(ok -> ok === null);
	var disableDeploy = [true] .. @concat(endpointUnreachable);

	var disabled = (elem, cond) -> elem .. @Class('disabled', cond);
	var logsVisible = @ObservableVar(false);
	var logDisclosureClass = logsVisible .. @transform(vis -> "glyphicon-chevron-#{vis ? 'up':'down'}");

	var hideXS = c -> @Span(c, {'class':'hidden-xs'});
	var appDetail = @Div(`
		<div class="header">

			<div class="btn-group">
				${@Button(["stop " .. hideXS, @Icon('stop')])  .. disabled(disableStop) .. @OnClick(-> app.stop())}
				${@Button(["start " .. hideXS, @Icon('play')]) .. disabled(disableStart) .. @OnClick(-> app.start())}
				${@Button(["deploy " .. hideXS, @Icon('cloud-upload')]) .. disabled(disableDeploy) .. @Mechanism(function(elem) {
					var click = elem .. @events('click');
					while(true) {
						click .. @wait();
						elem.disabled = true;
						try {
							@withBusyIndicator {||
								waitfor {
									localServer.deploy(app.id, @info);
								} or {
									click .. @wait();
									@warn("cancelled!");
								}
							}
						} finally {
							elem.disabled = false;
						}
					}
				})}
			</div>

			${@H3([
				@Span(null, {'class':'glyphicon'}) .. @Class(statusClass),
				`&nbsp;`,
				`<a class="appLink" href="${app.publicUrl}">$appName</a>`,
			]) .. @Class(statusColorClass) .. appNameStyle
			}
		</div>
		<div class="clearfix">
			${
			endpointUnreachable .. @transform(err -> err
			? `<div class="alert alert-warning" role="alert">Endpoint temporarily unreachable</div>`
			: @Div(`
				<div class="panel-heading">
					${@H3(
						[@Span(null, {'class':'glyphicon pull-right'}) .. @Class(logDisclosureClass),
						"Output"
						],
						{'class': "panel-title clickable"})
						.. @Mechanism(function(elem) {
							var clicks = elem .. @events('click', {handle:@stopEvent});
							var panelRoot = @findNode('.log-panel', elem);
							var container = panelRoot.querySelector('.panel-body');
							var hasBody = "has-body";
							var content = @Pre(null) .. @Mechanism(function(elem) {
								tailLogs(100) {|chunk|
									if (chunk == null) {
										@info("logs reset");
										elem.innerText = "";
									} else {
										var bottom = elem.scrollTop + elem.offsetHeight;
										var contentSize = elem.scrollHeight;
										var following = (bottom >= contentSize);
										elem.innerText += chunk;
										if (following) {
											elem.scrollTop = elem.scrollHeight;
										}
									}
								}
							});

							while(true) {
								if (!logsVisible.get()) {
									clicks .. @wait();
									logsVisible.set(true);
								}
								waitfor {
									container .. @appendContent(content, ->hold());
								} or {
									clicks .. @wait();
								}
								logsVisible.set(false);
							}
						})
					}
				</div>
				<div class="panel-body">
				</div>
			`, {'class':'log-panel panel panel-default'}) .. @Class('has-body', logsVisible)
			)}
		</div>
	`) .. appStyle();

	var detailShown = @route .. @transform(function(state) {
		var apps = state.apps;
		return apps .. @hasElem(app.id);
	});
	detailShown.get = -> detailShown .. @first();
	detailShown.set = function(val) {
		@route.modify(function(state, unmodified) {
			var apps = state.apps;
			var currently = apps .. @hasElem(app.id);
			if (val) {
				if (!currently) {
					return state .. @merge({apps: apps.concat([app.id])});
				}
			} else {
				var apps = apps.slice();
				if (currently) {
					apps .. @remove(app.id);
					return state .. @merge({apps:apps});
				}
			}
			return unmodified;
		});
	};

	var disclosureClass = detailShown .. @transform(
		shown -> 'glyphicon-chevron-' + (shown ? 'left' : 'right')
	);

	var listButton = function(content) {
		return @Li(content, {'class':'list-group-item clickable'});
	};

	return [
		@Div([
			@Ul([
				listButton([
					@Span(null, {'class':'glyphicon'}) .. @Class(disclosureClass),
					" ",
					@Div(appName) .. @Style("margin-right: 1.5em;overflow:hidden;"),
				]) .. @OnClick(function(btn) {
					detailShown.set(!detailShown.get());
				}) .. appNameStyle,
			
				listButton(['Settings', @Icon('cog')])
				.. @OnClick(function(e) {
					@modal.withOverlay({title:`$appName Settings`}) {|elem|
						elem .. @form.appConfigEditor(localApi, {
								central: app.config,
								local: localServer.appConfig(app.id),
							});
					}
				}),

				listButton(['Delete', @Icon('minus-sign')]) .. @OnClick(function() {
					if (!confirmDelete(appName)) return;
					@withBusyIndicator {||
						remoteServer.destroyApp(app .. @get('id'));
					}
				}),
			], {'class':'list-group'}) .. appListStyle(),
		], {'class':'col-sm-4'}),

		@Div(detailShown .. @transform(show -> show ? appDetail : null),
			{'class':'col-sm-8 app-detail'}),
	];
};

var showServer = function(token, localApi, localServer, remoteServer, container) {
	var apps = remoteServer.apps;

	var addApp = @Button([@Icon('plus'), ' new app']) .. @OnClick(function() {
		// make an in-memory config, and only save it to the server when
		// we submit the form
		var newConfig = {
			local: @ObservableVar({}),
			central: @ObservableVar({}),
		};
		@modal.withOverlay({title:`Create app`}) {|elem|
			if (elem .. @form.appConfigEditor(localApi, newConfig)) {
				@withBusyIndicator {||
					elem .. @appendContent(@P(`Creating ${newConfig.central.get().name}...`));
					var appInfo = localServer.addApp(newConfig.local.get());
					remoteServer.createApp(appInfo .. @get('id'), newConfig.central.get());
				}
			}
		}
	});

	container .. @appendContent(
		@Div(
			@Div([
				addApp,
				@Button(@Icon('off'), {'class':'disconnect'})
			], {'class':'btn-group center'}) .. @Style('margin-top: 15px;')
		)) {|container|

		var disconnectButton = container.querySelector('.disconnect');
		waitfor {
			while(true) {
				try {
					container .. @appendContent(apps .. @transform(function(apps) {
						var appWidgets = apps .. @map(app ->
							@Div(appWidget(token, localApi, localServer, remoteServer, app), {'class':'row'})
						);
						return appWidgets;
					}), -> hold());
					break;
				} catch(e) {
					console.error("Error in app display: #{e}");
					var msg = e.message;
					var retry = @Emitter();
					container .. @appendContent(@Div([
						@H3(`Uncaught Error: ${msg}`),
						@P(@Button("Try again...", {'class':'btn-danger'}) .. @OnClick({handle:@stopEvent}, -> retry.emit()))
					]), -> retry .. @wait());
				}
			}
		} or { disconnectButton .. @wait('click'); }
	}
};

@withBusyIndicator {|ready|
	// NOTE: we explicitly use /remote.api, not ./remote
	// (this module might live on the master, which does NOT provide remote.api)
	@withAPI('/remote.api') {|api|
		var serverEq = function(a, b) {
			return a == b || (a ? a.id) == (b ? b.id);
		};

		var activeServer = @observe(@route, api.servers, function(state, servers) {
			var id = state.server;
			if (!id) return null;
			return servers .. @find(s -> s.id === id, null);
		}) .. @dedupe;
		activeServer.get = -> activeServer .. @first();
		activeServer.set = val -> @route.set({server: val ? val.id : null});

		var displayCurrentServer = function(elem) {
			activeServer .. @each.track(function(server) {
				if (!server) {
					elem .. @appendContent(`<h1>Click something!</h1>`, ->hold());
				}

				var id = server.id;
				elem .. @appendContent(@Div(null)) {|elem|
					var initialConfig = server.config .. @first();
					var token = initialConfig.ssh || initialConfig.token;
					var updateToken = function(newToken) {
						server.config.modify(c -> c .. @merge({token: newToken}));
						token = newToken;
					};

					try {
						while(true) {
							@info("Connecting to server #{id}");
							try {
								var localServer = api.getServer(id);
								localServer.endpoint.connect {|remoteServer|
									@debug("Connected to server:", remoteServer);
									if (remoteServer.authenticate) {
										while (!token) {
											@info("Getting auth token...");
											var username, password;
											var loginResult = @modal.withOverlay({title:initialConfig.name}) {|elem|
												@form.loginDialog(elem, server.config, {
													login: function(username, password) {
														withBusyIndicator {||
															return remoteServer.getToken(username, password);
														}
													},
													signup: function(username, password) {
														withBusyIndicator {||
															localServer.endpoint.relative('/user.api').connect {|auth|
																return auth.createUser(username, password);
															}
														}
													},
												});
											};
											if (!loginResult) {
												activeServer.set(null);
												break;
											}

											[username, password, token] = loginResult;

											server.config.modify(existing -> existing .. @merge({
													token:token,
													username: username
												}));
											@debug("Is authenticated:", token);
										}
										remoteServer = remoteServer.authenticate(token);
									}
									showServer(token, api, localServer, remoteServer, elem);
								}
								break;
							} catch(e) {
								if(!@user.isAuthenticationError(e)) throw e;
								@info("Login required");
								updateToken(null);
							}
						}
						activeServer.set(null);
					} catch(e) {
						activeServer.set(null);
						throw e;
					}
				};
			});
		};

		var buttons = api.servers .. @transform(function(servers) {
			return servers .. @map(function(server) {
				@info("Server: ", server);
				var serverName = server.config .. @transform(s -> s.name);
				var button = @A(serverName) .. @OnClick(function(evt) {
					activeServer.set(server);
				});

				var dropdownItems = @Li([
					@A(@Span(null, {'class':'caret'}), {'class':'dropdown-toggle', 'data-toggle':'dropdown'}),
					@Ul([
						@A([@Icon('cog'), ' Settings']) .. @OnClick(function(e) {
							@modal.withOverlay({title:`Server Settings`}) {|elem|
									elem .. @form.serverConfigEditor(server.config);
							}
						}),
						@A([@Icon('remove'), ' Delete']) .. @OnClick(function() {
							if (!confirmDelete(`server $serverName`)) return;
							@withBusyIndicator {||
								server.destroy();
							}
						}),
						@A([@Icon('log-out'), ' Log out']) .. @OnClick(function() {
							server.config.modify(function(conf) {
								conf = conf .. @clone();
								delete conf['token'];
								return conf;
							});
							if (activeServer.get() === server) activeServer.set(null);
						}) .. @Class('hidden', server.config .. @transform(c -> !c .. @hasOwn('token'))),
					], {'class':'dropdown-menu'}),
				], {'class':'dropdown'});

				return @Li([button, dropdownItems])
					.. @Class('active', activeServer .. @transform(s -> serverEq(s, server)));
			});
		});

		var addServer = @Li(@A(@Icon('plus-sign')) .. @OnClick(function() {
			api.createServer({name:"TODO"});
		}));

		var serverList = buttons .. @transform(function(buttons) {
			return @Ul(buttons.concat([addServer]), {'class':'nav nav-tabs'});
		});

		@mainContent .. @appendContent([
			serverList,
			@Div(),
		]) {|_, content|
			ready();
			displayCurrentServer(content),
			hold();
		}
	}
}
