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
   @summary GMail API
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

exports.users = {

  messages: {
    
    /**
       @function users.messages.list
       @summary Lists the messages in the user's mailbox
       @param  {GoogleAPIClient}
       @param  {Object} [settings]
       @setting {string} [userId] The user's email address. The special value `me` can be used to indicate the authenticated user.
       @setting {optional Boolean} [includeSpamTrash] Include messages from SPAM and TRASH in the results.
       @setting {optional String} [labelIds] Only return messages with labels that match all of the specified label IDs.
       @setting {optional Integer} [maxResults] Maximum number of messages to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
       
    */
    list: function(client, params) {
      var parameters = {
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      };

      return client .. @helpers.performRequest(parameters);
    },

    /**
       @function users.messages.get
       @summary Gets the specified message.
    
       @param   {Object} [settings]
       @setting {optional String} [format] The format to return the message in.
       @setting {String} [id] The ID of the message to retrieve.
       @setting {optional String} [metadataHeaders] When given and format is METADATA, only include headers specified.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user.
    */
    get: function(client, params) {
        var parameters = {
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}',
          params: params,
          requiredParams: ['userId', 'id'],
          pathParams: ['id', 'userId']
        };

        return client .. @helpers.performRequest(parameters);
      },

    
  }
  
};
