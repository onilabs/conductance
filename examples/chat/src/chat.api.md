#comment vim: syntax=markdown:
#ifdef STEP2
### File: chat.api

Import modules we need:

    var { remove } = require('sjs:array');
    var { each }   = require('sjs:sequence');
    var logging    = require('sjs:logging');


For persistence, we'll just store the list of recent messages
in a server-side variable. Since a module will be re-used
if it's imported again, this creates a persistent list
of messages for as long as the server process runs.

    var messages = [
      { user: 'tim',
        message: 'hello'
      }
    ];


Create a message receiver function which updates the above
`messages` variable. We'll keep at most the last 20 messages:

    var logMessage = function([m]) {
      while(messages.length > 20) messages.shift();
      messages.push(m);
    };

Receivers stores a list of functions which want
to be notified of new messages. Initially, it just contains
`logMessage`, which we defined above:

    var receivers = [logMessage];


The `join` function takes a `handle` callback,
which will receive an array of new messages as they arrive.
It also takes a `block` function - the handler
will only be installed for the duration of
the block - if it ends (or an exception is thrown
due to a connection error), the handler will be
removed from `receivers`.

    exports.join = function(handle, block) {
      logging.warn("join() start");
      receivers.push(handle);
      handle(messages);
      try {
      logging.warn("join() block start");
        block();
      logging.warn("join() block end");
      } finally {
        receivers .. remove(handle);
        logging.warn("join() end");
      }
    };


The `send` function just notifies all current listeners
of the new message.
Both client-side and server-side receviers are invoked the same way,
as a normal function call.

Messages are delivered to receivers in parallel, and errors are
caught so that a broken client can't prevent delivery to other
recipients.

    exports.send = function(user, val) {
      var msg = {
        user: user,
        message: val
      };
      logging.warn("Sending message to #{receivers.length} receivers");
      receivers .. each.par {|r|
        try {
          r([msg]);
        }
        catch(e) { /* ignore */ }
      }
    };
#endif // STEP2
