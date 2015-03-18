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
  @summary Mandrill Email Service
*/

@ = require('mho:std');

exports.run = function(config, block) {
  console.log("Starting Mandrill Email Service: ");
  try {
    block(
      {
        send: (to, message) ->
          @http.post('https://mandrillapp.com/api/1.0/messages/send.json',
                     {
                       key: config.key,
                       message: @merge(message, {to: [{email:to}]})
                     } .. JSON.stringify
                    )
      }
    );
  }
  finally {
    console.log("Shutting down Mandrill Email Service");
  }
};
