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

    **Note:** Because this function is frequently used to wrap
    the initial `require()` statements in an application, it is
    pre-loaded as `window.withBusyIndicator`. This means that instead of:

      require('mho:app').withBusyIndicator {||
        @ = require( <dependencies...> );
      }

    You should typically use:

      withBusyIndicator {||
        @ = require( <dependencies...> );
      }

    Since other parts of `mho:app` may load resources from the server,
    this second form will ensure the busy indicator is displayed as soon as
    possible.

    `withBusyIndicator` is safe to call concurrently from multiple
    strata - only the first call will show the busy indicator, and
    it will be shown until the last block completes.

    Multiple calls to `withBusyIndicator` are also condensed - the
    indicator won't actually be hidden and re-shown if `withBusyIndicator`
    is called immediately after a previous call completes
    (i.e within the same event loop).

    ### Asymmetrical use:

    In some cases, wrapping an entire block with `withBusyIndicator` does not
    reflect the boundaries of when your app is "busy" - e.g:

        withBusyIndicator {||
          app.run {||
            // application is done loading here, but `withBusyIndicator`
            // won't actually return until the app exits
            mainLoop();
          }
        }

    For such cases, `withBusyIndicator` passes a single function to your block.
    If you invoke it during the block's execution, that will be the point at
    which the busy indicator completes, rather than when the call to
    `withBusyIndicator` returns.

        withBusyIndicator { |doneLoading|
          app.run {||
            doneLoading(); // indicator will be hidden here
            mainLoop();
          }
        }

  @variable mainContent
  @summary The topmost container element _(app-default, app-plain)_
  @desc
    **Availability:** `app-default`, `app-plain`

  @function withAPI
  @param {Object} [api] api module
  @param {Function} [block]
  @summary alias for [surface/api-connection::withAPI] _(app-default)_
  @desc
    **Availability:** `app-default`

  @function Notice
  @param {surface/HtmlFragment} [content]
  @param {optional Settings} [settings]
  @summary alias for [surface/bootstrap/notice::Notice] _(app-default)_
  @desc
    **Availability:** `app-default`

*/
