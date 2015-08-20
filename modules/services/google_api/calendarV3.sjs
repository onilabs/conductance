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
   @summary Calendar API
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

exports.calendarList = {

  /**
     @function calendarList.list
     @summary Returns entries on the user's calendar list.
     @param  {Object} [settings]
     @setting  {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting  {optional String} [minAccessRole] The minimum access role for the user in the returned entries. Optional. The default is no restriction.
     @setting  {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting  {optional Boolean} [showDeleted] Whether to include deleted calendar list entries in the result. Optional. The default is False.
     @setting  {optional Boolean} [showHidden] - Whether to show hidden entries. Optional. The default is False.
     @setting  {optional String} [syncToken] - Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. If only read-only fields such as calendar properties or ACLs have changed, the entry won't be returned. All entries deleted and hidden since the previous list request will always be in the result set and it is not allowed to set showDeleted neither showHidden to False. To ensure client state consistency minAccessRole query parameter cannot be specified together with nextSyncToken. If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken. Learn more about incremental synchronization. Optional. The default is to return all entries.
   */
  list: function(client, params) {
    var parameters = {
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      params: params,
      requiredParams: [],
      pathParams: []
    };
    
    return client .. @helpers.performRequest(parameters);
  }  
};
