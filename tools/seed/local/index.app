@ = require(['mho:std', 'mho:app']);
@logging.setLevel(@logging.DEBUG);

var appSettings = function(server, app) {
	var settings;
	@withBusyIndicator {|ready|
		settings = server.settings();
	}
	return @Div(`
		
	`, {'class':'settings'});
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
				width: 50%;
				height: 400px;
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

var appWidget = function(server, app) {
	@info("app: ", app);
	var appName = app.config .. @transform(a -> a.name);
	var appCtl = app.ctl;
	var runningState = appCtl.pid .. @transform(pid -> pid === null ? "Stopped" : `Running (PID $pid)`);
	var statusClass = appCtl.pid .. @transform(pid -> "glyphicon-#{pid === null ? "stop" : "play"}");

	var appDetail = `
		<h1>
		${@Span(null, {'class':'glyphicon'}) .. @Class(statusClass)}
		${appName}</h1>
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
					$@UnorderedList([
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
						@Button("Settings") .. @Mechanism(function(elem) {
							var click = elem .. @events('click');
							while(true) {
								click .. @wait();
								waitfor {
									elem.parentNode .. @appendContent(editWidget(app.config), ->hold());
								} or {
									click .. @wait();
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
				{
					height: 200px;
					width: 100%;
					overflow:auto;
					white-space: pre;
					word-wrap: normal;
				}
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

				return @UnorderedList(appWidgets.concat([addApp]));
			}), -> hold());
		} or { disconnectButton .. @wait('click'); }
	}
};

@withBusyIndicator {|ready|
	@withAPI('./remote.api') {|api|
		console.log(api);
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
						try {
							@info("Connecting to server #{name}");
							api.connect(id) {|serverApi|
								@debug("Connected to server");
								showServer(serverApi, evt.target.parentNode);
							}
						} finally {
							enabled.set(true);
						}
					}),
					@Button('[edit]') .. @Mechanism(function(elem) {
						var container = elem.parentNode;
						var clicks = elem .. @events('click');
						clicks .. @each {||
							container .. @appendContent(editWidget(server.config), -> clicks .. @wait());
						}
					}),
					@Button('[delete]') .. @OnClick(function() {
						server.destroy();
					}),
				];
			});
		});

		var addServer = @Button('[+]') .. @OnClick(function() {
			api.createServer({name:"TODO"});
		});

		var serverList = buttons .. @transform(function(buttons) {
			return @UnorderedList(buttons.concat([addServer]));
		});

		ready();
		@mainContent .. @appendContent(serverList, ->hold());
	}
}
