#ifdef STEP5

    @ = require('mho:stdlib');
    @html = require('mho:surface/html');
    
    var connectionStatusStyle = @Style("
      {
        position: fixed;
        bottom: 1.5em;
        left: 0;
        background: rgb(180, 70, 70);
        color: white;
        padding: 0.2em 1em;
        border-bottom-right-radius: 0.5em;
        border-top-right-radius: 0.5em;
      }
      a {
        color: #fbb;
        text-decoration: underline;
      }
    ");
    
    // Create a widget that counts down the seconds to a target date:
    var countdownTo = function(target) {
      var now = new Date();
      var secondsRemaining = Math.ceil((target.getTime() - now.getTime()) / 1000);
      var widget = secondsRemaining .. @Mechanism(function(elem) {
        while(secondsRemaining >= 0) {
          elem.innerText = secondsRemaining;
          hold(1000);
          secondsRemaining--;
        }
        elem.innerText = "0";
      });
      return widget;
    };
    
    
    exports.Indicator = function(connection) {
      // "reconnect now" button:
      var reconnect = @html.A("reconnect now", {href: "#"}) .. @Mechanism(function(elem) {
        elem .. @when('click', {transform: e -> e.preventDefault()}) {||
          connection.reconnect();
        }
      });
    
      // Disconnect notification with reconnect button & countdown
      var statusWidget = @Computed(connection.status(), function(status) {
        if (status.connected) return;
        var countdown;
        if (status.connecting) {
          countdown = "Reconnecting now ...";
        } else if (status.nextAttempt) {
          countdown = `Reconnecting in ${countdownTo(status.nextAttempt)} seconds ...`;
        }
    
        return @html.Div(`<strong>Disconnected</strong> ($reconnect). $countdown`) .. connectionStatusStyle();
      });
    
      return statusWidget;
    };

#endif
