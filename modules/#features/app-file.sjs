/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
@type doc
@summary Client-side application files
@desc
  The `.app` file format is intended to form
  the main logic of a client-side application.

  `.app` files contain Stratified JavaScript code, but are served by Conductance as HTML documents. 
  The file's code will be executed on the client-side on document load.

  ### Wildcard _.gen files

  A file `_.app` is a **wildcard** application file: It will be
  invoked whenever a requested file in the directory of the `_.app`
  file or any subdirectory thereof is not found.


  ### Customizing how the `.app` file gets served

  Before serving the file, Conductance will scan any [sjs:#language/metadata::] comments 
  (those beginning with `/**`) for certain directives that allow you to control how exactly the app will be served.

  E.g. the [::@template] directive allows you to specify the template that is used to create the 
  app's initial HTML. 

  ### Templates

  Conductance comes with various built-in templates that can be found at 
  [surface/doc-template/::]. If no template is specified, `.app` files will use the 
  [surface/doc-template/app-default::] template.

  Metadata directives can also be used to set template-specific
  customization options. These are all prefixed with `@template-`, e.g.: `@template-title` ([surface/doc-template/app-default::@template-title]).

  ### 'mho:app' module

  Most document templates provide a module `mho:app` ([mho:app::]) with 
  application-specific functionality. The functionality provided by this 
  module varies from template to template; see the documentation for the 
  particular template for details on the symbols being made available.

  `mho:app` can be imported just like any other module,
  using [sjs:#language/builtins::require]. It can only be imported by
  client-side code, i.e. from the `*.app` file, and (transitively) from
  any modules loaded by the `*.app` file.

  The `mho:app` modules provided by Conductance's builtin templates
  have been carefully constructed so that there are no names that
  clash with `mho:std`. This enables you to use the common idiom of:

      @ = require(['mho:app', 'mho:std'])


  ### Code reuse

  `.app` files cannot be imported by other modules, so they are
  not an appropriate place for reusable code. Reusable code
  should typically be placed in separate `.sjs` modules (which you can load 
  into your `.app` file using [sjs:#language/builtins::require]).


@directive @template
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


@directive @no-bundle
@summary Don't bundle this module's dependencies 
@desc
  By default, `.sjs` modules used by an `.app` are loaded
  in a single file containing all required modules.
  If you include the `@no-bundle` directive, Conductance will serve up this 
  app's code as individual files, on-demand. 

  Bundling reduces the number of round-trips, but at the same time 
  reduces the opportunity for caching - e.g different bundles will
  duplicate all common modules, and a change
  in any file will cause the entire bundle to
  be re-downloaded.

  ### General notes on bundling

  The same limitations as mentioned in the documentation for the
  [sjs:bundle::] module apply:

  * Only modules that can be statically determined to *always* be used
    by the module will be included in the bundle. This generally only covers
    `require("moduleName")` statements at the top-level of the module
    (and any transitively `require`d modules). To include other modules in the 
    bundle you can use the [sjs:#language/metadata::@require] directive.

  Furthermore, bundling makes certain assumptions about co-location 
  of relative paths as mapped from server to client (in the server's [mho:#features/mho-file::]):

  * Relative module URLs such as `require('./some-directory/foo')` will be resolved 
    relative to the location of the `require`ing module file on the server. This means that 
    certain server configurations (such as mapping `some-directory` to a different server location)
    will be ineffective in the presence of automatic bundling: **The bundling algorithm will always 
    bundle the file found at the relative path on the server, even if this path is not exposed to the client 
    through the server's [mho:#features/mho-file::].** 

  * As a safety precaution, the bundling algorithm will 
    never include modules that are located at a higher place in the directory hierarchy than the module for 
    which bundling is performed. E.g. the module referenced by `require('../foo')` will be ignored and not
    included in the bundle.

  * Absolute module URLs that reference a hub (e.g. `require('sjs:sequence')` or `require('myhub:mymodule')`) 
    will resolve to locations on the server based on the *server's* [sjs:#language/builtins::require.hubs] 
    configuration. This means that if the client and server hub configurations differ, the client will be
    be served a module from a different location depending on whether automatic bundling is used or not. Also,
    **every hub configured on the server is exposed to the client through automatic bundling, whether or not
    that hub is exposed through the server's [mho:#features/mho-file::] or not.**

*/
