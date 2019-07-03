// This file was originally generated using conductance/tools/google/generate-google-api drive

/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
  @summary Drive API v3 - Manages files in Drive including uploading, downloading, searching, detecting changes, and updating sharing permissions.
  @desc
    Revision 20170131

    See also https://developers.google.com/drive/.
*/

@ = require([
  'mho:std'
]);

/**
   @class About
   @summary Google API JSON structure
   
   @variable About.appInstalled
   @summary Boolean - Whether the user has installed the requesting app.
   
   @variable About.exportFormats
   @summary Object - A map of source MIME type to possible targets for all supported exports.
   
   @variable About.folderColorPalette
   @summary Array - The currently supported folder colors as RGB hex strings.
   
   @variable About.importFormats
   @summary Object - A map of source MIME type to possible targets for all supported imports.
   
   @variable About.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#about".
   
   @variable About.maxImportSizes
   @summary Object - A map of maximum import sizes by MIME type, in bytes.
   
   @variable About.maxUploadSize
   @summary String - The maximum upload size in bytes.
   
   @variable About.storageQuota
   @summary Object - The user's storage quota limits and usage. All fields are measured in bytes.
   
   @variable About.user
   @summary [::User] - The authenticated user.
   
   @class Change
   @summary Google API JSON structure
   
   @variable Change.file
   @summary [::File] - The updated state of the file. Present if the file has not been removed.
   
   @variable Change.fileId
   @summary String - The ID of the file which has changed.
   
   @variable Change.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#change".
   
   @variable Change.removed
   @summary Boolean - Whether the file has been removed from the view of the changes list, for example by deletion or lost access.
   
   @variable Change.time
   @summary String - The time of this change (RFC 3339 date-time).
   
   @class ChangeList
   @summary Google API JSON structure
   
   @variable ChangeList.changes
   @summary Array - The list of changes. If nextPageToken is populated, then this list may be incomplete and an additional page of results should be fetched.
   
   @variable ChangeList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#changeList".
   
   @variable ChangeList.newStartPageToken
   @summary String - The starting page token for future changes. This will be present only if the end of the current changes list has been reached.
   
   @variable ChangeList.nextPageToken
   @summary String - The page token for the next page of changes. This will be absent if the end of the changes list has been reached. If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results.
   
   @class Channel
   @summary Google API JSON structure
   
   @variable Channel.address
   @summary String - The address where notifications are delivered for this channel.
   
   @variable Channel.expiration
   @summary String - Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds. Optional.
   
   @variable Channel.id
   @summary String - A UUID or similar unique string that identifies this channel.
   
   @variable Channel.kind
   @summary String - Identifies this as a notification channel used to watch for changes to a resource. Value: the fixed string "api#channel".
   
   @variable Channel.params
   @summary Object - Additional parameters controlling delivery channel behavior. Optional.
   
   @variable Channel.payload
   @summary Boolean - A Boolean value to indicate whether payload is wanted. Optional.
   
   @variable Channel.resourceId
   @summary String - An opaque ID that identifies the resource being watched on this channel. Stable across different API versions.
   
   @variable Channel.resourceUri
   @summary String - A version-specific identifier for the watched resource.
   
   @variable Channel.token
   @summary String - An arbitrary string delivered to the target address with each notification delivered over this channel. Optional.
   
   @variable Channel.type
   @summary String - The type of delivery mechanism used for this channel.
   
   @class Comment
   @summary Google API JSON structure
   
   @variable Comment.anchor
   @summary String - A region of the document represented as a JSON string. See anchor documentation for details on how to define and interpret anchor properties.
   
   @variable Comment.author
   @summary [::User] - The user who created the comment.
   
   @variable Comment.content
   @summary String - The plain text content of the comment. This field is used for setting the content, while htmlContent should be displayed.
   
   @variable Comment.createdTime
   @summary String - The time at which the comment was created (RFC 3339 date-time).
   
   @variable Comment.deleted
   @summary Boolean - Whether the comment has been deleted. A deleted comment has no content.
   
   @variable Comment.htmlContent
   @summary String - The content of the comment with HTML formatting.
   
   @variable Comment.id
   @summary String - The ID of the comment.
   
   @variable Comment.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#comment".
   
   @variable Comment.modifiedTime
   @summary String - The last time the comment or any of its replies was modified (RFC 3339 date-time).
   
   @variable Comment.quotedFileContent
   @summary Object - The file content to which the comment refers, typically within the anchor region. For a text file, for example, this would be the text at the location of the comment.
   
   @variable Comment.replies
   @summary Array - The full list of replies to the comment in chronological order.
   
   @variable Comment.resolved
   @summary Boolean - Whether the comment has been resolved by one of its replies.
   
   @class CommentList
   @summary Google API JSON structure
   
   @variable CommentList.comments
   @summary Array - The list of comments. If nextPageToken is populated, then this list may be incomplete and an additional page of results should be fetched.
   
   @variable CommentList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#commentList".
   
   @variable CommentList.nextPageToken
   @summary String - The page token for the next page of comments. This will be absent if the end of the comments list has been reached. If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results.
   
   @class File
   @summary Google API JSON structure
   
   @variable File.appProperties
   @summary Object - A collection of arbitrary key-value pairs which are private to the requesting app.
   Entries with null values are cleared in update and copy requests.
   
   @variable File.capabilities
   @summary Object - Capabilities the current user has on the file.
   
   @variable File.contentHints
   @summary Object - Additional information about the content of the file. These fields are never populated in responses.
   
   @variable File.createdTime
   @summary String - The time at which the file was created (RFC 3339 date-time).
   
   @variable File.description
   @summary String - A short description of the file.
   
   @variable File.explicitlyTrashed
   @summary Boolean - Whether the file has been explicitly trashed, as opposed to recursively trashed from a parent folder.
   
   @variable File.fileExtension
   @summary String - The final component of fullFileExtension. This is only available for files with binary content in Drive.
   
   @variable File.folderColorRgb
   @summary String - The color for a folder as an RGB hex string. The supported colors are published in the folderColorPalette field of the About resource.
   If an unsupported color is specified, the closest color in the palette will be used instead.
   
   @variable File.fullFileExtension
   @summary String - The full file extension extracted from the name field. May contain multiple concatenated extensions, such as "tar.gz". This is only available for files with binary content in Drive.
   This is automatically updated when the name field changes, however it is not cleared if the new name does not contain a valid extension.
   
   @variable File.hasThumbnail
   @summary Boolean - Whether this file has a thumbnail.
   
   @variable File.headRevisionId
   @summary String - The ID of the file's head revision. This is currently only available for files with binary content in Drive.
   
   @variable File.iconLink
   @summary String - A static, unauthenticated link to the file's icon.
   
   @variable File.id
   @summary String - The ID of the file.
   
   @variable File.imageMediaMetadata
   @summary Object - Additional metadata about image media, if available.
   
   @variable File.isAppAuthorized
   @summary Boolean - Whether the file was created or opened by the requesting app.
   
   @variable File.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#file".
   
   @variable File.lastModifyingUser
   @summary [::User] - The last user to modify the file.
   
   @variable File.md5Checksum
   @summary String - The MD5 checksum for the content of the file. This is only applicable to files with binary content in Drive.
   
   @variable File.mimeType
   @summary String - The MIME type of the file.
   Drive will attempt to automatically detect an appropriate value from uploaded content if no value is provided. The value cannot be changed unless a new revision is uploaded.
   If a file is created with a Google Doc MIME type, the uploaded content will be imported if possible. The supported import formats are published in the About resource.
   
   @variable File.modifiedByMe
   @summary Boolean - Whether the file has been modified by this user.
   
   @variable File.modifiedByMeTime
   @summary String - The last time the file was modified by the user (RFC 3339 date-time).
   
   @variable File.modifiedTime
   @summary String - The last time the file was modified by anyone (RFC 3339 date-time).
   Note that setting modifiedTime will also update modifiedByMeTime for the user.
   
   @variable File.name
   @summary String - The name of the file. This is not necessarily unique within a folder.
   
   @variable File.originalFilename
   @summary String - The original filename of the uploaded content if available, or else the original value of the name field. This is only available for files with binary content in Drive.
   
   @variable File.ownedByMe
   @summary Boolean - Whether the user owns the file.
   
   @variable File.owners
   @summary Array - The owners of the file. Currently, only certain legacy files may have more than one owner.
   
   @variable File.parents
   @summary Array - The IDs of the parent folders which contain the file.
   If not specified as part of a create request, the file will be placed directly in the My Drive folder. Update requests must use the addParents and removeParents parameters to modify the values.
   
   @variable File.permissions
   @summary Array - The full list of permissions for the file. This is only available if the requesting user can share the file.
   
   @variable File.properties
   @summary Object - A collection of arbitrary key-value pairs which are visible to all apps.
   Entries with null values are cleared in update and copy requests.
   
   @variable File.quotaBytesUsed
   @summary String - The number of storage quota bytes used by the file. This includes the head revision as well as previous revisions with keepForever enabled.
   
   @variable File.shared
   @summary Boolean - Whether the file has been shared.
   
   @variable File.sharedWithMeTime
   @summary String - The time at which the file was shared with the user, if applicable (RFC 3339 date-time).
   
   @variable File.sharingUser
   @summary [::User] - The user who shared the file with the requesting user, if applicable.
   
   @variable File.size
   @summary String - The size of the file's content in bytes. This is only applicable to files with binary content in Drive.
   
   @variable File.spaces
   @summary Array - The list of spaces which contain the file. The currently supported values are 'drive', 'appDataFolder' and 'photos'.
   
   @variable File.starred
   @summary Boolean - Whether the user has starred the file.
   
   @variable File.thumbnailLink
   @summary String - A short-lived link to the file's thumbnail, if available. Typically lasts on the order of hours. Only populated when the requesting app can access the file's content.
   
   @variable File.thumbnailVersion
   @summary String - The thumbnail version for use in thumbnail cache invalidation.
   
   @variable File.trashed
   @summary Boolean - Whether the file has been trashed, either explicitly or from a trashed parent folder. Only the owner may trash a file, and other users cannot see files in the owner's trash.
   
   @variable File.version
   @summary String - A monotonically increasing version number for the file. This reflects every change made to the file on the server, even those not visible to the user.
   
   @variable File.videoMediaMetadata
   @summary Object - Additional metadata about video media. This may not be available immediately upon upload.
   
   @variable File.viewedByMe
   @summary Boolean - Whether the file has been viewed by this user.
   
   @variable File.viewedByMeTime
   @summary String - The last time the file was viewed by the user (RFC 3339 date-time).
   
   @variable File.viewersCanCopyContent
   @summary Boolean - Whether users with only reader or commenter permission can copy the file's content. This affects copy, download, and print operations.
   
   @variable File.webContentLink
   @summary String - A link for downloading the content of the file in a browser. This is only available for files with binary content in Drive.
   
   @variable File.webViewLink
   @summary String - A link for opening the file in a relevant Google editor or viewer in a browser.
   
   @variable File.writersCanShare
   @summary Boolean - Whether users with only writer permission can modify the file's permissions.
   
   @class FileList
   @summary Google API JSON structure
   
   @variable FileList.files
   @summary Array - The list of files. If nextPageToken is populated, then this list may be incomplete and an additional page of results should be fetched.
   
   @variable FileList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#fileList".
   
   @variable FileList.nextPageToken
   @summary String - The page token for the next page of files. This will be absent if the end of the files list has been reached. If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results.
   
   @class GeneratedIds
   @summary Google API JSON structure
   
   @variable GeneratedIds.ids
   @summary Array - The IDs generated for the requesting user in the specified space.
   
   @variable GeneratedIds.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#generatedIds".
   
   @variable GeneratedIds.space
   @summary String - The type of file that can be created with these IDs.
   
   @class Permission
   @summary Google API JSON structure
   
   @variable Permission.allowFileDiscovery
   @summary Boolean - Whether the permission allows the file to be discovered through search. This is only applicable for permissions of type domain or anyone.
   
   @variable Permission.displayName
   @summary String - A displayable name for users, groups or domains.
   
   @variable Permission.domain
   @summary String - The domain to which this permission refers.
   
   @variable Permission.emailAddress
   @summary String - The email address of the user or group to which this permission refers.
   
   @variable Permission.expirationTime
   @summary String - The time at which this permission will expire (RFC 3339 date-time).
   
   @variable Permission.id
   @summary String - The ID of this permission. This is a unique identifier for the grantee, and is published in User resources as permissionId.
   
   @variable Permission.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#permission".
   
   @variable Permission.photoLink
   @summary String - A link to the user's profile photo, if available.
   
   @variable Permission.role
   @summary String - The role granted by this permission. Valid values are:  
   - owner 
   - writer 
   - commenter 
   - reader
   
   @variable Permission.type
   @summary String - The type of the grantee. Valid values are:  
   - user 
   - group 
   - domain 
   - anyone
   
   @class PermissionList
   @summary Google API JSON structure
   
   @variable PermissionList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#permissionList".
   
   @variable PermissionList.permissions
   @summary Array - The list of permissions.
   
   @class Reply
   @summary Google API JSON structure
   
   @variable Reply.action
   @summary String - The action the reply performed to the parent comment. Valid values are:  
   - resolve 
   - reopen
   
   @variable Reply.author
   @summary [::User] - The user who created the reply.
   
   @variable Reply.content
   @summary String - The plain text content of the reply. This field is used for setting the content, while htmlContent should be displayed. This is required on creates if no action is specified.
   
   @variable Reply.createdTime
   @summary String - The time at which the reply was created (RFC 3339 date-time).
   
   @variable Reply.deleted
   @summary Boolean - Whether the reply has been deleted. A deleted reply has no content.
   
   @variable Reply.htmlContent
   @summary String - The content of the reply with HTML formatting.
   
   @variable Reply.id
   @summary String - The ID of the reply.
   
   @variable Reply.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#reply".
   
   @variable Reply.modifiedTime
   @summary String - The last time the reply was modified (RFC 3339 date-time).
   
   @class ReplyList
   @summary Google API JSON structure
   
   @variable ReplyList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#replyList".
   
   @variable ReplyList.nextPageToken
   @summary String - The page token for the next page of replies. This will be absent if the end of the replies list has been reached. If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results.
   
   @variable ReplyList.replies
   @summary Array - The list of replies. If nextPageToken is populated, then this list may be incomplete and an additional page of results should be fetched.
   
   @class Revision
   @summary Google API JSON structure
   
   @variable Revision.id
   @summary String - The ID of the revision.
   
   @variable Revision.keepForever
   @summary Boolean - Whether to keep this revision forever, even if it is no longer the head revision. If not set, the revision will be automatically purged 30 days after newer content is uploaded. This can be set on a maximum of 200 revisions for a file.
   This field is only applicable to files with binary content in Drive.
   
   @variable Revision.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#revision".
   
   @variable Revision.lastModifyingUser
   @summary [::User] - The last user to modify this revision.
   
   @variable Revision.md5Checksum
   @summary String - The MD5 checksum of the revision's content. This is only applicable to files with binary content in Drive.
   
   @variable Revision.mimeType
   @summary String - The MIME type of the revision.
   
   @variable Revision.modifiedTime
   @summary String - The last time the revision was modified (RFC 3339 date-time).
   
   @variable Revision.originalFilename
   @summary String - The original filename used to create this revision. This is only applicable to files with binary content in Drive.
   
   @variable Revision.publishAuto
   @summary Boolean - Whether subsequent revisions will be automatically republished. This is only applicable to Google Docs.
   
   @variable Revision.published
   @summary Boolean - Whether this revision is published. This is only applicable to Google Docs.
   
   @variable Revision.publishedOutsideDomain
   @summary Boolean - Whether this revision is published outside the domain. This is only applicable to Google Docs.
   
   @variable Revision.size
   @summary String - The size of the revision's content in bytes. This is only applicable to files with binary content in Drive.
   
   @class RevisionList
   @summary Google API JSON structure
   
   @variable RevisionList.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#revisionList".
   
   @variable RevisionList.nextPageToken
   @summary String - The page token for the next page of revisions. This will be absent if the end of the revisions list has been reached. If the token is rejected for any reason, it should be discarded, and pagination should be restarted from the first page of results.
   
   @variable RevisionList.revisions
   @summary Array - The list of revisions. If nextPageToken is populated, then this list may be incomplete and an additional page of results should be fetched.
   
   @class StartPageToken
   @summary Google API JSON structure
   
   @variable StartPageToken.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#startPageToken".
   
   @variable StartPageToken.startPageToken
   @summary String - The starting page token for listing changes.
   
   @class User
   @summary Google API JSON structure
   
   @variable User.displayName
   @summary String - A plain text displayable name for this user.
   
   @variable User.emailAddress
   @summary String - The email address of the user. This may not be present in certain contexts if the user has not made their email address visible to the requester.
   
   @variable User.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "drive#user".
   
   @variable User.me
   @summary Boolean - Whether this user is the requesting user.
   
   @variable User.permissionId
   @summary String - The user's ID as visible in Permission resources.
   
   @variable User.photoLink
   @summary String - A link to the user's profile photo, if available.
*/

exports.about = {

  /**
     @function about.get
     @summary  Gets information about the user, the user's Drive, and system capabilities.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
  
     @return {::About}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/about',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.changes = {

  /**
     @function changes.getStartPageToken
     @summary  Gets the starting pageToken for listing future changes.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
  
     @return {::StartPageToken}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  getStartPageToken: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/changes/startPageToken',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function changes.list
     @summary  Lists changes for a user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [includeRemoved] Whether to include changes indicating that items have left the view of the changes list, for example by deletion or lost access.
     @setting {optional Integer} [pageSize] The maximum number of changes to return per page.
     @setting {String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response or to the response from the getStartPageToken method. **Required**
     @setting {optional Boolean} [restrictToMyDrive] Whether to restrict the results to changes inside the My Drive hierarchy. This omits changes to files such as those in the Application Data folder or shared files which have not been added to My Drive.
     @setting {optional String} [spaces] A comma-separated list of spaces to query within the user corpus. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @return {::ChangeList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/changes',
      params: params,
      requiredParams: ['pageToken'],
      pathParams: []
    });
  },
  
  /**
     @function changes.watch
     @summary  Subscribes to changes for a user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {optional Boolean} [includeRemoved] Whether to include changes indicating that items have left the view of the changes list, for example by deletion or lost access.
     @setting {optional Integer} [pageSize] The maximum number of changes to return per page.
     @setting {String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response or to the response from the getStartPageToken method. **Required**
     @setting {optional Boolean} [restrictToMyDrive] Whether to restrict the results to changes inside the My Drive hierarchy. This omits changes to files such as those in the Application Data folder or shared files which have not been added to My Drive.
     @setting {optional String} [spaces] A comma-separated list of spaces to query within the user corpus. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/changes/watch',
      params: params,
      requiredParams: ['pageToken'],
      pathParams: []
    });
  }
};


exports.channels = {

  /**
     @function channels.stop
     @summary  Stop watching resources through this channel
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  stop: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/channels/stop',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.comments = {

  /**
     @function comments.create
     @summary  Creates a new comment on a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Comment} [resource] Data of [::Comment] structure
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function comments.delete
     @summary  Deletes a comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function comments.get
     @summary  Gets a comment by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] Whether to return deleted comments. Deleted comments will not include their original content.
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function comments.list
     @summary  Lists a file's comments.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] Whether to include deleted comments. Deleted comments will not include their original content.
     @setting {optional Integer} [pageSize] The maximum number of comments to return per page.
     @setting {optional String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response.
     @setting {optional String} [startModifiedTime] The minimum value of 'modifiedTime' for the result comments (RFC 3339 date-time).
     @return {::CommentList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function comments.update
     @summary  Updates a comment with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Comment} [resource] Data of [::Comment] structure
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  }
};


exports.files = {

  /**
     @function files.copy
     @summary  Creates a copy of a file and applies any requested updates with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Data of [::File] structure
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [ignoreDefaultVisibility] Whether to ignore the domain's default visibility settings for the created file. Domain administrators can choose to make all uploaded files visible to the domain by default; this parameter bypasses that behavior for the request. Permissions are still inherited from parent folders.
     @setting {optional Boolean} [keepRevisionForever] Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Drive.
     @setting {optional String} [ocrLanguage] A language hint for OCR processing during image import (ISO 639-1 code).
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
  */
  copy: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/copy',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.create
     @summary  Creates a new file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Data of [::File] structure
     @setting {String} [media.mimeType] Mime type of media object (accepting \*\/\*)
     @setting {String|nodejs Buffer} [media.body] Media contents (max size = 5120GB)
     @setting {optional Boolean} [ignoreDefaultVisibility] Whether to ignore the domain's default visibility settings for the created file. Domain administrators can choose to make all uploaded files visible to the domain by default; this parameter bypasses that behavior for the request. Permissions are still inherited from parent folders.
     @setting {optional Boolean} [keepRevisionForever] Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Drive.
     @setting {optional String} [ocrLanguage] A language hint for OCR processing during image import (ISO 639-1 code).
     @setting {optional Boolean} [useContentAsIndexableText] Whether to use the uploaded content as indexable text.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files',
      mediaUrl: 'https://www.googleapis.com/upload/drive/v3/files',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.delete
     @summary  Permanently deletes a file owned by the user without moving it to the trash. If the target is a folder, all descendants owned by the user are also deleted.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.emptyTrash
     @summary  Permanently deletes all of the user's trashed files.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
  
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
  */
  emptyTrash: function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/trash',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.export
     @summary  Exports a Google Doc to the requested MIME type and returns the exported content.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [mimeType] The MIME type of the format requested for this export. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  export: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/export',
      params: params,
      requiredParams: ['fileId', 'mimeType'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.generateIds
     @summary  Generates a set of file IDs which can be provided in create requests.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Integer} [count] The number of IDs to return.
     @setting {optional String} [space] The space in which the IDs can be used to create new files. Supported values are 'drive' and 'appDataFolder'.
     @return {::GeneratedIds}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  generateIds: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/generateIds',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.get
     @summary  Gets a file's metadata or content by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [acknowledgeAbuse] Whether the user is acknowledging the risk of downloading known malware or other abusive files. This is only applicable when alt=media.
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.list
     @summary  Lists or searches files.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [corpus] The source of files to list.
     @setting {optional String} [orderBy] A comma-separated list of sort keys. Valid keys are 'createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 'name', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', and 'viewedByMeTime'. Each key sorts ascending by default, but may be reversed with the 'desc' modifier. Example usage: ?orderBy=folder,modifiedTime desc,name. Please note that there is a current limitation for users with approximately one million files in which the requested sort order is ignored.
     @setting {optional Integer} [pageSize] The maximum number of files to return per page.
     @setting {optional String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response.
     @setting {optional String} [q] A query for filtering the file results. See the "Search for Files" guide for supported syntax.
     @setting {optional String} [spaces] A comma-separated list of spaces to query within the corpus. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @return {::FileList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.update
     @summary  Updates a file's metadata and/or content with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Data of [::File] structure
     @setting {String} [media.mimeType] Mime type of media object (accepting \*\/\*)
     @setting {String|nodejs Buffer} [media.body] Media contents (max size = 5120GB)
     @setting {optional String} [addParents] A comma-separated list of parent IDs to add.
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [keepRevisionForever] Whether to set the 'keepForever' field in the new head revision. This is only applicable to files with binary content in Drive.
     @setting {optional String} [ocrLanguage] A language hint for OCR processing during image import (ISO 639-1 code).
     @setting {optional String} [removeParents] A comma-separated list of parent IDs to remove.
     @setting {optional Boolean} [useContentAsIndexableText] Whether to use the uploaded content as indexable text.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.scripts - Modify your Google Apps Script scripts' behavior
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}',
      mediaUrl: 'https://www.googleapis.com/upload/drive/v3/files/{fileId}',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.watch
     @summary  Subscribes to changes to a file
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {optional Boolean} [acknowledgeAbuse] Whether the user is acknowledging the risk of downloading known malware or other abusive files. This is only applicable when alt=media.
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/watch',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  }
};


exports.permissions = {

  /**
     @function permissions.create
     @summary  Creates a permission for a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Permission} [resource] Data of [::Permission] structure
     @setting {optional String} [emailMessage] A custom message to include in the notification email.
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [sendNotificationEmail] Whether to send a notification email when sharing to users or groups. This defaults to true for users and groups, and is not allowed for other requests. It must not be disabled for ownership transfers.
     @setting {optional Boolean} [transferOwnership] Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This parameter is required as an acknowledgement of the side effect.
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/permissions',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function permissions.delete
     @summary  Deletes a permission.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [permissionId] The ID of the permission. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId'],
      pathParams: ['fileId', 'permissionId']
    });
  },
  
  /**
     @function permissions.get
     @summary  Gets a permission by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [permissionId] The ID of the permission. **Required**
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId'],
      pathParams: ['fileId', 'permissionId']
    });
  },
  
  /**
     @function permissions.list
     @summary  Lists a file's permissions.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::PermissionList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/permissions',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function permissions.update
     @summary  Updates a permission with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Permission} [resource] Data of [::Permission] structure
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [permissionId] The ID of the permission. **Required**
     @setting {optional Boolean} [removeExpiration] Whether to remove the expiration date.
     @setting {optional Boolean} [transferOwnership] Whether to transfer ownership to the specified user and downgrade the current owner to a writer. This parameter is required as an acknowledgement of the side effect.
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId'],
      pathParams: ['fileId', 'permissionId']
    });
  }
};


exports.replies = {

  /**
     @function replies.create
     @summary  Creates a new reply to a comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Reply} [resource] Data of [::Reply] structure
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Reply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}/replies',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function replies.delete
     @summary  Deletes a reply.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  },
  
  /**
     @function replies.get
     @summary  Gets a reply by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] Whether to return deleted replies. Deleted replies will not include their original content.
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {::Reply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  },
  
  /**
     @function replies.list
     @summary  Lists a comment's replies.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] Whether to include deleted replies. Deleted replies will not include their original content.
     @setting {optional Integer} [pageSize] The maximum number of replies to return per page.
     @setting {optional String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response.
     @return {::ReplyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}/replies',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function replies.update
     @summary  Updates a reply with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Reply} [resource] Data of [::Reply] structure
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {::Reply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  }
};


exports.revisions = {

  /**
     @function revisions.delete
     @summary  Permanently deletes a revision. This method is only applicable to files with binary content in Drive.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [revisionId] The ID of the revision. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId'],
      pathParams: ['fileId', 'revisionId']
    });
  },
  
  /**
     @function revisions.get
     @summary  Gets a revision's metadata or content by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [acknowledgeAbuse] Whether the user is acknowledging the risk of downloading known malware or other abusive files. This is only applicable when alt=media.
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [revisionId] The ID of the revision. **Required**
     @return {::Revision}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId'],
      pathParams: ['fileId', 'revisionId']
    });
  },
  
  /**
     @function revisions.list
     @summary  Lists a file's revisions.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Integer} [pageSize] The maximum number of revisions to return per page.
     @setting {optional String} [pageToken] The token for continuing a previous list request on the next page. This should be set to the value of 'nextPageToken' from the previous response.
     @return {::RevisionList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/revisions',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function revisions.update
     @summary  Updates a revision with patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Revision} [resource] Data of [::Revision] structure
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [revisionId] The ID of the revision. **Required**
     @return {::Revision}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/drive/v3/files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId'],
      pathParams: ['fileId', 'revisionId']
    });
  }
};
