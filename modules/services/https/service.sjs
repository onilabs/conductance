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

/**
  @summary HTTPS Certificate Service
  @desc
     Automatically obtains and renews HTTPS TLS certificates using [certbot](https://certbot.eff.org/).

     On first run, a webserver will be run on port 80 to retrieve the initial certificates.

     For automated renewal to work, the project using the service needs to run a webserver on port 80 that serves the directory `/etc/letsencrypt/.well-known/` under the URL `/.well-known/`.
*/

@ = require([
  'mho:std',
  'sjs:nodejs/mkdirp'
]);

/**
   @class HttpsService
   @summary HttpsService instance
   @variable HttpsService.credentials
   @summary An [sjs:observable::Observable] containing automatically-renewing HTTPS credentials that can be passed to [sjs:nodejs/http::withServer] or [mho:server::Port::ssl]
*/

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::configUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a [::HttpsService] instance.
   @desc
      Usually implicitly run by [mho:services::run]
 */
exports.run = function(config, block) {
  console.log("Starting Https Service: ");
  
  var email = config.email;
  var domains = config.domains.split(/[ ,]+/);
  var webroot = '/etc/letsencrypt';
  var challenge_dir = webroot + '/.well-known/';
  var cert_dir = '/etc/letsencrypt/live/'+domains[0];
  @mkdirp(challenge_dir);

  if (!@fs.exits(cert_dir)) {
    console.log("Https service: Obtaining certificates for first time");
    @server.run({
      address: @Port(80),
      routes: [@route.StaticDirectory('.well-known/', challenge_dir, { allowDirListing: false, mapIndexToDir: false })]
    }) {
      ||
      
      var process = @childProcess.run('certbot', @flatten :: 
                                      [
                                        'certonly', 
                                        '-n',
                                        '--agree-tos',
                                        '--expand',
                                        //'--staging',
                                     '-m', email,
                                        '--webroot',
                                        '-w', webroot,
                                        domains .. @map(d -> ['-d', d])
                                      ]);
      console.log(process.stdout + '\n' + process.stderr);
    }
    
    // the certificate & key should now be available. renewal happens
    // automatically (via crontab), so we create an observable that monitors
    // the certificate directory
  var credentials = @Observable(function(r) {
    while (1) {
      var ssl = {
        key:  @fs.readFile(cert_dir + '/privkey.pem').toString(),
        cert: @fs.readFile(cert_dir + '/fullchain.pem').toString()
      };
      r(ssl);
      @fs.watch(cert_dir) .. @wait();
      console.log('Https service: certificate change detected');
      // wait a few seconds, to make sure all files are updated:
      hold(5000);
    }
  });
  console.log('Https service: certificates obtained');
  try {
    block(
      {
        credentials: credentials
      }
    );
  }
  finally {
    console.log("Shutting down Https Service");
  }
};
