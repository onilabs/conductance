@ = require(['sjs:sequence']);
@route = require('./route');
var routeCodec = {};
routeCodec.encode = function(state) {
	if (!state.server) {
		return "";
	}
	rv = "#{
		(state.server || "") .. encodeURIComponent()
	}/#{
		(state.app || "") .. encodeURIComponent()
	}";
	return rv;
};
routeCodec.decode = function(str) {
	var [server, app] = str.split('/') .. @map(decodeURIComponent) .. @map(x -> x == "" ? null : x);
	return {
		server: server,
		app: app,
	};
};

//var route = {apps:["one,two","three"], server: "one/two,three"};
//route .. routeCodec.encode .. routeCodec.decode .. @assert.eq(route);

exports.route = @route.lift(routeCodec);
