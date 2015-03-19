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
  @summary OAuth-based Google Web API access
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
  console.log("Starting Google Web APIs service");
  try {
    block(config);
  }
  finally {
    console.log("Shutting down Google Web APIs service");
  }
};
