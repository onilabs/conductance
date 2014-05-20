@ = require(['mho:std', 'mho:app']);
@withBusyIndicator {|ready|
	@withAPI('./remote.api') {|api|
		var buttons = api.serverNames() .. @map(function(name) {
			var enabled = @ObservableVar(true);
			return @Button(name) .. @Enabled(enabled) .. @OnClick(function() {
				enabled.set(false);
				try {
					@info("Connecting to server #{name}");
					api.connect(name) {|server|
						@info("pinging...", server);
						@mainContent .. @appendContent(@Button("x")) {|disconnectButton|
							waitfor {
								var appNames = server.appNames;
								console.log(server.appNames);
								@mainContent.. @appendContent(appNames .. @transform(function(names) {
									return @UnorderedList(names .. @map(app -> @Button(`app: ${app}`) .. @Mechanism(function(btn) {
										while(true) {
											btn .. @wait('click');
											waitfor {
												console.log("showing app: #{app}");
												btn.parentNode .. @appendContent(@Div(`Details for ${app}...`)) {||
													hold();
												}
											} or {
												btn .. @wait('click');
												console.log('hiding again');
											}
										}
									})));
								})) {||
									hold();
								}
							//	while(true) {
							//		var pong = server.ping('HELLO');
							//		@info("PING: #{pong}");
							//		hold(2000);
							//	}
							} or { disconnectButton .. @wait('click'); }
						}
					}
				} finally {
					enabled.set(true);
				}
			});
		});

		ready();
		@mainContent .. @appendContent(buttons, ->hold());
	}
}
