#comment vim: syntax=markdown:
#ifdef DOC
  #ifdef STEP1_ONLY

## Part 1: Simple User Interface

### File: index.app

#include res/require-system.html

Conductance is built on [StratifiedJS](TODO) (SJS), which adds a number of powerful features
on top of the JavaScript language, including a module system. When we require a module, the
require function loads that module asynchronously. But we don't need to use a callback to
receive its results, the SJS runtime lets us to call asynchronous code and simply wait
for their value as if they were synchronous.

Condunctance includes two builtin `hubs`, which are essentially short names for library URLs:

 - `sjs:` The StratifiedJS standard library
 - `mho:` Condunctance libraries

To start writing our app, we require the different modules we'll make use of. We use
<span class="info-link">destructuring assignment</span> to create local variables
for specific functions in the modules we load:

#include res/destructuring.html

  #elif defined STEP2_ONLY

## Part 2: Multiple users

Now that we have a basic UI, we'll add the server-side component
that allows multiple users to chat to each other.

### File: index.app

  #endif // STEP1_ONLY
#endif // DOC
#ifdef STEP1

    var { each }                             = require('sjs:sequence');
    var events                               = require('sjs:events');
    var { Observable, ObservableArray, Map } = require('mho:observable');
    var { appendWidget, Mechanism,
          Class, Style }                     = require('mho:surface');
    var { Bootstrap, Container, Submit }     = require('mho:surface/bootstrap');
    var { UnorderedList, Form, Label,
          FieldSet, Legend, TextInput,
          Div, H1 }                          = require('mho:surface/widgets');
#endif // STEP1

#ifdef STEP1_ONLY

CLEAR

Now that we have all the modules we need, let's start with a heading for the page.
The MODULE(mho:surface/widgets) module exports helper functions for creating HTML
tags, as well as some richer widgets. We'll just make a plain `H1`:

    var heading = H1("Conductance single-user chat demo");

<a name="fakeApi"></a>
So that we can quickly start showing some data, we'll make a "fake server" API
that just uses a local variable to store messages.
Later on, we'll replace this code with a real server API:

    // fake server API:
    var chat = (function() {
      var receiver;
      return {
        join: function(receiveMessage, block) {
          receiver = receiveMessage;
          this.send('amin', 'welcome to single-user chat!');
          try {
            block();
          } finally {
            receiver = null;
          }
        },
        send: function(user, val) {
          if (receiver) receiver([{ user: user, message: val }]);
        },
      };
    })();


#elif defined STEP2

To avoid confusion, update the `heading` variable to show off our multi-user abilities:

    var heading = H1("Conductance multi-user chat demo");

#include res/api-files.html

Now it's just a small matter of implementation.
In [part 1](../step1/#fakeApi), we made a `chat` variable which just pretended to send
and receive messages. Let's replace that with an actual server connection:

#define USES_CHAT_API

    var chat = require('chat.api').api;

Unlike the modules we `require()` at the top of the file, requiring an `.api` file
opens a bridge connection to the server. This allows us to use the
exported module as if it were local, but all exported functions are executed
on the server:


And here's the code for the server-side API module:

  #ifdef DOC
  #include "chat.api.md"
  #endif
#endif // STEP2

#ifdef STEP1

### UI:

### User name:

We'll store the user name in an SYMBOL(mho:observable,Observable) variable,
so that we can simply bind the variable to a HTML input element - whenever one changes, the other
will be updtated to match:

    var username = Observable('<anon>');

### Incoming messages:

#include res/lambda.html
#include res/backtick.html
#include res/doubledot.html

The display of incoming messages takes the messages
from the server and puts them in an observable list.

We transform each element of the observable list to add formatting,
and then pass the whole thing to an `UnorderedList`. Since the
contents of the list are observable, the UI will automatically update
when new messages are added to the array:

    var messages = ObservableArray();
    var renderMessage = {user, message} -> `<strong>${user}:</strong> ${message}`;
    var messageDisplay = UnorderedList(messages .. Map(renderMessage));

    var addMessages = function(newMessages) {
      // newMessages is an array,
      // add them all to the `messages` array
      console.log("Got messages", newMessages);
      newMessages .. each(m -> messages.push(m));
    }

### Sending messages:

#include res/mechanism.html

The chat input waits for the form to be submitted, and then
sends the message to the server. We attach a
<span class="info-link">Mechanism</span> to the form which
will handle form submission.

    // TODO: remove !important markers from inline styles.
    var chatInput = Form([
        Legend("Speak your mind:"),
        TextInput(username) .. Style("{width: 8em !important}"),
        " : ",
        TextInput(null, {name: "message", size: 25}) .. Style("{width: 20em !important}"),
        Submit('Speak!'),
      ])
      .. Class("form-inline")
      .. Mechanism(function(form) {
        var input = form.querySelector('input[name=message]');
        var button = form.querySelector('input[type=submit]');
        using (var submit = form .. events.HostEmitter('submit', null, e -> e.preventDefault())) {
          while(true) {
            // wait for the form to be sumitted
            submit.wait();
    
            /* During sending of the message we disable the `send` button.
             * We use a try / finally block to ensure the button
             * always ends up re-enabled:
             */

            var message = input.value;
            if(!message) continue; // don't send blank messages

            button.setAttribute('disabled', "true");
            try {
              chat.send(username.get(), message);
              
              // clear input on success if it hasn't been edited
              if(input.value == message) input.value = '';
              else console.log("input value [#{input.value}] -> [#{message}]"); // TODO: REMOVE
            } finally {
              button.removeAttribute('disabled');
            }
          }
        }
      });



Put all the components together. `Bootstrap` adds Twitter Bootstrap CSS styles to the
given content, which gives a reasonably attractive default look.

    var chatWindow = Bootstrap(
      Container(`
      $heading
      $messageDisplay
      <div>
        $chatInput
      </div>
  #ifndef DOC
      #comment | this is cheating - we don't include it in the documentation,
      #comment | only the generated code.
      <div><a href="./">&lt;- Back to tutorial</a></dov>
  #endif // DOC
    `));


#include res/block.html
#include res/hold.html

Finally, we join the chat room and add the UI to the current document. Note that the second
argument to `chat.join` is actually a function _block_. Since we never want to leave the room,
we don't want the block to finish - so we end it with a call to `hold()`.


    console.log(chat);
    chat.join(addMessages) { ||
      document.body .. appendWidget(chatWindow);
      hold();
    }
#endif // STEP1

