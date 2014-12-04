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
@bridge = require('mho:rpc/bridge');

exports.apiVersion = 1;
exports.defaultPort = 1608;

exports.serve = function(args) {
  var defaultPort = exports.defaultPort;

  var undocumentedOptions = [
    // useful only for testing
    {
      name: 'master',
      type: 'string',
      'default': 'https://seed.conductance.io',
    },
    {
      name: 'add-ca',
      type: 'arrayOfString',
      'default': null,
    },
  ];

  var options = [
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
  ];
  var dashdash = require('sjs:dashdash');
  var parser = require('sjs:dashdash').createParser({options: options.concat(undocumentedOptions)});

  try {
    var opts = parser.parse(args);
  } catch(e) {
    console.error('Error: ', e.message);
    process.exit(1);
  }

  if (opts.help) {
    console.log("options:\n");
    console.log(dashdash.createParser({options:options}).help({includeEnv:true}));
    process.exit(0);
  }

  if (!opts.master .. @endsWith('/')) opts.master += '/';

  @env.set('seed-api-version', exports.apiVersion);
  @env.set('seed-master', opts.master);

  var seedAgent = undefined;
  if(opts.add_ca) {
    var https = require('nodejs:https');
    opts.add_ca = opts.add_ca .. @map(@fs.readFile);
    @logging.warn("Using alternate certificate authorities");
    seedAgent = new https.Agent(https.globalAgent.options .. @merge({
      ca: opts.add_ca,
    }));

    // inject agent into endpoint module
    var endpoint = require('mho:server/seed/endpoint');
    endpoint._EndpointProto._connect = (function(orig) {
      return function(opts, block) {
        var api = this.server;
        var apiinfo = @bridge.resolve(api, {agent:seedAgent});
        opts = opts .. @merge({
          apiinfo: apiinfo,
          transport: require('mho:rpc/aat-client').openTransport(apiinfo.server, {agent:seedAgent}),
        });
        return orig.call(this, opts, block);
      };
    })(endpoint._EndpointProto._connect);
  }

  var routes = [
    @route.SystemBridgeRoutes(),
    @route.ExecutableDirectory('local/', @url.normalize('./local', module.id) .. @url.toPath()),

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
            agent: seedAgent,
          });
          if(!response.statusCode) {
            if(response.error) @error(response.error);
            req .. @response.writeErrorResponse(
              500, "Connection error",
              `<p>There was an unknown error connecting to the main seed server at ${opts.master}</p>
              <p>Please try again soon.</p>`);
            return;
          } else {
            req.response.writeHead(response.statusCode, response.headers);
            response .. @stream.pump(req.response);
          }
        },
      }
    ),

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
