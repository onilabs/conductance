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
  @type doc
  @summary Server-side REST generator files
  @desc
    A `.REST` file is used to handle HTTP requests programmatically.

    While you can write your own [server/route::] configuration in a [#features/mho-file::] to
    handle HTTP requests, `.REST` files
    are often more convenient.

    `.REST` files are expected to export one or more [::REQUEST_METHOD] functions.

    See also the [server/response::] module, which provides utilities
    for use in `.REST` files.

    For serving generated content see also [#features/gen-file::]. For serving conductance-specific APIs see [#features/api-file::].

    ### Configuring .REST files

    For conductance to serve your `.REST` file in this way, the
    file must live within a directory configured as a
    [server/route::ExecutableDirectory] in your [./mho-file::] server configuration.

    It is important to only serve *trusted locations* with
    [server/route::ExecutableDirectory], as serving user-generated content in
    this way trivially allows users to execute arbitrary SJS code on your server.

    ### Wildcard _.REST files

    A file `_.REST` is a **wildcard** generator file: It will be
    invoked whenever a requested file in the directory of the `_.REST`
    file or any subdirectory thereof is not found. 

    The path of the requested file - with the directory portion up to the `_.REST` file stripped - will be passed to the [::REQUEST_METHOD] function as part of the `params` parameter under key `path`.


  @function REQUEST_METHOD
  @summary Handle a HTTP request (REQUEST_METHOD must be a HTTP verb, e.g. "GET", "POST", "DELETE")
  @param {sjs:nodejs/http::ServerRequest} [request] Request object
  @param {Object} [params] URL parameters
  @desc
    The function should handle the request or throw an error. See also the [server/response::] module, which provides utitities for constructing responses and/or errors.

*/
