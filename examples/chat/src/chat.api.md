#comment vim: syntax=markdown:
#ifdef STEP4
### File: chat.api
<!-- file: chat.api -->

#ifdef STEP4_ONLY
#include res/api-files.html

Conductance uses the `.api` extension for modules that will only be run on the server.
By storing messages in a single location server-side, each client will see
the same array of messages.

#endif // STEPn_ONLY

    @ = require('mho:stdlib');

    var messages = @ObservableArray([
      "Welcome to multi-user chat!"
    ]);

    exports.getMessages = -> messages;

#ifdef STEP4_ONLY

This shows how easy it is to set up bidirectional communication in conductance.
We've moved the $SYMBOL(mho:observabe,ObservableArray) onto the server, but the client
doesn't have to care - all the object's methods methods work as expected, they're just
a little slower now because they are happening over the network.

#endif // STEPn_ONLY
#endif // STEP4
