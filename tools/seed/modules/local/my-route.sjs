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
		(state.apps || []) .. @map(encodeURIComponent) .. @join(",")
	}";
	return rv;
};
routeCodec.decode = function(str) {
	var [server, apps] = str.split('/');
	var apps = (apps || "").split(',')
		.. @map(decodeURIComponent)
		.. @filter(x -> x !== "")
		.. @toArray;
	;
	server = server .. decodeURIComponent();
	if (server === "") server = null;
	return {
		server: server,
		apps: apps,
	};
};

//var route = {apps:["one,two","three"], server: "one/two,three"};
//route .. routeCodec.encode .. routeCodec.decode .. @assert.eq(route);

exports.route = @route.lift(routeCodec);
