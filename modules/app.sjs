/**
  @summary Client side app utilities
  @hostenv xbrowser
  @desc
    **NOTE:** This module is provided by the document template. If you
    use a custom template or a non-app template, the module may have different functionality
    (or may not even be available).
    
    The default template for `.app` modules is `app-default`.
    The default template for documents created with [surface::Document] is
    `default`, which _does not_ provide an `mho:app` module.

    For a list of available template modules, see [surface/doc-template/::].

    ### HTML exports

    In addition to the symbols documented here, the `mho:app` module
    exports top-level HTML builders. These are taken from
    [surface/bootstrap/html::] (for `app-default`)
    or
    [surface/html::] (for `app-plain`).
    All symbol names that clash with a symbol in
    [mho:std::] are suppressed, to ensure compatibility with
    the following idiom:

        @ = require(['mho:app', 'mho:std'])

    Currently, the only symbol suppressed due to a name clash is `Style`.
    
  @function withBusyIndicator
  @param {Function} [block]
  @summary Show a busy indicator for the duration of `block` _(app-default)_
  @desc
    **Availability:** `app-default` template only.

    `withBusyIndicator` is safe to call concurrently from multiple
    strata - only the first call will show the busy indicator, and
    it will be shown until the last block completes.

    Multiple calls to `withBusyIndicator` are also condensed - the
    indicator won't actually be hidden and re-shown if `withBusyIndicator`
    is called immediately after a previous call completes
    (i.e within the same event loop).

  @variable body
  @summary document.body _(app-default, app-plain)_
  @desc
    **Availability:** `app-default`, `app-plain`.

  @variable mainContent
  @summary The topmost container element _(app-default, app-plain)_
  @desc
    **Availability:** `app-default`, `app-plain`

  @function withAPI
  @param {Object} [api] api module
  @param {Function} [block]
  @summary Connect and use an `.api` module _(app-default)_
  @desc
    **Availability:** `app-default`

    The `withApi` opens a connection to the given API, and invokes
    `block` with the API's exports.

    If the API connection is lost, `block` is retracted and
    a default UI notification is displayed informing the user that
    the app is disconnected, and displaying the time until the next
    connection attempt. `withAPI` will keep attempting to reconnect
    with an exponential backoff capped at 10 minutes.
*/
