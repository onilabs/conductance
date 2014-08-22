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

    While you can write your own [server/route::] configuration to
    generate custom content from the server, this is best suited
    to truly dynamic content (like an API).

    For server-generated documents and other content, `.gen` files
    are often more convenient.

    `.gen` files are expected to export at least a [::content] method,
    and they may additionally export the other methods documented below.

    See also the [server/generator::] module, which provides utilities
    for use in generator files.

    ### Configuring .gen files

    For conductance to serve your `.gen` file in this way, the
    file must live within a directory configured as a
    [server/route::ExecutableDirectory] in your [./mho-file::] server configuration.

    It is important to only serve *trusted locations* with
    [server/route::ExecutableDirectory], as serving user-generated content in
    this way trivially allows users to execute arbitrary SJS code on your server.


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
    an `etag` function. This is combined with the file's
    modification time and the conductance version so that
    a client will not be re-sent the content for a request
    when their cached version has an identical etag.

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
*/
