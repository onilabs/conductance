// This file was originally generated using conductance/tools/google/generate-google-api compute

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
  @summary Compute Engine API v1 - Creates and runs virtual machines on Google Cloud Platform.
  @desc
    Revision 20170118

    See also https://developers.google.com/compute/docs/reference/latest/.
*/

@ = require([
  'mho:std'
]);

/**
   @class AccessConfig
   @summary Google API JSON structure
   
   @variable AccessConfig.kind
   @summary String - [Output Only] Type of the resource. Always compute#accessConfig for access configs.
   
   @variable AccessConfig.name
   @summary String - Name of this access configuration.
   
   @variable AccessConfig.natIP
   @summary String - An external IP address associated with this instance. Specify an unused static external IP address available to the project or leave this field undefined to use an IP from a shared ephemeral IP address pool. If you specify a static external IP address, it must live in the same region as the zone of the instance.
   
   @variable AccessConfig.type
   @summary String - The type of configuration. The default and only option is ONE_TO_ONE_NAT.
   
   @class Address
   @summary Google API JSON structure
   
   @variable Address.address
   @summary String - The static external IP address represented by this resource. Only IPv4 is supported.
   
   @variable Address.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Address.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Address.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Address.kind
   @summary String - [Output Only] Type of the resource. Always compute#address for addresses.
   
   @variable Address.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Address.region
   @summary String - [Output Only] URL of the region where the regional address resides. This field is not applicable to global addresses.
   
   @variable Address.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Address.status
   @summary String - [Output Only] The status of the address, which can be either IN_USE or RESERVED. An address that is RESERVED is currently reserved and available to use. An IN_USE address is currently being used by another resource and is not available.
   
   @variable Address.users
   @summary Array - [Output Only] The URLs of the resources that are using this address.
   
   @class AddressAggregatedList
   @summary Google API JSON structure
   
   @variable AddressAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable AddressAggregatedList.items
   @summary Object - [Output Only] A map of scoped address lists.
   
   @variable AddressAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#addressAggregatedList for aggregated lists of addresses.
   
   @variable AddressAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable AddressAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AddressList
   @summary Google API JSON structure
   
   @variable AddressList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable AddressList.items
   @summary Array - [Output Only] A list of addresses.
   
   @variable AddressList.kind
   @summary String - [Output Only] Type of resource. Always compute#addressList for lists of addresses.
   
   @variable AddressList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable AddressList.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class AddressesScopedList
   @summary Google API JSON structure
   
   @variable AddressesScopedList.addresses
   @summary Array - [Output Only] List of addresses contained in this scope.
   
   @variable AddressesScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of addresses when the list is empty.
   
   @class AttachedDisk
   @summary Google API JSON structure
   
   @variable AttachedDisk.autoDelete
   @summary Boolean - Specifies whether the disk will be auto-deleted when the instance is deleted (but not when the disk is detached from the instance).
   
   @variable AttachedDisk.boot
   @summary Boolean - Indicates that this is a boot disk. The virtual machine will use the first partition of the disk for its root filesystem.
   
   @variable AttachedDisk.deviceName
   @summary String - Specifies a unique device name of your choice that is reflected into the /dev/disk/by-id/google-* tree of a Linux operating system running within the instance. This name can be used to reference the device for mounting, resizing, and so on, from within the instance.
   
   If not specified, the server chooses a default device name to apply to this disk, in the form persistent-disks-x, where x is a number assigned by Google Compute Engine. This field is only applicable for persistent disks.
   
   @variable AttachedDisk.diskEncryptionKey
   @summary [::CustomerEncryptionKey] - Encrypts or decrypts a disk using a customer-supplied encryption key.
   
   If you are creating a new disk, this field encrypts the new disk using an encryption key that you provide. If you are attaching an existing disk that is already encrypted, this field decrypts the disk using the customer-supplied encryption key.
   
   If you encrypt a disk using a customer-supplied key, you must provide the same key again when you attempt to use this resource at a later time. For example, you must provide the key when you create a snapshot or an image from the disk or when you attach the disk to a virtual machine instance.
   
   If you do not provide an encryption key, then the disk will be encrypted using an automatically generated key and you do not need to provide a key to use the disk later.
   
   Instance templates do not store customer-supplied encryption keys, so you cannot use your own keys to encrypt disks in a managed instance group.
   
   @variable AttachedDisk.index
   @summary Integer - Assigns a zero-based index to this disk, where 0 is reserved for the boot disk. For example, if you have many disks attached to an instance, each disk would have a unique index number. If not specified, the server will choose an appropriate value.
   
   @variable AttachedDisk.initializeParams
   @summary [::AttachedDiskInitializeParams] - [Input Only] Specifies the parameters for a new disk that will be created alongside the new instance. Use initialization parameters to create boot disks or local SSDs attached to the new instance.
   
   This property is mutually exclusive with the source property; you can only define one or the other, but not both.
   
   @variable AttachedDisk.interface
   @summary String - Specifies the disk interface to use for attaching this disk, which is either SCSI or NVME. The default is SCSI. Persistent disks must always use SCSI and the request will fail if you attempt to attach a persistent disk in any other format than SCSI. Local SSDs can use either NVME or SCSI. For performance characteristics of SCSI over NVMe, see Local SSD performance.
   
   @variable AttachedDisk.kind
   @summary String - [Output Only] Type of the resource. Always compute#attachedDisk for attached disks.
   
   @variable AttachedDisk.licenses
   @summary Array - [Output Only] Any valid publicly visible licenses.
   
   @variable AttachedDisk.mode
   @summary String - The mode in which to attach this disk, either READ_WRITE or READ_ONLY. If not specified, the default is to attach the disk in READ_WRITE mode.
   
   @variable AttachedDisk.source
   @summary String - Specifies a valid partial or full URL to an existing Persistent Disk resource. When creating a new instance, one of initializeParams.sourceImage or disks.source is required.
   
   If desired, you can also attach existing non-root persistent disks using this property. This field is only applicable for persistent disks.
   
   Note that for InstanceTemplate, specify the disk name, not the URL for the disk.
   
   @variable AttachedDisk.type
   @summary String - Specifies the type of the disk, either SCRATCH or PERSISTENT. If not specified, the default is PERSISTENT.
   
   @class AttachedDiskInitializeParams
   @summary Google API JSON structure
   
   @variable AttachedDiskInitializeParams.diskName
   @summary String - Specifies the disk name. If not specified, the default is to use the name of the instance.
   
   @variable AttachedDiskInitializeParams.diskSizeGb
   @summary String - Specifies the size of the disk in base-2 GB.
   
   @variable AttachedDiskInitializeParams.diskType
   @summary String - Specifies the disk type to use to create the instance. If not specified, the default is pd-standard, specified using the full URL. For example:
   
   https://www.googleapis.com/compute/v1/projects/project/zones/zone/diskTypes/pd-standard 
   
   Other values include pd-ssd and local-ssd. If you define this field, you can provide either the full or partial URL. For example, the following are valid values:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/diskTypes/diskType 
   - projects/project/zones/zone/diskTypes/diskType 
   - zones/zone/diskTypes/diskType  Note that for InstanceTemplate, this is the name of the disk type, not URL.
   
   @variable AttachedDiskInitializeParams.sourceImage
   @summary String - The source image to create this disk. When creating a new instance, one of initializeParams.sourceImage or disks.source is required.
   
   To create a disk with one of the public operating system images, specify the image by its family name. For example, specify family/debian-8 to use the latest Debian 8 image:
   
   projects/debian-cloud/global/images/family/debian-8 
   
   Alternatively, use a specific version of a public operating system image:
   
   projects/debian-cloud/global/images/debian-8-jessie-vYYYYMMDD 
   
   To create a disk with a private image that you created, specify the image name in the following format:
   
   global/images/my-private-image 
   
   You can also specify a private image by its image family, which returns the latest version of the image in that family. Replace the image name with family/family-name:
   
   global/images/family/my-private-family 
   
   If the source image is deleted later, this field will not be set.
   
   @variable AttachedDiskInitializeParams.sourceImageEncryptionKey
   @summary [::CustomerEncryptionKey] - The customer-supplied encryption key of the source image. Required if the source image is protected by a customer-supplied encryption key.
   
   Instance templates do not store customer-supplied encryption keys, so you cannot create disks for instances in a managed instance group if the source images are encrypted with your own keys.
   
   @class Autoscaler
   @summary Google API JSON structure
   
   @variable Autoscaler.autoscalingPolicy
   @summary [::AutoscalingPolicy] - The configuration parameters for the autoscaling algorithm. You can define one or more of the policies for an autoscaler: cpuUtilization, customMetricUtilizations, and loadBalancingUtilization.
   
   If none of these are specified, the default will be to autoscale based on cpuUtilization to 0.6 or 60%.
   
   @variable Autoscaler.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Autoscaler.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Autoscaler.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Autoscaler.kind
   @summary String - [Output Only] Type of the resource. Always compute#autoscaler for autoscalers.
   
   @variable Autoscaler.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Autoscaler.region
   @summary String - [Output Only] URL of the region where the instance group resides (for autoscalers living in regional scope).
   
   @variable Autoscaler.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Autoscaler.target
   @summary String - URL of the managed instance group that this autoscaler will scale.
   
   @variable Autoscaler.zone
   @summary String - [Output Only] URL of the zone where the instance group resides (for autoscalers living in zonal scope).
   
   @class AutoscalerAggregatedList
   @summary Google API JSON structure
   
   @variable AutoscalerAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable AutoscalerAggregatedList.items
   @summary Object - A map of scoped autoscaler lists.
   
   @variable AutoscalerAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#autoscalerAggregatedList for aggregated lists of autoscalers.
   
   @variable AutoscalerAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable AutoscalerAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AutoscalerList
   @summary Google API JSON structure
   
   @variable AutoscalerList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable AutoscalerList.items
   @summary Array - A list of Autoscaler resources.
   
   @variable AutoscalerList.kind
   @summary String - [Output Only] Type of resource. Always compute#autoscalerList for lists of autoscalers.
   
   @variable AutoscalerList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable AutoscalerList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AutoscalersScopedList
   @summary Google API JSON structure
   
   @variable AutoscalersScopedList.autoscalers
   @summary Array - [Output Only] List of autoscalers contained in this scope.
   
   @variable AutoscalersScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of autoscalers when the list is empty.
   
   @class AutoscalingPolicy
   @summary Google API JSON structure
   
   @variable AutoscalingPolicy.coolDownPeriodSec
   @summary Integer - The number of seconds that the autoscaler should wait before it starts collecting information from a new instance. This prevents the autoscaler from collecting information when the instance is initializing, during which the collected usage would not be reliable. The default time autoscaler waits is 60 seconds.
   
   Virtual machine initialization times might vary because of numerous factors. We recommend that you test how long an instance may take to initialize. To do this, create an instance and time the startup process.
   
   @variable AutoscalingPolicy.cpuUtilization
   @summary [::AutoscalingPolicyCpuUtilization] - Defines the CPU utilization policy that allows the autoscaler to scale based on the average CPU utilization of a managed instance group.
   
   @variable AutoscalingPolicy.customMetricUtilizations
   @summary Array - Configuration parameters of autoscaling based on a custom metric.
   
   @variable AutoscalingPolicy.loadBalancingUtilization
   @summary [::AutoscalingPolicyLoadBalancingUtilization] - Configuration parameters of autoscaling based on load balancer.
   
   @variable AutoscalingPolicy.maxNumReplicas
   @summary Integer - The maximum number of instances that the autoscaler can scale up to. This is required when creating or updating an autoscaler. The maximum number of replicas should not be lower than minimal number of replicas.
   
   @variable AutoscalingPolicy.minNumReplicas
   @summary Integer - The minimum number of replicas that the autoscaler can scale down to. This cannot be less than 0. If not provided, autoscaler will choose a default value depending on maximum number of instances allowed.
   
   @class AutoscalingPolicyCpuUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyCpuUtilization.utilizationTarget
   @summary Number - The target CPU utilization that the autoscaler should maintain. Must be a float value in the range (0, 1]. If not specified, the default is 0.6.
   
   If the CPU level is below the target utilization, the autoscaler scales down the number of instances until it reaches the minimum number of instances you specified or until the average CPU of your instances reaches the target utilization.
   
   If the average CPU is above the target utilization, the autoscaler scales up until it reaches the maximum number of instances you specified or until the average utilization reaches the target utilization.
   
   @class AutoscalingPolicyCustomMetricUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyCustomMetricUtilization.metric
   @summary String - The identifier of the Stackdriver Monitoring metric. The metric cannot have negative values and should be a utilization metric, which means that the number of virtual machines handling requests should increase or decrease proportionally to the metric. The metric must also have a label of compute.googleapis.com/resource_id with the value of the instance's unique ID, although this alone does not guarantee that the metric is valid.
   
   For example, the following is a valid metric:
   compute.googleapis.com/instance/network/received_bytes_count
   The following is not a valid metric because it does not increase or decrease based on usage:
   compute.googleapis.com/instance/cpu/reserved_cores
   
   @variable AutoscalingPolicyCustomMetricUtilization.utilizationTarget
   @summary Number - Target value of the metric which autoscaler should maintain. Must be a positive value.
   
   @variable AutoscalingPolicyCustomMetricUtilization.utilizationTargetType
   @summary String - Defines how target utilization value is expressed for a Stackdriver Monitoring metric. Either GAUGE, DELTA_PER_SECOND, or DELTA_PER_MINUTE. If not specified, the default is GAUGE.
   
   @class AutoscalingPolicyLoadBalancingUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyLoadBalancingUtilization.utilizationTarget
   @summary Number - Fraction of backend capacity utilization (set in HTTP(s) load balancing configuration) that autoscaler should maintain. Must be a positive float value. If not defined, the default is 0.8.
   
   @class Backend
   @summary Google API JSON structure
   
   @variable Backend.balancingMode
   @summary String - Specifies the balancing mode for this backend. For global HTTP(S) or TCP/SSL load balancing, the default is UTILIZATION. Valid values are UTILIZATION, RATE (for HTTP(S)) and CONNECTION (for TCP/SSL).
   
   This cannot be used for internal load balancing.
   
   @variable Backend.capacityScaler
   @summary Number - A multiplier applied to the group's maximum servicing capacity (based on UTILIZATION, RATE or CONNECTION). Default value is 1, which means the group will serve up to 100% of its configured capacity (depending on balancingMode). A setting of 0 means the group is completely drained, offering 0% of its available Capacity. Valid range is [0.0,1.0].
   
   This cannot be used for internal load balancing.
   
   @variable Backend.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Backend.group
   @summary String - The fully-qualified URL of a zonal Instance Group resource. This instance group defines the list of instances that serve traffic. Member virtual machine instances from each instance group must live in the same zone as the instance group itself. No two backends in a backend service are allowed to use same Instance Group resource.
   
   Note that you must specify an Instance Group resource using the fully-qualified URL, rather than a partial URL.
   
   When the BackendService has load balancing scheme INTERNAL, the instance group must be in a zone within the same region as the BackendService.
   
   @variable Backend.maxConnections
   @summary Integer - The max number of simultaneous connections for the group. Can be used with either CONNECTION or UTILIZATION balancing modes. For CONNECTION mode, either maxConnections or maxConnectionsPerInstance must be set.
   
   This cannot be used for internal load balancing.
   
   @variable Backend.maxConnectionsPerInstance
   @summary Integer - The max number of simultaneous connections that a single backend instance can handle. This is used to calculate the capacity of the group. Can be used in either CONNECTION or UTILIZATION balancing modes. For CONNECTION mode, either maxConnections or maxConnectionsPerInstance must be set.
   
   This cannot be used for internal load balancing.
   
   @variable Backend.maxRate
   @summary Integer - The max requests per second (RPS) of the group. Can be used with either RATE or UTILIZATION balancing modes, but required if RATE mode. For RATE mode, either maxRate or maxRatePerInstance must be set.
   
   This cannot be used for internal load balancing.
   
   @variable Backend.maxRatePerInstance
   @summary Number - The max requests per second (RPS) that a single backend instance can handle.This is used to calculate the capacity of the group. Can be used in either balancing mode. For RATE mode, either maxRate or maxRatePerInstance must be set.
   
   This cannot be used for internal load balancing.
   
   @variable Backend.maxUtilization
   @summary Number - Used when balancingMode is UTILIZATION. This ratio defines the CPU utilization target for the group. The default is 0.8. Valid range is [0.0, 1.0].
   
   This cannot be used for internal load balancing.
   
   @class BackendService
   @summary Google API JSON structure
   
   @variable BackendService.affinityCookieTtlSec
   @summary Integer - Lifetime of cookies in seconds if session_affinity is GENERATED_COOKIE. If set to 0, the cookie is non-persistent and lasts only until the end of the browser session (or equivalent). The maximum allowed value for TTL is one day.
   
   When the load balancing scheme is INTERNAL, this field is not used.
   
   @variable BackendService.backends
   @summary Array - The list of backends that serve this BackendService.
   
   @variable BackendService.connectionDraining
   @summary [::ConnectionDraining]
   
   @variable BackendService.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable BackendService.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable BackendService.enableCDN
   @summary Boolean - If true, enable Cloud CDN for this BackendService.
   
   When the load balancing scheme is INTERNAL, this field is not used.
   
   @variable BackendService.fingerprint
   @summary String - Fingerprint of this resource. A hash of the contents stored in this object. This field is used in optimistic locking. This field will be ignored when inserting a BackendService. An up-to-date fingerprint must be provided in order to update the BackendService.
   
   @variable BackendService.healthChecks
   @summary Array - The list of URLs to the HttpHealthCheck or HttpsHealthCheck resource for health checking this BackendService. Currently at most one health check can be specified, and a health check is required.
   
   For internal load balancing, a URL to a HealthCheck resource must be specified instead.
   
   @variable BackendService.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable BackendService.kind
   @summary String - [Output Only] Type of resource. Always compute#backendService for backend services.
   
   @variable BackendService.loadBalancingScheme
   @summary String
   
   @variable BackendService.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable BackendService.port
   @summary Integer - Deprecated in favor of portName. The TCP port to connect on the backend. The default value is 80.
   
   This cannot be used for internal load balancing.
   
   @variable BackendService.portName
   @summary String - Name of backend port. The same name should appear in the instance groups referenced by this service. Required when the load balancing scheme is EXTERNAL.
   
   When the load balancing scheme is INTERNAL, this field is not used.
   
   @variable BackendService.protocol
   @summary String - The protocol this BackendService uses to communicate with backends.
   
   Possible values are HTTP, HTTPS, HTTP2, TCP and SSL. The default is HTTP.
   
   For internal load balancing, the possible values are TCP and UDP, and the default is TCP.
   
   @variable BackendService.region
   @summary String - [Output Only] URL of the region where the regional backend service resides. This field is not applicable to global backend services.
   
   @variable BackendService.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable BackendService.sessionAffinity
   @summary String - Type of session affinity to use. The default is NONE.
   
   When the load balancing scheme is EXTERNAL, can be NONE, CLIENT_IP, or GENERATED_COOKIE.
   
   When the load balancing scheme is INTERNAL, can be NONE, CLIENT_IP, CLIENT_IP_PROTO, or CLIENT_IP_PORT_PROTO.
   
   When the protocol is UDP, this field is not used.
   
   @variable BackendService.timeoutSec
   @summary Integer - How many seconds to wait for the backend before considering it a failed request. Default is 30 seconds.
   
   @class BackendServiceAggregatedList
   @summary Google API JSON structure
   
   @variable BackendServiceAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable BackendServiceAggregatedList.items
   @summary Object - A map of scoped BackendService lists.
   
   @variable BackendServiceAggregatedList.kind
   @summary String - Type of resource.
   
   @variable BackendServiceAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable BackendServiceAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class BackendServiceGroupHealth
   @summary Google API JSON structure
   
   @variable BackendServiceGroupHealth.healthStatus
   @summary Array
   
   @variable BackendServiceGroupHealth.kind
   @summary String - [Output Only] Type of resource. Always compute#backendServiceGroupHealth for the health of backend services.
   
   @class BackendServiceList
   @summary Google API JSON structure
   
   @variable BackendServiceList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable BackendServiceList.items
   @summary Array - A list of BackendService resources.
   
   @variable BackendServiceList.kind
   @summary String - [Output Only] Type of resource. Always compute#backendServiceList for lists of backend services.
   
   @variable BackendServiceList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable BackendServiceList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class BackendServicesScopedList
   @summary Google API JSON structure
   
   @variable BackendServicesScopedList.backendServices
   @summary Array - List of BackendServices contained in this scope.
   
   @variable BackendServicesScopedList.warning
   @summary Object - Informational warning which replaces the list of backend services when the list is empty.
   
   @class CacheInvalidationRule
   @summary Google API JSON structure
   
   @variable CacheInvalidationRule.host
   @summary String - If set, this invalidation rule will only apply to requests with a Host header matching host.
   
   @variable CacheInvalidationRule.path
   @summary String
   
   @class ConnectionDraining
   @summary Google API JSON structure
   
   @variable ConnectionDraining.drainingTimeoutSec
   @summary Integer - Time for which instance will be drained (not accept new connections, but still work to finish started).
   
   @class CustomerEncryptionKey
   @summary Google API JSON structure
   
   @variable CustomerEncryptionKey.rawKey
   @summary String - Specifies a 256-bit customer-supplied encryption key, encoded in RFC 4648 base64 to either encrypt or decrypt this resource.
   
   @variable CustomerEncryptionKey.sha256
   @summary String - [Output only] The RFC 4648 base64 encoded SHA-256 hash of the customer-supplied encryption key that protects this resource.
   
   @class CustomerEncryptionKeyProtectedDisk
   @summary Google API JSON structure
   
   @variable CustomerEncryptionKeyProtectedDisk.diskEncryptionKey
   @summary [::CustomerEncryptionKey] - Decrypts data associated with the disk with a customer-supplied encryption key.
   
   @variable CustomerEncryptionKeyProtectedDisk.source
   @summary String - Specifies a valid partial or full URL to an existing Persistent Disk resource. This field is only applicable for persistent disks.
   
   @class DeprecationStatus
   @summary Google API JSON structure
   
   @variable DeprecationStatus.deleted
   @summary String - An optional RFC3339 timestamp on or after which the state of this resource is intended to change to DELETED. This is only informational and the status will not change unless the client explicitly changes it.
   
   @variable DeprecationStatus.deprecated
   @summary String - An optional RFC3339 timestamp on or after which the state of this resource is intended to change to DEPRECATED. This is only informational and the status will not change unless the client explicitly changes it.
   
   @variable DeprecationStatus.obsolete
   @summary String - An optional RFC3339 timestamp on or after which the state of this resource is intended to change to OBSOLETE. This is only informational and the status will not change unless the client explicitly changes it.
   
   @variable DeprecationStatus.replacement
   @summary String - The URL of the suggested replacement for a deprecated resource. The suggested replacement resource must be the same kind of resource as the deprecated resource.
   
   @variable DeprecationStatus.state
   @summary String - The deprecation state of this resource. This can be DEPRECATED, OBSOLETE, or DELETED. Operations which create a new resource using a DEPRECATED resource will return successfully, but with a warning indicating the deprecated resource and recommending its replacement. Operations which use OBSOLETE or DELETED resources will be rejected and result in an error.
   
   @class Disk
   @summary Google API JSON structure
   
   @variable Disk.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Disk.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Disk.diskEncryptionKey
   @summary [::CustomerEncryptionKey] - Encrypts the disk using a customer-supplied encryption key.
   
   After you encrypt a disk with a customer-supplied key, you must provide the same key if you use the disk later (e.g. to create a disk snapshot or an image, or to attach the disk to a virtual machine).
   
   Customer-supplied encryption keys do not protect access to metadata of the disk.
   
   If you do not provide an encryption key when creating the disk, then the disk will be encrypted using an automatically generated key and you do not need to provide a key to use the disk later.
   
   @variable Disk.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Disk.kind
   @summary String - [Output Only] Type of the resource. Always compute#disk for disks.
   
   @variable Disk.lastAttachTimestamp
   @summary String - [Output Only] Last attach timestamp in RFC3339 text format.
   
   @variable Disk.lastDetachTimestamp
   @summary String - [Output Only] Last detach timestamp in RFC3339 text format.
   
   @variable Disk.licenses
   @summary Array - Any applicable publicly visible licenses.
   
   @variable Disk.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Disk.options
   @summary String - Internal use only.
   
   @variable Disk.selfLink
   @summary String - [Output Only] Server-defined fully-qualified URL for this resource.
   
   @variable Disk.sizeGb
   @summary String - Size of the persistent disk, specified in GB. You can specify this field when creating a persistent disk using the sourceImage or sourceSnapshot parameter, or specify it alone to create an empty persistent disk.
   
   If you specify this field along with sourceImage or sourceSnapshot, the value of sizeGb must not be less than the size of the sourceImage or the size of the snapshot.
   
   @variable Disk.sourceImage
   @summary String - The source image used to create this disk. If the source image is deleted, this field will not be set.
   
   To create a disk with one of the public operating system images, specify the image by its family name. For example, specify family/debian-8 to use the latest Debian 8 image:
   
   projects/debian-cloud/global/images/family/debian-8 
   
   Alternatively, use a specific version of a public operating system image:
   
   projects/debian-cloud/global/images/debian-8-jessie-vYYYYMMDD 
   
   To create a disk with a private image that you created, specify the image name in the following format:
   
   global/images/my-private-image 
   
   You can also specify a private image by its image family, which returns the latest version of the image in that family. Replace the image name with family/family-name:
   
   global/images/family/my-private-family
   
   @variable Disk.sourceImageEncryptionKey
   @summary [::CustomerEncryptionKey] - The customer-supplied encryption key of the source image. Required if the source image is protected by a customer-supplied encryption key.
   
   @variable Disk.sourceImageId
   @summary String - [Output Only] The ID value of the image used to create this disk. This value identifies the exact image that was used to create this persistent disk. For example, if you created the persistent disk from an image that was later deleted and recreated under the same name, the source image ID would identify the exact version of the image that was used.
   
   @variable Disk.sourceSnapshot
   @summary String - The source snapshot used to create this disk. You can provide this as a partial or full URL to the resource. For example, the following are valid values:  
   - https://www.googleapis.com/compute/v1/projects/project/global/snapshots/snapshot 
   - projects/project/global/snapshots/snapshot 
   - global/snapshots/snapshot
   
   @variable Disk.sourceSnapshotEncryptionKey
   @summary [::CustomerEncryptionKey] - The customer-supplied encryption key of the source snapshot. Required if the source snapshot is protected by a customer-supplied encryption key.
   
   @variable Disk.sourceSnapshotId
   @summary String - [Output Only] The unique ID of the snapshot used to create this disk. This value identifies the exact snapshot that was used to create this persistent disk. For example, if you created the persistent disk from a snapshot that was later deleted and recreated under the same name, the source snapshot ID would identify the exact version of the snapshot that was used.
   
   @variable Disk.status
   @summary String - [Output Only] The status of disk creation.
   
   @variable Disk.type
   @summary String - URL of the disk type resource describing which disk type to use to create the disk. Provide this when creating the disk.
   
   @variable Disk.users
   @summary Array - [Output Only] Links to the users of the disk (attached instances) in form: project/zones/zone/instances/instance
   
   @variable Disk.zone
   @summary String - [Output Only] URL of the zone where the disk resides.
   
   @class DiskAggregatedList
   @summary Google API JSON structure
   
   @variable DiskAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable DiskAggregatedList.items
   @summary Object - [Output Only] A map of scoped disk lists.
   
   @variable DiskAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskAggregatedList for aggregated lists of persistent disks.
   
   @variable DiskAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable DiskAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskList
   @summary Google API JSON structure
   
   @variable DiskList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable DiskList.items
   @summary Array - [Output Only] A list of persistent disks.
   
   @variable DiskList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskList for lists of disks.
   
   @variable DiskList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable DiskList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskMoveRequest
   @summary Google API JSON structure
   
   @variable DiskMoveRequest.destinationZone
   @summary String - The URL of the destination zone to move the disk. This can be a full or partial URL. For example, the following are all valid URLs to a zone:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone 
   - projects/project/zones/zone 
   - zones/zone
   
   @variable DiskMoveRequest.targetDisk
   @summary String - The URL of the target disk to move. This can be a full or partial URL. For example, the following are all valid URLs to a disk:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/disks/disk 
   - projects/project/zones/zone/disks/disk 
   - zones/zone/disks/disk
   
   @class DiskType
   @summary Google API JSON structure
   
   @variable DiskType.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable DiskType.defaultDiskSizeGb
   @summary String - [Output Only] Server-defined default disk size in GB.
   
   @variable DiskType.deprecated
   @summary [::DeprecationStatus] - [Output Only] The deprecation status associated with this disk type.
   
   @variable DiskType.description
   @summary String - [Output Only] An optional description of this resource.
   
   @variable DiskType.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable DiskType.kind
   @summary String - [Output Only] Type of the resource. Always compute#diskType for disk types.
   
   @variable DiskType.name
   @summary String - [Output Only] Name of the resource.
   
   @variable DiskType.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable DiskType.validDiskSize
   @summary String - [Output Only] An optional textual description of the valid disk size, such as "10GB-10TB".
   
   @variable DiskType.zone
   @summary String - [Output Only] URL of the zone where the disk type resides.
   
   @class DiskTypeAggregatedList
   @summary Google API JSON structure
   
   @variable DiskTypeAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable DiskTypeAggregatedList.items
   @summary Object - [Output Only] A map of scoped disk type lists.
   
   @variable DiskTypeAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskTypeAggregatedList.
   
   @variable DiskTypeAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable DiskTypeAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskTypeList
   @summary Google API JSON structure
   
   @variable DiskTypeList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable DiskTypeList.items
   @summary Array - [Output Only] A list of Disk Type resources.
   
   @variable DiskTypeList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskTypeList for disk types.
   
   @variable DiskTypeList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable DiskTypeList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskTypesScopedList
   @summary Google API JSON structure
   
   @variable DiskTypesScopedList.diskTypes
   @summary Array - [Output Only] List of disk types contained in this scope.
   
   @variable DiskTypesScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of disk types when the list is empty.
   
   @class DisksResizeRequest
   @summary Google API JSON structure
   
   @variable DisksResizeRequest.sizeGb
   @summary String - The new size of the persistent disk, which is specified in GB.
   
   @class DisksScopedList
   @summary Google API JSON structure
   
   @variable DisksScopedList.disks
   @summary Array - [Output Only] List of disks contained in this scope.
   
   @variable DisksScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of disks when the list is empty.
   
   @class Firewall
   @summary Google API JSON structure
   
   @variable Firewall.allowed
   @summary Array - The list of ALLOW rules specified by this firewall. Each rule specifies a protocol and port-range tuple that describes a permitted connection.
   
   @variable Firewall.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Firewall.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Firewall.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Firewall.kind
   @summary String - [Output Ony] Type of the resource. Always compute#firewall for firewall rules.
   
   @variable Firewall.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Firewall.network
   @summary String - URL of the network resource for this firewall rule. If not specified when creating a firewall rule, the default network is used:
   global/networks/default
   If you choose to specify this property, you can specify the network as a full or partial URL. For example, the following are all valid URLs:  
   - https://www.googleapis.com/compute/v1/projects/myproject/global/networks/my-network 
   - projects/myproject/global/networks/my-network 
   - global/networks/default
   
   @variable Firewall.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Firewall.sourceRanges
   @summary Array - If source ranges are specified, the firewall will apply only to traffic that has source IP address in these ranges. These ranges must be expressed in CIDR format. One or both of sourceRanges and sourceTags may be set. If both properties are set, the firewall will apply to traffic that has source IP address within sourceRanges OR the source IP that belongs to a tag listed in the sourceTags property. The connection does not need to match both properties for the firewall to apply. Only IPv4 is supported.
   
   @variable Firewall.sourceTags
   @summary Array - If source tags are specified, the firewall will apply only to traffic with source IP that belongs to a tag listed in source tags. Source tags cannot be used to control traffic to an instance's external IP address. Because tags are associated with an instance, not an IP address. One or both of sourceRanges and sourceTags may be set. If both properties are set, the firewall will apply to traffic that has source IP address within sourceRanges OR the source IP that belongs to a tag listed in the sourceTags property. The connection does not need to match both properties for the firewall to apply.
   
   @variable Firewall.targetTags
   @summary Array - A list of instance tags indicating sets of instances located in the network that may make network connections as specified in allowed[]. If no targetTags are specified, the firewall rule applies to all instances on the specified network.
   
   @class FirewallList
   @summary Google API JSON structure
   
   @variable FirewallList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable FirewallList.items
   @summary Array - [Output Only] A list of Firewall resources.
   
   @variable FirewallList.kind
   @summary String - [Output Only] Type of resource. Always compute#firewallList for lists of firewalls.
   
   @variable FirewallList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable FirewallList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ForwardingRule
   @summary Google API JSON structure
   
   @variable ForwardingRule.IPAddress
   @summary String - The IP address that this forwarding rule is serving on behalf of.
   
   For global forwarding rules, the address must be a global IP; for regional forwarding rules, the address must live in the same region as the forwarding rule. By default, this field is empty and an ephemeral IP from the same scope (global or regional) will be assigned.
   
   When the load balancing scheme is INTERNAL, this can only be an RFC 1918 IP address belonging to the network/subnetwork configured for the forwarding rule. A reserved address cannot be used. If the field is empty, the IP address will be automatically allocated from the internal IP range of the subnetwork or network configured for this forwarding rule. Only IPv4 is supported.
   
   @variable ForwardingRule.IPProtocol
   @summary String - The IP protocol to which this rule applies. Valid options are TCP, UDP, ESP, AH, SCTP or ICMP.
   
   When the load balancing scheme is INTERNAL</code, only TCP and UDP are valid.
   
   @variable ForwardingRule.backendService
   @summary String - This field is not used for external load balancing.
   
   For internal load balancing, this field identifies the BackendService resource to receive the matched traffic.
   
   @variable ForwardingRule.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable ForwardingRule.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable ForwardingRule.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable ForwardingRule.kind
   @summary String - [Output Only] Type of the resource. Always compute#forwardingRule for Forwarding Rule resources.
   
   @variable ForwardingRule.loadBalancingScheme
   @summary String - This signifies what the ForwardingRule will be used for and can only take the following values: INTERNAL EXTERNAL The value of INTERNAL means that this will be used for Internal Network Load Balancing (TCP, UDP). The value of EXTERNAL means that this will be used for External Load Balancing (HTTP(S) LB, External TCP/UDP LB, SSL Proxy)
   
   @variable ForwardingRule.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable ForwardingRule.network
   @summary String - This field is not used for external load balancing.
   
   For internal load balancing, this field identifies the network that the load balanced IP should belong to for this Forwarding Rule. If this field is not specified, the default network will be used.
   
   @variable ForwardingRule.portRange
   @summary String - Applicable only when IPProtocol is TCP, UDP, or SCTP, only packets addressed to ports in the specified range will be forwarded to target. Forwarding rules with the same [IPAddress, IPProtocol] pair must have disjoint port ranges.
   
   This field is not used for internal load balancing.
   
   @variable ForwardingRule.ports
   @summary Array - This field is not used for external load balancing.
   
   When the load balancing scheme is INTERNAL, a single port or a comma separated list of ports can be configured. Only packets addressed to these ports will be forwarded to the backends configured with this forwarding rule. If the port list is not provided then all ports are allowed to pass through.
   
   You may specify a maximum of up to 5 ports.
   
   @variable ForwardingRule.region
   @summary String - [Output Only] URL of the region where the regional forwarding rule resides. This field is not applicable to global forwarding rules.
   
   @variable ForwardingRule.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable ForwardingRule.subnetwork
   @summary String - This field is not used for external load balancing.
   
   For internal load balancing, this field identifies the subnetwork that the load balanced IP should belong to for this Forwarding Rule.
   
   If the network specified is in auto subnet mode, this field is optional. However, if the network is in custom subnet mode, a subnetwork must be specified.
   
   @variable ForwardingRule.target
   @summary String - The URL of the target resource to receive the matched traffic. For regional forwarding rules, this target must live in the same region as the forwarding rule. For global forwarding rules, this target must be a global TargetHttpProxy or TargetHttpsProxy resource. The forwarded traffic must be of a type appropriate to the target object. For example, TargetHttpProxy requires HTTP traffic, and TargetHttpsProxy requires HTTPS traffic.
   
   This field is not used for internal load balancing.
   
   @class ForwardingRuleAggregatedList
   @summary Google API JSON structure
   
   @variable ForwardingRuleAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable ForwardingRuleAggregatedList.items
   @summary Object - A map of scoped forwarding rule lists.
   
   @variable ForwardingRuleAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#forwardingRuleAggregatedList for lists of forwarding rules.
   
   @variable ForwardingRuleAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable ForwardingRuleAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ForwardingRuleList
   @summary Google API JSON structure
   
   @variable ForwardingRuleList.id
   @summary String - [Output Only] Unique identifier for the resource. Set by the server.
   
   @variable ForwardingRuleList.items
   @summary Array - A list of ForwardingRule resources.
   
   @variable ForwardingRuleList.kind
   @summary String - Type of resource.
   
   @variable ForwardingRuleList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable ForwardingRuleList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ForwardingRulesScopedList
   @summary Google API JSON structure
   
   @variable ForwardingRulesScopedList.forwardingRules
   @summary Array - List of forwarding rules contained in this scope.
   
   @variable ForwardingRulesScopedList.warning
   @summary Object - Informational warning which replaces the list of forwarding rules when the list is empty.
   
   @class GuestOsFeature
   @summary Google API JSON structure
   
   @variable GuestOsFeature.type
   @summary String - The type of supported feature. Currenty only VIRTIO_SCSI_MULTIQUEUE is supported. For newer Windows images, the server might also populate this property with the value WINDOWS to indicate that this is a Windows image. This value is purely informational and does not enable or disable any features.
   
   @class HTTPHealthCheck
   @summary Google API JSON structure
   
   @variable HTTPHealthCheck.host
   @summary String - The value of the host header in the HTTP health check request. If left empty (default value), the IP on behalf of which this health check is performed will be used.
   
   @variable HTTPHealthCheck.port
   @summary Integer - The TCP port number for the health check request. The default value is 80.
   
   @variable HTTPHealthCheck.portName
   @summary String - Port name as defined in InstanceGroup#NamedPort#name. If both port and port_name are defined, port takes precedence.
   
   @variable HTTPHealthCheck.proxyHeader
   @summary String - Specifies the type of proxy header to append before sending data to the backend, either NONE or PROXY_V1. The default is NONE.
   
   @variable HTTPHealthCheck.requestPath
   @summary String - The request path of the HTTP health check request. The default value is /.
   
   @class HTTPSHealthCheck
   @summary Google API JSON structure
   
   @variable HTTPSHealthCheck.host
   @summary String - The value of the host header in the HTTPS health check request. If left empty (default value), the IP on behalf of which this health check is performed will be used.
   
   @variable HTTPSHealthCheck.port
   @summary Integer - The TCP port number for the health check request. The default value is 443.
   
   @variable HTTPSHealthCheck.portName
   @summary String - Port name as defined in InstanceGroup#NamedPort#name. If both port and port_name are defined, port takes precedence.
   
   @variable HTTPSHealthCheck.proxyHeader
   @summary String - Specifies the type of proxy header to append before sending data to the backend, either NONE or PROXY_V1. The default is NONE.
   
   @variable HTTPSHealthCheck.requestPath
   @summary String - The request path of the HTTPS health check request. The default value is /.
   
   @class HealthCheck
   @summary Google API JSON structure
   
   @variable HealthCheck.checkIntervalSec
   @summary Integer - How often (in seconds) to send a health check. The default value is 5 seconds.
   
   @variable HealthCheck.creationTimestamp
   @summary String - [Output Only] Creation timestamp in 3339 text format.
   
   @variable HealthCheck.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable HealthCheck.healthyThreshold
   @summary Integer - A so-far unhealthy instance will be marked healthy after this many consecutive successes. The default value is 2.
   
   @variable HealthCheck.httpHealthCheck
   @summary [::HTTPHealthCheck]
   
   @variable HealthCheck.httpsHealthCheck
   @summary [::HTTPSHealthCheck]
   
   @variable HealthCheck.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable HealthCheck.kind
   @summary String - Type of the resource.
   
   @variable HealthCheck.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable HealthCheck.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable HealthCheck.sslHealthCheck
   @summary [::SSLHealthCheck]
   
   @variable HealthCheck.tcpHealthCheck
   @summary [::TCPHealthCheck]
   
   @variable HealthCheck.timeoutSec
   @summary Integer - How long (in seconds) to wait before claiming failure. The default value is 5 seconds. It is invalid for timeoutSec to have greater value than checkIntervalSec.
   
   @variable HealthCheck.type
   @summary String - Specifies the type of the healthCheck, either TCP, SSL, HTTP or HTTPS. If not specified, the default is TCP. Exactly one of the protocol-specific health check field must be specified, which must match type field.
   
   @variable HealthCheck.unhealthyThreshold
   @summary Integer - A so-far healthy instance will be marked unhealthy after this many consecutive failures. The default value is 2.
   
   @class HealthCheckList
   @summary Google API JSON structure
   
   @variable HealthCheckList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable HealthCheckList.items
   @summary Array - A list of HealthCheck resources.
   
   @variable HealthCheckList.kind
   @summary String - Type of resource.
   
   @variable HealthCheckList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable HealthCheckList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class HealthCheckReference
   @summary Google API JSON structure
   
   @variable HealthCheckReference.healthCheck
   @summary String
   
   @class HealthStatus
   @summary Google API JSON structure
   
   @variable HealthStatus.healthState
   @summary String - Health state of the instance.
   
   @variable HealthStatus.instance
   @summary String - URL of the instance resource.
   
   @variable HealthStatus.ipAddress
   @summary String - The IP address represented by this resource.
   
   @variable HealthStatus.port
   @summary Integer - The port on the instance.
   
   @class HostRule
   @summary Google API JSON structure
   
   @variable HostRule.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable HostRule.hosts
   @summary Array - The list of host patterns to match. They must be valid hostnames, except * will match any string of ([a-z0-9-.]*). In that case, * must be the first character and must be followed in the pattern by either - or ..
   
   @variable HostRule.pathMatcher
   @summary String - The name of the PathMatcher to use to match the path portion of the URL if the hostRule matches the URL's host portion.
   
   @class HttpHealthCheck
   @summary Google API JSON structure
   
   @variable HttpHealthCheck.checkIntervalSec
   @summary Integer - How often (in seconds) to send a health check. The default value is 5 seconds.
   
   @variable HttpHealthCheck.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable HttpHealthCheck.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable HttpHealthCheck.healthyThreshold
   @summary Integer - A so-far unhealthy instance will be marked healthy after this many consecutive successes. The default value is 2.
   
   @variable HttpHealthCheck.host
   @summary String - The value of the host header in the HTTP health check request. If left empty (default value), the public IP on behalf of which this health check is performed will be used.
   
   @variable HttpHealthCheck.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable HttpHealthCheck.kind
   @summary String - [Output Only] Type of the resource. Always compute#httpHealthCheck for HTTP health checks.
   
   @variable HttpHealthCheck.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable HttpHealthCheck.port
   @summary Integer - The TCP port number for the HTTP health check request. The default value is 80.
   
   @variable HttpHealthCheck.requestPath
   @summary String - The request path of the HTTP health check request. The default value is /.
   
   @variable HttpHealthCheck.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable HttpHealthCheck.timeoutSec
   @summary Integer - How long (in seconds) to wait before claiming failure. The default value is 5 seconds. It is invalid for timeoutSec to have greater value than checkIntervalSec.
   
   @variable HttpHealthCheck.unhealthyThreshold
   @summary Integer - A so-far healthy instance will be marked unhealthy after this many consecutive failures. The default value is 2.
   
   @class HttpHealthCheckList
   @summary Google API JSON structure
   
   @variable HttpHealthCheckList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable HttpHealthCheckList.items
   @summary Array - A list of HttpHealthCheck resources.
   
   @variable HttpHealthCheckList.kind
   @summary String - Type of resource.
   
   @variable HttpHealthCheckList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable HttpHealthCheckList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class HttpsHealthCheck
   @summary Google API JSON structure
   
   @variable HttpsHealthCheck.checkIntervalSec
   @summary Integer - How often (in seconds) to send a health check. The default value is 5 seconds.
   
   @variable HttpsHealthCheck.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable HttpsHealthCheck.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable HttpsHealthCheck.healthyThreshold
   @summary Integer - A so-far unhealthy instance will be marked healthy after this many consecutive successes. The default value is 2.
   
   @variable HttpsHealthCheck.host
   @summary String - The value of the host header in the HTTPS health check request. If left empty (default value), the public IP on behalf of which this health check is performed will be used.
   
   @variable HttpsHealthCheck.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable HttpsHealthCheck.kind
   @summary String - Type of the resource.
   
   @variable HttpsHealthCheck.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable HttpsHealthCheck.port
   @summary Integer - The TCP port number for the HTTPS health check request. The default value is 443.
   
   @variable HttpsHealthCheck.requestPath
   @summary String - The request path of the HTTPS health check request. The default value is "/".
   
   @variable HttpsHealthCheck.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable HttpsHealthCheck.timeoutSec
   @summary Integer - How long (in seconds) to wait before claiming failure. The default value is 5 seconds. It is invalid for timeoutSec to have a greater value than checkIntervalSec.
   
   @variable HttpsHealthCheck.unhealthyThreshold
   @summary Integer - A so-far healthy instance will be marked unhealthy after this many consecutive failures. The default value is 2.
   
   @class HttpsHealthCheckList
   @summary Google API JSON structure
   
   @variable HttpsHealthCheckList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable HttpsHealthCheckList.items
   @summary Array - A list of HttpsHealthCheck resources.
   
   @variable HttpsHealthCheckList.kind
   @summary String - Type of resource.
   
   @variable HttpsHealthCheckList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable HttpsHealthCheckList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Image
   @summary Google API JSON structure
   
   @variable Image.archiveSizeBytes
   @summary String - Size of the image tar.gz archive stored in Google Cloud Storage (in bytes).
   
   @variable Image.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Image.deprecated
   @summary [::DeprecationStatus] - The deprecation status associated with this image.
   
   @variable Image.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Image.diskSizeGb
   @summary String - Size of the image when restored onto a persistent disk (in GB).
   
   @variable Image.family
   @summary String - The name of the image family to which this image belongs. You can create disks by specifying an image family instead of a specific image name. The image family always returns its latest image that is not deprecated. The name of the image family must comply with RFC1035.
   
   @variable Image.guestOsFeatures
   @summary Array - A list of features to enable on the guest OS. Applicable for bootable images only. Currently, only one feature can be enabled, VIRTIO_SCSCI_MULTIQUEUE, which allows each virtual CPU to have its own queue. For Windows images, you can only enable VIRTIO_SCSCI_MULTIQUEUE on images with driver version 1.2.0.1621 or higher. Linux images with kernel versions 3.17 and higher will support VIRTIO_SCSCI_MULTIQUEUE.
   
   For new Windows images, the server might also populate this field with the value WINDOWS, to indicate that this is a Windows image. This value is purely informational and does not enable or disable any features.
   
   @variable Image.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Image.imageEncryptionKey
   @summary [::CustomerEncryptionKey] - Encrypts the image using a customer-supplied encryption key.
   
   After you encrypt an image with a customer-supplied key, you must provide the same key if you use the image later (e.g. to create a disk from the image).
   
   Customer-supplied encryption keys do not protect access to metadata of the disk.
   
   If you do not provide an encryption key when creating the image, then the disk will be encrypted using an automatically generated key and you do not need to provide a key to use the image later.
   
   @variable Image.kind
   @summary String - [Output Only] Type of the resource. Always compute#image for images.
   
   @variable Image.licenses
   @summary Array - Any applicable license URI.
   
   @variable Image.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Image.rawDisk
   @summary Object - The parameters of the raw disk image.
   
   @variable Image.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Image.sourceDisk
   @summary String - URL of the source disk used to create this image. This can be a full or valid partial URL. You must provide either this property or the rawDisk.source property but not both to create an image. For example, the following are valid values:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/disks/disk 
   - projects/project/zones/zone/disks/disk 
   - zones/zone/disks/disk
   
   @variable Image.sourceDiskEncryptionKey
   @summary [::CustomerEncryptionKey] - The customer-supplied encryption key of the source disk. Required if the source disk is protected by a customer-supplied encryption key.
   
   @variable Image.sourceDiskId
   @summary String - The ID value of the disk used to create this image. This value may be used to determine whether the image was taken from the current or a previous instance of a given disk name.
   
   @variable Image.sourceType
   @summary String - The type of the image used to create this disk. The default and only value is RAW
   
   @variable Image.status
   @summary String - [Output Only] The status of the image. An image can be used to create other resources, such as instances, only after the image has been successfully created and the status is set to READY. Possible values are FAILED, PENDING, or READY.
   
   @class ImageList
   @summary Google API JSON structure
   
   @variable ImageList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable ImageList.items
   @summary Array - [Output Only] A list of Image resources.
   
   @variable ImageList.kind
   @summary String - Type of resource.
   
   @variable ImageList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable ImageList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Instance
   @summary Google API JSON structure
   
   @variable Instance.canIpForward
   @summary Boolean - Allows this instance to send and receive packets with non-matching destination or source IPs. This is required if you plan to use this instance to forward routes. For more information, see Enabling IP Forwarding.
   
   @variable Instance.cpuPlatform
   @summary String - [Output Only] The CPU platform used by this instance.
   
   @variable Instance.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Instance.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Instance.disks
   @summary Array - Array of disks associated with this instance. Persistent disks must be created before you can assign them.
   
   @variable Instance.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Instance.kind
   @summary String - [Output Only] Type of the resource. Always compute#instance for instances.
   
   @variable Instance.machineType
   @summary String - Full or partial URL of the machine type resource to use for this instance, in the format: zones/zone/machineTypes/machine-type. This is provided by the client when the instance is created. For example, the following is a valid partial url to a predefined machine type:
   
   zones/us-central1-f/machineTypes/n1-standard-1 
   
   To create a custom machine type, provide a URL to a machine type in the following format, where CPUS is 1 or an even number up to 32 (2, 4, 6, ... 24, etc), and MEMORY is the total memory for this instance. Memory must be a multiple of 256 MB and must be supplied in MB (e.g. 5 GB of memory is 5120 MB):
   
   zones/zone/machineTypes/custom-CPUS-MEMORY 
   
   For example: zones/us-central1-f/machineTypes/custom-4-5120 
   
   For a full list of restrictions, read the Specifications for custom machine types.
   
   @variable Instance.metadata
   @summary [::Metadata] - The metadata key/value pairs assigned to this instance. This includes custom metadata and predefined keys.
   
   @variable Instance.name
   @summary String - The name of the resource, provided by the client when initially creating the resource. The resource name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Instance.networkInterfaces
   @summary Array - An array of configurations for this interface. This specifies how this interface is configured to interact with other network services, such as connecting to the internet. Only one interface is supported per instance.
   
   @variable Instance.scheduling
   @summary [::Scheduling] - Scheduling options for this instance.
   
   @variable Instance.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @variable Instance.serviceAccounts
   @summary Array - A list of service accounts, with their specified scopes, authorized for this instance. Service accounts generate access tokens that can be accessed through the metadata server and used to authenticate applications on the instance. See Service Accounts for more information.
   
   @variable Instance.status
   @summary String - [Output Only] The status of the instance. One of the following values: PROVISIONING, STAGING, RUNNING, STOPPING, SUSPENDING, SUSPENDED, and TERMINATED.
   
   @variable Instance.statusMessage
   @summary String - [Output Only] An optional, human-readable explanation of the status.
   
   @variable Instance.tags
   @summary [::Tags] - A list of tags to apply to this instance. Tags are used to identify valid sources or targets for network firewalls and are specified by the client during instance creation. The tags can be later modified by the setTags method. Each tag within the list must comply with RFC1035.
   
   @variable Instance.zone
   @summary String - [Output Only] URL of the zone where the instance resides.
   
   @class InstanceAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable InstanceAggregatedList.items
   @summary Object - [Output Only] A map of scoped instance lists.
   
   @variable InstanceAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#instanceAggregatedList for aggregated lists of Instance resources.
   
   @variable InstanceAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class InstanceGroup
   @summary Google API JSON structure
   
   @variable InstanceGroup.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this instance group in RFC3339 text format.
   
   @variable InstanceGroup.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable InstanceGroup.fingerprint
   @summary String - [Output Only] The fingerprint of the named ports. The system uses this fingerprint to detect conflicts when multiple users change the named ports concurrently.
   
   @variable InstanceGroup.id
   @summary String - [Output Only] A unique identifier for this instance group, generated by the server.
   
   @variable InstanceGroup.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroup for instance groups.
   
   @variable InstanceGroup.name
   @summary String - The name of the instance group. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable InstanceGroup.namedPorts
   @summary Array - Assigns a name to a port number. For example: {name: "http", port: 80}
   
   This allows the system to reference ports by the assigned name instead of a port number. Named ports can also contain multiple ports. For example: [{name: "http", port: 80},{name: "http", port: 8080}] 
   
   Named ports apply to all instances in this instance group.
   
   @variable InstanceGroup.network
   @summary String - The URL of the network to which all instances in the instance group belong.
   
   @variable InstanceGroup.region
   @summary String - The URL of the region where the instance group is located (for regional resources).
   
   @variable InstanceGroup.selfLink
   @summary String - [Output Only] The URL for this instance group. The server generates this URL.
   
   @variable InstanceGroup.size
   @summary Integer - [Output Only] The total number of instances in the instance group.
   
   @variable InstanceGroup.subnetwork
   @summary String - The URL of the subnetwork to which all instances in the instance group belong.
   
   @variable InstanceGroup.zone
   @summary String - [Output Only] The URL of the zone where the instance group is located (for zonal resources).
   
   @class InstanceGroupAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceGroupAggregatedList.id
   @summary String - [Output Only] A unique identifier for this aggregated list of instance groups. The server generates this identifier.
   
   @variable InstanceGroupAggregatedList.items
   @summary Object - A map of scoped instance group lists.
   
   @variable InstanceGroupAggregatedList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupAggregatedList for aggregated lists of instance groups.
   
   @variable InstanceGroupAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceGroupAggregatedList.selfLink
   @summary String - [Output Only] The URL for this resource type. The server generates this URL.
   
   @class InstanceGroupList
   @summary Google API JSON structure
   
   @variable InstanceGroupList.id
   @summary String - [Output Only] A unique identifier for this list of instance groups. The server generates this identifier.
   
   @variable InstanceGroupList.items
   @summary Array - A list of instance groups.
   
   @variable InstanceGroupList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupList for instance group lists.
   
   @variable InstanceGroupList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceGroupList.selfLink
   @summary String - [Output Only] The URL for this resource type. The server generates this URL.
   
   @class InstanceGroupManager
   @summary Google API JSON structure
   
   @variable InstanceGroupManager.baseInstanceName
   @summary String - The base instance name to use for instances in this group. The value must be 1-58 characters long. Instances are named by appending a hyphen and a random four-character string to the base instance name. The base instance name must comply with RFC1035.
   
   @variable InstanceGroupManager.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this managed instance group in RFC3339 text format.
   
   @variable InstanceGroupManager.currentActions
   @summary [::InstanceGroupManagerActionsSummary] - [Output Only] The list of instance actions and the number of instances in this managed instance group that are scheduled for each of those actions.
   
   @variable InstanceGroupManager.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable InstanceGroupManager.fingerprint
   @summary String - [Output Only] The fingerprint of the resource data. You can use this optional field for optimistic locking when you update the resource.
   
   @variable InstanceGroupManager.id
   @summary String - [Output Only] A unique identifier for this resource type. The server generates this identifier.
   
   @variable InstanceGroupManager.instanceGroup
   @summary String - [Output Only] The URL of the Instance Group resource.
   
   @variable InstanceGroupManager.instanceTemplate
   @summary String - The URL of the instance template that is specified for this managed instance group. The group uses this template to create all new instances in the managed instance group.
   
   @variable InstanceGroupManager.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupManager for managed instance groups.
   
   @variable InstanceGroupManager.name
   @summary String - The name of the managed instance group. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable InstanceGroupManager.namedPorts
   @summary Array - Named ports configured for the Instance Groups complementary to this Instance Group Manager.
   
   @variable InstanceGroupManager.region
   @summary String - [Output Only] The URL of the region where the managed instance group resides (for regional resources).
   
   @variable InstanceGroupManager.selfLink
   @summary String - [Output Only] The URL for this managed instance group. The server defines this URL.
   
   @variable InstanceGroupManager.targetPools
   @summary Array - The URLs for all TargetPool resources to which instances in the instanceGroup field are added. The target pools automatically apply to all of the instances in the managed instance group.
   
   @variable InstanceGroupManager.targetSize
   @summary Integer - The target number of running instances for this managed instance group. Deleting or abandoning instances reduces this number. Resizing the group changes this number.
   
   @variable InstanceGroupManager.zone
   @summary String - [Output Only] The URL of the zone where the managed instance group is located (for zonal resources).
   
   @class InstanceGroupManagerActionsSummary
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerActionsSummary.abandoning
   @summary Integer - [Output Only] The total number of instances in the managed instance group that are scheduled to be abandoned. Abandoning an instance removes it from the managed instance group without deleting it.
   
   @variable InstanceGroupManagerActionsSummary.creating
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be created or are currently being created. If the group fails to create any of these instances, it tries again until it creates the instance successfully.
   
   If you have disabled creation retries, this field will not be populated; instead, the creatingWithoutRetries field will be populated.
   
   @variable InstanceGroupManagerActionsSummary.creatingWithoutRetries
   @summary Integer - [Output Only] The number of instances that the managed instance group will attempt to create. The group attempts to create each instance only once. If the group fails to create any of these instances, it decreases the group's targetSize value accordingly.
   
   @variable InstanceGroupManagerActionsSummary.deleting
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be deleted or are currently being deleted.
   
   @variable InstanceGroupManagerActionsSummary.none
   @summary Integer - [Output Only] The number of instances in the managed instance group that are running and have no scheduled actions.
   
   @variable InstanceGroupManagerActionsSummary.recreating
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be recreated or are currently being being recreated. Recreating an instance deletes the existing root persistent disk and creates a new disk from the image that is defined in the instance template.
   
   @variable InstanceGroupManagerActionsSummary.refreshing
   @summary Integer - [Output Only] The number of instances in the managed instance group that are being reconfigured with properties that do not require a restart or a recreate action. For example, setting or removing target pools for the instance.
   
   @variable InstanceGroupManagerActionsSummary.restarting
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be restarted or are currently being restarted.
   
   @class InstanceGroupManagerAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerAggregatedList.id
   @summary String - [Output Only] A unique identifier for this aggregated list of managed instance groups. The server generates this identifier.
   
   @variable InstanceGroupManagerAggregatedList.items
   @summary Object - [Output Only] A map of filtered managed instance group lists.
   
   @variable InstanceGroupManagerAggregatedList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupManagerAggregatedList for an aggregated list of managed instance groups.
   
   @variable InstanceGroupManagerAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceGroupManagerAggregatedList.selfLink
   @summary String - [Output Only] The URL for this resource type. The server generates this URL.
   
   @class InstanceGroupManagerList
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerList.id
   @summary String - [Output Only] A unique identifier for this resource type. The server generates this identifier.
   
   @variable InstanceGroupManagerList.items
   @summary Array - [Output Only] A list of managed instance groups.
   
   @variable InstanceGroupManagerList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupManagerList for a list of managed instance groups.
   
   @variable InstanceGroupManagerList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceGroupManagerList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class InstanceGroupManagersAbandonInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersAbandonInstancesRequest.instances
   @summary Array - The URL for one or more instances to abandon from the managed instance group.
   
   @class InstanceGroupManagersDeleteInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersDeleteInstancesRequest.instances
   @summary Array - The list of instances to delete from this managed instance group. Specify one or more instance URLs.
   
   @class InstanceGroupManagersListManagedInstancesResponse
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersListManagedInstancesResponse.managedInstances
   @summary Array - [Output Only] The list of instances in the managed instance group.
   
   @class InstanceGroupManagersRecreateInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersRecreateInstancesRequest.instances
   @summary Array - The URL for one or more instances to recreate.
   
   @class InstanceGroupManagersScopedList
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersScopedList.instanceGroupManagers
   @summary Array - [Output Only] The list of managed instance groups that are contained in the specified project and zone.
   
   @variable InstanceGroupManagersScopedList.warning
   @summary Object - [Output Only] The warning that replaces the list of managed instance groups when the list is empty.
   
   @class InstanceGroupManagersSetInstanceTemplateRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersSetInstanceTemplateRequest.instanceTemplate
   @summary String - The URL of the instance template that is specified for this managed instance group. The group uses this template to create all new instances in the managed instance group.
   
   @class InstanceGroupManagersSetTargetPoolsRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersSetTargetPoolsRequest.fingerprint
   @summary String - The fingerprint of the target pools information. Use this optional property to prevent conflicts when multiple users change the target pools settings concurrently. Obtain the fingerprint with the instanceGroupManagers.get method. Then, include the fingerprint in your request to ensure that you do not overwrite changes that were applied from another concurrent request.
   
   @variable InstanceGroupManagersSetTargetPoolsRequest.targetPools
   @summary Array - The list of target pool URLs that instances in this managed instance group belong to. The managed instance group applies these target pools to all of the instances in the group. Existing instances and new instances in the group all receive these target pool settings.
   
   @class InstanceGroupsAddInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsAddInstancesRequest.instances
   @summary Array - The list of instances to add to the instance group.
   
   @class InstanceGroupsListInstances
   @summary Google API JSON structure
   
   @variable InstanceGroupsListInstances.id
   @summary String - [Output Only] A unique identifier for this list of instances in the specified instance group. The server generates this identifier.
   
   @variable InstanceGroupsListInstances.items
   @summary Array - [Output Only] A list of instances and any named ports that are assigned to those instances.
   
   @variable InstanceGroupsListInstances.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupsListInstances for the list of instances in the specified instance group.
   
   @variable InstanceGroupsListInstances.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceGroupsListInstances.selfLink
   @summary String - [Output Only] The URL for this list of instances in the specified instance groups. The server generates this URL.
   
   @class InstanceGroupsListInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsListInstancesRequest.instanceState
   @summary String - A filter for the state of the instances in the instance group. Valid options are ALL or RUNNING. If you do not specify this parameter the list includes all instances regardless of their state.
   
   @class InstanceGroupsRemoveInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsRemoveInstancesRequest.instances
   @summary Array - The list of instances to remove from the instance group.
   
   @class InstanceGroupsScopedList
   @summary Google API JSON structure
   
   @variable InstanceGroupsScopedList.instanceGroups
   @summary Array - [Output Only] The list of instance groups that are contained in this scope.
   
   @variable InstanceGroupsScopedList.warning
   @summary Object - [Output Only] An informational warning that replaces the list of instance groups when the list is empty.
   
   @class InstanceGroupsSetNamedPortsRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsSetNamedPortsRequest.fingerprint
   @summary String - The fingerprint of the named ports information for this instance group. Use this optional property to prevent conflicts when multiple users change the named ports settings concurrently. Obtain the fingerprint with the instanceGroups.get method. Then, include the fingerprint in your request to ensure that you do not overwrite changes that were applied from another concurrent request.
   
   @variable InstanceGroupsSetNamedPortsRequest.namedPorts
   @summary Array - The list of named ports to set for this instance group.
   
   @class InstanceList
   @summary Google API JSON structure
   
   @variable InstanceList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable InstanceList.items
   @summary Array - [Output Only] A list of instances.
   
   @variable InstanceList.kind
   @summary String - [Output Only] Type of resource. Always compute#instanceList for lists of Instance resources.
   
   @variable InstanceList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class InstanceMoveRequest
   @summary Google API JSON structure
   
   @variable InstanceMoveRequest.destinationZone
   @summary String - The URL of the destination zone to move the instance. This can be a full or partial URL. For example, the following are all valid URLs to a zone:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone 
   - projects/project/zones/zone 
   - zones/zone
   
   @variable InstanceMoveRequest.targetInstance
   @summary String - The URL of the target instance to move. This can be a full or partial URL. For example, the following are all valid URLs to an instance:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/instances/instance 
   - projects/project/zones/zone/instances/instance 
   - zones/zone/instances/instance
   
   @class InstanceProperties
   @summary Google API JSON structure
   
   @variable InstanceProperties.canIpForward
   @summary Boolean - Enables instances created based on this template to send packets with source IP addresses other than their own and receive packets with destination IP addresses other than their own. If these instances will be used as an IP gateway or it will be set as the next-hop in a Route resource, specify true. If unsure, leave this set to false. See the Enable IP forwarding for instances documentation for more information.
   
   @variable InstanceProperties.description
   @summary String - An optional text description for the instances that are created from this instance template.
   
   @variable InstanceProperties.disks
   @summary Array - An array of disks that are associated with the instances that are created from this template.
   
   @variable InstanceProperties.machineType
   @summary String - The machine type to use for instances that are created from this template.
   
   @variable InstanceProperties.metadata
   @summary [::Metadata] - The metadata key/value pairs to assign to instances that are created from this template. These pairs can consist of custom metadata or predefined keys. See Project and instance metadata for more information.
   
   @variable InstanceProperties.networkInterfaces
   @summary Array - An array of network access configurations for this interface.
   
   @variable InstanceProperties.scheduling
   @summary [::Scheduling] - Specifies the scheduling options for the instances that are created from this template.
   
   @variable InstanceProperties.serviceAccounts
   @summary Array - A list of service accounts with specified scopes. Access tokens for these service accounts are available to the instances that are created from this template. Use metadata queries to obtain the access tokens for these instances.
   
   @variable InstanceProperties.tags
   @summary [::Tags] - A list of tags to apply to the instances that are created from this template. The tags identify valid sources or targets for network firewalls. The setTags method can modify this list of tags. Each tag within the list must comply with RFC1035.
   
   @class InstanceReference
   @summary Google API JSON structure
   
   @variable InstanceReference.instance
   @summary String - The URL for a specific instance.
   
   @class InstanceTemplate
   @summary Google API JSON structure
   
   @variable InstanceTemplate.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this instance template in RFC3339 text format.
   
   @variable InstanceTemplate.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable InstanceTemplate.id
   @summary String - [Output Only] A unique identifier for this instance template. The server defines this identifier.
   
   @variable InstanceTemplate.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceTemplate for instance templates.
   
   @variable InstanceTemplate.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable InstanceTemplate.properties
   @summary [::InstanceProperties] - The instance properties for this instance template.
   
   @variable InstanceTemplate.selfLink
   @summary String - [Output Only] The URL for this instance template. The server defines this URL.
   
   @class InstanceTemplateList
   @summary Google API JSON structure
   
   @variable InstanceTemplateList.id
   @summary String - [Output Only] A unique identifier for this instance template. The server defines this identifier.
   
   @variable InstanceTemplateList.items
   @summary Array - [Output Only] list of InstanceTemplate resources.
   
   @variable InstanceTemplateList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceTemplatesListResponse for instance template lists.
   
   @variable InstanceTemplateList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable InstanceTemplateList.selfLink
   @summary String - [Output Only] The URL for this instance template list. The server defines this URL.
   
   @class InstanceWithNamedPorts
   @summary Google API JSON structure
   
   @variable InstanceWithNamedPorts.instance
   @summary String - [Output Only] The URL of the instance.
   
   @variable InstanceWithNamedPorts.namedPorts
   @summary Array - [Output Only] The named ports that belong to this instance group.
   
   @variable InstanceWithNamedPorts.status
   @summary String - [Output Only] The status of the instance.
   
   @class InstancesScopedList
   @summary Google API JSON structure
   
   @variable InstancesScopedList.instances
   @summary Array - [Output Only] List of instances contained in this scope.
   
   @variable InstancesScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of instances when the list is empty.
   
   @class InstancesSetMachineTypeRequest
   @summary Google API JSON structure
   
   @variable InstancesSetMachineTypeRequest.machineType
   @summary String - Full or partial URL of the machine type resource. See Machine Types for a full list of machine types. For example: zones/us-central1-f/machineTypes/n1-standard-1
   
   @class InstancesSetServiceAccountRequest
   @summary Google API JSON structure
   
   @variable InstancesSetServiceAccountRequest.email
   @summary String - Email address of the service account.
   
   @variable InstancesSetServiceAccountRequest.scopes
   @summary Array - The list of scopes to be made available for this service account.
   
   @class InstancesStartWithEncryptionKeyRequest
   @summary Google API JSON structure
   
   @variable InstancesStartWithEncryptionKeyRequest.disks
   @summary Array - Array of disks associated with this instance that are protected with a customer-supplied encryption key.
   
   In order to start the instance, the disk url and its corresponding key must be provided.
   
   If the disk is not protected with a customer-supplied encryption key it should not be specified.
   
   @class License
   @summary Google API JSON structure
   
   @variable License.chargesUseFee
   @summary Boolean - [Output Only] If true, the customer will be charged license fee for running software that contains this license on an instance.
   
   @variable License.kind
   @summary String - [Output Only] Type of resource. Always compute#license for licenses.
   
   @variable License.name
   @summary String - [Output Only] Name of the resource. The name is 1-63 characters long and complies with RFC1035.
   
   @variable License.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class MachineType
   @summary Google API JSON structure
   
   @variable MachineType.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable MachineType.deprecated
   @summary [::DeprecationStatus] - [Output Only] The deprecation status associated with this machine type.
   
   @variable MachineType.description
   @summary String - [Output Only] An optional textual description of the resource.
   
   @variable MachineType.guestCpus
   @summary Integer - [Output Only] The number of virtual CPUs that are available to the instance.
   
   @variable MachineType.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable MachineType.imageSpaceGb
   @summary Integer - [Deprecated] This property is deprecated and will never be populated with any relevant values.
   
   @variable MachineType.isSharedCpu
   @summary Boolean - [Output Only] Whether this machine type has a shared CPU. See Shared-core machine types for more information.
   
   @variable MachineType.kind
   @summary String - [Output Only] The type of the resource. Always compute#machineType for machine types.
   
   @variable MachineType.maximumPersistentDisks
   @summary Integer - [Output Only] Maximum persistent disks allowed.
   
   @variable MachineType.maximumPersistentDisksSizeGb
   @summary String - [Output Only] Maximum total persistent disks size (GB) allowed.
   
   @variable MachineType.memoryMb
   @summary Integer - [Output Only] The amount of physical memory available to the instance, defined in MB.
   
   @variable MachineType.name
   @summary String - [Output Only] Name of the resource.
   
   @variable MachineType.scratchDisks
   @summary Array - [Output Only] List of extended scratch disks assigned to the instance.
   
   @variable MachineType.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable MachineType.zone
   @summary String - [Output Only] The name of the zone where the machine type resides, such as us-central1-a.
   
   @class MachineTypeAggregatedList
   @summary Google API JSON structure
   
   @variable MachineTypeAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable MachineTypeAggregatedList.items
   @summary Object - [Output Only] A map of scoped machine type lists.
   
   @variable MachineTypeAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#machineTypeAggregatedList for aggregated lists of machine types.
   
   @variable MachineTypeAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable MachineTypeAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class MachineTypeList
   @summary Google API JSON structure
   
   @variable MachineTypeList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable MachineTypeList.items
   @summary Array - [Output Only] A list of Machine Type resources.
   
   @variable MachineTypeList.kind
   @summary String - [Output Only] Type of resource. Always compute#machineTypeList for lists of machine types.
   
   @variable MachineTypeList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable MachineTypeList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class MachineTypesScopedList
   @summary Google API JSON structure
   
   @variable MachineTypesScopedList.machineTypes
   @summary Array - [Output Only] List of machine types contained in this scope.
   
   @variable MachineTypesScopedList.warning
   @summary Object - [Output Only] An informational warning that appears when the machine types list is empty.
   
   @class ManagedInstance
   @summary Google API JSON structure
   
   @variable ManagedInstance.currentAction
   @summary String - [Output Only] The current action that the managed instance group has scheduled for the instance. Possible values: 
   - NONE The instance is running, and the managed instance group does not have any scheduled actions for this instance. 
   - CREATING The managed instance group is creating this instance. If the group fails to create this instance, it will try again until it is successful. 
   - CREATING_WITHOUT_RETRIES The managed instance group is attempting to create this instance only once. If the group fails to create this instance, it does not try again and the group's targetSize value is decreased instead. 
   - RECREATING The managed instance group is recreating this instance. 
   - DELETING The managed instance group is permanently deleting this instance. 
   - ABANDONING The managed instance group is abandoning this instance. The instance will be removed from the instance group and from any target pools that are associated with this group. 
   - RESTARTING The managed instance group is restarting the instance. 
   - REFRESHING The managed instance group is applying configuration changes to the instance without stopping it. For example, the group can update the target pool list for an instance without stopping that instance.
   
   @variable ManagedInstance.id
   @summary String - [Output only] The unique identifier for this resource. This field is empty when instance does not exist.
   
   @variable ManagedInstance.instance
   @summary String - [Output Only] The URL of the instance. The URL can exist even if the instance has not yet been created.
   
   @variable ManagedInstance.instanceStatus
   @summary String - [Output Only] The status of the instance. This field is empty when the instance does not exist.
   
   @variable ManagedInstance.lastAttempt
   @summary [::ManagedInstanceLastAttempt] - [Output Only] Information about the last attempt to create or delete the instance.
   
   @class ManagedInstanceLastAttempt
   @summary Google API JSON structure
   
   @variable ManagedInstanceLastAttempt.errors
   @summary Object - [Output Only] Encountered errors during the last attempt to create or delete the instance.
   
   @class Metadata
   @summary Google API JSON structure
   
   @variable Metadata.fingerprint
   @summary String - Specifies a fingerprint for this request, which is essentially a hash of the metadata's contents and used for optimistic locking. The fingerprint is initially generated by Compute Engine and changes after every request to modify or update metadata. You must always provide an up-to-date fingerprint hash in order to update or change metadata.
   
   @variable Metadata.items
   @summary Array - Array of key/value pairs. The total size of all keys and values must be less than 512 KB.
   
   @variable Metadata.kind
   @summary String - [Output Only] Type of the resource. Always compute#metadata for metadata.
   
   @class NamedPort
   @summary Google API JSON structure
   
   @variable NamedPort.name
   @summary String - The name for this named port. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable NamedPort.port
   @summary Integer - The port number, which can be a value between 1 and 65535.
   
   @class Network
   @summary Google API JSON structure
   
   @variable Network.IPv4Range
   @summary String - The range of internal addresses that are legal on this network. This range is a CIDR specification, for example: 192.168.0.0/16. Provided by the client when the network is created.
   
   @variable Network.autoCreateSubnetworks
   @summary Boolean - When set to true, the network is created in "auto subnet mode". When set to false, the network is in "custom subnet mode".
   
   In "auto subnet mode", a newly created network is assigned the default CIDR of 10.128.0.0/9 and it automatically creates one subnetwork per region.
   
   @variable Network.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Network.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Network.gatewayIPv4
   @summary String - A gateway address for default routing to other networks. This value is read only and is selected by the Google Compute Engine, typically as the first usable address in the IPv4Range.
   
   @variable Network.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Network.kind
   @summary String - [Output Only] Type of the resource. Always compute#network for networks.
   
   @variable Network.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Network.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Network.subnetworks
   @summary Array - [Output Only] Server-defined fully-qualified URLs for all subnetworks in this network.
   
   @class NetworkInterface
   @summary Google API JSON structure
   
   @variable NetworkInterface.accessConfigs
   @summary Array - An array of configurations for this interface. Currently, only one access config, ONE_TO_ONE_NAT, is supported. If there are no accessConfigs specified, then this instance will have no external internet access.
   
   @variable NetworkInterface.kind
   @summary String - [Output Only] Type of the resource. Always compute#networkInterface for network interfaces.
   
   @variable NetworkInterface.name
   @summary String - [Output Only] The name of the network interface, generated by the server. For network devices, these are eth0, eth1, etc.
   
   @variable NetworkInterface.network
   @summary String - URL of the network resource for this instance. This is required for creating an instance but optional when creating a firewall rule. If not specified when creating a firewall rule, the default network is used:
   
   global/networks/default 
   
   If you specify this property, you can specify the network as a full or partial URL. For example, the following are all valid URLs:  
   - https://www.googleapis.com/compute/v1/projects/project/global/networks/network 
   - projects/project/global/networks/network 
   - global/networks/default
   
   @variable NetworkInterface.networkIP
   @summary String - An IPv4 internal network address to assign to the instance for this network interface. If not specified by the user, an unused internal IP is assigned by the system.
   
   @variable NetworkInterface.subnetwork
   @summary String - The URL of the Subnetwork resource for this instance. If the network resource is in legacy mode, do not provide this property. If the network is in auto subnet mode, providing the subnetwork is optional. If the network is in custom subnet mode, then this field should be specified. If you specify this property, you can specify the subnetwork as a full or partial URL. For example, the following are all valid URLs:  
   - https://www.googleapis.com/compute/v1/projects/project/regions/region/subnetworks/subnetwork 
   - regions/region/subnetworks/subnetwork
   
   @class NetworkList
   @summary Google API JSON structure
   
   @variable NetworkList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable NetworkList.items
   @summary Array - [Output Only] A list of Network resources.
   
   @variable NetworkList.kind
   @summary String - [Output Only] Type of resource. Always compute#networkList for lists of networks.
   
   @variable NetworkList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable NetworkList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Operation
   @summary Google API JSON structure
   
   @variable Operation.clientOperationId
   @summary String - [Output Only] Reserved for future use.
   
   @variable Operation.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Operation.description
   @summary String - [Output Only] A textual description of the operation, which is set when the operation is created.
   
   @variable Operation.endTime
   @summary String - [Output Only] The time that this operation was completed. This value is in RFC3339 text format.
   
   @variable Operation.error
   @summary Object - [Output Only] If errors are generated during processing of the operation, this field will be populated.
   
   @variable Operation.httpErrorMessage
   @summary String - [Output Only] If the operation fails, this field contains the HTTP error message that was returned, such as NOT FOUND.
   
   @variable Operation.httpErrorStatusCode
   @summary Integer - [Output Only] If the operation fails, this field contains the HTTP error status code that was returned. For example, a 404 means the resource was not found.
   
   @variable Operation.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Operation.insertTime
   @summary String - [Output Only] The time that this operation was requested. This value is in RFC3339 text format.
   
   @variable Operation.kind
   @summary String - [Output Only] Type of the resource. Always compute#operation for Operation resources.
   
   @variable Operation.name
   @summary String - [Output Only] Name of the resource.
   
   @variable Operation.operationType
   @summary String - [Output Only] The type of operation, such as insert, update, or delete, and so on.
   
   @variable Operation.progress
   @summary Integer - [Output Only] An optional progress indicator that ranges from 0 to 100. There is no requirement that this be linear or support any granularity of operations. This should not be used to guess when the operation will be complete. This number should monotonically increase as the operation progresses.
   
   @variable Operation.region
   @summary String - [Output Only] The URL of the region where the operation resides. Only available when performing regional operations.
   
   @variable Operation.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Operation.startTime
   @summary String - [Output Only] The time that this operation was started by the server. This value is in RFC3339 text format.
   
   @variable Operation.status
   @summary String - [Output Only] The status of the operation, which can be one of the following: PENDING, RUNNING, or DONE.
   
   @variable Operation.statusMessage
   @summary String - [Output Only] An optional textual description of the current status of the operation.
   
   @variable Operation.targetId
   @summary String - [Output Only] The unique target ID, which identifies a specific incarnation of the target resource.
   
   @variable Operation.targetLink
   @summary String - [Output Only] The URL of the resource that the operation modifies. For operations related to creating a snapshot, this points to the persistent disk that the snapshot was created from.
   
   @variable Operation.user
   @summary String - [Output Only] User who requested the operation, for example: user@example.com.
   
   @variable Operation.warnings
   @summary Array - [Output Only] If warning messages are generated during processing of the operation, this field will be populated.
   
   @variable Operation.zone
   @summary String - [Output Only] The URL of the zone where the operation resides. Only available when performing per-zone operations.
   
   @class OperationAggregatedList
   @summary Google API JSON structure
   
   @variable OperationAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable OperationAggregatedList.items
   @summary Object - [Output Only] A map of scoped operation lists.
   
   @variable OperationAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#operationAggregatedList for aggregated lists of operations.
   
   @variable OperationAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable OperationAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class OperationList
   @summary Google API JSON structure
   
   @variable OperationList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable OperationList.items
   @summary Array - [Output Only] A list of Operation resources.
   
   @variable OperationList.kind
   @summary String - [Output Only] Type of resource. Always compute#operations for Operations resource.
   
   @variable OperationList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable OperationList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class OperationsScopedList
   @summary Google API JSON structure
   
   @variable OperationsScopedList.operations
   @summary Array - [Output Only] List of operations contained in this scope.
   
   @variable OperationsScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of operations when the list is empty.
   
   @class PathMatcher
   @summary Google API JSON structure
   
   @variable PathMatcher.defaultService
   @summary String - The full or partial URL to the BackendService resource. This will be used if none of the pathRules defined by this PathMatcher is matched by the URL's path portion. For example, the following are all valid URLs to a BackendService resource:  
   - https://www.googleapis.com/compute/v1/projects/project/global/backendServices/backendService 
   - compute/v1/projects/project/global/backendServices/backendService 
   - global/backendServices/backendService
   
   @variable PathMatcher.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable PathMatcher.name
   @summary String - The name to which this PathMatcher is referred by the HostRule.
   
   @variable PathMatcher.pathRules
   @summary Array - The list of path rules.
   
   @class PathRule
   @summary Google API JSON structure
   
   @variable PathRule.paths
   @summary Array - The list of path patterns to match. Each must start with / and the only place a * is allowed is at the end following a /. The string fed to the path matcher does not include any text after the first ? or #, and those chars are not allowed here.
   
   @variable PathRule.service
   @summary String - The URL of the BackendService resource if this rule is matched.
   
   @class Project
   @summary Google API JSON structure
   
   @variable Project.commonInstanceMetadata
   @summary [::Metadata] - Metadata key/value pairs available to all instances contained in this project. See Custom metadata for more information.
   
   @variable Project.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Project.defaultServiceAccount
   @summary String - [Output Only] Default service account used by VMs running in this project.
   
   @variable Project.description
   @summary String - An optional textual description of the resource.
   
   @variable Project.enabledFeatures
   @summary Array - Restricted features enabled for use on this project.
   
   @variable Project.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server. This is not the project ID, and is just a unique ID used by Compute Engine to identify resources.
   
   @variable Project.kind
   @summary String - [Output Only] Type of the resource. Always compute#project for projects.
   
   @variable Project.name
   @summary String - The project ID. For example: my-example-project. Use the project ID to make requests to Compute Engine.
   
   @variable Project.quotas
   @summary Array - [Output Only] Quotas assigned to this project.
   
   @variable Project.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Project.usageExportLocation
   @summary [::UsageExportLocation] - The naming prefix for daily usage reports and the Google Cloud Storage bucket where they are stored.
   
   @class Quota
   @summary Google API JSON structure
   
   @variable Quota.limit
   @summary Number - [Output Only] Quota limit for this metric.
   
   @variable Quota.metric
   @summary String - [Output Only] Name of the quota metric.
   
   @variable Quota.usage
   @summary Number - [Output Only] Current usage of this metric.
   
   @class Region
   @summary Google API JSON structure
   
   @variable Region.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Region.deprecated
   @summary [::DeprecationStatus] - [Output Only] The deprecation status associated with this region.
   
   @variable Region.description
   @summary String - [Output Only] Textual description of the resource.
   
   @variable Region.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Region.kind
   @summary String - [Output Only] Type of the resource. Always compute#region for regions.
   
   @variable Region.name
   @summary String - [Output Only] Name of the resource.
   
   @variable Region.quotas
   @summary Array - [Output Only] Quotas assigned to this region.
   
   @variable Region.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Region.status
   @summary String - [Output Only] Status of the region, either UP or DOWN.
   
   @variable Region.zones
   @summary Array - [Output Only] A list of zones available in this region, in the form of resource URLs.
   
   @class RegionAutoscalerList
   @summary Google API JSON structure
   
   @variable RegionAutoscalerList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RegionAutoscalerList.items
   @summary Array - A list of autoscalers.
   
   @variable RegionAutoscalerList.kind
   @summary String - Type of resource.
   
   @variable RegionAutoscalerList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable RegionAutoscalerList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class RegionInstanceGroupList
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RegionInstanceGroupList.items
   @summary Array - A list of InstanceGroup resources.
   
   @variable RegionInstanceGroupList.kind
   @summary String - The resource type.
   
   @variable RegionInstanceGroupList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RegionInstanceGroupList.selfLink
   @summary String - [Output Only] The URL for this resource type. The server generates this URL.
   
   @class RegionInstanceGroupManagerList
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagerList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RegionInstanceGroupManagerList.items
   @summary Array - A list of managed instance groups.
   
   @variable RegionInstanceGroupManagerList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupManagerList for a list of managed instance groups that exist in th regional scope.
   
   @variable RegionInstanceGroupManagerList.nextPageToken
   @summary String - [Output only] A token used to continue a truncated list request.
   
   @variable RegionInstanceGroupManagerList.selfLink
   @summary String - [Output only] The URL for this resource type. The server generates this URL.
   
   @class RegionInstanceGroupManagersAbandonInstancesRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersAbandonInstancesRequest.instances
   @summary Array - The names of one or more instances to abandon.
   
   @class RegionInstanceGroupManagersDeleteInstancesRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersDeleteInstancesRequest.instances
   @summary Array - The names of one or more instances to delete.
   
   @class RegionInstanceGroupManagersListInstancesResponse
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersListInstancesResponse.managedInstances
   @summary Array - List of managed instances.
   
   @class RegionInstanceGroupManagersRecreateRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersRecreateRequest.instances
   @summary Array - The URL for one or more instances to recreate.
   
   @class RegionInstanceGroupManagersSetTargetPoolsRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersSetTargetPoolsRequest.fingerprint
   @summary String - Fingerprint of the target pools information, which is a hash of the contents. This field is used for optimistic locking when you update the target pool entries. This field is optional.
   
   @variable RegionInstanceGroupManagersSetTargetPoolsRequest.targetPools
   @summary Array - The URL of all TargetPool resources to which instances in the instanceGroup field are added. The target pools automatically apply to all of the instances in the managed instance group.
   
   @class RegionInstanceGroupManagersSetTemplateRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupManagersSetTemplateRequest.instanceTemplate
   @summary String - URL of the InstanceTemplate resource from which all new instances will be created.
   
   @class RegionInstanceGroupsListInstances
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupsListInstances.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable RegionInstanceGroupsListInstances.items
   @summary Array - A list of instances and any named ports that are assigned to those instances.
   
   @variable RegionInstanceGroupsListInstances.kind
   @summary String - The resource type.
   
   @variable RegionInstanceGroupsListInstances.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RegionInstanceGroupsListInstances.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class RegionInstanceGroupsListInstancesRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupsListInstancesRequest.instanceState
   @summary String - Instances in which state should be returned. Valid options are: 'ALL', 'RUNNING'. By default, it lists all instances.
   
   @variable RegionInstanceGroupsListInstancesRequest.portName
   @summary String - Name of port user is interested in. It is optional. If it is set, only information about this ports will be returned. If it is not set, all the named ports will be returned. Always lists all instances.
   
   @class RegionInstanceGroupsSetNamedPortsRequest
   @summary Google API JSON structure
   
   @variable RegionInstanceGroupsSetNamedPortsRequest.fingerprint
   @summary String - The fingerprint of the named ports information for this instance group. Use this optional property to prevent conflicts when multiple users change the named ports settings concurrently. Obtain the fingerprint with the instanceGroups.get method. Then, include the fingerprint in your request to ensure that you do not overwrite changes that were applied from another concurrent request.
   
   @variable RegionInstanceGroupsSetNamedPortsRequest.namedPorts
   @summary Array - The list of named ports to set for this instance group.
   
   @class RegionList
   @summary Google API JSON structure
   
   @variable RegionList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RegionList.items
   @summary Array - [Output Only] A list of Region resources.
   
   @variable RegionList.kind
   @summary String - [Output Only] Type of resource. Always compute#regionList for lists of regions.
   
   @variable RegionList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RegionList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ResourceGroupReference
   @summary Google API JSON structure
   
   @variable ResourceGroupReference.group
   @summary String - A URI referencing one of the instance groups listed in the backend service.
   
   @class Route
   @summary Google API JSON structure
   
   @variable Route.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Route.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Route.destRange
   @summary String - The destination range of outgoing packets that this route applies to. Only IPv4 is supported.
   
   @variable Route.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Route.kind
   @summary String - [Output Only] Type of this resource. Always compute#routes for Route resources.
   
   @variable Route.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Route.network
   @summary String - Fully-qualified URL of the network that this route applies to.
   
   @variable Route.nextHopGateway
   @summary String - The URL to a gateway that should handle matching packets. You can only specify the internet gateway using a full or partial valid URL:  projects/<project-id>/global/gateways/default-internet-gateway
   
   @variable Route.nextHopInstance
   @summary String - The URL to an instance that should handle matching packets. You can specify this as a full or partial URL. For example:
   https://www.googleapis.com/compute/v1/projects/project/zones/zone/instances/
   
   @variable Route.nextHopIp
   @summary String - The network IP address of an instance that should handle matching packets. Only IPv4 is supported.
   
   @variable Route.nextHopNetwork
   @summary String - The URL of the local network if it should handle matching packets.
   
   @variable Route.nextHopVpnTunnel
   @summary String - The URL to a VpnTunnel that should handle matching packets.
   
   @variable Route.priority
   @summary Integer - The priority of this route. Priority is used to break ties in cases where there is more than one matching route of equal prefix length. In the case of two routes with equal prefix length, the one with the lowest-numbered priority value wins. Default value is 1000. Valid range is 0 through 65535.
   
   @variable Route.selfLink
   @summary String - [Output Only] Server-defined fully-qualified URL for this resource.
   
   @variable Route.tags
   @summary Array - A list of instance tags to which this route applies.
   
   @variable Route.warnings
   @summary Array - [Output Only] If potential misconfigurations are detected for this route, this field will be populated with warning messages.
   
   @class RouteList
   @summary Google API JSON structure
   
   @variable RouteList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable RouteList.items
   @summary Array - [Output Only] A list of Route resources.
   
   @variable RouteList.kind
   @summary String - Type of resource.
   
   @variable RouteList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RouteList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Router
   @summary Google API JSON structure
   
   @variable Router.bgp
   @summary [::RouterBgp] - BGP information specific to this router.
   
   @variable Router.bgpPeers
   @summary Array - BGP information that needs to be configured into the routing stack to establish the BGP peering. It must specify peer ASN and either interface name, IP, or peer IP. Please refer to RFC4273.
   
   @variable Router.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Router.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Router.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Router.interfaces
   @summary Array - Router interfaces. Each interface requires either one linked resource (e.g. linkedVpnTunnel), or IP address and IP address range (e.g. ipRange), or both.
   
   @variable Router.kind
   @summary String - [Output Only] Type of resource. Always compute#router for routers.
   
   @variable Router.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Router.network
   @summary String - URI of the network to which this router belongs.
   
   @variable Router.region
   @summary String - [Output Only] URI of the region where the router resides.
   
   @variable Router.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class RouterAggregatedList
   @summary Google API JSON structure
   
   @variable RouterAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RouterAggregatedList.items
   @summary Object - A map of scoped router lists.
   
   @variable RouterAggregatedList.kind
   @summary String - Type of resource.
   
   @variable RouterAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RouterAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class RouterBgp
   @summary Google API JSON structure
   
   @variable RouterBgp.asn
   @summary Integer - Local BGP Autonomous System Number (ASN). Must be an RFC6996 private ASN, either 16-bit or 32-bit. The value will be fixed for this router resource. All VPN tunnels that link to this router will have the same local ASN.
   
   @class RouterBgpPeer
   @summary Google API JSON structure
   
   @variable RouterBgpPeer.advertisedRoutePriority
   @summary Integer - The priority of routes advertised to this BGP peer. In the case where there is more than one matching route of maximum length, the routes with lowest priority value win.
   
   @variable RouterBgpPeer.interfaceName
   @summary String - Name of the interface the BGP peer is associated with.
   
   @variable RouterBgpPeer.ipAddress
   @summary String - IP address of the interface inside Google Cloud Platform. Only IPv4 is supported.
   
   @variable RouterBgpPeer.name
   @summary String - Name of this BGP peer. The name must be 1-63 characters long and comply with RFC1035.
   
   @variable RouterBgpPeer.peerAsn
   @summary Integer - Peer BGP Autonomous System Number (ASN). For VPN use case, this value can be different for every tunnel.
   
   @variable RouterBgpPeer.peerIpAddress
   @summary String - IP address of the BGP interface outside Google cloud. Only IPv4 is supported.
   
   @class RouterInterface
   @summary Google API JSON structure
   
   @variable RouterInterface.ipRange
   @summary String - IP address and range of the interface. The IP range must be in the RFC3927 link-local IP space. The value must be a CIDR-formatted string, for example: 169.254.0.1/30. NOTE: Do not truncate the address as it represents the IP address of the interface.
   
   @variable RouterInterface.linkedVpnTunnel
   @summary String - URI of linked VPN tunnel. It must be in the same region as the router. Each interface can have at most one linked resource.
   
   @variable RouterInterface.name
   @summary String - Name of this interface entry. The name must be 1-63 characters long and comply with RFC1035.
   
   @class RouterList
   @summary Google API JSON structure
   
   @variable RouterList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable RouterList.items
   @summary Array - A list of Router resources.
   
   @variable RouterList.kind
   @summary String - [Output Only] Type of resource. Always compute#router for routers.
   
   @variable RouterList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable RouterList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class RouterStatus
   @summary Google API JSON structure
   
   @variable RouterStatus.bestRoutes
   @summary Array - Best routes for this router's network.
   
   @variable RouterStatus.bgpPeerStatus
   @summary Array
   
   @variable RouterStatus.network
   @summary String - URI of the network to which this router belongs.
   
   @class RouterStatusBgpPeerStatus
   @summary Google API JSON structure
   
   @variable RouterStatusBgpPeerStatus.advertisedRoutes
   @summary Array - Routes that were advertised to the remote BGP peer
   
   @variable RouterStatusBgpPeerStatus.ipAddress
   @summary String - IP address of the local BGP interface.
   
   @variable RouterStatusBgpPeerStatus.linkedVpnTunnel
   @summary String - URL of the VPN tunnel that this BGP peer controls.
   
   @variable RouterStatusBgpPeerStatus.name
   @summary String - Name of this BGP peer. Unique within the Routers resource.
   
   @variable RouterStatusBgpPeerStatus.numLearnedRoutes
   @summary Integer - Number of routes learned from the remote BGP Peer.
   
   @variable RouterStatusBgpPeerStatus.peerIpAddress
   @summary String - IP address of the remote BGP interface.
   
   @variable RouterStatusBgpPeerStatus.state
   @summary String - BGP state as specified in RFC1771.
   
   @variable RouterStatusBgpPeerStatus.status
   @summary String - Status of the BGP peer: {UP, DOWN}
   
   @variable RouterStatusBgpPeerStatus.uptime
   @summary String - Time this session has been up. Format: 14 years, 51 weeks, 6 days, 23 hours, 59 minutes, 59 seconds
   
   @variable RouterStatusBgpPeerStatus.uptimeSeconds
   @summary String - Time this session has been up, in seconds. Format: 145
   
   @class RouterStatusResponse
   @summary Google API JSON structure
   
   @variable RouterStatusResponse.kind
   @summary String - Type of resource.
   
   @variable RouterStatusResponse.result
   @summary [::RouterStatus]
   
   @class RoutersPreviewResponse
   @summary Google API JSON structure
   
   @variable RoutersPreviewResponse.resource
   @summary [::Router] - Preview of given router.
   
   @class RoutersScopedList
   @summary Google API JSON structure
   
   @variable RoutersScopedList.routers
   @summary Array - List of routers contained in this scope.
   
   @variable RoutersScopedList.warning
   @summary Object - Informational warning which replaces the list of routers when the list is empty.
   
   @class SSLHealthCheck
   @summary Google API JSON structure
   
   @variable SSLHealthCheck.port
   @summary Integer - The TCP port number for the health check request. The default value is 443.
   
   @variable SSLHealthCheck.portName
   @summary String - Port name as defined in InstanceGroup#NamedPort#name. If both port and port_name are defined, port takes precedence.
   
   @variable SSLHealthCheck.proxyHeader
   @summary String - Specifies the type of proxy header to append before sending data to the backend, either NONE or PROXY_V1. The default is NONE.
   
   @variable SSLHealthCheck.request
   @summary String - The application data to send once the SSL connection has been established (default value is empty). If both request and response are empty, the connection establishment alone will indicate health. The request data can only be ASCII.
   
   @variable SSLHealthCheck.response
   @summary String - The bytes to match against the beginning of the response data. If left empty (the default value), any response will indicate health. The response data can only be ASCII.
   
   @class Scheduling
   @summary Google API JSON structure
   
   @variable Scheduling.automaticRestart
   @summary Boolean - Specifies whether the instance should be automatically restarted if it is terminated by Compute Engine (not terminated by a user). You can only set the automatic restart option for standard instances. Preemptible instances cannot be automatically restarted.
   
   @variable Scheduling.onHostMaintenance
   @summary String - Defines the maintenance behavior for this instance. For standard instances, the default behavior is MIGRATE. For preemptible instances, the default and only possible behavior is TERMINATE. For more information, see Setting Instance Scheduling Options.
   
   @variable Scheduling.preemptible
   @summary Boolean - Whether the instance is preemptible.
   
   @class SerialPortOutput
   @summary Google API JSON structure
   
   @variable SerialPortOutput.contents
   @summary String - [Output Only] The contents of the console output.
   
   @variable SerialPortOutput.kind
   @summary String - [Output Only] Type of the resource. Always compute#serialPortOutput for serial port output.
   
   @variable SerialPortOutput.next
   @summary String - [Output Only] The position of the next byte of content from the serial console output. Use this value in the next request as the start parameter.
   
   @variable SerialPortOutput.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @variable SerialPortOutput.start
   @summary String - [Output Only] The starting byte position of the output that was returned. This should match the start parameter sent with the request. If the serial console output exceeds the size of the buffer, older output will be overwritten by newer content and the start values will be mismatched.
   
   @class ServiceAccount
   @summary Google API JSON structure
   
   @variable ServiceAccount.email
   @summary String - Email address of the service account.
   
   @variable ServiceAccount.scopes
   @summary Array - The list of scopes to be made available for this service account.
   
   @class Snapshot
   @summary Google API JSON structure
   
   @variable Snapshot.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Snapshot.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Snapshot.diskSizeGb
   @summary String - [Output Only] Size of the snapshot, specified in GB.
   
   @variable Snapshot.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Snapshot.kind
   @summary String - [Output Only] Type of the resource. Always compute#snapshot for Snapshot resources.
   
   @variable Snapshot.licenses
   @summary Array - [Output Only] A list of public visible licenses that apply to this snapshot. This can be because the original image had licenses attached (such as a Windows image).
   
   @variable Snapshot.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Snapshot.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Snapshot.snapshotEncryptionKey
   @summary [::CustomerEncryptionKey] - Encrypts the snapshot using a customer-supplied encryption key.
   
   After you encrypt a snapshot using a customer-supplied key, you must provide the same key if you use the image later For example, you must provide the encryption key when you create a disk from the encrypted snapshot in a future request.
   
   Customer-supplied encryption keys do not protect access to metadata of the disk.
   
   If you do not provide an encryption key when creating the snapshot, then the snapshot will be encrypted using an automatically generated key and you do not need to provide a key to use the snapshot later.
   
   @variable Snapshot.sourceDisk
   @summary String - [Output Only] The source disk used to create this snapshot.
   
   @variable Snapshot.sourceDiskEncryptionKey
   @summary [::CustomerEncryptionKey] - The customer-supplied encryption key of the source disk. Required if the source disk is protected by a customer-supplied encryption key.
   
   @variable Snapshot.sourceDiskId
   @summary String - [Output Only] The ID value of the disk used to create this snapshot. This value may be used to determine whether the snapshot was taken from the current or a previous instance of a given disk name.
   
   @variable Snapshot.status
   @summary String - [Output Only] The status of the snapshot. This can be CREATING, DELETING, FAILED, READY, or UPLOADING.
   
   @variable Snapshot.storageBytes
   @summary String - [Output Only] A size of the the storage used by the snapshot. As snapshots share storage, this number is expected to change with snapshot creation/deletion.
   
   @variable Snapshot.storageBytesStatus
   @summary String - [Output Only] An indicator whether storageBytes is in a stable state or it is being adjusted as a result of shared storage reallocation. This status can either be UPDATING, meaning the size of the snapshot is being updated, or UP_TO_DATE, meaning the size of the snapshot is up-to-date.
   
   @class SnapshotList
   @summary Google API JSON structure
   
   @variable SnapshotList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable SnapshotList.items
   @summary Array - [Output Only] A list of Snapshot resources.
   
   @variable SnapshotList.kind
   @summary String - Type of resource.
   
   @variable SnapshotList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable SnapshotList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class SslCertificate
   @summary Google API JSON structure
   
   @variable SslCertificate.certificate
   @summary String - A local certificate file. The certificate must be in PEM format. The certificate chain must be no greater than 5 certs long. The chain must include at least one intermediate cert.
   
   @variable SslCertificate.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable SslCertificate.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable SslCertificate.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable SslCertificate.kind
   @summary String - [Output Only] Type of the resource. Always compute#sslCertificate for SSL certificates.
   
   @variable SslCertificate.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable SslCertificate.privateKey
   @summary String - A write-only private key in PEM format. Only insert requests will include this field.
   
   @variable SslCertificate.selfLink
   @summary String - [Output only] Server-defined URL for the resource.
   
   @class SslCertificateList
   @summary Google API JSON structure
   
   @variable SslCertificateList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable SslCertificateList.items
   @summary Array - A list of SslCertificate resources.
   
   @variable SslCertificateList.kind
   @summary String - Type of resource.
   
   @variable SslCertificateList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable SslCertificateList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Subnetwork
   @summary Google API JSON structure
   
   @variable Subnetwork.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Subnetwork.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable Subnetwork.gatewayAddress
   @summary String - [Output Only] The gateway address for default routes to reach destination addresses outside this subnetwork.
   
   @variable Subnetwork.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Subnetwork.ipCidrRange
   @summary String - The range of internal addresses that are owned by this subnetwork. Provide this property when you create the subnetwork. For example, 10.0.0.0/8 or 192.168.0.0/16. Ranges must be unique and non-overlapping within a network. Only IPv4 is supported.
   
   @variable Subnetwork.kind
   @summary String - [Output Only] Type of the resource. Always compute#subnetwork for Subnetwork resources.
   
   @variable Subnetwork.name
   @summary String - The name of the resource, provided by the client when initially creating the resource. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Subnetwork.network
   @summary String - The URL of the network to which this subnetwork belongs, provided by the client when initially creating the subnetwork. Only networks that are in the distributed mode can have subnetworks.
   
   @variable Subnetwork.region
   @summary String - URL of the region where the Subnetwork resides.
   
   @variable Subnetwork.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class SubnetworkAggregatedList
   @summary Google API JSON structure
   
   @variable SubnetworkAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable SubnetworkAggregatedList.items
   @summary Object - [Output] A map of scoped Subnetwork lists.
   
   @variable SubnetworkAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#subnetworkAggregatedList for aggregated lists of subnetworks.
   
   @variable SubnetworkAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable SubnetworkAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class SubnetworkList
   @summary Google API JSON structure
   
   @variable SubnetworkList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable SubnetworkList.items
   @summary Array - The Subnetwork resources.
   
   @variable SubnetworkList.kind
   @summary String - [Output Only] Type of resource. Always compute#subnetworkList for lists of subnetworks.
   
   @variable SubnetworkList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable SubnetworkList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class SubnetworksExpandIpCidrRangeRequest
   @summary Google API JSON structure
   
   @variable SubnetworksExpandIpCidrRangeRequest.ipCidrRange
   @summary String - The IP (in CIDR format or netmask) of internal addresses that are legal on this Subnetwork. This range should be disjoint from other subnetworks within this network. This range can only be larger than (i.e. a superset of) the range previously defined before the update.
   
   @class SubnetworksScopedList
   @summary Google API JSON structure
   
   @variable SubnetworksScopedList.subnetworks
   @summary Array - List of subnetworks contained in this scope.
   
   @variable SubnetworksScopedList.warning
   @summary Object - An informational warning that appears when the list of addresses is empty.
   
   @class TCPHealthCheck
   @summary Google API JSON structure
   
   @variable TCPHealthCheck.port
   @summary Integer - The TCP port number for the health check request. The default value is 80.
   
   @variable TCPHealthCheck.portName
   @summary String - Port name as defined in InstanceGroup#NamedPort#name. If both port and port_name are defined, port takes precedence.
   
   @variable TCPHealthCheck.proxyHeader
   @summary String - Specifies the type of proxy header to append before sending data to the backend, either NONE or PROXY_V1. The default is NONE.
   
   @variable TCPHealthCheck.request
   @summary String - The application data to send once the TCP connection has been established (default value is empty). If both request and response are empty, the connection establishment alone will indicate health. The request data can only be ASCII.
   
   @variable TCPHealthCheck.response
   @summary String - The bytes to match against the beginning of the response data. If left empty (the default value), any response will indicate health. The response data can only be ASCII.
   
   @class Tags
   @summary Google API JSON structure
   
   @variable Tags.fingerprint
   @summary String - Specifies a fingerprint for this request, which is essentially a hash of the metadata's contents and used for optimistic locking. The fingerprint is initially generated by Compute Engine and changes after every request to modify or update metadata. You must always provide an up-to-date fingerprint hash in order to update or change metadata.
   
   To see the latest fingerprint, make get() request to the instance.
   
   @variable Tags.items
   @summary Array - An array of tags. Each tag must be 1-63 characters long, and comply with RFC1035.
   
   @class TargetHttpProxy
   @summary Google API JSON structure
   
   @variable TargetHttpProxy.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetHttpProxy.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetHttpProxy.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetHttpProxy.kind
   @summary String - [Output Only] Type of resource. Always compute#targetHttpProxy for target HTTP proxies.
   
   @variable TargetHttpProxy.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetHttpProxy.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetHttpProxy.urlMap
   @summary String - URL to the UrlMap resource that defines the mapping from URL to the BackendService.
   
   @class TargetHttpProxyList
   @summary Google API JSON structure
   
   @variable TargetHttpProxyList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetHttpProxyList.items
   @summary Array - A list of TargetHttpProxy resources.
   
   @variable TargetHttpProxyList.kind
   @summary String - Type of resource. Always compute#targetHttpProxyList for lists of target HTTP proxies.
   
   @variable TargetHttpProxyList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetHttpProxyList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetHttpsProxiesSetSslCertificatesRequest
   @summary Google API JSON structure
   
   @variable TargetHttpsProxiesSetSslCertificatesRequest.sslCertificates
   @summary Array - New set of SslCertificate resources to associate with this TargetHttpsProxy resource. Currently exactly one SslCertificate resource must be specified.
   
   @class TargetHttpsProxy
   @summary Google API JSON structure
   
   @variable TargetHttpsProxy.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetHttpsProxy.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetHttpsProxy.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetHttpsProxy.kind
   @summary String - [Output Only] Type of resource. Always compute#targetHttpsProxy for target HTTPS proxies.
   
   @variable TargetHttpsProxy.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetHttpsProxy.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetHttpsProxy.sslCertificates
   @summary Array - URLs to SslCertificate resources that are used to authenticate connections between users and the load balancer. Currently, exactly one SSL certificate must be specified.
   
   @variable TargetHttpsProxy.urlMap
   @summary String - A fully-qualified or valid partial URL to the UrlMap resource that defines the mapping from URL to the BackendService. For example, the following are all valid URLs for specifying a URL map:  
   - https://www.googleapis.compute/v1/projects/project/global/urlMaps/url-map 
   - projects/project/global/urlMaps/url-map 
   - global/urlMaps/url-map
   
   @class TargetHttpsProxyList
   @summary Google API JSON structure
   
   @variable TargetHttpsProxyList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetHttpsProxyList.items
   @summary Array - A list of TargetHttpsProxy resources.
   
   @variable TargetHttpsProxyList.kind
   @summary String - Type of resource. Always compute#targetHttpsProxyList for lists of target HTTPS proxies.
   
   @variable TargetHttpsProxyList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetHttpsProxyList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetInstance
   @summary Google API JSON structure
   
   @variable TargetInstance.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetInstance.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetInstance.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetInstance.instance
   @summary String - A URL to the virtual machine instance that handles traffic for this target instance. When creating a target instance, you can provide the fully-qualified URL or a valid partial URL to the desired virtual machine. For example, the following are all valid URLs: 
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/instances/instance 
   - projects/project/zones/zone/instances/instance 
   - zones/zone/instances/instance
   
   @variable TargetInstance.kind
   @summary String - [Output Only] The type of the resource. Always compute#targetInstance for target instances.
   
   @variable TargetInstance.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetInstance.natPolicy
   @summary String - NAT option controlling how IPs are NAT'ed to the instance. Currently only NO_NAT (default value) is supported.
   
   @variable TargetInstance.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetInstance.zone
   @summary String - [Output Only] URL of the zone where the target instance resides.
   
   @class TargetInstanceAggregatedList
   @summary Google API JSON structure
   
   @variable TargetInstanceAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable TargetInstanceAggregatedList.items
   @summary Object - A map of scoped target instance lists.
   
   @variable TargetInstanceAggregatedList.kind
   @summary String - Type of resource.
   
   @variable TargetInstanceAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetInstanceAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetInstanceList
   @summary Google API JSON structure
   
   @variable TargetInstanceList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetInstanceList.items
   @summary Array - A list of TargetInstance resources.
   
   @variable TargetInstanceList.kind
   @summary String - Type of resource.
   
   @variable TargetInstanceList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetInstanceList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetInstancesScopedList
   @summary Google API JSON structure
   
   @variable TargetInstancesScopedList.targetInstances
   @summary Array - List of target instances contained in this scope.
   
   @variable TargetInstancesScopedList.warning
   @summary Object - Informational warning which replaces the list of addresses when the list is empty.
   
   @class TargetPool
   @summary Google API JSON structure
   
   @variable TargetPool.backupPool
   @summary String - This field is applicable only when the containing target pool is serving a forwarding rule as the primary pool, and its failoverRatio field is properly set to a value between [0, 1].
   
   backupPool and failoverRatio together define the fallback behavior of the primary target pool: if the ratio of the healthy instances in the primary pool is at or below failoverRatio, traffic arriving at the load-balanced IP will be directed to the backup pool.
   
   In case where failoverRatio and backupPool are not set, or all the instances in the backup pool are unhealthy, the traffic will be directed back to the primary pool in the "force" mode, where traffic will be spread to the healthy instances with the best effort, or to all instances when no instance is healthy.
   
   @variable TargetPool.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetPool.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetPool.failoverRatio
   @summary Number - This field is applicable only when the containing target pool is serving a forwarding rule as the primary pool (i.e., not as a backup pool to some other target pool). The value of the field must be in [0, 1].
   
   If set, backupPool must also be set. They together define the fallback behavior of the primary target pool: if the ratio of the healthy instances in the primary pool is at or below this number, traffic arriving at the load-balanced IP will be directed to the backup pool.
   
   In case where failoverRatio is not set or all the instances in the backup pool are unhealthy, the traffic will be directed back to the primary pool in the "force" mode, where traffic will be spread to the healthy instances with the best effort, or to all instances when no instance is healthy.
   
   @variable TargetPool.healthChecks
   @summary Array - A list of URLs to the HttpHealthCheck resource. A member instance in this pool is considered healthy if and only if all specified health checks pass. An empty list means all member instances will be considered healthy at all times.
   
   @variable TargetPool.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetPool.instances
   @summary Array - A list of resource URLs to the virtual machine instances serving this pool. They must live in zones contained in the same region as this pool.
   
   @variable TargetPool.kind
   @summary String - [Output Only] Type of the resource. Always compute#targetPool for target pools.
   
   @variable TargetPool.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetPool.region
   @summary String - [Output Only] URL of the region where the target pool resides.
   
   @variable TargetPool.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetPool.sessionAffinity
   @summary String - Sesssion affinity option, must be one of the following values:
   NONE: Connections from the same client IP may go to any instance in the pool.
   CLIENT_IP: Connections from the same client IP will go to the same instance in the pool while that instance remains healthy.
   CLIENT_IP_PROTO: Connections from the same client IP with the same IP protocol will go to the same instance in the pool while that instance remains healthy.
   
   @class TargetPoolAggregatedList
   @summary Google API JSON structure
   
   @variable TargetPoolAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetPoolAggregatedList.items
   @summary Object - [Output Only] A map of scoped target pool lists.
   
   @variable TargetPoolAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetPoolAggregatedList for aggregated lists of target pools.
   
   @variable TargetPoolAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetPoolAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetPoolInstanceHealth
   @summary Google API JSON structure
   
   @variable TargetPoolInstanceHealth.healthStatus
   @summary Array
   
   @variable TargetPoolInstanceHealth.kind
   @summary String - [Output Only] Type of resource. Always compute#targetPoolInstanceHealth when checking the health of an instance.
   
   @class TargetPoolList
   @summary Google API JSON structure
   
   @variable TargetPoolList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetPoolList.items
   @summary Array - A list of TargetPool resources.
   
   @variable TargetPoolList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetPoolList for lists of target pools.
   
   @variable TargetPoolList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetPoolList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetPoolsAddHealthCheckRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsAddHealthCheckRequest.healthChecks
   @summary Array - A list of HttpHealthCheck resources to add to the target pool.
   
   @class TargetPoolsAddInstanceRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsAddInstanceRequest.instances
   @summary Array - A full or partial URL to an instance to add to this target pool. This can be a full or partial URL. For example, the following are valid URLs:  
   - https://www.googleapis.com/compute/v1/projects/project-id/zones/zone/instances/instance-name 
   - projects/project-id/zones/zone/instances/instance-name 
   - zones/zone/instances/instance-name
   
   @class TargetPoolsRemoveHealthCheckRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsRemoveHealthCheckRequest.healthChecks
   @summary Array - Health check URL to be removed. This can be a full or valid partial URL. For example, the following are valid URLs:  
   - https://www.googleapis.com/compute/beta/projects/project/global/httpHealthChecks/health-check 
   - projects/project/global/httpHealthChecks/health-check 
   - global/httpHealthChecks/health-check
   
   @class TargetPoolsRemoveInstanceRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsRemoveInstanceRequest.instances
   @summary Array - URLs of the instances to be removed from target pool.
   
   @class TargetPoolsScopedList
   @summary Google API JSON structure
   
   @variable TargetPoolsScopedList.targetPools
   @summary Array - List of target pools contained in this scope.
   
   @variable TargetPoolsScopedList.warning
   @summary Object - Informational warning which replaces the list of addresses when the list is empty.
   
   @class TargetReference
   @summary Google API JSON structure
   
   @variable TargetReference.target
   @summary String
   
   @class TargetSslProxiesSetBackendServiceRequest
   @summary Google API JSON structure
   
   @variable TargetSslProxiesSetBackendServiceRequest.service
   @summary String - The URL of the new BackendService resource for the targetSslProxy.
   
   @class TargetSslProxiesSetProxyHeaderRequest
   @summary Google API JSON structure
   
   @variable TargetSslProxiesSetProxyHeaderRequest.proxyHeader
   @summary String - The new type of proxy header to append before sending data to the backend. NONE or PROXY_V1 are allowed.
   
   @class TargetSslProxiesSetSslCertificatesRequest
   @summary Google API JSON structure
   
   @variable TargetSslProxiesSetSslCertificatesRequest.sslCertificates
   @summary Array - New set of URLs to SslCertificate resources to associate with this TargetSslProxy. Currently exactly one ssl certificate must be specified.
   
   @class TargetSslProxy
   @summary Google API JSON structure
   
   @variable TargetSslProxy.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetSslProxy.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetSslProxy.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetSslProxy.kind
   @summary String - [Output Only] Type of the resource. Always compute#targetSslProxy for target SSL proxies.
   
   @variable TargetSslProxy.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetSslProxy.proxyHeader
   @summary String - Specifies the type of proxy header to append before sending data to the backend, either NONE or PROXY_V1. The default is NONE.
   
   @variable TargetSslProxy.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetSslProxy.service
   @summary String - URL to the BackendService resource.
   
   @variable TargetSslProxy.sslCertificates
   @summary Array - URLs to SslCertificate resources that are used to authenticate connections to Backends. Currently exactly one SSL certificate must be specified.
   
   @class TargetSslProxyList
   @summary Google API JSON structure
   
   @variable TargetSslProxyList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetSslProxyList.items
   @summary Array - A list of TargetSslProxy resources.
   
   @variable TargetSslProxyList.kind
   @summary String - Type of resource.
   
   @variable TargetSslProxyList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetSslProxyList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetVpnGateway
   @summary Google API JSON structure
   
   @variable TargetVpnGateway.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetVpnGateway.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable TargetVpnGateway.forwardingRules
   @summary Array - [Output Only] A list of URLs to the ForwardingRule resources. ForwardingRules are created using compute.forwardingRules.insert and associated to a VPN gateway.
   
   @variable TargetVpnGateway.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetVpnGateway.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGateway.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetVpnGateway.network
   @summary String - URL of the network to which this VPN gateway is attached. Provided by the client when the VPN gateway is created.
   
   @variable TargetVpnGateway.region
   @summary String - [Output Only] URL of the region where the target VPN gateway resides.
   
   @variable TargetVpnGateway.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetVpnGateway.status
   @summary String - [Output Only] The status of the VPN gateway.
   
   @variable TargetVpnGateway.tunnels
   @summary Array - [Output Only] A list of URLs to VpnTunnel resources. VpnTunnels are created using compute.vpntunnels.insert method and associated to a VPN gateway.
   
   @class TargetVpnGatewayAggregatedList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewayAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetVpnGatewayAggregatedList.items
   @summary Object - A map of scoped target vpn gateway lists.
   
   @variable TargetVpnGatewayAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGatewayAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetVpnGatewayAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetVpnGatewayList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewayList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable TargetVpnGatewayList.items
   @summary Array - [Output Only] A list of TargetVpnGateway resources.
   
   @variable TargetVpnGatewayList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGatewayList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable TargetVpnGatewayList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetVpnGatewaysScopedList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewaysScopedList.targetVpnGateways
   @summary Array - [Output Only] List of target vpn gateways contained in this scope.
   
   @variable TargetVpnGatewaysScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of addresses when the list is empty.
   
   @class TestFailure
   @summary Google API JSON structure
   
   @variable TestFailure.actualService
   @summary String
   
   @variable TestFailure.expectedService
   @summary String
   
   @variable TestFailure.host
   @summary String
   
   @variable TestFailure.path
   @summary String
   
   @class UrlMap
   @summary Google API JSON structure
   
   @variable UrlMap.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable UrlMap.defaultService
   @summary String - The URL of the BackendService resource if none of the hostRules match.
   
   @variable UrlMap.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable UrlMap.fingerprint
   @summary String - Fingerprint of this resource. A hash of the contents stored in this object. This field is used in optimistic locking. This field will be ignored when inserting a UrlMap. An up-to-date fingerprint must be provided in order to update the UrlMap.
   
   @variable UrlMap.hostRules
   @summary Array - The list of HostRules to use against the URL.
   
   @variable UrlMap.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable UrlMap.kind
   @summary String - [Output Only] Type of the resource. Always compute#urlMaps for url maps.
   
   @variable UrlMap.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable UrlMap.pathMatchers
   @summary Array - The list of named PathMatchers to use against the URL.
   
   @variable UrlMap.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable UrlMap.tests
   @summary Array - The list of expected URL mappings. Request to update this UrlMap will succeed only if all of the test cases pass.
   
   @class UrlMapList
   @summary Google API JSON structure
   
   @variable UrlMapList.id
   @summary String - [Output Only] Unique identifier for the resource. Set by the server.
   
   @variable UrlMapList.items
   @summary Array - A list of UrlMap resources.
   
   @variable UrlMapList.kind
   @summary String - Type of resource.
   
   @variable UrlMapList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable UrlMapList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class UrlMapReference
   @summary Google API JSON structure
   
   @variable UrlMapReference.urlMap
   @summary String
   
   @class UrlMapTest
   @summary Google API JSON structure
   
   @variable UrlMapTest.description
   @summary String - Description of this test case.
   
   @variable UrlMapTest.host
   @summary String - Host portion of the URL.
   
   @variable UrlMapTest.path
   @summary String - Path portion of the URL.
   
   @variable UrlMapTest.service
   @summary String - Expected BackendService resource the given URL should be mapped to.
   
   @class UrlMapValidationResult
   @summary Google API JSON structure
   
   @variable UrlMapValidationResult.loadErrors
   @summary Array
   
   @variable UrlMapValidationResult.loadSucceeded
   @summary Boolean - Whether the given UrlMap can be successfully loaded. If false, 'loadErrors' indicates the reasons.
   
   @variable UrlMapValidationResult.testFailures
   @summary Array
   
   @variable UrlMapValidationResult.testPassed
   @summary Boolean - If successfully loaded, this field indicates whether the test passed. If false, 'testFailures's indicate the reason of failure.
   
   @class UrlMapsValidateRequest
   @summary Google API JSON structure
   
   @variable UrlMapsValidateRequest.resource
   @summary [::UrlMap] - Content of the UrlMap to be validated.
   
   @class UrlMapsValidateResponse
   @summary Google API JSON structure
   
   @variable UrlMapsValidateResponse.result
   @summary [::UrlMapValidationResult]
   
   @class UsageExportLocation
   @summary Google API JSON structure
   
   @variable UsageExportLocation.bucketName
   @summary String - The name of an existing bucket in Cloud Storage where the usage report object is stored. The Google Service Account is granted write access to this bucket. This can either be the bucket name by itself, such as example-bucket, or the bucket name with gs:// or https://storage.googleapis.com/ in front of it, such as gs://example-bucket.
   
   @variable UsageExportLocation.reportNamePrefix
   @summary String - An optional prefix for the name of the usage report object stored in bucketName. If not supplied, defaults to usage. The report is stored as a CSV file named report_name_prefix_gce_YYYYMMDD.csv where YYYYMMDD is the day of the usage according to Pacific Time. If you supply a prefix, it should conform to Cloud Storage object naming conventions.
   
   @class VpnTunnel
   @summary Google API JSON structure
   
   @variable VpnTunnel.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable VpnTunnel.description
   @summary String - An optional description of this resource. Provide this property when you create the resource.
   
   @variable VpnTunnel.detailedStatus
   @summary String - [Output Only] Detailed status message for the VPN tunnel.
   
   @variable VpnTunnel.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable VpnTunnel.ikeVersion
   @summary Integer - IKE protocol version to use when establishing the VPN tunnel with peer VPN gateway. Acceptable IKE versions are 1 or 2. Default version is 2.
   
   @variable VpnTunnel.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnel.localTrafficSelector
   @summary Array - Local traffic selector to use when establishing the VPN tunnel with peer VPN gateway. The value should be a CIDR formatted string, for example: 192.168.0.0/16. The ranges should be disjoint. Only IPv4 is supported.
   
   @variable VpnTunnel.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable VpnTunnel.peerIp
   @summary String - IP address of the peer VPN gateway. Only IPv4 is supported.
   
   @variable VpnTunnel.region
   @summary String - [Output Only] URL of the region where the VPN tunnel resides.
   
   @variable VpnTunnel.remoteTrafficSelector
   @summary Array - Remote traffic selectors to use when establishing the VPN tunnel with peer VPN gateway. The value should be a CIDR formatted string, for example: 192.168.0.0/16. The ranges should be disjoint. Only IPv4 is supported.
   
   @variable VpnTunnel.router
   @summary String - URL of router resource to be used for dynamic routing.
   
   @variable VpnTunnel.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable VpnTunnel.sharedSecret
   @summary String - Shared secret used to set the secure session between the Cloud VPN gateway and the peer VPN gateway.
   
   @variable VpnTunnel.sharedSecretHash
   @summary String - Hash of the shared secret.
   
   @variable VpnTunnel.status
   @summary String - [Output Only] The status of the VPN tunnel.
   
   @variable VpnTunnel.targetVpnGateway
   @summary String - URL of the VPN gateway with which this VPN tunnel is associated. Provided by the client when the VPN tunnel is created.
   
   @class VpnTunnelAggregatedList
   @summary Google API JSON structure
   
   @variable VpnTunnelAggregatedList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable VpnTunnelAggregatedList.items
   @summary Object - [Output Only] A map of scoped vpn tunnel lists.
   
   @variable VpnTunnelAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnelAggregatedList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable VpnTunnelAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class VpnTunnelList
   @summary Google API JSON structure
   
   @variable VpnTunnelList.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable VpnTunnelList.items
   @summary Array - [Output Only] A list of VpnTunnel resources.
   
   @variable VpnTunnelList.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnelList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable VpnTunnelList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class VpnTunnelsScopedList
   @summary Google API JSON structure
   
   @variable VpnTunnelsScopedList.vpnTunnels
   @summary Array - List of vpn tunnels contained in this scope.
   
   @variable VpnTunnelsScopedList.warning
   @summary Object - Informational warning which replaces the list of addresses when the list is empty.
   
   @class Zone
   @summary Google API JSON structure
   
   @variable Zone.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Zone.deprecated
   @summary [::DeprecationStatus] - [Output Only] The deprecation status associated with this zone.
   
   @variable Zone.description
   @summary String - [Output Only] Textual description of the resource.
   
   @variable Zone.id
   @summary String - [Output Only] The unique identifier for the resource. This identifier is defined by the server.
   
   @variable Zone.kind
   @summary String - [Output Only] Type of the resource. Always compute#zone for zones.
   
   @variable Zone.name
   @summary String - [Output Only] Name of the resource.
   
   @variable Zone.region
   @summary String - [Output Only] Full URL reference to the region which hosts the zone.
   
   @variable Zone.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Zone.status
   @summary String - [Output Only] Status of the zone, either UP or DOWN.
   
   @class ZoneList
   @summary Google API JSON structure
   
   @variable ZoneList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable ZoneList.items
   @summary Array - [Output Only] A list of Zone resources.
   
   @variable ZoneList.kind
   @summary String - Type of resource.
   
   @variable ZoneList.nextPageToken
   @summary String - [Output Only] This token allows you to get the next page of results for list requests. If the number of results is larger than maxResults, use the nextPageToken as a value for the query parameter pageToken in the next list request. Subsequent list requests will have their own nextPageToken to continue paging through the results.
   
   @variable ZoneList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
*/

exports.addresses = {

  /**
     @function addresses.aggregatedList
     @summary  Retrieves an aggregated list of addresses.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::AddressAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/addresses',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function addresses.delete
     @summary  Deletes the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project', 'region'],
      pathParams: ['address', 'project', 'region']
    });
  },
  
  /**
     @function addresses.get
     @summary  Returns the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Address}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project', 'region'],
      pathParams: ['address', 'project', 'region']
    });
  },
  
  /**
     @function addresses.insert
     @summary  Creates an address resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Address} [resource] Data of [::Address] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/addresses',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function addresses.list
     @summary  Retrieves a list of addresses contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::AddressList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/addresses',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.autoscalers = {

  /**
     @function autoscalers.aggregatedList
     @summary  Retrieves an aggregated list of autoscalers.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::AutoscalerAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/autoscalers',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function autoscalers.delete
     @summary  Deletes the specified autoscaler.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the autoscaler to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone'],
      pathParams: ['autoscaler', 'project', 'zone']
    });
  },
  
  /**
     @function autoscalers.get
     @summary  Returns the specified autoscaler resource. Get a list of available autoscalers by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the autoscaler to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Autoscaler}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone'],
      pathParams: ['autoscaler', 'project', 'zone']
    });
  },
  
  /**
     @function autoscalers.insert
     @summary  Creates an autoscaler in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.list
     @summary  Retrieves a list of autoscalers contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::AutoscalerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.patch
     @summary  Updates an autoscaler in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {String} [autoscaler] Name of the autoscaler to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.update
     @summary  Updates an autoscaler in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {optional String} [autoscaler] Name of the autoscaler to update.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};


exports.backendServices = {

  /**
     @function backendServices.aggregatedList
     @summary  Retrieves the list of all BackendService resources, regional and global, available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::BackendServiceAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/backendServices',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function backendServices.delete
     @summary  Deletes the specified BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.get
     @summary  Returns the specified BackendService resource. Get a list of available backend services by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::BackendService}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.getHealth
     @summary  Gets the most recent health check results for this BackendService.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ResourceGroupReference} [resource] Data of [::ResourceGroupReference] structure
     @setting {String} [backendService] Name of the BackendService resource to which the queried instance belongs. **Required**
     @setting {String} [project] undefined **Required**
     @return {::BackendServiceGroupHealth}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getHealth: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices/{backendService}/getHealth',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.insert
     @summary  Creates a BackendService resource in the specified project using the data included in the request. There are several restrictions and guidelines to keep in mind when creating a backend service. Read  Restrictions and Guidelines for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function backendServices.list
     @summary  Retrieves the list of BackendService resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::BackendServiceList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function backendServices.patch
     @summary  Updates the specified BackendService resource with the data included in the request. There are several restrictions and guidelines to keep in mind when updating a backend service. Read  Restrictions and Guidelines for more information. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.update
     @summary  Updates the specified BackendService resource with the data included in the request. There are several restrictions and guidelines to keep in mind when updating a backend service. Read  Restrictions and Guidelines for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  }
};


exports.diskTypes = {

  /**
     @function diskTypes.aggregatedList
     @summary  Retrieves an aggregated list of disk types.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::DiskTypeAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/diskTypes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function diskTypes.get
     @summary  Returns the specified disk type. Get a list of available disk types by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [diskType] Name of the disk type to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::DiskType}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/diskTypes/{diskType}',
      params: params,
      requiredParams: ['diskType', 'project', 'zone'],
      pathParams: ['diskType', 'project', 'zone']
    });
  },
  
  /**
     @function diskTypes.list
     @summary  Retrieves a list of disk types available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::DiskTypeList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/diskTypes',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};


exports.disks = {

  /**
     @function disks.aggregatedList
     @summary  Retrieves an aggregated list of persistent disks.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::DiskAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/disks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function disks.createSnapshot
     @summary  Creates a snapshot of a specified persistent disk.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Snapshot} [resource] Data of [::Snapshot] structure
     @setting {String} [disk] Name of the persistent disk to snapshot. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  createSnapshot: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks/{disk}/createSnapshot',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.delete
     @summary  Deletes the specified persistent disk. Deleting a disk removes its data permanently and is irreversible. However, deleting a disk does not delete any snapshots previously made from the disk. You must separately delete snapshots.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [disk] Name of the persistent disk to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks/{disk}',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.get
     @summary  Returns a specified persistent disk. Get a list of available persistent disks by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [disk] Name of the persistent disk to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Disk}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks/{disk}',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.insert
     @summary  Creates a persistent disk in the specified project using the data in the request. You can create a disk with a sourceImage, a sourceSnapshot, or create an empty 500 GB data disk by omitting all properties. You can also create a disk that is larger than the default size by specifying the sizeGb property.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Disk} [resource] Data of [::Disk] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {optional String} [sourceImage] Optional. Source image to restore onto a disk.
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function disks.list
     @summary  Retrieves a list of persistent disks contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::DiskList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function disks.resize
     @summary  Resizes the specified persistent disk.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::DisksResizeRequest} [resource] Data of [::DisksResizeRequest] structure
     @setting {String} [disk] The name of the persistent disk. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  resize: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/disks/{disk}/resize',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  }
};


exports.firewalls = {

  /**
     @function firewalls.delete
     @summary  Deletes the specified firewall.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [firewall] Name of the firewall rule to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.get
     @summary  Returns the specified firewall.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [firewall] Name of the firewall rule to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Firewall}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.insert
     @summary  Creates a firewall rule in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Data of [::Firewall] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function firewalls.list
     @summary  Retrieves the list of firewall rules available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::FirewallList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function firewalls.patch
     @summary  Updates the specified firewall rule with the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Data of [::Firewall] structure
     @setting {String} [firewall] Name of the firewall rule to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.update
     @summary  Updates the specified firewall rule with the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Data of [::Firewall] structure
     @setting {String} [firewall] Name of the firewall rule to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  }
};


exports.forwardingRules = {

  /**
     @function forwardingRules.aggregatedList
     @summary  Retrieves an aggregated list of forwarding rules.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::ForwardingRuleAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/forwardingRules',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function forwardingRules.delete
     @summary  Deletes the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  },
  
  /**
     @function forwardingRules.get
     @summary  Returns the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::ForwardingRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  },
  
  /**
     @function forwardingRules.insert
     @summary  Creates a ForwardingRule resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ForwardingRule} [resource] Data of [::ForwardingRule] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/forwardingRules',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function forwardingRules.list
     @summary  Retrieves a list of ForwardingRule resources available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::ForwardingRuleList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/forwardingRules',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function forwardingRules.setTarget
     @summary  Changes target URL for forwarding rule. The new target should be of the same type as the old target.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Data of [::TargetReference] structure
     @setting {String} [forwardingRule] Name of the ForwardingRule resource in which target is to be set. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTarget: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/forwardingRules/{forwardingRule}/setTarget',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  }
};


exports.globalAddresses = {

  /**
     @function globalAddresses.delete
     @summary  Deletes the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project'],
      pathParams: ['address', 'project']
    });
  },
  
  /**
     @function globalAddresses.get
     @summary  Returns the specified address resource. Get a list of available addresses by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Address}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project'],
      pathParams: ['address', 'project']
    });
  },
  
  /**
     @function globalAddresses.insert
     @summary  Creates an address resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Address} [resource] Data of [::Address] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/addresses',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalAddresses.list
     @summary  Retrieves a list of global addresses.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::AddressList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/addresses',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.globalForwardingRules = {

  /**
     @function globalForwardingRules.delete
     @summary  Deletes the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project'],
      pathParams: ['forwardingRule', 'project']
    });
  },
  
  /**
     @function globalForwardingRules.get
     @summary  Returns the specified ForwardingRule resource. Get a list of available forwarding rules by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::ForwardingRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project'],
      pathParams: ['forwardingRule', 'project']
    });
  },
  
  /**
     @function globalForwardingRules.insert
     @summary  Creates a ForwardingRule resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ForwardingRule} [resource] Data of [::ForwardingRule] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/forwardingRules',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalForwardingRules.list
     @summary  Retrieves a list of ForwardingRule resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::ForwardingRuleList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/forwardingRules',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalForwardingRules.setTarget
     @summary  Changes target URL for forwarding rule. The new target should be of the same type as the old target.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Data of [::TargetReference] structure
     @setting {String} [forwardingRule] Name of the ForwardingRule resource in which target is to be set. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTarget: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/forwardingRules/{forwardingRule}/setTarget',
      params: params,
      requiredParams: ['forwardingRule', 'project'],
      pathParams: ['forwardingRule', 'project']
    });
  }
};


exports.globalOperations = {

  /**
     @function globalOperations.aggregatedList
     @summary  Retrieves an aggregated list of all operations.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::OperationAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/operations',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalOperations.delete
     @summary  Deletes the specified Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project'],
      pathParams: ['operation', 'project']
    });
  },
  
  /**
     @function globalOperations.get
     @summary  Retrieves the specified Operations resource. Get a list of operations by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project'],
      pathParams: ['operation', 'project']
    });
  },
  
  /**
     @function globalOperations.list
     @summary  Retrieves a list of Operation resources contained within the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::OperationList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/operations',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.healthChecks = {

  /**
     @function healthChecks.delete
     @summary  Deletes the specified HealthCheck resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [healthCheck] Name of the HealthCheck resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks/{healthCheck}',
      params: params,
      requiredParams: ['healthCheck', 'project'],
      pathParams: ['healthCheck', 'project']
    });
  },
  
  /**
     @function healthChecks.get
     @summary  Returns the specified HealthCheck resource. Get a list of available health checks by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [healthCheck] Name of the HealthCheck resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HealthCheck}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks/{healthCheck}',
      params: params,
      requiredParams: ['healthCheck', 'project'],
      pathParams: ['healthCheck', 'project']
    });
  },
  
  /**
     @function healthChecks.insert
     @summary  Creates a HealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HealthCheck} [resource] Data of [::HealthCheck] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function healthChecks.list
     @summary  Retrieves the list of HealthCheck resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HealthCheckList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function healthChecks.patch
     @summary  Updates a HealthCheck resource in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HealthCheck} [resource] Data of [::HealthCheck] structure
     @setting {String} [healthCheck] Name of the HealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks/{healthCheck}',
      params: params,
      requiredParams: ['healthCheck', 'project'],
      pathParams: ['healthCheck', 'project']
    });
  },
  
  /**
     @function healthChecks.update
     @summary  Updates a HealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HealthCheck} [resource] Data of [::HealthCheck] structure
     @setting {String} [healthCheck] Name of the HealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/healthChecks/{healthCheck}',
      params: params,
      requiredParams: ['healthCheck', 'project'],
      pathParams: ['healthCheck', 'project']
    });
  }
};


exports.httpHealthChecks = {

  /**
     @function httpHealthChecks.delete
     @summary  Deletes the specified HttpHealthCheck resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.get
     @summary  Returns the specified HttpHealthCheck resource. Get a list of available HTTP health checks by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HttpHealthCheck}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.insert
     @summary  Creates a HttpHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Data of [::HttpHealthCheck] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpHealthChecks.list
     @summary  Retrieves the list of HttpHealthCheck resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HttpHealthCheckList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpHealthChecks.patch
     @summary  Updates a HttpHealthCheck resource in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Data of [::HttpHealthCheck] structure
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.update
     @summary  Updates a HttpHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Data of [::HttpHealthCheck] structure
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  }
};


exports.httpsHealthChecks = {

  /**
     @function httpsHealthChecks.delete
     @summary  Deletes the specified HttpsHealthCheck resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpsHealthCheck] Name of the HttpsHealthCheck resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks/{httpsHealthCheck}',
      params: params,
      requiredParams: ['httpsHealthCheck', 'project'],
      pathParams: ['httpsHealthCheck', 'project']
    });
  },
  
  /**
     @function httpsHealthChecks.get
     @summary  Returns the specified HttpsHealthCheck resource. Get a list of available HTTPS health checks by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpsHealthCheck] Name of the HttpsHealthCheck resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HttpsHealthCheck}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks/{httpsHealthCheck}',
      params: params,
      requiredParams: ['httpsHealthCheck', 'project'],
      pathParams: ['httpsHealthCheck', 'project']
    });
  },
  
  /**
     @function httpsHealthChecks.insert
     @summary  Creates a HttpsHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpsHealthCheck} [resource] Data of [::HttpsHealthCheck] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpsHealthChecks.list
     @summary  Retrieves the list of HttpsHealthCheck resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::HttpsHealthCheckList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpsHealthChecks.patch
     @summary  Updates a HttpsHealthCheck resource in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpsHealthCheck} [resource] Data of [::HttpsHealthCheck] structure
     @setting {String} [httpsHealthCheck] Name of the HttpsHealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks/{httpsHealthCheck}',
      params: params,
      requiredParams: ['httpsHealthCheck', 'project'],
      pathParams: ['httpsHealthCheck', 'project']
    });
  },
  
  /**
     @function httpsHealthChecks.update
     @summary  Updates a HttpsHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpsHealthCheck} [resource] Data of [::HttpsHealthCheck] structure
     @setting {String} [httpsHealthCheck] Name of the HttpsHealthCheck resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/httpsHealthChecks/{httpsHealthCheck}',
      params: params,
      requiredParams: ['httpsHealthCheck', 'project'],
      pathParams: ['httpsHealthCheck', 'project']
    });
  }
};


exports.images = {

  /**
     @function images.delete
     @summary  Deletes the specified image.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [image] Name of the image resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images/{image}',
      params: params,
      requiredParams: ['image', 'project'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.deprecate
     @summary  Sets the deprecation status of an image.
  
  If an empty request body is given, clears the deprecation status instead.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::DeprecationStatus} [resource] Data of [::DeprecationStatus] structure
     @setting {String} [image] Image name. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  deprecate: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images/{image}/deprecate',
      params: params,
      requiredParams: ['image', 'project'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.get
     @summary  Returns the specified image. Get a list of available images by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [image] Name of the image resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Image}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images/{image}',
      params: params,
      requiredParams: ['image', 'project'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.getFromFamily
     @summary  Returns the latest image that is part of an image family and is not deprecated.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [family] Name of the image family to search for. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Image}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getFromFamily: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images/family/{family}',
      params: params,
      requiredParams: ['family', 'project'],
      pathParams: ['family', 'project']
    });
  },
  
  /**
     @function images.insert
     @summary  Creates an image in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Image} [resource] Data of [::Image] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function images.list
     @summary  Retrieves the list of private images available to the specified project. Private images are images you create that belong to your project. This method does not get any images that belong to other projects, including publicly-available images, like Debian 8. If you want to get a list of publicly-available images, use this method to make a request to the respective image project, such as debian-cloud or windows-cloud.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::ImageList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/images',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.instanceGroupManagers = {

  /**
     @function instanceGroupManagers.abandonInstances
     @summary  Schedules a group action to remove the specified instances from the managed instance group. Abandoning an instance does not delete the instance, but it does remove the instance from any target pools that are applied by the managed instance group. This method reduces the targetSize of the managed instance group by the number of instances that you abandon. This operation is marked as DONE when the action is scheduled even if the instances have not yet been removed from the group. You must separately verify the status of the abandoning action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersAbandonInstancesRequest} [resource] Data of [::InstanceGroupManagersAbandonInstancesRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  abandonInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/abandonInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.aggregatedList
     @summary  Retrieves the list of managed instance groups and groups them by zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::InstanceGroupManagerAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/instanceGroupManagers',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceGroupManagers.delete
     @summary  Deletes the specified managed instance group and all of the instances in that group. Note that the instance group must not belong to a backend service. Read  Deleting an instance group for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the managed instance group to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.deleteInstances
     @summary  Schedules a group action to delete the specified instances in the managed instance group. The instances are also removed from any target pools of which they were a member. This method reduces the targetSize of the managed instance group by the number of instances that you delete. This operation is marked as DONE when the action is scheduled even if the instances are still being deleted. You must separately verify the status of the deleting action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersDeleteInstancesRequest} [resource] Data of [::InstanceGroupManagersDeleteInstancesRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  deleteInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/deleteInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.get
     @summary  Returns all of the details about the specified managed instance group. Get a list of available managed instance groups by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManager}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.insert
     @summary  Creates a managed instance group using the information that you specify in the request. After the group is created, it schedules an action to create instances in the group using the specified instance template. This operation is marked as DONE when the group is created even if the instances in the group have not yet been created. You must separately verify the status of the individual instances with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManager} [resource] Data of [::InstanceGroupManager] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where you want to create the managed instance group. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.list
     @summary  Retrieves a list of managed instance groups that are contained within the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManagerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.listManagedInstances
     @summary  Lists all of the instances in the managed instance group. Each instance in the list has a currentAction, which indicates the action that the managed instance group is performing on the instance. For example, if the group is still creating an instance, the currentAction is CREATING. If a previous action failed, the list displays the errors for that failed action.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] undefined
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {optional Integer} [maxResults] undefined
     @setting {optional String} [order_by] undefined
     @setting {optional String} [pageToken] undefined
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManagersListManagedInstancesResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listManagedInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/listManagedInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.recreateInstances
     @summary  Schedules a group action to recreate the specified instances in the managed instance group. The instances are deleted and recreated using the current instance template for the managed instance group. This operation is marked as DONE when the action is scheduled even if the instances have not yet been recreated. You must separately verify the status of the recreating action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersRecreateInstancesRequest} [resource] Data of [::InstanceGroupManagersRecreateInstancesRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  recreateInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/recreateInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.resize
     @summary  Resizes the managed instance group. If you increase the size, the group creates new instances using the current instance template. If you decrease the size, the group deletes instances. The resize operation is marked DONE when the resize actions are scheduled even if the group has not yet added or deleted any instances. You must separately verify the status of the creating or deleting actions with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {Integer} [size] The number of running instances that the managed instance group should maintain at any given time. The group automatically adds or removes instances to maintain the number of instances specified by this parameter. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  resize: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/resize',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'size', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.setInstanceTemplate
     @summary  Specifies the instance template to use when creating new instances in this group. The templates for existing instances in the group do not change unless you recreate them.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersSetInstanceTemplateRequest} [resource] Data of [::InstanceGroupManagersSetInstanceTemplateRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setInstanceTemplate: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/setInstanceTemplate',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.setTargetPools
     @summary  Modifies the target pools to which all instances in this managed instance group are assigned. The target pools automatically apply to all of the instances in the managed instance group. This operation is marked DONE when you make the request even if the instances have not yet been added to their target pools. The change might take some time to apply to all of the instances in the group depending on the size of the group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersSetTargetPoolsRequest} [resource] Data of [::InstanceGroupManagersSetTargetPoolsRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTargetPools: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/setTargetPools',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  }
};


exports.instanceGroups = {

  /**
     @function instanceGroups.addInstances
     @summary  Adds a list of instances to the specified instance group. All of the instances in the instance group must be in the same network/subnetwork. Read  Adding instances for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsAddInstancesRequest} [resource] Data of [::InstanceGroupsAddInstancesRequest] structure
     @setting {String} [instanceGroup] The name of the instance group where you are adding instances. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}/addInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.aggregatedList
     @summary  Retrieves the list of instance groups and sorts them by zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::InstanceGroupAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/instanceGroups',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceGroups.delete
     @summary  Deletes the specified instance group. The instances in the group are not deleted. Note that instance group must not belong to a backend service. Read  Deleting an instance group for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroup] The name of the instance group to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.get
     @summary  Returns the specified instance group. Get a list of available instance groups by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroup] The name of the instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::InstanceGroup}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.insert
     @summary  Creates an instance group in the specified project using the parameters that are included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroup} [resource] Data of [::InstanceGroup] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where you want to create the instance group. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.list
     @summary  Retrieves the list of instance groups that are located in the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::InstanceGroupList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.listInstances
     @summary  Lists the instances in the specified instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsListInstancesRequest} [resource] Data of [::InstanceGroupsListInstancesRequest] structure
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {String} [instanceGroup] The name of the instance group from which you want to generate a list of included instances. **Required**
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::InstanceGroupsListInstances}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}/listInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.removeInstances
     @summary  Removes one or more instances from the specified instance group, but does not delete those instances.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsRemoveInstancesRequest} [resource] Data of [::InstanceGroupsRemoveInstancesRequest] structure
     @setting {String} [instanceGroup] The name of the instance group where the specified instances will be removed. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}/removeInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.setNamedPorts
     @summary  Sets the named ports for the specified instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsSetNamedPortsRequest} [resource] Data of [::InstanceGroupsSetNamedPortsRequest] structure
     @setting {String} [instanceGroup] The name of the instance group where the named ports are updated. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setNamedPorts: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instanceGroups/{instanceGroup}/setNamedPorts',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  }
};


exports.instanceTemplates = {

  /**
     @function instanceTemplates.delete
     @summary  Deletes the specified instance template. If you delete an instance template that is being referenced from another instance group, the instance group will not be able to create or recreate virtual machine instances. Deleting an instance template is permanent and cannot be undone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceTemplate] The name of the instance template to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/instanceTemplates/{instanceTemplate}',
      params: params,
      requiredParams: ['instanceTemplate', 'project'],
      pathParams: ['instanceTemplate', 'project']
    });
  },
  
  /**
     @function instanceTemplates.get
     @summary  Returns the specified instance template. Get a list of available instance templates by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceTemplate] The name of the instance template. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::InstanceTemplate}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/instanceTemplates/{instanceTemplate}',
      params: params,
      requiredParams: ['instanceTemplate', 'project'],
      pathParams: ['instanceTemplate', 'project']
    });
  },
  
  /**
     @function instanceTemplates.insert
     @summary  Creates an instance template in the specified project using the data that is included in the request. If you are creating a new template to update an existing instance group, your new instance template must use the same network or, if applicable, the same subnetwork as the original template.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceTemplate} [resource] Data of [::InstanceTemplate] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/instanceTemplates',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceTemplates.list
     @summary  Retrieves a list of instance templates that are contained within the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::InstanceTemplateList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/instanceTemplates',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.instances = {

  /**
     @function instances.addAccessConfig
     @summary  Adds an access config to an instance's network interface.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::AccessConfig} [resource] Data of [::AccessConfig] structure
     @setting {String} [instance] The instance name for this request. **Required**
     @setting {String} [networkInterface] The name of the network interface to add to this instance. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addAccessConfig: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/addAccessConfig',
      params: params,
      requiredParams: ['instance', 'networkInterface', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.aggregatedList
     @summary  Retrieves aggregated list of instances.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::InstanceAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/instances',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instances.attachDisk
     @summary  Attaches a Disk resource to an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::AttachedDisk} [resource] Data of [::AttachedDisk] structure
     @setting {String} [instance] The instance name for this request. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  attachDisk: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/attachDisk',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.delete
     @summary  Deletes the specified Instance resource. For more information, see Stopping or Deleting an Instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.deleteAccessConfig
     @summary  Deletes an access config from an instance's network interface.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [accessConfig] The name of the access config to delete. **Required**
     @setting {String} [instance] The instance name for this request. **Required**
     @setting {String} [networkInterface] The name of the network interface. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  deleteAccessConfig: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/deleteAccessConfig',
      params: params,
      requiredParams: ['accessConfig', 'instance', 'networkInterface', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.detachDisk
     @summary  Detaches a disk from an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [deviceName] Disk device name to detach. **Required**
     @setting {String} [instance] Instance name. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  detachDisk: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/detachDisk',
      params: params,
      requiredParams: ['deviceName', 'instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.get
     @summary  Returns the specified Instance resource. Get a list of available instances by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Instance}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.getSerialPortOutput
     @summary  Returns the specified instance's serial port output.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {optional Integer} [port] Specifies which COM or serial port to retrieve data from.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {optional String} [start] For the initial request, leave this field unspecified. For subsequent calls, this field should be set to the next value that was returned in the previous call.
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::SerialPortOutput}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getSerialPortOutput: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/serialPort',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.insert
     @summary  Creates an instance resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Instance} [resource] Data of [::Instance] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instances.list
     @summary  Retrieves the list of instances contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::InstanceList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instances.reset
     @summary  Performs a hard reset on the instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  reset: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/reset',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setDiskAutoDelete
     @summary  Sets the auto-delete flag for a disk attached to an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {Boolean} [autoDelete] Whether to auto-delete the disk when the instance is deleted. **Required**
     @setting {String} [deviceName] The device name of the disk to modify. **Required**
     @setting {String} [instance] The instance name. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setDiskAutoDelete: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setDiskAutoDelete',
      params: params,
      requiredParams: ['autoDelete', 'deviceName', 'instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setMachineType
     @summary  Changes the machine type for a stopped instance to the machine type specified in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstancesSetMachineTypeRequest} [resource] Data of [::InstancesSetMachineTypeRequest] structure
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setMachineType: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setMachineType',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setMetadata
     @summary  Sets metadata for the specified instance to the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Metadata} [resource] Data of [::Metadata] structure
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setMetadata: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setMetadata',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setScheduling
     @summary  Sets an instance's scheduling options.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Scheduling} [resource] Data of [::Scheduling] structure
     @setting {String} [instance] Instance name. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setScheduling: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setScheduling',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setServiceAccount
     @summary  Sets the service account on the instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstancesSetServiceAccountRequest} [resource] Data of [::InstancesSetServiceAccountRequest] structure
     @setting {String} [instance] Name of the instance resource to start. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setServiceAccount: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setServiceAccount',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setTags
     @summary  Sets tags for the specified instance to the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Tags} [resource] Data of [::Tags] structure
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTags: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/setTags',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.start
     @summary  Starts an instance that was stopped using the using the instances().stop method. For more information, see Restart an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance resource to start. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  start: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/start',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.startWithEncryptionKey
     @summary  Starts an instance that was stopped using the using the instances().stop method. For more information, see Restart an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstancesStartWithEncryptionKeyRequest} [resource] Data of [::InstancesStartWithEncryptionKeyRequest] structure
     @setting {String} [instance] Name of the instance resource to start. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  startWithEncryptionKey: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/startWithEncryptionKey',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.stop
     @summary  Stops a running instance, shutting it down cleanly, and allows you to restart the instance at a later time. Stopped instances do not incur per-minute, virtual machine usage charges while they are stopped, but any resources that the virtual machine is using, such as persistent disks and static IP addresses, will continue to be charged until they are deleted. For more information, see Stopping an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance resource to stop. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  stop: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/instances/{instance}/stop',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  }
};


exports.licenses = {

  /**
     @function licenses.get
     @summary  Returns the specified License resource. Get a list of available licenses by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [license] Name of the License resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::License}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/licenses/{license}',
      params: params,
      requiredParams: ['license', 'project'],
      pathParams: ['license', 'project']
    });
  }
};


exports.machineTypes = {

  /**
     @function machineTypes.aggregatedList
     @summary  Retrieves an aggregated list of machine types.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::MachineTypeAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/machineTypes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function machineTypes.get
     @summary  Returns the specified machine type. Get a list of available machine types by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [machineType] Name of the machine type to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::MachineType}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/machineTypes/{machineType}',
      params: params,
      requiredParams: ['machineType', 'project', 'zone'],
      pathParams: ['machineType', 'project', 'zone']
    });
  },
  
  /**
     @function machineTypes.list
     @summary  Retrieves a list of machine types available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] The name of the zone for this request. **Required**
     @return {::MachineTypeList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/machineTypes',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};


exports.networks = {

  /**
     @function networks.delete
     @summary  Deletes the specified network.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [network] Name of the network to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/networks/{network}',
      params: params,
      requiredParams: ['network', 'project'],
      pathParams: ['network', 'project']
    });
  },
  
  /**
     @function networks.get
     @summary  Returns the specified network. Get a list of available networks by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [network] Name of the network to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Network}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/networks/{network}',
      params: params,
      requiredParams: ['network', 'project'],
      pathParams: ['network', 'project']
    });
  },
  
  /**
     @function networks.insert
     @summary  Creates a network in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Network} [resource] Data of [::Network] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/networks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function networks.list
     @summary  Retrieves the list of networks available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::NetworkList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/networks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function networks.switchToCustomMode
     @summary  Switches the network mode from auto subnet mode to custom subnet mode.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [network] Name of the network to be updated. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  switchToCustomMode: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/networks/{network}/switchToCustomMode',
      params: params,
      requiredParams: ['network', 'project'],
      pathParams: ['network', 'project']
    });
  }
};


exports.projects = {

  /**
     @function projects.get
     @summary  Returns the specified Project resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Project}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.moveDisk
     @summary  Moves a persistent disk from one zone to another.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::DiskMoveRequest} [resource] Data of [::DiskMoveRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  moveDisk: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/moveDisk',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.moveInstance
     @summary  Moves an instance and its attached persistent disks from one zone to another.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceMoveRequest} [resource] Data of [::InstanceMoveRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  moveInstance: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/moveInstance',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.setCommonInstanceMetadata
     @summary  Sets metadata common to all instances within the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Metadata} [resource] Data of [::Metadata] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setCommonInstanceMetadata: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/setCommonInstanceMetadata',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.setUsageExportBucket
     @summary  Enables the usage export feature and sets the usage export bucket where reports are stored. If you provide an empty request body using this method, the usage export feature will be disabled.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UsageExportLocation} [resource] Data of [::UsageExportLocation] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/devstorage.full_control - Manage your data and permissions in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_only - View your data in Google Cloud Storage
        * https://www.googleapis.com/auth/devstorage.read_write - Manage your data in Google Cloud Storage
  */
  setUsageExportBucket: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/setUsageExportBucket',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.regionAutoscalers = {

  /**
     @function regionAutoscalers.delete
     @summary  Deletes the specified autoscaler.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the autoscaler to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'region'],
      pathParams: ['autoscaler', 'project', 'region']
    });
  },
  
  /**
     @function regionAutoscalers.get
     @summary  Returns the specified autoscaler.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the autoscaler to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Autoscaler}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'region'],
      pathParams: ['autoscaler', 'project', 'region']
    });
  },
  
  /**
     @function regionAutoscalers.insert
     @summary  Creates an autoscaler in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionAutoscalers.list
     @summary  Retrieves a list of autoscalers contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::RegionAutoscalerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionAutoscalers.patch
     @summary  Updates an autoscaler in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {String} [autoscaler] Name of the autoscaler to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers',
      params: params,
      requiredParams: ['autoscaler', 'project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionAutoscalers.update
     @summary  Updates an autoscaler in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Data of [::Autoscaler] structure
     @setting {optional String} [autoscaler] Name of the autoscaler to update.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/autoscalers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.regionBackendServices = {

  /**
     @function regionBackendServices.delete
     @summary  Deletes the specified regional BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'region'],
      pathParams: ['backendService', 'project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.get
     @summary  Returns the specified regional BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::BackendService}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'region'],
      pathParams: ['backendService', 'project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.getHealth
     @summary  Gets the most recent health check results for this regional BackendService.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::ResourceGroupReference} [resource] Data of [::ResourceGroupReference] structure
     @setting {String} [backendService] Name of the BackendService resource to which the queried instance belongs. **Required**
     @setting {String} [project] undefined **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::BackendServiceGroupHealth}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getHealth: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices/{backendService}/getHealth',
      params: params,
      requiredParams: ['backendService', 'project', 'region'],
      pathParams: ['backendService', 'project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.insert
     @summary  Creates a regional BackendService resource in the specified project using the data included in the request. There are several restrictions and guidelines to keep in mind when creating a regional backend service. Read  Restrictions and Guidelines for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.list
     @summary  Retrieves the list of regional BackendService resources available to the specified project in the given region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::BackendServiceList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.patch
     @summary  Updates the specified regional BackendService resource with the data included in the request. There are several restrictions and guidelines to keep in mind when updating a backend service. Read  Restrictions and Guidelines for more information. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'region'],
      pathParams: ['backendService', 'project', 'region']
    });
  },
  
  /**
     @function regionBackendServices.update
     @summary  Updates the specified regional BackendService resource with the data included in the request. There are several restrictions and guidelines to keep in mind when updating a backend service. Read  Restrictions and Guidelines for more information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Data of [::BackendService] structure
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'region'],
      pathParams: ['backendService', 'project', 'region']
    });
  }
};


exports.regionInstanceGroupManagers = {

  /**
     @function regionInstanceGroupManagers.abandonInstances
     @summary  Schedules a group action to remove the specified instances from the managed instance group. Abandoning an instance does not delete the instance, but it does remove the instance from any target pools that are applied by the managed instance group. This method reduces the targetSize of the managed instance group by the number of instances that you abandon. This operation is marked as DONE when the action is scheduled even if the instances have not yet been removed from the group. You must separately verify the status of the abandoning action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupManagersAbandonInstancesRequest} [resource] Data of [::RegionInstanceGroupManagersAbandonInstancesRequest] structure
     @setting {String} [instanceGroupManager] Name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  abandonInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/abandonInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.delete
     @summary  Deletes the specified managed instance group and all of the instances in that group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] Name of the managed instance group to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.deleteInstances
     @summary  Schedules a group action to delete the specified instances in the managed instance group. The instances are also removed from any target pools of which they were a member. This method reduces the targetSize of the managed instance group by the number of instances that you delete. This operation is marked as DONE when the action is scheduled even if the instances are still being deleted. You must separately verify the status of the deleting action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupManagersDeleteInstancesRequest} [resource] Data of [::RegionInstanceGroupManagersDeleteInstancesRequest] structure
     @setting {String} [instanceGroupManager] Name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  deleteInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/deleteInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.get
     @summary  Returns all of the details about the specified managed instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] Name of the managed instance group to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::InstanceGroupManager}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.insert
     @summary  Creates a managed instance group using the information that you specify in the request. After the group is created, it schedules an action to create instances in the group using the specified instance template. This operation is marked as DONE when the group is created even if the instances in the group have not yet been created. You must separately verify the status of the individual instances with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManager} [resource] Data of [::InstanceGroupManager] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.list
     @summary  Retrieves the list of managed instance groups that are contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::RegionInstanceGroupManagerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.listManagedInstances
     @summary  Lists the instances in the managed instance group and instances that are scheduled to be created. The list includes any current actions that the group has scheduled for its instances.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] undefined
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {optional Integer} [maxResults] undefined
     @setting {optional String} [order_by] undefined
     @setting {optional String} [pageToken] undefined
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::RegionInstanceGroupManagersListInstancesResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listManagedInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/listManagedInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.recreateInstances
     @summary  Schedules a group action to recreate the specified instances in the managed instance group. The instances are deleted and recreated using the current instance template for the managed instance group. This operation is marked as DONE when the action is scheduled even if the instances have not yet been recreated. You must separately verify the status of the recreating action with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupManagersRecreateRequest} [resource] Data of [::RegionInstanceGroupManagersRecreateRequest] structure
     @setting {String} [instanceGroupManager] Name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  recreateInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/recreateInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.resize
     @summary  Changes the intended size for the managed instance group. If you increase the size, the group schedules actions to create new instances using the current instance template. If you decrease the size, the group schedules delete actions on one or more instances. The resize operation is marked DONE when the resize actions are scheduled even if the group has not yet added or deleted any instances. You must separately verify the status of the creating or deleting actions with the listmanagedinstances method.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] Name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {Integer} [size] Number of instances that should exist in this instance group manager. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  resize: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/resize',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region', 'size'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.setInstanceTemplate
     @summary  Sets the instance template to use when creating new instances or recreating instances in this group. Existing instances are not affected.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupManagersSetTemplateRequest} [resource] Data of [::RegionInstanceGroupManagersSetTemplateRequest] structure
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setInstanceTemplate: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/setInstanceTemplate',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroupManagers.setTargetPools
     @summary  Modifies the target pools to which all new instances in this group are assigned. Existing instances in the group are not affected.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupManagersSetTargetPoolsRequest} [resource] Data of [::RegionInstanceGroupManagersSetTargetPoolsRequest] structure
     @setting {String} [instanceGroupManager] Name of the managed instance group. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTargetPools: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroupManagers/{instanceGroupManager}/setTargetPools',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'region'],
      pathParams: ['instanceGroupManager', 'project', 'region']
    });
  }
};


exports.regionInstanceGroups = {

  /**
     @function regionInstanceGroups.get
     @summary  Returns the specified instance group resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroup] Name of the instance group resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::InstanceGroup}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroups/{instanceGroup}',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'region'],
      pathParams: ['instanceGroup', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroups.list
     @summary  Retrieves the list of instance group resources contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::RegionInstanceGroupList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroups',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroups.listInstances
     @summary  Lists the instances in the specified instance group and displays information about the named ports. Depending on the specified options, this method can list all instances or only the instances that are running.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupsListInstancesRequest} [resource] Data of [::RegionInstanceGroupsListInstancesRequest] structure
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {String} [instanceGroup] Name of the regional instance group for which we want to list the instances. **Required**
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::RegionInstanceGroupsListInstances}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listInstances: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroups/{instanceGroup}/listInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'region'],
      pathParams: ['instanceGroup', 'project', 'region']
    });
  },
  
  /**
     @function regionInstanceGroups.setNamedPorts
     @summary  Sets the named ports for the specified regional instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::RegionInstanceGroupsSetNamedPortsRequest} [resource] Data of [::RegionInstanceGroupsSetNamedPortsRequest] structure
     @setting {String} [instanceGroup] The name of the regional instance group where the named ports are updated. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setNamedPorts: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/instanceGroups/{instanceGroup}/setNamedPorts',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'region'],
      pathParams: ['instanceGroup', 'project', 'region']
    });
  }
};


exports.regionOperations = {

  /**
     @function regionOperations.delete
     @summary  Deletes the specified region-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'region'],
      pathParams: ['operation', 'project', 'region']
    });
  },
  
  /**
     @function regionOperations.get
     @summary  Retrieves the specified region-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'region'],
      pathParams: ['operation', 'project', 'region']
    });
  },
  
  /**
     @function regionOperations.list
     @summary  Retrieves a list of Operation resources contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::OperationList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/operations',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.regions = {

  /**
     @function regions.get
     @summary  Returns the specified Region resource. Get a list of available regions by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region resource to return. **Required**
     @return {::Region}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regions.list
     @summary  Retrieves the list of region resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::RegionList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.routers = {

  /**
     @function routers.aggregatedList
     @summary  Retrieves an aggregated list of routers.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::RouterAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/routers',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function routers.delete
     @summary  Deletes the specified Router resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  },
  
  /**
     @function routers.get
     @summary  Returns the specified Router resource. Get a list of available routers by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to return. **Required**
     @return {::Router}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  },
  
  /**
     @function routers.getRouterStatus
     @summary  Retrieves runtime information of the specified router.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to query. **Required**
     @return {::RouterStatusResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getRouterStatus: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}/getRouterStatus',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  },
  
  /**
     @function routers.insert
     @summary  Creates a Router resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Router} [resource] Data of [::Router] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function routers.list
     @summary  Retrieves a list of Router resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::RouterList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function routers.patch
     @summary  Updates the specified Router resource with the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Router} [resource] Data of [::Router] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  },
  
  /**
     @function routers.preview
     @summary  Preview fields auto-generated during router create and update operations. Calling this method does NOT create or update the router.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Router} [resource] Data of [::Router] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to query. **Required**
     @return {::RoutersPreviewResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  preview: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}/preview',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  },
  
  /**
     @function routers.update
     @summary  Updates the specified Router resource with the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Router} [resource] Data of [::Router] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [router] Name of the Router resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/routers/{router}',
      params: params,
      requiredParams: ['project', 'region', 'router'],
      pathParams: ['project', 'region', 'router']
    });
  }
};


exports.routes = {

  /**
     @function routes.delete
     @summary  Deletes the specified Route resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [route] Name of the Route resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/routes/{route}',
      params: params,
      requiredParams: ['project', 'route'],
      pathParams: ['project', 'route']
    });
  },
  
  /**
     @function routes.get
     @summary  Returns the specified Route resource. Get a list of available routes by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [route] Name of the Route resource to return. **Required**
     @return {::Route}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/routes/{route}',
      params: params,
      requiredParams: ['project', 'route'],
      pathParams: ['project', 'route']
    });
  },
  
  /**
     @function routes.insert
     @summary  Creates a Route resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Route} [resource] Data of [::Route] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/routes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function routes.list
     @summary  Retrieves the list of Route resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::RouteList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/routes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.snapshots = {

  /**
     @function snapshots.delete
     @summary  Deletes the specified Snapshot resource. Keep in mind that deleting a single snapshot might not necessarily delete all the data on that snapshot. If any data on the snapshot that is marked for deletion is needed for subsequent snapshots, the data will be moved to the next corresponding snapshot.
  
  For more information, see Deleting snaphots.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [snapshot] Name of the Snapshot resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/snapshots/{snapshot}',
      params: params,
      requiredParams: ['project', 'snapshot'],
      pathParams: ['project', 'snapshot']
    });
  },
  
  /**
     @function snapshots.get
     @summary  Returns the specified Snapshot resource. Get a list of available snapshots by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [snapshot] Name of the Snapshot resource to return. **Required**
     @return {::Snapshot}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/snapshots/{snapshot}',
      params: params,
      requiredParams: ['project', 'snapshot'],
      pathParams: ['project', 'snapshot']
    });
  },
  
  /**
     @function snapshots.list
     @summary  Retrieves the list of Snapshot resources contained within the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::SnapshotList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/snapshots',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.sslCertificates = {

  /**
     @function sslCertificates.delete
     @summary  Deletes the specified SslCertificate resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [sslCertificate] Name of the SslCertificate resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/sslCertificates/{sslCertificate}',
      params: params,
      requiredParams: ['project', 'sslCertificate'],
      pathParams: ['project', 'sslCertificate']
    });
  },
  
  /**
     @function sslCertificates.get
     @summary  Returns the specified SslCertificate resource. Get a list of available SSL certificates by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [sslCertificate] Name of the SslCertificate resource to return. **Required**
     @return {::SslCertificate}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/sslCertificates/{sslCertificate}',
      params: params,
      requiredParams: ['project', 'sslCertificate'],
      pathParams: ['project', 'sslCertificate']
    });
  },
  
  /**
     @function sslCertificates.insert
     @summary  Creates a SslCertificate resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::SslCertificate} [resource] Data of [::SslCertificate] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/sslCertificates',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function sslCertificates.list
     @summary  Retrieves the list of SslCertificate resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::SslCertificateList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/sslCertificates',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};


exports.subnetworks = {

  /**
     @function subnetworks.aggregatedList
     @summary  Retrieves an aggregated list of subnetworks.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::SubnetworkAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/subnetworks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function subnetworks.delete
     @summary  Deletes the specified subnetwork.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [subnetwork] Name of the Subnetwork resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/subnetworks/{subnetwork}',
      params: params,
      requiredParams: ['project', 'region', 'subnetwork'],
      pathParams: ['project', 'region', 'subnetwork']
    });
  },
  
  /**
     @function subnetworks.expandIpCidrRange
     @summary  Expands the IP CIDR range of the subnetwork to a specified value.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::SubnetworksExpandIpCidrRangeRequest} [resource] Data of [::SubnetworksExpandIpCidrRangeRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [subnetwork] Name of the Subnetwork resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  expandIpCidrRange: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/subnetworks/{subnetwork}/expandIpCidrRange',
      params: params,
      requiredParams: ['project', 'region', 'subnetwork'],
      pathParams: ['project', 'region', 'subnetwork']
    });
  },
  
  /**
     @function subnetworks.get
     @summary  Returns the specified subnetwork. Get a list of available subnetworks list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [subnetwork] Name of the Subnetwork resource to return. **Required**
     @return {::Subnetwork}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/subnetworks/{subnetwork}',
      params: params,
      requiredParams: ['project', 'region', 'subnetwork'],
      pathParams: ['project', 'region', 'subnetwork']
    });
  },
  
  /**
     @function subnetworks.insert
     @summary  Creates a subnetwork in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Subnetwork} [resource] Data of [::Subnetwork] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/subnetworks',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function subnetworks.list
     @summary  Retrieves a list of subnetworks available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::SubnetworkList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/subnetworks',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.targetHttpProxies = {

  /**
     @function targetHttpProxies.delete
     @summary  Deletes the specified TargetHttpProxy resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpProxy] Name of the TargetHttpProxy resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpProxies/{targetHttpProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpProxy'],
      pathParams: ['project', 'targetHttpProxy']
    });
  },
  
  /**
     @function targetHttpProxies.get
     @summary  Returns the specified TargetHttpProxy resource. Get a list of available target HTTP proxies by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpProxy] Name of the TargetHttpProxy resource to return. **Required**
     @return {::TargetHttpProxy}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpProxies/{targetHttpProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpProxy'],
      pathParams: ['project', 'targetHttpProxy']
    });
  },
  
  /**
     @function targetHttpProxies.insert
     @summary  Creates a TargetHttpProxy resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetHttpProxy} [resource] Data of [::TargetHttpProxy] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpProxies.list
     @summary  Retrieves the list of TargetHttpProxy resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetHttpProxyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpProxies.setUrlMap
     @summary  Changes the URL map for TargetHttpProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMapReference} [resource] Data of [::UrlMapReference] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpProxy] Name of the TargetHttpProxy to set a URL map for. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setUrlMap: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/targetHttpProxies/{targetHttpProxy}/setUrlMap',
      params: params,
      requiredParams: ['project', 'targetHttpProxy'],
      pathParams: ['project', 'targetHttpProxy']
    });
  }
};


exports.targetHttpsProxies = {

  /**
     @function targetHttpsProxies.delete
     @summary  Deletes the specified TargetHttpsProxy resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpsProxy] Name of the TargetHttpsProxy resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpsProxies/{targetHttpsProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpsProxy'],
      pathParams: ['project', 'targetHttpsProxy']
    });
  },
  
  /**
     @function targetHttpsProxies.get
     @summary  Returns the specified TargetHttpsProxy resource. Get a list of available target HTTPS proxies by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpsProxy] Name of the TargetHttpsProxy resource to return. **Required**
     @return {::TargetHttpsProxy}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpsProxies/{targetHttpsProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpsProxy'],
      pathParams: ['project', 'targetHttpsProxy']
    });
  },
  
  /**
     @function targetHttpsProxies.insert
     @summary  Creates a TargetHttpsProxy resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetHttpsProxy} [resource] Data of [::TargetHttpsProxy] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpsProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpsProxies.list
     @summary  Retrieves the list of TargetHttpsProxy resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetHttpsProxyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetHttpsProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpsProxies.setSslCertificates
     @summary  Replaces SslCertificates for TargetHttpsProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetHttpsProxiesSetSslCertificatesRequest} [resource] Data of [::TargetHttpsProxiesSetSslCertificatesRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpsProxy] Name of the TargetHttpsProxy resource to set an SslCertificates resource for. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setSslCertificates: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/targetHttpsProxies/{targetHttpsProxy}/setSslCertificates',
      params: params,
      requiredParams: ['project', 'targetHttpsProxy'],
      pathParams: ['project', 'targetHttpsProxy']
    });
  },
  
  /**
     @function targetHttpsProxies.setUrlMap
     @summary  Changes the URL map for TargetHttpsProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMapReference} [resource] Data of [::UrlMapReference] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetHttpsProxy] Name of the TargetHttpsProxy resource whose URL map is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setUrlMap: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/targetHttpsProxies/{targetHttpsProxy}/setUrlMap',
      params: params,
      requiredParams: ['project', 'targetHttpsProxy'],
      pathParams: ['project', 'targetHttpsProxy']
    });
  }
};


exports.targetInstances = {

  /**
     @function targetInstances.aggregatedList
     @summary  Retrieves an aggregated list of target instances.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetInstanceAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/targetInstances',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetInstances.delete
     @summary  Deletes the specified TargetInstance resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetInstance] Name of the TargetInstance resource to delete. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/targetInstances/{targetInstance}',
      params: params,
      requiredParams: ['project', 'targetInstance', 'zone'],
      pathParams: ['project', 'targetInstance', 'zone']
    });
  },
  
  /**
     @function targetInstances.get
     @summary  Returns the specified TargetInstance resource. Get a list of available target instances by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetInstance] Name of the TargetInstance resource to return. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::TargetInstance}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/targetInstances/{targetInstance}',
      params: params,
      requiredParams: ['project', 'targetInstance', 'zone'],
      pathParams: ['project', 'targetInstance', 'zone']
    });
  },
  
  /**
     @function targetInstances.insert
     @summary  Creates a TargetInstance resource in the specified project and zone using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetInstance} [resource] Data of [::TargetInstance] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/targetInstances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function targetInstances.list
     @summary  Retrieves a list of TargetInstance resources available to the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::TargetInstanceList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/targetInstances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};


exports.targetPools = {

  /**
     @function targetPools.addHealthCheck
     @summary  Adds health check URLs to a target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsAddHealthCheckRequest} [resource] Data of [::TargetPoolsAddHealthCheckRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the target pool to add a health check to. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addHealthCheck: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/addHealthCheck',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.addInstance
     @summary  Adds an instance to a target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsAddInstanceRequest} [resource] Data of [::TargetPoolsAddInstanceRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to add instances to. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addInstance: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/addInstance',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.aggregatedList
     @summary  Retrieves an aggregated list of target pools.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetPoolAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/targetPools',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetPools.delete
     @summary  Deletes the specified target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.get
     @summary  Returns the specified target pool. Get a list of available target pools by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to return. **Required**
     @return {::TargetPool}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.getHealth
     @summary  Gets the most recent health check results for each IP for the instance that is referenced by the given target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceReference} [resource] Data of [::InstanceReference] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to which the queried instance belongs. **Required**
     @return {::TargetPoolInstanceHealth}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  getHealth: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/getHealth',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.insert
     @summary  Creates a target pool in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPool} [resource] Data of [::TargetPool] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetPools.list
     @summary  Retrieves a list of target pools available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::TargetPoolList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetPools.removeHealthCheck
     @summary  Removes health check URL from a target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsRemoveHealthCheckRequest} [resource] Data of [::TargetPoolsRemoveHealthCheckRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [targetPool] Name of the target pool to remove health checks from. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeHealthCheck: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/removeHealthCheck',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.removeInstance
     @summary  Removes instance URL from a target pool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsRemoveInstanceRequest} [resource] Data of [::TargetPoolsRemoveInstanceRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to remove instances from. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeInstance: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/removeInstance',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.setBackup
     @summary  Changes a backup target pool's configurations.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Data of [::TargetReference] structure
     @setting {optional Number} [failoverRatio] New failoverRatio value for the target pool.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to set a backup pool for. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setBackup: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetPools/{targetPool}/setBackup',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  }
};


exports.targetSslProxies = {

  /**
     @function targetSslProxies.delete
     @summary  Deletes the specified TargetSslProxy resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetSslProxy] Name of the TargetSslProxy resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies/{targetSslProxy}',
      params: params,
      requiredParams: ['project', 'targetSslProxy'],
      pathParams: ['project', 'targetSslProxy']
    });
  },
  
  /**
     @function targetSslProxies.get
     @summary  Returns the specified TargetSslProxy resource. Get a list of available target SSL proxies by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetSslProxy] Name of the TargetSslProxy resource to return. **Required**
     @return {::TargetSslProxy}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies/{targetSslProxy}',
      params: params,
      requiredParams: ['project', 'targetSslProxy'],
      pathParams: ['project', 'targetSslProxy']
    });
  },
  
  /**
     @function targetSslProxies.insert
     @summary  Creates a TargetSslProxy resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetSslProxy} [resource] Data of [::TargetSslProxy] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetSslProxies.list
     @summary  Retrieves the list of TargetSslProxy resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetSslProxyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetSslProxies.setBackendService
     @summary  Changes the BackendService for TargetSslProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetSslProxiesSetBackendServiceRequest} [resource] Data of [::TargetSslProxiesSetBackendServiceRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetSslProxy] Name of the TargetSslProxy resource whose BackendService resource is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setBackendService: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies/{targetSslProxy}/setBackendService',
      params: params,
      requiredParams: ['project', 'targetSslProxy'],
      pathParams: ['project', 'targetSslProxy']
    });
  },
  
  /**
     @function targetSslProxies.setProxyHeader
     @summary  Changes the ProxyHeaderType for TargetSslProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetSslProxiesSetProxyHeaderRequest} [resource] Data of [::TargetSslProxiesSetProxyHeaderRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetSslProxy] Name of the TargetSslProxy resource whose ProxyHeader is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setProxyHeader: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies/{targetSslProxy}/setProxyHeader',
      params: params,
      requiredParams: ['project', 'targetSslProxy'],
      pathParams: ['project', 'targetSslProxy']
    });
  },
  
  /**
     @function targetSslProxies.setSslCertificates
     @summary  Changes SslCertificates for TargetSslProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetSslProxiesSetSslCertificatesRequest} [resource] Data of [::TargetSslProxiesSetSslCertificatesRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [targetSslProxy] Name of the TargetSslProxy resource whose SslCertificate resource is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setSslCertificates: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/targetSslProxies/{targetSslProxy}/setSslCertificates',
      params: params,
      requiredParams: ['project', 'targetSslProxy'],
      pathParams: ['project', 'targetSslProxy']
    });
  }
};


exports.targetVpnGateways = {

  /**
     @function targetVpnGateways.aggregatedList
     @summary  Retrieves an aggregated list of target VPN gateways.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::TargetVpnGatewayAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/targetVpnGateways',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetVpnGateways.delete
     @summary  Deletes the specified target VPN gateway.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [targetVpnGateway] Name of the target VPN gateway to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetVpnGateways/{targetVpnGateway}',
      params: params,
      requiredParams: ['project', 'region', 'targetVpnGateway'],
      pathParams: ['project', 'region', 'targetVpnGateway']
    });
  },
  
  /**
     @function targetVpnGateways.get
     @summary  Returns the specified target VPN gateway. Get a list of available target VPN gateways by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [targetVpnGateway] Name of the target VPN gateway to return. **Required**
     @return {::TargetVpnGateway}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetVpnGateways/{targetVpnGateway}',
      params: params,
      requiredParams: ['project', 'region', 'targetVpnGateway'],
      pathParams: ['project', 'region', 'targetVpnGateway']
    });
  },
  
  /**
     @function targetVpnGateways.insert
     @summary  Creates a target VPN gateway in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetVpnGateway} [resource] Data of [::TargetVpnGateway] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetVpnGateways',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetVpnGateways.list
     @summary  Retrieves a list of target VPN gateways available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::TargetVpnGatewayList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/targetVpnGateways',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.urlMaps = {

  /**
     @function urlMaps.delete
     @summary  Deletes the specified UrlMap resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.get
     @summary  Returns the specified UrlMap resource. Get a list of available URL maps by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to return. **Required**
     @return {::UrlMap}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.insert
     @summary  Creates a UrlMap resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Data of [::UrlMap] structure
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function urlMaps.invalidateCache
     @summary  Initiates a cache invalidation operation, invalidating the specified path, scoped to the specified UrlMap.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::CacheInvalidationRule} [resource] Data of [::CacheInvalidationRule] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  invalidateCache: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}/invalidateCache',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.list
     @summary  Retrieves the list of UrlMap resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::UrlMapList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function urlMaps.patch
     @summary  Updates the specified UrlMap resource with the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Data of [::UrlMap] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.update
     @summary  Updates the specified UrlMap resource with the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Data of [::UrlMap] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.validate
     @summary  Runs static validation for the UrlMap. In particular, the tests of the provided UrlMap will be run. Calling this method does NOT create the UrlMap.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMapsValidateRequest} [resource] Data of [::UrlMapsValidateRequest] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to be validated as. **Required**
     @return {::UrlMapsValidateResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  validate: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/global/urlMaps/{urlMap}/validate',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  }
};


exports.vpnTunnels = {

  /**
     @function vpnTunnels.aggregatedList
     @summary  Retrieves an aggregated list of VPN tunnels.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::VpnTunnelAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/aggregated/vpnTunnels',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function vpnTunnels.delete
     @summary  Deletes the specified VpnTunnel resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [vpnTunnel] Name of the VpnTunnel resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/vpnTunnels/{vpnTunnel}',
      params: params,
      requiredParams: ['project', 'region', 'vpnTunnel'],
      pathParams: ['project', 'region', 'vpnTunnel']
    });
  },
  
  /**
     @function vpnTunnels.get
     @summary  Returns the specified VpnTunnel resource. Get a list of available VPN tunnels by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @setting {String} [vpnTunnel] Name of the VpnTunnel resource to return. **Required**
     @return {::VpnTunnel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/vpnTunnels/{vpnTunnel}',
      params: params,
      requiredParams: ['project', 'region', 'vpnTunnel'],
      pathParams: ['project', 'region', 'vpnTunnel']
    });
  },
  
  /**
     @function vpnTunnels.insert
     @summary  Creates a VpnTunnel resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::VpnTunnel} [resource] Data of [::VpnTunnel] structure
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/vpnTunnels',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function vpnTunnels.list
     @summary  Retrieves a list of VpnTunnel resources contained in the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region for this request. **Required**
     @return {::VpnTunnelList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/regions/{region}/vpnTunnels',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};


exports.zoneOperations = {

  /**
     @function zoneOperations.delete
     @summary  Deletes the specified zone-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'zone'],
      pathParams: ['operation', 'project', 'zone']
    });
  },
  
  /**
     @function zoneOperations.get
     @summary  Retrieves the specified zone-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'zone'],
      pathParams: ['operation', 'project', 'zone']
    });
  },
  
  /**
     @function zoneOperations.list
     @summary  Retrieves a list of Operation resources contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone for request. **Required**
     @return {::OperationList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}/operations',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};


exports.zones = {

  /**
     @function zones.get
     @summary  Returns the specified Zone resource. Get a list of available zones by making a list() request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone resource to return. **Required**
     @return {::Zone}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones/{zone}',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function zones.list
     @summary  Retrieves the list of Zone resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: field_name comparison_string literal_string.
  
  The field_name is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The comparison_string must be either eq (equals) or ne (not equals). The literal_string is the string value to filter to. The literal value must be valid for the type of field you are filtering by (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, to filter for instances that do not have a name of example-instance, you would use filter=name ne example-instance.
  
  You can filter on nested fields. For example, you could filter on instances that have set the scheduling.automaticRestart field to true. Use filtering on nested fields to take advantage of labels to organize and search for results based on label values.
  
  To filter on multiple expressions, provide each separate expression within parentheses. For example, (scheduling.automaticRestart eq true) (zone eq us-central1-f). Multiple expressions are treated as AND expressions, meaning that resources must match all expressions to pass the filters.
     @setting {optional Integer} [maxResults] The maximum number of results per page that should be returned. If the number of available results is larger than maxResults, Compute Engine returns a nextPageToken that can be used to get the next page of results in subsequent list requests.
     @setting {optional String} [orderBy] Sorts list results by a certain order. By default, results are returned in alphanumerical order based on the resource name.
  
  You can also sort results in descending order based on the creation timestamp using orderBy="creationTimestamp desc". This sorts results based on the creationTimestamp field in reverse chronological order (newest result first). Use this to sort resources like operations so that the newest operation is returned first.
  
  Currently, only sorting by name or creationTimestamp desc is supported.
     @setting {optional String} [pageToken] Specifies a page token to use. Set pageToken to the nextPageToken returned by a previous list request to get the next page of results.
     @setting {String} [project] Project ID for this request. **Required**
     @return {::ZoneList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/compute/v1/projects/{project}/zones',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
