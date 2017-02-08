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
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [all=false] Return all containers. By default, only running containers are shown
  @setting {optional Integer} [limit] Return this number of most recently created containers, including non-running ones.
  @setting {optional Boolean} [size=false] Return the size of container as fields `SizeRw` and `SizeRootFs`.
  @setting {optional String} [filters] See description
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
    
    
*/
exports.containerList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/json',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['all','limit','size','filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerCreate
  @summary Create a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [name] Assign the specified name to the container. Must match `/?[a-zA-Z0-9_-]+`.
  @setting {COMPLEX} [body] Container to create

*/
exports.containerCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/create',
    params: params,
    requiredParams: ['body'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function containerInspect
  @summary Inspect a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [size=false] Return the size of container as fields `SizeRw` and `SizeRootFs`
  @desc
    Return low-level information about a container.
    
*/
exports.containerInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/json',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['size'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerTop
  @summary List processes running inside a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [ps_args=-ef] The arguments to pass to `ps`. For example, `aux`
  @desc
    On Unix systems, this is done by running the `ps` command. This endpoint is not supported on Windows.
    
*/
exports.containerTop = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/top',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['ps_args'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerLogs
  @summary Get container logs
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [follow=false] See description
  @setting {optional Boolean} [stdout=false] Return logs from `stdout`
  @setting {optional Boolean} [stderr=false] Return logs from `stderr`
  @setting {optional Integer} [since=0] Only return logs since this time, as a UNIX timestamp
  @setting {optional Boolean} [timestamps=false] Add timestamps to every log line
  @setting {optional String} [tail=all] Only return this number of log lines from the end of the logs. Specify as an integer or `all` to output all log lines.
  @desc
    Get `stdout` and `stderr` logs from a container.
    
    Note: This endpoint works only for containers with the `json-file` or `journald` logging driver.
    
    
    #### Setting 'follow'
    Return the logs as a stream.
    
    This will return a `101` HTTP response with a `Connection: upgrade` header, then hijack the HTTP connection to send raw output. For more information about hijacking and the stream format, [::containerAttach].
    
    
*/
exports.containerLogs = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/logs',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['follow','stdout','stderr','since','timestamps','tail'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerChanges
  @summary Get changes on a container’s filesystem
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @desc
    Returns which files in a container's filesystem have been added, deleted, or modified. The `Kind` of modification can be one of:
    
    - `0`: Modified
    - `1`: Added
    - `2`: Deleted
    
    
*/
exports.containerChanges = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/changes',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerExport
  @summary Export a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @desc
    Export the contents of a container as a tarball.
    
*/
exports.containerExport = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/export',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerStats
  @summary Get container stats based on resource usage
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [stream=true] Stream the output. If false, the stats will be output once and then it will disconnect.
  @desc
    This endpoint returns a live stream of a container’s resource usage statistics.
    
    The `precpu_stats` is the CPU statistic of last read, which is used for calculating the CPU usage percentage. It is not the same as the `cpu_stats` field.
    
    
*/
exports.containerStats = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/stats',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['stream'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerResize
  @summary Resize a container TTY
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [h] Height of the tty session in characters
  @setting {optional Integer} [w] Width of the tty session in characters
  @desc
    Resize the TTY for a container. You must restart the container for the resize to take effect.
    
*/
exports.containerResize = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/resize',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['h','w'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerStart
  @summary Start a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container. Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.

*/
exports.containerStart = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/start',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerStop
  @summary Stop a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [t] Number of seconds to wait before killing the container

*/
exports.containerStop = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/stop',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['t'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerRestart
  @summary Restart a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Integer} [t] Number of seconds to wait before killing the container

*/
exports.containerRestart = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/restart',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['t'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerKill
  @summary Kill a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [signal=SIGKILL] Signal to send to the container as an integer or string (e.g. `SIGINT`)
  @desc
    Send a POSIX signal to a container, defaulting to killing to the container.
    
*/
exports.containerKill = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/kill',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['signal'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerUpdate
  @summary Update a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {COMPLEX} [update] 
  @desc
    Change various configuration options of a container without having to recreate it.
    
*/
exports.containerUpdate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/update',
    params: params,
    requiredParams: ['id','update'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['update'],
    headerParams: []
  });
};


/**
  @function containerRename
  @summary Rename a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [name] New name for the container

*/
exports.containerRename = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/rename',
    params: params,
    requiredParams: ['id','name'],
    pathParams: ['id'],
    queryParams: ['name'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerPause
  @summary Pause a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @desc
    Use the cgroups freezer to suspend all processes in a container.
    
    Traditionally, when suspending a process the `SIGSTOP` signal is used, which is observable by the process being suspended. With the cgroups freezer the process is unaware, and unable to capture, that it is being suspended, and subsequently resumed.
    
    
*/
exports.containerPause = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/pause',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerUnpause
  @summary Unpause a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @desc
    Resume a container which has been paused.
    
*/
exports.containerUnpause = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/unpause',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerAttach
  @summary Attach to a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container.Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,` or `_`.
  @setting {optional Boolean} [logs=false] See description
  @setting {optional Boolean} [stream=false] Stream attached streams from the the time the request was made onwards
  @setting {optional Boolean} [stdin=false] Attach to `stdin`
  @setting {optional Boolean} [stdout=false] Attach to `stdout`
  @setting {optional Boolean} [stderr=false] Attach to `stderr`
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
exports.containerAttach = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/attach',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys','logs','stream','stdin','stdout','stderr'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerAttachWebsocket
  @summary Attach to a container via a websocket
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional String} [detachKeys] Override the key sequence for detaching a container.Format is a single character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`, `@`, `^`, `[`, `,`, or `_`.
  @setting {optional Boolean} [logs=false] Return logs
  @setting {optional Boolean} [stream=false] Return stream
  @setting {optional Boolean} [stdin=false] Attach to `stdin`
  @setting {optional Boolean} [stdout=false] Attach to `stdout`
  @setting {optional Boolean} [stderr=false] Attach to `stderr`

*/
exports.containerAttachWebsocket = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/attach/ws',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['detachKeys','logs','stream','stdin','stdout','stderr'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerWait
  @summary Wait for a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @desc
    Block until a container stops, then returns the exit code.
    
*/
exports.containerWait = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/wait',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerDelete
  @summary Remove a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {optional Boolean} [v=false] Remove the volumes associated with the container.
  @setting {optional Boolean} [force=false] If the container is running, kill it before removing it.

*/
exports.containerDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/containers/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['v','force'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerArchiveHead
  @summary Get information about files in a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Resource in the container’s filesystem to archive.
  @desc
    A response header `X-Docker-Container-Path-Stat` is return containing a base64 - encoded JSON object with some filesystem header information about the path.
    
*/
exports.containerArchiveHead = function(client, params) {
  return client.performRequest({
    method: 'HEAD',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    requiredParams: ['id','path'],
    pathParams: ['id'],
    queryParams: ['path'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerGetArchive
  @summary Get an archive of a filesystem resource in a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Resource in the container’s filesystem to archive.
  @desc
    Get an tar archive of a resource in the filesystem of container id.
    
*/
exports.containerGetArchive = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    requiredParams: ['id','path'],
    pathParams: ['id'],
    queryParams: ['path'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function containerPutArchive
  @summary Extract an archive of files or folders to a directory in a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of the container
  @setting {String} [path] Path to a directory in the container to extract the archive’s contents into. 
  @setting {optional String} [noOverwriteDirNonDir] If “1”, “true”, or “True” then it will be an error if unpacking the given content would cause an existing directory to be replaced with a non-directory and vice versa.
  @setting {COMPLEX} [inputStream] The input stream must be a tar archive compressed with one of the following algorithms: identity (no compression), gzip, bzip2, xz.
  @desc
    Upload a tar archive to be extracted to a path in the filesystem of container id.
    
*/
exports.containerPutArchive = function(client, params) {
  return client.performRequest({
    method: 'PUT',
    url: '/v1.25/containers/{id}/archive',
    params: params,
    requiredParams: ['id','path','inputStream'],
    pathParams: ['id'],
    queryParams: ['path','noOverwriteDirNonDir'],
    bodyParams: ['inputStream'],
    headerParams: []
  });
};


/**
  @function containerPrune
  @summary Delete stopped containers
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
*/
exports.containerPrune = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/prune',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageList
  @summary List Images
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [all=false] Show all images. Only images from a final layer (no children) are shown by default.
  @setting {optional String} [filters] See description
  @setting {optional Boolean} [digests=false] Show digest information as a `RepoDigests` field on each image.
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
    
    
*/
exports.imageList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/json',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['all','filters','digests'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageBuild
  @summary Build an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [inputStream] A tar archive compressed with one of the following algorithms: identity (no compression), gzip, bzip2, xz.
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
  @desc
    Build an image from a tar archive with a `Dockerfile` in it.
    
    The `Dockerfile` specifies how the image is built from the tar archive. It is typically in the archive's root, but can be at a different path or have a different name by specifying the `dockerfile` parameter. [See the `Dockerfile` reference for more information](https://docs.docker.com/engine/reference/builder/).
    
    The Docker daemon performs a preliminary validation of the `Dockerfile` before starting the build, and returns an error if the syntax is incorrect. After that, each instruction is run one-by-one until the ID of the new image is output.
    
    The build is canceled if the client drops the connection by quitting or being killed.
    
    
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
exports.imageBuild = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/build',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['dockerfile','t','remote','q','nocache','cachefrom','pull','rm','forcerm','memory','memswap','cpushares','cpusetcpus','cpuperiod','cpuquota','buildargs','shmsize','squash','labels','networkmode'],
    bodyParams: ['inputStream'],
    headerParams: ['Content-type','X-Registry-Config']
  });
};


/**
  @function imageCreate
  @summary Create an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [fromImage] Name of the image to pull. The name may include a tag or digest. This parameter may only be used when pulling an image. The pull is cancelled if the HTTP connection is closed.
  @setting {optional String} [fromSrc] Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image.
  @setting {optional String} [repo] Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image.
  @setting {optional String} [tag] Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled.
  @setting {COMPLEX} [inputImage] Image content if the value `-` has been specified in fromSrc query parameter
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration. [See the authentication section for details.](#section/Authentication)
  @desc
    Create an image by either pulling it from a registry or importing it.
    
*/
exports.imageCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/create',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['fromImage','fromSrc','repo','tag'],
    bodyParams: ['inputImage'],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function imageInspect
  @summary Inspect an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or id
  @desc
    Return low-level information about an image.
    
*/
exports.imageInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/json',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageHistory
  @summary Get the history of an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
  @desc
    Return parent layers of an image.
    
*/
exports.imageHistory = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/history',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imagePush
  @summary Push an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID.
  @setting {optional String} [tag] The tag to associate with the image on the registry.
  @setting {String} [X-Registry-Auth] A base64-encoded auth configuration. [See the authentication section for details.](#section/Authentication)
  @desc
    Push an image to a registry.
    
    If you wish to push an image on to a private registry, that image must already have a tag which references the registry. For example, `registry.example.com/myimage:latest`.
    
    The push is cancelled if the HTTP connection is closed.
    
    
*/
exports.imagePush = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/{name}/push',
    params: params,
    requiredParams: ['name','X-Registry-Auth'],
    pathParams: ['name'],
    queryParams: ['tag'],
    bodyParams: [],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function imageTag
  @summary Tag an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID to tag.
  @setting {optional String} [repo] The repository to tag in. For example, `someuser/someimage`.
  @setting {optional String} [tag] The name of the new tag.
  @desc
    Tag an image so that it becomes part of a repository.
    
*/
exports.imageTag = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/{name}/tag',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['repo','tag'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageDelete
  @summary Remove an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
  @setting {optional Boolean} [force=false] Remove the image even if it is being used by stopped containers or has other tags
  @setting {optional Boolean} [noprune=false] Do not delete untagged parent images
  @desc
    Remove an image, along with any untagged parent images that were referenced by that image.
    
    Images can't be removed if they have descendant images, are being used by a running container or are being used by a build.
    
    
*/
exports.imageDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/images/{name}',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force','noprune'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageSearch
  @summary Search images
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [term] Term to search
  @setting {optional Integer} [limit] Maximum number of results to return
  @setting {optional String} [filters] See description
  @desc
    Search for an image on Docker Hub.
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the images list. Available filters:

    
    - `stars=<number>`
    - `is-automated=(true|false)`
    - `is-official=(true|false)`
    
    
*/
exports.imageSearch = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/search',
    params: params,
    requiredParams: ['term'],
    pathParams: [],
    queryParams: ['term','limit','filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imagePrune
  @summary Delete unused images
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    - `dangling=<boolean>` When set to `true` (or `1`), prune only
       unused *and* untagged images. When set to `false`
       (or `0`), all unused images are pruned.
    
    
*/
exports.imagePrune = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/prune',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function systemAuth
  @summary Check auth configuration
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [authConfig] Authentication to check
  @desc
    Validate credentials for a registry and, if available, get an identity token for accessing the registry without password.
    
*/
exports.systemAuth = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/auth',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: ['authConfig'],
    headerParams: []
  });
};


/**
  @function systemInfo
  @summary Get system information
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]

*/
exports.systemInfo = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/info',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function systemVersion
  @summary Get version
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @desc
    Returns the version of Docker that is running and various information about the system that Docker is running on.
    
*/
exports.systemVersion = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/version',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function systemPing
  @summary Ping
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @desc
    This is a dummy endpoint you can use to test if the server is accessible.
    
*/
exports.systemPing = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/_ping',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageCommit
  @summary Create a new image from a container
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [containerConfig] The container configuration
  @setting {optional String} [container] The ID or name of the container to commit
  @setting {optional String} [repo] Repository name for the created image
  @setting {optional String} [tag] Tag name for the create image
  @setting {optional String} [comment] Commit message
  @setting {optional String} [author] Author of the image (e.g., `John Hannibal Smith <hannibal@a-team.com>`)
  @setting {optional Boolean} [pause=true] Whether to pause the container before committing
  @setting {optional String} [changes] `Dockerfile` instructions to apply while committing

*/
exports.imageCommit = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/commit',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['container','repo','tag','comment','author','pause','changes'],
    bodyParams: ['containerConfig'],
    headerParams: []
  });
};


/**
  @function systemEvents
  @summary Monitor events
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [since] Show events created since this timestamp then stream new events.
  @setting {optional String} [until] Show events created until this timestamp then stop streaming.
  @setting {optional String} [filters] See description
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
    
    
*/
exports.systemEvents = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/events',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['since','until','filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function systemDataUsage
  @summary Get data usage information
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]

*/
exports.systemDataUsage = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/system/df',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageGet
  @summary Export an image
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Image name or ID
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
exports.imageGet = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/{name}/get',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageGetAll
  @summary Export several images
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Array} [names] Image names to filter by
  @desc
    Get a tarball containing all images and metadata for several image repositories.
    
    For each value of the `names` parameter: if it is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned; if it is an image ID, similarly only that image (and its parents) are returned and there would be no names referenced in the 'repositories' file for this image ID.
    
    For details on the format, see [::imageGet].
    
    
*/
exports.imageGetAll = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/images/get',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['names'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function imageLoad
  @summary Import images
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [imagesTarball] Tar archive containing images
  @setting {optional Boolean} [quiet=false] Suppress progress details during load.
  @desc
    Load a set of images and tags into a repository.
    
    For details on the format, see [::imageGet].
    
    
*/
exports.imageLoad = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/images/load',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['quiet'],
    bodyParams: ['imagesTarball'],
    headerParams: []
  });
};


/**
  @function containerExec
  @summary Create an exec instance
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [execConfig] Exec configuration
  @setting {String} [id] ID or name of container
  @desc
    Run a command inside a running container.
    
*/
exports.containerExec = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/containers/{id}/exec',
    params: params,
    requiredParams: ['execConfig','id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['execConfig'],
    headerParams: []
  });
};


/**
  @function execStart
  @summary Start an exec instance
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [execStartConfig] 
  @setting {String} [id] Exec instance ID
  @desc
    Starts a previously set up exec instance. If detach is true, this endpoint returns immediately after starting the command. Otherwise, it sets up an interactive session with the command.
    
*/
exports.execStart = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/exec/{id}/start',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['execStartConfig'],
    headerParams: []
  });
};


/**
  @function execResize
  @summary Resize an exec instance
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Exec instance ID
  @setting {optional Integer} [h] Height of the TTY session in characters
  @setting {optional Integer} [w] Width of the TTY session in characters
  @desc
    Resize the TTY session used by an exec instance. This endpoint only works if `tty` was specified as part of creating and starting the exec instance.
    
*/
exports.execResize = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/exec/{id}/resize',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['h','w'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function execInspect
  @summary Inspect an exec instance
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Exec instance ID
  @desc
    Return low-level information about an exec instance.
    
*/
exports.execInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/exec/{id}/json',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function volumeList
  @summary List volumes
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
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
    
    
*/
exports.volumeList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/volumes',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function volumeCreate
  @summary Create a volume
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [volumeConfig] Volume configuration

*/
exports.volumeCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/volumes/create',
    params: params,
    requiredParams: ['volumeConfig'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['volumeConfig'],
    headerParams: []
  });
};


/**
  @function volumeInspect
  @summary Inspect a volume
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Volume name or ID

*/
exports.volumeInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/volumes/{name}',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function volumeDelete
  @summary Remove a volume
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] Volume name or ID
  @setting {optional Boolean} [force=false] Force the removal of the volume
  @desc
    Instruct the driver to remove the volume.
    
*/
exports.volumeDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/volumes/{name}',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function volumePrune
  @summary Delete unused volumes
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
*/
exports.volumePrune = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/volumes/prune',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function networkList
  @summary List networks
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    JSON encoded value of the filters (a `map[string][]string`) to process on the networks list. Available filters:

    
    - `driver=<driver-name>` Matches a network's driver.
    - `id=<network-id>` Matches all or part of a network ID.
    - `label=<key>` or `label=<key>=<value>` of a network label.
    - `name=<network-name>` Matches all or part of a network name.
    - `type=["custom"|"builtin"]` Filters networks by type. The `custom` keyword returns all user-defined networks.
    
    
*/
exports.networkList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/networks',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function networkInspect
  @summary Inspect a network
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name

*/
exports.networkInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/networks/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function networkDelete
  @summary Remove a network
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name

*/
exports.networkDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/networks/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function networkCreate
  @summary Create a network
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [networkConfig] Network configuration

*/
exports.networkCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/create',
    params: params,
    requiredParams: ['networkConfig'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['networkConfig'],
    headerParams: []
  });
};


/**
  @function networkConnect
  @summary Connect a container to a network
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @setting {COMPLEX} [container] 

*/
exports.networkConnect = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/{id}/connect',
    params: params,
    requiredParams: ['id','container'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['container'],
    headerParams: []
  });
};


/**
  @function networkDisconnect
  @summary Disconnect a container from a network
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] Network ID or name
  @setting {COMPLEX} [container] 

*/
exports.networkDisconnect = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/{id}/disconnect',
    params: params,
    requiredParams: ['id','container'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: ['container'],
    headerParams: []
  });
};


/**
  @function networkPrune
  @summary Delete unused networks
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    Filters to process on the prune list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    
    
*/
exports.networkPrune = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/networks/prune',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginList
  @summary List plugins
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @desc
    Returns information about installed plugins.
    
*/
exports.pluginList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function getPluginPrivileges
  @summary Get plugin privileges
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.

*/
exports.getPluginPrivileges = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins/privileges',
    params: params,
    requiredParams: ['name'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginPull
  @summary Install a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [remote] See description
  @setting {optional String} [name] See description
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration to use when pulling a plugin from a registry. [See the authentication section for details.](#section/Authentication)
  @setting {COMPLEX} [body] 
  @desc
    Pulls and installs a plugin. After the plugin is installed, it can be enabled using the [::postPluginsEnable].
    
    
    #### Setting 'remote'
    Remote reference for plugin to install.
    
    The `:latest` tag is optional, and is used as the default if omitted.
    
    
    #### Setting 'name'
    Local name for the pulled plugin.
    
    The `:latest` tag is optional, and is used as the default if omitted.
    
    
*/
exports.pluginPull = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/pull',
    params: params,
    requiredParams: ['remote'],
    pathParams: [],
    queryParams: ['remote','name'],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function pluginInspect
  @summary Inspect a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.

*/
exports.pluginInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/plugins/{name}/json',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginDelete
  @summary Remove a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {optional Boolean} [force=false] Disable the plugin before removing. This may result in issues if the plugin is in use by a container.

*/
exports.pluginDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/plugins/{name}',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginEnable
  @summary Enable a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {optional Integer} [timeout=0] Set the HTTP client timeout (in seconds)

*/
exports.pluginEnable = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/enable',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: ['timeout'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginDisable
  @summary Disable a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.

*/
exports.pluginDisable = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/disable',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginUpgrade
  @summary Upgrade a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {String} [remote] See description
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration to use when pulling a plugin from a registry. [See the authentication section for details.](#section/Authentication)
  @setting {COMPLEX} [body] 
  @desc
    
    #### Setting 'remote'
    Remote reference to upgrade to.
    
    The `:latest` tag is optional, and is used as the default if omitted.
    
    
*/
exports.pluginUpgrade = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/upgrade',
    params: params,
    requiredParams: ['name','remote'],
    pathParams: ['name'],
    queryParams: ['remote'],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function pluginCreate
  @summary Create a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {COMPLEX} [tarContext] Path to tar containing plugin rootfs and manifest

*/
exports.pluginCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/create',
    params: params,
    requiredParams: ['name'],
    pathParams: [],
    queryParams: ['name'],
    bodyParams: ['tarContext'],
    headerParams: []
  });
};


/**
  @function pluginPush
  @summary Push a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @desc
    Push a plugin to the registry.
    
    
*/
exports.pluginPush = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/push',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function pluginSet
  @summary Configure a plugin
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [name] The name of the plugin. The `:latest` tag is optional, and is the default if omitted.
  @setting {COMPLEX} [body] 

*/
exports.pluginSet = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/plugins/{name}/set',
    params: params,
    requiredParams: ['name'],
    pathParams: ['name'],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function nodeList
  @summary List nodes
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    Filters to process on the nodes list, encoded as JSON (a `map[string][]string`).
    
    Available filters:

    - `id=<node id>`
    - `label=<engine label>`
    - `membership=`(`accepted`|`pending`)`
    - `name=<node name>`
    - `role=`(`manager`|`worker`)`
    
    
*/
exports.nodeList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/nodes',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function nodeInspect
  @summary Inspect a node
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID or name of the node

*/
exports.nodeInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/nodes/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function nodeDelete
  @summary Delete a node
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID or name of the node
  @setting {optional Boolean} [force=false] Force remove a node from the swarm

*/
exports.nodeDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/nodes/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function nodeUpdate
  @summary Update a node
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID of the node
  @setting {COMPLEX} [body] 
  @setting {Integer} [version] The version number of the node object being updated. This is required to avoid conflicting writes.

*/
exports.nodeUpdate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/nodes/{id}/update',
    params: params,
    requiredParams: ['id','version'],
    pathParams: ['id'],
    queryParams: ['version'],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function swarmInspect
  @summary Inspect swarm
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]

*/
exports.swarmInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/swarm',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function swarmInit
  @summary Initialize a new swarm
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 

*/
exports.swarmInit = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/init',
    params: params,
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function swarmJoin
  @summary Join an existing swarm
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 

*/
exports.swarmJoin = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/join',
    params: params,
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function swarmLeave
  @summary Leave a swarm
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional Boolean} [force=false] Force leave swarm, even if this is the last manager or that it will break the cluster.

*/
exports.swarmLeave = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/leave',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['force'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function swarmUpdate
  @summary Update a swarm
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 
  @setting {Integer} [version] The version number of the swarm object being updated. This is required to avoid conflicting writes.
  @setting {optional Boolean} [rotateWorkerToken=false] Rotate the worker join token.
  @setting {optional Boolean} [rotateManagerToken=false] Rotate the manager join token.
  @setting {optional Boolean} [rotateManagerUnlockKey=false] Rotate the manager unlock key.

*/
exports.swarmUpdate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/update',
    params: params,
    requiredParams: ['body','version'],
    pathParams: [],
    queryParams: ['version','rotateWorkerToken','rotateManagerToken','rotateManagerUnlockKey'],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function swarmUnlockkey
  @summary Get the unlock key
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]

*/
exports.swarmUnlockkey = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/swarm/unlockkey',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function swarmUnlock
  @summary Unlock a locked manager
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 

*/
exports.swarmUnlock = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/swarm/unlock',
    params: params,
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function serviceList
  @summary List services
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the services list. Available filters:

    
    - `id=<service id>`
    - `name=<service name>`
    - `label=<service label>`
    
    
*/
exports.serviceList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function serviceCreate
  @summary Create a service
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration for pulling from private registries. [See the authentication section for details.](#section/Authentication)

*/
exports.serviceCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/services/create',
    params: params,
    requiredParams: ['body'],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function serviceInspect
  @summary Inspect a service
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.

*/
exports.serviceInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function serviceDelete
  @summary Delete a service
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.

*/
exports.serviceDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/services/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function serviceUpdate
  @summary Update a service
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID or name of service.
  @setting {COMPLEX} [body] 
  @setting {Integer} [version] The version number of the service object being updated. This is required to avoid conflicting writes.
  @setting {optional String} [registryAuthFrom=spec] If the X-Registry-Auth header is not specified, this parameter indicates where to find registry authorization credentials. The valid values are `spec` and `previous-spec`.
  @setting {optional String} [X-Registry-Auth] A base64-encoded auth configuration for pulling from private registries. [See the authentication section for details.](#section/Authentication)

*/
exports.serviceUpdate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/services/{id}/update',
    params: params,
    requiredParams: ['id','body','version'],
    pathParams: ['id'],
    queryParams: ['version','registryAuthFrom'],
    bodyParams: ['body'],
    headerParams: ['X-Registry-Auth']
  });
};


/**
  @function serviceLogs
  @summary Get service logs
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
  @desc
    Get `stdout` and `stderr` logs from a service.
    
    **Note**: This endpoint works only for services with the `json-file` or `journald` logging drivers.
    
    
    #### Setting 'follow'
    Return the logs as a stream.
    
    This will return a `101` HTTP response with a `Connection: upgrade` header, then hijack the HTTP connection to send raw output. For more information about hijacking and the stream format, [::containerAttach].
    
    
*/
exports.serviceLogs = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/services/{id}/logs',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: ['details','follow','stdout','stderr','since','timestamps','tail'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function taskList
  @summary List tasks
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the tasks list. Available filters:

    
    - `id=<task id>`
    - `name=<task name>`
    - `service=<service name>`
    - `node=<node id or name>`
    - `label=key` or `label="key=value"`
    - `desired-state=(running | shutdown | accepted)`
    
    
*/
exports.taskList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/tasks',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function taskInspect
  @summary Inspect a task
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the task

*/
exports.taskInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/tasks/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function secretList
  @summary List secrets
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {optional String} [filters] See description
  @desc
    
    #### Setting 'filters'
    A JSON encoded value of the filters (a `map[string][]string`) to process on the secrets list. Available filters:

    
    - `names=<secret name>`
    
    
*/
exports.secretList = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/secrets',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: ['filters'],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function secretCreate
  @summary Create a secret
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {COMPLEX} [body] 

*/
exports.secretCreate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/secrets/create',
    params: params,
    requiredParams: [],
    pathParams: [],
    queryParams: [],
    bodyParams: ['body'],
    headerParams: []
  });
};


/**
  @function secretInspect
  @summary Inspect a secret
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the secret

*/
exports.secretInspect = function(client, params) {
  return client.performRequest({
    method: 'GET',
    url: '/v1.25/secrets/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function secretDelete
  @summary Delete a secret
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] ID of the secret

*/
exports.secretDelete = function(client, params) {
  return client.performRequest({
    method: 'DELETE',
    url: '/v1.25/secrets/{id}',
    params: params,
    requiredParams: ['id'],
    pathParams: ['id'],
    queryParams: [],
    bodyParams: [],
    headerParams: []
  });
};


/**
  @function secretUpdate
  @summary Update a Secret
  @param {DockerAPIClient} [api_client] API client as obtained by [../service::run]
  @param {Object} [settings] API call parameters
  @setting {String} [id] The ID of the secret
  @setting {COMPLEX} [body] The spec of the secret to update. Currently, only the Labels field can be updated. All other fields must remain unchanged from the [::secretInspect] response values.
  @setting {Integer} [version] The version number of the secret object being updated. This is required to avoid conflicting writes.

*/
exports.secretUpdate = function(client, params) {
  return client.performRequest({
    method: 'POST',
    url: '/v1.25/secrets/{id}/update',
    params: params,
    requiredParams: ['id','version'],
    pathParams: ['id'],
    queryParams: ['version'],
    bodyParams: ['body'],
    headerParams: []
  });
};


