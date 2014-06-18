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
  @summary Client side app utilities
  @hostenv xbrowser
  @desc
    This module contains client-side application-specific functionality. 
    For applications that have an `*.app` file (see [mho:#features/app-module::]) as their
    main entry point, it will be provided by the *document template*. If you use a custom
    document template, or a custom (not `*.app`) client-side entry point, then this module 
    will not be available by default.
 
    Depending on the particular document template used, the `mho:app` module will have 
    different functionality. For details of the symbols available, see the documentation of 
    the particular template. E.g. the default template for `.app` modules is `app-default` ([surface/doc-template/app-default::]). The default template for documents created with [surface::Document] is
    `default`, which _does not_ provide an `mho:app` module.

    The `mho:app` modules provided by Conductance's builtin templates
    have been carefully constructed so that there are no names that
    clash with `mho:std`. This enables you to use the common idiom of:

        @ = require(['mho:app', 'mho:std'])
*/
