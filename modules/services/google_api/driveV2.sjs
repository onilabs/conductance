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
   @summary Drive API
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

exports.files = {

  /**
     @function files.list
     @summary Lists the user's files.
     @param  {Object} [settings]
     @setting {optional String}  [corpus] The body of items (files/documents) to which the query applies.
     @setting {optional Integer} [maxResults] Maximum number of files to return.
     @setting {optional String}  [pageToken]  Page token for files.
     @setting {optional String}  [projection] This parameter is deprecated and has no function.
     @setting  {optional String} [q] Query string for searching files.
     @setting  {optional String} [spaces] A comma-separated list of spaces to query. Supported values are 'drive' and 'appDataFolder'.
   */
  list: function(client, params) {
    var parameters = {
      url: 'https://www.googleapis.com/drive/v2/files',
      params: params,
      requiredParams: [],
      pathParams: [],
    };
    
    return client .. @helpers.performRequest(parameters);
  }
};

