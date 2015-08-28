// This file was originally generated using conductance/tools/google/generate-google-api gmail

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
  @summary Gmail API v1 - The Gmail REST API.
  @desc
    Revision 20150805

    See also https://developers.google.com/gmail/api/.
*/

@ = require([
  'mho:std'
]);

/**
   @class Draft
   @summary Google API JSON structure
   
   @variable Draft.id
   @summary String - The immutable ID of the draft.
   
   @variable Draft.message
   @summary [::Message] - The message content of the draft.
   
   @class History
   @summary Google API JSON structure
   
   @variable History.id
   @summary String - The mailbox sequence ID.
   
   @variable History.labelsAdded
   @summary Array - Labels added to messages in this history record.
   
   @variable History.labelsRemoved
   @summary Array - Labels removed from messages in this history record.
   
   @variable History.messages
   @summary Array - List of messages changed in this history record. The fields for specific change types, such as messagesAdded may duplicate messages in this field. We recommend using the specific change-type fields instead of this.
   
   @variable History.messagesAdded
   @summary Array - Messages added to the mailbox in this history record.
   
   @variable History.messagesDeleted
   @summary Array - Messages deleted (not Trashed) from the mailbox in this history record.
   
   @class HistoryLabelAdded
   @summary Google API JSON structure
   
   @variable HistoryLabelAdded.labelIds
   @summary Array - Label IDs added to the message.
   
   @variable HistoryLabelAdded.message
   @summary [::Message]
   
   @class HistoryLabelRemoved
   @summary Google API JSON structure
   
   @variable HistoryLabelRemoved.labelIds
   @summary Array - Label IDs removed from the message.
   
   @variable HistoryLabelRemoved.message
   @summary [::Message]
   
   @class HistoryMessageAdded
   @summary Google API JSON structure
   
   @variable HistoryMessageAdded.message
   @summary [::Message]
   
   @class HistoryMessageDeleted
   @summary Google API JSON structure
   
   @variable HistoryMessageDeleted.message
   @summary [::Message]
   
   @class Label
   @summary Google API JSON structure
   
   @variable Label.id
   @summary String - The immutable ID of the label.
   
   @variable Label.labelListVisibility
   @summary String - The visibility of the label in the label list in the Gmail web interface.
   
   @variable Label.messageListVisibility
   @summary String - The visibility of the label in the message list in the Gmail web interface.
   
   @variable Label.messagesTotal
   @summary Integer - The total number of messages with the label.
   
   @variable Label.messagesUnread
   @summary Integer - The number of unread messages with the label.
   
   @variable Label.name
   @summary String - The display name of the label.
   
   @variable Label.threadsTotal
   @summary Integer - The total number of threads with the label.
   
   @variable Label.threadsUnread
   @summary Integer - The number of unread threads with the label.
   
   @variable Label.type
   @summary String - The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads.
   
   @class ListDraftsResponse
   @summary Google API JSON structure
   
   @variable ListDraftsResponse.drafts
   @summary Array - List of drafts.
   
   @variable ListDraftsResponse.nextPageToken
   @summary String - Token to retrieve the next page of results in the list.
   
   @variable ListDraftsResponse.resultSizeEstimate
   @summary Integer - Estimated total number of results.
   
   @class ListHistoryResponse
   @summary Google API JSON structure
   
   @variable ListHistoryResponse.history
   @summary Array - List of history records. Any messages contained in the response will typically only have id and threadId fields populated.
   
   @variable ListHistoryResponse.historyId
   @summary String - The ID of the mailbox's current history record.
   
   @variable ListHistoryResponse.nextPageToken
   @summary String - Page token to retrieve the next page of results in the list.
   
   @class ListLabelsResponse
   @summary Google API JSON structure
   
   @variable ListLabelsResponse.labels
   @summary Array - List of labels.
   
   @class ListMessagesResponse
   @summary Google API JSON structure
   
   @variable ListMessagesResponse.messages
   @summary Array - List of messages.
   
   @variable ListMessagesResponse.nextPageToken
   @summary String - Token to retrieve the next page of results in the list.
   
   @variable ListMessagesResponse.resultSizeEstimate
   @summary Integer - Estimated total number of results.
   
   @class ListThreadsResponse
   @summary Google API JSON structure
   
   @variable ListThreadsResponse.nextPageToken
   @summary String - Page token to retrieve the next page of results in the list.
   
   @variable ListThreadsResponse.resultSizeEstimate
   @summary Integer - Estimated total number of results.
   
   @variable ListThreadsResponse.threads
   @summary Array - List of threads.
   
   @class Message
   @summary Google API JSON structure
   
   @variable Message.historyId
   @summary String - The ID of the last history record that modified this message.
   
   @variable Message.id
   @summary String - The immutable ID of the message.
   
   @variable Message.internalDate
   @summary String - The internal message creation timestamp (epoch ms), which determines ordering in the inbox. For normal SMTP-received email, this represents the time the message was originally accepted by Google, which is more reliable than the Date header. However, for API-migrated mail, it can be configured by client to be based on the Date header.
   
   @variable Message.labelIds
   @summary Array - List of IDs of labels applied to this message.
   
   @variable Message.payload
   @summary [::MessagePart] - The parsed email structure in the message parts.
   
   @variable Message.raw
   @summary String - The entire email message in an RFC 2822 formatted and base64url encoded string. Returned in messages.get and drafts.get responses when the format=RAW parameter is supplied.
   
   @variable Message.sizeEstimate
   @summary Integer - Estimated size in bytes of the message.
   
   @variable Message.snippet
   @summary String - A short part of the message text.
   
   @variable Message.threadId
   @summary String - The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: 
   - The requested threadId must be specified on the Message or Draft.Message you supply with your request. 
   - The References and In-Reply-To headers must be set in compliance with the RFC 2822 standard. 
   - The Subject headers must match.
   
   @class MessagePart
   @summary Google API JSON structure
   
   @variable MessagePart.body
   @summary [::MessagePartBody] - The message part body for this part, which may be empty for container MIME message parts.
   
   @variable MessagePart.filename
   @summary String - The filename of the attachment. Only present if this message part represents an attachment.
   
   @variable MessagePart.headers
   @summary Array - List of headers on this message part. For the top-level message part, representing the entire message payload, it will contain the standard RFC 2822 email headers such as To, From, and Subject.
   
   @variable MessagePart.mimeType
   @summary String - The MIME type of the message part.
   
   @variable MessagePart.partId
   @summary String - The immutable ID of the message part.
   
   @variable MessagePart.parts
   @summary Array - The child MIME message parts of this part. This only applies to container MIME message parts, for example multipart/*. For non- container MIME message part types, such as text/plain, this field is empty. For more information, see RFC 1521.
   
   @class MessagePartBody
   @summary Google API JSON structure
   
   @variable MessagePartBody.attachmentId
   @summary String - When present, contains the ID of an external attachment that can be retrieved in a separate messages.attachments.get request. When not present, the entire content of the message part body is contained in the data field.
   
   @variable MessagePartBody.data
   @summary String - The body data of a MIME message part. May be empty for MIME container types that have no message body or when the body data is sent as a separate attachment. An attachment ID is present if the body data is contained in a separate attachment.
   
   @variable MessagePartBody.size
   @summary Integer - Total number of bytes in the body of the message part.
   
   @class MessagePartHeader
   @summary Google API JSON structure
   
   @variable MessagePartHeader.name
   @summary String - The name of the header before the : separator. For example, To.
   
   @variable MessagePartHeader.value
   @summary String - The value of the header after the : separator. For example, someuser@example.com.
   
   @class ModifyMessageRequest
   @summary Google API JSON structure
   
   @variable ModifyMessageRequest.addLabelIds
   @summary Array - A list of IDs of labels to add to this message.
   
   @variable ModifyMessageRequest.removeLabelIds
   @summary Array - A list IDs of labels to remove from this message.
   
   @class ModifyThreadRequest
   @summary Google API JSON structure
   
   @variable ModifyThreadRequest.addLabelIds
   @summary Array - A list of IDs of labels to add to this thread.
   
   @variable ModifyThreadRequest.removeLabelIds
   @summary Array - A list of IDs of labels to remove from this thread.
   
   @class Profile
   @summary Google API JSON structure
   
   @variable Profile.emailAddress
   @summary String - The user's email address.
   
   @variable Profile.historyId
   @summary String - The ID of the mailbox's current history record.
   
   @variable Profile.messagesTotal
   @summary Integer - The total number of messages in the mailbox.
   
   @variable Profile.threadsTotal
   @summary Integer - The total number of threads in the mailbox.
   
   @class Thread
   @summary Google API JSON structure
   
   @variable Thread.historyId
   @summary String - The ID of the last history record that modified this thread.
   
   @variable Thread.id
   @summary String - The unique ID of the thread.
   
   @variable Thread.messages
   @summary Array - The list of messages in the thread.
   
   @variable Thread.snippet
   @summary String - A short part of the message text.
   
   @class WatchRequest
   @summary Google API JSON structure
   
   @variable WatchRequest.labelFilterAction
   @summary String - Filtering behavior of labelIds list specified.
   
   @variable WatchRequest.labelIds
   @summary Array - List of label_ids to restrict notifications about. By default, if unspecified, all changes are pushed out. If specified then dictates which labels are required for a push notification to be generated.
   
   @variable WatchRequest.topicName
   @summary String - A fully qualified Google Cloud Pub/Sub API topic name to publish the events to. This topic name **must** already exist in Cloud Pub/Sub and you **must** have already granted gmail "publish" permission on it. For example, "projects/my-project-identifier/topics/my-topic-name" (using the new Cloud Pub/Sub "v1beta2" topic naming format).
   
   Note that the "my-project-identifier" portion must exactly match your Google developer project id (the one executing this watch request).
   
   @class WatchResponse
   @summary Google API JSON structure
   
   @variable WatchResponse.expiration
   @summary String - When Gmail will stop sending notifications for mailbox updates (epoch millis). Call watch again before this time to renew the watch.
   
   @variable WatchResponse.historyId
   @summary String - The ID of the mailbox's current history record.
*/

exports.users = {

  /**
     @function users.getProfile
     @summary  Gets the current user's Gmail profile.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {::Profile}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
        * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
        * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
  */
  getProfile: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/gmail/v1/users/{userId}/profile',
      params: params,
      requiredParams: ['userId'],
      pathParams: ['userId']
    });
  },
  
  /**
     @function users.stop
     @summary  Stop receiving push notifications for the given user mailbox.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
        * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
  */
  stop: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/gmail/v1/users/{userId}/stop',
      params: params,
      requiredParams: ['userId'],
      pathParams: ['userId']
    });
  },
  
  /**
     @function users.watch
     @summary  Set up or update a push notification watch on the given user mailbox.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::WatchRequest} [resource] Data of [::WatchRequest] structure
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {::WatchResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
        * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/gmail/v1/users/{userId}/watch',
      params: params,
      requiredParams: ['userId'],
      pathParams: ['userId']
    });
  },
  
  drafts: {
  
    /**
       @function users.drafts.create
       @summary  Creates a new draft with the DRAFT label.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Draft} [resource] Data of [::Draft] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Draft}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    create: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/drafts',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.drafts.delete
       @summary  Immediately and permanently deletes the specified draft. Does not simply trash it.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the draft to delete. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    'delete': function(client, params) {
      return client.performRequest({
        method: 'DELETE',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.drafts.get
       @summary  Gets the specified draft.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional String} [format] The format to return the draft in.
       @setting {String} [id] The ID of the draft to retrieve. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Draft}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    get: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.drafts.list
       @summary  Lists the drafts in the user's mailbox.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional Integer} [maxResults] Maximum number of drafts to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListDraftsResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    list: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.drafts.send
       @summary  Sends the specified, existing draft to the recipients in the To, Cc, and Bcc headers.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Draft} [resource] Data of [::Draft] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    send: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts/send',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/drafts/send',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.drafts.update
       @summary  Replaces a draft's content.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Draft} [resource] Data of [::Draft] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {String} [id] The ID of the draft to update. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Draft}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    update: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/drafts/{id}',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/drafts/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    }
  },
  
  history: {
  
    /**
       @function users.history.list
       @summary  Lists the history of all changes to the given mailbox. History results are returned in chronological order (increasing historyId).
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional String} [labelId] Only return messages with a label matching the ID.
       @setting {optional Integer} [maxResults] The maximum number of history records to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [startHistoryId] Required. Returns history records after the specified startHistoryId. The supplied startHistoryId should be obtained from the historyId of a message, thread, or previous list response. History IDs increase chronologically but are not contiguous with random gaps in between valid IDs. Supplying an invalid or out of date startHistoryId typically returns an HTTP 404 error code. A historyId is typically valid for at least a week, but in some rare circumstances may be valid for only a few hours. If you receive an HTTP 404 error response, your application should perform a full sync. If you receive no nextPageToken in the response, there are no updates to retrieve and you can store the returned historyId for a future request.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListHistoryResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    list: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/history',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    }
  },
  
  labels: {
  
    /**
       @function users.labels.create
       @summary  Creates a new label.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Label} [resource] Data of [::Label] structure
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Label}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    create: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.labels.delete
       @summary  Immediately and permanently deletes the specified label and removes it from any messages and threads that it is applied to.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the label to delete. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    'delete': function(client, params) {
      return client.performRequest({
        method: 'DELETE',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.labels.get
       @summary  Gets the specified label.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the label to retrieve. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Label}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    get: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.labels.list
       @summary  Lists all labels in the user's mailbox.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListLabelsResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    list: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.labels.patch
       @summary  Updates the specified label. This method supports patch semantics.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Label} [resource] Data of [::Label] structure
       @setting {String} [id] The ID of the label to update. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Label}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    patch: function(client, params) {
      return client.performRequest({
        method: 'PATCH',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.labels.update
       @summary  Updates the specified label.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Label} [resource] Data of [::Label] structure
       @setting {String} [id] The ID of the label to update. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Label}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    update: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/labels/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    }
  },
  
  messages: {
  
    /**
       @function users.messages.delete
       @summary  Immediately and permanently deletes the specified message. This operation cannot be undone. Prefer messages.trash instead.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the message to delete. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
    */
    'delete': function(client, params) {
      return client.performRequest({
        method: 'DELETE',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.messages.get
       @summary  Gets the specified message.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional String} [format] The format to return the message in.
       @setting {String} [id] The ID of the message to retrieve. **Required**
       @setting {optional String} [metadataHeaders] When given and format is METADATA, only include headers specified.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    get: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.messages.import
       @summary  Imports a message into only this user's mailbox, with standard email delivery scanning and classification similar to receiving via SMTP. Does not send a message.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Message} [resource] Data of [::Message] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {optional Boolean} [deleted] Mark the email as permanently deleted (not TRASH) and only visible in Google Apps Vault to a Vault administrator. Only used for Google Apps for Work accounts.
       @setting {optional String} [internalDateSource] Source for Gmail's internal date of the message.
       @setting {optional Boolean} [neverMarkSpam] Ignore the Gmail spam classifier decision and never mark this email as SPAM in the mailbox.
       @setting {optional Boolean} [processForCalendar] Process calendar invites in the email and add any extracted meetings to the Google Calendar for this user.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.insert - Insert mail into your mailbox
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    'import': function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/import',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/messages/import',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.insert
       @summary  Directly inserts a message into only this user's mailbox similar to IMAP APPEND, bypassing most scanning and classification. Does not send a message.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Message} [resource] Data of [::Message] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {optional Boolean} [deleted] Mark the email as permanently deleted (not TRASH) and only visible in Google Apps Vault to a Vault administrator. Only used for Google Apps for Work accounts.
       @setting {optional String} [internalDateSource] Source for Gmail's internal date of the message.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.insert - Insert mail into your mailbox
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    insert: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/messages',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.list
       @summary  Lists the messages in the user's mailbox.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional Boolean} [includeSpamTrash] Include messages from SPAM and TRASH in the results.
       @setting {optional String} [labelIds] Only return messages with labels that match all of the specified label IDs.
       @setting {optional Integer} [maxResults] Maximum number of messages to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListMessagesResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    list: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.modify
       @summary  Modifies the labels on the specified message.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::ModifyMessageRequest} [resource] Data of [::ModifyMessageRequest] structure
       @setting {String} [id] The ID of the message to modify. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    modify: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}/modify',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.messages.send
       @summary  Sends the specified message to the recipients in the To, Cc, and Bcc headers.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::Message} [resource] Data of [::Message] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.send - Send email on your behalf
    */
    send: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/send',
        mediaUrl: 'https://www.googleapis.com/upload/gmail/v1/users/{userId}/messages/send',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.trash
       @summary  Moves the specified message to the trash.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the message to Trash. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    trash: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}/trash',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.messages.untrash
       @summary  Removes the specified message from the trash.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the message to remove from Trash. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Message}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    untrash: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{id}/untrash',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    attachments: {
    
      /**
         @function users.messages.attachments.get
         @summary  Gets the specified message attachment.
         @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
         @param {Object} [settings] API call parameters
         @setting {String} [id] The ID of the attachment. **Required**
         @setting {String} [messageId] The ID of the message containing the attachment. **Required**
         @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
         @return {::MessagePartBody}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
      */
      get: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/{messageId}/attachments/{id}',
          params: params,
          requiredParams: ['id', 'messageId', 'userId'],
          pathParams: ['id', 'messageId', 'userId']
        });
      }
    }
  },
  
  threads: {
  
    /**
       @function users.threads.delete
       @summary  Immediately and permanently deletes the specified thread. This operation cannot be undone. Prefer threads.trash instead.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] ID of the Thread to delete. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
    */
    'delete': function(client, params) {
      return client.performRequest({
        method: 'DELETE',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.threads.get
       @summary  Gets the specified thread.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional String} [format] The format to return the messages in.
       @setting {String} [id] The ID of the thread to retrieve. **Required**
       @setting {optional String} [metadataHeaders] When given and format is METADATA, only include headers specified.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Thread}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    get: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads/{id}',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.threads.list
       @summary  Lists the threads in the user's mailbox.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {optional Boolean} [includeSpamTrash] Include threads from SPAM and TRASH in the results.
       @setting {optional String} [labelIds] Only return threads with labels that match all of the specified label IDs.
       @setting {optional Integer} [maxResults] Maximum number of threads to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return threads matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListThreadsResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
    */
    list: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.threads.modify
       @summary  Modifies the labels applied to the thread. This applies to all messages in the thread.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {::ModifyThreadRequest} [resource] Data of [::ModifyThreadRequest] structure
       @setting {String} [id] The ID of the thread to modify. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Thread}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    modify: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads/{id}/modify',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.threads.trash
       @summary  Moves the specified thread to the trash.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the thread to Trash. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Thread}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    trash: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads/{id}/trash',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    },
    
    /**
       @function users.threads.untrash
       @summary  Removes the specified thread from the trash.
       @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the thread to remove from Trash. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Thread}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    untrash: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/threads/{id}/untrash',
        params: params,
        requiredParams: ['id', 'userId'],
        pathParams: ['id', 'userId']
      });
    }
  }
};
