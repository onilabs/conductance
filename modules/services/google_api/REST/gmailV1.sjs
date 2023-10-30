// This file was originally generated using conductance/tools/google/generate-google-api gmail

/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */


/**
  @summary Gmail API v1 - Access Gmail mailboxes including sending user email.
  @desc
    Revision 20170131

    See also https://developers.google.com/gmail/api/.
*/

@ = require([
  'mho:std'
]);

/**
   @class AutoForwarding
   @summary Google API JSON structure
   
   @variable AutoForwarding.disposition
   @summary String - The state that a message should be left in after it has been forwarded.
   
   @variable AutoForwarding.emailAddress
   @summary String - Email address to which all incoming messages are forwarded. This email address must be a verified member of the forwarding addresses.
   
   @variable AutoForwarding.enabled
   @summary Boolean - Whether all incoming mail is automatically forwarded to another address.
   
   @class BatchDeleteMessagesRequest
   @summary Google API JSON structure
   
   @variable BatchDeleteMessagesRequest.ids
   @summary Array - The IDs of the messages to delete.
   
   @class BatchModifyMessagesRequest
   @summary Google API JSON structure
   
   @variable BatchModifyMessagesRequest.addLabelIds
   @summary Array - A list of label IDs to add to messages.
   
   @variable BatchModifyMessagesRequest.ids
   @summary Array - The IDs of the messages to modify. There is a limit of 1000 ids per request.
   
   @variable BatchModifyMessagesRequest.removeLabelIds
   @summary Array - A list of label IDs to remove from messages.
   
   @class Draft
   @summary Google API JSON structure
   
   @variable Draft.id
   @summary String - The immutable ID of the draft.
   
   @variable Draft.message
   @summary [::Message] - The message content of the draft.
   
   @class Filter
   @summary Google API JSON structure
   
   @variable Filter.action
   @summary [::FilterAction] - Action that the filter performs.
   
   @variable Filter.criteria
   @summary [::FilterCriteria] - Matching criteria for the filter.
   
   @variable Filter.id
   @summary String - The server assigned ID of the filter.
   
   @class FilterAction
   @summary Google API JSON structure
   
   @variable FilterAction.addLabelIds
   @summary Array - List of labels to add to the message.
   
   @variable FilterAction.forward
   @summary String - Email address that the message should be forwarded to.
   
   @variable FilterAction.removeLabelIds
   @summary Array - List of labels to remove from the message.
   
   @class FilterCriteria
   @summary Google API JSON structure
   
   @variable FilterCriteria.excludeChats
   @summary Boolean - Whether the response should exclude chats.
   
   @variable FilterCriteria.from
   @summary String - The sender's display name or email address.
   
   @variable FilterCriteria.hasAttachment
   @summary Boolean - Whether the message has any attachment.
   
   @variable FilterCriteria.negatedQuery
   @summary String - Only return messages not matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
   
   @variable FilterCriteria.query
   @summary String - Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
   
   @variable FilterCriteria.size
   @summary Integer - The size of the entire RFC822 message in bytes, including all headers and attachments.
   
   @variable FilterCriteria.sizeComparison
   @summary String - How the message size in bytes should be in relation to the size field.
   
   @variable FilterCriteria.subject
   @summary String - Case-insensitive phrase found in the message's subject. Trailing and leading whitespace are be trimmed and adjacent spaces are collapsed.
   
   @variable FilterCriteria.to
   @summary String - The recipient's display name or email address. Includes recipients in the "to", "cc", and "bcc" header fields. You can use simply the local part of the email address. For example, "example" and "example@" both match "example@gmail.com". This field is case-insensitive.
   
   @class ForwardingAddress
   @summary Google API JSON structure
   
   @variable ForwardingAddress.forwardingEmail
   @summary String - An email address to which messages can be forwarded.
   
   @variable ForwardingAddress.verificationStatus
   @summary String - Indicates whether this address has been verified and is usable for forwarding. Read-only.
   
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
   
   @class ImapSettings
   @summary Google API JSON structure
   
   @variable ImapSettings.autoExpunge
   @summary Boolean - If this value is true, Gmail will immediately expunge a message when it is marked as deleted in IMAP. Otherwise, Gmail will wait for an update from the client before expunging messages marked as deleted.
   
   @variable ImapSettings.enabled
   @summary Boolean - Whether IMAP is enabled for the account.
   
   @variable ImapSettings.expungeBehavior
   @summary String - The action that will be executed on a message when it is marked as deleted and expunged from the last visible IMAP folder.
   
   @variable ImapSettings.maxFolderSize
   @summary Integer - An optional limit on the number of messages that an IMAP folder may contain. Legal values are 0, 1000, 2000, 5000 or 10000. A value of zero is interpreted to mean that there is no limit.
   
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
   
   @class ListFiltersResponse
   @summary Google API JSON structure
   
   @variable ListFiltersResponse.filter
   @summary Array - List of a user's filters.
   
   @class ListForwardingAddressesResponse
   @summary Google API JSON structure
   
   @variable ListForwardingAddressesResponse.forwardingAddresses
   @summary Array - List of addresses that may be used for forwarding.
   
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
   
   @class ListSendAsResponse
   @summary Google API JSON structure
   
   @variable ListSendAsResponse.sendAs
   @summary Array - List of send-as aliases.
   
   @class ListSmimeInfoResponse
   @summary Google API JSON structure
   
   @variable ListSmimeInfoResponse.smimeInfo
   @summary Array - List of SmimeInfo.
   
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
   @summary String - The body data of a MIME message part as a base64url encoded string. May be empty for MIME container types that have no message body or when the body data is sent as a separate attachment. An attachment ID is present if the body data is contained in a separate attachment.
   
   @variable MessagePartBody.size
   @summary Integer - Number of bytes for the message part data (encoding notwithstanding).
   
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
   
   @class PopSettings
   @summary Google API JSON structure
   
   @variable PopSettings.accessWindow
   @summary String - The range of messages which are accessible via POP.
   
   @variable PopSettings.disposition
   @summary String - The action that will be executed on a message after it has been fetched via POP.
   
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
   
   @class SendAs
   @summary Google API JSON structure
   
   @variable SendAs.displayName
   @summary String - A name that appears in the "From:" header for mail sent using this alias. For custom "from" addresses, when this is empty, Gmail will populate the "From:" header with the name that is used for the primary address associated with the account.
   
   @variable SendAs.isDefault
   @summary Boolean - Whether this address is selected as the default "From:" address in situations such as composing a new message or sending a vacation auto-reply. Every Gmail account has exactly one default send-as address, so the only legal value that clients may write to this field is true. Changing this from false to true for an address will result in this field becoming false for the other previous default address.
   
   @variable SendAs.isPrimary
   @summary Boolean - Whether this address is the primary address used to login to the account. Every Gmail account has exactly one primary address, and it cannot be deleted from the collection of send-as aliases. This field is read-only.
   
   @variable SendAs.replyToAddress
   @summary String - An optional email address that is included in a "Reply-To:" header for mail sent using this alias. If this is empty, Gmail will not generate a "Reply-To:" header.
   
   @variable SendAs.sendAsEmail
   @summary String - The email address that appears in the "From:" header for mail sent using this alias. This is read-only for all operations except create.
   
   @variable SendAs.signature
   @summary String - An optional HTML signature that is included in messages composed with this alias in the Gmail web UI.
   
   @variable SendAs.smtpMsa
   @summary [::SmtpMsa] - An optional SMTP service that will be used as an outbound relay for mail sent using this alias. If this is empty, outbound mail will be sent directly from Gmail's servers to the destination SMTP service. This setting only applies to custom "from" aliases.
   
   @variable SendAs.treatAsAlias
   @summary Boolean - Whether Gmail should  treat this address as an alias for the user's primary email address. This setting only applies to custom "from" aliases.
   
   @variable SendAs.verificationStatus
   @summary String - Indicates whether this address has been verified for use as a send-as alias. Read-only. This setting only applies to custom "from" aliases.
   
   @class SmimeInfo
   @summary Google API JSON structure
   
   @variable SmimeInfo.encryptedKeyPassword
   @summary String - Encrypted key password, when key is encrypted.
   
   @variable SmimeInfo.expiration
   @summary String - When the certificate expires (in milliseconds since epoch).
   
   @variable SmimeInfo.id
   @summary String - The immutable ID for the SmimeInfo.
   
   @variable SmimeInfo.isDefault
   @summary Boolean - Whether this SmimeInfo is the default one for this user's send-as address.
   
   @variable SmimeInfo.issuerCn
   @summary String - The S/MIME certificate issuer's common name.
   
   @variable SmimeInfo.pem
   @summary String - PEM formatted X509 concatenated certificate string (standard base64 encoding). Format used for returning key, which includes public key as well as certificate chain (not private key).
   
   @variable SmimeInfo.pkcs12
   @summary String - PKCS#12 format containing a single private/public key pair and certificate chain. This format is only accepted from client for creating a new SmimeInfo and is never returned, because the private key is not intended to be exported. PKCS#12 may be encrypted, in which case encryptedKeyPassword should be set appropriately.
   
   @class SmtpMsa
   @summary Google API JSON structure
   
   @variable SmtpMsa.host
   @summary String - The hostname of the SMTP service. Required.
   
   @variable SmtpMsa.password
   @summary String - The password that will be used for authentication with the SMTP service. This is a write-only field that can be specified in requests to create or update SendAs settings; it is never populated in responses.
   
   @variable SmtpMsa.port
   @summary Integer - The port of the SMTP service. Required.
   
   @variable SmtpMsa.securityMode
   @summary String - The protocol that will be used to secure communication with the SMTP service. Required.
   
   @variable SmtpMsa.username
   @summary String - The username that will be used for authentication with the SMTP service. This is a write-only field that can be specified in requests to create or update SendAs settings; it is never populated in responses.
   
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
   
   @class VacationSettings
   @summary Google API JSON structure
   
   @variable VacationSettings.enableAutoReply
   @summary Boolean - Flag that controls whether Gmail automatically replies to messages.
   
   @variable VacationSettings.endTime
   @summary String - An optional end time for sending auto-replies (epoch ms). When this is specified, Gmail will automatically reply only to messages that it receives before the end time. If both startTime and endTime are specified, startTime must precede endTime.
   
   @variable VacationSettings.responseBodyHtml
   @summary String - Response body in HTML format. Gmail will sanitize the HTML before storing it.
   
   @variable VacationSettings.responseBodyPlainText
   @summary String - Response body in plain text format.
   
   @variable VacationSettings.responseSubject
   @summary String - Optional text to prepend to the subject line in vacation responses. In order to enable auto-replies, either the response subject or the response body must be nonempty.
   
   @variable VacationSettings.restrictToContacts
   @summary Boolean - Flag that determines whether responses are sent to recipients who are not in the user's list of contacts.
   
   @variable VacationSettings.restrictToDomain
   @summary Boolean - Flag that determines whether responses are sent to recipients who are outside of the user's domain. This feature is only available for G Suite users.
   
   @variable VacationSettings.startTime
   @summary String - An optional start time for sending auto-replies (epoch ms). When this is specified, Gmail will automatically reply only to messages that it receives after the start time. If both startTime and endTime are specified, startTime must precede endTime.
   
   @class WatchRequest
   @summary Google API JSON structure
   
   @variable WatchRequest.labelFilterAction
   @summary String - Filtering behavior of labelIds list specified.
   
   @variable WatchRequest.labelIds
   @summary Array - List of label_ids to restrict notifications about. By default, if unspecified, all changes are pushed out. If specified then dictates which labels are required for a push notification to be generated.
   
   @variable WatchRequest.topicName
   @summary String - A fully qualified Google Cloud Pub/Sub API topic name to publish the events to. This topic name **must** already exist in Cloud Pub/Sub and you **must** have already granted gmail "publish" permission on it. For example, "projects/my-project-identifier/topics/my-topic-name" (using the Cloud Pub/Sub "v1" topic naming format).
   
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
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {::Profile}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.compose - Manage drafts and send emails
        * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::WatchRequest} [resource] Data of [::WatchRequest] structure
     @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
     @return {::WatchResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://mail.google.com/ - View and manage your mail
        * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {optional Boolean} [includeSpamTrash] Include drafts from SPAM and TRASH in the results.
       @setting {optional Integer} [maxResults] Maximum number of drafts to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return draft messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread".
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {optional String} [historyTypes] History types to be returned by the function
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
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [id] The ID of the label to retrieve. **Required**
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::Label}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListLabelsResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.labels - Manage mailbox labels
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @function users.messages.batchDelete
       @summary  Deletes many messages by message ID. Provides no guarantees that messages were not already deleted or even existed at all.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::BatchDeleteMessagesRequest} [resource] Data of [::BatchDeleteMessagesRequest] structure
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
    */
    batchDelete: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/batchDelete',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.batchModify
       @summary  Modifies the labels on the specified messages.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::BatchModifyMessagesRequest} [resource] Data of [::BatchModifyMessagesRequest] structure
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {void}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
    */
    batchModify: function(client, params) {
      return client.performRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/messages/batchModify',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.messages.delete
       @summary  Immediately and permanently deletes the specified message. This operation cannot be undone. Prefer messages.trash instead.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::Message} [resource] Data of [::Message] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {optional Boolean} [deleted] Mark the email as permanently deleted (not TRASH) and only visible in Google Vault to a Vault administrator. Only used for G Suite accounts.
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
    import: function(client, params) {
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::Message} [resource] Data of [::Message] structure
       @setting {String} [media.mimeType] Mime type of media object (accepting message\/rfc822)
       @setting {String|nodejs Buffer} [media.body] Media contents (max size = 35MB)
       @setting {optional Boolean} [deleted] Mark the email as permanently deleted (not TRASH) and only visible in Google Vault to a Vault administrator. Only used for G Suite accounts.
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {optional Boolean} [includeSpamTrash] Include messages from SPAM and TRASH in the results.
       @setting {optional String} [labelIds] Only return messages with labels that match all of the specified label IDs.
       @setting {optional Integer} [maxResults] Maximum number of messages to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread". Parameter cannot be used when accessing the api using the gmail.metadata scope.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListMessagesResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
  
  settings: {
  
    /**
       @function users.settings.getAutoForwarding
       @summary  Gets the auto-forwarding setting for the specified account.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::AutoForwarding}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    getAutoForwarding: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/autoForwarding',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.getImap
       @summary  Gets IMAP settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::ImapSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    getImap: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/imap',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.getPop
       @summary  Gets POP settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::PopSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    getPop: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/pop',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.getVacation
       @summary  Gets vacation responder settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::VacationSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
          * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    getVacation: function(client, params) {
      return client.performRequest({
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/vacation',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.updateAutoForwarding
       @summary  Updates the auto-forwarding setting for the specified account. A verified forwarding address must be specified when auto-forwarding is enabled.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::AutoForwarding} [resource] Data of [::AutoForwarding] structure
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::AutoForwarding}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
    */
    updateAutoForwarding: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/autoForwarding',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.updateImap
       @summary  Updates IMAP settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::ImapSettings} [resource] Data of [::ImapSettings] structure
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::ImapSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    updateImap: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/imap',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.updatePop
       @summary  Updates POP settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::PopSettings} [resource] Data of [::PopSettings] structure
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::PopSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    updatePop: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/pop',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    /**
       @function users.settings.updateVacation
       @summary  Updates vacation responder settings.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {::VacationSettings} [resource] Data of [::VacationSettings] structure
       @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
       @return {::VacationSettings}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
    */
    updateVacation: function(client, params) {
      return client.performRequest({
        method: 'PUT',
        url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/vacation',
        params: params,
        requiredParams: ['userId'],
        pathParams: ['userId']
      });
    },
    
    filters: {
    
      /**
         @function users.settings.filters.create
         @summary  Creates a filter.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {::Filter} [resource] Data of [::Filter] structure
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::Filter}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      create: function(client, params) {
        return client.performRequest({
          method: 'POST',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/filters',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      },
      
      /**
         @function users.settings.filters.delete
         @summary  Deletes a filter.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [id] The ID of the filter to be deleted. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {void}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      'delete': function(client, params) {
        return client.performRequest({
          method: 'DELETE',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/filters/{id}',
          params: params,
          requiredParams: ['id', 'userId'],
          pathParams: ['id', 'userId']
        });
      },
      
      /**
         @function users.settings.filters.get
         @summary  Gets a filter.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [id] The ID of the filter to be fetched. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::Filter}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      get: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/filters/{id}',
          params: params,
          requiredParams: ['id', 'userId'],
          pathParams: ['id', 'userId']
        });
      },
      
      /**
         @function users.settings.filters.list
         @summary  Lists the message filters of a Gmail user.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::ListFiltersResponse}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      list: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/filters',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      }
    },
    
    forwardingAddresses: {
    
      /**
         @function users.settings.forwardingAddresses.create
         @summary  Creates a forwarding address. If ownership verification is required, a message will be sent to the recipient and the resource's verification status will be set to pending; otherwise, the resource will be created with verification status set to accepted.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {::ForwardingAddress} [resource] Data of [::ForwardingAddress] structure
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::ForwardingAddress}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      create: function(client, params) {
        return client.performRequest({
          method: 'POST',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/forwardingAddresses',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      },
      
      /**
         @function users.settings.forwardingAddresses.delete
         @summary  Deletes the specified forwarding address and revokes any verification that may have been required.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [forwardingEmail] The forwarding address to be deleted. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {void}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      'delete': function(client, params) {
        return client.performRequest({
          method: 'DELETE',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/forwardingAddresses/{forwardingEmail}',
          params: params,
          requiredParams: ['forwardingEmail', 'userId'],
          pathParams: ['forwardingEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.forwardingAddresses.get
         @summary  Gets the specified forwarding address.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [forwardingEmail] The forwarding address to be retrieved. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::ForwardingAddress}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      get: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/forwardingAddresses/{forwardingEmail}',
          params: params,
          requiredParams: ['forwardingEmail', 'userId'],
          pathParams: ['forwardingEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.forwardingAddresses.list
         @summary  Lists the forwarding addresses for the specified account.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::ListForwardingAddressesResponse}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      list: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/forwardingAddresses',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      }
    },
    
    sendAs: {
    
      /**
         @function users.settings.sendAs.create
         @summary  Creates a custom "from" send-as alias. If an SMTP MSA is specified, Gmail will attempt to connect to the SMTP service to validate the configuration before creating the alias. If ownership verification is required for the alias, a message will be sent to the email address and the resource's verification status will be set to pending; otherwise, the resource will be created with verification status set to accepted. If a signature is provided, Gmail will sanitize the HTML before saving it with the alias.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {::SendAs} [resource] Data of [::SendAs] structure
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::SendAs}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      create: function(client, params) {
        return client.performRequest({
          method: 'POST',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      },
      
      /**
         @function users.settings.sendAs.delete
         @summary  Deletes the specified send-as alias. Revokes any verification that may have been required for using it.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [sendAsEmail] The send-as alias to be deleted. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {void}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      'delete': function(client, params) {
        return client.performRequest({
          method: 'DELETE',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}',
          params: params,
          requiredParams: ['sendAsEmail', 'userId'],
          pathParams: ['sendAsEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.sendAs.get
         @summary  Gets the specified send-as alias. Fails with an HTTP 404 error if the specified address is not a member of the collection.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [sendAsEmail] The send-as alias to be retrieved. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::SendAs}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      get: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}',
          params: params,
          requiredParams: ['sendAsEmail', 'userId'],
          pathParams: ['sendAsEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.sendAs.list
         @summary  Lists the send-as aliases for the specified account. The result includes the primary send-as address associated with the account as well as any custom "from" aliases.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::ListSendAsResponse}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://mail.google.com/ - View and manage your mail
            * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
            * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
      */
      list: function(client, params) {
        return client.performRequest({
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs',
          params: params,
          requiredParams: ['userId'],
          pathParams: ['userId']
        });
      },
      
      /**
         @function users.settings.sendAs.patch
         @summary  Updates a send-as alias. If a signature is provided, Gmail will sanitize the HTML before saving it with the alias. This method supports patch semantics.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {::SendAs} [resource] Data of [::SendAs] structure
         @setting {String} [sendAsEmail] The send-as alias to be updated. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::SendAs}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      patch: function(client, params) {
        return client.performRequest({
          method: 'PATCH',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}',
          params: params,
          requiredParams: ['sendAsEmail', 'userId'],
          pathParams: ['sendAsEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.sendAs.update
         @summary  Updates a send-as alias. If a signature is provided, Gmail will sanitize the HTML before saving it with the alias.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {::SendAs} [resource] Data of [::SendAs] structure
         @setting {String} [sendAsEmail] The send-as alias to be updated. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {::SendAs}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      update: function(client, params) {
        return client.performRequest({
          method: 'PUT',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}',
          params: params,
          requiredParams: ['sendAsEmail', 'userId'],
          pathParams: ['sendAsEmail', 'userId']
        });
      },
      
      /**
         @function users.settings.sendAs.verify
         @summary  Sends a verification email to the specified send-as alias address. The verification status must be pending.
         @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
         @param {Object} [settings] API call parameters
         @setting {String} [sendAsEmail] The send-as alias to be verified. **Required**
         @setting {String} [userId] User's email address. The special value "me" can be used to indicate the authenticated user. **Required**
         @return {void}
         @desc
           #### Scopes
           This API call requires authorization with (at least one of) the following scope(s):
           
            * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
      */
      verify: function(client, params) {
        return client.performRequest({
          method: 'POST',
          url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/verify',
          params: params,
          requiredParams: ['sendAsEmail', 'userId'],
          pathParams: ['sendAsEmail', 'userId']
        });
      },
      
      smimeInfo: {
      
        /**
           @function users.settings.sendAs.smimeInfo.delete
           @summary  Deletes the specified S/MIME config for the specified send-as alias.
           @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
           @param {Object} [settings] API call parameters
           @setting {String} [id] The immutable ID for the SmimeInfo. **Required**
           @setting {String} [sendAsEmail] The email address that appears in the "From:" header for mail sent using this alias. **Required**
           @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
           @return {void}
           @desc
             #### Scopes
             This API call requires authorization with (at least one of) the following scope(s):
             
              * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
              * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
        */
        'delete': function(client, params) {
          return client.performRequest({
            method: 'DELETE',
            url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/smimeInfo/{id}',
            params: params,
            requiredParams: ['id', 'sendAsEmail', 'userId'],
            pathParams: ['id', 'sendAsEmail', 'userId']
          });
        },
        
        /**
           @function users.settings.sendAs.smimeInfo.get
           @summary  Gets the specified S/MIME config for the specified send-as alias.
           @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
           @param {Object} [settings] API call parameters
           @setting {String} [id] The immutable ID for the SmimeInfo. **Required**
           @setting {String} [sendAsEmail] The email address that appears in the "From:" header for mail sent using this alias. **Required**
           @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
           @return {::SmimeInfo}
           @desc
             #### Scopes
             This API call requires authorization with (at least one of) the following scope(s):
             
              * https://mail.google.com/ - View and manage your mail
              * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
              * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
              * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
              * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
        */
        get: function(client, params) {
          return client.performRequest({
            url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/smimeInfo/{id}',
            params: params,
            requiredParams: ['id', 'sendAsEmail', 'userId'],
            pathParams: ['id', 'sendAsEmail', 'userId']
          });
        },
        
        /**
           @function users.settings.sendAs.smimeInfo.insert
           @summary  Insert (upload) the given S/MIME config for the specified send-as alias. Note that pkcs12 format is required for the key.
           @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
           @param {Object} [settings] API call parameters
           @setting {::SmimeInfo} [resource] Data of [::SmimeInfo] structure
           @setting {String} [sendAsEmail] The email address that appears in the "From:" header for mail sent using this alias. **Required**
           @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
           @return {::SmimeInfo}
           @desc
             #### Scopes
             This API call requires authorization with (at least one of) the following scope(s):
             
              * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
              * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
        */
        insert: function(client, params) {
          return client.performRequest({
            method: 'POST',
            url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/smimeInfo',
            params: params,
            requiredParams: ['sendAsEmail', 'userId'],
            pathParams: ['sendAsEmail', 'userId']
          });
        },
        
        /**
           @function users.settings.sendAs.smimeInfo.list
           @summary  Lists S/MIME configs for the specified send-as alias.
           @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
           @param {Object} [settings] API call parameters
           @setting {String} [sendAsEmail] The email address that appears in the "From:" header for mail sent using this alias. **Required**
           @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
           @return {::ListSmimeInfoResponse}
           @desc
             #### Scopes
             This API call requires authorization with (at least one of) the following scope(s):
             
              * https://mail.google.com/ - View and manage your mail
              * https://www.googleapis.com/auth/gmail.modify - View and modify but not delete your email
              * https://www.googleapis.com/auth/gmail.readonly - View your emails messages and settings
              * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
              * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
        */
        list: function(client, params) {
          return client.performRequest({
            url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/smimeInfo',
            params: params,
            requiredParams: ['sendAsEmail', 'userId'],
            pathParams: ['sendAsEmail', 'userId']
          });
        },
        
        /**
           @function users.settings.sendAs.smimeInfo.setDefault
           @summary  Sets the default S/MIME config for the specified send-as alias.
           @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
           @param {Object} [settings] API call parameters
           @setting {String} [id] The immutable ID for the SmimeInfo. **Required**
           @setting {String} [sendAsEmail] The email address that appears in the "From:" header for mail sent using this alias. **Required**
           @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
           @return {void}
           @desc
             #### Scopes
             This API call requires authorization with (at least one of) the following scope(s):
             
              * https://www.googleapis.com/auth/gmail.settings.basic - Manage your basic mail settings
              * https://www.googleapis.com/auth/gmail.settings.sharing - Manage your sensitive mail settings, including who can manage your mail
        */
        setDefault: function(client, params) {
          return client.performRequest({
            method: 'POST',
            url: 'https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}/smimeInfo/{id}/setDefault',
            params: params,
            requiredParams: ['id', 'sendAsEmail', 'userId'],
            pathParams: ['id', 'sendAsEmail', 'userId']
          });
        }
      }
    }
  },
  
  threads: {
  
    /**
       @function users.threads.delete
       @summary  Immediately and permanently deletes the specified thread. This operation cannot be undone. Prefer threads.trash instead.
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
       @param {Object} [settings] API call parameters
       @setting {optional Boolean} [includeSpamTrash] Include threads from SPAM and TRASH in the results.
       @setting {optional String} [labelIds] Only return threads with labels that match all of the specified label IDs.
       @setting {optional Integer} [maxResults] Maximum number of threads to return.
       @setting {optional String} [pageToken] Page token to retrieve a specific page of results in the list.
       @setting {optional String} [q] Only return threads matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid: is:unread". Parameter cannot be used when accessing the api using the gmail.metadata scope.
       @setting {String} [userId] The user's email address. The special value me can be used to indicate the authenticated user. **Required**
       @return {::ListThreadsResponse}
       @desc
         #### Scopes
         This API call requires authorization with (at least one of) the following scope(s):
         
          * https://mail.google.com/ - View and manage your mail
          * https://www.googleapis.com/auth/gmail.metadata - View your email message metadata such as labels and headers, but not the email body
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
       @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
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
