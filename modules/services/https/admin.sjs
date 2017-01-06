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
  @summary Configuration helpers for the HTTPS Service
  @hostenv xbrowser
  @nodoc
*/

// TODO: document

@ = require([
  'mho:std',
  'mho:surface/html',
  'mho:surface/components'
]);

exports.configui = function() {

  return [
    @P ::
      `Enabling this service implies that you agree to the ACME Subscriber Agreement - for details please see the <a href='https://certbot.eff.org/'>certbot docs</a>.`,

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
