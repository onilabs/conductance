/**
 @template-show-busy-indicator
*/
require.hubs.unshift(['seed:', '/modules/']);
@ = require(['mho:std', 'mho:app', 'sjs:xbrowser/dom']);
@form = require('./form');
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
var appWidget = function(server, app) {
	@info("app: ", app);
	var appName = app.config.central .. @transform(a -> a.name);
	var appCtl = app.ctl;
	var pidEvent = @Emitter();
	//var pid = @observe(appCtl.pid, x -> x);
	var pid = (function(stream) {
		var abort = null;
		var emitters = [];
		var none = {};
		var current = none;
		return @Stream(function(emit) {
			emitters.push(emit);
			try {
				if(emitters.length == 1) {
					@assert.eq(abort, null);
					loop = spawn(function() {
						waitfor {
							stream .. @each {|val|
								current = val;
								emitters .. @each(e -> e(val));
							}
						} or {
							waitfor() {
								abort = resume;
							}
						}
					}());
				} else {
					// new observer, may have missed out on initial value:
					if (current !== none) emit(current);
				}
			} retract {
				emitters .. @remove(emit);
				if (loop && emitters.length === 0) {
					spawn(abort());
					abort = null;
					current = none;
				}
			}
		});
	})(appCtl.pid);

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
				${@Button(["stop ", @Icon('stop')])  .. disabled(isStopped) .. @OnClick(-> appCtl.stop())}
				${@Button(["start ", @Icon('play')]) .. disabled(isRunning) .. @OnClick(-> appCtl.start())}
				${@Button(["deploy ", @Icon('cloud-upload')]) .. @Mechanism(function(elem) {
					var click = elem .. @events('click');
					while(true) {
						click .. @wait();
						elem.disabled = true;
						try {
							@withBusyIndicator {||
								waitfor {
									server.deploy(app.id, @info);
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
				appName,
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
								appCtl.tailLogs(100) .. @each {|chunk|
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
							container .. @form.appConfigEditor(app.config);
						} or {
							clicks .. @wait();
							console.log("edit cancelled");
						}
					}
				}),

				listButton(['Delete', @Icon('minus-sign')]) .. @Mechanism(function(elem) {
					elem .. @wait('click');
					server.destroyApp(app .. @get('id'));
				}),
			], {'class':'list-group'}) .. appListStyle(),
		], {'class':'col-sm-4'}),

		@Div(null, {'class':'col-sm-8 app-detail'}),
	];
};

var showServer = function(server, container) {
	var apps = server.apps;

	var addApp = @Button([@Icon('plus'), ' new app']) .. @OnClick(function() {
		server.createApp({name:"TODO"});
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
			@debug("Apps[outer]:", apps);
			container .. @appendContent(apps .. @transform(function(apps) {
				@info("Apps[inner]:", apps);
				var appWidgets = apps .. @map(app -> @Div(appWidget(server, app), {'class':'row'}));

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
					var isAuthenticated = initialConfig.ssh || initialConfig.token;

					waitfor {
						while(true) {
							while (!isAuthenticated) {
								@info("Getting auth token...");
								var password = @form.loginDialog(elem, initialConfig.username, authenticationError);
								@info("trying login with password: " + password);
								withBusyIndicator {||
									isAuthenticated = api.authenticate(id, password);
								}
								if (!isAuthenticated) authenticationError.set("Invalid credentials");
								@debug("Is authenticated:", isAuthenticated);
								if (isAuthenticated === null) return;
							}

							@info("Connecting to server #{id}");
							try {
								api.connect(id) {|serverApi|
									@debug("Connected to server");
									showServer(serverApi, elem);
								}
								break;
							} catch(e) {
								if (!e.invalid_token) throw e;
								@info("Login required");
								isAuthenticated = false;
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
