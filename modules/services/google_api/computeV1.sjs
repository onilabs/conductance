// This file was originally generated using conductance/tools/google/generate-google-api compute
/**
  @summary Compute Engine API v1 - API for the Google Compute Engine service.
  @desc
    Revision 20150820

    See also https://developers.google.com/compute/docs/reference/latest/.
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

var API_BASE_URL = 'https://www.googleapis.com/compute/v1/projects/';

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
   @summary String - The static external IP address represented by this resource.
   
   @variable Address.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Address.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Address.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Address.kind
   @summary String - [Output Only] Type of the resource. Always compute#address for addresses.
   
   @variable Address.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
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
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable AddressAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AddressList
   @summary Google API JSON structure
   
   @variable AddressList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable AddressList.items
   @summary Array - [Output Only] A list of Address resources.
   
   @variable AddressList.kind
   @summary String - [Output Only] Type of resource. Always compute#addressList for lists of addresses.
   
   @variable AddressList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
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
   
   @variable AttachedDisk.index
   @summary Integer - Assigns a zero-based index to this disk, where 0 is reserved for the boot disk. For example, if you have many disks attached to an instance, each disk would have a unique index number. If not specified, the server will choose an appropriate value.
   
   @variable AttachedDisk.initializeParams
   @summary [::AttachedDiskInitializeParams] - [Input Only] Specifies the parameters for a new disk that will be created alongside the new instance. Use initialization parameters to create boot disks or local SSDs attached to the new instance.
   
   This property is mutually exclusive with the source property; you can only define one or the other, but not both.
   
   @variable AttachedDisk.interface
   @summary String - undefined
   
   @variable AttachedDisk.kind
   @summary String - [Output Only] Type of the resource. Always compute#attachedDisk for attached disks.
   
   @variable AttachedDisk.licenses
   @summary Array - [Output Only] Any valid publicly visible licenses.
   
   @variable AttachedDisk.mode
   @summary String - The mode in which to attach this disk, either READ_WRITE or READ_ONLY. If not specified, the default is to attach the disk in READ_WRITE mode.
   
   @variable AttachedDisk.source
   @summary String - Specifies a valid partial or full URL to an existing Persistent Disk resource. This field is only applicable for persistent disks.
   
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
   - zones/zone/diskTypes/diskType
   
   @variable AttachedDiskInitializeParams.sourceImage
   @summary String - A source image used to create the disk. You can provide a private (custom) image, and Compute Engine will use the corresponding image from your project. For example:
   
   global/images/my-private-image 
   
   Or you can provide an image from a publicly-available project. For example, to use a Debian image from the debian-cloud project, make sure to include the project in the URL:
   
   projects/debian-cloud/global/images/debian-7-wheezy-vYYYYMMDD 
   
   where vYYYYMMDD is the image version. The fully-qualified URL will also work in both cases.
   
   @class Autoscaler
   @summary Google API JSON structure
   
   @variable Autoscaler.autoscalingPolicy
   @summary [::AutoscalingPolicy] - Autoscaling configuration.
   
   @variable Autoscaler.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Autoscaler.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Autoscaler.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Autoscaler.kind
   @summary String - Type of the resource.
   
   @variable Autoscaler.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Autoscaler.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Autoscaler.target
   @summary String - URL of Instance Group Manager or Replica Pool which will be controlled by Autoscaler.
   
   @variable Autoscaler.zone
   @summary String - [Output Only] URL of the zone where the instance group resides.
   
   @class AutoscalerAggregatedList
   @summary Google API JSON structure
   
   @variable AutoscalerAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable AutoscalerAggregatedList.items
   @summary Object - A map of scoped autoscaler lists.
   
   @variable AutoscalerAggregatedList.kind
   @summary String - Type of resource.
   
   @variable AutoscalerAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable AutoscalerAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AutoscalerList
   @summary Google API JSON structure
   
   @variable AutoscalerList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable AutoscalerList.items
   @summary Array - A list of Autoscaler resources.
   
   @variable AutoscalerList.kind
   @summary String - Type of resource.
   
   @variable AutoscalerList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable AutoscalerList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class AutoscalersScopedList
   @summary Google API JSON structure
   
   @variable AutoscalersScopedList.autoscalers
   @summary Array - List of autoscalers contained in this scope.
   
   @variable AutoscalersScopedList.warning
   @summary Object - Informational warning which replaces the list of autoscalers when the list is empty.
   
   @class AutoscalingPolicy
   @summary Google API JSON structure
   
   @variable AutoscalingPolicy.coolDownPeriodSec
   @summary Integer - The number of seconds that the Autoscaler should wait between two succeeding changes to the number of virtual machines. You should define an interval that is at least as long as the initialization time of a virtual machine and the time it may take for replica pool to create the virtual machine. The default is 60 seconds.
   
   @variable AutoscalingPolicy.cpuUtilization
   @summary [::AutoscalingPolicyCpuUtilization] - TODO(jbartosik): Add support for scaling based on muliple utilization metrics (take max recommendation). Exactly one utilization policy should be provided. Configuration parameters of CPU based autoscaling policy.
   
   @variable AutoscalingPolicy.customMetricUtilizations
   @summary Array - Configuration parameters of autoscaling based on custom metric.
   
   @variable AutoscalingPolicy.loadBalancingUtilization
   @summary [::AutoscalingPolicyLoadBalancingUtilization] - Configuration parameters of autoscaling based on load balancer.
   
   @variable AutoscalingPolicy.maxNumReplicas
   @summary Integer - The maximum number of replicas that the Autoscaler can scale up to. This field is required for config to be effective. Maximum number of replicas should be not lower than minimal number of replicas. Absolute limit for this value is defined in Autoscaler backend.
   
   @variable AutoscalingPolicy.minNumReplicas
   @summary Integer - The minimum number of replicas that the Autoscaler can scale down to. Can't be less than 0. If not provided Autoscaler will choose default value depending on maximal number of replicas.
   
   @class AutoscalingPolicyCpuUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyCpuUtilization.utilizationTarget
   @summary Number - The target utilization that the Autoscaler should maintain. It is represented as a fraction of used cores. For example: 6 cores used in 8-core VM are represented here as 0.75. Must be a float value between (0, 1]. If not defined, the default is 0.8.
   
   @class AutoscalingPolicyCustomMetricUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyCustomMetricUtilization.metric
   @summary String - Identifier of the metric. It should be a Cloud Monitoring metric. The metric can not have negative values. The metric should be an utilization metric (increasing number of VMs handling requests x times should reduce average value of the metric roughly x times). For example you could use: compute.googleapis.com/instance/network/received_bytes_count.
   
   @variable AutoscalingPolicyCustomMetricUtilization.utilizationTarget
   @summary Number - Target value of the metric which Autoscaler should maintain. Must be a positive value.
   
   @variable AutoscalingPolicyCustomMetricUtilization.utilizationTargetType
   @summary String - Defines type in which utilization_target is expressed.
   
   @class AutoscalingPolicyLoadBalancingUtilization
   @summary Google API JSON structure
   
   @variable AutoscalingPolicyLoadBalancingUtilization.utilizationTarget
   @summary Number - Fraction of backend capacity utilization (set in HTTP load balancing configuration) that Autoscaler should maintain. Must be a positive float value. If not defined, the default is 0.8. For example if your maxRatePerInstance capacity (in HTTP Load Balancing configuration) is set at 10 and you would like to keep number of instances such that each instance receives 7 QPS on average, set this to 0.7.
   
   @class Backend
   @summary Google API JSON structure
   
   @variable Backend.balancingMode
   @summary String - Specifies the balancing mode for this backend. The default is UTILIZATION but available values are UTILIZATION and RATE.
   
   @variable Backend.capacityScaler
   @summary Number - A multiplier applied to the group's maximum servicing capacity (either UTILIZATION or RATE). Default value is 1, which means the group will serve up to 100% of its configured CPU or RPS (depending on balancingMode). A setting of 0 means the group is completely drained, offering 0% of its available CPU or RPS. Valid range is [0.0,1.0].
   
   @variable Backend.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable Backend.group
   @summary String - The fully-qualified URL of a zonal Instance Group resource. This instance group defines the list of instances that serve traffic. Member virtual machine instances from each instance group must live in the same zone as the instance group itself. No two backends in a backend service are allowed to use same Instance Group resource.
   
   Note that you must specify an Instance Group resource using the fully-qualified URL, rather than a partial URL.
   
   @variable Backend.maxRate
   @summary Integer - The max RPS of the group. Can be used with either balancing mode, but required if RATE mode. For RATE mode, either maxRate or maxRatePerInstance must be set.
   
   @variable Backend.maxRatePerInstance
   @summary Number - The max RPS that a single backed instance can handle. This is used to calculate the capacity of the group. Can be used in either balancing mode. For RATE mode, either maxRate or maxRatePerInstance must be set.
   
   @variable Backend.maxUtilization
   @summary Number - Used when balancingMode is UTILIZATION. This ratio defines the CPU utilization target for the group. The default is 0.8. Valid range is [0.0, 1.0].
   
   @class BackendService
   @summary Google API JSON structure
   
   @variable BackendService.backends
   @summary Array - The list of backends that serve this BackendService.
   
   @variable BackendService.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable BackendService.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable BackendService.fingerprint
   @summary String - Fingerprint of this resource. A hash of the contents stored in this object. This field is used in optimistic locking. This field will be ignored when inserting a BackendService. An up-to-date fingerprint must be provided in order to update the BackendService.
   
   @variable BackendService.healthChecks
   @summary Array - The list of URLs to the HttpHealthCheck resource for health checking this BackendService. Currently at most one health check can be specified, and a health check is required.
   
   @variable BackendService.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable BackendService.kind
   @summary String - [Output Only] Type of resource. Always compute#backendService for backend services.
   
   @variable BackendService.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable BackendService.port
   @summary Integer - Deprecated in favor of port name. The TCP port to connect on the backend. The default value is 80.
   
   @variable BackendService.portName
   @summary String - Name of backend port. The same name should appear in the resource views referenced by this service. Required.
   
   @variable BackendService.protocol
   @summary String - undefined
   
   @variable BackendService.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable BackendService.timeoutSec
   @summary Integer - How many seconds to wait for the backend before considering it a failed request. Default is 30 seconds.
   
   @class BackendServiceGroupHealth
   @summary Google API JSON structure
   
   @variable BackendServiceGroupHealth.healthStatus
   @summary Array - undefined
   
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
   
   @class DeprecationStatus
   @summary Google API JSON structure
   
   @variable DeprecationStatus.deleted
   @summary String - An optional RFC3339 timestamp on or after which the deprecation state of this resource will be changed to DELETED.
   
   @variable DeprecationStatus.deprecated
   @summary String - An optional RFC3339 timestamp on or after which the deprecation state of this resource will be changed to DEPRECATED.
   
   @variable DeprecationStatus.obsolete
   @summary String - An optional RFC3339 timestamp on or after which the deprecation state of this resource will be changed to OBSOLETE.
   
   @variable DeprecationStatus.replacement
   @summary String - The URL of the suggested replacement for a deprecated resource. The suggested replacement resource must be the same kind of resource as the deprecated resource.
   
   @variable DeprecationStatus.state
   @summary String - The deprecation state of this resource. This can be DEPRECATED, OBSOLETE, or DELETED. Operations which create a new resource using a DEPRECATED resource will return successfully, but with a warning indicating the deprecated resource and recommending its replacement. Operations which use OBSOLETE or DELETED resources will be rejected and result in an error.
   
   @class Disk
   @summary Google API JSON structure
   
   @variable Disk.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Disk.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Disk.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Disk.kind
   @summary String - [Output Only] Type of the resource. Always compute#disk for disks.
   
   @variable Disk.lastAttachTimestamp
   @summary String - [Output Only] Last attach timestamp in RFC3339 text format.
   
   @variable Disk.lastDetachTimestamp
   @summary String - [Output Only] Last detach timestamp in RFC3339 text format.
   
   @variable Disk.licenses
   @summary Array - Any applicable publicly visible licenses.
   
   @variable Disk.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Disk.options
   @summary String - Internal use only.
   
   @variable Disk.selfLink
   @summary String - [Output Only] Server-defined fully-qualified URL for this resource.
   
   @variable Disk.sizeGb
   @summary String - Size of the persistent disk, specified in GB. You can specify this field when creating a persistent disk using the sourceImage or sourceSnapshot parameter, or specify it alone to create an empty persistent disk.
   
   If you specify this field along with sourceImage or sourceSnapshot, the value of sizeGb must not be less than the size of the sourceImage or the size of the snapshot.
   
   @variable Disk.sourceImage
   @summary String - The source image used to create this disk. If the source image is deleted from the system, this field will not be set, even if an image with the same name has been re-created.
   
   When creating a disk, you can provide a private (custom) image using the following input, and Compute Engine will use the corresponding image from your project. For example:
   
   global/images/my-private-image 
   
   Or you can provide an image from a publicly-available project. For example, to use a Debian image from the debian-cloud project, make sure to include the project in the URL:
   
   projects/debian-cloud/global/images/debian-7-wheezy-vYYYYMMDD 
   
   where vYYYYMMDD is the image version. The fully-qualified URL will also work in both cases.
   
   @variable Disk.sourceImageId
   @summary String - The ID value of the image used to create this disk. This value identifies the exact image that was used to create this persistent disk. For example, if you created the persistent disk from an image that was later deleted and recreated under the same name, the source image ID would identify the exact version of the image that was used.
   
   @variable Disk.sourceSnapshot
   @summary String - The source snapshot used to create this disk. You can provide this as a partial or full URL to the resource. For example, the following are valid values:  
   - https://www.googleapis.com/compute/v1/projects/project/global/snapshots/snapshot 
   - projects/project/global/snapshots/snapshot 
   - global/snapshots/snapshot
   
   @variable Disk.sourceSnapshotId
   @summary String - [Output Only] The unique ID of the snapshot used to create this disk. This value identifies the exact snapshot that was used to create this persistent disk. For example, if you created the persistent disk from a snapshot that was later deleted and recreated under the same name, the source snapshot ID would identify the exact version of the snapshot that was used.
   
   @variable Disk.status
   @summary String - [Output Only] The status of disk creation. Applicable statuses includes: CREATING, FAILED, READY, RESTORING.
   
   @variable Disk.type
   @summary String - URL of the disk type resource describing which disk type to use to create the disk; provided by the client when the disk is created.
   
   @variable Disk.users
   @summary Array - Links to the users of the disk (attached instances) in form: project/zones/zone/instances/instance
   
   @variable Disk.zone
   @summary String - [Output Only] URL of the zone where the disk resides.
   
   @class DiskAggregatedList
   @summary Google API JSON structure
   
   @variable DiskAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable DiskAggregatedList.items
   @summary Object - [Output Only] A map of scoped disk lists.
   
   @variable DiskAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskAggregatedList for aggregated lists of persistent disks.
   
   @variable DiskAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable DiskAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskList
   @summary Google API JSON structure
   
   @variable DiskList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable DiskList.items
   @summary Array - [Output Only] A list of persistent disks.
   
   @variable DiskList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskList for lists of disks.
   
   @variable DiskList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable DiskList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskMoveRequest
   @summary Google API JSON structure
   
   @variable DiskMoveRequest.destinationZone
   @summary String - The URL of the destination zone to move the disk to. This can be a full or partial URL. For example, the following are all valid URLs to a zone:  
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
   @summary String - [Output Only] An optional textual description of the resource.
   
   @variable DiskType.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
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
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable DiskTypeAggregatedList.items
   @summary Object - [Output Only] A map of scoped disk type lists.
   
   @variable DiskTypeAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskTypeAggregatedList.
   
   @variable DiskTypeAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable DiskTypeAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskTypeList
   @summary Google API JSON structure
   
   @variable DiskTypeList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable DiskTypeList.items
   @summary Array - [Output Only] A list of Disk Type resources.
   
   @variable DiskTypeList.kind
   @summary String - [Output Only] Type of resource. Always compute#diskTypeList for disk types.
   
   @variable DiskTypeList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable DiskTypeList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class DiskTypesScopedList
   @summary Google API JSON structure
   
   @variable DiskTypesScopedList.diskTypes
   @summary Array - [Output Only] List of disk types contained in this scope.
   
   @variable DiskTypesScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of disk types when the list is empty.
   
   @class DisksScopedList
   @summary Google API JSON structure
   
   @variable DisksScopedList.disks
   @summary Array - [Output Only] List of disks contained in this scope.
   
   @variable DisksScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of disks when the list is empty.
   
   @class Firewall
   @summary Google API JSON structure
   
   @variable Firewall.allowed
   @summary Array - The list of rules specified by this firewall. Each rule specifies a protocol and port-range tuple that describes a permitted connection.
   
   @variable Firewall.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Firewall.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Firewall.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Firewall.kind
   @summary String - [Output Ony] Type of the resource. Always compute#firewall for firewall rules.
   
   @variable Firewall.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Firewall.network
   @summary String - URL of the network resource for this firewall rule. This field is required for creating an instance but optional when creating a firewall rule. If not specified when creating a firewall rule, the default network is used:
   global/networks/default
   If you choose to specify this property, you can specify the network as a full or partial URL. For example, the following are all valid URLs:  
   - https://www.googleapis.com/compute/v1/projects/myproject/global/networks/my-network 
   - projects/myproject/global/networks/my-network 
   - global/networks/default
   
   @variable Firewall.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Firewall.sourceRanges
   @summary Array - The IP address blocks that this rule applies to, expressed in CIDR format. One or both of sourceRanges and sourceTags may be set.
   
   If both properties are set, an inbound connection is allowed if the range matches the sourceRanges OR the tag of the source matches the sourceTags property. The connection does not need to match both properties.
   
   @variable Firewall.sourceTags
   @summary Array - A list of instance tags which this rule applies to. One or both of sourceRanges and sourceTags may be set.
   
   If both properties are set, an inbound connection is allowed if the range matches the sourceRanges OR the tag of the source matches the sourceTags property. The connection does not need to match both properties.
   
   @variable Firewall.targetTags
   @summary Array - A list of instance tags indicating sets of instances located in the network that may make network connections as specified in allowed[]. If no targetTags are specified, the firewall rule applies to all instances on the specified network.
   
   @class FirewallList
   @summary Google API JSON structure
   
   @variable FirewallList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable FirewallList.items
   @summary Array - [Output Only] A list of Firewall resources.
   
   @variable FirewallList.kind
   @summary String - [Output Only] Type of resource. Always compute#firewallList for lists of firewalls.
   
   @variable FirewallList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable FirewallList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ForwardingRule
   @summary Google API JSON structure
   
   @variable ForwardingRule.IPAddress
   @summary String - Value of the reserved IP address that this forwarding rule is serving on behalf of. For global forwarding rules, the address must be a global IP; for regional forwarding rules, the address must live in the same region as the forwarding rule. If left empty (default value), an ephemeral IP from the same scope (global or regional) will be assigned.
   
   @variable ForwardingRule.IPProtocol
   @summary String - The IP protocol to which this rule applies. Valid options are TCP, UDP, ESP, AH or SCTP.
   
   @variable ForwardingRule.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable ForwardingRule.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable ForwardingRule.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable ForwardingRule.kind
   @summary String - Type of the resource.
   
   @variable ForwardingRule.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable ForwardingRule.portRange
   @summary String - Applicable only when `IPProtocol` is TCP, UDP, or SCTP, only packets addressed to ports in the specified range will be forwarded to target. If portRange is left empty (default value), all ports are forwarded. Forwarding rules with the same `[IPAddress, IPProtocol]` pair must have disjoint port ranges.
   
   @variable ForwardingRule.region
   @summary String - [Output Only] URL of the region where the regional forwarding rule resides. This field is not applicable to global forwarding rules.
   
   @variable ForwardingRule.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable ForwardingRule.target
   @summary String - The URL of the target resource to receive the matched traffic. For regional forwarding rules, this target must live in the same region as the forwarding rule. For global forwarding rules, this target must be a global TargetHttpProxy or TargetHttpsProxy resource.
   
   @class ForwardingRuleAggregatedList
   @summary Google API JSON structure
   
   @variable ForwardingRuleAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable ForwardingRuleAggregatedList.items
   @summary Object - A map of scoped forwarding rule lists.
   
   @variable ForwardingRuleAggregatedList.kind
   @summary String - Type of resource.
   
   @variable ForwardingRuleAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
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
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable ForwardingRuleList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ForwardingRulesScopedList
   @summary Google API JSON structure
   
   @variable ForwardingRulesScopedList.forwardingRules
   @summary Array - List of forwarding rules contained in this scope.
   
   @variable ForwardingRulesScopedList.warning
   @summary Object - Informational warning which replaces the list of forwarding rules when the list is empty.
   
   @class HealthCheckReference
   @summary Google API JSON structure
   
   @variable HealthCheckReference.healthCheck
   @summary String - undefined
   
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
   @summary String - An optional textual description.
   
   @variable HostRule.hosts
   @summary Array - The list of host patterns to match. They must be valid hostnames except that they may start with *. or *-. The * acts like a glob and will match any string of atoms (separated by .s and -s) to the left.
   
   @variable HostRule.pathMatcher
   @summary String - The name of the PathMatcher to match the path portion of the URL, if the this hostRule matches the URL's host portion.
   
   @class HttpHealthCheck
   @summary Google API JSON structure
   
   @variable HttpHealthCheck.checkIntervalSec
   @summary Integer - How often (in seconds) to send a health check. The default value is 5 seconds.
   
   @variable HttpHealthCheck.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable HttpHealthCheck.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable HttpHealthCheck.healthyThreshold
   @summary Integer - A so-far unhealthy instance will be marked healthy after this many consecutive successes. The default value is 2.
   
   @variable HttpHealthCheck.host
   @summary String - The value of the host header in the HTTP health check request. If left empty (default value), the public IP on behalf of which this health check is performed will be used.
   
   @variable HttpHealthCheck.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable HttpHealthCheck.kind
   @summary String - Type of the resource.
   
   @variable HttpHealthCheck.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable HttpHealthCheck.port
   @summary Integer - The TCP port number for the HTTP health check request. The default value is 80.
   
   @variable HttpHealthCheck.requestPath
   @summary String - The request path of the HTTP health check request. The default value is "/".
   
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
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable HttpHealthCheckList.selfLink
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
   @summary String - Textual description of the resource; provided by the client when the resource is created.
   
   @variable Image.diskSizeGb
   @summary String - Size of the image when restored onto a persistent disk (in GB).
   
   @variable Image.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Image.kind
   @summary String - [Output Only] Type of the resource. Always compute#image for images.
   
   @variable Image.licenses
   @summary Array - Any applicable publicly visible licenses.
   
   @variable Image.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Image.rawDisk
   @summary Object - The parameters of the raw disk image.
   
   @variable Image.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Image.sourceDisk
   @summary String - URL of the The source disk used to create this image. This can be a full or valid partial URL. You must provide either this property or the rawDisk.source property but not both to create an image. For example, the following are valid values:  
   - https://www.googleapis.com/compute/v1/projects/project/zones/zone/disk/disk 
   - projects/project/zones/zone/disk/disk 
   - zones/zone/disks/disk
   
   @variable Image.sourceDiskId
   @summary String - The ID value of the disk used to create this image. This value may be used to determine whether the image was taken from the current or a previous instance of a given disk name.
   
   @variable Image.sourceType
   @summary String - The type of the image used to create this disk. The default and only value is RAW
   
   @variable Image.status
   @summary String - [Output Only] The status of the image. An image can be used to create other resources, such as instances, only after the image has been successfully created and the status is set to READY. Possible values are FAILED, PENDING, or READY.
   
   @class ImageList
   @summary Google API JSON structure
   
   @variable ImageList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable ImageList.items
   @summary Array - A list of Image resources.
   
   @variable ImageList.kind
   @summary String - Type of resource.
   
   @variable ImageList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
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
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Instance.disks
   @summary Array - Array of disks associated with this instance. Persistent disks must be created before you can assign them.
   
   @variable Instance.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Instance.kind
   @summary String - [Output Only] Type of the resource. Always compute#instance for instances.
   
   @variable Instance.machineType
   @summary String - Full or partial URL of the machine type resource to use for this instance. This is provided by the client when the instance is created. For example, the following is a valid partial url:
   
   zones/zone/machineTypes/machine-type
   
   @variable Instance.metadata
   @summary [::Metadata] - The metadata key/value pairs assigned to this instance. This includes custom metadata and predefined keys.
   
   @variable Instance.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Instance.networkInterfaces
   @summary Array - An array of configurations for this interface. This specifies how this interface is configured to interact with other network services, such as connecting to the internet.
   
   @variable Instance.scheduling
   @summary [::Scheduling] - Scheduling options for this instance.
   
   @variable Instance.selfLink
   @summary String - [Output Only] Server defined URL for this resource.
   
   @variable Instance.serviceAccounts
   @summary Array - A list of service accounts, with their specified scopes, authorized for this instance. Service accounts generate access tokens that can be accessed through the metadata server and used to authenticate applications on the instance. See Authenticating from Google Compute Engine for more information.
   
   @variable Instance.status
   @summary String - [Output Only] The status of the instance. One of the following values: PROVISIONING, STAGING, RUNNING, STOPPING, and TERMINATED.
   
   @variable Instance.statusMessage
   @summary String - [Output Only] An optional, human-readable explanation of the status.
   
   @variable Instance.tags
   @summary [::Tags] - A list of tags to appy to this instance. Tags are used to identify valid sources or targets for network firewalls and are specified by the client during instance creation. The tags can be later modified by the setTags method. Each tag within the list must comply with RFC1035.
   
   @variable Instance.zone
   @summary String - [Output Only] URL of the zone where the instance resides.
   
   @class InstanceAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable InstanceAggregatedList.items
   @summary Object - [Output Only] A map of scoped instance lists.
   
   @variable InstanceAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#instanceAggregatedList for aggregated lists of Instance resources.
   
   @variable InstanceAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable InstanceAggregatedList.selfLink
   @summary String - [Output Only] Server defined URL for this resource.
   
   @class InstanceGroup
   @summary Google API JSON structure
   
   @variable InstanceGroup.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this instance group in RFC3339 text format.
   
   @variable InstanceGroup.description
   @summary String - An optional text description for the instance group.
   
   @variable InstanceGroup.fingerprint
   @summary String - [Output Only] The fingerprint of the named ports information. The system uses this fingerprint to detect conflicts when multiple users change the named ports information concurrently.
   
   @variable InstanceGroup.id
   @summary String - [Output Only] A unique identifier for this instance group. The server defines this identifier.
   
   @variable InstanceGroup.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroup for instance groups.
   
   @variable InstanceGroup.name
   @summary String - The name of the instance group. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable InstanceGroup.namedPorts
   @summary Array - Assigns a name to a port number. For example: {name: ?http?, port: 80} This allows the system to reference ports by the assigned name instead of a port number. Named ports can also contain multiple ports. For example: [{name: ?http?, port: 80},{name: "http", port: 8080}] Named ports apply to all instances in this instance group.
   
   @variable InstanceGroup.network
   @summary String - The URL of the network to which all instances in the instance group belong.
   
   @variable InstanceGroup.selfLink
   @summary String - [Output Only] The URL for this instance group. The server defines this URL.
   
   @variable InstanceGroup.size
   @summary Integer - [Output Only] The total number of instances in the instance group.
   
   @variable InstanceGroup.zone
   @summary String - The URL of the zone where the instance group is located.
   
   @class InstanceGroupAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceGroupAggregatedList.id
   @summary String - [Output Only] A unique identifier for this aggregated list of instance groups. The server defines this identifier.
   
   @variable InstanceGroupAggregatedList.items
   @summary Object - A map of scoped instance group lists.
   
   @variable InstanceGroupAggregatedList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupAggregatedList for aggregated lists of instance groups.
   
   @variable InstanceGroupAggregatedList.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceGroupAggregatedList.selfLink
   @summary String - [Output Only] A unique identifier for this aggregated list of instance groups. The server defines this identifier.
   
   @class InstanceGroupList
   @summary Google API JSON structure
   
   @variable InstanceGroupList.id
   @summary String - [Output Only] A unique identifier for this list of instance groups. The server defines this identifier.
   
   @variable InstanceGroupList.items
   @summary Array - A list of InstanceGroup resources.
   
   @variable InstanceGroupList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupList for instance group lists.
   
   @variable InstanceGroupList.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceGroupList.selfLink
   @summary String - [Output Only] The URL for this instance group. The server defines this URL.
   
   @class InstanceGroupManager
   @summary Google API JSON structure
   
   @variable InstanceGroupManager.baseInstanceName
   @summary String - The base instance name to use for instances in this group. The value must be 1-58 characters long. Instances are named by appending a hyphen and a random four-character string to the base instance name. The base instance name must comply with RFC1035.
   
   @variable InstanceGroupManager.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this managed instance group in RFC3339 text format.
   
   @variable InstanceGroupManager.currentActions
   @summary [::InstanceGroupManagerActionsSummary] - [Output Only] The list of instance actions and the number of instances in this managed instance group that are scheduled for those actions.
   
   @variable InstanceGroupManager.description
   @summary String - An optional text description for the managed instance group.
   
   @variable InstanceGroupManager.fingerprint
   @summary String - [Output Only] The fingerprint of the target pools information, which is a hash of the contents. This field is used for optimistic locking when updating the target pool entries.
   
   @variable InstanceGroupManager.id
   @summary String - [Output Only] A unique identifier for this managed instance group. The server defines this identifier.
   
   @variable InstanceGroupManager.instanceGroup
   @summary String - [Output Only] The URL of the InstanceGroup resource.
   
   @variable InstanceGroupManager.instanceTemplate
   @summary String - The URL of the instance template that is specified for this managed instance group. The group uses this template to create all new instances in the managed instance group.
   
   @variable InstanceGroupManager.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupManager for managed instance groups.
   
   @variable InstanceGroupManager.name
   @summary String - The name of the managed instance group. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable InstanceGroupManager.selfLink
   @summary String - [Output Only] Server-defined URL for this managed instance group.
   
   @variable InstanceGroupManager.targetPools
   @summary Array - The URLs of all TargetPool resources to which new instances in the instanceGroup field are added. Updating the target pool values does not affect existing instances.
   
   @variable InstanceGroupManager.targetSize
   @summary Integer - The target number of running instances for this managed instance group. Deleting or abandoning instances reduces this number. Resizing the group changes this number.
   
   @variable InstanceGroupManager.zone
   @summary String - The URL of the zone where the managed instance group is located.
   
   @class InstanceGroupManagerActionsSummary
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerActionsSummary.abandoning
   @summary Integer - [Output Only] Total number of instances in the managed instance group that are scheduled to be abandoned. Abandoning an instance removes it from the managed instance group without deleting it.
   
   @variable InstanceGroupManagerActionsSummary.creating
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be created or are currently being created.
   
   @variable InstanceGroupManagerActionsSummary.deleting
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be deleted or are currently being deleted.
   
   @variable InstanceGroupManagerActionsSummary.none
   @summary Integer - [Output Only] The number of instances in the managed instance group that currently have no scheduled actions.
   
   @variable InstanceGroupManagerActionsSummary.recreating
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be recreated or are currently being being recreated. Recreating an instance deletes the existing root persistent disk and creates a new disk from the image that is defined in the instance template.
   
   @variable InstanceGroupManagerActionsSummary.refreshing
   @summary Integer - [Output Only] The number of instances in the managed instance group that are being reconfigured with properties that do not require a restart or a recreate action. For example, setting or removing target pools for the instance.
   
   @variable InstanceGroupManagerActionsSummary.restarting
   @summary Integer - [Output Only] The number of instances in the managed instance group that are scheduled to be restarted or are currently being restarted.
   
   @class InstanceGroupManagerAggregatedList
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerAggregatedList.id
   @summary String - [Output Only] A unique identifier for this aggregated list of managed instance groups. The server defines this identifier.
   
   @variable InstanceGroupManagerAggregatedList.items
   @summary Object - A map of filtered managed instance group lists.
   
   @variable InstanceGroupManagerAggregatedList.kind
   @summary String - [Output Only] Type of the resource. Always compute#instanceGroupManagerAggregatedList for an aggregated list of managed instance groups.
   
   @variable InstanceGroupManagerAggregatedList.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceGroupManagerAggregatedList.selfLink
   @summary String - [Output Only] The URL for this aggregated list of managed instance groups. The server defines this URL.
   
   @class InstanceGroupManagerList
   @summary Google API JSON structure
   
   @variable InstanceGroupManagerList.id
   @summary String - [Output Only] A unique identifier for this managed instance group. The server defines this identifier.
   
   @variable InstanceGroupManagerList.items
   @summary Array - [Output Only] A list of managed instance group resources.
   
   @variable InstanceGroupManagerList.kind
   @summary String - [Output Only] Type of the resource. Always compute#instanceGroupManagerList for a list of managed instance group resources.
   
   @variable InstanceGroupManagerList.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceGroupManagerList.selfLink
   @summary String - [Output Only] The URL for this managed instance group. The server defines this URL.
   
   @class InstanceGroupManagersAbandonInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersAbandonInstancesRequest.instances
   @summary Array - The names of instances to abandon from the managed instance group.
   
   @class InstanceGroupManagersDeleteInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersDeleteInstancesRequest.instances
   @summary Array - The names of one or more instances to delete.
   
   @class InstanceGroupManagersListManagedInstancesResponse
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersListManagedInstancesResponse.managedInstances
   @summary Array - List of managed instances. If empty - all instances are listed.
   
   @class InstanceGroupManagersRecreateInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupManagersRecreateInstancesRequest.instances
   @summary Array - The names of one or more instances to recreate.
   
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
   @summary String - The fingerprint of the target pools information, which is a hash of the contents. This field is used for optimistic locking when updating the target pool entries.
   
   @variable InstanceGroupManagersSetTargetPoolsRequest.targetPools
   @summary Array - The list of target pool URLs that instances in this managed instance group belong to. When the managed instance group creates new instances, the group automatically adds those instances to the target pools that are specified in this parameter. Changing the value of this parameter does not change the target pools of existing instances in this managed instance group.
   
   @class InstanceGroupsAddInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsAddInstancesRequest.instances
   @summary Array - The instances to add to the instance group.
   
   @class InstanceGroupsListInstances
   @summary Google API JSON structure
   
   @variable InstanceGroupsListInstances.id
   @summary String - [Output Only] A unique identifier for this list of instance groups. The server defines this identifier.
   
   @variable InstanceGroupsListInstances.items
   @summary Array - A list of InstanceWithNamedPorts resources, which contains all named ports for the given instance.
   
   @variable InstanceGroupsListInstances.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceGroupsListInstances for lists of instance groups.
   
   @variable InstanceGroupsListInstances.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceGroupsListInstances.selfLink
   @summary String - [Output Only] The URL for this list of instance groups. The server defines this URL.
   
   @class InstanceGroupsListInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsListInstancesRequest.instanceState
   @summary String - A filter for the state of the instances in the instance group. Valid options are ALL or RUNNING. If you do not specify this parameter the list includes all instances regardless of their state.
   
   @class InstanceGroupsRemoveInstancesRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsRemoveInstancesRequest.instances
   @summary Array - The instances to remove from the instance group.
   
   @class InstanceGroupsScopedList
   @summary Google API JSON structure
   
   @variable InstanceGroupsScopedList.instanceGroups
   @summary Array - [Output Only] The list of instance groups that are contained in this scope.
   
   @variable InstanceGroupsScopedList.warning
   @summary Object - [Output Only] An informational warning that replaces the list of instance groups when the list is empty.
   
   @class InstanceGroupsSetNamedPortsRequest
   @summary Google API JSON structure
   
   @variable InstanceGroupsSetNamedPortsRequest.fingerprint
   @summary String - The fingerprint of the named ports information, which is a hash of the contents. Use this field for optimistic locking when you update the named ports entries.
   
   @variable InstanceGroupsSetNamedPortsRequest.namedPorts
   @summary Array - The list of named ports to set for this instance group.
   
   @class InstanceList
   @summary Google API JSON structure
   
   @variable InstanceList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable InstanceList.items
   @summary Array - [Output Only] A list of Instance resources.
   
   @variable InstanceList.kind
   @summary String - [Output Only] Type of resource. Always compute#instanceList for lists of Instance resources.
   
   @variable InstanceList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable InstanceList.selfLink
   @summary String - [Output Only] Server defined URL for this resource.
   
   @class InstanceMoveRequest
   @summary Google API JSON structure
   
   @variable InstanceMoveRequest.destinationZone
   @summary String - The URL of the destination zone to move the instance to. This can be a full or partial URL. For example, the following are all valid URLs to a zone:  
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
   @summary Boolean - A boolean that specifies if instances created from this template can send packets with source IP addresses other than their own or receive packets with destination IP addresses other than their own. If you use these instances as an IP gateway or as the next-hop in a Route resource, specify true. Otherwise, specify false.
   
   @variable InstanceProperties.description
   @summary String - An optional text description for the instances that are created from this instance template.
   
   @variable InstanceProperties.disks
   @summary Array - An array of disks that are associated with the instances that are created from this template.
   
   @variable InstanceProperties.machineType
   @summary String - The machine type to use for instances that are created from this template.
   
   @variable InstanceProperties.metadata
   @summary [::Metadata] - The metadata key/value pairs to assign to instances that are created from this template. These pairs can consist of custom metadata or predefined keys. See Project and instance metadata for more information.
   
   @variable InstanceProperties.networkInterfaces
   @summary Array - An array of network access configurations for this interface. This specifies how this interface is configured to interact with other network services, such as connecting to the internet. Currently, ONE_TO_ONE_NAT is the only supported access configuration. If you do not specify any access configurations, the instances that are created from this template will have no external internet access.
   
   @variable InstanceProperties.scheduling
   @summary [::Scheduling] - A list of scheduling options for the instances that are created from this template.
   
   @variable InstanceProperties.serviceAccounts
   @summary Array - A list of service accounts with specified scopes. Access tokens for these service accounts are available to the instances that are created from this template. Use metadata queries to obtain the access tokens for these instances.
   
   @variable InstanceProperties.tags
   @summary [::Tags] - A list of tags to apply to the instances that are created from this template. The tags identify valid sources or targets for network firewalls. The setTags method can modify this list of tags. Each tag within the list must comply with RFC1035.
   
   @class InstanceReference
   @summary Google API JSON structure
   
   @variable InstanceReference.instance
   @summary String - undefined
   
   @class InstanceTemplate
   @summary Google API JSON structure
   
   @variable InstanceTemplate.creationTimestamp
   @summary String - [Output Only] The creation timestamp for this instance template in RFC3339 text format.
   
   @variable InstanceTemplate.description
   @summary String - An optional text description for the instance template.
   
   @variable InstanceTemplate.id
   @summary String - [Output Only] A unique identifier for this instance template. The server defines this identifier.
   
   @variable InstanceTemplate.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceTemplate for instance templates.
   
   @variable InstanceTemplate.name
   @summary String - The name of the instance template. The name must be 1-63 characters long, and comply with RFC1035.
   
   @variable InstanceTemplate.properties
   @summary [::InstanceProperties] - The instance properties for the instance template resource.
   
   @variable InstanceTemplate.selfLink
   @summary String - [Output Only] The URL for this instance template. The server defines this URL.
   
   @class InstanceTemplateList
   @summary Google API JSON structure
   
   @variable InstanceTemplateList.id
   @summary String - [Output Only] A unique identifier for this instance template. The server defines this identifier.
   
   @variable InstanceTemplateList.items
   @summary Array - A list of InstanceTemplate resources.
   
   @variable InstanceTemplateList.kind
   @summary String - [Output Only] The resource type, which is always compute#instanceTemplatesListResponse for instance template lists.
   
   @variable InstanceTemplateList.nextPageToken
   @summary String - [Output Only] A token that is used to continue a truncated list request.
   
   @variable InstanceTemplateList.selfLink
   @summary String - [Output Only] The URL for this instance template list. The server defines this URL.
   
   @class InstanceWithNamedPorts
   @summary Google API JSON structure
   
   @variable InstanceWithNamedPorts.instance
   @summary String - The URL of the instance.
   
   @variable InstanceWithNamedPorts.namedPorts
   @summary Array - The named ports that belong to this instance group.
   
   @variable InstanceWithNamedPorts.status
   @summary String - The status of the instance.
   
   @class InstancesScopedList
   @summary Google API JSON structure
   
   @variable InstancesScopedList.instances
   @summary Array - [Output Only] List of instances contained in this scope.
   
   @variable InstancesScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of instances when the list is empty.
   
   @class License
   @summary Google API JSON structure
   
   @variable License.chargesUseFee
   @summary Boolean - If true, the customer will be charged license fee for running software that contains this license on an instance.
   
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
   @summary Integer - [Output Only] The tumber of CPUs exposed to the instance.
   
   @variable MachineType.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable MachineType.imageSpaceGb
   @summary Integer - [Deprecated] This property is deprecated and will never be populated with any relevant values.
   
   @variable MachineType.kind
   @summary String - Type of the resource.
   
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
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable MachineTypeAggregatedList.items
   @summary Object - [Output Only] A map of scoped machine type lists.
   
   @variable MachineTypeAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#machineTypeAggregatedList for aggregated lists of machine types.
   
   @variable MachineTypeAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable MachineTypeAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class MachineTypeList
   @summary Google API JSON structure
   
   @variable MachineTypeList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable MachineTypeList.items
   @summary Array - [Output Only] A list of Machine Type resources.
   
   @variable MachineTypeList.kind
   @summary String - [Output Only] Type of resource. Always compute#machineTypeList for lists of machine types.
   
   @variable MachineTypeList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
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
   @summary String - The current action that the managed instance group has scheduled for the instance.
   
   @variable ManagedInstance.id
   @summary String - The unique identifier for this resource (empty when instance does not exist).
   
   @variable ManagedInstance.instance
   @summary String - The URL of the instance (set even though instance does not exist yet).
   
   @variable ManagedInstance.instanceStatus
   @summary String - The status of the instance (empty when instance does not exist).
   
   @variable ManagedInstance.lastAttempt
   @summary [::ManagedInstanceLastAttempt] - Information about the last attempt to create or delete the instance.
   
   @class ManagedInstanceLastAttempt
   @summary Google API JSON structure
   
   @variable ManagedInstanceLastAttempt.errors
   @summary Object - Encountered errors during the last attempt to create or delete the instance.
   
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
   @summary String - The name for this NamedPort.
   
   @variable NamedPort.port
   @summary Integer - The port number, which can be a value between 1 and 65535.
   
   @class Network
   @summary Google API JSON structure
   
   @variable Network.IPv4Range
   @summary String - The range of internal addresses that are legal on this network. This range is a CIDR specification, for example: 192.168.0.0/16. Provided by the client when the network is created.
   
   @variable Network.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Network.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable Network.gatewayIPv4
   @summary String - A gateway address for default routing to other networks. This value is read only and is selected by the Google Compute Engine, typically as the first usable address in the IPv4Range.
   
   @variable Network.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable Network.kind
   @summary String - [Output Only] Type of the resource. Always compute#network for networks.
   
   @variable Network.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Network.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class NetworkInterface
   @summary Google API JSON structure
   
   @variable NetworkInterface.accessConfigs
   @summary Array - An array of configurations for this interface. Currently, ONE_TO_ONE_NAT is the only access config supported. If there are no accessConfigs specified, then this instance will have no external internet access.
   
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
   @summary String - [Output Only] An optional IPV4 internal network address assigned to the instance for this network interface.
   
   @class NetworkList
   @summary Google API JSON structure
   
   @variable NetworkList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable NetworkList.items
   @summary Array - [Output Only] A list of Network resources.
   
   @variable NetworkList.kind
   @summary String - [Output Only] Type of resource. Always compute#networkList for lists of networks.
   
   @variable NetworkList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable NetworkList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource .
   
   @class Operation
   @summary Google API JSON structure
   
   @variable Operation.clientOperationId
   @summary String - [Output Only] An optional identifier specified by the client when the mutation was initiated. Must be unique for all Operation resources in the project.
   
   @variable Operation.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Operation.endTime
   @summary String - [Output Only] The time that this operation was completed. This is in RFC3339 text format.
   
   @variable Operation.error
   @summary Object - [Output Only] If errors are generated during processing of the operation, this field will be populated.
   
   @variable Operation.httpErrorMessage
   @summary String - [Output Only] If the operation fails, this field contains the HTTP error message that was returned, such as NOT FOUND.
   
   @variable Operation.httpErrorStatusCode
   @summary Integer - [Output Only] If the operation fails, this field contains the HTTP error message that was returned, such as 404.
   
   @variable Operation.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Operation.insertTime
   @summary String - [Output Only] The time that this operation was requested. This is in RFC3339 text format.
   
   @variable Operation.kind
   @summary String - [Output Only] Type of the resource. Always compute#Operation for Operation resources.
   
   @variable Operation.name
   @summary String - [Output Only] Name of the resource.
   
   @variable Operation.operationType
   @summary String - [Output Only] Type of the operation, such as insert, update, and delete.
   
   @variable Operation.progress
   @summary Integer - [Output Only] An optional progress indicator that ranges from 0 to 100. There is no requirement that this be linear or support any granularity of operations. This should not be used to guess at when the operation will be complete. This number should monotonically increase as the operation progresses.
   
   @variable Operation.region
   @summary String - [Output Only] URL of the region where the operation resides. Only applicable for regional resources.
   
   @variable Operation.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Operation.startTime
   @summary String - [Output Only] The time that this operation was started by the server. This is in RFC3339 text format.
   
   @variable Operation.status
   @summary String - [Output Only] Status of the operation. Can be one of the following: PENDING, RUNNING, or DONE.
   
   @variable Operation.statusMessage
   @summary String - [Output Only] An optional textual description of the current status of the operation.
   
   @variable Operation.targetId
   @summary String - [Output Only] Unique target ID which identifies a particular incarnation of the target.
   
   @variable Operation.targetLink
   @summary String - [Output Only] URL of the resource the operation is mutating.
   
   @variable Operation.user
   @summary String - [Output Only] User who requested the operation, for example: user@example.com.
   
   @variable Operation.warnings
   @summary Array - [Output Only] If warning messages are generated during processing of the operation, this field will be populated.
   
   @variable Operation.zone
   @summary String - [Output Only] URL of the zone where the operation resides.
   
   @class OperationAggregatedList
   @summary Google API JSON structure
   
   @variable OperationAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable OperationAggregatedList.items
   @summary Object - [Output Only] A map of scoped operation lists.
   
   @variable OperationAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#operationAggregatedList for aggregated lists of operations.
   
   @variable OperationAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable OperationAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class OperationList
   @summary Google API JSON structure
   
   @variable OperationList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable OperationList.items
   @summary Array - [Output Only] The Operation resources.
   
   @variable OperationList.kind
   @summary String - [Output Only] Type of resource. Always compute#operations for Operations resource.
   
   @variable OperationList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncate.
   
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
   @summary String - The URL to the BackendService resource. This will be used if none of the 'pathRules' defined by this PathMatcher is met by the URL's path portion.
   
   @variable PathMatcher.description
   @summary String - An optional textual description of the resource.
   
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
   
   @variable Project.description
   @summary String - An optional textual description of the resource.
   
   @variable Project.enabledFeatures
   @summary Array - Restricted features enabled for use on this project.
   
   @variable Project.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Project.kind
   @summary String - [Output Only] Type of the resource. Always compute#project for projects.
   
   @variable Project.name
   @summary String - Name of the resource.
   
   @variable Project.quotas
   @summary Array - [Output Only] Quotas assigned to this project.
   
   @variable Project.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Project.usageExportLocation
   @summary [::UsageExportLocation] - The location in Cloud Storage and naming method of the daily usage report.
   
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
   @summary String - [Output Only] Unique identifier for the resource; defined by the server .
   
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
   
   @class RegionList
   @summary Google API JSON structure
   
   @variable RegionList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable RegionList.items
   @summary Array - [Output Only] A list of Region resources.
   
   @variable RegionList.kind
   @summary String - [Output Only] Type of resource. Always compute#regionList for lists of regions.
   
   @variable RegionList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable RegionList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class ResourceGroupReference
   @summary Google API JSON structure
   
   @variable ResourceGroupReference.group
   @summary String - A URI referencing one of the resource views listed in the backend service.
   
   @class Route
   @summary Google API JSON structure
   
   @variable Route.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable Route.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable Route.destRange
   @summary String - The destination range of outgoing packets that this route applies to.
   
   @variable Route.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable Route.kind
   @summary String - [Output Only] Type of this resource. Always compute#routes for Route resources.
   
   @variable Route.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Route.network
   @summary String - Fully-qualified URL of the network that this route applies to.
   
   @variable Route.nextHopGateway
   @summary String - The URL to a gateway that should handle matching packets. Currently, this is only the internet gateway:  projects/<project-id>/global/gateways/default-internet-gateway
   
   @variable Route.nextHopInstance
   @summary String - The fully-qualified URL to an instance that should handle matching packets. For example:
   https://www.googleapis.com/compute/v1/projects/project/zones/zone/instances/
   
   @variable Route.nextHopIp
   @summary String - The network IP address of an instance that should handle matching packets.
   
   @variable Route.nextHopNetwork
   @summary String - The URL of the local network if it should handle matching packets.
   
   @variable Route.nextHopVpnTunnel
   @summary String - The URL to a VpnTunnel that should handle matching packets.
   
   @variable Route.priority
   @summary Integer - Breaks ties between Routes of equal specificity. Routes with smaller values win when tied with routes with larger values. Default value is 1000. A valid range is between 0 and 65535.
   
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
   @summary Array - A list of Route resources.
   
   @variable RouteList.kind
   @summary String - Type of resource.
   
   @variable RouteList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable RouteList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class Scheduling
   @summary Google API JSON structure
   
   @variable Scheduling.automaticRestart
   @summary Boolean - Specifies whether the instance should be automatically restarted if it is terminated by Compute Engine (not terminated by a user).
   
   @variable Scheduling.onHostMaintenance
   @summary String - Defines the maintenance behavior for this instance. The default behavior is MIGRATE. For more information, see Setting maintenance behavior.
   
   @variable Scheduling.preemptible
   @summary Boolean - Whether the Instance is preemptible.
   
   @class SerialPortOutput
   @summary Google API JSON structure
   
   @variable SerialPortOutput.contents
   @summary String - [Output Only] The contents of the console output.
   
   @variable SerialPortOutput.kind
   @summary String - [Output Only] Type of the resource. Always compute#serialPortOutput for serial port output.
   
   @variable SerialPortOutput.selfLink
   @summary String - [Output Only] Server defined URL for the resource.
   
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
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable Snapshot.diskSizeGb
   @summary String - [Output Only] Size of the snapshot, specified in GB.
   
   @variable Snapshot.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Snapshot.kind
   @summary String - [Output Only] Type of the resource. Always compute#snapshot for Snapshot resources.
   
   @variable Snapshot.licenses
   @summary Array - Public visible licenses.
   
   @variable Snapshot.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable Snapshot.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable Snapshot.sourceDisk
   @summary String - The source disk used to create this snapshot.
   
   @variable Snapshot.sourceDiskId
   @summary String - [Output Only] The ID value of the disk used to create this snapshot. This value may be used to determine whether the snapshot was taken from the current or a previous instance of a given disk name.
   
   @variable Snapshot.status
   @summary String - [Output Only] The status of the snapshot.
   
   @variable Snapshot.storageBytes
   @summary String - [Output Only] A size of the the storage used by the snapshot. As snapshots share storage, this number is expected to change with snapshot creation/deletion.
   
   @variable Snapshot.storageBytesStatus
   @summary String - [Output Only] An indicator whether storageBytes is in a stable state or it is being adjusted as a result of shared storage reallocation.
   
   @class SnapshotList
   @summary Google API JSON structure
   
   @variable SnapshotList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable SnapshotList.items
   @summary Array - A list of Snapshot resources.
   
   @variable SnapshotList.kind
   @summary String - Type of resource.
   
   @variable SnapshotList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable SnapshotList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
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
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable TargetHttpProxy.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetHttpProxy.kind
   @summary String - [Output Only] Type of resource. Always compute#Operation for Operation resources.
   
   @variable TargetHttpProxy.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetHttpProxy.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetHttpProxy.urlMap
   @summary String - URL to the UrlMap resource that defines the mapping from URL to the BackendService.
   
   @class TargetHttpProxyList
   @summary Google API JSON structure
   
   @variable TargetHttpProxyList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable TargetHttpProxyList.items
   @summary Array - A list of TargetHttpProxy resources.
   
   @variable TargetHttpProxyList.kind
   @summary String - Type of resource. Always compute#targetHttpProxyList for lists of Target HTTP proxies.
   
   @variable TargetHttpProxyList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetHttpProxyList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetInstance
   @summary Google API JSON structure
   
   @variable TargetInstance.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetInstance.description
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable TargetInstance.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable TargetInstance.instance
   @summary String - The URL to the instance that terminates the relevant traffic.
   
   @variable TargetInstance.kind
   @summary String - Type of the resource.
   
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
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetInstanceAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetInstanceList
   @summary Google API JSON structure
   
   @variable TargetInstanceList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable TargetInstanceList.items
   @summary Array - A list of TargetInstance resources.
   
   @variable TargetInstanceList.kind
   @summary String - Type of resource.
   
   @variable TargetInstanceList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
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
   @summary String - An optional textual description of the resource; provided by the client when the resource is created.
   
   @variable TargetPool.failoverRatio
   @summary Number - This field is applicable only when the containing target pool is serving a forwarding rule as the primary pool (i.e., not as a backup pool to some other target pool). The value of the field must be in [0, 1].
   
   If set, backupPool must also be set. They together define the fallback behavior of the primary target pool: if the ratio of the healthy instances in the primary pool is at or below this number, traffic arriving at the load-balanced IP will be directed to the backup pool.
   
   In case where failoverRatio is not set or all the instances in the backup pool are unhealthy, the traffic will be directed back to the primary pool in the "force" mode, where traffic will be spread to the healthy instances with the best effort, or to all instances when no instance is healthy.
   
   @variable TargetPool.healthChecks
   @summary Array - A list of URLs to the HttpHealthCheck resource. A member instance in this pool is considered healthy if and only if all specified health checks pass. An empty list means all member instances will be considered healthy at all times.
   
   @variable TargetPool.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable TargetPool.instances
   @summary Array - A list of resource URLs to the member virtual machines serving this pool. They must live in zones contained in the same region as this pool.
   
   @variable TargetPool.kind
   @summary String - Type of the resource.
   
   @variable TargetPool.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetPool.region
   @summary String - [Output Only] URL of the region where the target pool resides.
   
   @variable TargetPool.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetPool.sessionAffinity
   @summary String - Sesssion affinity option, must be one of the following values: NONE: Connections from the same client IP may go to any instance in the pool; CLIENT_IP: Connections from the same client IP will go to the same instance in the pool while that instance remains healthy. CLIENT_IP_PROTO: Connections from the same client IP with the same IP protocol will go to the same instance in the pool while that instance remains healthy.
   
   @class TargetPoolAggregatedList
   @summary Google API JSON structure
   
   @variable TargetPoolAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetPoolAggregatedList.items
   @summary Object - A map of scoped target pool lists.
   
   @variable TargetPoolAggregatedList.kind
   @summary String - Type of resource.
   
   @variable TargetPoolAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetPoolAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetPoolInstanceHealth
   @summary Google API JSON structure
   
   @variable TargetPoolInstanceHealth.healthStatus
   @summary Array - undefined
   
   @variable TargetPoolInstanceHealth.kind
   @summary String - Type of resource.
   
   @class TargetPoolList
   @summary Google API JSON structure
   
   @variable TargetPoolList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetPoolList.items
   @summary Array - A list of TargetPool resources.
   
   @variable TargetPoolList.kind
   @summary String - Type of resource.
   
   @variable TargetPoolList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetPoolList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class TargetPoolsAddHealthCheckRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsAddHealthCheckRequest.healthChecks
   @summary Array - Health check URLs to be added to targetPool.
   
   @class TargetPoolsAddInstanceRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsAddInstanceRequest.instances
   @summary Array - URLs of the instances to be added to targetPool.
   
   @class TargetPoolsRemoveHealthCheckRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsRemoveHealthCheckRequest.healthChecks
   @summary Array - Health check URLs to be removed from targetPool.
   
   @class TargetPoolsRemoveInstanceRequest
   @summary Google API JSON structure
   
   @variable TargetPoolsRemoveInstanceRequest.instances
   @summary Array - URLs of the instances to be removed from targetPool.
   
   @class TargetPoolsScopedList
   @summary Google API JSON structure
   
   @variable TargetPoolsScopedList.targetPools
   @summary Array - List of target pools contained in this scope.
   
   @variable TargetPoolsScopedList.warning
   @summary Object - Informational warning which replaces the list of addresses when the list is empty.
   
   @class TargetReference
   @summary Google API JSON structure
   
   @variable TargetReference.target
   @summary String - undefined
   
   @class TargetVpnGateway
   @summary Google API JSON structure
   
   @variable TargetVpnGateway.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable TargetVpnGateway.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable TargetVpnGateway.forwardingRules
   @summary Array - [Output Only] A list of URLs to the ForwardingRule resources. ForwardingRules are created using compute.forwardingRules.insert and associated to a VPN gateway.
   
   @variable TargetVpnGateway.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetVpnGateway.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGateway.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable TargetVpnGateway.network
   @summary String - URL of the network to which this VPN gateway is attached. Provided by the client when the VPN gateway is created.
   
   @variable TargetVpnGateway.region
   @summary String - [Output Only] URL of the region where the target VPN gateway resides.
   
   @variable TargetVpnGateway.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable TargetVpnGateway.status
   @summary String - [Output Only] The status of the VPN gateway.
   
   @variable TargetVpnGateway.tunnels
   @summary Array - [Output Only] A list of URLs to VpnTunnel resources. VpnTunnels are created using compute.vpntunnels.insert and associated to a VPN gateway.
   
   @class TargetVpnGatewayAggregatedList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewayAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetVpnGatewayAggregatedList.items
   @summary Object - A map of scoped target vpn gateway lists.
   
   @variable TargetVpnGatewayAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGatewayAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetVpnGatewayAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class TargetVpnGatewayList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewayList.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable TargetVpnGatewayList.items
   @summary Array - [Output Only] A list of TargetVpnGateway resources.
   
   @variable TargetVpnGatewayList.kind
   @summary String - [Output Only] Type of resource. Always compute#targetVpnGateway for target VPN gateways.
   
   @variable TargetVpnGatewayList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable TargetVpnGatewayList.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @class TargetVpnGatewaysScopedList
   @summary Google API JSON structure
   
   @variable TargetVpnGatewaysScopedList.targetVpnGateways
   @summary Array - [Output Only] List of target vpn gateways contained in this scope.
   
   @variable TargetVpnGatewaysScopedList.warning
   @summary Object - [Output Only] Informational warning which replaces the list of addresses when the list is empty.
   
   @class TestFailure
   @summary Google API JSON structure
   
   @variable TestFailure.actualService
   @summary String - undefined
   
   @variable TestFailure.expectedService
   @summary String - undefined
   
   @variable TestFailure.host
   @summary String - undefined
   
   @variable TestFailure.path
   @summary String - undefined
   
   @class UrlMap
   @summary Google API JSON structure
   
   @variable UrlMap.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable UrlMap.defaultService
   @summary String - The URL of the BackendService resource if none of the hostRules match.
   
   @variable UrlMap.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable UrlMap.fingerprint
   @summary String - Fingerprint of this resource. A hash of the contents stored in this object. This field is used in optimistic locking. This field will be ignored when inserting a UrlMap. An up-to-date fingerprint must be provided in order to update the UrlMap.
   
   @variable UrlMap.hostRules
   @summary Array - The list of HostRules to use against the URL.
   
   @variable UrlMap.id
   @summary String - [Output Only] Unique identifier for the resource. Set by the server.
   
   @variable UrlMap.kind
   @summary String - Type of the resource.
   
   @variable UrlMap.name
   @summary String - Name of the resource. Provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable UrlMap.pathMatchers
   @summary Array - The list of named PathMatchers to use against the URL.
   
   @variable UrlMap.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable UrlMap.tests
   @summary Array - The list of expected URL mappings. Request to update this UrlMap will succeed only all of the test cases pass.
   
   @class UrlMapList
   @summary Google API JSON structure
   
   @variable UrlMapList.id
   @summary String - [Output Only] Unique identifier for the resource. Set by the server.
   
   @variable UrlMapList.items
   @summary Array - A list of UrlMap resources.
   
   @variable UrlMapList.kind
   @summary String - Type of resource.
   
   @variable UrlMapList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable UrlMapList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class UrlMapReference
   @summary Google API JSON structure
   
   @variable UrlMapReference.urlMap
   @summary String - undefined
   
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
   @summary Array - undefined
   
   @variable UrlMapValidationResult.loadSucceeded
   @summary Boolean - Whether the given UrlMap can be successfully loaded. If false, 'loadErrors' indicates the reasons.
   
   @variable UrlMapValidationResult.testFailures
   @summary Array - undefined
   
   @variable UrlMapValidationResult.testPassed
   @summary Boolean - If successfully loaded, this field indicates whether the test passed. If false, 'testFailures's indicate the reason of failure.
   
   @class UrlMapsValidateRequest
   @summary Google API JSON structure
   
   @variable UrlMapsValidateRequest.resource
   @summary [::UrlMap] - Content of the UrlMap to be validated.
   
   @class UrlMapsValidateResponse
   @summary Google API JSON structure
   
   @variable UrlMapsValidateResponse.result
   @summary [::UrlMapValidationResult] - undefined
   
   @class UsageExportLocation
   @summary Google API JSON structure
   
   @variable UsageExportLocation.bucketName
   @summary String - The name of an existing bucket in Cloud Storage where the usage report object is stored. The Google Service Account is granted write access to this bucket. This is just the bucket name, with no gs:// or https://storage.googleapis.com/ in front of it.
   
   @variable UsageExportLocation.reportNamePrefix
   @summary String - An optional prefix for the name of the usage report object stored in bucketName. If not supplied, defaults to usage. The report is stored as a CSV file named report_name_prefix_gce_YYYYMMDD.csv where YYYYMMDD is the day of the usage according to Pacific Time. If you supply a prefix, it should conform to Cloud Storage object naming conventions.
   
   @class VpnTunnel
   @summary Google API JSON structure
   
   @variable VpnTunnel.creationTimestamp
   @summary String - [Output Only] Creation timestamp in RFC3339 text format.
   
   @variable VpnTunnel.description
   @summary String - An optional textual description of the resource. Provided by the client when the resource is created.
   
   @variable VpnTunnel.detailedStatus
   @summary String - [Output Only] Detailed status message for the VPN tunnel.
   
   @variable VpnTunnel.id
   @summary String - [Output Only] Unique identifier for the resource. Defined by the server.
   
   @variable VpnTunnel.ikeVersion
   @summary Integer - IKE protocol version to use when establishing the VPN tunnel with peer VPN gateway. Acceptable IKE versions are 1 or 2. Default version is 2.
   
   @variable VpnTunnel.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnel.name
   @summary String - Name of the resource; provided by the client when the resource is created. The name must be 1-63 characters long, and comply with RFC1035. Specifically, the name must be 1-63 characters long and match the regular expression [a-z]([-a-z0-9]*[a-z0-9])? which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.
   
   @variable VpnTunnel.peerIp
   @summary String - IP address of the peer VPN gateway.
   
   @variable VpnTunnel.region
   @summary String - [Output Only] URL of the region where the VPN tunnel resides.
   
   @variable VpnTunnel.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
   @variable VpnTunnel.sharedSecret
   @summary String - Shared secret used to set the secure session between the GCE VPN gateway and the peer VPN gateway.
   
   @variable VpnTunnel.sharedSecretHash
   @summary String - Hash of the shared secret.
   
   @variable VpnTunnel.status
   @summary String - [Output Only] The status of the VPN tunnel.
   
   @variable VpnTunnel.targetVpnGateway
   @summary String - URL of the VPN gateway to which this VPN tunnel is associated. Provided by the client when the VPN tunnel is created.
   
   @class VpnTunnelAggregatedList
   @summary Google API JSON structure
   
   @variable VpnTunnelAggregatedList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable VpnTunnelAggregatedList.items
   @summary Object - [Output Only] A map of scoped vpn tunnel lists.
   
   @variable VpnTunnelAggregatedList.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnelAggregatedList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable VpnTunnelAggregatedList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
   
   @class VpnTunnelList
   @summary Google API JSON structure
   
   @variable VpnTunnelList.id
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable VpnTunnelList.items
   @summary Array - [Output Only] A list of VpnTunnel resources.
   
   @variable VpnTunnelList.kind
   @summary String - [Output Only] Type of resource. Always compute#vpnTunnel for VPN tunnels.
   
   @variable VpnTunnelList.nextPageToken
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable VpnTunnelList.selfLink
   @summary String - [Output Only] Server-defined URL for the resource.
   
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
   @summary String - [Output Only] Unique identifier for the resource; defined by the server.
   
   @variable Zone.kind
   @summary String - [Output Only] Type of the resource. Always kind#zone for zones.
   
   @variable Zone.maintenanceWindows
   @summary Array - [Output Only] Any scheduled maintenance windows for this zone. When the zone is in a maintenance window, all resources which reside in the zone will be unavailable. For more information, see Maintenance Windows
   
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
   @summary String - [Output Only] A token used to continue a truncated list request.
   
   @variable ZoneList.selfLink
   @summary String - [Output Only] Server-defined URL for this resource.
*/

exports.addresses = {

  /**
     @function addresses.aggregatedList
     @summary  Retrieves the list of addresses grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/addresses',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function addresses.delete
     @summary  Deletes the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project', 'region'],
      pathParams: ['address', 'project', 'region']
    });
  },
  
  /**
     @function addresses.get
     @summary  Returns the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [address] Name of the address resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::Address}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project', 'region'],
      pathParams: ['address', 'project', 'region']
    });
  },
  
  /**
     @function addresses.insert
     @summary  Creates an address resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Address} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/addresses',
      params: params,
      requiredParams: ['project', 'region', 'resource'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function addresses.list
     @summary  Retrieves the list of address resources contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::AddressList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/addresses',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};
,

exports.autoscalers = {

  /**
     @function autoscalers.aggregatedList
     @summary  Retrieves the list of autoscalers grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::AutoscalerAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/autoscalers',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function autoscalers.delete
     @summary  Deletes the specified autoscaler resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the persistent autoscaler resource to delete. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone'],
      pathParams: ['autoscaler', 'project', 'zone']
    });
  },
  
  /**
     @function autoscalers.get
     @summary  Returns the specified autoscaler resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [autoscaler] Name of the persistent autoscaler resource to return. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Autoscaler}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers/{autoscaler}',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone'],
      pathParams: ['autoscaler', 'project', 'zone']
    });
  },
  
  /**
     @function autoscalers.insert
     @summary  Creates an autoscaler resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.list
     @summary  Retrieves the list of autoscaler resources contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::AutoscalerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.patch
     @summary  Updates an autoscaler resource in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Resource that this API call acts on. **Required**
     @setting {String} [autoscaler] Name of the autoscaler resource to update. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['autoscaler', 'project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function autoscalers.update
     @summary  Updates an autoscaler resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Autoscaler} [resource] Resource that this API call acts on. **Required**
     @setting {optional String} [autoscaler] Name of the autoscaler resource to update.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'{project}/zones/{zone}/autoscalers',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.backendServices = {

  /**
     @function backendServices.delete
     @summary  Deletes the specified BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to delete. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.get
     @summary  Returns the specified BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [backendService] Name of the BackendService resource to return. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::BackendService}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.getHealth
     @summary  Gets the most recent health check results for this BackendService.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::ResourceGroupReference} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/backendServices/{backendService}/getHealth',
      params: params,
      requiredParams: ['backendService', 'project', 'resource'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.insert
     @summary  Creates a BackendService resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/backendServices',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function backendServices.list
     @summary  Retrieves the list of BackendService resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::BackendServiceList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/backendServices',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function backendServices.patch
     @summary  Update the entire content of the BackendService resource. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Resource that this API call acts on. **Required**
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'resource'],
      pathParams: ['backendService', 'project']
    });
  },
  
  /**
     @function backendServices.update
     @summary  Update the entire content of the BackendService resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::BackendService} [resource] Resource that this API call acts on. **Required**
     @setting {String} [backendService] Name of the BackendService resource to update. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'{project}/global/backendServices/{backendService}',
      params: params,
      requiredParams: ['backendService', 'project', 'resource'],
      pathParams: ['backendService', 'project']
    });
  }
};
,

exports.diskTypes = {

  /**
     @function diskTypes.aggregatedList
     @summary  Retrieves the list of disk type resources grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/diskTypes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function diskTypes.get
     @summary  Returns the specified disk type resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [diskType] Name of the disk type resource to return. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/diskTypes/{diskType}',
      params: params,
      requiredParams: ['diskType', 'project', 'zone'],
      pathParams: ['diskType', 'project', 'zone']
    });
  },
  
  /**
     @function diskTypes.list
     @summary  Retrieves the list of disk type resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/diskTypes',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.disks = {

  /**
     @function disks.aggregatedList
     @summary  Retrieves the list of disks grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/disks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function disks.createSnapshot
     @summary  Creates a snapshot of this disk.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Snapshot} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/disks/{disk}/createSnapshot',
      params: params,
      requiredParams: ['disk', 'project', 'zone', 'resource'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.delete
     @summary  Deletes the specified persistent disk. Deleting a disk removes its data permanently and is irreversible. However, deleting a disk does not delete any snapshots previously made from the disk. You must separately delete snapshots.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/disks/{disk}',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.get
     @summary  Returns a specified persistent disk.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/disks/{disk}',
      params: params,
      requiredParams: ['disk', 'project', 'zone'],
      pathParams: ['disk', 'project', 'zone']
    });
  },
  
  /**
     @function disks.insert
     @summary  Creates a persistent disk in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Disk} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/disks',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function disks.list
     @summary  Retrieves the list of persistent disks contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/disks',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.firewalls = {

  /**
     @function firewalls.delete
     @summary  Deletes the specified firewall resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [firewall] Name of the firewall resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.get
     @summary  Returns the specified firewall resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [firewall] Name of the firewall resource to return. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.insert
     @summary  Creates a firewall resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/firewalls',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function firewalls.list
     @summary  Retrieves the list of firewall resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/firewalls',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function firewalls.patch
     @summary  Updates the specified firewall resource with the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Resource that this API call acts on. **Required**
     @setting {String} [firewall] Name of the firewall resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project', 'resource'],
      pathParams: ['firewall', 'project']
    });
  },
  
  /**
     @function firewalls.update
     @summary  Updates the specified firewall resource with the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Firewall} [resource] Resource that this API call acts on. **Required**
     @setting {String} [firewall] Name of the firewall resource to update. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'{project}/global/firewalls/{firewall}',
      params: params,
      requiredParams: ['firewall', 'project', 'resource'],
      pathParams: ['firewall', 'project']
    });
  }
};
,

exports.forwardingRules = {

  /**
     @function forwardingRules.aggregatedList
     @summary  Retrieves the list of forwarding rules grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::ForwardingRuleAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/forwardingRules',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function forwardingRules.delete
     @summary  Deletes the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to delete. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  },
  
  /**
     @function forwardingRules.get
     @summary  Returns the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to return. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  },
  
  /**
     @function forwardingRules.insert
     @summary  Creates a ForwardingRule resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::ForwardingRule} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/forwardingRules',
      params: params,
      requiredParams: ['project', 'region', 'resource'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function forwardingRules.list
     @summary  Retrieves the list of ForwardingRule resources available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/forwardingRules',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function forwardingRules.setTarget
     @summary  Changes target url for forwarding rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [forwardingRule] Name of the ForwardingRule resource in which target is to be set. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTarget: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/forwardingRules/{forwardingRule}/setTarget',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'region', 'resource'],
      pathParams: ['forwardingRule', 'project', 'region']
    });
  }
};
,

exports.globalAddresses = {

  /**
     @function globalAddresses.delete
     @summary  Deletes the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project'],
      pathParams: ['address', 'project']
    });
  },
  
  /**
     @function globalAddresses.get
     @summary  Returns the specified address resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/addresses/{address}',
      params: params,
      requiredParams: ['address', 'project'],
      pathParams: ['address', 'project']
    });
  },
  
  /**
     @function globalAddresses.insert
     @summary  Creates an address resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Address} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/addresses',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalAddresses.list
     @summary  Retrieves the list of global address resources.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/addresses',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.globalForwardingRules = {

  /**
     @function globalForwardingRules.delete
     @summary  Deletes the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to delete. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project'],
      pathParams: ['forwardingRule', 'project']
    });
  },
  
  /**
     @function globalForwardingRules.get
     @summary  Returns the specified ForwardingRule resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [forwardingRule] Name of the ForwardingRule resource to return. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::ForwardingRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/forwardingRules/{forwardingRule}',
      params: params,
      requiredParams: ['forwardingRule', 'project'],
      pathParams: ['forwardingRule', 'project']
    });
  },
  
  /**
     @function globalForwardingRules.insert
     @summary  Creates a ForwardingRule resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::ForwardingRule} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/forwardingRules',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalForwardingRules.list
     @summary  Retrieves the list of ForwardingRule resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::ForwardingRuleList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/forwardingRules',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalForwardingRules.setTarget
     @summary  Changes target url for forwarding rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [forwardingRule] Name of the ForwardingRule resource in which target is to be set. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTarget: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/forwardingRules/{forwardingRule}/setTarget',
      params: params,
      requiredParams: ['forwardingRule', 'project', 'resource'],
      pathParams: ['forwardingRule', 'project']
    });
  }
};
,

exports.globalOperations = {

  /**
     @function globalOperations.aggregatedList
     @summary  Retrieves the list of all operations grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/operations',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function globalOperations.delete
     @summary  Deletes the specified Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project'],
      pathParams: ['operation', 'project']
    });
  },
  
  /**
     @function globalOperations.get
     @summary  Retrieves the specified Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project'],
      pathParams: ['operation', 'project']
    });
  },
  
  /**
     @function globalOperations.list
     @summary  Retrieves the list of Operation resources contained within the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/operations',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.httpHealthChecks = {

  /**
     @function httpHealthChecks.delete
     @summary  Deletes the specified HttpHealthCheck resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to delete. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.get
     @summary  Returns the specified HttpHealthCheck resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to return. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::HttpHealthCheck}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.insert
     @summary  Creates a HttpHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/httpHealthChecks',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpHealthChecks.list
     @summary  Retrieves the list of HttpHealthCheck resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::HttpHealthCheckList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/httpHealthChecks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function httpHealthChecks.patch
     @summary  Updates a HttpHealthCheck resource in the specified project using the data included in the request. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Resource that this API call acts on. **Required**
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to update. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project', 'resource'],
      pathParams: ['httpHealthCheck', 'project']
    });
  },
  
  /**
     @function httpHealthChecks.update
     @summary  Updates a HttpHealthCheck resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::HttpHealthCheck} [resource] Resource that this API call acts on. **Required**
     @setting {String} [httpHealthCheck] Name of the HttpHealthCheck resource to update. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'{project}/global/httpHealthChecks/{httpHealthCheck}',
      params: params,
      requiredParams: ['httpHealthCheck', 'project', 'resource'],
      pathParams: ['httpHealthCheck', 'project']
    });
  }
};
,

exports.images = {

  /**
     @function images.delete
     @summary  Deletes the specified image resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/images/{image}',
      params: params,
      requiredParams: ['image', 'project'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.deprecate
     @summary  Sets the deprecation status of an image.
  
  If an empty request body is given, clears the deprecation status instead.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::DeprecationStatus} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/images/{image}/deprecate',
      params: params,
      requiredParams: ['image', 'project', 'resource'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.get
     @summary  Returns the specified image resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/images/{image}',
      params: params,
      requiredParams: ['image', 'project'],
      pathParams: ['image', 'project']
    });
  },
  
  /**
     @function images.insert
     @summary  Creates an image resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Image} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/images',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function images.list
     @summary  Retrieves the list of image resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/images',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.instanceGroupManagers = {

  /**
     @function instanceGroupManagers.abandonInstances
     @summary  Removes the specified instances from the managed instance group, and from any target pools where they are a member. The instances are not deleted. The managed instance group automatically reduces its targetSize value by the number of instances that you abandon from the group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersAbandonInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  abandonInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/abandonInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.aggregatedList
     @summary  Retrieves the list of managed instance groups, and groups them by project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @return {::InstanceGroupManagerAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/instanceGroupManagers',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceGroupManagers.delete
     @summary  Deletes the specified managed instance group resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the instance group manager to delete. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.deleteInstances
     @summary  Deletes the specified instances. The instances are deleted and removed from the instance group and any target pools where they are a member. The managed instance group automatically reduces its targetSize value by the number of instances that you delete.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersDeleteInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  deleteInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/deleteInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.get
     @summary  Returns the specified managed instance group resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the instance group manager resource. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManager}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.insert
     @summary  Creates a managed instance group resource in the specified project using the data that is included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManager} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.list
     @summary  Retrieves a list of managed instance groups that are contained within the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManagerList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.listManagedInstances
     @summary  Lists managed instances.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the managed instance group. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::InstanceGroupManagersListManagedInstancesResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listManagedInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/listManagedInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.recreateInstances
     @summary  Recreates the specified instances. The instances are deleted, then recreated using the managed instance group's current instance template.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersRecreateInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  recreateInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/recreateInstances',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.resize
     @summary  Resizes the managed instance group. If you increase the size, the group creates new instances using the current instance template. If you decrease the size, the group removes instances in the order that is outlined in Resizing a managed instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {Integer} [size] The number of running instances that the managed instance group should maintain at any given time. The group automatically adds or removes instances to maintain the number of instances specified by this parameter. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  resize: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/resize',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'size', 'zone'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.setInstanceTemplate
     @summary  Specifies the instance template to use when creating new instances in this group. The templates for existing instances in the group do not change unless you recreate them.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersSetInstanceTemplateRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setInstanceTemplate: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/setInstanceTemplate',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroupManagers.setTargetPools
     @summary  Modifies the target pools to which all new instances in this group are assigned. The target pools for existing instances in the group do not change unless you recreate them.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupManagersSetTargetPoolsRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroupManager] The name of the instance group manager. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the managed instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setTargetPools: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroupManagers/{instanceGroupManager}/setTargetPools',
      params: params,
      requiredParams: ['instanceGroupManager', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroupManager', 'project', 'zone']
    });
  }
};
,

exports.instanceGroups = {

  /**
     @function instanceGroups.addInstances
     @summary  Adds a list of instances to an instance group. All of the instances in the instance group must be in the same network.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsAddInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroup] The name of the instance group where you are adding instances. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}/addInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.aggregatedList
     @summary  Retrieves the list of instance groups, and sorts them by zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @return {::InstanceGroupAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/instanceGroups',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceGroups.delete
     @summary  Deletes the specified instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroup] The name of the instance group to delete. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.get
     @summary  Returns the specified instance group resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceGroup] The name of the instance group. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::InstanceGroup}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.insert
     @summary  Creates an instance group in the specified project using the parameters that are included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroup} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.list
     @summary  Retrieves the list of instance groups that are located in the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::InstanceGroupList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.listInstances
     @summary  Lists instances in an instance group. The parameters for this method specify whether the list filters instances by state and named ports information.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsListInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {String} [instanceGroup] The name of the instance group from which you want to generate a list of included instances. **Required**
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::InstanceGroupsListInstances}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  listInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}/listInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.removeInstances
     @summary  Removes a list of instances from an instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsRemoveInstancesRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroup] The name of the instance group where the specified instances will be removed. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeInstances: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}/removeInstances',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  },
  
  /**
     @function instanceGroups.setNamedPorts
     @summary  Sets the named ports in an instance group.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceGroupsSetNamedPortsRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [instanceGroup] The name of the instance group where the named ports are updated. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @setting {String} [zone] The URL of the zone where the instance group is located. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setNamedPorts: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instanceGroups/{instanceGroup}/setNamedPorts',
      params: params,
      requiredParams: ['instanceGroup', 'project', 'zone', 'resource'],
      pathParams: ['instanceGroup', 'project', 'zone']
    });
  }
};
,

exports.instanceTemplates = {

  /**
     @function instanceTemplates.delete
     @summary  Deletes the specified instance template.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceTemplate] The name of the instance template to delete. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/instanceTemplates/{instanceTemplate}',
      params: params,
      requiredParams: ['instanceTemplate', 'project'],
      pathParams: ['instanceTemplate', 'project']
    });
  },
  
  /**
     @function instanceTemplates.get
     @summary  Returns the specified instance template resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instanceTemplate] The name of the instance template. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @return {::InstanceTemplate}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/instanceTemplates/{instanceTemplate}',
      params: params,
      requiredParams: ['instanceTemplate', 'project'],
      pathParams: ['instanceTemplate', 'project']
    });
  },
  
  /**
     @function instanceTemplates.insert
     @summary  Creates an instance template in the specified project using the data that is included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceTemplate} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] The project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/instanceTemplates',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instanceTemplates.list
     @summary  Retrieves a list of instance templates that are contained within the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] The project ID for this request. **Required**
     @return {::InstanceTemplateList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/instanceTemplates',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.instances = {

  /**
     @function instances.addAccessConfig
     @summary  Adds an access config to an instance's network interface.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::AccessConfig} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/addAccessConfig',
      params: params,
      requiredParams: ['instance', 'networkInterface', 'project', 'zone', 'resource'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.aggregatedList
     @summary  undefined
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/instances',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function instances.attachDisk
     @summary  Attaches a Disk resource to an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::AttachedDisk} [resource] Resource that this API call acts on. **Required**
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
  attachDisk: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/attachDisk',
      params: params,
      requiredParams: ['instance', 'project', 'zone', 'resource'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.delete
     @summary  Deletes the specified Instance resource. For more information, see Shutting down an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.deleteAccessConfig
     @summary  Deletes an access config from an instance's network interface.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/deleteAccessConfig',
      params: params,
      requiredParams: ['accessConfig', 'instance', 'networkInterface', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.detachDisk
     @summary  Detaches a disk from an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/detachDisk',
      params: params,
      requiredParams: ['deviceName', 'instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.get
     @summary  Returns the specified instance resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.getSerialPortOutput
     @summary  Returns the specified instance's serial port output.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [instance] Name of the instance scoping this request. **Required**
     @setting {optional Integer} [port] Specifies which COM or serial port to retrieve data from.
     @setting {String} [project] Project ID for this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/serialPort',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.insert
     @summary  Creates an instance resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Instance} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instances.list
     @summary  Retrieves the list of instance resources contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/instances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function instances.reset
     @summary  Performs a hard reset on the instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/reset',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setDiskAutoDelete
     @summary  Sets the auto-delete flag for a disk attached to an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/setDiskAutoDelete',
      params: params,
      requiredParams: ['autoDelete', 'deviceName', 'instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setMetadata
     @summary  Sets metadata for the specified instance to the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Metadata} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/setMetadata',
      params: params,
      requiredParams: ['instance', 'project', 'zone', 'resource'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setScheduling
     @summary  Sets an instance's scheduling options.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Scheduling} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/setScheduling',
      params: params,
      requiredParams: ['instance', 'project', 'zone', 'resource'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.setTags
     @summary  Sets tags for the specified instance to the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Tags} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/setTags',
      params: params,
      requiredParams: ['instance', 'project', 'zone', 'resource'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.start
     @summary  This method starts an instance that was stopped using the using the instances().stop method. For more information, see Restart an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/start',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  },
  
  /**
     @function instances.stop
     @summary  This method stops a running instance, shutting it down cleanly, and allows you to restart the instance at a later time. Stopped instances do not incur per-minute, virtual machine usage charges while they are stopped, but any resources that the virtual machine is using, such as persistent disks and static IP addresses,will continue to be charged until they are deleted. For more information, see Stopping an instance.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/instances/{instance}/stop',
      params: params,
      requiredParams: ['instance', 'project', 'zone'],
      pathParams: ['instance', 'project', 'zone']
    });
  }
};
,

exports.licenses = {

  /**
     @function licenses.get
     @summary  Returns the specified license resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [license] Name of the license resource to return. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/licenses/{license}',
      params: params,
      requiredParams: ['license', 'project'],
      pathParams: ['license', 'project']
    });
  }
};
,

exports.machineTypes = {

  /**
     @function machineTypes.aggregatedList
     @summary  Retrieves the list of machine type resources grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/machineTypes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function machineTypes.get
     @summary  Returns the specified machine type resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [machineType] Name of the machine type resource to return. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/machineTypes/{machineType}',
      params: params,
      requiredParams: ['machineType', 'project', 'zone'],
      pathParams: ['machineType', 'project', 'zone']
    });
  },
  
  /**
     @function machineTypes.list
     @summary  Retrieves the list of machine type resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/machineTypes',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.networks = {

  /**
     @function networks.delete
     @summary  Deletes the specified network resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [network] Name of the network resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/networks/{network}',
      params: params,
      requiredParams: ['network', 'project'],
      pathParams: ['network', 'project']
    });
  },
  
  /**
     @function networks.get
     @summary  Returns the specified network resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [network] Name of the network resource to return. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/networks/{network}',
      params: params,
      requiredParams: ['network', 'project'],
      pathParams: ['network', 'project']
    });
  },
  
  /**
     @function networks.insert
     @summary  Creates a network resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Network} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/networks',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function networks.list
     @summary  Retrieves the list of network resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/networks',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.projects = {

  /**
     @function projects.get
     @summary  Returns the specified project resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.moveDisk
     @summary  Moves a persistent disk from one zone to another.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::DiskMoveRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  moveDisk: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/moveDisk',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.moveInstance
     @summary  Moves an instance and its attached persistent disks from one zone to another.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceMoveRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  moveInstance: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/moveInstance',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.setCommonInstanceMetadata
     @summary  Sets metadata common to all instances within the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Metadata} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setCommonInstanceMetadata: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/setCommonInstanceMetadata',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function projects.setUsageExportBucket
     @summary  Enables the usage export feature and sets the usage export bucket where reports are stored. If you provide an empty request body using this method, the usage export feature will be disabled.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UsageExportLocation} [resource] Resource that this API call acts on. **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/setUsageExportBucket',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  }
};
,

exports.regionOperations = {

  /**
     @function regionOperations.delete
     @summary  Deletes the specified region-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'region'],
      pathParams: ['operation', 'project', 'region']
    });
  },
  
  /**
     @function regionOperations.get
     @summary  Retrieves the specified region-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'region'],
      pathParams: ['operation', 'project', 'region']
    });
  },
  
  /**
     @function regionOperations.list
     @summary  Retrieves the list of Operation resources contained within the specified region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::OperationList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/operations',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};
,

exports.regions = {

  /**
     @function regions.get
     @summary  Returns the specified region resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function regions.list
     @summary  Retrieves the list of region resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.routes = {

  /**
     @function routes.delete
     @summary  Deletes the specified route resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [route] Name of the route resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/routes/{route}',
      params: params,
      requiredParams: ['project', 'route'],
      pathParams: ['project', 'route']
    });
  },
  
  /**
     @function routes.get
     @summary  Returns the specified route resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [route] Name of the route resource to return. **Required**
     @return {::Route}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/routes/{route}',
      params: params,
      requiredParams: ['project', 'route'],
      pathParams: ['project', 'route']
    });
  },
  
  /**
     @function routes.insert
     @summary  Creates a route resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Route} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/routes',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function routes.list
     @summary  Retrieves the list of route resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::RouteList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/routes',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.snapshots = {

  /**
     @function snapshots.delete
     @summary  Deletes the specified Snapshot resource. Keep in mind that deleting a single snapshot might not necessarily delete all the data on that snapshot. If any data on the snapshot that is marked for deletion is needed for subsequent snapshots, the data will be moved to the next corresponding snapshot.
  
  For more information, see Deleting snaphots.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [snapshot] Name of the Snapshot resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/snapshots/{snapshot}',
      params: params,
      requiredParams: ['project', 'snapshot'],
      pathParams: ['project', 'snapshot']
    });
  },
  
  /**
     @function snapshots.get
     @summary  Returns the specified Snapshot resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/snapshots/{snapshot}',
      params: params,
      requiredParams: ['project', 'snapshot'],
      pathParams: ['project', 'snapshot']
    });
  },
  
  /**
     @function snapshots.list
     @summary  Retrieves the list of Snapshot resources contained within the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::SnapshotList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/snapshots',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
,

exports.targetHttpProxies = {

  /**
     @function targetHttpProxies.delete
     @summary  Deletes the specified TargetHttpProxy resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [targetHttpProxy] Name of the TargetHttpProxy resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/targetHttpProxies/{targetHttpProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpProxy'],
      pathParams: ['project', 'targetHttpProxy']
    });
  },
  
  /**
     @function targetHttpProxies.get
     @summary  Returns the specified TargetHttpProxy resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/targetHttpProxies/{targetHttpProxy}',
      params: params,
      requiredParams: ['project', 'targetHttpProxy'],
      pathParams: ['project', 'targetHttpProxy']
    });
  },
  
  /**
     @function targetHttpProxies.insert
     @summary  Creates a TargetHttpProxy resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetHttpProxy} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/targetHttpProxies',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpProxies.list
     @summary  Retrieves the list of TargetHttpProxy resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::TargetHttpProxyList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/targetHttpProxies',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetHttpProxies.setUrlMap
     @summary  Changes the URL map for TargetHttpProxy.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMapReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [targetHttpProxy] Name of the TargetHttpProxy resource whose URL map is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setUrlMap: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/targetHttpProxies/{targetHttpProxy}/setUrlMap',
      params: params,
      requiredParams: ['project', 'targetHttpProxy', 'resource'],
      pathParams: ['project', 'targetHttpProxy']
    });
  }
};
,

exports.targetInstances = {

  /**
     @function targetInstances.aggregatedList
     @summary  Retrieves the list of target instances grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::TargetInstanceAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/targetInstances',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetInstances.delete
     @summary  Deletes the specified TargetInstance resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [targetInstance] Name of the TargetInstance resource to delete. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/targetInstances/{targetInstance}',
      params: params,
      requiredParams: ['project', 'targetInstance', 'zone'],
      pathParams: ['project', 'targetInstance', 'zone']
    });
  },
  
  /**
     @function targetInstances.get
     @summary  Returns the specified TargetInstance resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/targetInstances/{targetInstance}',
      params: params,
      requiredParams: ['project', 'targetInstance', 'zone'],
      pathParams: ['project', 'targetInstance', 'zone']
    });
  },
  
  /**
     @function targetInstances.insert
     @summary  Creates a TargetInstance resource in the specified project and zone using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetInstance} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/zones/{zone}/targetInstances',
      params: params,
      requiredParams: ['project', 'zone', 'resource'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function targetInstances.list
     @summary  Retrieves the list of TargetInstance resources available to the specified project and zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/targetInstances',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.targetPools = {

  /**
     @function targetPools.addHealthCheck
     @summary  Adds health check URL to targetPool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsAddHealthCheckRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] undefined **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to which health_check_url is to be added. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addHealthCheck: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/addHealthCheck',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.addInstance
     @summary  Adds instance url to targetPool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsAddInstanceRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] undefined **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to which instance_url is to be added. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  addInstance: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/addInstance',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.aggregatedList
     @summary  Retrieves the list of target pools grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::TargetPoolAggregatedList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  aggregatedList: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/targetPools',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetPools.delete
     @summary  Deletes the specified TargetPool resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.get
     @summary  Returns the specified TargetPool resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}',
      params: params,
      requiredParams: ['project', 'region', 'targetPool'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.getHealth
     @summary  Gets the most recent health check results for each IP for the given instance that is referenced by given TargetPool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::InstanceReference} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] undefined **Required**
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
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/getHealth',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.insert
     @summary  Creates a TargetPool resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPool} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools',
      params: params,
      requiredParams: ['project', 'region', 'resource'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetPools.list
     @summary  Retrieves the list of TargetPool resources available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/targetPools',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetPools.removeHealthCheck
     @summary  Removes health check URL from targetPool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsRemoveHealthCheckRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] undefined **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to which health_check_url is to be removed. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeHealthCheck: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/removeHealthCheck',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.removeInstance
     @summary  Removes instance URL from targetPool.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetPoolsRemoveInstanceRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] undefined **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource to which instance_url is to be removed. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  removeInstance: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/removeInstance',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  },
  
  /**
     @function targetPools.setBackup
     @summary  Changes backup pool configurations.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetReference} [resource] Resource that this API call acts on. **Required**
     @setting {optional Number} [failoverRatio] New failoverRatio value for the containing target pool.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [region] Name of the region scoping this request. **Required**
     @setting {String} [targetPool] Name of the TargetPool resource for which the backup is to be set. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  setBackup: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetPools/{targetPool}/setBackup',
      params: params,
      requiredParams: ['project', 'region', 'targetPool', 'resource'],
      pathParams: ['project', 'region', 'targetPool']
    });
  }
};
,

exports.targetVpnGateways = {

  /**
     @function targetVpnGateways.aggregatedList
     @summary  Retrieves the list of target VPN gateways grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/targetVpnGateways',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function targetVpnGateways.delete
     @summary  Deletes the specified TargetVpnGateway resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @setting {String} [targetVpnGateway] Name of the TargetVpnGateway resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/targetVpnGateways/{targetVpnGateway}',
      params: params,
      requiredParams: ['project', 'region', 'targetVpnGateway'],
      pathParams: ['project', 'region', 'targetVpnGateway']
    });
  },
  
  /**
     @function targetVpnGateways.get
     @summary  Returns the specified TargetVpnGateway resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @setting {String} [targetVpnGateway] Name of the TargetVpnGateway resource to return. **Required**
     @return {::TargetVpnGateway}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/targetVpnGateways/{targetVpnGateway}',
      params: params,
      requiredParams: ['project', 'region', 'targetVpnGateway'],
      pathParams: ['project', 'region', 'targetVpnGateway']
    });
  },
  
  /**
     @function targetVpnGateways.insert
     @summary  Creates a TargetVpnGateway resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::TargetVpnGateway} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/targetVpnGateways',
      params: params,
      requiredParams: ['project', 'region', 'resource'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function targetVpnGateways.list
     @summary  Retrieves the list of TargetVpnGateway resources available to the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::TargetVpnGatewayList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/targetVpnGateways',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};
,

exports.urlMaps = {

  /**
     @function urlMaps.delete
     @summary  Deletes the specified UrlMap resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.get
     @summary  Returns the specified UrlMap resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Name of the project scoping this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.insert
     @summary  Creates a UrlMap resource in the specified project using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/urlMaps',
      params: params,
      requiredParams: ['project', 'resource'],
      pathParams: ['project']
    });
  },
  
  /**
     @function urlMaps.list
     @summary  Retrieves the list of UrlMap resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Name of the project scoping this request. **Required**
     @return {::UrlMapList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/global/urlMaps',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function urlMaps.patch
     @summary  Update the entire content of the UrlMap resource. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  patch: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PATCH',
      url: API_BASE_URL+'{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap', 'resource'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.update
     @summary  Update the entire content of the UrlMap resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMap} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to update. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  update: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'PUT',
      url: API_BASE_URL+'{project}/global/urlMaps/{urlMap}',
      params: params,
      requiredParams: ['project', 'urlMap', 'resource'],
      pathParams: ['project', 'urlMap']
    });
  },
  
  /**
     @function urlMaps.validate
     @summary  Run static validation for the UrlMap. In particular, the tests of the provided UrlMap will be run. Calling this method does NOT create the UrlMap.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::UrlMapsValidateRequest} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Name of the project scoping this request. **Required**
     @setting {String} [urlMap] Name of the UrlMap resource to be validated as. **Required**
     @return {::UrlMapsValidateResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  validate: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/global/urlMaps/{urlMap}/validate',
      params: params,
      requiredParams: ['project', 'urlMap', 'resource'],
      pathParams: ['project', 'urlMap']
    });
  }
};
,

exports.vpnTunnels = {

  /**
     @function vpnTunnels.aggregatedList
     @summary  Retrieves the list of VPN tunnels grouped by scope.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/aggregated/vpnTunnels',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  },
  
  /**
     @function vpnTunnels.delete
     @summary  Deletes the specified VpnTunnel resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @setting {String} [vpnTunnel] Name of the VpnTunnel resource to delete. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/regions/{region}/vpnTunnels/{vpnTunnel}',
      params: params,
      requiredParams: ['project', 'region', 'vpnTunnel'],
      pathParams: ['project', 'region', 'vpnTunnel']
    });
  },
  
  /**
     @function vpnTunnels.get
     @summary  Returns the specified VpnTunnel resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/vpnTunnels/{vpnTunnel}',
      params: params,
      requiredParams: ['project', 'region', 'vpnTunnel'],
      pathParams: ['project', 'region', 'vpnTunnel']
    });
  },
  
  /**
     @function vpnTunnels.insert
     @summary  Creates a VpnTunnel resource in the specified project and region using the data included in the request.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::VpnTunnel} [resource] Resource that this API call acts on. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'{project}/regions/{region}/vpnTunnels',
      params: params,
      requiredParams: ['project', 'region', 'resource'],
      pathParams: ['project', 'region']
    });
  },
  
  /**
     @function vpnTunnels.list
     @summary  Retrieves the list of VpnTunnel resources contained in the specified project and region.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [region] The name of the region for this request. **Required**
     @return {::VpnTunnelList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/regions/{region}/vpnTunnels',
      params: params,
      requiredParams: ['project', 'region'],
      pathParams: ['project', 'region']
    });
  }
};
,

exports.zoneOperations = {

  /**
     @function zoneOperations.delete
     @summary  Deletes the specified zone-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to delete. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
  */
  delete: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'DELETE',
      url: API_BASE_URL+'{project}/zones/{zone}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'zone'],
      pathParams: ['operation', 'project', 'zone']
    });
  },
  
  /**
     @function zoneOperations.get
     @summary  Retrieves the specified zone-specific Operations resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {String} [operation] Name of the Operations resource to return. **Required**
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::Operation}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/operations/{operation}',
      params: params,
      requiredParams: ['operation', 'project', 'zone'],
      pathParams: ['operation', 'project', 'zone']
    });
  },
  
  /**
     @function zoneOperations.list
     @summary  Retrieves the list of Operation resources contained within the specified zone.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
     @setting {String} [project] Project ID for this request. **Required**
     @setting {String} [zone] Name of the zone scoping this request. **Required**
     @return {::OperationList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/cloud-platform - View and manage your data across Google Cloud Platform services
        * https://www.googleapis.com/auth/compute - View and manage your Google Compute Engine resources
        * https://www.googleapis.com/auth/compute.readonly - View your Google Compute Engine resources
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}/operations',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  }
};
,

exports.zones = {

  /**
     @function zones.get
     @summary  Returns the specified zone resource.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones/{zone}',
      params: params,
      requiredParams: ['project', 'zone'],
      pathParams: ['project', 'zone']
    });
  },
  
  /**
     @function zones.list
     @summary  Retrieves the list of zone resources available to the specified project.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [filter] Sets a filter expression for filtering listed resources, in the form filter={expression}. Your {expression} must be in the format: FIELD_NAME COMPARISON_STRING LITERAL_STRING.
  
  The FIELD_NAME is the name of the field you want to compare. Only atomic field types are supported (string, number, boolean). The COMPARISON_STRING must be either eq (equals) or ne (not equals). The LITERAL_STRING is the string value to filter to. The literal value must be valid for the type of field (string, number, boolean). For string fields, the literal value is interpreted as a regular expression using RE2 syntax. The literal value must match the entire field.
  
  For example, filter=name ne example-instance.
     @setting {optional Integer} [maxResults] Maximum count of results to be returned.
     @setting {optional String} [pageToken] Specifies a page token to use. Use this parameter if you want to list the next page of results. Set pageToken to the nextPageToken returned by a previous list request.
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
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'{project}/zones',
      params: params,
      requiredParams: ['project'],
      pathParams: ['project']
    });
  }
};
