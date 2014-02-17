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
@summary Client-side application modules
@desc
  The `.app` file format is a module that is intended to form
  the main logic of a client-side application.

  `.app` files are served by conductance with default
  HTML boilerplate which wraps the contents of the `.app` file
  in a plain HTML document.

  In addition to the main (StratifiedJS) content of an `.app` file,
  conductance will scan [sjs:#language/metadata::] comments (those beginning with `/**`)
  for certain directives. These directives are documented on this page,
  and allow you to control the HTML boilerplate used.

  ### Builtin features

  The `app-default` template (the default HTML template for `.app` files)
  includes [Twitter Bootstrap](http://getbootstrap.com/) CSS, as well as its
  javascript dependencies. The default template also makes available
  a number of utilities via the [mho:app::] module.

  You can customise the template used with the [::@template] directive.

  ### Code reuse:

  `.app` modules cannot be imported by other modules, so they are
  not an appropriate place for reusable code. Reusable code
  should typically be placed in separate `.sjs` modules.

@feature @template
@summary Use a custom HTML template
@desc
  To specify a template for a given `.app` file, use the @template
  directive inside a metadata comment.

  ### Example:

      /**
        @template plain
       *\/

  The list of builtin template names can be found at
  [surface/doc-template/::]. The default template for
  `.app` files is `app-default`.
  
  You can also specify a relative path if you wish to use your own
  template module. Custom templates will be loaded via
  [surface::loadTemplate].

@feature @template-title
@summary Set the document title
@desc
  This allows you to set an initial <title> content for
  the .app:

  ### Example:

      /**
        @template-title Conductance Chat Demo
       *\/


@feature @template-show-error-dialog
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

@feature @template-wrap-content
@summary Enable / disable the default <div class="container"> wrapper
@desc
  By default, the `app-default` template wraps the body of a page in
  a <div class="container"> element.

  You can disable this with:

      /**
        @ template-wrap-content false
       *\/

@feature @template-use-bootstrap
@summary Disable twitter bootstrap CSS/JS
@desc
  If set to false, the default twitter bootstrap CSS and Javascript
  will not be included in the document.

@feature @template-show-busy-indicator
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
  test \`backticks

  ### Example:

      /**
        @template-show-busy-indicator
      *\/

@feature @bundle
@summary Bundle this module's dependencies
@desc
  By default, `.sjs` modules used by an `.app` are loaded
  individually, on-demand. If you include the `@bundle`
  directive, Conductance will serve up this app's code as
  a single file containing all required modules.

  This reduces the number of round-trips, but reduces the
  opportunity for caching - i.e different bundles will
  duplicate all common modules, and a change
  in any file will cause the entire bundle to
  be re-downloaded).
*/
