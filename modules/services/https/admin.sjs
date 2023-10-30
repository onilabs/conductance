/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @summary Configuration helpers for the HTTPS Service
  @hostenv xbrowser
  @nodoc
*/

// TODO: document

@ = require([
  'mho:std',
  'mho:surface/html',
  'mho:surface/components',
  {id:'mho:surface/field', name: 'field'}
]);

exports.configui = function() {

  return [
    @P ::
      `Place certificate and key files (fullchain.pem & privkey.pem) into /etc/conductance/certs/ or enable automatic certificates and fill in the details below.`,

    @P ::
      `Note that enabling automatic certificates via certbot/letsencrypt implies that you agree to the ACME Subscriber Agreement - for details please see the <a href='https://certbot.eff.org/'>certbot docs</a>.`,


    @field.Field('use_certbot') ::
      @Label :: 
        [
          @Checkbox(),
          'Enable automatic certificates via certbot/letsencrypt'
        ],

    @field.Field('no_autorenew') ::
      @Label ::
        [
          @Checkbox(),
          "Prevent automatic periodic (12h interval) renewal of certbot/letsencrypt certificates. Note
           that periodic renewal requires a webserver to be runnining - see the 
           conductance documentation for 'updateCredentials'."
        ],

    @Div :: @TextField({
      name: 'email',
      label: 'Email',
      help: "An email address is required to prevent loss of access to the certificate, and receive
           notices about impending expiration (in case the periodic automated renewal process fails for any reason) or revocation."
    }),

    @Div :: @TextField({
      name: 'domains',
      label: 'Domains',
      help: "Comma and/or whitespace-separated list of domains for which to obtain a certificate"
    })
  ];
};
