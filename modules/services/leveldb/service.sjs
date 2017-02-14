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
  @summary LevelDB Service
*/

@ = require([
  'mho:std',
  {id:'mho:flux/kv', name:'kv'}
]);

/**
   @function run
   @summary Run the service
   @param {Object} [config] Configuration object, as e.g. created by [mho:services::provisioningUI]
   @param {Function} [block] Function bounding lifetime of service; will be passed a service instance.
   @desc
      Usually implicitly run by [mho:services::withServices]
 */
exports.run = function(config, block) {
  config.path = config.path.replace('$configRoot/', @env.configRoot());
  
  console.log("Starting LevelDB service with db at '#{config.path}'");
  try {
    @kv.LevelDB(config.path, block);
  }
  finally {
    console.log("Shutting down LevelDB service");
  }
};
