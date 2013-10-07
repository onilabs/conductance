#comment vim: syntax=markdown ts=2 sts=2 sw=2:
#define TITLE_1 Part 1: Simple Display
#define TITLE_2 Part 2: Derived Values

#ifdef DOC
  #define TUTORIAL_FOOTER
#else
  #define TUTORIAL_FOOTER <a href="./">&laquo; Back to tutorial</a>
#endif // DOC

#ifdef STEP4
#define USES_API
#endif

## Part $STEPNO: $TITLE

#ifdef PREV_STEPNO
This tutorial continues on from the code
we wrote in [part $PREV_STEPNO: $PREV_STEP_TITLE](../step$PREV_STEPNO/).
#endif // PREV_STEPNO

#ifdef STEP1_ONLY

In this step, we'll be creating a simple, client-side application.
We'll assume you have installed conductance. To begin, create
a directory called `chat-demo/` and navigate to it
(it doesn't matter where you put this folder - on your Desktop is fine).

### File: chat.app

An `.app` file is condunctance's file extensions for client-only apps.
Conductance serves them with some HTML boilerplate that tells
the browser to run the contents of your `.app` file as code.

Let's start with a simple UI. Paste the following into a new file called `chat.app`:

#elif defined STEP2_ONLY

Splicing an array directly into HTML isn't very pretty - we don't even
get line breaks. But we still want the UI to update when the `messages`
variable changes, so we'll create a derived value to display using $SYMBOL(mho:observable,Map).
Update `chat.app` as shown:

#include res/lambda.html

#elif defined STEP3_ONLY

There hasn't been much chatting going on so far. Let's add an input box so
you can add your own messages. While we're at it, let's make it a bit less of
an eyesore by applying a default [Bootstrap]() theme to our UI:

#include res/mechanism.html

#include res/block.html

#elif defined STEP4_ONLY

It's time to invite the rest of the world in. Rather than an array in your browser,
we need to store messages on the server, so that multiple clients can chat to each
other. On the client side, this is pretty straightforward:

#elif defined STEP5_ONLY

If your network dropped out (or the server stopped) when running the previous example,
you wouldn't have a very good experience. Conductance automatically tries to reconnect
after a brief network outage or error, but this isn't always possible, at which point
you'll just get error messages.

Of course, showing your users stacktraces is rarely a user-friendly thing to be doing.
Let's add some logic for dealing with errors, as well as some UI
for notifying the user when the network connection drops out.

#endif // STEP1_ONLY || STEP2_ONLY
<!-- file: chat.app -->

    @ = require.merge('mho:stdlib');
#ifdef STEP3
    $hl_3
    var { @Bootstrap, @Container } = require('mho:surface/bootstrap');
    @html = require('mho:surface/html');
    $hl_off
#endif // STEP3

#ifndef STEP4
    var messages = @ObservableArray();
#else // step4 and beyond
    $hl_4
    var api = require('./chat.api');
#ifdef STEP4_ONLY
    var messages = api.getMessages();
#endif
    $hl_off
#endif
    

#ifdef STEP5
    @bridge = require('mho:rpc/bridge');

    // configure the api connection to reconnect indefinitely
    var api = require('./chat.api');
    var connection = api.__connection;
    connection.handleDisconnect(@bridge.AutoReconnect({ timeout: null }));
    @connectionStatus = require('./connection-status');

    // Make chatContent a function which takes the messages object,
    // in case we get reconnected with a different server session
    var chatContent = function(messages) {
      var input = @html.Input(null, {type: "text"}) .. @Mechanism(function(elem) {
        elem.focus();
        elem .. @when('keydown') { |ev|
          if (ev.keyCode !== 13) continue;
          messages.push(elem.value);
          elem.value = '';
        }
      });

      return `
        <h1>Oni Labs Chat Demo</h1>
        <ul>
          ${messages .. @Map(msg -> `<li>$msg</li>`)}
        </ul>
        <hr>
        <div>Say something: $input</div>$TUTORIAL_FOOTER`;
    }

    // create a bootstrap container:
    var container = document.body .. @appendWidget(@html.Div() .. @Container() .. @Bootstrap());

    // add a persistent connection status indicator:
    container .. @appendWidget(@connectionStatus.Indicator(connection));

    while(true) {
      // we run the following code branches in parallel. The first
      // just listens for uncaught errors on `window`, the other
      // displays the chat UI.

      var errorMessage;
      waitfor {
        var error = window .. @wait('error', null, e -> e.preventDefault());
        errorMessage = error.message.split('\n')[0]; // show only first line
        // console.error("WINDOW error triggered:", error.message);
      } or {
        container .. @withWidget(chatContent(api.getMessages()), -> hold());
      } catch(e) {
        console.log("Exception caught: #{e}");
        errorMessage = e.message;
      }

      // The above branches only end in the case of an uncaught error.
      // When the above code is aborted, the `withWidget` code is interrupted
      // and the chat UI is automatically removed.

      container .. @withWidget(`
        <h1>Oops!</h1>
        <p>An error has occurred: ${errorMessage}. <a href="#">Click to retry</a></p>`) {
        |elem|
        elem.querySelector('a') .. @wait('click');
      }
    }

#else // !STEP5

#ifdef STEP2
    $hl_2
    var messageView = messages .. @Map(msg -> `<li>$msg</li>`);
    $hl_off

#endif
#ifdef STEP3
    $hl_3
    var input = @html.Input(null, {type: "text"}) .. @Mechanism(function(elem) {
      elem.focus();
      elem .. @when('keydown') { |ev|
        if (ev.keyCode !== 13) continue;
        messages.push(elem.value);
        elem.value = '';
      }
    });
    $hl_off

#endif
    document.body .. @appendContent(`
      <h1>Oni Labs Chat Demo</h1>
#ifdef STEP1_ONLY
      $messages
#elif defined STEP2
    $hl_2
      <ul>
        $messageView
      </ul>
    $hl_off
#endif
#ifdef STEP3
    $hl_3
      <hr>
      <div>Say something: $input</div>$TUTORIAL_FOOTER`
      .. @Container()
      .. @Bootstrap()
    );
    $hl_off
#else // !step3
    $TUTORIAL_FOOTER`);
#endif // STEP3
    
#if !defined USES_API
    messages.push('hey');
    hold(1000);
    messages.push('how are you?');
#endif // !USES_API
#endif //!STEP5

#ifdef STEP1_ONLY

To serve this .app file, open a terminal and navigate to the `chat-demo/` directory you created.
From this directory, run:

#comment NOTE: we use github-style ``` blocks to prevent 
#comment non-SJS code blocks appearing in source code

```sh
$ conductance run
```

This will serve the current directory using the default configuration. You should
now be able to navigate to [http://localhost:7075/]() to run your app. If it doesn't
seem to be working, open your browser's javascript console to check for errors.

You can also [run this example online](./chat.app).

#ifdef DOC
### What happened?

<!-- file: -->

Let's go over the code we wrote, and explain what's new to conductance that you may not
have seen before:

#include res/require-system.html

Conductance is built on [StratifiedJS](TODO) (SJS), which adds a number of powerful features
on top of the JavaScript language, including a module system. We'll import the `stdlib` module
from Conductance, which is a catch-all module combining a number of frequently used modules.

    @ = require('mho:stdlib');

`require()` loads a module asynchronously, but the SJS runtime allows us to simply wait
for the result of this operation rather than passing a callbck.

We assign the imported `stdlib` module to `@`, which is
known as the "alternative namespace". This variable
is predefined in the scope of every module, and is (by convention) where you place all imported
modules / functions. It provides a convenient way to keep local symbols distinct from
imported symbols, and allows shorthand access - `@property` is equivalent to `@.property`.

Next, we create an $SYMBOL(mho:observable,ObservableArray) which we'll use to store chat messages.

#include res/quasi.html

    var messages = @ObservableArray();

Now, add some content to the current document body:

    document.body .. @appendContent(`
      <h1>Oni Labs Chat Demo</h1>
       $messages
    `);

Although the above code looks like string interpolation in other
languages, quais-quotes (surrounded by backticks) don't collapse everything into a string representation - they
preserve the original values. This allows the receiver (`appendContent` in
this case) to treat embedded values intelligently, such as escaping any special HTML
characters.

$CLEAR

#include res/doubledot.html

Also note that we used the double-dot (`..`) operator to call `appendContent`. We could
have written this more plainly as <code>@appendContent(document.body, \` ... \`)</code>,
but often the double-dot version is more readable, especially when chaining multiple calls.

    messages.push('hey');
    hold(1000);
    messages.push('how are you?');

More than just escaping values, `appendContent` has automatically added a mechanism to keep
the displayed value of `messages` updated whenever the underlying variable changes,
which it does for any $SYMBOL(mho:observable,Observable) object. So we can add messages to
the display by modifying the `messages` array.

We also use the global `hold` function, which suspends an expression for (in this case) 1000 milliseconds.
`"how are you?"` is added one second after the first message, without having to resort
to callbacks.

#endif // DOC

#elif defined STEP2_ONLY

Now, the messages display as `<ul>` list items - but because `messageView` is still an
$SYMBOL(mho:observable,Observable), the UI updates when we add a new message. And
since each element of `messageView` is a quasi-quote, it is merged into the display
as HTML (if it were a plain string, it would instead be escaped).

#elif defined STEP4_ONLY

That was easy, because `getMessages()` will return us an observable array, just like before.
Only this time, the object is stored on the server - we just get a proxy to it.
This means that when the server modifies this array, the UI on _every_
connected client will be updated.

We also took out the calls to `messages.push()` at the bottom of the file, since
we don't want to spam the server with messages every time we load the page.

Of course, this won't do much without implementing the server-side module that it uses.

#ifdef DOC
#include chat.api.md
#endif // DOC

#endif // STEPn_ONLY

### Run it

#ifndef USES_API
Refresh your browser after modifying `chat.app`, or [run this version online](./chat.app).
#else
Refresh your browser after restarting conductance, or [run this version online](./chat.app).
#endif

#if defined STEP3_ONLY

Here we've created a simple `<input>` element (the $MODULE(mho:surface/widget) module
provides constructors for HTML tags), and attached a
$SYMBOL(mho:surface/html,Mechanism) to it.

Inside the mechanism, we loop over each `keydown` event using the $SYMBOL(sjs:events,when)
function. This treats event emissions as an (infinite) sequence, and runs the
provided blocklambda for each event. Inside the blocklambda we use the
`continue` statement to skip an event, just like you would in a `while` or `for` loop.

#elif defined STEP4_ONLY

Now that the messages are stored on the server, you can open multiple browser windows / tabs
of the same page - messages sent to the server will appear in every tab.

Of course, adding server-side communication means that a connection error can now
cause an error in any function that is implemented on the server, at any time. We'll
show you how to deal with this in the next step.

#endif // STEPn_ONLY

#ifdef NEXT_STEPNO
### Onwards:
Part $NEXT_STEPNO: [$NEXT_STEP_TITLE](../step$NEXT_STEPNO/)
#endif // NEXT_STEPNO

