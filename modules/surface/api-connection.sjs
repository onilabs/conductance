@ = require(['mho:surface', 'sjs:xbrowser/dom', 'sjs:event']);

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
        hold(300); // small delay before showing ui feedback

        document.body .. @appendContent(@Notice(
          `Not connected. Reconnect in ${@Countdown(Math.floor(delay/1000))}s. ${@Widget('a', "Try Now", {href:'#'})}`,
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
