/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@response = require('mho:server/response');

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

  if (!opts.master .. @endsWith('/')) opts.master += '/';

  @env.set('seed-api-version', exports.apiVersion);
  @env.set('seed-master', opts.master);

  var routes = [
    @route.SystemBridgeRoutes(),
    @Route('version', {GET: function(req) {
      req .. @setHeader('content-type', 'text/json; charset=utf-8');
      req .. @setStatus(200);
      req.response.end(JSON.stringify(versionInfo, null, '  '));
    }}),

    // proxy index to master. We can't just redirect, because then we run into cross-origin issues
    // when trying to connect to local API.
    @Route('',
      { '*': function(req)
        {
          var response = @http.request(@url.normalize('client.html', opts.master), {
            method: req.request.method,
            response: 'raw',
            body: req.body,
            headers: req.request.headers,
            throwing: false,
          });
          if(!response.statusCode) {
            req .. @response.writeErrorResponse(
              500, "Connection error",
              `<p>There was an unknown error connecting to the main seed server at ${opts.master}</p>
              <p>Please try again soon.</p>`);
            return;
          }
          req.response.writeHead(response.statusCode, response.headers);
          response .. @stream.pump(req.response);
          req.response.end();
        },
      }
    ),
    @route.ExecutableDirectory('local/', @url.normalize('./local', module.id) .. @url.toPath()),

    // redirect all other requests to master server
    @Route(/^/, {'*': function(req) {
      var relative = req.url.relative.slice(1);
      req .. @response.writeRedirectResponse(@url.normalize(relative, opts.master));
    }}),
  ];
  
  var port = opts.port;

  var address = @Port(port);
  @server.run({
    address: address,
    routes: routes,
    debug: @debug,
  }) {||
    @logging.print("\n *** Seed server running - visit http://localhost:#{port}/ to get started.");
    hold();
  };
}
