@ = require('sjs:std');
@os = require('nodejs:os');

exports.ipAddress = function(prefix) {
	// XXX this would be nice, but doesn't include bridge devices (e.g. docker0) for some reason...
	//var ifaces = @os.networkInterfaces() .. @ownPropertyPairs
	//.. @filter(([name, ifaces]) -> name .. @startsWith(prefix))
	//.. @transform(([name, ifaces]) ->
	//	ifaces .. @filter(i -> !i.internal && i.family === 'IPv4') .. @transform(i -> i.address)
	//)
	//.. @concat()
	//.. @toArray();
	
	var IPv4 = 'inet';
	var IPv6 = 'inet6';
	var ifaces = @childProcess.run('ip', ['-o', 'addr'], {stdio:['ignore','pipe',2]}).stdout.split('\n')
		.. @filter()
		.. @transform(function(line) {
			var [_idx, iface, ipv, ip] = line.split(/\s+/);
			[IPv4, IPv6] .. @assert.contains(ipv, ipv);
			return [iface, ipv, ip];
		})
		.. @filter([iface, ipv] -> ipv === IPv4 && iface .. @startsWith(prefix))
		.. @map([iface, ipv, ip] -> ip.split('/')[0]);

	
	if(ifaces.length !== 1) {
		throw new Error("Expected one ipv4 #{prefix}* interface, got: " + JSON.stringify(ifaces));
	}
	return ifaces[0];
}
