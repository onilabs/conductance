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
  @type doc
  @summary Server-side generator files
  @desc
    A `.gen` file is used to serve generated content from the
    conductance web server.

    While you can write your own [server/route::] configuration in a [#features/mho-file::] to
    generate custom content, for server-generated documents, `.gen` files
    are often more convenient.

    `.gen` files are expected to export at least a [::content] method,
    and they may additionally export the other methods documented below.

    See also the [server/generator::] module, which provides utilities
    for use in generator files.

    For serving REST APIs see [#features/REST-file::]. For serving conductance-specific APIs see [#features/api-file::].

    ### Configuring .gen files

    For conductance to serve your `.gen` file in this way, the
    file must live within a directory configured as a
    [server/route::ExecutableDirectory] in your [./mho-file::] server configuration.

    It is important to only serve *trusted locations* with
    [server/route::ExecutableDirectory], as serving user-generated content in
    this way trivially allows users to execute arbitrary SJS code on your server.

    ### Wildcard _.gen files

    A file `_.gen` is a **wildcard** generator file: It will be
    invoked whenever a requested file in the directory of the `_.gen`
    file or any subdirectory thereof is not found. 

    The path of the requested file - with the directory portion up to the `_.gen` file stripped - will be passed to the [::content] & [::etag] functions as part of the `params` parameter under key `path`.

    ### Generated static HTML documents

    [mho:surface::Document] simplifies the creation of static HTML documents. See the examples there.

  @function content
  @summary Generate the page content
  @param {Object} [params] URL parameters
  @return {String} document content
  @desc
    `content` is executed in the context of a request - i.e
    inside the content function, `this` will refer to a
    [sjs:nodejs/http::ServerRequest] object.

    The return value must be a string. For generated
    HTML documents, you will typically use [surface::Document]
    to generate the content.

  @variable filetype
  @summary file type (extension)
  @desc
    By default, the file name will be used to infer the file
    type - e.g `index.html.gen` will be served as `text/html` content.
  
    If your file name does not contain an extension (or if you wish
    to override it), You should export `filetype`.
  
    ### Example:

      exports.filetype = 'html';

  @function etag
  @summary Generate an etag identifier
  @param {Object} [params] URL parameters
  @return {String} etag
  @desc
    So that clients can cache responses, it's recommended to set
    an `etag` function. This allows the client to re-use
    a cached version with a matching etag, rather than
    re-download the same content.

    .gen files that do not have an `etag` function will
    by default be served with a `cache-control` header that
    disables caching.

    If a `.gen` file's output depends on another
    `.sjs` module, conductance will not detect this by
    default - you will need to export an `etag` function
    that returns a new value after a dependency has changed.
    
    If you do not wish to track dependencies explicitly,
    you can use the [server/generator::moduleTimestamp] function
    to generate an etag function that always returns the
    timestamp of the file's initial import. This will
    cause a restart of conductance to generate a different
    etag, while repeated requests to the same conductance
    instance will be cached.

    ### Example:

        exports.etag = @moduleTimestamp();

  @function filter
  @summary Request filter function
  @param {sjs:nodejs/http::ServerRequest} [req]
  @param {Function} [block]
  @desc
    This function is equivalent to setting up
    a [server/route::Filter] on the route serving
    this file. In particular, it allows setting custom
    headers or aborting the request with and error or redirect
    before [::content] is even called.

    Note: as with functions passed to a [server/route::Filter],
    this function should always call `block` unless
    it fully handles the request.
*/
