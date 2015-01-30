@ = require('./common');

exports.setUploadPath = function(s, path) {
	s.appSettingsButton() .. s.driver.click();

	var form = @waitforSuccess( -> s.modal('form'));
	form .. s.fillForm({
		path: path,
	}, false);
	form .. @trigger('submit');
	s.waitforNoModal();
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
	s.appHeader = @waitforSuccess(-> s.mainElem .. @elem('h3 a', el -> el.textContent === appName));
	// show the console output, for debugging
	var outputToggle = @waitforSuccess( -> s.mainElem .. @elem('.output-toggle'));
	outputToggle .. s.driver.click();
}

exports.enableService = function(s, name) {
	// assumes the settings form has already been called up
	var form = @waitforSuccess( -> s.modal('form'));
	var select = form .. @elem('select') .. @assert.ok();
	var options = select.options .. @arrayLike .. @map(ch -> ch.textContent);
	options .. @assert.contains(name);
	select.value = name;
	select .. @trigger('change');
	form .. @elem('button.add-service') .. s.driver.click();
}
