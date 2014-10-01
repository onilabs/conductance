@ = require('mho:std');
exports.apiVersion = 1;
exports.defaultPort = 1608;
var versionInfo = exports.versionInfo = {
  conductanceVersion: @env.get('conductanceVersion'),
  apiVersion: exports.apiVersion,
};

exports.serve = function(args) {
  var defaultPort = exports.defaultPort;

  var parser = require('sjs:dashdash').createParser({
    options: [
      {
        name: 'master',
        type: 'string',
        'default': 'https://seed.conductance.io',
        help: 'for testing use only',
      },
      {
        names: ['port'],
        type: 'number',
        help: "serve on port (default: #{defaultPort})",
        'default': defaultPort,
      },
      {
        names: ['help', 'h'],
        type: 'bool',
      },
    ],
  });

  try {
    var opts = parser.parse(args);
  } catch(e) {
    console.error('Error: ', e.message);
    process.exit(1);
  }

  if (opts.help) {
    console.log("options:\n");
    console.log(parser.help({includeEnv:true}));
    process.exit(0);
  }

  var routes = [
    @route.SystemRoutes(),
    @Route('version', {GET: function(req) {
      req .. @setHeader('content-type', 'text/json; charset=utf-8');
      req .. @setStatus(200);
      req.response.end(JSON.stringify(versionInfo, null, '  '));
    }}),

    @route.ExecutableDirectory(@url.normalize('./local', module.id) .. @url.toPath()),
  ];
  
  var corsOrigins = [opts.master];
  corsOrigins = corsOrigins .. @map(o -> o .. @rstrip('/'));
  console.warn("Allowing CORS requests from: #{corsOrigins .. @join(",")}");
  routes = routes .. @route.AllowCORS(host -> corsOrigins .. @hasElem(host));

  var port = opts.port;

  var address = @Port(port);
  @server.run({
    address: address,
    routes: routes,
    debug: @debug,
  }) {||
    console.warn("Local service running - visit #{opts.master} to get started.");
    hold();
  };
}
