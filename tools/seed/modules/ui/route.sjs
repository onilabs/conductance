@ = require('mho:std');
var getHash = -> (window.location.toString() .. @split('#', 1))[1] || '';
var hash = @ObservableVar(getHash());

var identity = x -> x;
exports.hash = hash .. @transform(identity);
exports.hash.set = function(newval) {
	document.location.hash = "#" + newval;
};
spawn(window .. @events('hashchange') .. @each(v -> hash.set(getHash())));


exports.lift = function(codec) {
	var obs = hash .. @transform(codec.decode);
	obs.set = function(v) {
		exports.hash.set(codec.encode(v));
	}
	obs.get = -> obs .. @first();
	obs.modify = function(f) {
		var NOOP = {};
		var v = f(obs.get(), NOOP);
		if (v === NOOP) return;
		obs.set(v);
	};
	return obs;
};
