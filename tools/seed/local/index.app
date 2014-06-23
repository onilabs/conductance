/**
 @template-show-busy-indicator
*/
require.hubs.unshift(['seed:', '/modules/']);
@ = require(['mho:std', 'mho:app']);
@form = require('./form');
@logging.setLevel(@logging.DEBUG);

var appStyle = @CSS("
	.header .btn-group {
		float:right;
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
		<div class="row">
			<div class="log-panel panel panel-default">
				<div class="panel-heading">
					<h3 class="panel-title">
						${@Button(@Icon('list'))
						.. @Mechanism(function(elem) {
							var clicks = elem .. @events('click', {handle:@stopEvent});
							var panelRoot = elem.parentNode.parentNode.parentNode;
							var container = panelRoot.querySelector('.panel-body');
							console.log("CONTAIN:", container);
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

							var containerCls = panelRoot.classList;
							while(true) {
								clicks .. @wait();
								waitfor {
									containerCls.add(hasBody);
									try {
										container .. @appendContent(content, ->hold());
									} finally {
										containerCls.remove(hasBody);
									}
								} or {
									clicks .. @wait();
								}
							}
						})
					} Recent console output
					</h3>
				</div>
				<div class="panel-body">
				</div>
			</div>
		</div>
	`) .. appStyle();

	var detailShown = @ObservableVar(false);
	var disclosureClass = detailShown .. @transform(
		shown -> 'glyphicon-chevron-' + (shown ? 'up' : 'down')
	);

	return [
		@Button([`app: ${appName} `, @Span(null, {'class':'glyphicon'}) .. @Class(disclosureClass)]) .. @Mechanism(function(btn) {
			while(true) {
				btn .. @wait('click');
				waitfor {
					detailShown.set(true);
					try {
						btn.parentNode .. @appendContent(appDetail) {||
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
	
		@Button(@Icon('cog')) .. @Mechanism(function(elem) {
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

		@Button(@Icon('minus-sign')) .. @Mechanism(function(elem) {
			elem .. @wait('click');
			server.destroyApp(app .. @get('id'));
		}),
	];
};

var showServer = function(server, container) {
	var apps = server.apps;
	container .. @appendContent(@Button(@Icon('off'))) {|disconnectButton|
		waitfor {
			@debug("Apps[outer]:", apps);
			container .. @appendContent(apps .. @transform(function(apps) {
				@info("Apps[inner]:", apps);
				var appWidgets = apps .. @map(app -> appWidget(server, app));

				var addApp = @Button(@Icon('plus-sign')) .. @OnClick(function() {
					server.createApp({name:"TODO"});
				});

				return @Ul(appWidgets.concat([addApp]));
			}), -> hold());
		} or { disconnectButton .. @wait('click'); }
	}
};

@withBusyIndicator {|ready|
	@withAPI('./remote.api') {|api|
		console.log("API.servers = #{api.servers}");
		var buttons = api.servers .. @transform(function(servers) {
			return servers .. @map(function(server) {
				@info("Server: ", server);
				var enabled = @ObservableVar(true);
				var id = server.id;
				var serverName = server.config .. @transform(s -> s.name);
				return [
					@Button(serverName) .. @Enabled(enabled) .. @OnClick(function(evt) {
						enabled.set(false);
						var initialConfig = server.config .. @first();
						var authenticationError = @ObservableVar(null);
						var isAuthenticated = initialConfig.ssh || initialConfig.token;

						try {
							while(true) {
								while (!isAuthenticated) {
									@info("Getting auth token...");
									var password = @form.loginDialog(evt.target, initialConfig.username, authenticationError);
									@info("trying login with password: " + password);
									withBusyIndicator {||
										isAuthenticated = api.authenticate(id, password);
									}
									if (!isAuthenticated) authenticationError.set("Invalid credentials");
									@debug("Is authenticated:", isAuthenticated);
									if (isAuthenticated === null) return;
								}

								@info("Connecting to server #{name}");
								try {
									api.connect(id) {|serverApi|
										@debug("Connected to server");
										showServer(serverApi, evt.target.parentNode);
									}
									break;
								} catch(e) {
									if (!e.invalid_token) throw e;
									@info("Invalid token error caught");
									isAuthenticated = false;
								}
							}
						} finally {
							enabled.set(true);
						}
					}),
					@Button(@Icon('cog')) .. @Mechanism(function(elem) {
						var clicks = elem .. @events('click');
						clicks .. @each {||
							waitfor {
								console.log("edit starting!");
								elem.parentNode .. @form.serverConfigEditor(server.config);
								console.log("edit done!");
							} or {
								clicks .. @wait();
								console.log("edit Cancelled!");
							}
						}
					}),
					@Button(@Icon('minus-sign')) .. @OnClick(function() {
						server.destroy();
					}),
					@Button(@Icon('log-out')) .. @OnClick(function() {
						server.config.modify(function(conf) {
							conf = conf .. @clone();
							delete conf['token'];
							return conf;
						});
					}) .. @Class('hidden', server.config .. @transform(c -> !c .. @hasOwn('token'))),
					@Div(null, {'class':'edit-container'}),
				];
			});
		});

		var addServer = @Button(@Icon('plus-sign')) .. @OnClick(function() {
			api.createServer({name:"TODO"});
		});

		var serverList = buttons .. @transform(function(buttons) {
			return @Ul(buttons.concat([addServer]));
		});

		@mainContent .. @appendContent(serverList) {||
			ready();
			hold();
		}
	}
}
