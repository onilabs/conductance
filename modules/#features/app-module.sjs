/**
@type doc
@summary APP modules
@desc
  The `.app` file format is a module that is intended to form
  the main logic of a client-side application.

  `.app` files are served by conductance with default
  HTML boilerplate which wraps the contents of the `.app` file
  in a plain HTML document.

  In addition to the main (StratifiedJS) content of an `.app` file,
  conductance will scan metadata comments (those beginning with `/**`)
  for certain directives. These directives are documented on this page,
  and allow you to control the HTML boilerplate used.

  ### Builtin features

  The `app-default` template (the default HTML template for `.app` files)
  includes [Twitter Bootstrap](http://getbootstrap.com/) CSS, as well as its
  javascript dependencies. The default template also makes available
  a number of utilities via the [mho:app::] module.

  You can customise the template used with the [::template] directive.

  ### Code reuse:

  `.app` modules cannot be imported by other modules, so they are
  not an appropriate place for reusable code. Reusable code
  should typically be placed in separate `.sjs` modules.

@feature template
@summary Use a custom HTML template
@desc
  To specify a template for a given `.app` file, use the @template
  directive inside a documentation comment.

  ### Example:

      /**
        @template plain
       *\/

  The list of builtin template names can be found at
  [surface/doc-template/::]. The default template for
  `.app` files is `app-default`.
  
  You can also specify a relative path if you wish to use your own
  template module. Custom templates will be loaded via
  [server/formats::loadTemplate].

@feature template-title
@summary Set the document title
@desc
  This allows you to set an initial <title> content for
  the .app:

  ### Example:

      /**
        @template-title Conductance Chat Demo
       *\/


@feature template-show-error-dialog
@summary Enable / disable the default error dialog
@desc
  By default, the `app-default` template installs a simple
  handler for `window.onerror`, which removes all application UI
  and shows a simple error notification. This ensures that
  the user knows when something has gone wrong, but you may wish
  to disable it if you install your own error handling.

  ### Example:

      /**
        @ template-show-error-dialog false
       *\/

  **Note:** Even if you have your own error handling, the default
  error indicator can be useful for early-stage errors. For example,
  it is installed before the StratifiedJS runtime or your `.app`'s main
  script are loaded - a network error or a load-time error in your `.app`
  file will typically go unreported if you disable the builtin error handler.

  Instead of disabling this feature, it's often better to just override
  `window.onerror` once your application is successfully loaded.

@feature template-show-busy-indicator
@summary Begin the busy indicator on page load
@desc
  If set, the busy indicator (as shown by
  [app::withBusyIndicator] will be shown immedately on page load,
  rather than some time after your app's main module has started executing.

  The indicator is shown until the completion of the first call to
  [app::withBusyIndicator] - if you do not call this function, the
  indicator will be shown indefinitely (which is why this
  feature is not enabled by default).

  If your app does use [app::withBusyIndicator], you should
  generally use this flag as well so that there isn't a gap between
  page load and displaying the busy indicator.

  ### Example:

      /**
        @template-show-busy-indicator
      *\/
*/
