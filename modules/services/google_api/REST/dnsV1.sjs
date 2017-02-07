// This file was originally generated using conductance/tools/google/generate-google-api dns

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
  @summary Google Cloud DNS API v1 - Configures and serves authoritative DNS records.
  @desc
    Revision 20170130

    See also https://developers.google.com/cloud-dns.
*/

@ = require([
  'mho:std'
]);

/**
   @class Change
   @summary Google API JSON structure
   
   @variable Change.additions
   @summary Array - Which ResourceRecordSets to add?
   
   @variable Change.deletions
   @summary Array - Which ResourceRecordSets to remove? Must match existing data exactly.
   
   @variable Change.id
   @summary String - Unique identifier for the resource; defined by the server (output only).
   
   @variable Change.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "dns#change".
   
   @variable Change.startTime
   @summary String - The time that this operation was started by the server (output only). This is in RFC3339 text format.
   
   @variable Change.status
   @summary String - Status of the operation (output only).
   
   @class ChangesListResponse
   @summary Google API JSON structure
   
   @variable ChangesListResponse.changes
   @summary Array - The requested changes.
   
   @variable ChangesListResponse.kind
   @summary String - Type of resource.
   
   @variable ChangesListResponse.nextPageToken
   @summary String - The presence of this field indicates that there exist more results following your last page of results in pagination order. To fetch them, make another list request using this value as your pagination token.
   
   In this way you can retrieve the complete contents of even very large collections one page at a time. However, if the contents of the collection change between the first and last paginated list request, the set of all elements returned will be an inconsistent view of the collection. There is no way to retrieve a "snapshot" of collections larger than the maximum page size.
   
   @class ManagedZone
   @summary Google API JSON structure
   
   @variable ManagedZone.creationTime
   @summary String - The time that this resource was created on the server. This is in RFC3339 text format. Output only.
   
   @variable ManagedZone.description
   @summary String - A mutable string of at most 1024 characters associated with this resource for the user's convenience. Has no effect on the managed zone's function.
   
   @variable ManagedZone.dnsName
   @summary String - The DNS name of this managed zone, for instance "example.com.".
   
   @variable ManagedZone.id
   @summary String - Unique identifier for the resource; defined by the server (output only)
   
   @variable ManagedZone.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "dns#managedZone".
   
   @variable ManagedZone.name
   @summary String - User assigned name for this resource. Must be unique within the project. The name must be 1-63 characters long, must begin with a letter, end with a letter or digit, and only contain lowercase letters, digits or dashes.
   
   @variable ManagedZone.nameServerSet
   @summary String - Optionally specifies the NameServerSet for this ManagedZone. A NameServerSet is a set of DNS name servers that all host the same ManagedZones. Most users will leave this field unset.
   
   @variable ManagedZone.nameServers
   @summary Array - Delegate your managed_zone to these virtual name servers; defined by the server (output only)
   
   @class ManagedZonesListResponse
   @summary Google API JSON structure
   
   @variable ManagedZonesListResponse.kind
   @summary String - Type of resource.
   
   @variable ManagedZonesListResponse.managedZones
   @summary Array - The managed zone resources.
   
   @variable ManagedZonesListResponse.nextPageToken
   @summary String - The presence of this field indicates that there exist more results following your last page of results in pagination order. To fetch them, make another list request using this value as your page token.
   
   In this way you can retrieve the complete contents of even very large collections one page at a time. However, if the contents of the collection change between the first and last paginated list request, the set of all elements returned will be an inconsistent view of the collection. There is no way to retrieve a consistent snapshot of a collection larger than the maximum page size.
   
   @class Project
   @summary Google API JSON structure
   
   @variable Project.id
   @summary String - User assigned unique identifier for the resource (output only).
   
   @variable Project.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "dns#project".
   
   @variable Project.number
   @summary String - Unique numeric identifier for the resource; defined by the server (output only).
   
   @variable Project.quota
   @summary [::Quota] - Quotas assigned to this project (output only).
   
   @class Quota
   @summary Google API JSON structure
   
   @variable Quota.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "dns#quota".
   
   @variable Quota.managedZones
   @summary Integer - Maximum allowed number of managed zones in the project.
   
   @variable Quota.resourceRecordsPerRrset
   @summary Integer - Maximum allowed number of ResourceRecords per ResourceRecordSet.
   
   @variable Quota.rrsetAdditionsPerChange
   @summary Integer - Maximum allowed number of ResourceRecordSets to add per ChangesCreateRequest.
   
   @variable Quota.rrsetDeletionsPerChange
   @summary Integer - Maximum allowed number of ResourceRecordSets to delete per ChangesCreateRequest.
   
   @variable Quota.rrsetsPerManagedZone
   @summary Integer - Maximum allowed number of ResourceRecordSets per zone in the project.
   
   @variable Quota.totalRrdataSizePerChange
   @summary Integer - Maximum allowed size for total rrdata in one ChangesCreateRequest in bytes.
   
   @class ResourceRecordSet
   @summary Google API JSON structure
   
   @variable ResourceRecordSet.kind
   @summary String - Identifies what kind of resource this is. Value: the fixed string "dns#resourceRecordSet".
   
   @variable ResourceRecordSet.name
   @summary String - For example, www.example.com.
   
   @variable ResourceRecordSet.rrdatas
   @summary Array - As defined in RFC 1035 (section 5) and RFC 1034 (section 3.6.1).
   
   @variable ResourceRecordSet.ttl
   @summary Integer - Number of seconds that this ResourceRecordSet can be cached by resolvers.
   
   @variable ResourceRecordSet.type
   @summary String - The identifier of a supported record type, for example, A, AAAA, MX, TXT, and so on.
   
   @class ResourceRecordSetsListResponse
   @summary Google API JSON structure
   
   @variable ResourceRecordSetsListResponse.kind
   @summary String - Type of resource.
   
   @variable ResourceRecordSetsListResponse.nextPageToken
   @summary String - The presence of this field indicates that there exist more results following your last page of results in pagination order. To fetch them, make another list request using this value as your pagination token.
   
   In this way you can retrieve the complete contents of even very large collections one page at a time. However, if the contents of the collection change between the first and last paginated list request, the set of all elements returned will be an inconsistent view of the collection. There is no way to retrieve a consistent snapshot of a collection larger than the maximum page size.
   
   @variable ResourceRecordSetsListResponse.rrsets
   @summary Array - The resource record set resources.
*/

exports.changes = {

  /**
     @function changes.create
     @summary  Atomically update the ResourceRecordSet collection.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Change} [resource] Data of [::Change] structure
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::Change}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}/changes',
      params: params,
      requiredParams: ['managedZone', 'project'],
      pathParams: ['managedZone', 'project']
    });
  },
  
  /**
     @function changes.get
     @summary  Fetch the representation of an existing Change.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [changeId] The identifier of the requested change, from a previous ResourceRecordSetsChangeResponse. **Required**
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::Change}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}/changes/{changeId}',
      params: params,
      requiredParams: ['changeId', 'managedZone', 'project'],
      pathParams: ['changeId', 'managedZone', 'project']
    });
  },
  
  /**
     @function changes.list
     @summary  Enumerate Changes to a ResourceRecordSet collection.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {optional Integer} [maxResults] Optional. Maximum number of results to be returned. If unspecified, the server will decide how many results to return.
     @setting {optional String} [pageToken] Optional. A tag returned by a previous list request that was truncated. Use this parameter to continue a previous list request.
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @setting {optional String} [sortBy] Sorting criterion. The only supported value is change sequence.
     @setting {optional String} [sortOrder] Sorting order direction: 'ascending' or 'descending'.
     @return {::ChangesListResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}/changes',
      params: params,
      requiredParams: ['managedZone', 'project'],
      pathParams: ['managedZone', 'project']
    });
  }
};


exports.managedZones = {

  /**
     @function managedZones.create
     @summary  Create a new ManagedZone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ManagedZone} [resource] Data of [::ManagedZone] structure
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::ManagedZone}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  create: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function managedZones.delete
     @summary  Delete a previously created ManagedZone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}',
      params: params,
      requiredParams: ['managedZone', 'project'],
      pathParams: ['managedZone', 'project']
    });
  },
  
  /**
     @function managedZones.get
     @summary  Fetch the representation of an existing ManagedZone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::ManagedZone}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}',
      params: params,
      requiredParams: ['managedZone', 'project'],
      pathParams: ['managedZone', 'project']
    });
  },
  
  /**
     @function managedZones.list
     @summary  Enumerate ManagedZones that have been created but not yet deleted.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [dnsName] Restricts the list to return only zones with this domain name.
     @setting {optional Integer} [maxResults] Optional. Maximum number of results to be returned. If unspecified, the server will decide how many results to return.
     @setting {optional String} [pageToken] Optional. A tag returned by a previous list request that was truncated. Use this parameter to continue a previous list request.
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::ManagedZonesListResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.projects = {

  /**
     @function projects.get
     @summary  Fetch the representation of an existing Project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @return {::Project}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.resourceRecordSets = {

  /**
     @function resourceRecordSets.list
     @summary  Enumerate ResourceRecordSets that have been created but not yet deleted.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [managedZone] Identifies the managed zone addressed by this request. Can be the managed zone name or id. **Required**
     @setting {optional Integer} [maxResults] Optional. Maximum number of results to be returned. If unspecified, the server will decide how many results to return.
     @setting {optional String} [name] Restricts the list to return only records with this fully qualified domain name.
     @setting {optional String} [pageToken] Optional. A tag returned by a previous list request that was truncated. Use this parameter to continue a previous list request.
     @setting {String} [project] Identifies the project addressed by this request. **Required**
     @setting {optional String} [type] Restricts the list to return only records of this type. If present, the "name" parameter must also be present.
     @return {::ResourceRecordSetsListResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/cloud-platform.read-only - View your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/ndev.clouddns.readonly - View your DNS records hosted by Google Cloud DNS
        * https://www.googleapis.com/auth/ndev.clouddns.readwrite - View and manage your DNS records hosted by Google Cloud DNS
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/dns/v1/projects/{project}/managedZones/{managedZone}/rrsets',
      params: params,
      requiredParams: ['managedZone', 'project'],
      pathParams: ['managedZone', 'project']
    });
  }
};
