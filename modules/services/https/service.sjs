/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @summary HTTPS Certificate Service
  @desc
     * Automatically obtains and renews HTTPS TLS certificates using [certbot](https://certbot.eff.org/).

     * For initial retrieval of certificates, see [::HttpsService::updateCredentials].

     * For automated renewal, the project using the service needs to run a webserver on port 80 that serves the directory `/var/letsencrypt/.well-known/` under the URL `/.well-known/` - see [::ChallengeDirectory] for a ready-made [mho:server::Route] that can be used in a [mho:server::run] configuration.
*/

@ = require([
  'mho:std',
  'sjs:nodejs/mkdirp'
]);

/**
   @class HttpsService
   @summary HttpsService instance
   @variable HttpsService.credentials
   @summary An [sjs:observable::Observable] containing automatically-renewing HTTPS credentials that can be passed to [sjs:nodejs/http::withServer] or [mho:server::Port::ssl]. If credentials are not available (yet) at the expected location (/etc/conductance/certs/letsencrypt/live/), the observable yields a test certificate for 'localhost'.
*/

/**
   @function HttpsService.updateCredentials
   @param {Boolean} [run_server] Whether `updateCredentials` should run a webserver - see description. 
   @summary Obtain new or updated credentials from certbot and install at /etc/conductance/certs/letsencrypt/live/.
   @desc

     ### Basic Operation

     * This function should only be called once on application startup. After that, credentials will automatically renew in the background (via crontab at an interval of 12h). 

     * Credentials will be persisted in /etc/conductance/certs/letsencrypt/.

     * If `run_server` is `false`, the caller needs to arrange for a webserver at port 80 that reachable via the configured domains and serves
       the directory `/var/letsencrypt/.well-known/` under the URL `/.well-known/`. Conversely, if `run_server` is `true`, `updateCredentials` will
       itself run a port 80 webserver for the duration of its execution.

     ### Automatic Renewal

     * For periodic automated background renewal (every 12h via crontab) to work, the project using the service needs to run a 
       webserver on port 80 that serves the directory `/var/letsencrypt/.well-known/` under the URL `/.well-known/` - see [::ChallengeDirectory] for a ready-made [mho:server::Route] that can be used in a [mho:server::run] configuration.
*/

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::provisioningUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a [::HttpsService] instance.
   @desc
      Usually implicitly run by [mho:services::withServices]
 */

var WEBROOT = '/var/letsencrypt/';
var CHALLENGE_DIR = WEBROOT + '/.well-known/';
@mkdirp(CHALLENGE_DIR);

exports.run = function(config, block) {
  console.log("Starting Https Service: ");

  var use_certbot = config.use_certbot;

  if (use_certbot)
    return run_with_certbot(config, block);
  else
    return run_with_static_certs(config, block);
};

function run_with_static_certs(config, block) {
  var credentials;
  try {
    credentials = @constantObservable({
      key:  @fs.readFile('/etc/conductance/certs/privkey.pem').toString(),
      cert: @fs.readFile('/etc/conductance/certs/fullchain.pem').toString()
    });
  }
  catch (e) {
    console.log("Https Service: No privkey.pem/fullchain.pem found at /etc/conductance/certs/. Using dummy test certificates");
    credentials = @constantObservable({
      key: @fs.readFile("#{@env.conductanceRoot}ssl/insecure-localhost.key"),
      cert: @fs.readFile("#{@env.conductanceRoot}ssl/insecure-localhost.crt")
    });
  }

  try {
    block(
      {
        credentials: credentials,
        updateCredentials: () -> true
      }
    );
  }
  finally {
    console.log("Shutting down Https Service");
  }
}

function run_with_certbot(config, block) {
  var email = config.email;
  var domains = config.domains.split(/[ ,]+/);

  var certbot_config_root = '/etc/conductance/certs/letsencrypt';
  var cert_root = certbot_config_root + '/live/';
  var cert_dir = cert_root + domains[0];

  @mkdirp(cert_root);

  function updateCredentials(run_server) {
    if (run_server) {
      @server.run({
        address: @Port(80),
      routes: [exports.ChallengeDirectory]
      }) {
        ||
        return updateCredentials(false);
      }
    }

    console.log("Https service: Obtaining/Updating certificates");
    var process = @childProcess.run('certbot', @flatten :: 
                                    [
                                      'certonly', 
                                      '-n',
                                      '--agree-tos',
                                      '--expand',
                                      //'--staging',
                                      '--config-dir', certbot_config_root,
                                      '-m', email,
                                      '--webroot',
                                      '-w', WEBROOT,
                                      domains .. @map(d -> ['-d', d])
                                    ]);
    console.log(process.stdout + '\n' + process.stderr);
  }
    
  var credentials = @Observable(function(r) {
    while (1) {

      if (!@fs.exists(cert_dir)) {
        r({
          key: @fs.readFile("#{@env.conductanceRoot}ssl/insecure-localhost.key"),
          cert: @fs.readFile("#{@env.conductanceRoot}ssl/insecure-localhost.crt"),
        });
        do { 
          @fs.watch(cert_root) .. @wait();
        } while (!@fs.exists(cert_dir));
        hold(2000);
      }

      r({
        key:  @fs.readFile(cert_dir + '/privkey.pem').toString(),
        cert: @fs.readFile(cert_dir + '/fullchain.pem').toString()
      });
      @fs.watch(cert_dir) .. @wait();
      console.log('Https service: certificate change detected');
      // wait a few seconds, to make sure all files are updated:
      hold(2000);
    }
  });

  try {
    block(
      {
        credentials: credentials,
        updateCredentials: updateCredentials
      }
    );
  }
  finally {
    console.log("Shutting down Https Service");
  }
}

//----------------------------------------------------------------------
/**
   @variable ChallengeDirectory
   @summary A [mho:server::Route] that can be used in a [mho:server::run] configuration to serve the certbot's challenge directory (under '/.well-known/')
   @desc
     Equivalent to:

         @route.StaticDirectory('.well-known/',
                                '/var/letsencrypt/.well-known',
                                {
                                  allowDirListing: false,
                                  mapIndexToDir:   false
                                }
                               )
*/
exports.ChallengeDirectory = @route.StaticDirectory('.well-known/', CHALLENGE_DIR, { allowDirListing: false, mapIndexToDir: false});
