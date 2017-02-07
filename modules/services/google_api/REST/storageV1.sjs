// This file was originally generated using conductance/tools/google/generate-google-api storage

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
  @summary Cloud Storage JSON API v1 - Stores and retrieves potentially large, immutable data objects.
  @desc
    Revision 20170123

    See also https://developers.google.com/storage/docs/json_api/.
*/

@ = require([
  'mho:std'
]);

/**
   @class Bucket
   @summary Google API JSON structure
   
   @variable Bucket.acl
   @summary Array - Access controls on the bucket.
   
   @variable Bucket.cors
   @summary Array - The bucket's Cross-Origin Resource Sharing (CORS) configuration.
   
   @variable Bucket.defaultObjectAcl
   @summary Array - Default access controls to apply to new objects when no ACL is provided.
   
   @variable Bucket.etag
   @summary String - HTTP 1.1 Entity tag for the bucket.
   
   @variable Bucket.id
   @summary String - The ID of the bucket. For buckets, the id and name properities are the same.
   
   @variable Bucket.kind
   @summary String - The kind of item this is. For buckets, this is always storage#bucket.
   
   @variable Bucket.lifecycle
   @summary Object - The bucket's lifecycle configuration. See lifecycle management for more information.
   
   @variable Bucket.location
   @summary String - The location of the bucket. Object data for objects in the bucket resides in physical storage within this region. Defaults to US. See the developer's guide for the authoritative list.
   
   @variable Bucket.logging
   @summary Object - The bucket's logging configuration, which defines the destination bucket and optional name prefix for the current bucket's logs.
   
   @variable Bucket.metageneration
   @summary String - The metadata generation of this bucket.
   
   @variable Bucket.name
   @summary String - The name of the bucket.
   
   @variable Bucket.owner
   @summary Object - The owner of the bucket. This is always the project team's owner group.
   
   @variable Bucket.projectNumber
   @summary String - The project number of the project the bucket belongs to.
   
   @variable Bucket.selfLink
   @summary String - The URI of this bucket.
   
   @variable Bucket.storageClass
   @summary String - The bucket's default storage class, used whenever no storageClass is specified for a newly-created object. This defines how objects in the bucket are stored and determines the SLA and the cost of storage. Values include MULTI_REGIONAL, REGIONAL, STANDARD, NEARLINE, COLDLINE, and DURABLE_REDUCED_AVAILABILITY. If this value is not specified when the bucket is created, it will default to STANDARD. For more information, see storage classes.
   
   @variable Bucket.timeCreated
   @summary String - The creation time of the bucket in RFC 3339 format.
   
   @variable Bucket.updated
   @summary String - The modification time of the bucket in RFC 3339 format.
   
   @variable Bucket.versioning
   @summary Object - The bucket's versioning configuration.
   
   @variable Bucket.website
   @summary Object - The bucket's website configuration, controlling how the service behaves when accessing bucket contents as a web site. See the Static Website Examples for more information.
   
   @class BucketAccessControl
   @summary Google API JSON structure
   
   @variable BucketAccessControl.bucket
   @summary String - The name of the bucket.
   
   @variable BucketAccessControl.domain
   @summary String - The domain associated with the entity, if any.
   
   @variable BucketAccessControl.email
   @summary String - The email address associated with the entity, if any.
   
   @variable BucketAccessControl.entity
   @summary String - The entity holding the permission, in one of the following forms: 
   - user-userId 
   - user-email 
   - group-groupId 
   - group-email 
   - domain-domain 
   - project-team-projectId 
   - allUsers 
   - allAuthenticatedUsers Examples: 
   - The user liz@example.com would be user-liz@example.com. 
   - The group example@googlegroups.com would be group-example@googlegroups.com. 
   - To refer to all members of the Google Apps for Business domain example.com, the entity would be domain-example.com.
   
   @variable BucketAccessControl.entityId
   @summary String - The ID for the entity, if any.
   
   @variable BucketAccessControl.etag
   @summary String - HTTP 1.1 Entity tag for the access-control entry.
   
   @variable BucketAccessControl.id
   @summary String - The ID of the access-control entry.
   
   @variable BucketAccessControl.kind
   @summary String - The kind of item this is. For bucket access control entries, this is always storage#bucketAccessControl.
   
   @variable BucketAccessControl.projectTeam
   @summary Object - The project team associated with the entity, if any.
   
   @variable BucketAccessControl.role
   @summary String - The access permission for the entity.
   
   @variable BucketAccessControl.selfLink
   @summary String - The link to this access-control entry.
   
   @class BucketAccessControls
   @summary Google API JSON structure
   
   @variable BucketAccessControls.items
   @summary Array - The list of items.
   
   @variable BucketAccessControls.kind
   @summary String - The kind of item this is. For lists of bucket access control entries, this is always storage#bucketAccessControls.
   
   @class Buckets
   @summary Google API JSON structure
   
   @variable Buckets.items
   @summary Array - The list of items.
   
   @variable Buckets.kind
   @summary String - The kind of item this is. For lists of buckets, this is always storage#buckets.
   
   @variable Buckets.nextPageToken
   @summary String - The continuation token, used to page through large result sets. Provide this value in a subsequent request to return the next page of results.
   
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
   
   @class ComposeRequest
   @summary Google API JSON structure
   
   @variable ComposeRequest.destination
   @summary [::Object] - Properties of the resulting object.
   
   @variable ComposeRequest.kind
   @summary String - The kind of item this is.
   
   @variable ComposeRequest.sourceObjects
   @summary Array - The list of source objects that will be concatenated into a single object.
   
   @class Object
   @summary Google API JSON structure
   
   @variable Object.acl
   @summary Array - Access controls on the object.
   
   @variable Object.bucket
   @summary String - The name of the bucket containing this object.
   
   @variable Object.cacheControl
   @summary String - Cache-Control directive for the object data. If omitted, and the object is accessible to all anonymous users, the default will be public, max-age=3600.
   
   @variable Object.componentCount
   @summary Integer - Number of underlying components that make up this object. Components are accumulated by compose operations.
   
   @variable Object.contentDisposition
   @summary String - Content-Disposition of the object data.
   
   @variable Object.contentEncoding
   @summary String - Content-Encoding of the object data.
   
   @variable Object.contentLanguage
   @summary String - Content-Language of the object data.
   
   @variable Object.contentType
   @summary String - Content-Type of the object data. If contentType is not specified, object downloads will be served as application/octet-stream.
   
   @variable Object.crc32c
   @summary String - CRC32c checksum, as described in RFC 4960, Appendix B; encoded using base64 in big-endian byte order. For more information about using the CRC32c checksum, see Hashes and ETags: Best Practices.
   
   @variable Object.customerEncryption
   @summary Object - Metadata of customer-supplied encryption key, if the object is encrypted by such a key.
   
   @variable Object.etag
   @summary String - HTTP 1.1 Entity tag for the object.
   
   @variable Object.generation
   @summary String - The content generation of this object. Used for object versioning.
   
   @variable Object.id
   @summary String - The ID of the object, including the bucket name, object name, and generation number.
   
   @variable Object.kind
   @summary String - The kind of item this is. For objects, this is always storage#object.
   
   @variable Object.md5Hash
   @summary String - MD5 hash of the data; encoded using base64. For more information about using the MD5 hash, see Hashes and ETags: Best Practices.
   
   @variable Object.mediaLink
   @summary String - Media download link.
   
   @variable Object.metadata
   @summary Object - User-provided metadata, in key/value pairs.
   
   @variable Object.metageneration
   @summary String - The version of the metadata for this object at this generation. Used for preconditions and for detecting changes in metadata. A metageneration number is only meaningful in the context of a particular generation of a particular object.
   
   @variable Object.name
   @summary String - The name of the object. Required if not specified by URL parameter.
   
   @variable Object.owner
   @summary Object - The owner of the object. This will always be the uploader of the object.
   
   @variable Object.selfLink
   @summary String - The link to this object.
   
   @variable Object.size
   @summary String - Content-Length of the data in bytes.
   
   @variable Object.storageClass
   @summary String - Storage class of the object.
   
   @variable Object.timeCreated
   @summary String - The creation time of the object in RFC 3339 format.
   
   @variable Object.timeDeleted
   @summary String - The deletion time of the object in RFC 3339 format. Will be returned if and only if this version of the object has been deleted.
   
   @variable Object.timeStorageClassUpdated
   @summary String - The time at which the object's storage class was last changed. When the object is initially created, it will be set to timeCreated.
   
   @variable Object.updated
   @summary String - The modification time of the object metadata in RFC 3339 format.
   
   @class ObjectAccessControl
   @summary Google API JSON structure
   
   @variable ObjectAccessControl.bucket
   @summary String - The name of the bucket.
   
   @variable ObjectAccessControl.domain
   @summary String - The domain associated with the entity, if any.
   
   @variable ObjectAccessControl.email
   @summary String - The email address associated with the entity, if any.
   
   @variable ObjectAccessControl.entity
   @summary String - The entity holding the permission, in one of the following forms: 
   - user-userId 
   - user-email 
   - group-groupId 
   - group-email 
   - domain-domain 
   - project-team-projectId 
   - allUsers 
   - allAuthenticatedUsers Examples: 
   - The user liz@example.com would be user-liz@example.com. 
   - The group example@googlegroups.com would be group-example@googlegroups.com. 
   - To refer to all members of the Google Apps for Business domain example.com, the entity would be domain-example.com.
   
   @variable ObjectAccessControl.entityId
   @summary String - The ID for the entity, if any.
   
   @variable ObjectAccessControl.etag
   @summary String - HTTP 1.1 Entity tag for the access-control entry.
   
   @variable ObjectAccessControl.generation
   @summary String - The content generation of the object, if applied to an object.
   
   @variable ObjectAccessControl.id
   @summary String - The ID of the access-control entry.
   
   @variable ObjectAccessControl.kind
   @summary String - The kind of item this is. For object access control entries, this is always storage#objectAccessControl.
   
   @variable ObjectAccessControl.object
   @summary String - The name of the object, if applied to an object.
   
   @variable ObjectAccessControl.projectTeam
   @summary Object - The project team associated with the entity, if any.
   
   @variable ObjectAccessControl.role
   @summary String - The access permission for the entity.
   
   @variable ObjectAccessControl.selfLink
   @summary String - The link to this access-control entry.
   
   @class ObjectAccessControls
   @summary Google API JSON structure
   
   @variable ObjectAccessControls.items
   @summary Array - The list of items.
   
   @variable ObjectAccessControls.kind
   @summary String - The kind of item this is. For lists of object access control entries, this is always storage#objectAccessControls.
   
   @class Objects
   @summary Google API JSON structure
   
   @variable Objects.items
   @summary Array - The list of items.
   
   @variable Objects.kind
   @summary String - The kind of item this is. For lists of objects, this is always storage#objects.
   
   @variable Objects.nextPageToken
   @summary String - The continuation token, used to page through large result sets. Provide this value in a subsequent request to return the next page of results.
   
   @variable Objects.prefixes
   @summary Array - The list of prefixes of objects matching-but-not-listed up to and including the requested delimiter.
   
   @class RewriteResponse
   @summary Google API JSON structure
   
   @variable RewriteResponse.done
   @summary Boolean - true if the copy is finished; otherwise, false if the copy is in progress. This property is always present in the response.
   
   @variable RewriteResponse.kind
   @summary String - The kind of item this is.
   
   @variable RewriteResponse.objectSize
   @summary String - The total size of the object being copied in bytes. This property is always present in the response.
   
   @variable RewriteResponse.resource
   @summary [::Object] - A resource containing the metadata for the copied-to object. This property is present in the response only when copying completes.
   
   @variable RewriteResponse.rewriteToken
   @summary String - A token to use in subsequent requests to continue copying data. This token is present in the response only when there is more data to copy.
   
   @variable RewriteResponse.totalBytesRewritten
   @summary String - The total bytes written so far, which can be used to provide a waiting user with a progress indicator. This property is always present in the response.
*/

exports.bucketAccessControls = {

  /**
     @function bucketAccessControls.delete
     @summary  Permanently deletes the ACL entry for the specified entity on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function bucketAccessControls.get
     @summary  Returns the ACL entry for the specified entity on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::BucketAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function bucketAccessControls.insert
     @summary  Creates a new ACL entry on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BucketAccessControl} [resource] Data of [::BucketAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @return {::BucketAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function bucketAccessControls.list
     @summary  Retrieves ACL entries on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @return {::BucketAccessControls}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function bucketAccessControls.patch
     @summary  Updates an ACL entry on the specified bucket. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BucketAccessControl} [resource] Data of [::BucketAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::BucketAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function bucketAccessControls.update
     @summary  Updates an ACL entry on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BucketAccessControl} [resource] Data of [::BucketAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::BucketAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  }
};


exports.buckets = {

  /**
     @function buckets.delete
     @summary  Permanently deletes an empty bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [ifMetagenerationMatch] If set, only deletes the bucket if its metageneration matches this value.
     @setting {optional String} [ifMetagenerationNotMatch] If set, only deletes the bucket if its metageneration does not match this value.
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function buckets.get
     @summary  Returns metadata for the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [ifMetagenerationMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration does not match the given value.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl.
     @return {::Bucket}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function buckets.insert
     @summary  Creates a new bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Bucket} [resource] Data of [::Bucket] structure
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this bucket.
     @setting {optional String} [predefinedDefaultObjectAcl] Apply a predefined set of default object access controls to this bucket.
     @setting {String} [project] A valid API project identifier. **Required**
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl, unless the bucket resource specifies acl or defaultObjectAcl properties, when it defaults to full.
     @return {::Bucket}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b',
      params: params,
      requiredParams: ['project'],
      pathParams: []
    });
  },
  
  /**
     @function buckets.list
     @summary  Retrieves a list of buckets for a given project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Integer} [maxResults] Maximum number of buckets to return.
     @setting {optional String} [pageToken] A previously-returned page token representing part of the larger set of results to view.
     @setting {optional String} [prefix] Filter results to buckets whose names begin with this prefix.
     @setting {String} [project] A valid API project identifier. **Required**
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl.
     @return {::Buckets}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b',
      params: params,
      requiredParams: ['project'],
      pathParams: []
    });
  },
  
  /**
     @function buckets.patch
     @summary  Updates a bucket. Changes to the bucket will be readable immediately after writing, but configuration changes may take time to propagate. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Bucket} [resource] Data of [::Bucket] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [ifMetagenerationMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration does not match the given value.
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this bucket.
     @setting {optional String} [predefinedDefaultObjectAcl] Apply a predefined set of default object access controls to this bucket.
     @setting {optional String} [projection] Set of properties to return. Defaults to full.
     @return {::Bucket}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function buckets.update
     @summary  Updates a bucket. Changes to the bucket will be readable immediately after writing, but configuration changes may take time to propagate.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Bucket} [resource] Data of [::Bucket] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [ifMetagenerationMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the return of the bucket metadata conditional on whether the bucket's current metageneration does not match the given value.
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this bucket.
     @setting {optional String} [predefinedDefaultObjectAcl] Apply a predefined set of default object access controls to this bucket.
     @setting {optional String} [projection] Set of properties to return. Defaults to full.
     @return {::Bucket}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
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
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  stop: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/channels/stop',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.defaultObjectAccessControls = {

  /**
     @function defaultObjectAccessControls.delete
     @summary  Permanently deletes the default object ACL entry for the specified entity on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function defaultObjectAccessControls.get
     @summary  Returns the default object ACL entry for the specified entity on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function defaultObjectAccessControls.insert
     @summary  Creates a new default object ACL entry on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function defaultObjectAccessControls.list
     @summary  Retrieves default object ACL entries on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [ifMetagenerationMatch] If present, only return default ACL listing if the bucket's current metageneration matches this value.
     @setting {optional String} [ifMetagenerationNotMatch] If present, only return default ACL listing if the bucket's current metageneration does not match the given value.
     @return {::ObjectAccessControls}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function defaultObjectAccessControls.patch
     @summary  Updates a default object ACL entry on the specified bucket. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  },
  
  /**
     @function defaultObjectAccessControls.update
     @summary  Updates a default object ACL entry on the specified bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity'],
      pathParams: ['bucket', 'entity']
    });
  }
};


exports.objectAccessControls = {

  /**
     @function objectAccessControls.delete
     @summary  Permanently deletes the ACL entry for the specified entity on the specified object.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity', 'object'],
      pathParams: ['bucket', 'entity', 'object']
    });
  },
  
  /**
     @function objectAccessControls.get
     @summary  Returns the ACL entry for the specified entity on the specified object.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity', 'object'],
      pathParams: ['bucket', 'entity', 'object']
    });
  },
  
  /**
     @function objectAccessControls.insert
     @summary  Creates a new ACL entry on the specified object.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objectAccessControls.list
     @summary  Retrieves ACL entries on the specified object.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::ObjectAccessControls}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objectAccessControls.patch
     @summary  Updates an ACL entry on the specified object. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity', 'object'],
      pathParams: ['bucket', 'entity', 'object']
    });
  },
  
  /**
     @function objectAccessControls.update
     @summary  Updates an ACL entry on the specified object.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ObjectAccessControl} [resource] Data of [::ObjectAccessControl] structure
     @setting {String} [bucket] Name of a bucket. **Required**
     @setting {String} [entity] The entity holding the permission. Can be user-userId, user-emailAddress, group-groupId, group-emailAddress, allUsers, or allAuthenticatedUsers. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::ObjectAccessControl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}/acl/{entity}',
      params: params,
      requiredParams: ['bucket', 'entity', 'object'],
      pathParams: ['bucket', 'entity', 'object']
    });
  }
};


exports.objects = {

  /**
     @function objects.compose
     @summary  Concatenates a list of existing objects into a new object in the same bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ComposeRequest} [resource] Data of [::ComposeRequest] structure
     @setting {String} [destinationBucket] Name of the bucket in which to store the new object. **Required**
     @setting {String} [destinationObject] Name of the new object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {optional String} [destinationPredefinedAcl] Apply a predefined set of access controls to the destination object.
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's current generation matches the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  compose: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{destinationBucket}/o/{destinationObject}/compose',
      params: params,
      requiredParams: ['destinationBucket', 'destinationObject'],
      pathParams: ['destinationBucket', 'destinationObject']
    });
  },
  
  /**
     @function objects.copy
     @summary  Copies a source object to a destination object. Optionally overrides metadata.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Object} [resource] Data of [::Object] structure
     @setting {String} [destinationBucket] Name of the bucket in which to store the new object. Overrides the provided object metadata's bucket value, if any.For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {String} [destinationObject] Name of the new object. Required when the object metadata is not otherwise provided. Overrides the object metadata's name value, if any. **Required**
     @setting {optional String} [destinationPredefinedAcl] Apply a predefined set of access controls to the destination object.
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the destination object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the destination object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the destination object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the destination object's current metageneration does not match the given value.
     @setting {optional String} [ifSourceGenerationMatch] Makes the operation conditional on whether the source object's generation matches the given value.
     @setting {optional String} [ifSourceGenerationNotMatch] Makes the operation conditional on whether the source object's generation does not match the given value.
     @setting {optional String} [ifSourceMetagenerationMatch] Makes the operation conditional on whether the source object's current metageneration matches the given value.
     @setting {optional String} [ifSourceMetagenerationNotMatch] Makes the operation conditional on whether the source object's current metageneration does not match the given value.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl, unless the object resource specifies the acl property, when it defaults to full.
     @setting {String} [sourceBucket] Name of the bucket in which to find the source object. **Required**
     @setting {optional String} [sourceGeneration] If present, selects a specific revision of the source object (as opposed to the latest version, the default).
     @setting {String} [sourceObject] Name of the source object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  copy: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{sourceBucket}/o/{sourceObject}/copyTo/b/{destinationBucket}/o/{destinationObject}',
      params: params,
      requiredParams: ['destinationBucket', 'destinationObject', 'sourceBucket', 'sourceObject'],
      pathParams: ['destinationBucket', 'destinationObject', 'sourceBucket', 'sourceObject']
    });
  },
  
  /**
     @function objects.delete
     @summary  Deletes an object and its metadata. Deletions are permanent if versioning is not enabled for the bucket, or if the generation parameter is used.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of the bucket in which the object resides. **Required**
     @setting {optional String} [generation] If present, permanently deletes a specific revision of this object (as opposed to the latest version, the default).
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the object's current metageneration does not match the given value.
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objects.get
     @summary  Retrieves an object or its metadata.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of the bucket in which the object resides. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the object's generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the object's current metageneration does not match the given value.
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl.
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objects.insert
     @summary  Stores a new object and metadata.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Object} [resource] Data of [::Object] structure
     @setting {String} [media.mimeType] Mime type of media object (accepting \*\/\*)
     @setting {String|nodejs Buffer} [media.body] Media contents
     @setting {String} [bucket] Name of the bucket in which to store the new object. Overrides the provided object metadata's bucket value, if any. **Required**
     @setting {optional String} [contentEncoding] If set, sets the contentEncoding property of the final object to this value. Setting this parameter is equivalent to setting the contentEncoding metadata property. This can be useful when uploading an object with uploadType=media to indicate the encoding of the content being uploaded.
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the object's current metageneration does not match the given value.
     @setting {optional String} [name] Name of the object. Required when the object metadata is not otherwise provided. Overrides the object metadata's name value, if any. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts.
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this object.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl, unless the object resource specifies the acl property, when it defaults to full.
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o',
      mediaUrl: 'https://www.googleapis.com/upload/storage/v1/b/{bucket}/o',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function objects.list
     @summary  Retrieves a list of objects matching the criteria.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [bucket] Name of the bucket in which to look for objects. **Required**
     @setting {optional String} [delimiter] Returns results in a directory-like mode. items will contain only objects whose names, aside from the prefix, do not contain delimiter. Objects whose names, aside from the prefix, contain delimiter will have their name, truncated after the delimiter, returned in prefixes. Duplicate prefixes are omitted.
     @setting {optional Integer} [maxResults] Maximum number of items plus prefixes to return. As duplicate prefixes are omitted, fewer total results may be returned than requested. The default value of this parameter is 1,000 items.
     @setting {optional String} [pageToken] A previously-returned page token representing part of the larger set of results to view.
     @setting {optional String} [prefix] Filter results to objects whose names begin with this prefix.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl.
     @setting {optional Boolean} [versions] If true, lists all versions of an object as distinct results. The default is false. For more information, see Object Versioning.
     @return {::Objects}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  },
  
  /**
     @function objects.patch
     @summary  Updates an object's metadata. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Object} [resource] Data of [::Object] structure
     @setting {String} [bucket] Name of the bucket in which the object resides. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the object's current metageneration does not match the given value.
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this object.
     @setting {optional String} [projection] Set of properties to return. Defaults to full.
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objects.rewrite
     @summary  Rewrites a source object to a destination object. Optionally overrides metadata.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Object} [resource] Data of [::Object] structure
     @setting {String} [destinationBucket] Name of the bucket in which to store the new object. Overrides the provided object metadata's bucket value, if any. **Required**
     @setting {String} [destinationObject] Name of the new object. Required when the object metadata is not otherwise provided. Overrides the object metadata's name value, if any. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {optional String} [destinationPredefinedAcl] Apply a predefined set of access controls to the destination object.
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the destination object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the destination object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the destination object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the destination object's current metageneration does not match the given value.
     @setting {optional String} [ifSourceGenerationMatch] Makes the operation conditional on whether the source object's generation matches the given value.
     @setting {optional String} [ifSourceGenerationNotMatch] Makes the operation conditional on whether the source object's generation does not match the given value.
     @setting {optional String} [ifSourceMetagenerationMatch] Makes the operation conditional on whether the source object's current metageneration matches the given value.
     @setting {optional String} [ifSourceMetagenerationNotMatch] Makes the operation conditional on whether the source object's current metageneration does not match the given value.
     @setting {optional String} [maxBytesRewrittenPerCall] The maximum number of bytes that will be rewritten per rewrite request. Most callers shouldn't need to specify this parameter - it is primarily in place to support testing. If specified the value must be an integral multiple of 1 MiB (1048576). Also, this only applies to requests where the source and destination span locations and/or storage classes. Finally, this value must not change across rewrite calls else you'll get an error that the rewriteToken is invalid.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl, unless the object resource specifies the acl property, when it defaults to full.
     @setting {optional String} [rewriteToken] Include this field (from the previous rewrite response) on each rewrite request after the first one, until the rewrite response 'done' flag is true. Calls that provide a rewriteToken can omit all other request fields, but if included those fields must match the values provided in the first rewrite request.
     @setting {String} [sourceBucket] Name of the bucket in which to find the source object. **Required**
     @setting {optional String} [sourceGeneration] If present, selects a specific revision of the source object (as opposed to the latest version, the default).
     @setting {String} [sourceObject] Name of the source object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @return {::RewriteResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  rewrite: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{sourceBucket}/o/{sourceObject}/rewriteTo/b/{destinationBucket}/o/{destinationObject}',
      params: params,
      requiredParams: ['destinationBucket', 'destinationObject', 'sourceBucket', 'sourceObject'],
      pathParams: ['destinationBucket', 'destinationObject', 'sourceBucket', 'sourceObject']
    });
  },
  
  /**
     @function objects.update
     @summary  Updates an object's metadata.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Object} [resource] Data of [::Object] structure
     @setting {String} [bucket] Name of the bucket in which the object resides. **Required**
     @setting {optional String} [generation] If present, selects a specific revision of this object (as opposed to the latest version, the default).
     @setting {optional String} [ifGenerationMatch] Makes the operation conditional on whether the object's current generation matches the given value.
     @setting {optional String} [ifGenerationNotMatch] Makes the operation conditional on whether the object's current generation does not match the given value.
     @setting {optional String} [ifMetagenerationMatch] Makes the operation conditional on whether the object's current metageneration matches the given value.
     @setting {optional String} [ifMetagenerationNotMatch] Makes the operation conditional on whether the object's current metageneration does not match the given value.
     @setting {String} [object] Name of the object. For information about how to URL encode object names to be path safe, see Encoding URI Path Parts. **Required**
     @setting {optional String} [predefinedAcl] Apply a predefined set of access controls to this object.
     @setting {optional String} [projection] Set of properties to return. Defaults to full.
     @return {::Object}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/{object}',
      params: params,
      requiredParams: ['bucket', 'object'],
      pathParams: ['bucket', 'object']
    });
  },
  
  /**
     @function objects.watchAll
     @summary  Watch for changes on all objects in a bucket.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {String} [bucket] Name of the bucket in which to look for objects. **Required**
     @setting {optional String} [delimiter] Returns results in a directory-like mode. items will contain only objects whose names, aside from the prefix, do not contain delimiter. Objects whose names, aside from the prefix, contain delimiter will have their name, truncated after the delimiter, returned in prefixes. Duplicate prefixes are omitted.
     @setting {optional Integer} [maxResults] Maximum number of items plus prefixes to return. As duplicate prefixes are omitted, fewer total results may be returned than requested. The default value of this parameter is 1,000 items.
     @setting {optional String} [pageToken] A previously-returned page token representing part of the larger set of results to view.
     @setting {optional String} [prefix] Filter results to objects whose names begin with this prefix.
     @setting {optional String} [projection] Set of properties to return. Defaults to noAcl.
     @setting {optional Boolean} [versions] If true, lists all versions of an object as distinct results. The default is false. For more information, see Object Versioning.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  watchAll: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/storage/v1/b/{bucket}/o/watch',
      params: params,
      requiredParams: ['bucket'],
      pathParams: ['bucket']
    });
  }
};
