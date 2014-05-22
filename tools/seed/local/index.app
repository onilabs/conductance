@ = require(['mho:std', 'mho:app']);

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
		@TextArea() .. @Mechanism(function(elem) {
			waitfor {
				values .. @each {|val|
					elem.value = JSON.stringify(val, null, '  ');
				}
			} and {
				elem .. @events('change') .. @each {|evt|
					var val = elem.value;
					console.log("Change: ", val);
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

var appWidget = function(deployment, app) {
	@info("app: ", app);
	var appName = app.values .. @transform(a -> a.name);
	var appDetail = `
		<h1>${appName}</h1>
		<div>
			<div class="status row">
				<div class="col-sm-8">
					<span class="glyphicon glyphicon-play"></span>
					<ul>
						<li>Running</li>
						<li>PID 1234 (+2 children)</li>
						<li>Since 12:05 (15m)</li>
						<li>
							$@Button("Stop")
							$@Button("Restart")
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
											deployment.deploy(app.id, @info);
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
									elem.parentNode .. @appendContent(editWidget(app.values), ->hold());
								} or {
									click .. @wait();
								}
							}
						}),
					])
			</div>
		</div>
	`;

	return @Button(`app: ${appName}`) .. @Mechanism(function(btn) {
		while(true) {
			btn .. @wait('click');
			waitfor {
				console.log("showing app: #{app.id}");
				btn.parentNode .. @appendContent(appDetail) {||
					hold();
				}
			} or {
				btn .. @wait('click');
				console.log('hiding again');
			}
		}
	});
};

var showServer = function(deployment, apps) {
	@mainContent .. @appendContent(@Button("x")) {|disconnectButton|
		waitfor {
			@mainContent.. @appendContent(apps .. @transform(function(apps) {
				return @UnorderedList(apps .. @map(app -> appWidget(deployment, app)));
			}), -> hold());
		} or { disconnectButton .. @wait('click'); }
	}
};

@withBusyIndicator {|ready|
	@withAPI('./remote.api') {|api|
		var buttons = api.servers .. @transform(function(servers) {
			return servers .. @map(function(server) {
				@info("Server: ", server);
				var enabled = @ObservableVar(true);
				var id = server.id;
				var apps = server.apps;
				var serverName = server.values .. @transform(s -> s.name);
				return @Button(serverName) .. @Enabled(enabled) .. @OnClick(function() {
					enabled.set(false);
					try {
						@info("Connecting to server #{name}");
						api.connect(id) {|deployment|
							showServer(deployment, apps);
						}
					} finally {
						enabled.set(true);
					}
				});
			});
		});

		ready();
		@mainContent .. @appendContent(buttons, ->hold());
	}
}
