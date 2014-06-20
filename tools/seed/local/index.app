/**
 @template-show-busy-indicator
*/
require.hubs.unshift(['seed:', '/modules/']);
@ = require(['mho:std', 'mho:app']);
@form = require('./form');
@logging.setLevel(@logging.DEBUG);

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

	var runningState = pid .. @transform(pid -> pid === null ? "Stopped" : `Running (PID $pid)`);
	var statusClass = pid .. @transform(pid -> "glyphicon-#{pid === null ? "stop" : "play"}");


	var appDetail = `
		<h1>
		${@Span(null, {'class':'glyphicon'}) .. @Class(statusClass)}
		${appName}
		${@Button("[edit]") .. @Mechanism(function(elem) {
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
		})}
		</h1>
		<div>
			<div class="status row">
				<div class="col-sm-8">
					<ul>
						<li>$runningState</li>
						<li>
							${@Button("Stop") .. @OnClick(-> appCtl.stop())}
							${@Button("Start") .. @OnClick(-> appCtl.start())}
						</li>
					</ul>
				</div>
				<div class="col-sm-4">
					$@Ul([
						@Button("Deploy") .. @Mechanism(function(elem) {
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
						}),

						@Button("[delete]") .. @Mechanism(function(elem) {
							elem .. @wait('click');
							server.destroyApp(app .. @get('id'));
						}),
					])
			</div>
			${@Pre(null) .. @Mechanism(function(elem) {
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
			}) .. @Style('
					height: 200px;
					width: 100%;
					overflow:auto;
					white-space: pre;
					word-wrap: normal;
			')}
		</div>
	`;

	return @Button(`app: ${appName}`) .. @Mechanism(function(btn) {
		while(true) {
			btn .. @wait('click');
			waitfor {
				btn.parentNode .. @appendContent(appDetail) {||
					hold();
				}
			} or {
				btn .. @wait('click');
			}
		}
	});
};

var showServer = function(server, container) {
	var apps = server.apps;
	container .. @appendContent(@Button("[disconnect]")) {|disconnectButton|
		waitfor {
			@debug("Apps[outer]:", apps);
			container .. @appendContent(apps .. @transform(function(apps) {
				@info("Apps[inner]:", apps);
				var appWidgets = apps .. @map(app -> appWidget(server, app));

				var addApp = @Button('[+]') .. @OnClick(function() {
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
									isAuthenticated = api.authenticate(id, password);
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
					@Button('[edit]') .. @Mechanism(function(elem) {
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
					@Button('[delete]') .. @OnClick(function() {
						server.destroy();
					}),
					@Div(null, {'class':'edit-container'}),
				];
			});
		});

		var addServer = @Button('[+]') .. @OnClick(function() {
			api.createServer({name:"TODO"});
		});

		var serverList = buttons .. @transform(function(buttons) {
			return @Ul(buttons.concat([addServer]));
		});

		ready();
		@mainContent .. @appendContent(serverList, ->hold());
	}
}
