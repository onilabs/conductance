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
@summary Documentation for the .mho file format
@desc
  The `.mho` file format is used to configure the conductance
  web server.

  When you run `conductance serve` with no arguments, `config.mho` is
  loaded from the current directory if it exists. Otherwise, the default
  server configuration included in conductance (`default_config.mho`) is used.

  To run the server with a file other than `./config.mho`, pass it
  as the first option to `conductance serve`.

@function exports.serve
@summary The function run by `conductance serve`
@param {Array} [args] Additional command-line arguments passed to `conductance serve`
@desc
  When you run `conductance serve`, it will call this function with any
  additional command line arguments in `args`. If your server accepts
  arguments, you would typically use the [sjs:dashdash::] module to
  process them.

  If your server does *not* accept arguments, you should fail when `args`
  is not empty.

  Typically, your `serve` function will call [server::run],
  which runs a conductance HTTP server until it is cancelled.
*/
