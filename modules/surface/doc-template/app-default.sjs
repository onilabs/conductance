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
  @type template
  @summary The default template for "*.app" modules (see [mho:#features/app-module::])
  @desc

    This template includes Twitter Bootstrap (with Conductance styling), and exposes
    a fully-featured [mho:app::] module.

    ### Symbols exported in mho:app

    In addition to the symbols documented below, app-default's `mho:app` module
    exports all the HTML builders provided by
    [surface/bootstrap/html::].

    
  @directive @template-title
  @summary Set the document title
  @desc
    This allows you to set an initial <title> content for
    the .app.

    ### Example:

        /**
          @template-title Conductance Chat Demo
         *\/


  @directive @template-show-error-dialog
  @summary Enable / disable the default error dialog
  @desc
    By default, the `app-default` template installs a simple
    handler for `window.onerror`, which removes all application UI
    and shows a simple error notification. This ensures that
    the user knows when something has gone wrong, but you may wish
    to disable it if you install your own error handling.
  
    ### Example:
  
        /**
          @template-show-error-dialog false
         *\/
  
    **Note:** Even if you have your own error handling, the default
    error indicator can be useful for early-stage errors. For example,
    it is installed before the StratifiedJS runtime or your `.app`'s main
    script are loaded - a network error or a load-time error in your `.app`
    file will typically go unreported if you disable the builtin error handler.
  
    Instead of disabling this feature, it's often better to just override
    `window.onerror` once your application is successfully loaded.


  @directive @template-show-busy-indicator
  @summary Begin the busy indicator on page load
  @desc
    If set, the busy indicator (as shown by
    [::withBusyIndicator]) will be shown
    immedately on page load, rather than some time after your app's main
    module has started executing.
  
    The indicator is shown until the completion of the first call to
    [::withBusyIndicator] - if you do not call this function, the
    indicator will be shown indefinitely (which is why this
    feature is not enabled by default).
  
    If your app does use [::withBusyIndicator], you should
    generally use this flag as well so that there isn't a gap between
    page load and displaying the busy indicator.
    
  
    ### Example:
  
        /**
          @template-show-busy-indicator
        *\/

  
  @directive @template-fluid
  @summary Determines whether the grid will be fluid and full-width or centered and scaled in discrete steps (Default: **false**)
  @desc

     ### Example:
     
         /**
           @template-fluid true
         *\/
    
  @directive @template-mho-style
  @summary Determines whether to apply Conductance ('mho') styles or use plain Twitter bootstrap styling (Default: **true**)
  @desc

     ### Example:
     
         /**
           @template-mho-style false
         *\/


  @function withBusyIndicator
  @param {Function} [block]
  @summary Show a busy indicator for the duration of `block` 
  @desc
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
  @summary Main content container DOM element

  @variable body
  @summary Document body DOM element

  @variable colors
  @summary Object with CSS color definitions
  @desc
    If the template uses plain bootstrap styling ([::@template-mho-style] set to `false`), 
    this will be an object with members:

      * `gray_darker`
      * `gray_dark`
      * `gray`
      * `gray_light`
      * `gray_lighter`
      * `primary`
      * `success`
      * `info`
      * `warning`
      * `danger`

    For 'mho' styling ([::@template-mho-style] set to `true`), it will additionally contain:

      * `onilabs_red`
      * `onilabs_redhighlight`
      * `bootstrap` (an object with the default bootstrap colors, e.g. `bootstrap.primary`)

  @function withAPI
  @param {Object} [api] api module
  @param {Function} [block]
  @summary alias for [surface/api-connection::withAPI]


  @function Notice
  @param {surface/HtmlFragment} [content]
  @param {optional Settings} [settings]
  @summary alias for [surface/bootstrap/notice::Notice]



  @require mho:surface/bootstrap/html
  @require mho:surface/bootstrap/notice
  @require mho:surface/api-connection
  @require mho:surface
  @require sjs:xbrowser/dom
  @require sjs:event
*/

var frag = require('../doc-fragment');
var { toBool } = require('sjs:docutil');

exports.Document = function(data, settings) {
  var showErrorDialog = settings.showErrorDialog .. toBool !== false;
  var showBusyIndicator = settings.showBusyIndicator .. toBool === true;
  var fluid = settings.fluid .. toBool === true;
  var useMhoStyle = settings.mhoStyle .. toBool !== false;

  var content = `<div class='${fluid?'container-fluid':'container'}'>${data.body}</div>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    ${frag.bootstrapCss()}
    ${useMhoStyle ? frag.conductanceCss()}
    ${showErrorDialog ? frag.errorHandler()}
    ${frag.busyIndicator(showBusyIndicator)}
    <script type='text/sjs' module='mho:app'>
      withBusyIndicator {
        ||

        waitfor {
          exports = module.exports = require([
                                    'mho:surface/bootstrap/html',
                                    { id:'mho:surface/api-connection',
                                      include: ['withAPI']
                                    },
                                    { id:'mho:surface/bootstrap/notice',
                                      include: ['Notice']
                                    }
                                  ]);
        } and {
          @ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:event']);
        }


        // ui helpers:
        exports.body = document.body;
        exports.colors = ${JSON.stringify(useMhoStyle ? frag.mhoColors : frag.bootstrapColors)};
        exports.mainContent = document.body.firstChild;
        exports.withBusyIndicator = withBusyIndicator;
      }
    </script>
    ${ data.head }
    ${ data.script }
  </head>
  <body>${content}
    ${frag.bootstrapJavascript()}
  </body>
</html>`;
}

