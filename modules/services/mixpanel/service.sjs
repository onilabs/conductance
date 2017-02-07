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
  @summary Mixpanel Analytics Service
*/

@ = require('mho:std');

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::configUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a service instance.
   @desc
      Usually implicitly run by [mho:services::run]
 */
exports.run = function(config, block) {
  console.log("Starting Mixpanel Analytics Service: ");
  try {
    block(
      {
        track: function(event_name, properties) {

          var payload = {
            event: event_name,
            properties: (properties || {}) .. @merge({'token': config.token})
          } .. JSON.stringify .. @octetsToBase64;
          
          try {
            return (@http.get("http://api.mixpanel.com/track/?data=#{payload}") == 1);
          }
          catch (e) {
            console.log("Mixpanel track() error: #{e}");
            return false;
          }
        },

        engage: function(distinct_id, attributes) {
          
          var payload = (attributes || {}) .. @merge({
            $token: config.token,
            $distinct_id: distinct_id
          }) .. JSON.stringify .. @octetsToBase64;
          
          try {
            return (@http.get("http://api.mixpanel.com/engage/?data=#{payload}") == 1);
          }
          catch (e) {
            console.log("Mixpanel engage() error: #{e}");
            return false;
          }
        }
      }
    );
  }
  finally {
    console.log("Shutting down Mixpanel Analytics Service");
  }
};
