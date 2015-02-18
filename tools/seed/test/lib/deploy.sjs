@ = require('./common');

exports.setUploadPath = function(s, path) {
	s.appSettingsButton() .. s.driver.click();

	var form = @waitforSuccess( -> s.modal('form'));
	exports.fillUploadPath(s, form, path);
	form .. @trigger('submit');
	s.waitforNoModal();
}

exports.fillUploadPath = function(s, form, path) {
	path .. @assert.ok();
	form .. s.fillForm({
		path: path,
	}, false);
}

exports.appRequester = function(s, baseUrl) {
	origUrl = @url.parse(s.appLink());
	return function(rel, opts) {
		var url = @url.normalize(rel, baseUrl);
		opts = opts ? opts .. @clone : {};
		opts.method = opts.method || 'GET';
		// XXX this doesn't really reflect reality (because we can't rely on vhosts in test).
		// But it tests the basic proxy setup.
		opts.headers = (opts.headers ||{}) .. @merge({'x-test-host': origUrl.host});
		@info("Fetching: #{url} with opts", opts);
		var rv = @stub.request(url, opts);
		@info("request to #{url} returned:", rv);
		return rv;
	}
}

exports.ensureStopped = function(s) {
	if(s .. exports.isRunning()) {
		s.mainElem .. s.clickButton(/stop/);
	}
	@waitforCondition( -> !s .. exports.isRunning());
};

exports.isRunning = function(s) {
	return s.appHeader().classList.contains('text-success');
}

exports.isServing = function(s) {
	return s .. exports.isRunning()
		&& s.outputContent() .. @contains('Conductance serving address:');
}

exports.awaitRunningApp = function(s) {
	@waitforCondition(-> s .. exports.isServing(), null, 20);
}

exports.createApp = function(s, appName) {
	var appList = @waitforSuccess(s.appList);
	appList .. @map(el -> el.textContent) .. @assert.eq([]);
	s.createAppButton() .. s.driver.click();
	var form = @waitforSuccess( -> s.modal('form'));
	form .. s.fillForm({
		name: appName,
		path: '/not-yet-set',
	});
	form .. @trigger('submit');
	s.waitforNoModal();
	var appList;
	@waitforCondition(-> (appList = s.appList()).length > 0);
	appList .. @map(el -> el.textContent) .. @assert.eq([appName]);
	appList[0] .. @elem('a') .. s.driver.click();

	s.mainElem = s.driver.elem('.app-display');
	@waitforSuccess(-> s.appHeader() .. @elem('a', el -> el.textContent === appName));
	// show the console output, for debugging
	var outputToggle = @waitforSuccess( -> s.mainElem .. @elem('.output-toggle'));
	outputToggle .. s.driver.click();
}

exports.enableService = function(s, name) {
	// assumes the settings form has already been called up
	var form = @waitforSuccess( -> s.modal('.form'));
	var select = form .. @elem('select') .. @assert.ok();
	var options = select.options .. @arrayLike .. @map(ch -> ch.textContent);
	options .. @assert.contains(name);
	select.value = name;
	select .. @trigger('change');
	form .. @elem('button.add-service') .. s.driver.click();
}
