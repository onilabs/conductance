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
  @summary Configuration helpers for OAuth-based Google Web API access
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
  return   [
             @P ::
               `Create a new Web Application Client ID using the 'APIs & auth' settings for your
                project under the 
                ${@A("Google Developers Console", {href:'https://console.developers.google.com'})
                and enter the client details here.
               `,

             @P ::
               `You should set the 'JAVASCRIPT ORIGINS' to a list of all domains 
                that your application will
                run from, and add a 'REDIRECT URI' of the form 'DOMAIN/__oauthcallback' 
                for each of the domains.
               `,

             @Div :: @TextField({
               name: 'client_id',
               label: 'Client ID'
             }),

             @Div :: @TextField({
               name: 'client_secret',
               label: 'Client Secret'
             })
           ]
};
