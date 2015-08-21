// This file was originally generated using conductance/tools/google/generate-google-api drive

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
  @summary Drive API v2 - The API to interact with Drive.
  @desc
    Revision 20150813

    See also https://developers.google.com/drive/.
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

var API_BASE_URL = 'https://www.googleapis.com/drive/v2/';

/**
   @class About
   @summary Google API JSON structure
   
   @variable About.additionalRoleInfo
   @summary Array - Information about supported additional roles per file type. The most specific type takes precedence.
   
   @variable About.domainSharingPolicy
   @summary String - The domain sharing policy for the current user. Possible values are:  
   - allowed 
   - allowedWithWarning 
   - incomingOnly 
   - disallowed
   
   @variable About.etag
   @summary String - The ETag of the item.
   
   @variable About.exportFormats
   @summary Array - The allowable export formats.
   
   @variable About.features
   @summary Array - List of additional features enabled on this account.
   
   @variable About.folderColorPalette
   @summary Array - The palette of allowable folder colors as RGB hex strings.
   
   @variable About.importFormats
   @summary Array - The allowable import formats.
   
   @variable About.isCurrentAppInstalled
   @summary Boolean - A boolean indicating whether the authenticated app is installed by the authenticated user.
   
   @variable About.kind
   @summary String - This is always drive#about.
   
   @variable About.languageCode
   @summary String - The user's language or locale code, as defined by BCP 47, with some extensions from Unicode's LDML format (http://www.unicode.org/reports/tr35/).
   
   @variable About.largestChangeId
   @summary String - The largest change id.
   
   @variable About.maxUploadSizes
   @summary Array - List of max upload sizes for each file type. The most specific type takes precedence.
   
   @variable About.name
   @summary String - The name of the current user.
   
   @variable About.permissionId
   @summary String - The current user's ID as visible in the permissions collection.
   
   @variable About.quotaBytesByService
   @summary Array - The amount of storage quota used by different Google services.
   
   @variable About.quotaBytesTotal
   @summary String - The total number of quota bytes.
   
   @variable About.quotaBytesUsed
   @summary String - The number of quota bytes used by Google Drive.
   
   @variable About.quotaBytesUsedAggregate
   @summary String - The number of quota bytes used by all Google apps (Drive, Picasa, etc.).
   
   @variable About.quotaBytesUsedInTrash
   @summary String - The number of quota bytes used by trashed items.
   
   @variable About.quotaType
   @summary String - The type of the user's storage quota. Possible values are:  
   - LIMITED 
   - UNLIMITED
   
   @variable About.remainingChangeIds
   @summary String - The number of remaining change ids.
   
   @variable About.rootFolderId
   @summary String - The id of the root folder.
   
   @variable About.selfLink
   @summary String - A link back to this item.
   
   @variable About.user
   @summary [::User] - The authenticated user.
   
   @class App
   @summary Google API JSON structure
   
   @variable App.authorized
   @summary Boolean - Whether the app is authorized to access data on the user's Drive.
   
   @variable App.createInFolderTemplate
   @summary String - The template url to create a new file with this app in a given folder. The template will contain {folderId} to be replaced by the folder to create the new file in.
   
   @variable App.createUrl
   @summary String - The url to create a new file with this app.
   
   @variable App.hasDriveWideScope
   @summary Boolean - Whether the app has drive-wide scope. An app with drive-wide scope can access all files in the user's drive.
   
   @variable App.icons
   @summary Array - The various icons for the app.
   
   @variable App.id
   @summary String - The ID of the app.
   
   @variable App.installed
   @summary Boolean - Whether the app is installed.
   
   @variable App.kind
   @summary String - This is always drive#app.
   
   @variable App.longDescription
   @summary String - A long description of the app.
   
   @variable App.name
   @summary String - The name of the app.
   
   @variable App.objectType
   @summary String - The type of object this app creates (e.g. Chart). If empty, the app name should be used instead.
   
   @variable App.openUrlTemplate
   @summary String - The template url for opening files with this app. The template will contain {ids} and/or {exportIds} to be replaced by the actual file ids. See  Open Files  for the full documentation.
   
   @variable App.primaryFileExtensions
   @summary Array - The list of primary file extensions.
   
   @variable App.primaryMimeTypes
   @summary Array - The list of primary mime types.
   
   @variable App.productId
   @summary String - The ID of the product listing for this app.
   
   @variable App.productUrl
   @summary String - A link to the product listing for this app.
   
   @variable App.secondaryFileExtensions
   @summary Array - The list of secondary file extensions.
   
   @variable App.secondaryMimeTypes
   @summary Array - The list of secondary mime types.
   
   @variable App.shortDescription
   @summary String - A short description of the app.
   
   @variable App.supportsCreate
   @summary Boolean - Whether this app supports creating new objects.
   
   @variable App.supportsImport
   @summary Boolean - Whether this app supports importing Google Docs.
   
   @variable App.supportsMultiOpen
   @summary Boolean - Whether this app supports opening more than one file.
   
   @variable App.supportsOfflineCreate
   @summary Boolean - Whether this app supports creating new files when offline.
   
   @variable App.useByDefault
   @summary Boolean - Whether the app is selected as the default handler for the types it supports.
   
   @class AppList
   @summary Google API JSON structure
   
   @variable AppList.defaultAppIds
   @summary Array - List of app IDs that the user has specified to use by default. The list is in reverse-priority order (lowest to highest).
   
   @variable AppList.etag
   @summary String - The ETag of the list.
   
   @variable AppList.items
   @summary Array - The actual list of apps.
   
   @variable AppList.kind
   @summary String - This is always drive#appList.
   
   @variable AppList.selfLink
   @summary String - A link back to this list.
   
   @class Change
   @summary Google API JSON structure
   
   @variable Change.deleted
   @summary Boolean - Whether the file has been deleted.
   
   @variable Change.file
   @summary [::File] - The updated state of the file. Present if the file has not been deleted.
   
   @variable Change.fileId
   @summary String - The ID of the file associated with this change.
   
   @variable Change.id
   @summary String - The ID of the change.
   
   @variable Change.kind
   @summary String - This is always drive#change.
   
   @variable Change.modificationDate
   @summary String - The time of this modification.
   
   @variable Change.selfLink
   @summary String - A link back to this change.
   
   @class ChangeList
   @summary Google API JSON structure
   
   @variable ChangeList.etag
   @summary String - The ETag of the list.
   
   @variable ChangeList.items
   @summary Array - The actual list of changes.
   
   @variable ChangeList.kind
   @summary String - This is always drive#changeList.
   
   @variable ChangeList.largestChangeId
   @summary String - The current largest change ID.
   
   @variable ChangeList.nextLink
   @summary String - A link to the next page of changes.
   
   @variable ChangeList.nextPageToken
   @summary String - The page token for the next page of changes.
   
   @variable ChangeList.selfLink
   @summary String - A link back to this list.
   
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
   
   @class ChildList
   @summary Google API JSON structure
   
   @variable ChildList.etag
   @summary String - The ETag of the list.
   
   @variable ChildList.items
   @summary Array - The actual list of children.
   
   @variable ChildList.kind
   @summary String - This is always drive#childList.
   
   @variable ChildList.nextLink
   @summary String - A link to the next page of children.
   
   @variable ChildList.nextPageToken
   @summary String - The page token for the next page of children.
   
   @variable ChildList.selfLink
   @summary String - A link back to this list.
   
   @class ChildReference
   @summary Google API JSON structure
   
   @variable ChildReference.childLink
   @summary String - A link to the child.
   
   @variable ChildReference.id
   @summary String - The ID of the child.
   
   @variable ChildReference.kind
   @summary String - This is always drive#childReference.
   
   @variable ChildReference.selfLink
   @summary String - A link back to this reference.
   
   @class Comment
   @summary Google API JSON structure
   
   @variable Comment.anchor
   @summary String - A region of the document represented as a JSON string. See anchor documentation for details on how to define and interpret anchor properties.
   
   @variable Comment.author
   @summary [::User] - The user who wrote this comment.
   
   @variable Comment.commentId
   @summary String - The ID of the comment.
   
   @variable Comment.content
   @summary String - The plain text content used to create this comment. This is not HTML safe and should only be used as a starting point to make edits to a comment's content.
   
   @variable Comment.context
   @summary Object - The context of the file which is being commented on.
   
   @variable Comment.createdDate
   @summary String - The date when this comment was first created.
   
   @variable Comment.deleted
   @summary Boolean - Whether this comment has been deleted. If a comment has been deleted the content will be cleared and this will only represent a comment that once existed.
   
   @variable Comment.fileId
   @summary String - The file which this comment is addressing.
   
   @variable Comment.fileTitle
   @summary String - The title of the file which this comment is addressing.
   
   @variable Comment.htmlContent
   @summary String - HTML formatted content for this comment.
   
   @variable Comment.kind
   @summary String - This is always drive#comment.
   
   @variable Comment.modifiedDate
   @summary String - The date when this comment or any of its replies were last modified.
   
   @variable Comment.replies
   @summary Array - Replies to this post.
   
   @variable Comment.selfLink
   @summary String - A link back to this comment.
   
   @variable Comment.status
   @summary String - The status of this comment. Status can be changed by posting a reply to a comment with the desired status.  
   - "open" - The comment is still open. 
   - "resolved" - The comment has been resolved by one of its replies.
   
   @class CommentList
   @summary Google API JSON structure
   
   @variable CommentList.items
   @summary Array - List of comments.
   
   @variable CommentList.kind
   @summary String - This is always drive#commentList.
   
   @variable CommentList.nextLink
   @summary String - A link to the next page of comments.
   
   @variable CommentList.nextPageToken
   @summary String - The token to use to request the next page of results.
   
   @variable CommentList.selfLink
   @summary String - A link back to this list.
   
   @class CommentReply
   @summary Google API JSON structure
   
   @variable CommentReply.author
   @summary [::User] - The user who wrote this reply.
   
   @variable CommentReply.content
   @summary String - The plain text content used to create this reply. This is not HTML safe and should only be used as a starting point to make edits to a reply's content. This field is required on inserts if no verb is specified (resolve/reopen).
   
   @variable CommentReply.createdDate
   @summary String - The date when this reply was first created.
   
   @variable CommentReply.deleted
   @summary Boolean - Whether this reply has been deleted. If a reply has been deleted the content will be cleared and this will only represent a reply that once existed.
   
   @variable CommentReply.htmlContent
   @summary String - HTML formatted content for this reply.
   
   @variable CommentReply.kind
   @summary String - This is always drive#commentReply.
   
   @variable CommentReply.modifiedDate
   @summary String - The date when this reply was last modified.
   
   @variable CommentReply.replyId
   @summary String - The ID of the reply.
   
   @variable CommentReply.verb
   @summary String - The action this reply performed to the parent comment. When creating a new reply this is the action to be perform to the parent comment. Possible values are:  
   - "resolve" - To resolve a comment. 
   - "reopen" - To reopen (un-resolve) a comment.
   
   @class CommentReplyList
   @summary Google API JSON structure
   
   @variable CommentReplyList.items
   @summary Array - List of reply.
   
   @variable CommentReplyList.kind
   @summary String - This is always drive#commentReplyList.
   
   @variable CommentReplyList.nextLink
   @summary String - A link to the next page of replies.
   
   @variable CommentReplyList.nextPageToken
   @summary String - The token to use to request the next page of results.
   
   @variable CommentReplyList.selfLink
   @summary String - A link back to this list.
   
   @class File
   @summary Google API JSON structure
   
   @variable File.alternateLink
   @summary String - A link for opening the file in a relevant Google editor or viewer.
   
   @variable File.appDataContents
   @summary Boolean - Whether this file is in the Application Data folder.
   
   @variable File.canComment
   @summary Boolean - Whether the current user can comment on the file.
   
   @variable File.copyable
   @summary Boolean - Whether the file can be copied by the current user.
   
   @variable File.createdDate
   @summary String - Create time for this file (formatted RFC 3339 timestamp).
   
   @variable File.defaultOpenWithLink
   @summary String - A link to open this file with the user's default app for this file. Only populated when the drive.apps.readonly scope is used.
   
   @variable File.description
   @summary String - A short description of the file.
   
   @variable File.downloadUrl
   @summary String - undefined
   
   @variable File.editable
   @summary Boolean - Whether the file can be edited by the current user.
   
   @variable File.embedLink
   @summary String - A link for embedding the file.
   
   @variable File.etag
   @summary String - ETag of the file.
   
   @variable File.explicitlyTrashed
   @summary Boolean - Whether this file has been explicitly trashed, as opposed to recursively trashed.
   
   @variable File.exportLinks
   @summary Object - Links for exporting Google Docs to specific formats.
   
   @variable File.fileExtension
   @summary String - The final component of fullFileExtension with trailing text that does not appear to be part of the extension removed. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.fileSize
   @summary String - The size of the file in bytes. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.folderColorRgb
   @summary String - Folder color as an RGB hex string if the file is a folder. The list of supported colors is available in the folderColorPalette field of the About resource. If an unsupported color is specified, it will be changed to the closest color in the palette.
   
   @variable File.fullFileExtension
   @summary String - The full file extension; extracted from the title. May contain multiple concatenated extensions, such as "tar.gz". Removing an extension from the title does not clear this field; however, changing the extension on the title does update this field. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.headRevisionId
   @summary String - The ID of the file's head revision. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.iconLink
   @summary String - A link to the file's icon.
   
   @variable File.id
   @summary String - The ID of the file.
   
   @variable File.imageMediaMetadata
   @summary Object - Metadata about image media. This will only be present for image types, and its contents will depend on what can be parsed from the image content.
   
   @variable File.indexableText
   @summary Object - Indexable text attributes for the file (can only be written)
   
   @variable File.kind
   @summary String - The type of file. This is always drive#file.
   
   @variable File.labels
   @summary Object - A group of labels for the file.
   
   @variable File.lastModifyingUser
   @summary [::User] - The last user to modify this file.
   
   @variable File.lastModifyingUserName
   @summary String - Name of the last user to modify this file.
   
   @variable File.lastViewedByMeDate
   @summary String - Last time this file was viewed by the user (formatted RFC 3339 timestamp).
   
   @variable File.markedViewedByMeDate
   @summary String - Time this file was explicitly marked viewed by the user (formatted RFC 3339 timestamp).
   
   @variable File.md5Checksum
   @summary String - An MD5 checksum for the content of this file. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.mimeType
   @summary String - The MIME type of the file. This is only mutable on update when uploading new content. This field can be left blank, and the mimetype will be determined from the uploaded content's MIME type.
   
   @variable File.modifiedByMeDate
   @summary String - Last time this file was modified by the user (formatted RFC 3339 timestamp). Note that setting modifiedDate will also update the modifiedByMe date for the user which set the date.
   
   @variable File.modifiedDate
   @summary String - Last time this file was modified by anyone (formatted RFC 3339 timestamp). This is only mutable on update when the setModifiedDate parameter is set.
   
   @variable File.openWithLinks
   @summary Object - A map of the id of each of the user's apps to a link to open this file with that app. Only populated when the drive.apps.readonly scope is used.
   
   @variable File.originalFilename
   @summary String - The original filename if the file was uploaded manually, or the original title if the file was inserted through the API. Note that renames of the title will not change the original filename. This field is only populated for files with content stored in Drive; it is not populated for Google Docs or shortcut files.
   
   @variable File.ownedByMe
   @summary Boolean - Whether the file is owned by the current user.
   
   @variable File.ownerNames
   @summary Array - Name(s) of the owner(s) of this file.
   
   @variable File.owners
   @summary Array - The owner(s) of this file.
   
   @variable File.parents
   @summary Array - Collection of parent folders which contain this file.
   Setting this field will put the file in all of the provided folders. On insert, if no folders are provided, the file will be placed in the default root folder.
   
   @variable File.permissions
   @summary Array - The list of permissions for users with access to this file.
   
   @variable File.properties
   @summary Array - The list of properties.
   
   @variable File.quotaBytesUsed
   @summary String - The number of quota bytes used by this file.
   
   @variable File.selfLink
   @summary String - A link back to this file.
   
   @variable File.shareable
   @summary Boolean - Whether the file's sharing settings can be modified by the current user.
   
   @variable File.shared
   @summary Boolean - Whether the file has been shared.
   
   @variable File.sharedWithMeDate
   @summary String - Time at which this file was shared with the user (formatted RFC 3339 timestamp).
   
   @variable File.sharingUser
   @summary [::User] - User that shared the item with the current user, if available.
   
   @variable File.spaces
   @summary Array - The list of spaces which contain the file. Supported values are 'drive', 'appDataFolder' and 'photos'.
   
   @variable File.thumbnail
   @summary Object - Thumbnail for the file. Only accepted on upload and for files that are not already thumbnailed by Google.
   
   @variable File.thumbnailLink
   @summary String - A short-lived link to the file's thumbnail. Typically lasts on the order of hours.
   
   @variable File.title
   @summary String - The title of this file.
   
   @variable File.userPermission
   @summary [::Permission] - The permissions for the authenticated user on this file.
   
   @variable File.version
   @summary String - A monotonically increasing version number for the file. This reflects every change made to the file on the server, even those not visible to the requesting user.
   
   @variable File.videoMediaMetadata
   @summary Object - Metadata about video media. This will only be present for video types.
   
   @variable File.webContentLink
   @summary String - A link for downloading the content of the file in a browser using cookie based authentication. In cases where the content is shared publicly, the content can be downloaded without any credentials.
   
   @variable File.webViewLink
   @summary String - A link only available on public folders for viewing their static web assets (HTML, CSS, JS, etc) via Google Drive's Website Hosting.
   
   @variable File.writersCanShare
   @summary Boolean - Whether writers can share the document with other users.
   
   @class FileList
   @summary Google API JSON structure
   
   @variable FileList.etag
   @summary String - The ETag of the list.
   
   @variable FileList.items
   @summary Array - The actual list of files.
   
   @variable FileList.kind
   @summary String - This is always drive#fileList.
   
   @variable FileList.nextLink
   @summary String - A link to the next page of files.
   
   @variable FileList.nextPageToken
   @summary String - The page token for the next page of files.
   
   @variable FileList.selfLink
   @summary String - A link back to this list.
   
   @class GeneratedIds
   @summary Google API JSON structure
   
   @variable GeneratedIds.ids
   @summary Array - The IDs generated for the requesting user in the specified space.
   
   @variable GeneratedIds.kind
   @summary String - This is always drive#generatedIds
   
   @variable GeneratedIds.space
   @summary String - The type of file that can be created with these IDs.
   
   @class ParentList
   @summary Google API JSON structure
   
   @variable ParentList.etag
   @summary String - The ETag of the list.
   
   @variable ParentList.items
   @summary Array - The actual list of parents.
   
   @variable ParentList.kind
   @summary String - This is always drive#parentList.
   
   @variable ParentList.selfLink
   @summary String - A link back to this list.
   
   @class ParentReference
   @summary Google API JSON structure
   
   @variable ParentReference.id
   @summary String - The ID of the parent.
   
   @variable ParentReference.isRoot
   @summary Boolean - Whether or not the parent is the root folder.
   
   @variable ParentReference.kind
   @summary String - This is always drive#parentReference.
   
   @variable ParentReference.parentLink
   @summary String - A link to the parent.
   
   @variable ParentReference.selfLink
   @summary String - A link back to this reference.
   
   @class Permission
   @summary Google API JSON structure
   
   @variable Permission.additionalRoles
   @summary Array - Additional roles for this user. Only commenter is currently allowed.
   
   @variable Permission.authKey
   @summary String - The authkey parameter required for this permission.
   
   @variable Permission.domain
   @summary String - The domain name of the entity this permission refers to. This is an output-only field which is present when the permission type is user, group or domain.
   
   @variable Permission.emailAddress
   @summary String - The email address of the user or group this permission refers to. This is an output-only field which is present when the permission type is user or group.
   
   @variable Permission.etag
   @summary String - The ETag of the permission.
   
   @variable Permission.id
   @summary String - The ID of the user this permission refers to, and identical to the permissionId in the About and Files resources. When making a drive.permissions.insert request, exactly one of the id or value fields must be specified.
   
   @variable Permission.kind
   @summary String - This is always drive#permission.
   
   @variable Permission.name
   @summary String - The name for this permission.
   
   @variable Permission.photoLink
   @summary String - A link to the profile photo, if available.
   
   @variable Permission.role
   @summary String - The primary role for this user. Allowed values are:  
   - owner 
   - reader 
   - writer
   
   @variable Permission.selfLink
   @summary String - A link back to this permission.
   
   @variable Permission.type
   @summary String - The account type. Allowed values are:  
   - user 
   - group 
   - domain 
   - anyone
   
   @variable Permission.value
   @summary String - The email address or domain name for the entity. This is used during inserts and is not populated in responses. When making a drive.permissions.insert request, exactly one of the id or value fields must be specified.
   
   @variable Permission.withLink
   @summary Boolean - Whether the link is required for this permission.
   
   @class PermissionId
   @summary Google API JSON structure
   
   @variable PermissionId.id
   @summary String - The permission ID.
   
   @variable PermissionId.kind
   @summary String - This is always drive#permissionId.
   
   @class PermissionList
   @summary Google API JSON structure
   
   @variable PermissionList.etag
   @summary String - The ETag of the list.
   
   @variable PermissionList.items
   @summary Array - The actual list of permissions.
   
   @variable PermissionList.kind
   @summary String - This is always drive#permissionList.
   
   @variable PermissionList.selfLink
   @summary String - A link back to this list.
   
   @class Property
   @summary Google API JSON structure
   
   @variable Property.etag
   @summary String - ETag of the property.
   
   @variable Property.key
   @summary String - The key of this property.
   
   @variable Property.kind
   @summary String - This is always drive#property.
   
   @variable Property.selfLink
   @summary String - The link back to this property.
   
   @variable Property.value
   @summary String - The value of this property.
   
   @variable Property.visibility
   @summary String - The visibility of this property.
   
   @class PropertyList
   @summary Google API JSON structure
   
   @variable PropertyList.etag
   @summary String - The ETag of the list.
   
   @variable PropertyList.items
   @summary Array - The list of properties.
   
   @variable PropertyList.kind
   @summary String - This is always drive#propertyList.
   
   @variable PropertyList.selfLink
   @summary String - The link back to this list.
   
   @class Revision
   @summary Google API JSON structure
   
   @variable Revision.downloadUrl
   @summary String - Short term download URL for the file. This will only be populated on files with content stored in Drive.
   
   @variable Revision.etag
   @summary String - The ETag of the revision.
   
   @variable Revision.exportLinks
   @summary Object - Links for exporting Google Docs to specific formats.
   
   @variable Revision.fileSize
   @summary String - The size of the revision in bytes. This will only be populated on files with content stored in Drive.
   
   @variable Revision.id
   @summary String - The ID of the revision.
   
   @variable Revision.kind
   @summary String - This is always drive#revision.
   
   @variable Revision.lastModifyingUser
   @summary [::User] - The last user to modify this revision.
   
   @variable Revision.lastModifyingUserName
   @summary String - Name of the last user to modify this revision.
   
   @variable Revision.md5Checksum
   @summary String - An MD5 checksum for the content of this revision. This will only be populated on files with content stored in Drive.
   
   @variable Revision.mimeType
   @summary String - The MIME type of the revision.
   
   @variable Revision.modifiedDate
   @summary String - Last time this revision was modified (formatted RFC 3339 timestamp).
   
   @variable Revision.originalFilename
   @summary String - The original filename when this revision was created. This will only be populated on files with content stored in Drive.
   
   @variable Revision.pinned
   @summary Boolean - Whether this revision is pinned to prevent automatic purging. This will only be populated and can only be modified on files with content stored in Drive which are not Google Docs. Revisions can also be pinned when they are created through the drive.files.insert/update/copy by using the pinned query parameter.
   
   @variable Revision.publishAuto
   @summary Boolean - Whether subsequent revisions will be automatically republished. This is only populated and can only be modified for Google Docs.
   
   @variable Revision.published
   @summary Boolean - Whether this revision is published. This is only populated and can only be modified for Google Docs.
   
   @variable Revision.publishedLink
   @summary String - A link to the published revision.
   
   @variable Revision.publishedOutsideDomain
   @summary Boolean - Whether this revision is published outside the domain. This is only populated and can only be modified for Google Docs.
   
   @variable Revision.selfLink
   @summary String - A link back to this revision.
   
   @class RevisionList
   @summary Google API JSON structure
   
   @variable RevisionList.etag
   @summary String - The ETag of the list.
   
   @variable RevisionList.items
   @summary Array - The actual list of revisions.
   
   @variable RevisionList.kind
   @summary String - This is always drive#revisionList.
   
   @variable RevisionList.selfLink
   @summary String - A link back to this list.
   
   @class User
   @summary Google API JSON structure
   
   @variable User.displayName
   @summary String - A plain text displayable name for this user.
   
   @variable User.emailAddress
   @summary String - The email address of the user.
   
   @variable User.isAuthenticatedUser
   @summary Boolean - Whether this user is the same as the authenticated user for whom the request was made.
   
   @variable User.kind
   @summary String - This is always drive#user.
   
   @variable User.permissionId
   @summary String - The user's ID as visible in the permissions collection.
   
   @variable User.picture
   @summary Object - The user's profile picture.
*/

exports.about = {

  /**
     @function about.get
     @summary  Gets the information about the current user along with Drive API settings
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [includeSubscribed] When calculating the number of remaining change IDs, whether to include public files the user has opened and shared files. When set to false, this counts only change IDs for owned files and any shared or public files that the user has explicitly added to a folder they own.
     @setting {optional String} [maxChangeIdCount] Maximum number of remaining change IDs to count
     @setting {optional String} [startChangeId] Change ID to start counting from when calculating number of remaining change IDs
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'about',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};
,

exports.apps = {

  /**
     @function apps.get
     @summary  Gets a specific app.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [appId] The ID of the app. **Required**
     @return {::App}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'apps/{appId}',
      params: params,
      requiredParams: ['appId'],
      pathParams: ['appId']
    });
  },
  
  /**
     @function apps.list
     @summary  Lists a user's installed apps.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [appFilterExtensions] A comma-separated list of file extensions for open with filtering. All apps within the given app query scope which can open any of the given file extensions will be included in the response. If appFilterMimeTypes are provided as well, the result is a union of the two resulting app lists.
     @setting {optional String} [appFilterMimeTypes] A comma-separated list of MIME types for open with filtering. All apps within the given app query scope which can open any of the given MIME types will be included in the response. If appFilterExtensions are provided as well, the result is a union of the two resulting app lists.
     @setting {optional String} [languageCode] A language or locale code, as defined by BCP 47, with some extensions from Unicode's LDML format (http://www.unicode.org/reports/tr35/).
     @return {::AppList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'apps',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};
,

exports.changes = {

  /**
     @function changes.get
     @summary  Gets a specific change.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [changeId] The ID of the change. **Required**
     @return {::Change}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'changes/{changeId}',
      params: params,
      requiredParams: ['changeId'],
      pathParams: ['changeId']
    });
  },
  
  /**
     @function changes.list
     @summary  Lists the changes for a user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [includeDeleted] Whether to include deleted items.
     @setting {optional Boolean} [includeSubscribed] Whether to include public files the user has opened and shared files. When set to false, the list only includes owned files plus any shared or public files the user has explicitly added to a folder they own.
     @setting {optional Integer} [maxResults] Maximum number of changes to return.
     @setting {optional String} [pageToken] Page token for changes.
     @setting {optional String} [spaces] A comma-separated list of spaces to query. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @setting {optional String} [startChangeId] Change ID to start listing changes from.
     @return {::ChangeList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'changes',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function changes.watch
     @summary  Subscribe to changes for a user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Resource that this API call acts on. **Required**
     @setting {optional Boolean} [includeDeleted] Whether to include deleted items.
     @setting {optional Boolean} [includeSubscribed] Whether to include public files the user has opened and shared files. When set to false, the list only includes owned files plus any shared or public files the user has explicitly added to a folder they own.
     @setting {optional Integer} [maxResults] Maximum number of changes to return.
     @setting {optional String} [pageToken] Page token for changes.
     @setting {optional String} [spaces] A comma-separated list of spaces to query. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @setting {optional String} [startChangeId] Change ID to start listing changes from.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  watch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'changes/watch',
      params: params,
      requiredParams: ['resource'],
      pathParams: []
    });
  }
};
,

exports.channels = {

  /**
     @function channels.stop
     @summary  Stop watching resources through this channel
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Resource that this API call acts on. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  stop: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'channels/stop',
      params: params,
      requiredParams: ['resource'],
      pathParams: []
    });
  }
};
,

exports.children = {

  /**
     @function children.delete
     @summary  Removes a child from a folder.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [childId] The ID of the child. **Required**
     @setting {String} [folderId] The ID of the folder. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{folderId}/children/{childId}',
      params: params,
      requiredParams: ['childId', 'folderId'],
      pathParams: ['childId', 'folderId']
    });
  },
  
  /**
     @function children.get
     @summary  Gets a specific child reference.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [childId] The ID of the child. **Required**
     @setting {String} [folderId] The ID of the folder. **Required**
     @return {::ChildReference}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{folderId}/children/{childId}',
      params: params,
      requiredParams: ['childId', 'folderId'],
      pathParams: ['childId', 'folderId']
    });
  },
  
  /**
     @function children.insert
     @summary  Inserts a file into a folder.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::ChildReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [folderId] The ID of the folder. **Required**
     @return {::ChildReference}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{folderId}/children',
      params: params,
      requiredParams: ['folderId', 'resource'],
      pathParams: ['folderId']
    });
  },
  
  /**
     @function children.list
     @summary  Lists a folder's children.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [folderId] The ID of the folder. **Required**
     @setting {optional Integer} [maxResults] Maximum number of children to return.
     @setting {optional String} [orderBy] A comma-separated list of sort keys. Valid keys are 'createdDate', 'folder', 'lastViewedByMeDate', 'modifiedByMeDate', 'modifiedDate', 'quotaBytesUsed', 'recency', 'sharedWithMeDate', 'starred', and 'title'. Each key sorts ascending by default, but may be reversed with the 'desc' modifier. Example usage: ?orderBy=folder,modifiedDate desc,title. Please note that there is a current limitation for users with approximately one million files in which the requested sort order is ignored.
     @setting {optional String} [pageToken] Page token for children.
     @setting {optional String} [q] Query string for searching children.
     @return {::ChildList}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{folderId}/children',
      params: params,
      requiredParams: ['folderId'],
      pathParams: ['folderId']
    });
  }
};
,

exports.comments = {

  /**
     @function comments.delete
     @summary  Deletes a comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function comments.get
     @summary  Gets a comment by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] If set, this will succeed when retrieving a deleted comment, and will include any deleted replies.
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function comments.insert
     @summary  Creates a new comment on the given file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Comment} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/comments',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function comments.list
     @summary  Lists a file's comments.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] If set, all comments and replies, including deleted comments and replies (with content stripped) will be returned.
     @setting {optional Integer} [maxResults] The maximum number of discussions to include in the response, used for paging.
     @setting {optional String} [pageToken] The continuation token, used to page through large result sets. To get the next page of results, set this parameter to the value of "nextPageToken" from the previous response.
     @setting {optional String} [updatedMin] Only discussions that were updated after this timestamp will be returned. Formatted as an RFC 3339 timestamp.
     @return {::CommentList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/comments',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function comments.patch
     @summary  Updates an existing comment. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Comment} [resource] Resource that this API call acts on. **Required**
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Comment}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'resource'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function comments.update
     @summary  Updates an existing comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Comment} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'resource'],
      pathParams: ['commentId', 'fileId']
    });
  }
};
,

exports.files = {

  /**
     @function files.copy
     @summary  Creates a copy of the specified file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Resource that this API call acts on. **Required**
     @setting {optional Boolean} [convert] Whether to convert this file to the corresponding Google Docs format.
     @setting {String} [fileId] The ID of the file to copy. **Required**
     @setting {optional Boolean} [ocr] Whether to attempt OCR on .jpg, .png, .gif, or .pdf uploads.
     @setting {optional String} [ocrLanguage] If ocr is true, hints at the language to use. Valid values are BCP 47 codes.
     @setting {optional Boolean} [pinned] Whether to pin the head revision of the new copy. A file can have a maximum of 200 pinned revisions.
     @setting {optional String} [timedTextLanguage] The language of the timed text.
     @setting {optional String} [timedTextTrackName] The timed text track name.
     @setting {optional String} [visibility] The visibility of the new file. This parameter is only relevant when the source is not a native Google Doc and convert=false.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
  */
  copy: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/copy',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.delete
     @summary  Permanently deletes a file by ID. Skips the trash. The currently authenticated user must own the file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file to delete. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.emptyTrash
     @summary  Permanently deletes all of the user's trashed files.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
  
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
  */
  emptyTrash: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/trash',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.generateIds
     @summary  Generates a set of file IDs which can be provided in insert requests.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional Integer} [maxResults] Maximum number of IDs to return.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/generateIds',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.get
     @summary  Gets a file's metadata by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [acknowledgeAbuse] Whether the user is acknowledging the risk of downloading known malware or other abusive files.
     @setting {String} [fileId] The ID for the file in question. **Required**
     @setting {optional String} [projection] This parameter is deprecated and has no function.
     @setting {optional String} [revisionId] Specifies the Revision ID that should be downloaded. Ignored unless alt=media is specified.
     @setting {optional Boolean} [updateViewedDate] Whether to update the view date after successfully retrieving the file.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.insert
     @summary  Insert a new file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Resource that this API call acts on. **Required**
     @setting {optional Boolean} [convert] Whether to convert this file to the corresponding Google Docs format.
     @setting {optional Boolean} [ocr] Whether to attempt OCR on .jpg, .png, .gif, or .pdf uploads.
     @setting {optional String} [ocrLanguage] If ocr is true, hints at the language to use. Valid values are BCP 47 codes.
     @setting {optional Boolean} [pinned] Whether to pin the head revision of the uploaded file. A file can have a maximum of 200 pinned revisions.
     @setting {optional String} [timedTextLanguage] The language of the timed text.
     @setting {optional String} [timedTextTrackName] The timed text track name.
     @setting {optional Boolean} [useContentAsIndexableText] Whether to use the content as indexable text.
     @setting {optional String} [visibility] The visibility of the new file. This parameter is only relevant when convert=false.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files',
      params: params,
      requiredParams: ['resource'],
      pathParams: []
    });
  },
  
  /**
     @function files.list
     @summary  Lists the user's files.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [corpus] The body of items (files/documents) to which the query applies.
     @setting {optional Integer} [maxResults] Maximum number of files to return.
     @setting {optional String} [orderBy] A comma-separated list of sort keys. Valid keys are 'createdDate', 'folder', 'lastViewedByMeDate', 'modifiedByMeDate', 'modifiedDate', 'quotaBytesUsed', 'recency', 'sharedWithMeDate', 'starred', and 'title'. Each key sorts ascending by default, but may be reversed with the 'desc' modifier. Example usage: ?orderBy=folder,modifiedDate desc,title. Please note that there is a current limitation for users with approximately one million files in which the requested sort order is ignored.
     @setting {optional String} [pageToken] Page token for files.
     @setting {optional String} [projection] This parameter is deprecated and has no function.
     @setting {optional String} [q] Query string for searching files.
     @setting {optional String} [spaces] A comma-separated list of spaces to query. Supported values are 'drive', 'appDataFolder' and 'photos'.
     @return {::FileList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function files.patch
     @summary  Updates file metadata and/or content. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Resource that this API call acts on. **Required**
     @setting {optional String} [addParents] Comma-separated list of parent IDs to add.
     @setting {optional Boolean} [convert] Whether to convert this file to the corresponding Google Docs format.
     @setting {String} [fileId] The ID of the file to update. **Required**
     @setting {optional String} [modifiedDateBehavior] How the modifiedDate field should be updated. This overrides setModifiedDate.
     @setting {optional Boolean} [newRevision] Whether a blob upload should create a new revision. If false, the blob data in the current head revision is replaced. If true or not set, a new blob is created as head revision, and previous unpinned revisions are preserved for a short period of time. Pinned revisions are stored indefinitely, using additional storage quota, up to a maximum of 200 revisions.
     @setting {optional Boolean} [ocr] Whether to attempt OCR on .jpg, .png, .gif, or .pdf uploads.
     @setting {optional String} [ocrLanguage] If ocr is true, hints at the language to use. Valid values are BCP 47 codes.
     @setting {optional Boolean} [pinned] Whether to pin the new revision. A file can have a maximum of 200 pinned revisions.
     @setting {optional String} [removeParents] Comma-separated list of parent IDs to remove.
     @setting {optional Boolean} [setModifiedDate] Whether to set the modified date with the supplied modified date.
     @setting {optional String} [timedTextLanguage] The language of the timed text.
     @setting {optional String} [timedTextTrackName] The timed text track name.
     @setting {optional Boolean} [updateViewedDate] Whether to update the view date after successfully updating the file.
     @setting {optional Boolean} [useContentAsIndexableText] Whether to use the content as indexable text.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.scripts - Modify your Google Apps Script scripts' behavior
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.touch
     @summary  Set the file's updated time to the current server time.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file to update. **Required**
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
  */
  touch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/touch',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.trash
     @summary  Moves a file to the trash. The currently authenticated user must own the file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file to trash. **Required**
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  trash: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/trash',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.untrash
     @summary  Restores a file from the trash.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file to untrash. **Required**
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  untrash: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/untrash',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.update
     @summary  Updates file metadata and/or content.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::File} [resource] Resource that this API call acts on. **Required**
     @setting {optional String} [addParents] Comma-separated list of parent IDs to add.
     @setting {optional Boolean} [convert] Whether to convert this file to the corresponding Google Docs format.
     @setting {String} [fileId] The ID of the file to update. **Required**
     @setting {optional String} [modifiedDateBehavior] How the modifiedDate field should be updated. This overrides setModifiedDate.
     @setting {optional Boolean} [newRevision] Whether a blob upload should create a new revision. If false, the blob data in the current head revision is replaced. If true or not set, a new blob is created as head revision, and previous unpinned revisions are preserved for a short period of time. Pinned revisions are stored indefinitely, using additional storage quota, up to a maximum of 200 revisions.
     @setting {optional Boolean} [ocr] Whether to attempt OCR on .jpg, .png, .gif, or .pdf uploads.
     @setting {optional String} [ocrLanguage] If ocr is true, hints at the language to use. Valid values are BCP 47 codes.
     @setting {optional Boolean} [pinned] Whether to pin the new revision. A file can have a maximum of 200 pinned revisions.
     @setting {optional String} [removeParents] Comma-separated list of parent IDs to remove.
     @setting {optional Boolean} [setModifiedDate] Whether to set the modified date with the supplied modified date.
     @setting {optional String} [timedTextLanguage] The language of the timed text.
     @setting {optional String} [timedTextTrackName] The timed text track name.
     @setting {optional Boolean} [updateViewedDate] Whether to update the view date after successfully updating the file.
     @setting {optional Boolean} [useContentAsIndexableText] Whether to use the content as indexable text.
     @return {::File}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.scripts - Modify your Google Apps Script scripts' behavior
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function files.watch
     @summary  Subscribe to changes on a file
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Resource that this API call acts on. **Required**
     @setting {optional Boolean} [acknowledgeAbuse] Whether the user is acknowledging the risk of downloading known malware or other abusive files.
     @setting {String} [fileId] The ID for the file in question. **Required**
     @setting {optional String} [projection] This parameter is deprecated and has no function.
     @setting {optional String} [revisionId] Specifies the Revision ID that should be downloaded. Ignored unless alt=media is specified.
     @setting {optional Boolean} [updateViewedDate] Whether to update the view date after successfully retrieving the file.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  watch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/watch',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  }
};
,

exports.parents = {

  /**
     @function parents.delete
     @summary  Removes a parent from a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [parentId] The ID of the parent. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/parents/{parentId}',
      params: params,
      requiredParams: ['fileId', 'parentId'],
      pathParams: ['fileId', 'parentId']
    });
  },
  
  /**
     @function parents.get
     @summary  Gets a specific parent reference.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [parentId] The ID of the parent. **Required**
     @return {::ParentReference}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/parents/{parentId}',
      params: params,
      requiredParams: ['fileId', 'parentId'],
      pathParams: ['fileId', 'parentId']
    });
  },
  
  /**
     @function parents.insert
     @summary  Adds a parent folder for a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::ParentReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::ParentReference}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/parents',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function parents.list
     @summary  Lists a file's parents.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::ParentList}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/parents',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  }
};
,

exports.permissions = {

  /**
     @function permissions.delete
     @summary  Deletes a permission from a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [permissionId] The ID for the permission. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId'],
      pathParams: ['fileId', 'permissionId']
    });
  },
  
  /**
     @function permissions.get
     @summary  Gets a permission by ID.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [permissionId] The ID for the permission. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId'],
      pathParams: ['fileId', 'permissionId']
    });
  },
  
  /**
     @function permissions.getIdForEmail
     @summary  Returns the permission ID for an email address.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [email] The email address for which to return a permission ID **Required**
     @return {::PermissionId}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.apps.readonly - View your Google Drive apps
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
        * https://www.googleapis.com/auth/drive.metadata.readonly - View metadata for files in your Google Drive
        * https://www.googleapis.com/auth/drive.photos.readonly - View the photos, videos and albums in your Google Photos
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  getIdForEmail: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'permissionIds/{email}',
      params: params,
      requiredParams: ['email'],
      pathParams: ['email']
    });
  },
  
  /**
     @function permissions.insert
     @summary  Inserts a permission for a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Permission} [resource] Resource that this API call acts on. **Required**
     @setting {optional String} [emailMessage] A custom message to include in notification emails.
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {optional Boolean} [sendNotificationEmails] Whether to send notification emails when sharing to users or groups. This parameter is ignored and an email is sent if the role is owner.
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/permissions',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function permissions.list
     @summary  Lists a file's permissions.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID for the file. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/permissions',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function permissions.patch
     @summary  Updates a permission. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Permission} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [permissionId] The ID for the permission. **Required**
     @setting {optional Boolean} [transferOwnership] Whether changing a role to 'owner' downgrades the current owners to writers. Does nothing if the specified role is not 'owner'.
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId', 'resource'],
      pathParams: ['fileId', 'permissionId']
    });
  },
  
  /**
     @function permissions.update
     @summary  Updates a permission.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Permission} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [permissionId] The ID for the permission. **Required**
     @setting {optional Boolean} [transferOwnership] Whether changing a role to 'owner' downgrades the current owners to writers. Does nothing if the specified role is not 'owner'.
     @return {::Permission}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/permissions/{permissionId}',
      params: params,
      requiredParams: ['fileId', 'permissionId', 'resource'],
      pathParams: ['fileId', 'permissionId']
    });
  }
};
,

exports.properties = {

  /**
     @function properties.delete
     @summary  Deletes a property.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [propertyKey] The key of the property. **Required**
     @setting {optional String} [visibility] The visibility of the property.
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/properties/{propertyKey}',
      params: params,
      requiredParams: ['fileId', 'propertyKey'],
      pathParams: ['fileId', 'propertyKey']
    });
  },
  
  /**
     @function properties.get
     @summary  Gets a property by its key.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [propertyKey] The key of the property. **Required**
     @setting {optional String} [visibility] The visibility of the property.
     @return {::Property}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/properties/{propertyKey}',
      params: params,
      requiredParams: ['fileId', 'propertyKey'],
      pathParams: ['fileId', 'propertyKey']
    });
  },
  
  /**
     @function properties.insert
     @summary  Adds a property to a file.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Property} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::Property}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/properties',
      params: params,
      requiredParams: ['fileId', 'resource'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function properties.list
     @summary  Lists a file's properties.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::PropertyList}
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/properties',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function properties.patch
     @summary  Updates a property. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Property} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [propertyKey] The key of the property. **Required**
     @setting {optional String} [visibility] The visibility of the property.
     @return {::Property}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}/properties/{propertyKey}',
      params: params,
      requiredParams: ['fileId', 'propertyKey', 'resource'],
      pathParams: ['fileId', 'propertyKey']
    });
  },
  
  /**
     @function properties.update
     @summary  Updates a property.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Property} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [propertyKey] The key of the property. **Required**
     @setting {optional String} [visibility] The visibility of the property.
     @return {::Property}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.metadata - View and manage metadata of files in your Google Drive
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/properties/{propertyKey}',
      params: params,
      requiredParams: ['fileId', 'propertyKey', 'resource'],
      pathParams: ['fileId', 'propertyKey']
    });
  }
};
,

exports.realtime = {

  /**
     @function realtime.get
     @summary  Exports the contents of the Realtime API data model associated with this file as JSON.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file that the Realtime API data model is associated with. **Required**
     @setting {optional Integer} [revision] The revision of the Realtime API data model to export. Revisions start at 1 (the initial empty data model) and are incremented with each change. If this parameter is excluded, the most recent data model will be returned.
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/realtime',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function realtime.update
     @summary  Overwrites the Realtime API data model associated with this file with the provided JSON data model.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [baseRevision] The revision of the model to diff the uploaded model against. If set, the uploaded model is diffed against the provided revision and those differences are merged with any changes made to the model after the provided revision. If not set, the uploaded model replaces the current model on the server.
     @setting {String} [fileId] The ID of the file that the Realtime API data model is associated with. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/realtime',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  }
};
,

exports.replies = {

  /**
     @function replies.delete
     @summary  Deletes a reply.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  },
  
  /**
     @function replies.get
     @summary  Gets a reply.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] If set, this will succeed when retrieving a deleted reply.
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {::CommentReply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  },
  
  /**
     @function replies.insert
     @summary  Creates a new reply to the given comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::CommentReply} [resource] Resource that this API call acts on. **Required**
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @return {::CommentReply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies',
      params: params,
      requiredParams: ['commentId', 'fileId', 'resource'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function replies.list
     @summary  Lists all of the replies to a comment.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {optional Boolean} [includeDeleted] If set, all replies, including deleted replies (with content stripped) will be returned.
     @setting {optional Integer} [maxResults] The maximum number of replies to include in the response, used for paging.
     @setting {optional String} [pageToken] The continuation token, used to page through large result sets. To get the next page of results, set this parameter to the value of "nextPageToken" from the previous response.
     @return {::CommentReplyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
        * https://www.googleapis.com/auth/drive.readonly - View the files in your Google Drive
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies',
      params: params,
      requiredParams: ['commentId', 'fileId'],
      pathParams: ['commentId', 'fileId']
    });
  },
  
  /**
     @function replies.patch
     @summary  Updates an existing reply. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::CommentReply} [resource] Resource that this API call acts on. **Required**
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {::CommentReply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId', 'resource'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  },
  
  /**
     @function replies.update
     @summary  Updates an existing reply.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::CommentReply} [resource] Resource that this API call acts on. **Required**
     @setting {String} [commentId] The ID of the comment. **Required**
     @setting {String} [fileId] The ID of the file. **Required**
     @setting {String} [replyId] The ID of the reply. **Required**
     @return {::CommentReply}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/comments/{commentId}/replies/{replyId}',
      params: params,
      requiredParams: ['commentId', 'fileId', 'replyId', 'resource'],
      pathParams: ['commentId', 'fileId', 'replyId']
    });
  }
};
,

exports.revisions = {

  /**
     @function revisions.delete
     @summary  Removes a revision.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId'],
      pathParams: ['fileId', 'revisionId']
    });
  },
  
  /**
     @function revisions.get
     @summary  Gets a specific revision.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId'],
      pathParams: ['fileId', 'revisionId']
    });
  },
  
  /**
     @function revisions.list
     @summary  Lists a file's revisions.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [fileId] The ID of the file. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'files/{fileId}/revisions',
      params: params,
      requiredParams: ['fileId'],
      pathParams: ['fileId']
    });
  },
  
  /**
     @function revisions.patch
     @summary  Updates a revision. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Revision} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [revisionId] The ID for the revision. **Required**
     @return {::Revision}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId', 'resource'],
      pathParams: ['fileId', 'revisionId']
    });
  },
  
  /**
     @function revisions.update
     @summary  Updates a revision.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Revision} [resource] Resource that this API call acts on. **Required**
     @setting {String} [fileId] The ID for the file. **Required**
     @setting {String} [revisionId] The ID for the revision. **Required**
     @return {::Revision}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/drive - View and manage the files in your Google Drive
        * https://www.googleapis.com/auth/drive.appdata - View and manage its own configuration data in your Google Drive
        * https://www.googleapis.com/auth/drive.file - View and manage Google Drive files and folders that you have opened or created with this app
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'files/{fileId}/revisions/{revisionId}',
      params: params,
      requiredParams: ['fileId', 'revisionId', 'resource'],
      pathParams: ['fileId', 'revisionId']
    });
  }
};
