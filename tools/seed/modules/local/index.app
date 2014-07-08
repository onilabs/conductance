/**
 @template-show-busy-indicator
*/
require('/modules/hub');
@ = require(['mho:std', 'mho:app', 'sjs:xbrowser/dom']);
@form = require('./form');
@user = require('seed:auth/user');
@logging.setLevel(@logging.DEBUG);

document.body .. @appendContent(@GlobalCSS("
	body {
		.container {
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

var appWidget = function(token, localServer, remoteServer, app) {
	@info("app: ", app);

	var endpoint = app.endpoint .. @mirror();

	var appState = @Stream(function(emit) {
		app.endpoint .. @each.track {|endpoint|
			waitfor {
				if (endpoint === null) {
					emit(null);
				} else {
					console.log("got new endpoint:", endpoint);
					try {
						endpoint.connect {|api|
							if (api.authenticate) api = api.authenticate(token);
							console.log("EMITTING ENDPOINT");
							emit(api.getApp(app.id));
							hold();
						}
					} finally {
						console.log("ENDPOINT DONE");
					}
				}
			} or {
				app.endpoint .. @skip(1) .. @wait();
				@info("switching to new endpoint...");
			}
		}
	}) .. @mirror;

	var pid = appState .. @transform(state -> state == null ? [null] : state.pid) .. @concat;

	var tailLogs = function(limit, block) {
		appState .. @each.track(function(state) {
			if (!state) hold();
			@info("tailing logs...");
			state.tailLogs(limit, block);
		});
	};

	var appName = app.config .. @transform(a -> a.name);

	var statusClass = pid .. @transform(pid -> "glyphicon-#{pid === null ? "stop" : "play"}");
	var statusColorClass = pid .. @transform(pid -> "text-#{pid === null ? "danger" : "success"}");

	var statusIcon = pid .. @transform(pid ->
		pid == null
		? @Span(null, {'class':'glyphicon glyphicon-stop text-danger'})
		: @Span(null, {'class':'glyphicon glyphicon-play text-success'})
	);
	var isRunning = pid .. @transform(pid -> pid != null);
	var isStopped = pid .. @transform(pid -> pid == null);
	var disabled = (elem, cond) -> elem .. @Class('disabled', cond);
	var logsVisible = @ObservableVar(false);
	var logDisclosureClass = logsVisible .. @transform(vis -> "glyphicon-chevron-#{vis ? 'up':'down'}");

	var appDetail = @Div(`
		<div class="header">

			<div class="btn-group">
				${@Button(["stop ", @Icon('stop')])  .. disabled(isStopped) .. @OnClick(-> app.stop())}
				${@Button(["start ", @Icon('play')]) .. disabled(isRunning) .. @OnClick(-> app.start())}
				${@Button(["deploy ", @Icon('cloud-upload')]) .. @Mechanism(function(elem) {
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
			]) .. @Class(statusColorClass)}
		</div>
		<div class="clearfix">
			${@Div(`
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
								clicks .. @wait();
								waitfor {
									logsVisible.set(true);
									try {
										container .. @appendContent(content, ->hold());
									} finally {
										logsVisible.set(false);
									}
								} or {
									clicks .. @wait();
								}
							}
						})
					}
				</div>
				<div class="panel-body">
				</div>
			`, {'class':'log-panel panel panel-default'}) .. @Class('has-body', logsVisible)}
		</div>
	`) .. appStyle();

	var detailShown = @ObservableVar(false);
	var disclosureClass = detailShown .. @transform(
		shown -> 'glyphicon-chevron-' + (shown ? 'left' : 'right')
	);

	var listButton = function(content) {
		return @Li(content, {'class':'list-group-item clickable'});
	};

	return [
		@Div([
			@Ul([
				listButton([appName, " ", @Span(null, {'class':'glyphicon'}) .. @Class(disclosureClass)]) .. @Mechanism(function(btn) {
					while(true) {
						btn .. @wait('click');
						waitfor {
							detailShown.set(true);
							try {
								@findNode('.row', btn).querySelector('.app-detail') .. @appendContent(appDetail) {||
									hold();
								}
							} finally {
								detailShown.set(false);
							}
						} or {
							btn .. @wait('click');
						}
					}
				}),
			
				listButton(['Settings', @Icon('cog')]) .. @Mechanism(function(elem) {
					var container = elem.parentNode;
					var clicks = elem .. @events('click');
					clicks .. @each {||
						waitfor {
							container .. @form.appConfigEditor({
								central: app.config,
								local: localServer.appConfig(app.id),
							});
						} or {
							clicks .. @wait();
							console.log("edit cancelled");
						}
					}
				}),

				listButton(['Delete', @Icon('minus-sign')]) .. @Mechanism(function(elem) {
					elem .. @wait('click');
					remoteServer.destroyApp(app .. @get('id'));
				}),
			], {'class':'list-group'}) .. appListStyle(),
		], {'class':'col-sm-4'}),

		@Div(null, {'class':'col-sm-8 app-detail'}),
	];
};

var showServer = function(token, localServer, remoteServer, container) {
	var apps = remoteServer.apps;

	var addApp = @Button([@Icon('plus'), ' new app']) .. @OnClick(function() {
		var appInfo = localServer.addApp({});
		remoteServer.createApp(appInfo .. @get('id'), {name:"TODO"});
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
			container .. @appendContent(apps .. @transform(function(apps) {
				var appWidgets = apps .. @map(app -> @Div(appWidget(token, localServer, remoteServer, app), {'class':'row'}));

				return appWidgets;
			}), -> hold());
		} or { disconnectButton .. @wait('click'); }
	}
};

@withBusyIndicator {|ready|
	@withAPI('./remote.api') {|api|
		
		console.log("API.servers = #{api.servers}");
		var activeServer = @ObservableVar(null);

		var displayCurrentServer = function(elem) {
			activeServer .. @each(function(server) {
				if (!server) {
					elem .. @appendContent(`<h1>Click something!</h1>`) {||
					// TODO: do a "detached each" instead of explicitly waiting for
					// this in each loop
						activeServer .. @changes .. @wait();
					}
					return;
				}

				var id = server.id;
				elem .. @appendContent(@Div(null)) {|elem|
					console.log("DISPLAYING", server);
					var initialConfig = server.config .. @first();
					var authenticationError = @ObservableVar(null);
					var token = initialConfig.ssh || initialConfig.token;
					var updateToken = function(newToken) {
						server.config.modify(c -> c .. @merge({token: newToken}));
						token = newToken;
					};

					waitfor {
						while(true) {
							@info("Connecting to server #{id}");
							try {
								var localServer = api.getServer(id);
								localServer.endpoint.connect {|remoteServer|
									@debug("Connected to server:", remoteServer);
									if (remoteServer.authenticate) {
										while (!token) {
											@info("Getting auth token...");
											var password = @form.loginDialog(elem, initialConfig.username, authenticationError);
											if (password === null) return;
											withBusyIndicator {||
												updateToken(remoteServer.getToken(initialConfig.username, password));
											}
											if (!token) authenticationError.set("Invalid credentials");
											@debug("Is authenticated:", token);
										}
										remoteServer = remoteServer.authenticate(token);
									}
									showServer(token, localServer, remoteServer, elem);
								}
								break;
							} catch(e) {
								if(!@user.isAuthenticationError(e)) throw e;
								@info("Login required");
								updateToken(null);
							}
						}
						activeServer.set(null);
					} or {
						var new_ = activeServer .. @changes() .. @wait();
						console.error("CANCEL", new_);
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
						@A([@Icon('cog'), ' Settings']) .. @Mechanism(function(elem) {
							var clicks = elem .. @events('click');
							clicks .. @each {||
								waitfor {
									console.log("edit starting!");
									@findNode('ul.nav', elem).parentNode .. @form.serverConfigEditor(server.config);
									console.log("edit done!");
								} or {
									clicks .. @wait();
									console.log("edit Cancelled!");
								}
							}
						}),
						@A([@Icon('remove'), ' Delete']) .. @OnClick(function() {
							server.destroy();
						}),
						@A([@Icon('log-out'), ' forget credentials']) .. @OnClick(function() {
							server.config.modify(function(conf) {
								conf = conf .. @clone();
								delete conf['token'];
								return conf;
							});
						}) .. @Class('hidden', server.config .. @transform(c -> !c .. @hasOwn('token'))),
					], {'class':'dropdown-menu'}),
				], {'class':'dropdown'});

				return @Li([button, dropdownItems])
					.. @Class('active', activeServer .. @transform(s -> s === server));
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
			@Div(null, {'class':'edit-container'}),
			@Div(),
		]) {|_, _, content|
			ready();
			displayCurrentServer(content),
			hold();
		}
	}
}
