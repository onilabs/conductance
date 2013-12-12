# LGPL compatibility notes

In the open source distribution of Conductance, all Conductance
modules that can run in a browser are licensed under the LGPL.

It is a condition of the LGPL that users must be able to use
your application with a custom version of the library in question
(i.e. Conductance), and that you provide such instructions
to users of your application.

The following are typical instructions that you can give
users who wish to use their own version of Conductance
with your application:

----

1. Install (or access) a version of Conductance which you wish to use
   instead of the application's version.
   For further instructions, see [http://conductance.io]().

2. Append the following line to the `stratified.js` file included with
   Conductance:

        window.addEventListener("load", function() { __oni_rt.sys.require.hubs.unshift(['mho:','http://localhost:7075/__mho/']); }, true);
   
   (Adjust "localhost:7075" as appropriate to point to your server).

3. Install a browser plugin which can redirect individual resources.
   For example, [Switcheroo Redirector][0] for Chrome.

4. Configure the browser plugin to redirect requests for `stratified.js`
   on the original site (e.g "http://<some-application.com>/__sjs/stratified.js")
   to you custom version, e.g: "http://localhost:7075/__sjs/stratified.js"

5. Run conductance on the server you control (`localhost` in this example),
   ensuring you enable CORS requests (typically, `conductance serve --cors`).

6. Reload the application, and it will use your custom version of Conductance.

[0]: https://chrome.google.com/webstore/detail/switcheroo-redirector/cnmciclhnghalnpfhhleggldniplelbg

----

If you use nonstandard URLs for the location of Conductance libraries, you may
need to adjust these instructions accordingly. You should also substitute
<some-application.com> in the above description for your site's actual address.

These instructions will work for unmodified installations of Conductance, but
you should update them accordingly if you are using Conductance in a way that
makes these instructions insufficient.

If your application uses a modified version of any Conductance LGPL code, you
must also provide the user with instructions on how to obtain and use this
modified code.
