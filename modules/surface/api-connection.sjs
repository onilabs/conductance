@ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:event']);
var {@warn} = require('sjs:logging');

/**
  @summary API connection utility

  @function withAPI
  @param {Object} [api] api module
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
exports.withAPI = function(api, block) {
  var initialDelay = 1000;
  var delay = initialDelay;
  var { @isTransportError, @connect } = require('../rpc/bridge');
  var { @Notice } = require('./bootstrap/notice');
  var { @Countdown } = require('./widget/countdown');

  while (1) {
    try {
      @connect(api, {
        connectionMonitor: function() {
          hold(300); // small delay before showing ui feedback
          document.body .. @appendContent(@Notice('Connecting...', {'class':'alert-warning'}), -> hold());
        }
      }) {
        |connection|
        // we're connected; reset connection delay
        delay = initialDelay;
        block(connection.api);
      }
    } catch(e) {
      if (@isTransportError(e)) {
        @warn("Connection error: #{e}");
        hold(300); // small delay before showing ui feedback

        document.body .. @appendContent(@Notice(
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
        continue;
      }
      else throw e;
    }
    break;
  }
}
