/* (c) 2013 Oni Labs, http://onilabs.com
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
@summary Server-side API modules
@desc
  The `.api` file format is used to provide clients transparent access
  to code running on the server.

@feature require-api
@summary Require an .api file from the client
@desc
  In client-side code, you connect to an `.api` module using the standard
  [sjs:#language/builtins::require] function.

  A properly configured conductance server (see below for details) will respond to
  a request for an `.api` file with an [::ApiStub] module.
  This stub module provides a `connect` method, which allows
  access to all exported symbols in the `.api` module.

  Note that functions in an `.api` module are *always* executed on the server.
  Calls made from clients make use of the [rpc/bridge::] to wrap
  api modules as locally callable, but the actual code execution happens on
  the server.
  
  ### Configuring .api files

  For conductance to serve your `.api` module in this way, the
  module must live within a directory configured as a
  [server/route::ExecutableDirectory] in your [./mho-file::] server configuration.

  It is important to only serve *trusted locations* with
  [server/route::ExecutableDirectory], as serving user-generated content in
  this way trivially allows users to execute arbitrary SJS code on your server.

@class ApiStub
@summary The result of a `require()` call on an `.api` module
@desc
  `require('./module.api')` will not return the API module directly, but will
  instead return an `ApiStub` object containing a single `connect` method.

  Since connections to remote servers can fail, this allows you to
  explicitly request a new connection, and it allows the `connect` method
  to retract the block passed to it if the connection fails.

@function ApiStub.connect
@param {optional Settings} [opts]
@param {Function} [block]
@setting {Function} [disconnectHandler] Custom disconnect handler
@setting {Boolean} [status] Maintain an observable `connection.status` property
@desc
  This function creates a connection to the given API module on the server.

  `block` will be called with two arguments:

   - the API object
   - the [rpc/bridge::BridgeConnection::] object

  The API object is a [rpc/bridge::API] object containing
  all of the methods and properties exposed by the `.api` module's `exports`.

  The connection will be held open for the duration of `block`s execution,
  and will be cleaned up after `block` ends (either normally or via an
  exception). If an unrecoverable connection error occurs, `block` will be retracted and
  a [rpc/bridge::TransportError] will be thrown from the call to `connect`.

  To provide users with feedback about intermittent connection errors (which
  will delay API calls), it is recommended to pass `true` for `opts.status`, and to
  use the connection's [rpc/bridge::BridgeConnection::status]
  property to display UI notification the user when the connection is
  temporarily unavailable.

  `opts.disconnectHandler` may be used to modify the automatic reconnect
  behaviour of the underlying connection. By default, it will be set to
  the default [rpc/bridge::AutoReconnect] handler. You can override this with:

   - a paramaterized version of [rpc/bridge::AutoReconnect]
   - `null`, to disable automatic reconnection attempts entirely
   - a custom function which implements the `disconnectHandler` interface
     described in the documentation for [rpc/bridge::connect]
*/
