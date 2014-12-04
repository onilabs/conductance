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

@ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:event', 'sjs:sequence', 'sjs:object']);
var {@warn} = require('sjs:logging');

/**
  @summary API connection utility
  @hostenv xbrowser

  @function withAPI
  @param {Object} [api] api module
  @param {optional Settings} [settings] settings passed to [rpc/bridge::connect]
  @setting {Function} [notice] Notice constructor (default: [surface/bootstrap/notice::Notice])
  @setting {Function} [disconnectMonitor] Notice constructor (default: [surface/bootstrap/notice::Notice])
  @param {Function} [block]
  @summary Connect and use an `.api` module
  @desc
    `withAPi` opens a connection to the given API, and invokes
    `block` with the API's exports.

    If the API connection is lost, `block` is retracted and
    a UI notification is displayed informing the user that
    the app is disconnected, and displaying the time until the next
    connection attempt. `withAPI` will keep attempting to reconnect
    with an exponential backoff capped at 10 minutes.

    **Note:** the notifications displayed by this utility make use of
    bootstrap styles. If your page us not using bootstrap styles, you
    may need to style these classes manually.
*/
exports.withAPI = function(api, opts, block) {
  if (arguments.length == 2) {
    block = opts;
    opts = {};
  }
  var initialDelay = 1000;
  var delay = initialDelay;
  var { @isTransportError, @connect } = require('../rpc/bridge');
  var { @Countdown } = require('./widget/countdown');
  var Notice = opts.notice;
  if (!Notice) ({Notice}) = require('./bootstrap/notice');

  while (1) {
    try {
      @connect(api, opts .. @merge({
        connectMonitor: function() {
          hold(300); // small delay before showing ui feedback
          document.body .. @appendContent(Notice('Connecting...', {'class':'alert-warning'}), -> hold());
        }
      })) {
        |connection|
        // we're connected; reset connection delay
        delay = initialDelay;
        block(connection.api);
      }
    } catch(e) {
      if (@isTransportError(e)) {
        @warn("Connection error: #{e}");
        hold(300); // small delay before showing ui feedback
        if (window.onerror && window.onerror.triggered) return;

        var disconnectBody = function(elem) {
          (elem || document.body) .. @appendContent(Notice(
            `Not connected. Reconnect in ${@Countdown(Math.floor(delay/1000))}s. ${@Element('a', "Try Now", {href:'#'})}`,
            {'class':'alert-warning'}))
          {|elem|
            waitfor {
              hold(delay);
              delay *= 1.5;
              if (delay > 60*1000*10) // cap at 10 minutes
                delay = 60*1000*10;
            } or {
              elem.querySelector('a') .. @wait('click', {handle:@preventDefault});
            }
          }
        };
        if (opts.disconnectMonitor)
          opts.disconnectMonitor(disconnectBody);
        else
          disconnectBody();

        continue;
      }
      else throw e;
    }
    break;
  }
}
