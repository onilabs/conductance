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
						@mainContent .. @appendContent(@Button("x")) {|elem|
							waitfor {
								while(true) {
									var pong = server.ping('HELLO');
									@info("PING: #{pong}");
									hold(2000);
								}
							} or { elem .. @wait('click'); }
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
