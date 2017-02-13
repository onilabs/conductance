// This file was originally generated using conductance/tools/docker/generate-docker-api --version=v1.25

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
  @summary Docker Engine API 1.25
  @desc
    The Engine API is an HTTP API served by Docker Engine. It is the API the Docker client uses to communicate with the Engine, so everything the Docker client can do can be done with the API.
    
    Most of the client's commands map directly to API endpoints (e.g. `docker ps` is `GET /containers/json`). The notable exception is running containers, which consists of several API calls.
    
    # Errors
    
    The API uses standard HTTP status codes to indicate the success or failure of the API call. The body of the response will be JSON in the following format:
    
    ```
    {
      "message": "page not found"
    }
    ```
    
    # Versioning
    
    The API is usually changed in each release of Docker, so API calls are versioned to ensure that clients don't break.
    
    For Docker Engine 1.13, the API version is 1.25. To lock to this version, you prefix the URL with `/v1.25`. For example, calling `/info` is the same as calling `/v1.25/info`.
    
    Engine releases in the near future should support this version of the API, so your client will continue to work even if it is talking to a newer Engine.
    
    In previous versions of Docker, it was possible to access the API without providing a version. This behaviour is now deprecated will be removed in a future version of Docker.
    
    The API uses an open schema model, which means server may add extra properties to responses. Likewise, the server will ignore any extra query parameters and request body properties. When you write clients, you need to ignore additional properties in responses to ensure they do not break when talking to newer Docker daemons.
    
    This documentation is for version 1.25 of the API, which was introduced with Docker 1.13. Use this table to find documentation for previous versions of the API:
    
    Docker version  | API version | Changes
    ----------------|-------------|---------
    1.12.x | [1.24](https://docs.docker.com/engine/api/v1.24/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-24-api-changes)
    1.11.x | [1.23](https://docs.docker.com/engine/api/v1.23/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-23-api-changes)
    1.10.x | [1.22](https://docs.docker.com/engine/api/v1.22/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-22-api-changes)
    1.9.x | [1.21](https://docs.docker.com/engine/api/v1.21/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-21-api-changes)
    1.8.x | [1.20](https://docs.docker.com/engine/api/v1.20/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-20-api-changes)
    1.7.x | [1.19](https://docs.docker.com/engine/api/v1.19/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-19-api-changes)
    1.6.x | [1.18](https://docs.docker.com/engine/api/v1.18/) | [API changes](https://docs.docker.com/engine/api/version-history/#v1-18-api-changes)
    
    # Authentication
    
    Authentication for registries is handled client side. The client has to send authentication details to various endpoints that need to communicate with registries, such as `POST /images/(name)/push`. These are sent as `X-Registry-Auth` header as a Base64 encoded (JSON) string with the following structure:
    
    ```
    {
      "username": "string",
      "password": "string",
      "email": "string",
      "serveraddress": "string"
    }
    ```
    
    The `serveraddress` is a domain/IP without a protocol. Throughout this structure, double quotes are required.
    
    If you have already got an identity token from the [::systemAuth], you can just pass this instead of credentials:
    
    ```
    {
      "identitytoken": "9cbaf023786cd7..."
    }
    ```
    
*/

@ = require([
  'mho:std'
]);


/**
  @function containerList
  @summary List containers
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [all=false] Return all containers. By default, only running containers are shown
  @setting {optional Integer} [limit] Return this number of most recently created containers, including non-running ones.
  @setting {optional Boolean} [size=false] Return the size of container as fields `SizeRw` and `SizeRootFs`.
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the container list, encoded as JSON (a `map[string][]string`). For example, `{"status": ["paused"]}` will only return paused containers.
    
    Available filters:

    - `exited=<int>` containers with exit code of `<int>`
    - `status=`(`created`|`restarting`|`running`|`removing`|`paused`|`exited`|`dead`)
    - `label=key` or `label="key=value"` of a container label
    - `isolation=`(`default`|`process`|`hyperv`) (Windows daemon only)
    - `id=<ID>` a container's ID
    - `name=<name>` a container's name
    - `is-task=`(`true`|`false`)
    - `ancestor`=(`<image-name>[:<tag>]`, `<image id>`, or `<image@digest>`)
    - `before`=(`<container id>` or `<container name>`)
    - `since`=(`<container id>` or `<container name>`)
    - `volume`=(`<volume name>` or `<mount point destination>`)
    - `network`=(`<network id>` or `<network name>`)
    - `health`=(`starting`|`healthy`|`unhealthy`|`none`)
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `Id`: **String** The ID of this container
        - `Names`: **Array** The names that this container has been given
          - Elements of type **String**
        - `Image`: **String** The name of the image used when creating this container
        - `ImageID`: **String** The ID of the image that this container was created from
        - `Command`: **String** Command to run when starting the container
        - `Created`: **Integer** When the container was created
        - `Ports`: **Array** The ports exposed by this container
          - Elements of type **Object** An open port on a container (Required: PrivatePort, Type)
            - `IP`: **String**
            - `PrivatePort`: **Integer** Port on the container
            - `PublicPort`: **Integer** Port exposed on the host
            - `Type`: **String**
        - `SizeRw`: **Integer** The size of files that have been created or changed by this container
        - `SizeRootFs`: **Integer** The total size of all the files in this container
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `State`: **String** The state of this container (e.g. `Exited`)
        - `Status`: **String** Additional human-readable status of this container (e.g. `Exit 0`)
        - `HostConfig`: **Object**
          - `NetworkMode`: **String**
        - `NetworkSettings`: **Object** A summary of the container's network settings
          - `Networks`: **Object**
            - `[KEY]`: **Object** Configuration for a network endpoint.
              - `IPAMConfig`: **Object** IPAM configurations for the endpoint
                - `IPv4Address`: **String**
                - `IPv6Address`: **String**
                - `LinkLocalIPs`: **Array**
                  - Elements of type **String**
              - `Links`: **Array**
                - Elements of type **String**
              - `Aliases`: **Array**
                - Elements of type **String**
              - `NetworkID`: **String**
              - `EndpointID`: **String**
              - `Gateway`: **String**
              - `IPAddress`: **String**
              - `IPPrefixLen`: **Integer**
              - `IPv6Gateway`: **String**
              - `GlobalIPv6Address`: **String**
              - `GlobalIPv6PrefixLen`: **Integer**
              - `MacAddress`: **String**
        - `Mounts`: **Array**
          - Elements of type **Object**
            - `Target`: **String** Container path.
            - `Source`: **anything** Mount source (e.g. a volume name, a host path).
            - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
            - `ReadOnly`: **Boolean** Whether the mount should be read-only.
            - `BindOptions`: **Object** Optional configuration for the `bind` type.
              - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
            - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
              - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
              - `Labels`: **Object** User-defined key/value metadata.
                - `[KEY]`: **String**
              - `DriverConfig`: **Object** Map of driver specific options
                - `Name`: **String** Name of the driver to use to create the volume.
                - `Options`: **Object** key/value map of driver specific options.
                  - `[KEY]`: **String**
            - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
              - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
              - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
    
*/
exports.containerList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/json',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['all','limit','size','filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerCreate
  @summary Create a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [name] Assign the specified name to the container. Must match `/?[a-zA-Z0-9_-]+`.
  @setting {Object} [body] Container to create. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `Hostname`: **String** The hostname to use for the container, as a valid RFC 1123 hostname.
      - `Domainname`: **String** The domain name to use for the container.
      - `User`: **String** The user that commands are run as inside the container.
      - `AttachStdin`: **Boolean** Whether to attach to `stdin`. (Optional; default: 'false')
      - `AttachStdout`: **Boolean** Whether to attach to `stdout`. (Optional; default: 'true')
      - `AttachStderr`: **Boolean** Whether to attach to `stderr`. (Optional; default: 'true')
      - `ExposedPorts`: **Object** An object mapping ports to an empty object in the form:    `{"<port>/<tcp|udp>": {}}`  
        - `[KEY]`: **Object** (Optional; default: '{}')
          
      - `Tty`: **Boolean** Attach standard streams to a TTY, including `stdin` if it is not closed. (Optional; default: 'false')
      - `OpenStdin`: **Boolean** Open `stdin` (Optional; default: 'false')
      - `StdinOnce`: **Boolean** Close `stdin` after one attached client disconnects (Optional; default: 'false')
      - `Env`: **Array** A list of environment variables to set inside the container in the form `["VAR=value", ...]`  
        - Elements of type **String**
      - `Cmd`: **Array** Command to run specified as a string or an array of strings.
        - Elements of type **String**
      - `Healthcheck`: **Object** A test to perform to check that the container is healthy.
        - `Test`: **Array** The test to perform. Possible values are:    - `{}` inherit healthcheck from image or parent image  - `{"NONE"}` disable healthcheck  - `{"CMD", args...}` exec arguments directly  - `{"CMD-SHELL", command}` run command with system's default shell  
          - Elements of type **String**
        - `Interval`: **Integer** The time to wait between checks in nanoseconds. 0 means inherit.
        - `Timeout`: **Integer** The time to wait before considering the check to have hung. 0 means inherit.
        - `Retries`: **Integer** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
      - `ArgsEscaped`: **Boolean** Command is already escaped (Windows only)
      - `Image`: **String** The name of the image to use when creating the container
      - `Volumes`: **Object** An object mapping mount point paths inside the container to empty objects.
        - `additionalProperties`: **Object** (Optional; default: '{}')
          
      - `WorkingDir`: **String** The working directory for commands to run in.
      - `Entrypoint`: **Array** The entry point for the container as a string or an array of strings.    If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).  
        - Elements of type **String**
      - `NetworkDisabled`: **Boolean** Disable networking for the container.
      - `MacAddress`: **String** MAC address of the container.
      - `OnBuild`: **Array** `ONBUILD` metadata that were defined in the image's `Dockerfile`.
        - Elements of type **String**
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `StopSignal`: **String** Signal to stop a container as a string or unsigned integer. (Optional; default: ''SIGTERM'')
      - `StopTimeout`: **Integer** Timeout to stop a container in seconds. (Optional; default: '10')
      - `Shell`: **Array** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
        - Elements of type **String**
      - `HostConfig`: **Object** Container configuration that depends on the host we are running on
        - `CpuShares`: **Integer** An integer value representing this container's relative CPU weight versus other containers.
        - `Memory`: **Integer** Memory limit in bytes. (Optional; default: '0')
        - `CgroupParent`: **String** Path to `cgroups` under which the container's `cgroup` is created. If the path is not absolute, the path is considered to be relative to the `cgroups` path of the init process. Cgroups are created if they do not already exist.
        - `BlkioWeight`: **Integer** Block IO weight (relative weight).
        - `BlkioWeightDevice`: **Array** Block IO weight (relative device weight) in the form `[{"Path": "device_path", "Weight": weight}]`.  
          - Elements of type **Object**
            - `Path`: **String**
            - `Weight`: **Integer**
        - `BlkioDeviceReadBps`: **Array** Limit read rate (bytes per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceWriteBps`: **Array** Limit write rate (bytes per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceReadIOps`: **Array** Limit read rate (IO per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceWriteIOps`: **Array** Limit write rate (IO per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `CpuPeriod`: **Integer** The length of a CPU period in microseconds.
        - `CpuQuota`: **Integer** Microseconds of CPU time that the container can get in a CPU period.
        - `CpuRealtimePeriod`: **Integer** The length of a CPU real-time period in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
        - `CpuRealtimeRuntime`: **Integer** The length of a CPU real-time runtime in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
        - `CpusetCpus`: **String** CPUs in which to allow execution (e.g., `0-3`, `0,1`)
        - `CpusetMems`: **String** Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems.
        - `Devices`: **Array** A list of devices to add to the container.
          - Elements of type **Object** A device mapping between the host and container
            - `PathOnHost`: **String**
            - `PathInContainer`: **String**
            - `CgroupPermissions`: **String**
        - `DiskQuota`: **Integer** Disk limit (in bytes).
        - `KernelMemory`: **Integer** Kernel memory limit in bytes.
        - `MemoryReservation`: **Integer** Memory soft limit in bytes.
        - `MemorySwap`: **Integer** Total memory limit (memory + swap). Set as `-1` to enable unlimited swap.
        - `MemorySwappiness`: **Integer** Tune a container's memory swappiness behavior. Accepts an integer between 0 and 100.
        - `NanoCPUs`: **Integer** CPU quota in units of 10<sup>-9</sup> CPUs.
        - `OomKillDisable`: **Boolean** Disable OOM Killer for the container.
        - `PidsLimit`: **Integer** Tune a container's pids limit. Set -1 for unlimited.
        - `Ulimits`: **Array** A list of resource limits to set in the container. For example: `{"Name": "nofile", "Soft": 1024, "Hard": 2048}`"  
          - Elements of type **Object**
            - `Name`: **String** Name of ulimit
            - `Soft`: **Integer** Soft limit
            - `Hard`: **Integer** Hard limit
        - `CpuCount`: **Integer** The number of usable CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
        - `CpuPercent`: **Integer** The usable percentage of the available CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
        - `IOMaximumIOps`: **Integer** Maximum IOps for the container system drive (Windows only)
        - `IOMaximumBandwidth`: **Integer** Maximum IO in bytes per second for the container system drive (Windows only)
        - `Binds`: **Array** A list of volume bindings for this container. Each volume binding is a string in one of these forms:    - `host-src:container-dest` to bind-mount a host path into the container. Both `host-src`, and `container-dest` must be an _absolute_ path.  - `host-src:container-dest:ro` to make the bind-mount read-only inside the container. Both `host-src`, and `container-dest` must be an _absolute_ path.  - `volume-name:container-dest` to bind-mount a volume managed by a volume driver into the container. `container-dest` must be an _absolute_ path.  - `volume-name:container-dest:ro` to mount the volume read-only inside the container.  `container-dest` must be an _absolute_ path.  
          - Elements of type **String**
        - `ContainerIDFile`: **String** Path to a file where the container ID is written
        - `LogConfig`: **Object** The logging configuration for this container
          - `Type`: **String**
          - `Config`: **Object**
            - `[KEY]`: **String**
        - `NetworkMode`: **String** Network mode to use for this container. Supported standard values are: `bridge`, `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name to which this container should connect to.
        - `PortBindings`: **Object** A map of exposed container ports and the host port they should map to.
          - `[KEY]`: **Object**
            - `HostIp`: **String** The host IP address
            - `HostPort`: **String** The host port number, as a string
        - `RestartPolicy`: **Object** The behavior to apply when the container exits. The default is not to restart.    An ever increasing delay (double the previous delay, starting at 100ms) is added before each restart to prevent flooding the server.   (Optional; default: '{}')
          - `Name`: **String** - `always` Always restart  - `unless-stopped` Restart always except when the user has manually stopped the container  - `on-failure` Restart only when the container exit code is non-zero  
          - `MaximumRetryCount`: **Integer** If `on-failure` is used, the number of times to retry before giving up
        - `AutoRemove`: **Boolean** Automatically remove the container when the container's process exits. This has no effect if `RestartPolicy` is set.
        - `VolumeDriver`: **String** Driver that this container uses to mount volumes.
        - `VolumesFrom`: **Array** A list of volumes to inherit from another container, specified in the form `<container name>[:<ro|rw>]`.
          - Elements of type **String**
        - `Mounts`: **Array** Specification for mounts to be added to the container.
          - Elements of type **Object**
            - `Target`: **String** Container path.
            - `Source`: **anything** Mount source (e.g. a volume name, a host path).
            - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
            - `ReadOnly`: **Boolean** Whether the mount should be read-only.
            - `BindOptions`: **Object** Optional configuration for the `bind` type.
              - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
            - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
              - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
              - `Labels`: **Object** User-defined key/value metadata.
                - `[KEY]`: **String**
              - `DriverConfig`: **Object** Map of driver specific options
                - `Name`: **String** Name of the driver to use to create the volume.
                - `Options`: **Object** key/value map of driver specific options.
                  - `[KEY]`: **String**
            - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
              - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
              - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
        - `CapAdd`: **Array** A list of kernel capabilities to add to the container.
          - Elements of type **String**
        - `CapDrop`: **Array** A list of kernel capabilities to drop from the container.
          - Elements of type **String**
        - `Dns`: **Array** A list of DNS servers for the container to use.
          - Elements of type **String**
        - `DnsOptions`: **Array** A list of DNS options.
          - Elements of type **String**
        - `DnsSearch`: **Array** A list of DNS search domains.
          - Elements of type **String**
        - `ExtraHosts`: **Array** A list of hostnames/IP mappings to add to the container's `/etc/hosts` file. Specified in the form `["hostname:IP"]`.  
          - Elements of type **String**
        - `GroupAdd`: **Array** A list of additional groups that the container process will run as.
          - Elements of type **String**
        - `IpcMode`: **String** IPC namespace to use for the container.
        - `Cgroup`: **String** Cgroup to use for the container.
        - `Links`: **Array** A list of links for the container in the form `container_name:alias`.
          - Elements of type **String**
        - `OomScoreAdj`: **Integer** An integer value containing the score given to the container in order to tune OOM killer preferences.
        - `PidMode`: **String** Set the PID (Process) Namespace mode for the container. It can be either:    - `"container:<name|id>"`: joins another container's PID namespace  - `"host"`: use the host's PID namespace inside the container  
        - `Privileged`: **Boolean** Gives the container full access to the host.
        - `PublishAllPorts`: **Boolean** Allocates a random host port for all of a container's exposed ports.
        - `ReadonlyRootfs`: **Boolean** Mount the container's root filesystem as read only.
        - `SecurityOpt`: **Array** A list of string values to customize labels for MLS systems, such as SELinux.
          - Elements of type **String**
        - `StorageOpt`: **Object** Storage driver options for this container, in the form `{"size": "120G"}`.  
          - `[KEY]`: **String**
        - `Tmpfs`: **Object** A map of container directories which should be replaced by tmpfs mounts, and their corresponding mount options. For example: `{ "/run": "rw,noexec,nosuid,size=65536k" }`.  
          - `[KEY]`: **String**
        - `UTSMode`: **String** UTS namespace to use for the container.
        - `UsernsMode`: **String** Sets the usernamespace mode for the container when usernamespace remapping option is enabled.
        - `ShmSize`: **Integer** Size of `/dev/shm` in bytes. If omitted, the system uses 64MB.
        - `Sysctls`: **Object** A list of kernel parameters (sysctls) to set in the container. For example: `{"net.ipv4.ip_forward": "1"}`  
          - `[KEY]`: **String**
        - `Runtime`: **String** Runtime to use with this container.
        - `ConsoleSize`: **Array** Initial console size, as an `[height, width]` array. (Windows only)
          - Elements of type **Integer**
        - `Isolation`: **String** Isolation technology of the container. (Windows only)
      - `NetworkingConfig`: **Object** This container's networking configuration.
        - `EndpointsConfig`: **Object** A mapping of network name to endpoint configuration for that network.
          - `[KEY]`: **Object** Configuration for a network endpoint.
            - `IPAMConfig`: **Object** IPAM configurations for the endpoint
              - `IPv4Address`: **String**
              - `IPv6Address`: **String**
              - `LinkLocalIPs`: **Array**
                - Elements of type **String**
            - `Links`: **Array**
              - Elements of type **String**
            - `Aliases`: **Array**
              - Elements of type **String**
            - `NetworkID`: **String**
            - `EndpointID`: **String**
            - `Gateway`: **String**
            - `IPAddress`: **String**
            - `IPPrefixLen`: **Integer**
            - `IPv6Gateway`: **String**
            - `GlobalIPv6Address`: **String**
            - `GlobalIPv6PrefixLen`: **Integer**
            - `MacAddress`: **String**
    
    #### Return value
    - **Object** (Required: Id, Warnings)
      - `Id`: **String** The ID of the created container
      - `Warnings`: **Array** Warnings encountered when creating the container
        - Elements of type **String**
    
*/
exports.containerCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/create',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function containerInspect
  @summary Inspect a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [size=false] Return the size of container as fields `SizeRw` and `SizeRootFs`
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Return low-level information about a container.
    
    #### Return value
    - **Object**
      - `Id`: **String** The ID of the container
      - `Created`: **String** The time the container was created
      - `Path`: **String** The path to the command being run
      - `Args`: **Array** The arguments to the command being run
        - Elements of type **String**
      - `State`: **Object** The state of the container.
        - `Status`: **String** The status of the container. For example, `running` or `exited`.
        - `Running`: **Boolean** Whether this container is running.
        - `Paused`: **Boolean** Whether this container is paused.
        - `Restarting`: **Boolean** Whether this container is restarting.
        - `OOMKilled`: **Boolean** Whether this container has been killed because it ran out of memory.
        - `Dead`: **Boolean**
        - `Pid`: **Integer** The process ID of this container
        - `ExitCode`: **Integer** The last exit code of this container
        - `Error`: **String**
        - `StartedAt`: **String** The time when this container was last started.
        - `FinishedAt`: **String** The time when this container last exited.
      - `Image`: **String** The container's image
      - `ResolvConfPath`: **String**
      - `HostnamePath`: **String**
      - `HostsPath`: **String**
      - `LogPath`: **String**
      - `Node`: **Object** TODO
        
      - `Name`: **String**
      - `RestartCount`: **Integer**
      - `Driver`: **String**
      - `MountLabel`: **String**
      - `ProcessLabel`: **String**
      - `AppArmorProfile`: **String**
      - `ExecIDs`: **String**
      - `HostConfig`: **Object** Container configuration that depends on the host we are running on
        - `CpuShares`: **Integer** An integer value representing this container's relative CPU weight versus other containers.
        - `Memory`: **Integer** Memory limit in bytes. (Optional; default: '0')
        - `CgroupParent`: **String** Path to `cgroups` under which the container's `cgroup` is created. If the path is not absolute, the path is considered to be relative to the `cgroups` path of the init process. Cgroups are created if they do not already exist.
        - `BlkioWeight`: **Integer** Block IO weight (relative weight).
        - `BlkioWeightDevice`: **Array** Block IO weight (relative device weight) in the form `[{"Path": "device_path", "Weight": weight}]`.  
          - Elements of type **Object**
            - `Path`: **String**
            - `Weight`: **Integer**
        - `BlkioDeviceReadBps`: **Array** Limit read rate (bytes per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceWriteBps`: **Array** Limit write rate (bytes per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceReadIOps`: **Array** Limit read rate (IO per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `BlkioDeviceWriteIOps`: **Array** Limit write rate (IO per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
          - Elements of type **Object**
            - `Path`: **String** Device path
            - `Rate`: **Integer** Rate
        - `CpuPeriod`: **Integer** The length of a CPU period in microseconds.
        - `CpuQuota`: **Integer** Microseconds of CPU time that the container can get in a CPU period.
        - `CpuRealtimePeriod`: **Integer** The length of a CPU real-time period in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
        - `CpuRealtimeRuntime`: **Integer** The length of a CPU real-time runtime in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
        - `CpusetCpus`: **String** CPUs in which to allow execution (e.g., `0-3`, `0,1`)
        - `CpusetMems`: **String** Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems.
        - `Devices`: **Array** A list of devices to add to the container.
          - Elements of type **Object** A device mapping between the host and container
            - `PathOnHost`: **String**
            - `PathInContainer`: **String**
            - `CgroupPermissions`: **String**
        - `DiskQuota`: **Integer** Disk limit (in bytes).
        - `KernelMemory`: **Integer** Kernel memory limit in bytes.
        - `MemoryReservation`: **Integer** Memory soft limit in bytes.
        - `MemorySwap`: **Integer** Total memory limit (memory + swap). Set as `-1` to enable unlimited swap.
        - `MemorySwappiness`: **Integer** Tune a container's memory swappiness behavior. Accepts an integer between 0 and 100.
        - `NanoCPUs`: **Integer** CPU quota in units of 10<sup>-9</sup> CPUs.
        - `OomKillDisable`: **Boolean** Disable OOM Killer for the container.
        - `PidsLimit`: **Integer** Tune a container's pids limit. Set -1 for unlimited.
        - `Ulimits`: **Array** A list of resource limits to set in the container. For example: `{"Name": "nofile", "Soft": 1024, "Hard": 2048}`"  
          - Elements of type **Object**
            - `Name`: **String** Name of ulimit
            - `Soft`: **Integer** Soft limit
            - `Hard`: **Integer** Hard limit
        - `CpuCount`: **Integer** The number of usable CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
        - `CpuPercent`: **Integer** The usable percentage of the available CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
        - `IOMaximumIOps`: **Integer** Maximum IOps for the container system drive (Windows only)
        - `IOMaximumBandwidth`: **Integer** Maximum IO in bytes per second for the container system drive (Windows only)
        - `Binds`: **Array** A list of volume bindings for this container. Each volume binding is a string in one of these forms:    - `host-src:container-dest` to bind-mount a host path into the container. Both `host-src`, and `container-dest` must be an _absolute_ path.  - `host-src:container-dest:ro` to make the bind-mount read-only inside the container. Both `host-src`, and `container-dest` must be an _absolute_ path.  - `volume-name:container-dest` to bind-mount a volume managed by a volume driver into the container. `container-dest` must be an _absolute_ path.  - `volume-name:container-dest:ro` to mount the volume read-only inside the container.  `container-dest` must be an _absolute_ path.  
          - Elements of type **String**
        - `ContainerIDFile`: **String** Path to a file where the container ID is written
        - `LogConfig`: **Object** The logging configuration for this container
          - `Type`: **String**
          - `Config`: **Object**
            - `[KEY]`: **String**
        - `NetworkMode`: **String** Network mode to use for this container. Supported standard values are: `bridge`, `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name to which this container should connect to.
        - `PortBindings`: **Object** A map of exposed container ports and the host port they should map to.
          - `[KEY]`: **Object**
            - `HostIp`: **String** The host IP address
            - `HostPort`: **String** The host port number, as a string
        - `RestartPolicy`: **Object** The behavior to apply when the container exits. The default is not to restart.    An ever increasing delay (double the previous delay, starting at 100ms) is added before each restart to prevent flooding the server.   (Optional; default: '{}')
          - `Name`: **String** - `always` Always restart  - `unless-stopped` Restart always except when the user has manually stopped the container  - `on-failure` Restart only when the container exit code is non-zero  
          - `MaximumRetryCount`: **Integer** If `on-failure` is used, the number of times to retry before giving up
        - `AutoRemove`: **Boolean** Automatically remove the container when the container's process exits. This has no effect if `RestartPolicy` is set.
        - `VolumeDriver`: **String** Driver that this container uses to mount volumes.
        - `VolumesFrom`: **Array** A list of volumes to inherit from another container, specified in the form `<container name>[:<ro|rw>]`.
          - Elements of type **String**
        - `Mounts`: **Array** Specification for mounts to be added to the container.
          - Elements of type **Object**
            - `Target`: **String** Container path.
            - `Source`: **anything** Mount source (e.g. a volume name, a host path).
            - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
            - `ReadOnly`: **Boolean** Whether the mount should be read-only.
            - `BindOptions`: **Object** Optional configuration for the `bind` type.
              - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
            - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
              - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
              - `Labels`: **Object** User-defined key/value metadata.
                - `[KEY]`: **String**
              - `DriverConfig`: **Object** Map of driver specific options
                - `Name`: **String** Name of the driver to use to create the volume.
                - `Options`: **Object** key/value map of driver specific options.
                  - `[KEY]`: **String**
            - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
              - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
              - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
        - `CapAdd`: **Array** A list of kernel capabilities to add to the container.
          - Elements of type **String**
        - `CapDrop`: **Array** A list of kernel capabilities to drop from the container.
          - Elements of type **String**
        - `Dns`: **Array** A list of DNS servers for the container to use.
          - Elements of type **String**
        - `DnsOptions`: **Array** A list of DNS options.
          - Elements of type **String**
        - `DnsSearch`: **Array** A list of DNS search domains.
          - Elements of type **String**
        - `ExtraHosts`: **Array** A list of hostnames/IP mappings to add to the container's `/etc/hosts` file. Specified in the form `["hostname:IP"]`.  
          - Elements of type **String**
        - `GroupAdd`: **Array** A list of additional groups that the container process will run as.
          - Elements of type **String**
        - `IpcMode`: **String** IPC namespace to use for the container.
        - `Cgroup`: **String** Cgroup to use for the container.
        - `Links`: **Array** A list of links for the container in the form `container_name:alias`.
          - Elements of type **String**
        - `OomScoreAdj`: **Integer** An integer value containing the score given to the container in order to tune OOM killer preferences.
        - `PidMode`: **String** Set the PID (Process) Namespace mode for the container. It can be either:    - `"container:<name|id>"`: joins another container's PID namespace  - `"host"`: use the host's PID namespace inside the container  
        - `Privileged`: **Boolean** Gives the container full access to the host.
        - `PublishAllPorts`: **Boolean** Allocates a random host port for all of a container's exposed ports.
        - `ReadonlyRootfs`: **Boolean** Mount the container's root filesystem as read only.
        - `SecurityOpt`: **Array** A list of string values to customize labels for MLS systems, such as SELinux.
          - Elements of type **String**
        - `StorageOpt`: **Object** Storage driver options for this container, in the form `{"size": "120G"}`.  
          - `[KEY]`: **String**
        - `Tmpfs`: **Object** A map of container directories which should be replaced by tmpfs mounts, and their corresponding mount options. For example: `{ "/run": "rw,noexec,nosuid,size=65536k" }`.  
          - `[KEY]`: **String**
        - `UTSMode`: **String** UTS namespace to use for the container.
        - `UsernsMode`: **String** Sets the usernamespace mode for the container when usernamespace remapping option is enabled.
        - `ShmSize`: **Integer** Size of `/dev/shm` in bytes. If omitted, the system uses 64MB.
        - `Sysctls`: **Object** A list of kernel parameters (sysctls) to set in the container. For example: `{"net.ipv4.ip_forward": "1"}`  
          - `[KEY]`: **String**
        - `Runtime`: **String** Runtime to use with this container.
        - `ConsoleSize`: **Array** Initial console size, as an `[height, width]` array. (Windows only)
          - Elements of type **Integer**
        - `Isolation`: **String** Isolation technology of the container. (Windows only)
      - `GraphDriver`: **Object** Information about this container's graph driver.
        - `Name`: **String**
        - `Data`: **Object**
          - `[KEY]`: **String**
      - `SizeRw`: **Integer** The size of files that have been created or changed by this container.
      - `SizeRootFs`: **Integer** The total size of all the files in this container.
      - `Mounts`: **Array**
        - Elements of type **Object** A mount point inside a container
          - `Type`: **String**
          - `Name`: **String**
          - `Source`: **String**
          - `Destination`: **String**
          - `Driver`: **String**
          - `Mode`: **String**
          - `RW`: **Boolean**
          - `Propagation`: **String**
      - `Config`: **Object** Configuration for a container that is portable between hosts
        - `Hostname`: **String** The hostname to use for the container, as a valid RFC 1123 hostname.
        - `Domainname`: **String** The domain name to use for the container.
        - `User`: **String** The user that commands are run as inside the container.
        - `AttachStdin`: **Boolean** Whether to attach to `stdin`. (Optional; default: 'false')
        - `AttachStdout`: **Boolean** Whether to attach to `stdout`. (Optional; default: 'true')
        - `AttachStderr`: **Boolean** Whether to attach to `stderr`. (Optional; default: 'true')
        - `ExposedPorts`: **Object** An object mapping ports to an empty object in the form:    `{"<port>/<tcp|udp>": {}}`  
          - `[KEY]`: **Object** (Optional; default: '{}')
            
        - `Tty`: **Boolean** Attach standard streams to a TTY, including `stdin` if it is not closed. (Optional; default: 'false')
        - `OpenStdin`: **Boolean** Open `stdin` (Optional; default: 'false')
        - `StdinOnce`: **Boolean** Close `stdin` after one attached client disconnects (Optional; default: 'false')
        - `Env`: **Array** A list of environment variables to set inside the container in the form `["VAR=value", ...]`  
          - Elements of type **String**
        - `Cmd`: **Array** Command to run specified as a string or an array of strings.
          - Elements of type **String**
        - `Healthcheck`: **Object** A test to perform to check that the container is healthy.
          - `Test`: **Array** The test to perform. Possible values are:    - `{}` inherit healthcheck from image or parent image  - `{"NONE"}` disable healthcheck  - `{"CMD", args...}` exec arguments directly  - `{"CMD-SHELL", command}` run command with system's default shell  
            - Elements of type **String**
          - `Interval`: **Integer** The time to wait between checks in nanoseconds. 0 means inherit.
          - `Timeout`: **Integer** The time to wait before considering the check to have hung. 0 means inherit.
          - `Retries`: **Integer** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
        - `ArgsEscaped`: **Boolean** Command is already escaped (Windows only)
        - `Image`: **String** The name of the image to use when creating the container
        - `Volumes`: **Object** An object mapping mount point paths inside the container to empty objects.
          - `additionalProperties`: **Object** (Optional; default: '{}')
            
        - `WorkingDir`: **String** The working directory for commands to run in.
        - `Entrypoint`: **Array** The entry point for the container as a string or an array of strings.    If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).  
          - Elements of type **String**
        - `NetworkDisabled`: **Boolean** Disable networking for the container.
        - `MacAddress`: **String** MAC address of the container.
        - `OnBuild`: **Array** `ONBUILD` metadata that were defined in the image's `Dockerfile`.
          - Elements of type **String**
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `StopSignal`: **String** Signal to stop a container as a string or unsigned integer. (Optional; default: ''SIGTERM'')
        - `StopTimeout`: **Integer** Timeout to stop a container in seconds. (Optional; default: '10')
        - `Shell`: **Array** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
          - Elements of type **String**
      - `NetworkSettings`: **Object** TODO: check is correct
        - `Bridge`: **String**
        - `Gateway`: **String**
        - `Address`: **String**
        - `IPPrefixLen`: **Integer**
        - `MacAddress`: **String**
        - `PortMapping`: **String**
        - `Ports`: **Array**
          - Elements of type **Object** An open port on a container (Required: PrivatePort, Type)
            - `IP`: **String**
            - `PrivatePort`: **Integer** Port on the container
            - `PublicPort`: **Integer** Port exposed on the host
            - `Type`: **String**
    
*/
exports.containerInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/json',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['size'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerTop
  @summary List processes running inside a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [ps_args=-ef] The arguments to pass to `ps`. For example, `aux`
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    On Unix systems, this is done by running the `ps` command. This endpoint is not supported on Windows.
    
    #### Return value
    - **Object**
      - `Titles`: **Array** The ps column titles
        - Elements of type **String**
      - `Processes`: **Array** Each process running in the container, where each is process is an array of values corresponding to the titles
        - Elements of type **Array**
          - Elements of type **String**
    
*/
exports.containerTop = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/top',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['ps_args'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerLogs
  @summary Get container logs
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [follow=false] See description
  @setting {optional Boolean} [stdout=false] Return logs from `stdout`
  @setting {optional Boolean} [stderr=false] Return logs from `stderr`
  @setting {optional Integer} [since=0] Only return logs since this time, as a UNIX timestamp
  @setting {optional Boolean} [timestamps=false] Add timestamps to every log line
  @setting {optional String} [tail=all] Only return this number of log lines from the end of the logs. Specify as an integer or `all` to output all log lines.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Get `stdout` and `stderr` logs from a container.
    
    Note: This endpoint works only for containers with the `json-file` or `journald` logging driver.
    
    
    #### Setting 'follow'
    Return the logs as a stream.
    
    This will return a `101` HTTP response with a `Connection: upgrade` header, then hijack the HTTP connection to send raw output. For more information about hijacking and the stream format, [::containerAttach].
    
    
    #### Return value
    - **String**
    
*/
exports.containerLogs = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/logs',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['follow','stdout','stderr','since','timestamps','tail'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerChanges
  @summary Get changes on a container’s filesystem
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Returns which files in a container's filesystem have been added, deleted, or modified. The `Kind` of modification can be one of:
    
    - `0`: Modified
    - `1`: Added
    - `2`: Deleted
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `Path`: **String** Path to file that has changed
        - `Kind`: **Integer** Kind of change
    
*/
exports.containerChanges = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/changes',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerExport
  @summary Export a container
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Export the contents of a container as a tarball.
    
*/
exports.containerExport = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/export',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerStats
  @summary Get container stats based on resource usage
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [stream=true] Stream the output. If false, the stats will be output once and then it will disconnect.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    This endpoint returns a live stream of a container’s resource usage statistics.
    
    The `precpu_stats` is the CPU statistic of last read, which is used for calculating the CPU usage percentage. It is not the same as the `cpu_stats` field.
    
    
    #### Return value
    - **Object**
      
    
*/
exports.containerStats = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/stats',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['stream'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerResize
  @summary Resize a container TTY
  @return {String}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [h] Height of the tty session in characters
  @setting {optional Integer} [w] Width of the tty session in characters
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Resize the TTY for a container. You must restart the container for the resize to take effect.
    
*/
exports.containerResize = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/resize',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['h','w'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerStart
  @summary Start a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container. Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerStart = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/start',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerStop
  @summary Stop a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [t] Number of seconds to wait before killing the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerStop = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/stop',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['t'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerRestart
  @summary Restart a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [t] Number of seconds to wait before killing the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerRestart = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/restart',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['t'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerKill
  @summary Kill a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [signal=SIGKILL] Signal to send to the container as an integer or string (e.g. `SIGINT`)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Send a POSIX signal to a container, defaulting to killing to the container.
    
*/
exports.containerKill = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/kill',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['signal'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerUpdate
  @summary Update a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {Object} [update] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Change various configuration options of a container without having to recreate it.
    
    #### Setting 'update'
    
    - **Object**
      - `CpuShares`: **Integer** An integer value representing this container's relative CPU weight versus other containers.
      - `Memory`: **Integer** Memory limit in bytes. (Optional; default: '0')
      - `CgroupParent`: **String** Path to `cgroups` under which the container's `cgroup` is created. If the path is not absolute, the path is considered to be relative to the `cgroups` path of the init process. Cgroups are created if they do not already exist.
      - `BlkioWeight`: **Integer** Block IO weight (relative weight).
      - `BlkioWeightDevice`: **Array** Block IO weight (relative device weight) in the form `[{"Path": "device_path", "Weight": weight}]`.  
        - Elements of type **Object**
          - `Path`: **String**
          - `Weight`: **Integer**
      - `BlkioDeviceReadBps`: **Array** Limit read rate (bytes per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
        - Elements of type **Object**
          - `Path`: **String** Device path
          - `Rate`: **Integer** Rate
      - `BlkioDeviceWriteBps`: **Array** Limit write rate (bytes per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
        - Elements of type **Object**
          - `Path`: **String** Device path
          - `Rate`: **Integer** Rate
      - `BlkioDeviceReadIOps`: **Array** Limit read rate (IO per second) from a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
        - Elements of type **Object**
          - `Path`: **String** Device path
          - `Rate`: **Integer** Rate
      - `BlkioDeviceWriteIOps`: **Array** Limit write rate (IO per second) to a device, in the form `[{"Path": "device_path", "Rate": rate}]`.  
        - Elements of type **Object**
          - `Path`: **String** Device path
          - `Rate`: **Integer** Rate
      - `CpuPeriod`: **Integer** The length of a CPU period in microseconds.
      - `CpuQuota`: **Integer** Microseconds of CPU time that the container can get in a CPU period.
      - `CpuRealtimePeriod`: **Integer** The length of a CPU real-time period in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
      - `CpuRealtimeRuntime`: **Integer** The length of a CPU real-time runtime in microseconds. Set to 0 to allocate no time allocated to real-time tasks.
      - `CpusetCpus`: **String** CPUs in which to allow execution (e.g., `0-3`, `0,1`)
      - `CpusetMems`: **String** Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems.
      - `Devices`: **Array** A list of devices to add to the container.
        - Elements of type **Object** A device mapping between the host and container
          - `PathOnHost`: **String**
          - `PathInContainer`: **String**
          - `CgroupPermissions`: **String**
      - `DiskQuota`: **Integer** Disk limit (in bytes).
      - `KernelMemory`: **Integer** Kernel memory limit in bytes.
      - `MemoryReservation`: **Integer** Memory soft limit in bytes.
      - `MemorySwap`: **Integer** Total memory limit (memory + swap). Set as `-1` to enable unlimited swap.
      - `MemorySwappiness`: **Integer** Tune a container's memory swappiness behavior. Accepts an integer between 0 and 100.
      - `NanoCPUs`: **Integer** CPU quota in units of 10<sup>-9</sup> CPUs.
      - `OomKillDisable`: **Boolean** Disable OOM Killer for the container.
      - `PidsLimit`: **Integer** Tune a container's pids limit. Set -1 for unlimited.
      - `Ulimits`: **Array** A list of resource limits to set in the container. For example: `{"Name": "nofile", "Soft": 1024, "Hard": 2048}`"  
        - Elements of type **Object**
          - `Name`: **String** Name of ulimit
          - `Soft`: **Integer** Soft limit
          - `Hard`: **Integer** Hard limit
      - `CpuCount`: **Integer** The number of usable CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
      - `CpuPercent`: **Integer** The usable percentage of the available CPUs (Windows only).    On Windows Server containers, the processor resource controls are mutually exclusive. The order of precedence is `CPUCount` first, then `CPUShares`, and `CPUPercent` last.  
      - `IOMaximumIOps`: **Integer** Maximum IOps for the container system drive (Windows only)
      - `IOMaximumBandwidth`: **Integer** Maximum IO in bytes per second for the container system drive (Windows only)
      - `RestartPolicy`: **Object** The behavior to apply when the container exits. The default is not to restart.    An ever increasing delay (double the previous delay, starting at 100ms) is added before each restart to prevent flooding the server.   (Optional; default: '{}')
        - `Name`: **String** - `always` Always restart  - `unless-stopped` Restart always except when the user has manually stopped the container  - `on-failure` Restart only when the container exit code is non-zero  
        - `MaximumRetryCount`: **Integer** If `on-failure` is used, the number of times to retry before giving up
    
    #### Return value
    - **Object**
      - `Warnings`: **Array**
        - Elements of type **String**
    
*/
exports.containerUpdate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/update',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id','update'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['update'],
    headerParams: [],
  });
};


/**
  @function containerRename
  @summary Rename a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [name] New name for the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerRename = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/rename',
    params: params,
    block: block,
    
    requiredParams: ['id','name'],
    pathParams: ['id'],
    queryParams: ['name'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerPause
  @summary Pause a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Use the cgroups freezer to suspend all processes in a container.
    
    Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the cgroups freezer the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
    
    
*/
exports.containerPause = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/pause',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerUnpause
  @summary Unpause a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Resume a container which has been paused.
    
*/
exports.containerUnpause = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/unpause',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerAttach
  @summary Attach to a container
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container.Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.
  @setting {optional Boolean} [logs=false] See description
  @setting {optional Boolean} [stream=false] Stream attached streams from the the time the request was made onwards
  @setting {optional Boolean} [stdin=false] Attach to `stdin`
  @setting {optional Boolean} [stdout=false] Attach to `stdout`
  @setting {optional Boolean} [stderr=false] Attach to `stderr`
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Attach to a container to read its output or send it input. You can attach to the same container multiple times and you can reattach to containers that have been detached.
    
    Either the `stream` or `logs` parameter must be `true` for this endpoint to do anything.
    
    See [the documentation for the `docker attach` command](https://docs.docker.com/engine/reference/commandline/attach/) for more details.
    
    ### Hijacking
    
    This endpoint hijacks the HTTP connection to transport `stdin`, `stdout`, and `stderr` on the same socket.
    
    This is the response from the daemon for an attach request:
    
    ```
    HTTP/1.1 200 OK
    Content-Type: application/vnd.docker.raw-stream
    
    [STREAM]
    ```
    
    After the headers and two new lines, the TCP connection can now be used for raw, bidirectional communication between the client and server.
    
    To hint potential proxies about connection hijacking, the Docker client can also optionally send connection upgrade headers.
    
    For example, the client sends this request to upgrade the connection:
    
    ```
    POST /containers/16253994b7c4/attach?stream=1&stdout=1 HTTP/1.1
    Upgrade: tcp
    Connection: Upgrade
    ```
    
    The Docker daemon will respond with a `101 UPGRADED` response, and will similarly follow with the raw stream:
    
    ```
    HTTP/1.1 101 UPGRADED
    Content-Type: application/vnd.docker.raw-stream
    Connection: Upgrade
    Upgrade: tcp
    
    [STREAM]
    ```
    
    ### Stream format
    
    When the TTY setting is disabled in [::containerCreate], the stream over the hijacked connected is multiplexed to separate out `stdout` and `stderr`. The stream consists of a series of frames, each containing a header and a payload.
    
    The header contains the information which the stream writes (`stdout` or `stderr`). It also contains the size of the associated frame encoded in the last four bytes (`uint32`).
    
    It is encoded on the first eight bytes like this:
    
    ```go
    header := [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}
    ```
    
    `STREAM_TYPE` can be:
    
    - 0: `stdin` (is written on `stdout`)
    - 1: `stdout`
    - 2: `stderr`
    
    `SIZE1, SIZE2, SIZE3, SIZE4` are the four bytes of the `uint32` size encoded as big endian.
    
    Following the header is the payload, which is the specified number of bytes of `STREAM_TYPE`.
    
    The simplest way to implement this protocol is the following:
    
    1. Read 8 bytes.
    2. Choose `stdout` or `stderr` depending on the first byte.
    3. Extract the frame size from the last four bytes.
    4. Read the extracted size and output it on the correct output.
    5. Goto 1.
    
    ### Stream format when using a TTY
    
    When the TTY setting is enabled in [::containerCreate], the stream is not multiplexed. The data exchanged over the hijacked connection is simply the raw data from the process PTY and client's `stdin`.
    
    
    #### Setting 'logs'
    Replay previous logs from the container.
    
    This is useful for attaching to a container that has started and you want to output everything since the container started.
    
    If `stream` is also enabled, once all the previous output has been returned, it will seamlessly transition into streaming current output.
    
    
*/
exports.containerAttach = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/attach',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys','logs','stream','stdin','stdout','stderr'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerAttachWebsocket
  @summary Attach to a container via a websocket
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container.Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,`, or `_`.
  @setting {optional Boolean} [logs=false] Return logs
  @setting {optional Boolean} [stream=false] Return stream
  @setting {optional Boolean} [stdin=false] Attach to `stdin`
  @setting {optional Boolean} [stdout=false] Attach to `stdout`
  @setting {optional Boolean} [stderr=false] Attach to `stderr`
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerAttachWebsocket = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/attach/ws',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys','logs','stream','stdin','stdout','stderr'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerWait
  @summary Wait for a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Block until a container stops, then returns the exit code.
    
    #### Return value
    - **Object** (Required: StatusCode)
      - `StatusCode`: **Integer** Exit code of the container
    
*/
exports.containerWait = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/wait',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerDelete
  @summary Remove a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [v=false] Remove the volumes associated with the container.
  @setting {optional Boolean} [force=false] If the container is running, kill it before removing it.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.containerDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/containers/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['v','force'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerArchiveHead
  @summary Get information about files in a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Resource in the container’s filesystem to archive.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    A response header `X-Docker-Container-Path-Stat` is return containing a base64 - encoded JSON object with some filesystem header information about the path.
    
*/
exports.containerArchiveHead = function(client, params, block) {
  return client.performRequest({
    method: 'HEAD',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    block: block,
    
    requiredParams: ['id','path'],
    pathParams: ['id'],
    queryParams: ['path'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerGetArchive
  @summary Get an archive of a filesystem resource in a container
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Resource in the container’s filesystem to archive.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Get an tar archive of a resource in the filesystem of container id.
    
*/
exports.containerGetArchive = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    block: block,
    
    requiredParams: ['id','path'],
    pathParams: ['id'],
    queryParams: ['path'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function containerPutArchive
  @summary Extract an archive of files or folders to a directory in a container
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Path to a directory in the container to extract the archive’s contents into. 
  @setting {optional String} [noOverwriteDirNonDir] If “1”, “true”, or “True” then it will be an error if unpacking the given content would cause an existing directory to be replaced with a non-directory and vice versa.
  @setting {Object} [inputStream] The input stream must be a tar archive compressed with one of the following algorithms: identity (no compression), gzip, bzip2, xz.. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Upload a tar archive to be extracted to a path in the filesystem of container id.
    
    #### Setting 'inputStream'
    
    - **String**
    
*/
exports.containerPutArchive = function(client, params, block) {
  return client.performRequest({
    method: 'PUT',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    block: block,
    body: 'string',
    requiredParams: ['id','path','inputStream'],
    pathParams: ['id'],
    queryParams: ['path','noOverwriteDirNonDir'],
    bodyParams: ['inputStream'],
    headerParams: [],
  });
};


/**
  @function containerPrune
  @summary Delete stopped containers
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
    #### Return value
    - **Object**
      - `ContainersDeleted`: **Array** Container IDs that were deleted
        - Elements of type **String**
      - `SpaceReclaimed`: **Integer** Disk space reclaimed in bytes
    
*/
exports.containerPrune = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/prune',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageList
  @summary List Images
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [all=false] Show all images. Only images from a final layer (no children) are shown by default.
  @setting {optional String} [filters] See description
  @setting {optional Boolean} [digests=false] Show digest information as a `RepoDigests` field on each image.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the images list.
    
    Available filters:

    - `dangling=true`
    - `label=key` or `label="key=value"` of an image label
    - `before`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)
    - `since`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)
    - `reference`=(`<image-name>[:<tag>]`)
    
    
    #### Return value
    - **Array**
      - Elements of type **Object** (Required: Id, ParentId, RepoTags, RepoDigests, Created, Size, SharedSize, VirtualSize, Labels, Containers)
        - `Id`: **String**
        - `ParentId`: **String**
        - `RepoTags`: **Array**
          - Elements of type **String**
        - `RepoDigests`: **Array**
          - Elements of type **String**
        - `Created`: **Integer**
        - `Size`: **Integer**
        - `SharedSize`: **Integer**
        - `VirtualSize`: **Integer**
        - `Labels`: **Object**
          - `[KEY]`: **String**
        - `Containers`: **Integer**
    
*/
exports.imageList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/json',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['all','filters','digests'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageBuild
  @summary Build an image
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [inputStream] A tar archive compressed with one of the following algorithms: identity (no compression), gzip, bzip2, xz.. See description.
  @setting {optional String} [dockerfile=Dockerfile] Path within the build context to the `Dockerfile`. This is ignored if `remote` is specified and points to an external `Dockerfile`.
  @setting {optional String} [t] A name and optional tag to apply to the image in the `name:tag` format. If you omit the tag the default `latest` value is assumed. You can provide several `t` parameters.
  @setting {optional String} [remote] A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are placed into a file called `Dockerfile` and the image is built from that file. If the URI points to a tarball, the file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points to a tarball and the `dockerfile` parameter is also specified, there must be a file with the corresponding path inside the tarball.
  @setting {optional Boolean} [q=false] Suppress verbose build output.
  @setting {optional Boolean} [nocache=false] Do not use the cache when building the image.
  @setting {optional String} [cachefrom] JSON array of images used for build cache resolution.
  @setting {optional String} [pull] Attempt to pull the image even if an older image exists locally.
  @setting {optional Boolean} [rm=true] Remove intermediate containers after a successful build.
  @setting {optional Boolean} [forcerm=false] Always remove intermediate containers, even upon failure.
  @setting {optional Integer} [memory] Set memory limit for build.
  @setting {optional Integer} [memswap] Total memory (memory + swap). Set as `-1` to disable swap.
  @setting {optional Integer} [cpushares] CPU shares (relative weight).
  @setting {optional String} [cpusetcpus] CPUs in which to allow execution (e.g., `0-3`, `0,1`).
  @setting {optional Integer} [cpuperiod] The length of a CPU period in microseconds.
  @setting {optional Integer} [cpuquota] Microseconds of CPU time that the container can get in a CPU period.
  @setting {optional Integer} [buildargs] JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable expansion in other `Dockerfile` instructions. This is not meant for passing secret values. [Read more about the buildargs instruction.](https://docs.docker.com/engine/reference/builder/#arg)
  @setting {optional Integer} [shmsize] Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB.
  @setting {optional Boolean} [squash] Squash the resulting images layers into a single layer. *(Experimental release only.)*
  @setting {optional String} [labels] Arbitrary key/value labels to set on the image, as a JSON map of string pairs.
  @setting {optional String} [networkmode] Sets the networking mode for the run commands during build. Supported standard values are: `bridge`, `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name to which this container should connect to.
  @setting {optional String} [Content-type=application/tar] 
  @setting {optional String} [X-Registry-Config] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Build an image from a tar archive with a `Dockerfile` in it.
    
    The `Dockerfile` specifies how the image is built from the tar archive. It is typically in the archive's root, but can be at a different path or have a different name by specifying the `dockerfile` parameter. [See the `Dockerfile` reference for more information](https://docs.docker.com/engine/reference/builder/).
    
    The Docker daemon performs a preliminary validation of the `Dockerfile` before starting the build, and returns an error if the syntax is incorrect. After that, each instruction is run one-by-one until the ID of the new image is output.
    
    The build is canceled if the client drops the connection by quitting or being killed.
    
    
    #### Setting 'inputStream'
    
    - **String**
    
    #### Setting 'X-Registry-Config'
    This is a base64-encoded JSON object with auth configurations for multiple registries that a build may refer to.
    
    The key is a registry URL, and the value is an auth configuration object, [as described in the authentication section](#section/Authentication). For example:
    
    ```
    {
      "docker.example.com": {
        "username": "janedoe",
        "password": "hunter2"
      },
      "https://index.docker.io/v1/": {
        "username": "mobydock",
        "password": "conta1n3rize14"
      }
    }
    ```
    
    Only the registry domain name (and port if not the default 443) are required. However, for legacy reasons, the Docker Hub registry must be specified with both a `https://` prefix and a `/v1/` suffix even though Docker will prefer to use the v2 registry API.
    
    
*/
exports.imageBuild = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/build',
    params: params,
    block: block,
    body: 'string',
    requiredParams: [],
    pathParams: [],
    queryParams: ['dockerfile','t','remote','q','nocache','cachefrom','pull','rm','forcerm','memory','memswap','cpushares','cpusetcpus','cpuperiod','cpuquota','buildargs','shmsize','squash','labels','networkmode'],
    bodyParams: ['inputStream'],
    headerParams: ['Content-type','X-Registry-Config'],
  });
};


/**
  @function imageCreate
  @summary Create an image
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [fromImage] Name of the image to pull. The name may include a tag or digest. This parameter may only be used when pulling an image. The pull is cancelled if the HTTP connection is closed.
  @setting {optional String} [fromSrc] Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image.
  @setting {optional String} [repo] Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image.
  @setting {optional String} [tag] Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled.
  @setting {Object} [inputImage] Image content if the value `-` has been specified in fromSrc query parameter. See description.
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration. [See the authentication section for details.](#section/Authentication)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Create an image by either pulling it from a registry or importing it.
    
    #### Setting 'inputImage'
    
    - **String**
    
*/
exports.imageCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/create',
    params: params,
    block: block,
    body: 'string',
    requiredParams: [],
    pathParams: [],
    queryParams: ['fromImage','fromSrc','repo','tag'],
    bodyParams: ['inputImage'],
    headerParams: ['X-Registry-Auth'],
  });
};


/**
  @function imageInspect
  @summary Inspect an image
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or id
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Return low-level information about an image.
    
    #### Return value
    - **Object**
      - `Id`: **String**
      - `RepoTags`: **Array**
        - Elements of type **String**
      - `RepoDigests`: **Array**
        - Elements of type **String**
      - `Parent`: **String**
      - `Comment`: **String**
      - `Created`: **String**
      - `Container`: **String**
      - `ContainerConfig`: **Object** Configuration for a container that is portable between hosts
        - `Hostname`: **String** The hostname to use for the container, as a valid RFC 1123 hostname.
        - `Domainname`: **String** The domain name to use for the container.
        - `User`: **String** The user that commands are run as inside the container.
        - `AttachStdin`: **Boolean** Whether to attach to `stdin`. (Optional; default: 'false')
        - `AttachStdout`: **Boolean** Whether to attach to `stdout`. (Optional; default: 'true')
        - `AttachStderr`: **Boolean** Whether to attach to `stderr`. (Optional; default: 'true')
        - `ExposedPorts`: **Object** An object mapping ports to an empty object in the form:    `{"<port>/<tcp|udp>": {}}`  
          - `[KEY]`: **Object** (Optional; default: '{}')
            
        - `Tty`: **Boolean** Attach standard streams to a TTY, including `stdin` if it is not closed. (Optional; default: 'false')
        - `OpenStdin`: **Boolean** Open `stdin` (Optional; default: 'false')
        - `StdinOnce`: **Boolean** Close `stdin` after one attached client disconnects (Optional; default: 'false')
        - `Env`: **Array** A list of environment variables to set inside the container in the form `["VAR=value", ...]`  
          - Elements of type **String**
        - `Cmd`: **Array** Command to run specified as a string or an array of strings.
          - Elements of type **String**
        - `Healthcheck`: **Object** A test to perform to check that the container is healthy.
          - `Test`: **Array** The test to perform. Possible values are:    - `{}` inherit healthcheck from image or parent image  - `{"NONE"}` disable healthcheck  - `{"CMD", args...}` exec arguments directly  - `{"CMD-SHELL", command}` run command with system's default shell  
            - Elements of type **String**
          - `Interval`: **Integer** The time to wait between checks in nanoseconds. 0 means inherit.
          - `Timeout`: **Integer** The time to wait before considering the check to have hung. 0 means inherit.
          - `Retries`: **Integer** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
        - `ArgsEscaped`: **Boolean** Command is already escaped (Windows only)
        - `Image`: **String** The name of the image to use when creating the container
        - `Volumes`: **Object** An object mapping mount point paths inside the container to empty objects.
          - `additionalProperties`: **Object** (Optional; default: '{}')
            
        - `WorkingDir`: **String** The working directory for commands to run in.
        - `Entrypoint`: **Array** The entry point for the container as a string or an array of strings.    If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).  
          - Elements of type **String**
        - `NetworkDisabled`: **Boolean** Disable networking for the container.
        - `MacAddress`: **String** MAC address of the container.
        - `OnBuild`: **Array** `ONBUILD` metadata that were defined in the image's `Dockerfile`.
          - Elements of type **String**
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `StopSignal`: **String** Signal to stop a container as a string or unsigned integer. (Optional; default: ''SIGTERM'')
        - `StopTimeout`: **Integer** Timeout to stop a container in seconds. (Optional; default: '10')
        - `Shell`: **Array** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
          - Elements of type **String**
      - `DockerVersion`: **String**
      - `Author`: **String**
      - `Config`: **Object** Configuration for a container that is portable between hosts
        - `Hostname`: **String** The hostname to use for the container, as a valid RFC 1123 hostname.
        - `Domainname`: **String** The domain name to use for the container.
        - `User`: **String** The user that commands are run as inside the container.
        - `AttachStdin`: **Boolean** Whether to attach to `stdin`. (Optional; default: 'false')
        - `AttachStdout`: **Boolean** Whether to attach to `stdout`. (Optional; default: 'true')
        - `AttachStderr`: **Boolean** Whether to attach to `stderr`. (Optional; default: 'true')
        - `ExposedPorts`: **Object** An object mapping ports to an empty object in the form:    `{"<port>/<tcp|udp>": {}}`  
          - `[KEY]`: **Object** (Optional; default: '{}')
            
        - `Tty`: **Boolean** Attach standard streams to a TTY, including `stdin` if it is not closed. (Optional; default: 'false')
        - `OpenStdin`: **Boolean** Open `stdin` (Optional; default: 'false')
        - `StdinOnce`: **Boolean** Close `stdin` after one attached client disconnects (Optional; default: 'false')
        - `Env`: **Array** A list of environment variables to set inside the container in the form `["VAR=value", ...]`  
          - Elements of type **String**
        - `Cmd`: **Array** Command to run specified as a string or an array of strings.
          - Elements of type **String**
        - `Healthcheck`: **Object** A test to perform to check that the container is healthy.
          - `Test`: **Array** The test to perform. Possible values are:    - `{}` inherit healthcheck from image or parent image  - `{"NONE"}` disable healthcheck  - `{"CMD", args...}` exec arguments directly  - `{"CMD-SHELL", command}` run command with system's default shell  
            - Elements of type **String**
          - `Interval`: **Integer** The time to wait between checks in nanoseconds. 0 means inherit.
          - `Timeout`: **Integer** The time to wait before considering the check to have hung. 0 means inherit.
          - `Retries`: **Integer** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
        - `ArgsEscaped`: **Boolean** Command is already escaped (Windows only)
        - `Image`: **String** The name of the image to use when creating the container
        - `Volumes`: **Object** An object mapping mount point paths inside the container to empty objects.
          - `additionalProperties`: **Object** (Optional; default: '{}')
            
        - `WorkingDir`: **String** The working directory for commands to run in.
        - `Entrypoint`: **Array** The entry point for the container as a string or an array of strings.    If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).  
          - Elements of type **String**
        - `NetworkDisabled`: **Boolean** Disable networking for the container.
        - `MacAddress`: **String** MAC address of the container.
        - `OnBuild`: **Array** `ONBUILD` metadata that were defined in the image's `Dockerfile`.
          - Elements of type **String**
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `StopSignal`: **String** Signal to stop a container as a string or unsigned integer. (Optional; default: ''SIGTERM'')
        - `StopTimeout`: **Integer** Timeout to stop a container in seconds. (Optional; default: '10')
        - `Shell`: **Array** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
          - Elements of type **String**
      - `Architecture`: **String**
      - `Os`: **String**
      - `Size`: **Integer**
      - `VirtualSize`: **Integer**
      - `GraphDriver`: **Object** Information about this container's graph driver.
        - `Name`: **String**
        - `Data`: **Object**
          - `[KEY]`: **String**
      - `RootFS`: **Object**
        - `Type`: **String**
        - `Layers`: **Array**
          - Elements of type **String**
        - `BaseLayer`: **String**
    
*/
exports.imageInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/json',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageHistory
  @summary Get the history of an image
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Return parent layers of an image.
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `Id`: **String**
        - `Created`: **Integer**
        - `CreatedBy`: **String**
        - `Tags`: **Array**
          - Elements of type **String**
        - `Size`: **Integer**
        - `Comment`: **String**
    
*/
exports.imageHistory = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/history',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imagePush
  @summary Push an image
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID.
  @setting {optional String} [tag] The tag to associate with the image on the registry.
  @setting {String} [X-Registry-Auth] A base64-encoded auth configuration. [See the authentication section for details.](#section/Authentication)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Push an image to a registry.
    
    If you wish to push an image on to a private registry, that image must already have a tag which references the registry. For example, `registry.example.com/myimage:latest`.
    
    The push is cancelled if the HTTP connection is closed.
    
    
*/
exports.imagePush = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/{name}/push',
    params: params,
    block: block,
    
    requiredParams: ['name','X-Registry-Auth'],
    pathParams: ['name'],
    queryParams: ['tag'],
    bodyParams: [],
    headerParams: ['X-Registry-Auth'],
  });
};


/**
  @function imageTag
  @summary Tag an image
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID to tag.
  @setting {optional String} [repo] The repository to tag in. For example, `someuser/someimage`.
  @setting {optional String} [tag] The name of the new tag.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Tag an image so that it becomes part of a repository.
    
*/
exports.imageTag = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/{name}/tag',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['repo','tag'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageDelete
  @summary Remove an image
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
  @setting {optional Boolean} [force=false] Remove the image even if it is being used by stopped containers or has other tags
  @setting {optional Boolean} [noprune=false] Do not delete untagged parent images
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Remove an image, along with any untagged parent images that were referenced by that image.
    
    Images can't be removed if they have descendant images, are being used by a running container or are being used by a build.
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `Untagged`: **String** The image ID of an image that was untagged
        - `Deleted`: **String** The image ID of an image that was deleted
    
*/
exports.imageDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/images/{name}',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force','noprune'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageSearch
  @summary Search images
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [term] Term to search
  @setting {optional Integer} [limit] Maximum number of results to return
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Search for an image on Docker Hub.
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the images list. Available filters:

    
    - `stars=<number>`
    - `is-automated=(true|false)`
    - `is-official=(true|false)`
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `description`: **String**
        - `is_official`: **Boolean**
        - `is_automated`: **Boolean**
        - `name`: **String**
        - `star_count`: **Integer**
    
*/
exports.imageSearch = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/search',
    params: params,
    block: block,
    
    requiredParams: ['term'],
    pathParams: [],
    queryParams: ['term','limit','filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imagePrune
  @summary Delete unused images
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    - `dangling=<boolean>` When set to `true` (or `1`), prune only
       unused *and* untagged images. When set to `false`
       (or `0`), all unused images are pruned.
    
    
    #### Return value
    - **Object**
      - `ImagesDeleted`: **Array** Images that were deleted
        - Elements of type **Object**
          - `Untagged`: **String** The image ID of an image that was untagged
          - `Deleted`: **String** The image ID of an image that was deleted
      - `SpaceReclaimed`: **Integer** Disk space reclaimed in bytes
    
*/
exports.imagePrune = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/prune',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function systemAuth
  @summary Check auth configuration
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [authConfig] Authentication to check. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Validate credentials for a registry and, if available, get an identity token for accessing the registry without password.
    
    #### Setting 'authConfig'
    
    - **Object**
      - `username`: **String**
      - `password`: **String**
      - `email`: **String**
      - `serveraddress`: **String**
    
    #### Return value
    - **Object** (Required: Status)
      - `Status`: **String** The status of the authentication
      - `IdentityToken`: **String** An opaque token used to authenticate a user after a successful login
    
*/
exports.systemAuth = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/auth',
    params: params,
    block: block,
    body: 'json',
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: ['authConfig'],
    headerParams: [],
  });
};


/**
  @function systemInfo
  @summary Get system information
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `Architecture`: **String**
      - `Containers`: **Integer**
      - `ContainersRunning`: **Integer**
      - `ContainersStopped`: **Integer**
      - `ContainersPaused`: **Integer**
      - `CpuCfsPeriod`: **Boolean**
      - `CpuCfsQuota`: **Boolean**
      - `Debug`: **Boolean**
      - `DiscoveryBackend`: **String**
      - `DockerRootDir`: **String**
      - `Driver`: **String**
      - `DriverStatus`: **Array**
        - Elements of type **Array**
          - Elements of type **String**
      - `SystemStatus`: **Array**
        - Elements of type **Array**
          - Elements of type **String**
      - `Plugins`: **Object**
        - `Volume`: **Array**
          - Elements of type **String**
        - `Network`: **Array**
          - Elements of type **String**
      - `ExperimentalBuild`: **Boolean**
      - `HttpProxy`: **String**
      - `HttpsProxy`: **String**
      - `ID`: **String**
      - `IPv4Forwarding`: **Boolean**
      - `Images`: **Integer**
      - `IndexServerAddress`: **String**
      - `InitPath`: **String**
      - `InitSha1`: **String**
      - `KernelVersion`: **String**
      - `Labels`: **Array**
        - Elements of type **String**
      - `MemTotal`: **Integer**
      - `MemoryLimit`: **Boolean**
      - `NCPU`: **Integer**
      - `NEventsListener`: **Integer**
      - `NFd`: **Integer**
      - `NGoroutines`: **Integer**
      - `Name`: **String**
      - `NoProxy`: **String**
      - `OomKillDisable`: **Boolean**
      - `OSType`: **String**
      - `OomScoreAdj`: **Integer**
      - `OperatingSystem`: **String**
      - `RegistryConfig`: **Object**
        - `IndexConfigs`: **Object**
          - `[KEY]`: **Object**
            - `Mirrors`: **Array**
              - Elements of type **String**
            - `Name`: **String**
            - `Official`: **Boolean**
            - `Secure`: **Boolean**
        - `InsecureRegistryCIDRs`: **Array**
          - Elements of type **String**
      - `SwapLimit`: **Boolean**
      - `SystemTime`: **String**
      - `ServerVersion`: **String**
    
*/
exports.systemInfo = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/info',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function systemVersion
  @summary Get version
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Returns the version of Docker that is running and various information about the system that Docker is running on.
    
    #### Return value
    - **Object**
      - `Version`: **String**
      - `ApiVersion`: **String**
      - `MinAPIVersion`: **String**
      - `GitCommit`: **String**
      - `GoVersion`: **String**
      - `Os`: **String**
      - `Arch`: **String**
      - `KernelVersion`: **String**
      - `Experimental`: **Boolean**
      - `BuildTime`: **String**
    
*/
exports.systemVersion = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/version',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function systemPing
  @summary Ping
  @return {String}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    This is a dummy endpoint you can use to test if the server is accessible.
    
*/
exports.systemPing = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/_ping',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageCommit
  @summary Create a new image from a container
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [containerConfig] The container configuration. See description.
  @setting {optional String} [container] The ID or name of the container to commit
  @setting {optional String} [repo] Repository name for the created image
  @setting {optional String} [tag] Tag name for the create image
  @setting {optional String} [comment] Commit message
  @setting {optional String} [author] Author of the image (e.g., `John Hannibal Smith <hannibal@a-team.com>`)
  @setting {optional Boolean} [pause=true] Whether to pause the container before committing
  @setting {optional String} [changes] `Dockerfile` instructions to apply while committing
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'containerConfig'
    
    - **Object** Configuration for a container that is portable between hosts
      - `Hostname`: **String** The hostname to use for the container, as a valid RFC 1123 hostname.
      - `Domainname`: **String** The domain name to use for the container.
      - `User`: **String** The user that commands are run as inside the container.
      - `AttachStdin`: **Boolean** Whether to attach to `stdin`. (Optional; default: 'false')
      - `AttachStdout`: **Boolean** Whether to attach to `stdout`. (Optional; default: 'true')
      - `AttachStderr`: **Boolean** Whether to attach to `stderr`. (Optional; default: 'true')
      - `ExposedPorts`: **Object** An object mapping ports to an empty object in the form:    `{"<port>/<tcp|udp>": {}}`  
        - `[KEY]`: **Object** (Optional; default: '{}')
          
      - `Tty`: **Boolean** Attach standard streams to a TTY, including `stdin` if it is not closed. (Optional; default: 'false')
      - `OpenStdin`: **Boolean** Open `stdin` (Optional; default: 'false')
      - `StdinOnce`: **Boolean** Close `stdin` after one attached client disconnects (Optional; default: 'false')
      - `Env`: **Array** A list of environment variables to set inside the container in the form `["VAR=value", ...]`  
        - Elements of type **String**
      - `Cmd`: **Array** Command to run specified as a string or an array of strings.
        - Elements of type **String**
      - `Healthcheck`: **Object** A test to perform to check that the container is healthy.
        - `Test`: **Array** The test to perform. Possible values are:    - `{}` inherit healthcheck from image or parent image  - `{"NONE"}` disable healthcheck  - `{"CMD", args...}` exec arguments directly  - `{"CMD-SHELL", command}` run command with system's default shell  
          - Elements of type **String**
        - `Interval`: **Integer** The time to wait between checks in nanoseconds. 0 means inherit.
        - `Timeout`: **Integer** The time to wait before considering the check to have hung. 0 means inherit.
        - `Retries`: **Integer** The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
      - `ArgsEscaped`: **Boolean** Command is already escaped (Windows only)
      - `Image`: **String** The name of the image to use when creating the container
      - `Volumes`: **Object** An object mapping mount point paths inside the container to empty objects.
        - `additionalProperties`: **Object** (Optional; default: '{}')
          
      - `WorkingDir`: **String** The working directory for commands to run in.
      - `Entrypoint`: **Array** The entry point for the container as a string or an array of strings.    If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no `ENTRYPOINT` instruction in the `Dockerfile`).  
        - Elements of type **String**
      - `NetworkDisabled`: **Boolean** Disable networking for the container.
      - `MacAddress`: **String** MAC address of the container.
      - `OnBuild`: **Array** `ONBUILD` metadata that were defined in the image's `Dockerfile`.
        - Elements of type **String**
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `StopSignal`: **String** Signal to stop a container as a string or unsigned integer. (Optional; default: ''SIGTERM'')
      - `StopTimeout`: **Integer** Timeout to stop a container in seconds. (Optional; default: '10')
      - `Shell`: **Array** Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
        - Elements of type **String**
    
    #### Return value
    - **Object** Response to an API call that returns just an Id (Required: Id)
      - `Id`: **String** The id of the newly created object.
    
*/
exports.imageCommit = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/commit',
    params: params,
    block: block,
    body: 'json',
    requiredParams: [],
    pathParams: [],
    queryParams: ['container','repo','tag','comment','author','pause','changes'],
    bodyParams: ['containerConfig'],
    headerParams: [],
  });
};


/**
  @function systemEvents
  @summary Monitor events
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [since] Show events created since this timestamp then stream new events.
  @setting {optional String} [until] Show events created until this timestamp then stop streaming.
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Stream real-time events from the server.
    
    Various objects within Docker report events when something happens to them.
    
    Containers report these events: `attach, commit, copy, create, destroy, detach, die, exec_create, exec_detach, exec_start, export, kill, oom, pause, rename, resize, restart, start, stop, top, unpause, update`
    
    Images report these events: `delete, import, load, pull, push, save, tag, untag`
    
    Volumes report these events: `create, mount, unmount, destroy`
    
    Networks report these events: `create, connect, disconnect, destroy`
    
    The Docker daemon reports these events: `reload`
    
    
    #### Setting 'filters'
    A JSON encoded value of filters (a `map[string][]string`) to process on the event list. Available filters:

    
    - `container=<string>` container name or ID
    - `event=<string>` event type
    - `image=<string>` image name or ID
    - `label=<string>` image or container label
    - `type=<string>` object to filter by, one of `container`, `image`, `volume`, `network`, or `daemon`
    - `volume=<string>` volume name or ID
    - `network=<string>` network name or ID
    - `daemon=<string>` daemon name or ID
    
    
    #### Return value
    - **Object**
      - `Type`: **String** The type of object emitting the event
      - `Action`: **String** The type of event
      - `Actor`: **Object**
        - `ID`: **String** The ID of the object emitting the event
        - `Attributes`: **Object** Various key/value attributes of the object, depending on its type
          - `[KEY]`: **String**
      - `time`: **Integer** Timestamp of event
      - `timeNano`: **Integer** Timestamp of event, with nanosecond accuracy
    
*/
exports.systemEvents = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/events',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['since','until','filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function systemDataUsage
  @summary Get data usage information
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `LayersSize`: **Integer**
      - `Images`: **Array**
        - Elements of type **Object** (Required: Id, ParentId, RepoTags, RepoDigests, Created, Size, SharedSize, VirtualSize, Labels, Containers)
          - `Id`: **String**
          - `ParentId`: **String**
          - `RepoTags`: **Array**
            - Elements of type **String**
          - `RepoDigests`: **Array**
            - Elements of type **String**
          - `Created`: **Integer**
          - `Size`: **Integer**
          - `SharedSize`: **Integer**
          - `VirtualSize`: **Integer**
          - `Labels`: **Object**
            - `[KEY]`: **String**
          - `Containers`: **Integer**
      - `Containers`: **Array**
        - Elements of type **Array**
          - Elements of type **Object**
            - `Id`: **String** The ID of this container
            - `Names`: **Array** The names that this container has been given
              - Elements of type **String**
            - `Image`: **String** The name of the image used when creating this container
            - `ImageID`: **String** The ID of the image that this container was created from
            - `Command`: **String** Command to run when starting the container
            - `Created`: **Integer** When the container was created
            - `Ports`: **Array** The ports exposed by this container
              - Elements of type **Object** An open port on a container (Required: PrivatePort, Type)
                - `IP`: **String**
                - `PrivatePort`: **Integer** Port on the container
                - `PublicPort`: **Integer** Port exposed on the host
                - `Type`: **String**
            - `SizeRw`: **Integer** The size of files that have been created or changed by this container
            - `SizeRootFs`: **Integer** The total size of all the files in this container
            - `Labels`: **Object** User-defined key/value metadata.
              - `[KEY]`: **String**
            - `State`: **String** The state of this container (e.g. `Exited`)
            - `Status`: **String** Additional human-readable status of this container (e.g. `Exit 0`)
            - `HostConfig`: **Object**
              - `NetworkMode`: **String**
            - `NetworkSettings`: **Object** A summary of the container's network settings
              - `Networks`: **Object**
                - `[KEY]`: **Object** Configuration for a network endpoint.
                  - `IPAMConfig`: **Object** IPAM configurations for the endpoint
                    - `IPv4Address`: **String**
                    - `IPv6Address`: **String**
                    - `LinkLocalIPs`: **Array**
                      - Elements of type **String**
                  - `Links`: **Array**
                    - Elements of type **String**
                  - `Aliases`: **Array**
                    - Elements of type **String**
                  - `NetworkID`: **String**
                  - `EndpointID`: **String**
                  - `Gateway`: **String**
                  - `IPAddress`: **String**
                  - `IPPrefixLen`: **Integer**
                  - `IPv6Gateway`: **String**
                  - `GlobalIPv6Address`: **String**
                  - `GlobalIPv6PrefixLen`: **Integer**
                  - `MacAddress`: **String**
            - `Mounts`: **Array**
              - Elements of type **Object**
                - `Target`: **String** Container path.
                - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                - `BindOptions`: **Object** Optional configuration for the `bind` type.
                  - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                  - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                  - `Labels`: **Object** User-defined key/value metadata.
                    - `[KEY]`: **String**
                  - `DriverConfig`: **Object** Map of driver specific options
                    - `Name`: **String** Name of the driver to use to create the volume.
                    - `Options`: **Object** key/value map of driver specific options.
                      - `[KEY]`: **String**
                - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                  - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                  - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
      - `Volumes`: **Array**
        - Elements of type **Object** (Required: Name, Driver, Mountpoint, Labels, Scope, Options)
          - `Name`: **String** Name of the volume.
          - `Driver`: **String** Name of the volume driver used by the volume.
          - `Mountpoint`: **String** Mount path of the volume on the host.
          - `Status`: **Object** Low-level details about the volume, provided by the volume driver.  Details are returned as a map with key/value pairs:  `{"key":"value","key2":"value2"}`.    The `Status` field is optional, and is omitted if the volume driver  does not support this feature.  
            - `[KEY]`: **Object**
              
          - `Labels`: **Object** User-defined key/value metadata.
            - `[KEY]`: **String**
          - `Scope`: **String** The level at which the volume exists. Either `global` for cluster-wide, or `local` for machine level. (Optional; default: ''local'')
          - `Options`: **Object** The driver specific options used when creating the volume.
            - `[KEY]`: **String**
          - `UsageData`: **Object** (Required: Size, RefCount)
            - `Size`: **Integer** The disk space used by the volume (local driver only) (Optional; default: '-1')
            - `RefCount`: **Integer** The number of containers referencing this volume. (Optional; default: '-1')
    
*/
exports.systemDataUsage = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/system/df',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageGet
  @summary Export an image
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Get a tarball containing all images and metadata for a repository.
    
    If `name` is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned. If `name` is an image ID, similarly only that image (and its parents) are returned, but with the exclusion of the `repositories` file in the tarball, as there were no image names referenced.
    
    ### Image tarball format
    
    An image tarball contains one directory per image layer (named using its long ID), each containing these files:
    
    - `VERSION`: currently `1.0` - the file format version
    - `json`: detailed layer information, similar to `docker inspect layer_id`
    - `layer.tar`: A tarfile containing the filesystem changes in this layer
    
    The `layer.tar` file contains `aufs` style `.wh..wh.aufs` files and directories for storing attribute changes and deletions.
    
    If the tarball defines a repository, the tarball should also include a `repositories` file at the root that contains a list of repository and tag names mapped to layer IDs.
    
    ```json
    {
      "hello-world": {
        "latest": "565a9d68a73f6706862bfe8409a7f659776d4d60a8d096eb4a3cbce6999cc2a1"
      }
    }
    ```
    
    
*/
exports.imageGet = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/get',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageGetAll
  @summary Export several images
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Array} [names] Image names to filter by
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Get a tarball containing all images and metadata for several image repositories.
    
    For each value of the `names` parameter: if it is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned; if it is an image ID, similarly only that image (and its parents) are returned and there would be no names referenced in the 'repositories' file for this image ID.
    
    For details on the format, see [::imageGet].
    
    
*/
exports.imageGetAll = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/get',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['names'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function imageLoad
  @summary Import images
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [imagesTarball] Tar archive containing images. See description.
  @setting {optional Boolean} [quiet=false] Suppress progress details during load.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Load a set of images and tags into a repository.
    
    For details on the format, see [::imageGet].
    
    
    #### Setting 'imagesTarball'
    
    - **String**
    
*/
exports.imageLoad = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/load',
    params: params,
    block: block,
    body: 'string',
    requiredParams: [],
    pathParams: [],
    queryParams: ['quiet'],
    bodyParams: ['imagesTarball'],
    headerParams: [],
  });
};


/**
  @function containerExec
  @summary Create an exec instance
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [execConfig] Exec configuration. See description.
  @setting {String} [id] ID or name of container
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Run a command inside a running container.
    
    #### Setting 'execConfig'
    
    - **Object**
      - `AttachStdin`: **Boolean** Attach to `stdin` of the exec command.
      - `AttachStdout`: **Boolean** Attach to `stdout` of the exec command.
      - `AttachStderr`: **Boolean** Attach to `stderr` of the exec command.
      - `DetachKeys`: **String** Override the key sequence for detaching a container. Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.
      - `Tty`: **Boolean** Allocate a pseudo-TTY.
      - `Env`: **Array** A list of environment variables in the form `["VAR=value", ...]`.
        - Elements of type **String**
      - `Cmd`: **Array** Command to run, as a string or array of strings.
        - Elements of type **String**
      - `Privileged`: **Boolean** Runs the exec process with extended privileges. (Optional; default: 'false')
      - `User`: **String** The user, and optionally, group to run the exec process inside the container. Format is one of: `user`, `user:group`, `uid`, or `uid:gid`.
    
    #### Return value
    - **Object** Response to an API call that returns just an Id (Required: Id)
      - `Id`: **String** The id of the newly created object.
    
*/
exports.containerExec = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/exec',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['execConfig','id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['execConfig'],
    headerParams: [],
  });
};


/**
  @function execStart
  @summary Start an exec instance
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [execStartConfig] See description.
  @setting {String} [id] Exec instance ID
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Starts a previously set up exec instance. If detach is true, this endpoint returns immediately after starting the command. Otherwise, it sets up an interactive session with the command.
    
    #### Setting 'execStartConfig'
    
    - **Object**
      - `Detach`: **Boolean** Detach from the command.
      - `Tty`: **Boolean** Allocate a pseudo-TTY.
    
*/
exports.execStart = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/exec/{id}/start',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['execStartConfig'],
    headerParams: [],
  });
};


/**
  @function execResize
  @summary Resize an exec instance
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Exec instance ID
  @setting {optional Integer} [h] Height of the TTY session in characters
  @setting {optional Integer} [w] Width of the TTY session in characters
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Resize the TTY session used by an exec instance. This endpoint only works if `tty` was specified as part of creating and starting the exec instance.
    
*/
exports.execResize = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/exec/{id}/resize',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['h','w'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function execInspect
  @summary Inspect an exec instance
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Exec instance ID
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Return low-level information about an exec instance.
    
    #### Return value
    - **Object**
      - `ID`: **String**
      - `Running`: **Boolean**
      - `ExitCode`: **Integer**
      - `ProcessConfig`: **Object**
        - `privileged`: **Boolean**
        - `user`: **String**
        - `tty`: **Boolean**
        - `entrypoint`: **String**
        - `arguments`: **Array**
          - Elements of type **String**
      - `OpenStdin`: **Boolean**
      - `OpenStderr`: **Boolean**
      - `OpenStdout`: **Boolean**
      - `ContainerID`: **String**
      - `Pid`: **Integer** The system process ID for the exec process.
    
*/
exports.execInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/exec/{id}/json',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function volumeList
  @summary List volumes
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    JSON encoded value of the filters (a `map[string][]string`) to
    process on the volumes list. Available filters:

    
    - `name=<volume-name>` Matches all or part of a volume name.
    - `dangling=<boolean>` When set to `true` (or `1`), returns all
       volumes that are not in use by a container. When set to `false`
       (or `0`), only volumes that are in use by one or more
       containers are returned.
    - `driver=<volume-driver-name>` Matches all or part of a volume
      driver name.
    
    
    #### Return value
    - **Object** (Required: Volumes, Warnings)
      - `Volumes`: **Array** List of volumes
        - Elements of type **Object** (Required: Name, Driver, Mountpoint, Labels, Scope, Options)
          - `Name`: **String** Name of the volume.
          - `Driver`: **String** Name of the volume driver used by the volume.
          - `Mountpoint`: **String** Mount path of the volume on the host.
          - `Status`: **Object** Low-level details about the volume, provided by the volume driver.  Details are returned as a map with key/value pairs:  `{"key":"value","key2":"value2"}`.    The `Status` field is optional, and is omitted if the volume driver  does not support this feature.  
            - `[KEY]`: **Object**
              
          - `Labels`: **Object** User-defined key/value metadata.
            - `[KEY]`: **String**
          - `Scope`: **String** The level at which the volume exists. Either `global` for cluster-wide, or `local` for machine level. (Optional; default: ''local'')
          - `Options`: **Object** The driver specific options used when creating the volume.
            - `[KEY]`: **String**
          - `UsageData`: **Object** (Required: Size, RefCount)
            - `Size`: **Integer** The disk space used by the volume (local driver only) (Optional; default: '-1')
            - `RefCount`: **Integer** The number of containers referencing this volume. (Optional; default: '-1')
      - `Warnings`: **Array** Warnings that occurred when fetching the list of volumes
        - Elements of type **String**
    
*/
exports.volumeList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/volumes',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function volumeCreate
  @summary Create a volume
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [volumeConfig] Volume configuration. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'volumeConfig'
    
    - **Object**
      - `Name`: **String** The new volume's name. If not specified, Docker generates a name.
      - `Driver`: **String** Name of the volume driver to use. (Optional; default: ''local'')
      - `DriverOpts`: **Object** A mapping of driver options and values. These options are passed directly to the driver and are driver specific.
        - `[KEY]`: **String**
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
    
    #### Return value
    - **Object** (Required: Name, Driver, Mountpoint, Labels, Scope, Options)
      - `Name`: **String** Name of the volume.
      - `Driver`: **String** Name of the volume driver used by the volume.
      - `Mountpoint`: **String** Mount path of the volume on the host.
      - `Status`: **Object** Low-level details about the volume, provided by the volume driver.  Details are returned as a map with key/value pairs:  `{"key":"value","key2":"value2"}`.    The `Status` field is optional, and is omitted if the volume driver  does not support this feature.  
        - `[KEY]`: **Object**
          
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Scope`: **String** The level at which the volume exists. Either `global` for cluster-wide, or `local` for machine level. (Optional; default: ''local'')
      - `Options`: **Object** The driver specific options used when creating the volume.
        - `[KEY]`: **String**
      - `UsageData`: **Object** (Required: Size, RefCount)
        - `Size`: **Integer** The disk space used by the volume (local driver only) (Optional; default: '-1')
        - `RefCount`: **Integer** The number of containers referencing this volume. (Optional; default: '-1')
    
*/
exports.volumeCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/volumes/create',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['volumeConfig'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['volumeConfig'],
    headerParams: [],
  });
};


/**
  @function volumeInspect
  @summary Inspect a volume
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Volume name or ID
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object** (Required: Name, Driver, Mountpoint, Labels, Scope, Options)
      - `Name`: **String** Name of the volume.
      - `Driver`: **String** Name of the volume driver used by the volume.
      - `Mountpoint`: **String** Mount path of the volume on the host.
      - `Status`: **Object** Low-level details about the volume, provided by the volume driver.  Details are returned as a map with key/value pairs:  `{"key":"value","key2":"value2"}`.    The `Status` field is optional, and is omitted if the volume driver  does not support this feature.  
        - `[KEY]`: **Object**
          
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Scope`: **String** The level at which the volume exists. Either `global` for cluster-wide, or `local` for machine level. (Optional; default: ''local'')
      - `Options`: **Object** The driver specific options used when creating the volume.
        - `[KEY]`: **String**
      - `UsageData`: **Object** (Required: Size, RefCount)
        - `Size`: **Integer** The disk space used by the volume (local driver only) (Optional; default: '-1')
        - `RefCount`: **Integer** The number of containers referencing this volume. (Optional; default: '-1')
    
*/
exports.volumeInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/volumes/{name}',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function volumeDelete
  @summary Remove a volume
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Volume name or ID
  @setting {optional Boolean} [force=false] Force the removal of the volume
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Instruct the driver to remove the volume.
    
*/
exports.volumeDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/volumes/{name}',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function volumePrune
  @summary Delete unused volumes
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
    #### Return value
    - **Object**
      - `VolumesDeleted`: **Array** Volumes that were deleted
        - Elements of type **String**
      - `SpaceReclaimed`: **Integer** Disk space reclaimed in bytes
    
*/
exports.volumePrune = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/volumes/prune',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function networkList
  @summary List networks
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    JSON encoded value of the filters (a `map[string][]string`) to process on the networks list. Available filters:

    
    - `driver=<driver-name>` Matches a network's driver.
    - `id=<network-id>` Matches all or part of a network ID.
    - `label=<key>` or `label=<key>=<value>` of a network label.
    - `name=<network-name>` Matches all or part of a network name.
    - `type=["custom"|"builtin"]` Filters networks by type. The `custom` keyword returns all user-defined networks.
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `Name`: **String**
        - `Id`: **String**
        - `Created`: **String**
        - `Scope`: **String**
        - `Driver`: **String**
        - `EnableIPv6`: **Boolean**
        - `IPAM`: **Object**
          - `Driver`: **String** Name of the IPAM driver to use. (Optional; default: ''default'')
          - `Config`: **Array** List of IPAM configuration options, specified as a map: `{"Subnet": <CIDR>, "IPRange": <CIDR>, "Gateway": <IP address>, "AuxAddress": <device_name:IP address>}`
            - Elements of type **Object**
              - `[KEY]`: **String**
          - `Options`: **Array** Driver-specific options, specified as a map.
            - Elements of type **Object**
              - `[KEY]`: **String**
        - `Internal`: **Boolean**
        - `Containers`: **Object**
          - `[KEY]`: **Object**
            - `EndpointID`: **String**
            - `MacAddress`: **String**
            - `IPv4Address`: **String**
            - `IPv6Address`: **String**
        - `Options`: **Object**
          - `[KEY]`: **String**
        - `Labels`: **Object**
          - `[KEY]`: **String**
    
*/
exports.networkList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/networks',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function networkInspect
  @summary Inspect a network
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `Name`: **String**
      - `Id`: **String**
      - `Created`: **String**
      - `Scope`: **String**
      - `Driver`: **String**
      - `EnableIPv6`: **Boolean**
      - `IPAM`: **Object**
        - `Driver`: **String** Name of the IPAM driver to use. (Optional; default: ''default'')
        - `Config`: **Array** List of IPAM configuration options, specified as a map: `{"Subnet": <CIDR>, "IPRange": <CIDR>, "Gateway": <IP address>, "AuxAddress": <device_name:IP address>}`
          - Elements of type **Object**
            - `[KEY]`: **String**
        - `Options`: **Array** Driver-specific options, specified as a map.
          - Elements of type **Object**
            - `[KEY]`: **String**
      - `Internal`: **Boolean**
      - `Containers`: **Object**
        - `[KEY]`: **Object**
          - `EndpointID`: **String**
          - `MacAddress`: **String**
          - `IPv4Address`: **String**
          - `IPv6Address`: **String**
      - `Options`: **Object**
        - `[KEY]`: **String**
      - `Labels`: **Object**
        - `[KEY]`: **String**
    
*/
exports.networkInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/networks/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function networkDelete
  @summary Remove a network
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.networkDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/networks/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function networkCreate
  @summary Create a network
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [networkConfig] Network configuration. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'networkConfig'
    
    - **Object** (Required: Name)
      - `Name`: **String** The network's name.
      - `CheckDuplicate`: **Boolean** Check for networks with duplicate names.
      - `Driver`: **String** Name of the network driver plugin to use. (Optional; default: ''bridge'')
      - `Internal`: **Boolean** Restrict external access to the network.
      - `IPAM`: **Object** Optional custom IP scheme for the network.
        - `Driver`: **String** Name of the IPAM driver to use. (Optional; default: ''default'')
        - `Config`: **Array** List of IPAM configuration options, specified as a map: `{"Subnet": <CIDR>, "IPRange": <CIDR>, "Gateway": <IP address>, "AuxAddress": <device_name:IP address>}`
          - Elements of type **Object**
            - `[KEY]`: **String**
        - `Options`: **Array** Driver-specific options, specified as a map.
          - Elements of type **Object**
            - `[KEY]`: **String**
      - `EnableIPv6`: **Boolean** Enable IPv6 on the network.
      - `Options`: **Object** Network specific options to be used by the drivers.
        - `[KEY]`: **String**
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
    
    #### Return value
    - **Object**
      - `Id`: **String** The ID of the created network.
      - `Warning`: **String**
    
*/
exports.networkCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/create',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['networkConfig'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['networkConfig'],
    headerParams: [],
  });
};


/**
  @function networkConnect
  @summary Connect a container to a network
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @setting {Object} [container] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'container'
    
    - **Object**
      - `Container`: **String** The ID or name of the container to connect to the network.
      - `EndpointConfig`: **Object** Configuration for a network endpoint.
        - `IPAMConfig`: **Object** IPAM configurations for the endpoint
          - `IPv4Address`: **String**
          - `IPv6Address`: **String**
          - `LinkLocalIPs`: **Array**
            - Elements of type **String**
        - `Links`: **Array**
          - Elements of type **String**
        - `Aliases`: **Array**
          - Elements of type **String**
        - `NetworkID`: **String**
        - `EndpointID`: **String**
        - `Gateway`: **String**
        - `IPAddress`: **String**
        - `IPPrefixLen`: **Integer**
        - `IPv6Gateway`: **String**
        - `GlobalIPv6Address`: **String**
        - `GlobalIPv6PrefixLen`: **Integer**
        - `MacAddress`: **String**
    
*/
exports.networkConnect = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/{id}/connect',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id','container'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['container'],
    headerParams: [],
  });
};


/**
  @function networkDisconnect
  @summary Disconnect a container from a network
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @setting {Object} [container] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'container'
    
    - **Object**
      - `Container`: **String** The ID or name of the container to disconnect from the network.
      - `Force`: **Boolean** Force the container to disconnect from the network.
    
*/
exports.networkDisconnect = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/{id}/disconnect',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id','container'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['container'],
    headerParams: [],
  });
};


/**
  @function networkPrune
  @summary Delete unused networks
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
    #### Return value
    - **Object**
      - `VolumesDeleted`: **Array** Networks that were deleted
        - Elements of type **String**
    
*/
exports.networkPrune = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/prune',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginList
  @summary List plugins
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Returns information about installed plugins.
    
    #### Return value
    - **Array**
      - Elements of type **Object** A plugin for the Engine API (Required: Settings, Enabled, Config, Name)
        - `Id`: **String**
        - `Name`: **String**
        - `Enabled`: **Boolean** True when the plugin is running. False when the plugin is not running, only installed.
        - `Settings`: **Object** Settings that can be modified by users. (Required: Args, Devices, Env, Mounts)
          - `Mounts`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Source`: **String**
              - `Destination`: **String**
              - `Type`: **String**
              - `Options`: **Array**
                - Elements of type **String**
          - `Env`: **Array**
            - Elements of type **String**
          - `Args`: **Array**
            - Elements of type **String**
          - `Devices`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Path)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Path`: **String**
        - `Config`: **Object** The config of a plugin. (Required: Description, Documentation, Interface, Entrypoint, WorkDir, Network, Linux, PropagatedMount, Mounts, Env, Args)
          - `Description`: **String**
          - `Documentation`: **String**
          - `Interface`: **Object** The interface between Docker and the plugin (Required: Types, Socket)
            - `Types`: **Array**
              - Elements of type **Object** (Required: Prefix, Capability, Version)
                - `Prefix`: **String**
                - `Capability`: **String**
                - `Version`: **String**
            - `Socket`: **String**
          - `Entrypoint`: **Array**
            - Elements of type **String**
          - `WorkDir`: **String**
          - `User`: **Object**
            - `UID`: **Integer**
            - `GID`: **Integer**
          - `Network`: **Object** (Required: Type)
            - `Type`: **String**
          - `Linux`: **Object** (Required: Capabilities, AllowAllDevices, Devices)
            - `Capabilities`: **Array**
              - Elements of type **String**
            - `AllowAllDevices`: **Boolean**
            - `Devices`: **Array**
              - Elements of type **Object** (Required: Name, Description, Settable, Path)
                - `Name`: **String**
                - `Description`: **String**
                - `Settable`: **Array**
                  - Elements of type **String**
                - `Path`: **String**
          - `PropagatedMount`: **String**
          - `Mounts`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Source`: **String**
              - `Destination`: **String**
              - `Type`: **String**
              - `Options`: **Array**
                - Elements of type **String**
          - `Env`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Value)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Value`: **String**
          - `Args`: **Object** (Required: Name, Description, Settable, Value)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Value`: **Array**
              - Elements of type **String**
          - `rootfs`: **Object**
            - `type`: **String**
            - `diff_ids`: **Array**
              - Elements of type **String**
    
*/
exports.pluginList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function getPluginPrivileges
  @summary Get plugin privileges
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Array**
      - Elements of type **Object** Describes a permission the user has to accept upon installing the plugin.
        - `Name`: **String**
        - `Description`: **String**
        - `Value`: **Array**
          - Elements of type **String**
    
*/
exports.getPluginPrivileges = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins/privileges',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginPull
  @summary Install a plugin
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [remote] See description
  @setting {optional String} [name] See description
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration to use when pulling a plugin from a registry. [See the authentication section for details.](#section/Authentication)
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Pulls and installs a plugin. After the plugin is installed, it can be enabled using the [::postPluginsEnable].
    
    
    #### Setting 'remote'
    Remote reference for plugin to install.
    
    The `:latest` tag is optional, and is used as the default if omitted.
    
    
    #### Setting 'name'
    Local name for the pulled plugin.
    
    The `:latest` tag is optional, and is used as the default if omitted.
    
    
    #### Setting 'body'
    
    - **Array**
      - Elements of type **Object** Describes a permission accepted by the user upon installing the plugin.
        - `Name`: **String**
        - `Description`: **String**
        - `Value`: **Array**
          - Elements of type **String**
    
*/
exports.pluginPull = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/pull',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['remote'],
    pathParams: [],
    queryParams: ['remote','name'],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth'],
  });
};


/**
  @function pluginInspect
  @summary Inspect a plugin
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object** A plugin for the Engine API (Required: Settings, Enabled, Config, Name)
      - `Id`: **String**
      - `Name`: **String**
      - `Enabled`: **Boolean** True when the plugin is running. False when the plugin is not running, only installed.
      - `Settings`: **Object** Settings that can be modified by users. (Required: Args, Devices, Env, Mounts)
        - `Mounts`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Source`: **String**
            - `Destination`: **String**
            - `Type`: **String**
            - `Options`: **Array**
              - Elements of type **String**
        - `Env`: **Array**
          - Elements of type **String**
        - `Args`: **Array**
          - Elements of type **String**
        - `Devices`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Path)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Path`: **String**
      - `Config`: **Object** The config of a plugin. (Required: Description, Documentation, Interface, Entrypoint, WorkDir, Network, Linux, PropagatedMount, Mounts, Env, Args)
        - `Description`: **String**
        - `Documentation`: **String**
        - `Interface`: **Object** The interface between Docker and the plugin (Required: Types, Socket)
          - `Types`: **Array**
            - Elements of type **Object** (Required: Prefix, Capability, Version)
              - `Prefix`: **String**
              - `Capability`: **String**
              - `Version`: **String**
          - `Socket`: **String**
        - `Entrypoint`: **Array**
          - Elements of type **String**
        - `WorkDir`: **String**
        - `User`: **Object**
          - `UID`: **Integer**
          - `GID`: **Integer**
        - `Network`: **Object** (Required: Type)
          - `Type`: **String**
        - `Linux`: **Object** (Required: Capabilities, AllowAllDevices, Devices)
          - `Capabilities`: **Array**
            - Elements of type **String**
          - `AllowAllDevices`: **Boolean**
          - `Devices`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Path)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Path`: **String**
        - `PropagatedMount`: **String**
        - `Mounts`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Source`: **String**
            - `Destination`: **String**
            - `Type`: **String**
            - `Options`: **Array**
              - Elements of type **String**
        - `Env`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Value)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Value`: **String**
        - `Args`: **Object** (Required: Name, Description, Settable, Value)
          - `Name`: **String**
          - `Description`: **String**
          - `Settable`: **Array**
            - Elements of type **String**
          - `Value`: **Array**
            - Elements of type **String**
        - `rootfs`: **Object**
          - `type`: **String**
          - `diff_ids`: **Array**
            - Elements of type **String**
    
*/
exports.pluginInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins/{name}/json',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginDelete
  @summary Remove a plugin
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {optional Boolean} [force=false] Disable the plugin before removing. This may result in issues if the plugin is in use by a container.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object** A plugin for the Engine API (Required: Settings, Enabled, Config, Name)
      - `Id`: **String**
      - `Name`: **String**
      - `Enabled`: **Boolean** True when the plugin is running. False when the plugin is not running, only installed.
      - `Settings`: **Object** Settings that can be modified by users. (Required: Args, Devices, Env, Mounts)
        - `Mounts`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Source`: **String**
            - `Destination`: **String**
            - `Type`: **String**
            - `Options`: **Array**
              - Elements of type **String**
        - `Env`: **Array**
          - Elements of type **String**
        - `Args`: **Array**
          - Elements of type **String**
        - `Devices`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Path)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Path`: **String**
      - `Config`: **Object** The config of a plugin. (Required: Description, Documentation, Interface, Entrypoint, WorkDir, Network, Linux, PropagatedMount, Mounts, Env, Args)
        - `Description`: **String**
        - `Documentation`: **String**
        - `Interface`: **Object** The interface between Docker and the plugin (Required: Types, Socket)
          - `Types`: **Array**
            - Elements of type **Object** (Required: Prefix, Capability, Version)
              - `Prefix`: **String**
              - `Capability`: **String**
              - `Version`: **String**
          - `Socket`: **String**
        - `Entrypoint`: **Array**
          - Elements of type **String**
        - `WorkDir`: **String**
        - `User`: **Object**
          - `UID`: **Integer**
          - `GID`: **Integer**
        - `Network`: **Object** (Required: Type)
          - `Type`: **String**
        - `Linux`: **Object** (Required: Capabilities, AllowAllDevices, Devices)
          - `Capabilities`: **Array**
            - Elements of type **String**
          - `AllowAllDevices`: **Boolean**
          - `Devices`: **Array**
            - Elements of type **Object** (Required: Name, Description, Settable, Path)
              - `Name`: **String**
              - `Description`: **String**
              - `Settable`: **Array**
                - Elements of type **String**
              - `Path`: **String**
        - `PropagatedMount`: **String**
        - `Mounts`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Source, Destination, Type, Options)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Source`: **String**
            - `Destination`: **String**
            - `Type`: **String**
            - `Options`: **Array**
              - Elements of type **String**
        - `Env`: **Array**
          - Elements of type **Object** (Required: Name, Description, Settable, Value)
            - `Name`: **String**
            - `Description`: **String**
            - `Settable`: **Array**
              - Elements of type **String**
            - `Value`: **String**
        - `Args`: **Object** (Required: Name, Description, Settable, Value)
          - `Name`: **String**
          - `Description`: **String**
          - `Settable`: **Array**
            - Elements of type **String**
          - `Value`: **Array**
            - Elements of type **String**
        - `rootfs`: **Object**
          - `type`: **String**
          - `diff_ids`: **Array**
            - Elements of type **String**
    
*/
exports.pluginDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/plugins/{name}',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginEnable
  @summary Enable a plugin
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {optional Integer} [timeout=0] Set the HTTP client timeout (in seconds)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.pluginEnable = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/enable',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['timeout'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginDisable
  @summary Disable a plugin
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.pluginDisable = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/disable',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginCreate
  @summary Create a plugin
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {Object} [tarContext] Path to tar containing plugin rootfs and manifest. See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'tarContext'
    
    - **String**
    
*/
exports.pluginCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/create',
    params: params,
    block: block,
    body: 'string',
    requiredParams: ['name'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: ['tarContext'],
    headerParams: [],
  });
};


/**
  @function pluginPush
  @summary Push a plugin
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Push a plugin to the registry.
    
    
*/
exports.pluginPush = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/push',
    params: params,
    block: block,
    
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function pluginSet
  @summary Configure a plugin
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Array**
      - Elements of type **String**
    
*/
exports.pluginSet = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/set',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function nodeList
  @summary List nodes
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    Filters to process on the nodes list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    - `id=<node id>`
    - `label=<engine label>`
    - `membership=`(`accepted`|`pending`)`
    - `name=<node name>`
    - `role=`(`manager`|`worker`)`
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `ID`: **String**
        - `Version`: **Object**
          - `Index`: **Integer**
        - `CreatedAt`: **String**
        - `UpdatedAt`: **String**
        - `Spec`: **Object**
          - `Name`: **String** Name for the node.
          - `Labels`: **Object** User-defined key/value metadata.
            - `[KEY]`: **String**
          - `Role`: **String** Role of the node.
          - `Availability`: **String** Availability of the node.
        - `Description`: **Object**
          - `Hostname`: **String**
          - `Platform`: **Object**
            - `Architecture`: **String**
            - `OS`: **String**
          - `Resources`: **Object**
            - `NanoCPUs`: **Integer**
            - `MemoryBytes`: **Integer**
          - `Engine`: **Object**
            - `EngineVersion`: **String**
            - `Labels`: **Object**
              - `[KEY]`: **String**
            - `Plugins`: **Array**
              - Elements of type **Object**
                - `Type`: **String**
                - `Name`: **String**
    
*/
exports.nodeList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/nodes',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function nodeInspect
  @summary Inspect a node
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID or name of the node
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `ID`: **String**
      - `Version`: **Object**
        - `Index`: **Integer**
      - `CreatedAt`: **String**
      - `UpdatedAt`: **String**
      - `Spec`: **Object**
        - `Name`: **String** Name for the node.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `Role`: **String** Role of the node.
        - `Availability`: **String** Availability of the node.
      - `Description`: **Object**
        - `Hostname`: **String**
        - `Platform`: **Object**
          - `Architecture`: **String**
          - `OS`: **String**
        - `Resources`: **Object**
          - `NanoCPUs`: **Integer**
          - `MemoryBytes`: **Integer**
        - `Engine`: **Object**
          - `EngineVersion`: **String**
          - `Labels`: **Object**
            - `[KEY]`: **String**
          - `Plugins`: **Array**
            - Elements of type **Object**
              - `Type`: **String**
              - `Name`: **String**
    
*/
exports.nodeInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/nodes/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function nodeDelete
  @summary Delete a node
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID or name of the node
  @setting {optional Boolean} [force=false] Force remove a node from the swarm
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.nodeDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/nodes/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function nodeUpdate
  @summary Update a node
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID of the node
  @setting {Object} [body] See description.
  @setting {Integer} [version] The version number of the node object being updated. This is required to avoid conflicting writes.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `Name`: **String** Name for the node.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Role`: **String** Role of the node.
      - `Availability`: **String** Availability of the node.
    
*/
exports.nodeUpdate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/nodes/{id}/update',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id','version'],
    pathParams: ['id'],
    queryParams: ['version'],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function swarmInspect
  @summary Inspect swarm
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `ID`: **String** The ID of the swarm.
      - `Version`: **Object**
        - `Index`: **Integer**
      - `CreatedAt`: **String**
      - `UpdatedAt`: **String**
      - `Spec`: **Object** User modifiable swarm configuration.
        - `Name`: **String** Name of the swarm.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `Orchestration`: **Object** Orchestration configuration.
          - `TaskHistoryRetentionLimit`: **Integer** The number of historic tasks to keep per instance or node. If negative, never remove completed or failed tasks.
        - `Raft`: **Object** Raft configuration.
          - `SnapshotInterval`: **Integer** The number of log entries between snapshots.
          - `KeepOldSnapshots`: **Integer** The number of snapshots to keep beyond the current snapshot.
          - `LogEntriesForSlowFollowers`: **Integer** The number of log entries to keep around to sync up slow followers after a snapshot is created.
          - `ElectionTick`: **Integer** The number of ticks that a follower will wait for a message from the leader before becoming a candidate and starting an election. `ElectionTick` must be greater than `HeartbeatTick`.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
          - `HeartbeatTick`: **Integer** The number of ticks between heartbeats. Every HeartbeatTick ticks, the leader will send a heartbeat to the followers.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
        - `Dispatcher`: **Object** Dispatcher configuration.
          - `HeartbeatPeriod`: **Integer** The delay for an agent to send a heartbeat to the dispatcher.
        - `CAConfig`: **Object** CA configuration.
          - `NodeCertExpiry`: **Integer** The duration node certificates are issued for.
          - `ExternalCAs`: **Array** Configuration for forwarding signing requests to an external certificate authority.
            - Elements of type **Object**
              - `Protocol`: **String** Protocol for communication with the external CA (currently only `cfssl` is supported). (Optional; default: ''cfssl'')
              - `URL`: **String** URL where certificate signing requests should be sent.
              - `Options`: **Object** An object with key/value pairs that are interpreted as protocol-specific options for the external CA driver.
                - `[KEY]`: **String**
        - `EncryptionConfig`: **Object** Parameters related to encryption-at-rest.
          - `AutoLockManagers`: **Boolean** If set, generate a key and use it to lock data stored on the managers.
        - `TaskDefaults`: **Object** Defaults for creating tasks in this cluster.
          - `LogDriver`: **Object** The log driver to use for tasks created in the orchestrator if unspecified by a service.    Updating this value will only have an affect on new tasks. Old tasks will continue use their previously configured log driver until recreated.  
            - `Name`: **String**
            - `Options`: **Object**
              - `[KEY]`: **String**
      - `JoinTokens`: **Object** The tokens workers and managers need to join the swarm.
        - `Worker`: **String** The token workers can use to join the swarm.
        - `Manager`: **String** The token managers can use to join the swarm.
    
*/
exports.swarmInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/swarm',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function swarmInit
  @summary Initialize a new swarm
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `ListenAddr`: **String** Listen address used for inter-manager communication, as well as determining the networking interface used for the VXLAN Tunnel Endpoint (VTEP). This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like `eth0:4567`. If the port number is omitted, the default swarm listening port is used.
      - `AdvertiseAddr`: **String** Externally reachable address advertised to other nodes. This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like `eth0:4567`. If the port number is omitted, the port number from the listen address is used. If `AdvertiseAddr` is not specified, it will be automatically detected when possible.
      - `ForceNewCluster`: **Boolean** Force creation of a new swarm.
      - `Spec`: **Object** User modifiable swarm configuration.
        - `Name`: **String** Name of the swarm.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `Orchestration`: **Object** Orchestration configuration.
          - `TaskHistoryRetentionLimit`: **Integer** The number of historic tasks to keep per instance or node. If negative, never remove completed or failed tasks.
        - `Raft`: **Object** Raft configuration.
          - `SnapshotInterval`: **Integer** The number of log entries between snapshots.
          - `KeepOldSnapshots`: **Integer** The number of snapshots to keep beyond the current snapshot.
          - `LogEntriesForSlowFollowers`: **Integer** The number of log entries to keep around to sync up slow followers after a snapshot is created.
          - `ElectionTick`: **Integer** The number of ticks that a follower will wait for a message from the leader before becoming a candidate and starting an election. `ElectionTick` must be greater than `HeartbeatTick`.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
          - `HeartbeatTick`: **Integer** The number of ticks between heartbeats. Every HeartbeatTick ticks, the leader will send a heartbeat to the followers.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
        - `Dispatcher`: **Object** Dispatcher configuration.
          - `HeartbeatPeriod`: **Integer** The delay for an agent to send a heartbeat to the dispatcher.
        - `CAConfig`: **Object** CA configuration.
          - `NodeCertExpiry`: **Integer** The duration node certificates are issued for.
          - `ExternalCAs`: **Array** Configuration for forwarding signing requests to an external certificate authority.
            - Elements of type **Object**
              - `Protocol`: **String** Protocol for communication with the external CA (currently only `cfssl` is supported). (Optional; default: ''cfssl'')
              - `URL`: **String** URL where certificate signing requests should be sent.
              - `Options`: **Object** An object with key/value pairs that are interpreted as protocol-specific options for the external CA driver.
                - `[KEY]`: **String**
        - `EncryptionConfig`: **Object** Parameters related to encryption-at-rest.
          - `AutoLockManagers`: **Boolean** If set, generate a key and use it to lock data stored on the managers.
        - `TaskDefaults`: **Object** Defaults for creating tasks in this cluster.
          - `LogDriver`: **Object** The log driver to use for tasks created in the orchestrator if unspecified by a service.    Updating this value will only have an affect on new tasks. Old tasks will continue use their previously configured log driver until recreated.  
            - `Name`: **String**
            - `Options`: **Object**
              - `[KEY]`: **String**
    
    #### Return value
    - **String** The node ID
    
*/
exports.swarmInit = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/init',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function swarmJoin
  @summary Join an existing swarm
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `ListenAddr`: **String** Listen address used for inter-manager communication if the node gets promoted to manager, as well as determining the networking interface used for the VXLAN Tunnel Endpoint (VTEP).
      - `AdvertiseAddr`: **String** Externally reachable address advertised to other nodes. This can either be an address/port combination in the form `192.168.1.1:4567`, or an interface followed by a port number, like `eth0:4567`. If the port number is omitted, the port number from the listen address is used. If `AdvertiseAddr` is not specified, it will be automatically detected when possible.
      - `RemoteAddrs`: **String** Addresses of manager nodes already participating in the swarm.
      - `JoinToken`: **String** Secret token for joining this swarm.
    
*/
exports.swarmJoin = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/join',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function swarmLeave
  @summary Leave a swarm
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [force=false] Force leave swarm, even if this is the last manager or that it will break the cluster.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.swarmLeave = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/leave',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function swarmUpdate
  @summary Update a swarm
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @setting {Integer} [version] The version number of the swarm object being updated. This is required to avoid conflicting writes.
  @setting {optional Boolean} [rotateWorkerToken=false] Rotate the worker join token.
  @setting {optional Boolean} [rotateManagerToken=false] Rotate the manager join token.
  @setting {optional Boolean} [rotateManagerUnlockKey=false] Rotate the manager unlock key.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object** User modifiable swarm configuration.
      - `Name`: **String** Name of the swarm.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Orchestration`: **Object** Orchestration configuration.
        - `TaskHistoryRetentionLimit`: **Integer** The number of historic tasks to keep per instance or node. If negative, never remove completed or failed tasks.
      - `Raft`: **Object** Raft configuration.
        - `SnapshotInterval`: **Integer** The number of log entries between snapshots.
        - `KeepOldSnapshots`: **Integer** The number of snapshots to keep beyond the current snapshot.
        - `LogEntriesForSlowFollowers`: **Integer** The number of log entries to keep around to sync up slow followers after a snapshot is created.
        - `ElectionTick`: **Integer** The number of ticks that a follower will wait for a message from the leader before becoming a candidate and starting an election. `ElectionTick` must be greater than `HeartbeatTick`.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
        - `HeartbeatTick`: **Integer** The number of ticks between heartbeats. Every HeartbeatTick ticks, the leader will send a heartbeat to the followers.    A tick currently defaults to one second, so these translate directly to seconds currently, but this is NOT guaranteed.  
      - `Dispatcher`: **Object** Dispatcher configuration.
        - `HeartbeatPeriod`: **Integer** The delay for an agent to send a heartbeat to the dispatcher.
      - `CAConfig`: **Object** CA configuration.
        - `NodeCertExpiry`: **Integer** The duration node certificates are issued for.
        - `ExternalCAs`: **Array** Configuration for forwarding signing requests to an external certificate authority.
          - Elements of type **Object**
            - `Protocol`: **String** Protocol for communication with the external CA (currently only `cfssl` is supported). (Optional; default: ''cfssl'')
            - `URL`: **String** URL where certificate signing requests should be sent.
            - `Options`: **Object** An object with key/value pairs that are interpreted as protocol-specific options for the external CA driver.
              - `[KEY]`: **String**
      - `EncryptionConfig`: **Object** Parameters related to encryption-at-rest.
        - `AutoLockManagers`: **Boolean** If set, generate a key and use it to lock data stored on the managers.
      - `TaskDefaults`: **Object** Defaults for creating tasks in this cluster.
        - `LogDriver`: **Object** The log driver to use for tasks created in the orchestrator if unspecified by a service.    Updating this value will only have an affect on new tasks. Old tasks will continue use their previously configured log driver until recreated.  
          - `Name`: **String**
          - `Options`: **Object**
            - `[KEY]`: **String**
    
*/
exports.swarmUpdate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/update',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body','version'],
    pathParams: [],
    queryParams: ['version','rotateWorkerToken','rotateManagerToken','rotateManagerUnlockKey'],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function swarmUnlockkey
  @summary Get the unlock key
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `UnlockKey`: **String** The swarm's unlock key.
    
*/
exports.swarmUnlockkey = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/swarm/unlockkey',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function swarmUnlock
  @summary Unlock a locked manager
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `UnlockKey`: **String** The swarm's unlock key.
    
*/
exports.swarmUnlock = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/unlock',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function serviceList
  @summary List services
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the services list. Available filters:

    
    - `id=<service id>`
    - `name=<service name>`
    - `label=<service label>`
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `ID`: **String**
        - `Version`: **Object**
          - `Index`: **Integer**
        - `CreatedAt`: **String**
        - `UpdatedAt`: **String**
        - `Spec`: **Object** User modifiable configuration for a service.
          - `Name`: **String** Name of the service.
          - `Labels`: **Object** User-defined key/value metadata.
            - `[KEY]`: **String**
          - `TaskTemplate`: **Object** User modifiable task configuration.
            - `ContainerSpec`: **Object**
              - `Image`: **String** The image name to use for the container.
              - `Command`: **Array** The command to be run in the image.
                - Elements of type **String**
              - `Args`: **Array** Arguments to the command.
                - Elements of type **String**
              - `Env`: **Array** A list of environment variables in the form `VAR=value`.
                - Elements of type **String**
              - `Dir`: **String** The working directory for commands to run in.
              - `User`: **String** The user inside the container.
              - `Labels`: **Object** User-defined key/value data.
                - `[KEY]`: **String**
              - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
              - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
                - Elements of type **Object**
                  - `Target`: **String** Container path.
                  - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                  - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                  - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                  - `BindOptions`: **Object** Optional configuration for the `bind` type.
                    - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                  - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                    - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                    - `Labels`: **Object** User-defined key/value metadata.
                      - `[KEY]`: **String**
                    - `DriverConfig`: **Object** Map of driver specific options
                      - `Name`: **String** Name of the driver to use to create the volume.
                      - `Options`: **Object** key/value map of driver specific options.
                        - `[KEY]`: **String**
                  - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                    - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                    - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
              - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
              - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
                - `Nameservers`: **Array** The IP addresses of the name servers.
                  - Elements of type **String**
                - `Search`: **Array** A search list for host-name lookup.
                  - Elements of type **String**
                - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
                  - Elements of type **String**
            - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
              - `Limits`: **Object** Define resources limits.
                - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
                - `MemoryBytes`: **Integer** Memory limit in Bytes.
              - `Reservation`: **Object** Define resources reservation.
                - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
                - `MemoryBytes`: **Integer** Memory reservation in Bytes.
            - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
              - `Condition`: **String** Condition for restart.
              - `Delay`: **Integer** Delay between restart attempts.
              - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
              - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
            - `Placement`: **Object**
              - `Constraints`: **Array** An array of constraints.
                - Elements of type **String**
            - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
            - `Networks`: **Array**
              - Elements of type **Object**
                - `Target`: **String**
                - `Aliases`: **Array**
                  - Elements of type **String**
            - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
              - `Name`: **String**
              - `Options`: **Object**
                - `[KEY]`: **String**
          - `Mode`: **Object** Scheduling mode for the service.
            - `Replicated`: **Object**
              - `Replicas`: **Integer**
            - `Global`: **Object**
              
          - `UpdateConfig`: **Object** Specification for the update strategy of the service.
            - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
            - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
            - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
            - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
            - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
          - `Networks`: **Array** Array of network names or IDs to attach the service to.
            - Elements of type **Object**
              - `Target`: **String**
              - `Aliases`: **Array**
                - Elements of type **String**
          - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
            - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
            - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
              - Elements of type **Object**
                - `Name`: **String**
                - `Protocol`: **String**
                - `TargetPort`: **Integer** The port inside the container.
                - `PublishedPort`: **Integer** The port on the swarm hosts.
        - `Endpoint`: **Object**
          - `Spec`: **Object** Properties that can be configured to access and load balance a service.
            - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
            - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
              - Elements of type **Object**
                - `Name`: **String**
                - `Protocol`: **String**
                - `TargetPort`: **Integer** The port inside the container.
                - `PublishedPort`: **Integer** The port on the swarm hosts.
          - `Ports`: **Array**
            - Elements of type **Object**
              - `Name`: **String**
              - `Protocol`: **String**
              - `TargetPort`: **Integer** The port inside the container.
              - `PublishedPort`: **Integer** The port on the swarm hosts.
          - `VirtualIPs`: **Array**
            - Elements of type **Object**
              - `NetworkID`: **String**
              - `Addr`: **String**
        - `UpdateStatus`: **Object** The status of a service update.
          - `State`: **String**
          - `StartedAt`: **String**
          - `CompletedAt`: **String**
          - `Message`: **String**
    
*/
exports.serviceList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function serviceCreate
  @summary Create a service
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration for pulling from private registries. [See the authentication section for details.](#section/Authentication)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `Name`: **String** Name of the service.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `TaskTemplate`: **Object** User modifiable task configuration.
        - `ContainerSpec`: **Object**
          - `Image`: **String** The image name to use for the container.
          - `Command`: **Array** The command to be run in the image.
            - Elements of type **String**
          - `Args`: **Array** Arguments to the command.
            - Elements of type **String**
          - `Env`: **Array** A list of environment variables in the form `VAR=value`.
            - Elements of type **String**
          - `Dir`: **String** The working directory for commands to run in.
          - `User`: **String** The user inside the container.
          - `Labels`: **Object** User-defined key/value data.
            - `[KEY]`: **String**
          - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
          - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
            - Elements of type **Object**
              - `Target`: **String** Container path.
              - `Source`: **anything** Mount source (e.g. a volume name, a host path).
              - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
              - `ReadOnly`: **Boolean** Whether the mount should be read-only.
              - `BindOptions`: **Object** Optional configuration for the `bind` type.
                - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
              - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                - `Labels`: **Object** User-defined key/value metadata.
                  - `[KEY]`: **String**
                - `DriverConfig`: **Object** Map of driver specific options
                  - `Name`: **String** Name of the driver to use to create the volume.
                  - `Options`: **Object** key/value map of driver specific options.
                    - `[KEY]`: **String**
              - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
          - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
          - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
            - `Nameservers`: **Array** The IP addresses of the name servers.
              - Elements of type **String**
            - `Search`: **Array** A search list for host-name lookup.
              - Elements of type **String**
            - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
              - Elements of type **String**
        - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
          - `Limits`: **Object** Define resources limits.
            - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory limit in Bytes.
          - `Reservation`: **Object** Define resources reservation.
            - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory reservation in Bytes.
        - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
          - `Condition`: **String** Condition for restart.
          - `Delay`: **Integer** Delay between restart attempts.
          - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
          - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
        - `Placement`: **Object**
          - `Constraints`: **Array** An array of constraints.
            - Elements of type **String**
        - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
        - `Networks`: **Array**
          - Elements of type **Object**
            - `Target`: **String**
            - `Aliases`: **Array**
              - Elements of type **String**
        - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
          - `Name`: **String**
          - `Options`: **Object**
            - `[KEY]`: **String**
      - `Mode`: **Object** Scheduling mode for the service.
        - `Replicated`: **Object**
          - `Replicas`: **Integer**
        - `Global`: **Object**
          
      - `UpdateConfig`: **Object** Specification for the update strategy of the service.
        - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
        - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
        - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
        - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
        - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
      - `Networks`: **Array** Array of network names or IDs to attach the service to.
        - Elements of type **Object**
          - `Target`: **String**
          - `Aliases`: **Array**
            - Elements of type **String**
      - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
        - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
        - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
          - Elements of type **Object**
            - `Name`: **String**
            - `Protocol`: **String**
            - `TargetPort`: **Integer** The port inside the container.
            - `PublishedPort`: **Integer** The port on the swarm hosts.
    
    #### Return value
    - **Object**
      - `ID`: **String** The ID of the created service.
      - `Warning`: **String** Optional warning message
    
*/
exports.serviceCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/services/create',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth'],
  });
};


/**
  @function serviceInspect
  @summary Inspect a service
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `ID`: **String**
      - `Version`: **Object**
        - `Index`: **Integer**
      - `CreatedAt`: **String**
      - `UpdatedAt`: **String**
      - `Spec`: **Object** User modifiable configuration for a service.
        - `Name`: **String** Name of the service.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `TaskTemplate`: **Object** User modifiable task configuration.
          - `ContainerSpec`: **Object**
            - `Image`: **String** The image name to use for the container.
            - `Command`: **Array** The command to be run in the image.
              - Elements of type **String**
            - `Args`: **Array** Arguments to the command.
              - Elements of type **String**
            - `Env`: **Array** A list of environment variables in the form `VAR=value`.
              - Elements of type **String**
            - `Dir`: **String** The working directory for commands to run in.
            - `User`: **String** The user inside the container.
            - `Labels`: **Object** User-defined key/value data.
              - `[KEY]`: **String**
            - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
            - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
              - Elements of type **Object**
                - `Target`: **String** Container path.
                - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                - `BindOptions`: **Object** Optional configuration for the `bind` type.
                  - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                  - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                  - `Labels`: **Object** User-defined key/value metadata.
                    - `[KEY]`: **String**
                  - `DriverConfig`: **Object** Map of driver specific options
                    - `Name`: **String** Name of the driver to use to create the volume.
                    - `Options`: **Object** key/value map of driver specific options.
                      - `[KEY]`: **String**
                - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                  - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                  - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
            - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
            - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
              - `Nameservers`: **Array** The IP addresses of the name servers.
                - Elements of type **String**
              - `Search`: **Array** A search list for host-name lookup.
                - Elements of type **String**
              - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
                - Elements of type **String**
          - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
            - `Limits`: **Object** Define resources limits.
              - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory limit in Bytes.
            - `Reservation`: **Object** Define resources reservation.
              - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory reservation in Bytes.
          - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
            - `Condition`: **String** Condition for restart.
            - `Delay`: **Integer** Delay between restart attempts.
            - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
            - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
          - `Placement`: **Object**
            - `Constraints`: **Array** An array of constraints.
              - Elements of type **String**
          - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
          - `Networks`: **Array**
            - Elements of type **Object**
              - `Target`: **String**
              - `Aliases`: **Array**
                - Elements of type **String**
          - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
            - `Name`: **String**
            - `Options`: **Object**
              - `[KEY]`: **String**
        - `Mode`: **Object** Scheduling mode for the service.
          - `Replicated`: **Object**
            - `Replicas`: **Integer**
          - `Global`: **Object**
            
        - `UpdateConfig`: **Object** Specification for the update strategy of the service.
          - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
          - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
          - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
          - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
          - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
        - `Networks`: **Array** Array of network names or IDs to attach the service to.
          - Elements of type **Object**
            - `Target`: **String**
            - `Aliases`: **Array**
              - Elements of type **String**
        - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
          - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
          - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
            - Elements of type **Object**
              - `Name`: **String**
              - `Protocol`: **String**
              - `TargetPort`: **Integer** The port inside the container.
              - `PublishedPort`: **Integer** The port on the swarm hosts.
      - `Endpoint`: **Object**
        - `Spec`: **Object** Properties that can be configured to access and load balance a service.
          - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
          - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
            - Elements of type **Object**
              - `Name`: **String**
              - `Protocol`: **String**
              - `TargetPort`: **Integer** The port inside the container.
              - `PublishedPort`: **Integer** The port on the swarm hosts.
        - `Ports`: **Array**
          - Elements of type **Object**
            - `Name`: **String**
            - `Protocol`: **String**
            - `TargetPort`: **Integer** The port inside the container.
            - `PublishedPort`: **Integer** The port on the swarm hosts.
        - `VirtualIPs`: **Array**
          - Elements of type **Object**
            - `NetworkID`: **String**
            - `Addr`: **String**
      - `UpdateStatus`: **Object** The status of a service update.
        - `State`: **String**
        - `StartedAt`: **String**
        - `CompletedAt`: **String**
        - `Message`: **String**
    
*/
exports.serviceInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function serviceDelete
  @summary Delete a service
  @return {void}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.serviceDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/services/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function serviceUpdate
  @summary Update a service
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.
  @setting {Object} [body] See description.
  @setting {Integer} [version] The version number of the service object being updated. This is required to avoid conflicting writes.
  @setting {optional String} [registryAuthFrom=spec] If the X-Registry-Auth header is not specified, this parameter indicates where to find registry authorization credentials. The valid values are `spec` and `previous-spec`.
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration for pulling from private registries. [See the authentication section for details.](#section/Authentication)
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `Name`: **String** Name of the service.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `TaskTemplate`: **Object** User modifiable task configuration.
        - `ContainerSpec`: **Object**
          - `Image`: **String** The image name to use for the container.
          - `Command`: **Array** The command to be run in the image.
            - Elements of type **String**
          - `Args`: **Array** Arguments to the command.
            - Elements of type **String**
          - `Env`: **Array** A list of environment variables in the form `VAR=value`.
            - Elements of type **String**
          - `Dir`: **String** The working directory for commands to run in.
          - `User`: **String** The user inside the container.
          - `Labels`: **Object** User-defined key/value data.
            - `[KEY]`: **String**
          - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
          - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
            - Elements of type **Object**
              - `Target`: **String** Container path.
              - `Source`: **anything** Mount source (e.g. a volume name, a host path).
              - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
              - `ReadOnly`: **Boolean** Whether the mount should be read-only.
              - `BindOptions`: **Object** Optional configuration for the `bind` type.
                - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
              - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                - `Labels`: **Object** User-defined key/value metadata.
                  - `[KEY]`: **String**
                - `DriverConfig`: **Object** Map of driver specific options
                  - `Name`: **String** Name of the driver to use to create the volume.
                  - `Options`: **Object** key/value map of driver specific options.
                    - `[KEY]`: **String**
              - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
          - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
          - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
            - `Nameservers`: **Array** The IP addresses of the name servers.
              - Elements of type **String**
            - `Search`: **Array** A search list for host-name lookup.
              - Elements of type **String**
            - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
              - Elements of type **String**
        - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
          - `Limits`: **Object** Define resources limits.
            - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory limit in Bytes.
          - `Reservation`: **Object** Define resources reservation.
            - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory reservation in Bytes.
        - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
          - `Condition`: **String** Condition for restart.
          - `Delay`: **Integer** Delay between restart attempts.
          - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
          - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
        - `Placement`: **Object**
          - `Constraints`: **Array** An array of constraints.
            - Elements of type **String**
        - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
        - `Networks`: **Array**
          - Elements of type **Object**
            - `Target`: **String**
            - `Aliases`: **Array**
              - Elements of type **String**
        - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
          - `Name`: **String**
          - `Options`: **Object**
            - `[KEY]`: **String**
      - `Mode`: **Object** Scheduling mode for the service.
        - `Replicated`: **Object**
          - `Replicas`: **Integer**
        - `Global`: **Object**
          
      - `UpdateConfig`: **Object** Specification for the update strategy of the service.
        - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
        - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
        - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
        - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
        - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
      - `Networks`: **Array** Array of network names or IDs to attach the service to.
        - Elements of type **Object**
          - `Target`: **String**
          - `Aliases`: **Array**
            - Elements of type **String**
      - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
        - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
        - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
          - Elements of type **Object**
            - `Name`: **String**
            - `Protocol`: **String**
            - `TargetPort`: **Integer** The port inside the container.
            - `PublishedPort`: **Integer** The port on the swarm hosts.
    
    #### Return value
    - **Object**
      - `Untagged`: **String** The image ID of an image that was untagged
      - `Deleted`: **String** The image ID of an image that was deleted
    
*/
exports.serviceUpdate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/services/{id}/update',
    params: params,
    block: block,
    body: 'json',
    requiredParams: ['id','body','version'],
    pathParams: ['id'],
    queryParams: ['version','registryAuthFrom'],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth'],
  });
};


/**
  @function serviceLogs
  @summary Get service logs
  @return {COMPLEX}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [details=false] Show extra details provided to logs.
  @setting {optional Boolean} [follow=false] See description
  @setting {optional Boolean} [stdout=false] Return logs from `stdout`
  @setting {optional Boolean} [stderr=false] Return logs from `stderr`
  @setting {optional Integer} [since=0] Only return logs since this time, as a UNIX timestamp
  @setting {optional Boolean} [timestamps=false] Add timestamps to every log line
  @setting {optional String} [tail=all] Only return this number of log lines from the end of the logs. Specify as an integer or `all` to output all log lines.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    Get `stdout` and `stderr` logs from a service.
    
    **Note**: This endpoint works only for services with the `json-file` or `journald` logging drivers.
    
    
    #### Setting 'follow'
    Return the logs as a stream.
    
    This will return a `101` HTTP response with a `Connection: upgrade` header, then hijack the HTTP connection to send raw output. For more information about hijacking and the stream format, [::containerAttach].
    
    
*/
exports.serviceLogs = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services/{id}/logs',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['details','follow','stdout','stderr','since','timestamps','tail'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function taskList
  @summary List tasks
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the tasks list. Available filters:

    
    - `id=<task id>`
    - `name=<task name>`
    - `service=<service name>`
    - `node=<node id or name>`
    - `label=key` or `label="key=value"`
    - `desired-state=(running | shutdown | accepted)`
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `ID`: **String** The ID of the task.
        - `Version`: **Object**
          - `Index`: **Integer**
        - `CreatedAt`: **String**
        - `UpdatedAt`: **String**
        - `Name`: **String** Name of the task.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `Spec`: **Object** User modifiable task configuration.
          - `ContainerSpec`: **Object**
            - `Image`: **String** The image name to use for the container.
            - `Command`: **Array** The command to be run in the image.
              - Elements of type **String**
            - `Args`: **Array** Arguments to the command.
              - Elements of type **String**
            - `Env`: **Array** A list of environment variables in the form `VAR=value`.
              - Elements of type **String**
            - `Dir`: **String** The working directory for commands to run in.
            - `User`: **String** The user inside the container.
            - `Labels`: **Object** User-defined key/value data.
              - `[KEY]`: **String**
            - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
            - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
              - Elements of type **Object**
                - `Target`: **String** Container path.
                - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                - `BindOptions`: **Object** Optional configuration for the `bind` type.
                  - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                  - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                  - `Labels`: **Object** User-defined key/value metadata.
                    - `[KEY]`: **String**
                  - `DriverConfig`: **Object** Map of driver specific options
                    - `Name`: **String** Name of the driver to use to create the volume.
                    - `Options`: **Object** key/value map of driver specific options.
                      - `[KEY]`: **String**
                - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                  - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                  - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
            - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
            - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
              - `Nameservers`: **Array** The IP addresses of the name servers.
                - Elements of type **String**
              - `Search`: **Array** A search list for host-name lookup.
                - Elements of type **String**
              - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
                - Elements of type **String**
          - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
            - `Limits`: **Object** Define resources limits.
              - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory limit in Bytes.
            - `Reservation`: **Object** Define resources reservation.
              - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory reservation in Bytes.
          - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
            - `Condition`: **String** Condition for restart.
            - `Delay`: **Integer** Delay between restart attempts.
            - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
            - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
          - `Placement`: **Object**
            - `Constraints`: **Array** An array of constraints.
              - Elements of type **String**
          - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
          - `Networks`: **Array**
            - Elements of type **Object**
              - `Target`: **String**
              - `Aliases`: **Array**
                - Elements of type **String**
          - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
            - `Name`: **String**
            - `Options`: **Object**
              - `[KEY]`: **String**
        - `ServiceID`: **String** The ID of the service this task is part of.
        - `Slot`: **Integer**
        - `NodeID`: **String** The ID of the node that this task is on.
        - `Status`: **Object**
          - `Timestamp`: **String**
          - `State`: **String**
          - `Message`: **String**
          - `Err`: **String**
          - `ContainerStatus`: **Object**
            - `ContainerID`: **String**
            - `PID`: **Integer**
            - `ExitCode`: **Integer**
        - `DesiredState`: **String**
    
*/
exports.taskList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/tasks',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function taskInspect
  @summary Inspect a task
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the task
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `ID`: **String** The ID of the task.
      - `Version`: **Object**
        - `Index`: **Integer**
      - `CreatedAt`: **String**
      - `UpdatedAt`: **String**
      - `Name`: **String** Name of the task.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Spec`: **Object** User modifiable task configuration.
        - `ContainerSpec`: **Object**
          - `Image`: **String** The image name to use for the container.
          - `Command`: **Array** The command to be run in the image.
            - Elements of type **String**
          - `Args`: **Array** Arguments to the command.
            - Elements of type **String**
          - `Env`: **Array** A list of environment variables in the form `VAR=value`.
            - Elements of type **String**
          - `Dir`: **String** The working directory for commands to run in.
          - `User`: **String** The user inside the container.
          - `Labels`: **Object** User-defined key/value data.
            - `[KEY]`: **String**
          - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
          - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
            - Elements of type **Object**
              - `Target`: **String** Container path.
              - `Source`: **anything** Mount source (e.g. a volume name, a host path).
              - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
              - `ReadOnly`: **Boolean** Whether the mount should be read-only.
              - `BindOptions`: **Object** Optional configuration for the `bind` type.
                - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
              - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                - `Labels`: **Object** User-defined key/value metadata.
                  - `[KEY]`: **String**
                - `DriverConfig`: **Object** Map of driver specific options
                  - `Name`: **String** Name of the driver to use to create the volume.
                  - `Options`: **Object** key/value map of driver specific options.
                    - `[KEY]`: **String**
              - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
          - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
          - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
            - `Nameservers`: **Array** The IP addresses of the name servers.
              - Elements of type **String**
            - `Search`: **Array** A search list for host-name lookup.
              - Elements of type **String**
            - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
              - Elements of type **String**
        - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
          - `Limits`: **Object** Define resources limits.
            - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory limit in Bytes.
          - `Reservation`: **Object** Define resources reservation.
            - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
            - `MemoryBytes`: **Integer** Memory reservation in Bytes.
        - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
          - `Condition`: **String** Condition for restart.
          - `Delay`: **Integer** Delay between restart attempts.
          - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
          - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
        - `Placement`: **Object**
          - `Constraints`: **Array** An array of constraints.
            - Elements of type **String**
        - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
        - `Networks`: **Array**
          - Elements of type **Object**
            - `Target`: **String**
            - `Aliases`: **Array**
              - Elements of type **String**
        - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
          - `Name`: **String**
          - `Options`: **Object**
            - `[KEY]`: **String**
      - `ServiceID`: **String** The ID of the service this task is part of.
      - `Slot`: **Integer**
      - `NodeID`: **String** The ID of the node that this task is on.
      - `Status`: **Object**
        - `Timestamp`: **String**
        - `State`: **String**
        - `Message`: **String**
        - `Err`: **String**
        - `ContainerStatus`: **Object**
          - `ContainerID`: **String**
          - `PID`: **Integer**
          - `ExitCode`: **Integer**
      - `DesiredState`: **String**
    
*/
exports.taskInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/tasks/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function secretList
  @summary List secrets
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the secrets list. Available filters:

    
    - `names=<secret name>`
    
    
    #### Return value
    - **Array**
      - Elements of type **Object**
        - `ID`: **String**
        - `Version`: **Object**
          - `Index`: **Integer**
        - `CreatedAt`: **String**
        - `UpdatedAt`: **String**
        - `Spec`: **Object** User modifiable configuration for a service.
          - `Name`: **String** Name of the service.
          - `Labels`: **Object** User-defined key/value metadata.
            - `[KEY]`: **String**
          - `TaskTemplate`: **Object** User modifiable task configuration.
            - `ContainerSpec`: **Object**
              - `Image`: **String** The image name to use for the container.
              - `Command`: **Array** The command to be run in the image.
                - Elements of type **String**
              - `Args`: **Array** Arguments to the command.
                - Elements of type **String**
              - `Env`: **Array** A list of environment variables in the form `VAR=value`.
                - Elements of type **String**
              - `Dir`: **String** The working directory for commands to run in.
              - `User`: **String** The user inside the container.
              - `Labels`: **Object** User-defined key/value data.
                - `[KEY]`: **String**
              - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
              - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
                - Elements of type **Object**
                  - `Target`: **String** Container path.
                  - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                  - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                  - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                  - `BindOptions`: **Object** Optional configuration for the `bind` type.
                    - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                  - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                    - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                    - `Labels`: **Object** User-defined key/value metadata.
                      - `[KEY]`: **String**
                    - `DriverConfig`: **Object** Map of driver specific options
                      - `Name`: **String** Name of the driver to use to create the volume.
                      - `Options`: **Object** key/value map of driver specific options.
                        - `[KEY]`: **String**
                  - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                    - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                    - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
              - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
              - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
                - `Nameservers`: **Array** The IP addresses of the name servers.
                  - Elements of type **String**
                - `Search`: **Array** A search list for host-name lookup.
                  - Elements of type **String**
                - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
                  - Elements of type **String**
            - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
              - `Limits`: **Object** Define resources limits.
                - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
                - `MemoryBytes`: **Integer** Memory limit in Bytes.
              - `Reservation`: **Object** Define resources reservation.
                - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
                - `MemoryBytes`: **Integer** Memory reservation in Bytes.
            - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
              - `Condition`: **String** Condition for restart.
              - `Delay`: **Integer** Delay between restart attempts.
              - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
              - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
            - `Placement`: **Object**
              - `Constraints`: **Array** An array of constraints.
                - Elements of type **String**
            - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
            - `Networks`: **Array**
              - Elements of type **Object**
                - `Target`: **String**
                - `Aliases`: **Array**
                  - Elements of type **String**
            - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
              - `Name`: **String**
              - `Options`: **Object**
                - `[KEY]`: **String**
          - `Mode`: **Object** Scheduling mode for the service.
            - `Replicated`: **Object**
              - `Replicas`: **Integer**
            - `Global`: **Object**
              
          - `UpdateConfig`: **Object** Specification for the update strategy of the service.
            - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
            - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
            - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
            - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
            - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
          - `Networks`: **Array** Array of network names or IDs to attach the service to.
            - Elements of type **Object**
              - `Target`: **String**
              - `Aliases`: **Array**
                - Elements of type **String**
          - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
            - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
            - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
              - Elements of type **Object**
                - `Name`: **String**
                - `Protocol`: **String**
                - `TargetPort`: **Integer** The port inside the container.
                - `PublishedPort`: **Integer** The port on the swarm hosts.
    
*/
exports.secretList = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/secrets',
    params: params,
    block: block,
    
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function secretCreate
  @summary Create a secret
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {Object} [body] See description.
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Setting 'body'
    
    - **Object**
      - `Name`: **String** User-defined name of the secret.
      - `Labels`: **Object** User-defined key/value metadata.
        - `[KEY]`: **String**
      - `Data`: **Array** Base64-url-safe-encoded secret data
        - Elements of type **String**
    
    #### Return value
    - **Object**
      - `ID`: **String** The ID of the created secret.
    
*/
exports.secretCreate = function(client, params, block) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/secrets/create',
    params: params,
    block: block,
    body: 'json',
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: [],
  });
};


/**
  @function secretInspect
  @summary Inspect a secret
  @return {Object}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the secret
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.
  @desc
    
    #### Return value
    - **Object**
      - `ID`: **String**
      - `Version`: **Object**
        - `Index`: **Integer**
      - `CreatedAt`: **String**
      - `UpdatedAt`: **String**
      - `Spec`: **Object** User modifiable configuration for a service.
        - `Name`: **String** Name of the service.
        - `Labels`: **Object** User-defined key/value metadata.
          - `[KEY]`: **String**
        - `TaskTemplate`: **Object** User modifiable task configuration.
          - `ContainerSpec`: **Object**
            - `Image`: **String** The image name to use for the container.
            - `Command`: **Array** The command to be run in the image.
              - Elements of type **String**
            - `Args`: **Array** Arguments to the command.
              - Elements of type **String**
            - `Env`: **Array** A list of environment variables in the form `VAR=value`.
              - Elements of type **String**
            - `Dir`: **String** The working directory for commands to run in.
            - `User`: **String** The user inside the container.
            - `Labels`: **Object** User-defined key/value data.
              - `[KEY]`: **String**
            - `TTY`: **Boolean** Whether a pseudo-TTY should be allocated.
            - `Mounts`: **Array** Specification for mounts to be added to containers created as part of the service.
              - Elements of type **Object**
                - `Target`: **String** Container path.
                - `Source`: **anything** Mount source (e.g. a volume name, a host path).
                - `Type`: **String** The mount type. Available types:    - `bind` Mounts a file or directory from the host into the container. Must exist prior to creating the container.  - `volume` Creates a volume with the given name and options (or uses a pre-existing volume with the same name and options). These are **not** removed when the container is removed.  - `tmpfs` Create a tmpfs with the given options. The mount source cannot be specified for tmpfs.  
                - `ReadOnly`: **Boolean** Whether the mount should be read-only.
                - `BindOptions`: **Object** Optional configuration for the `bind` type.
                  - `Propagation`: **String** A propagation mode with the value `[r]private`, `[r]shared`, or `[r]slave`.
                - `VolumeOptions`: **Object** Optional configuration for the `volume` type.
                  - `NoCopy`: **Boolean** Populate volume with data from the target. (Optional; default: 'false')
                  - `Labels`: **Object** User-defined key/value metadata.
                    - `[KEY]`: **String**
                  - `DriverConfig`: **Object** Map of driver specific options
                    - `Name`: **String** Name of the driver to use to create the volume.
                    - `Options`: **Object** key/value map of driver specific options.
                      - `[KEY]`: **String**
                - `TmpfsOptions`: **Object** Optional configuration for the `tmpfs` type.
                  - `SizeBytes`: **Integer** The size for the tmpfs mount in bytes.
                  - `Mode`: **Integer** The permission mode for the tmpfs mount in an integer.
            - `StopGracePeriod`: **Integer** Amount of time to wait for the container to terminate before forcefully killing it.
            - `DNSConfig`: **Object** Specification for DNS related configurations in resolver configuration file (`resolv.conf`).
              - `Nameservers`: **Array** The IP addresses of the name servers.
                - Elements of type **String**
              - `Search`: **Array** A search list for host-name lookup.
                - Elements of type **String**
              - `Options`: **Array** A list of internal resolver variables to be modified (e.g., `debug`, `ndots:3`, etc.).
                - Elements of type **String**
          - `Resources`: **Object** Resource requirements which apply to each individual container created as part of the service.
            - `Limits`: **Object** Define resources limits.
              - `NanoCPUs`: **Integer** CPU limit in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory limit in Bytes.
            - `Reservation`: **Object** Define resources reservation.
              - `NanoCPUs`: **Integer** CPU reservation in units of 10<sup>-9</sup> CPU shares.
              - `MemoryBytes`: **Integer** Memory reservation in Bytes.
          - `RestartPolicy`: **Object** Specification for the restart policy which applies to containers created as part of this service.
            - `Condition`: **String** Condition for restart.
            - `Delay`: **Integer** Delay between restart attempts.
            - `MaxAttempts`: **Integer** Maximum attempts to restart a given container before giving up (default value is 0, which is ignored). (Optional; default: '0')
            - `Window`: **Integer** Windows is the time window used to evaluate the restart policy (default value is 0, which is unbounded). (Optional; default: '0')
          - `Placement`: **Object**
            - `Constraints`: **Array** An array of constraints.
              - Elements of type **String**
          - `ForceUpdate`: **Integer** A counter that triggers an update even if no relevant parameters have been changed.
          - `Networks`: **Array**
            - Elements of type **Object**
              - `Target`: **String**
              - `Aliases`: **Array**
                - Elements of type **String**
          - `LogDriver`: **Object** Specifies the log driver to use for tasks created from this spec. If not present, the default one for the swarm will be used, finally falling back to the engine default if not specified.
            - `Name`: **String**
            - `Options`: **Object**
              - `[KEY]`: **String**
        - `Mode`: **Object** Scheduling mode for the service.
          - `Replicated`: **Object**
            - `Replicas`: **Integer**
          - `Global`: **Object**
            
        - `UpdateConfig`: **Object** Specification for the update strategy of the service.
          - `Parallelism`: **Integer** Maximum number of tasks to be updated in one iteration (0 means unlimited parallelism).
          - `Delay`: **Integer** Amount of time between updates, in nanoseconds.
          - `FailureAction`: **String** Action to take if an updated task fails to run, or stops running during the update.
          - `Monitor`: **Integer** Amount of time to monitor each updated task for failures, in nanoseconds.
          - `MaxFailureRatio`: **Number** The fraction of tasks that may fail during an update before the failure action is invoked, specified as a floating point number between 0 and 1. (Optional; default: '0')
        - `Networks`: **Array** Array of network names or IDs to attach the service to.
          - Elements of type **Object**
            - `Target`: **String**
            - `Aliases`: **Array**
              - Elements of type **String**
        - `EndpointSpec`: **Object** Properties that can be configured to access and load balance a service.
          - `Mode`: **String** The mode of resolution to use for internal load balancing between tasks. (Optional; default: ''vip'')
          - `Ports`: **Array** List of exposed ports that this service is accessible on from the outside. Ports can only be provided if `vip` resolution mode is used.
            - Elements of type **Object**
              - `Name`: **String**
              - `Protocol`: **String**
              - `TargetPort`: **Integer** The port inside the container.
              - `PublishedPort`: **Integer** The port on the swarm hosts.
    
*/
exports.secretInspect = function(client, params, block) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/secrets/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


/**
  @function secretDelete
  @summary Delete a secret
  @return {UNDOCUMENTED}
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the secret
  @param {optional Function} [block] If this function is provided, it will receive the raw [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The connection will automatically be destroyed when `block` exits.

*/
exports.secretDelete = function(client, params, block) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/secrets/{id}',
    params: params,
    block: block,
    
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: [],
  });
};


