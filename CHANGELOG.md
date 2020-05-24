This changelog lists the most prominent, developer-visible changes in each release, starting with release 0.7.5:

## Version 0.9.1:

 * General

   * nodejs/container OS dependency is updated to node:13.12.0-buster-slim


 * New functionality

   * Added new method sjs:cutil::Semaphore::countWaiting.	

   * The SJS language has a new `waitfor/while` syntax construct for asymmetric concurrency 
     composition, where the 'while'-branch "controls" the lifetime of the 'waitfor'-branch. 
     See the documentation under `#language/syntax::waitfor-while` for details.

   * `mho:rpc/bridge`: Added a new websocket-based transport 
     (rpc/wst-client.sjs & rpc/wst-server.sjs) which is now used by default by the 
     conductance bridge. It is a drop-in replacement for the old asymmetric AJAX transport
     (rpc/aat-client.sjs & rpc/aat-server.sjs). The main behavioral difference of the new 
     transport is that it implements a more intelligent keepalive mechanism which notices 
     certain disconnection scenarios (e.g. internet down) much quicker than the old transport.

   * Added `mho:websocket::WebSocketServer` for running websocket servers.

   * `mho:websocket::withWebSocketClient` (formerly in module `mho:websocket-client`) now 
     accepts various settings besides just the target uri. The session interface has also been
     expanded with functions/streams for sending/listening to pings (nodejs hostenv only).

   * Added `mho:websocket::isWebSocketError` for identifying connection errors thrown
     by websockets.

   * `sjs:nodejs/http::withServer`: new 'upgradable' flag to switch on special-casing of 
     requests with 'Upgrade' headers. `sjs:nodejs/http::ServerRequest` has new fields to
     accomodate this case.

   * `mho:server::Route` accepts a new 'UPGRADE' handler for handling requests with 'Upgrade' 
     handler. This functionality is enabled when the `mho:server::Port` containing the 
     route is configured to special-case these types of requests, which by default it is.

   * Added a new function `sjs:cutil::withBackgroundStrata` for executing strata within the 
     bounds of a session.

   * Introduced the concept of 'functions-as-services'. 
     See documentation under `sjs:service::Service`.

   * Added a new function `sjs:service::withBackgroundServices` for running services in the 
     background. 

   * Added a new function `sjs:service::runGlobalBackgroundService` for running a background 
     service with unbounded lifetime.

   * Added a new function `sjs:service::withControlledService` for wrapping a service with
     start/stop control functionality. Added associated function 
     `sjs:service::isServiceUnavailableError`.


 * Bug fixes / Behavioral changes:

   * Various unused (or very rarely used) modules and functions have been removed:
     - `sjs:function::chain`
     - `sjs:function::deferred`
     - `sjs:function::trycatch`
     - `sjs:crypto/store`
     - `sjs:pool` (largely subsumed into `sjs:service`)
     - `sjs:object::tap`
     - `sjs:services::Registry` (largely subsumed into `mho:env`)

   * Various rarely used functions have been moved into a new `sjs:legacy` module:
     - `sjs:function::par` is now `sjs:legacy::fn.par`
     - `sjs:function::tryfinally` is now `sjs:legacy::fn.tryfinally`
     - `sjs:sequence::partition` is now `sjs:legacy::partition`

   * `sjs:sequence::each.par` has been rewritten for more predictable
     behavior when fed with a non-blocking stream: The previous 
     recursive implementation would yield control back (with a `hold(0)`) after every 10th 
     input stream item. I.e. iteration of the input stream would block at every 10th iteration.
     The new implementation fixes this pathologic behavior. Now non-blocking
     input streams will be consumed in a temporally contiguous manner (up to any potential 
     concurrency limit set on the each.par call).
     Code that depends on the pathological behavior might break with the new implementation.
     E.g. `@integers() .. @each.par { |x| hold(0); if(x===10) break; }` will now start 
     parallel strata without yielding control until all memory is exhausted. This is the
     expected behavior (for more discussion see the documentation for `each.par`).
	
   * `sjs:cutil::waitforAll` and `sjs:cutil::waitforFirst` have been deprecated. 
     `sjs:sequence::each.par` can be used instead.

   * Cyclic `Stratum::abort` calls can now be resolved across strata. Also, abort cycles are
     now resolved within the same stratum processing slice. Previously other strata might
     have gotten a chance to run before an abort cycle was resolved. 
     See 'synchronous reentrant stratum abort' in the sjs-2-tests testsuite.
 
   * An edgecase has been fixed whereby certain synchronous reentrant aborts in waitfor-and or
     waitfor-or clauses would not correctly abort hold(...) calls. See 'reentrant quench' in
     the sjs-3-test testsuite.

   * `sjs:bytes::isBuffer` is now exported by `sjs:bytes` on platforms other than 'nodejs', too.
     It will always return `false` on those platforms.

   * A regression which broke most of the `mho:flux/kv` module functionality on the client-side 
     has been fixed (missing import).

   * `mho:surface::ContentGenerator`: Content appended during execution of the generator will now
     be removed from the DOM when the ContentGenerator is removed from the DOM.

   * `mho:surface::ensureElement` now applies "display:contents;" styling to its
     <surface-ui> element wrapper. For modern browsers, this should make wrapped content 
     better behaved (e.g. display styling of wrapped content will feed through better).
     
   * Fixed reporting of certain errors thrown by JS code that would previously log as 
     'illegal invocations' (a regression probably introduced in 0.8.0).
     
   * The `mho:websocket-client` module has been moved to `mho:websocket`.

   * `mho:rpc/bridge`: Propagation of blocklambda breaks/returns and exceptions from
     aborted finally clauses has been fixed. (See `test/integration/bridge-tests.sjs:abort-finally`)

   * `sjs` and `conductance shell` REPLs: `require` calls now correctly resolve nodejs modules
     to the directory that the shell was started in, rather than to the sjs/conductance home
     directories.

   * In stack traces, module names are now rendered without the 'module' prefix (e.g. 
     'Error at file://foo' instead of 'Error at module file://foo'). This is to prevent the
     URL shortener built into the chrome browser console from getting confused when loggin
     errors.

   * `mho:surface/widgets::overlay` (and by extension `mho:surface/widgets::dialog`) will now 
     move the document focus to the backdrop, constrain it to stay within child content of the
     backdrop, and attempt to restore the previous focus upon exit.


## Version 0.9.0:

 This version introduces some big architectural changes to SJS's 
 sequence/stream/observable functionality.

 Some breaking changes to watch out for:

   * `sjs:sequence::BatchedStream` and `sjs:sequence::isBatchedStream` have
     been removed. You can use the alternatives 
     `@StructuredStream('batched') :: SEQ` and 
     `@isStructuredStream('batched') :: SEQ`. 
     Alternatively, if you are currently using `@BatchedStream` in conjunction 
     with `@pack` to generate a batched stream, switch to 
     `sjs:sequence::batch`.

   * The `sjs:structured-observable` module has been removed. 
     In many cases `sjs:observable:ObservableWindowVar` can be used as a 
     replacement for the removed `ObservableArrayVar`. A full replacement is 
     planned for a future release.

   * The `sjs:projection` module (functions `sjs:projection::projectInner`,
     `sjs:projection::project` and `sjs:projection::dereference`) has been removed.
     Use the following alternatives, amending with `@toArray` or `@dedupe` as 
     appropriate:
     - `dereference`: `@transform(p->obj[p])`
     - `project`: `@transform`
     - `projectInner`: `@transform$map` if inner values are arrays, nested `@transform` 
        otherwise.

   * The introduction of structured streams means that not all streams can be 
     iterated by treating them as functions.
     E.g. `my_stream(console.log)` will not work if `my_stream` is a 
     structured stream. You need to use `my_stream .. @each(console.log)`.

   * SJS doesn't type-tag Observables any longer; they are now just Streams. The
     Observable typing functions (Observable, isObservable) have been removed. In most
     cases, code can be changed to just accept streams instead of observables (i.e.
     change any `@Observable` calls to `@Stream` and any `@isObservable` calls to
     `@isStream`). Where code relies on distinguishing streams 
     from observables, the logic can usually be changed to distinguish between 
     material sequences (i.e. array-like sequences) and observables instead.

   * `sjs:observable::eventStreamToObservable` has been renamed to 
     `sjs:observable::updatesToObservable`.

   * Because of the removal of Observable type-tagging, calling (the now deprecated)
     `project` or `projectInner` on an Observable will not automatically call
     `dedupe` on the resultant.


 * General

   * Various performance improvements
   * leveldb dependency is updated to version 5.4.1.
   * nodejs dependency is updated to version 10.18.0.
   * container OS dependency is updated from Debian Stretch to Debian Buster.
   * The docker image is now based on node:10.18.0-buster-slim, making it around 700MB
     smaller (~250MB vs ~950MB).


 * New functionality

   * Added new function `sjs:sequence::takeUntil`.

   * New 'structured stream' functionality has been added to the `sjs:sequence` 
     library. Structured streams are streams where the individual elements are
     encoded in some way to make their transmission and/or processing more 
     efficient. They operate (mostly) invisible to the user in the background.
     For more details see the documentation for `sjs:sequence::StructuredStream`.
     As part of this new functionality, the following primitives have been added:
     * `sjs:sequence::StructuredStream`
     * `sjs:sequence::isStructuredStream`
     * `sjs:sequence::batch`
     * `sjs:sequence::rollingWindow`
     * `sjs:sequence::transform$map`
     * `sjs:sequence::monitor.raw`
     * `sjs:observable::sample`
     * `sjs:observable::ObservableWindowVar`
     * `sjs:observable::isObservableWindowVar`

   * Added a function `sjs:sequence::withOpenStream` which allows successive partial
     iterations of a stream without iterating manually using `sjs:sequence::consume`.

   * Added a function `sjs:sequence::monitor.start` which executes a function once
     every time before a sequence is being iterated.

   * The concept of 'material sequences' (= sequences that are not streams) has 
     been introduced. Documented under `sjs:sequence::MaterialSequence`.

   * SJS now has support for rest parameter syntax (`...args`), with the limitation that 
     rest parameters cannot (yet) appear in destructuring patterns.
     Also, spread syntax is only supported within `__js` blocks. Full rest/spread support 
     is scheduled for a future release.

   * `mho:surface/widgets::doDropdown` now exposes hooks for CSS customizations.

   * `require.hubs`: The hubs resolution process now also works with
     regular expressions instead of just prefix matches. For details see the documentation for
     `sjs:#language/builtins::require.hubs`.


 * Bug fixes / Behavioral changes:

   * Compatibility and performance of traditional (`new Foo()`-style) constructors have 
     been improved. Previously the VM had some fragile logic that caused run-time errors with
     some constructors from certain external JS libraries.

   * `sjs:url::parse`: A bug has been fixed that would parse URLs with '@' characters in an 
     incorrect way (interpreting too much of the URL as the 'authority' part).
     A ripple effect of this bug was that conductance would not properly serve URLs such as
     'localhost:8000/__node_modules/@mylib/foo'.

   * `mho:server/route::SystemRoutes` will now be served with an 'X-Robots-Tag:noindex' header
     to prevent search engines from indexing anything under the conductance system routes 
     (/__sjs/, /__mho/, /__aat_bridge/, /__keyhole/ and /__oauthcallback/).

   * `mho:surface::Prop` and observable-based `mho:surface::Attrib` now execute
     at a higher priority 'MECH_PRIORITY_PROP' to ensure that DOM properties
     and attributes can be referenced from enclosing 'normal'-level Mechanisms.

   * `sjs:string::padRight` and `sjs:string::padLeft` are now deprecated - use builtin
     alternatives `String.padEnd` and `String.padRight`.

   * Deprecated `node::Buffer` constructor usage has been replaced with appropriate
     alternatives (Buffer.from/Buffer.alloc) throughout.

   * `sjs:observable::eventStreamToObservable` has been renamed to 
     `sjs:observable::updatesToObservable` to better indicate the 
     intended use case.

   * Observable streams are not type tagged as 'Observables' any longer; they are now just
     Streams. Library functions that would previously accept only observables as arguments 
     (e.g. CompoundObservable) now accept any Streams - it is the responsibiliy of the user
     to ensure that those streams have Observable-compatible semantics.

   * The `sjs:structured-observable` module with all of its functions 
     (`isObservableArray`, `isStructuredObservable`, `reconstitute`, `ObservableArray`,
      `ObservableArrayVar`, and `StructuredObservable`) has been removed. 
      Structured stream functionality is now built into sequences directly and there is
      an `ObservableWindowVar` function in the `sjs:observable` module that caters for 
      some use cases of `ObservableArrayVar`.
      In future, a new version of `ObservableArrayVar` is planned (and it will live in the 
      `sjs:observable` module).

   * `sjs:sequence::transform` and `sjs:sequence::filter` will now keep any batched stream structure.

   * The `sjs:projection` module (functions `sjs:projection::projectInner`,
     `sjs:projection::project` and `sjs:projection::dereference`) has been removed.

   * `sjs:sequence::map` is back to being un-deprecated. It is the right primitive
     to use when you want to create an array by transforming a sequence.

   * `sjs:sequence::BatchedStream` and `sjs:sequence::isBatchedStream` have been removed. 

   * `sjs:cutil::Queue`: For queues of capacity 0, the sync flag will now be ignored and
     implicitly set to `true`. This is to prevent an undesirable situation where such a 
     queue would behave like a stateful queue with capacity 1 under some circumstances.
     For more details, see the documentation for `sjs:cutil:Queue`.
	
   * The iteration interface `sjs:sequence::ITF_EACH` has been removed, as this was only
     used in the (also removed) sjs collection utility library.

   * The sjs collection utilities library has been removed, as it duplicated 
     functionality found elsewhere and didn't align well with ideomatic SJS usage.

   * `mho:surface/navigation::navigate`: Normalize URL on navigation to prevent trailing
     slashes in address bar.

   * `mho:rpc/bridge`: An edge case has been fixed where the bridge would shut down when 
      attempting to send a function return value across a closed connection. 

   * `mho:flux/kv`: Key type-checking and error reporting has been improved.

   * The SJS VM now patches the global console's output functions 
     (log, info, warn, error) to better support exception reporting.
     Recent versions of chrome and nodejs log an exception's `stack` 
     property instead of the exception itself. As this property is 
     empty for SJS exceptions, only 'Error' (or even just an empty 
     string!) would be shown on these platforms.

   * Exceptions originating from *.js files and caught in SJS code will now include
     stack frames from the *.js file in all host environments. 
     Previously the JS stack frames were included only in the 'nodejs' host environment
     but not the 'xbrowser' host environment.
     Note that JS stack frames will only be included for exceptions *thrown* from *.js 
     files, not exceptions thrown from code within `__js{}` code, or exceptions that 
     pass through js functions. 
     This new functionality works for *.js files loaded either via SJS's `require` 
     function (i.e. something like: `require('./mylib.js')`) or by being included
     in the HTML code (e.g. via `sjs:xbrowser/dom::script`).

   * `mho:surface/widgets::dialog`: The height of the 'small' and 'large' layouts are now 
     constrained to the page height (plus an appropriate margin). Overflowing content will
     be hidden. Use 'height:100%;overflow:scroll' on content as appropriate.

   * `mho:flux/kv::withTransaction`: Leakage of global symbol 'conflict' has been fixed.

   * `mho:flux/kv::withTransaction`: The internal logic has been rearranged to fix a pathological
     edge case where synchronous modifications to an underlying in-memory db initiated from within a 
     transaction would not correctly trigger the transaction to be rerun. 

   * A race condition in the https service has been fixed. Previously conductance would sometimes not 
     update its https certificates immediately when first obtained from letsencrypt, and instead continue
     to use the initial dummy localhost certificates.

   * The obsolete `mho:systemd` module has been removed.

   * The obsolete datadog integration (conductance/tools/monitoring) has been removed.


## Version 0.8.1:

 * General:

   * Some performance improvements in `mho:surface` code.


 * New functionality:

   * `sjs:sequence::reduce1`: Added optional function argument that will be applied to 
     the first sequence element to compute the initial accumulator value.


 * Bug fixes / Behavioral changes:

   * An incorrect reference in the conductance bridge code has been fixed. This would lead
     to an error "ReferenceError: isTransportError is not defined" under certain disconnect
     scenarios.

   * `mho:surface/bootstrap::doModal`: Modal content is now appended in a nested manner.
     This fixes blocklambda controlflow (like `{|| return}`) from Mechanisms, click-handlers, 
     etc in the appended content.

	
## Version 0.8.0:

 * General:

   * The ssh2 dependency has been updated from 0.5.5 to 0.8.4, which should fix some
     protocol negotiation issues encountered in conjunction with node v10.15.3-stretch.


 * New functionality:

   * A new module `mho:surface/binding` has been added with constructs for naming and 
     retrieving nodes (or values derived thereof) in DOM trees.

   * New functions `sjs:array::kCombinations` and `sjs:array::permutations` have 
     been added.

   * `stratum.abort()` now takes an optional `omit_retract` flag which, when `true`,
     will cause `retract` clauses to NOT be executed.
	
   * A new experimental `_adopt` method has been added to the 'Stratum' interface. 
     It is used for advanced controlflow manipulation to allow blocklamda returns from 
     within a spawned stratum to find their target via a different return path. 
     As this is an experimental feature, and will probably be exposed in a different way
     in future versions of SJS, it is undocumented at the moment. (In the SJS source code see
     test/unit/sjs-3-tests:'return via different scope with _adopt').


 * Bug fixes / Behavioral changes:

   * `sjs:nodejs/stream::contents` and related: Work around a nodejs bug that causes
     the process to stall when reading from stdin.

   * `child-process::run`: Fix error handling for changes introduced in node v10 which
     caused child-process::run to throw cryptic errors when trying to run 
     non-executables.

   * removed obsolete (and broken) symbol `surface/bootstrap/html::Submit`.

   * `surface/cmd::stream` now properly untangles its arguments if called with a 
     single array of DOM nodes (previously these would have been interpreted as an
     array of commands).

   * `sequence::batchN` is now deprecated. `@pack(n) .. @BatchedStream` offers the same
     functionality.

   * Calling `abort` on a spawned stratum used to fail to propagate exceptions synchronously 
     thrown in `finally` or `retract` clauses from the stratum to the `abort` call.
     This edgecase has now been fixed. 
     (In the SJS source code see 
     test/unit/sjs-2-tests:'exception in finally clause in stratum - synchronous').

   * `rpc/bridge`: Abortion over the bridge is now synchronous. This is to better support
     call patterns that rely on proper sequencing of blocking abort code. 
     Also, various edge cases where blocklambda breaks and returns 
      would not function correctly across the bridge have been fixed.
     See the section on Abortion in the `mho:rpc/bridge` documentation and the testcases 
     under test/integration/bridge-tests.sjs:'synchronous_aborting'.

   * The undocumented `try{}catchall(c){}` construct has been replaced by an
     'augmented finally clause' `try{}finally(e){}`. This is only for use in the
     conductance bridge code, and not intended for general user code.

   * Blocklambda breaks and returns can now be routed across nested spawned 
     strata (in the SJS source code see the testcases starting with
     test/unit/sjs-2-tests.sjs:'blocklambda breaks across nested spawned strata').
     Previously these testcases would have generated runtime errors (in the case of
     `break`) or failed to call all `finally` clauses (in the case of `return`). 

   * Under some circumstances, blocklambda returns from within spawned strata would
     erroneously set the value of reified strata along the return path. This be
     behavior has been corrected: all strata along the return path will get `undefined`
     as their return value. Only the final target of the `return` will see the returned
     value. (In the SJS source code see 
     test/unit/sjs-tests.sjs:'detached blocklambda return with value pickup')

   * Under some circumstances, blocklamda returns across inactive scopes would fail to
     emit a 'Blocklambda return from spawned stratum to inactive scope' error. This has
     been fixed. (In the SJS source code see
     test/unit/sjs-3-tests.sjs:'return via inactive scope edgecase').

   * For HTML content inserted into a document in the context of a `block` function
     (e.g. `@appendContent(X) { || ... }`), blocklambda returns initiated from the
     HTML content (such as e.g. `@Button .. @OnClick({|| return;})`) would not 
     honor all `finally` blocks along the return path under certain circumstances. This
     behavior has been fixed.

   * Exceptions of type `Error` emitted from spawned strata and picked up via `Stratum::value()` 
     calls had callstacks with missing or jumbled frames. This has been fixed and the callstacks
     now correctly contain all frames starting with the the frame where the exception was thrown
     up to the site of the `spawn` call and continuing with the callsite of the `Stratum::value()`
     call up to the point where the exception was caught.
     As part of this fix, each `Stratum::value()` call emits a cloned exception, which could break
     some (pathological) code that depends on strict equality checks of exceptions.
     Note that (a) exceptions are being cloned such that the prototype chain stays intact, 
     so checks like `e instanceof SomeErrorPrototype` will still work, and (b) this only affect exceptions
     that are `instanceof Error` (as those are the only ones being annotated with stackframes by the SJS
     engine).

   * Similarly to the bug above, Errors emitted from spawned strata during `Stratum::abort()` calls
     had callstacks with missing or jumbled frames. This has been fixed in the same way as for
     `Stratum::value()`.

   * `each.track`: A bug has been fixed which caused asynchronously thrown exceptions during abortion
     to be silently swallowed. 
     (In the SJS source code see
      test/unit/sequence-tests.sjs:'async exception during each.track abortion').

   * Callstacks of TypeErrors thrown during function parameter destructuring were missing information 
     about the location of the initial throw site. This has been fixed.

   * Function call stackframes were previously annotated with the line number of the end token of the
     call (and sometimes - especially in the case of blocklambda calls - with the line number of the
     token following the call). Now, function call stackframes are annotated with the line number of 
     the first token of the argument list.

   * `mho:websocket-client`: Prevent errors from going uncaught when the socket
     is closed before the connection is established.

   * `sjs:xbrowser/dom::traverseDOM`: fix implementation for blocking 
     traversal functions

   * `sjs:regexp::matches` is now robust for blocking consumers. If the regexp is 
     used elsewhere while the consumer is blocking, the index at which matching 
     resumes will be restored.


## Version 0.7.7:

 * Bug fixes:

   * Fix implementation of `sjs:projection::project` for arguments of 
     type `BatchedStream`, which was broken in 0.7.6.


## Version 0.7.6:

 * General:

   * nodejs dependency has been updated to the active LTS release v10.15.3-stretch.


 * New functionality:

   * Websocket client implementation (module 'mho:websocket-client')

   * Support for compiled SJS modules: `mho:module-compiler` can be used (from sjs code or as
     a stand-alone utility) to compile SJS modules into an SJS VM-compatible representation.
     As far as the SJS VM and the Conductance code bundling mechanisms are concerned,
     compiled SJS module files are drop-in replacements for uncompiled files (you can replace any
     sjs module 'foo.sjs' with its compiled version, also stored under 'foo.sjs').
     There is a (slight) performance advantage to using compiled module files (the VM can
     skip a compilation step when loading already-compiled modules).
     Also, compiled modules are stripped of comments (so no module documentation can be
     generated from them) and the generated code is *a lot* harder (but not impossible) to
     read/understand than the corresponding uncompiled source. This means that compilation
     can serve as a code obfuscation technique to discourage casual inspection of source code.

   * A new class `sjs:structured-observable::StructuredObservable` (with eponymous constructor)
     has been added. It inherits from `sjs:sequence::Stream`, forming a separate hierarchy 
     next to `sjs:observable::Observable`. The new module `sjs:structured-observable` will
     be the home for structured observables (such as `ObservableArray`).

   * Predicates `sjs:structured-observable::isStructuredObservable` and 
     `isObservableArray` have been added.

   * A new module `sjs:projection` has been added. This will be the home for type-preserving
     stream transformation functions.

   * A new function `sjs:projection::projectInner` equivalent to 
     seq .. project(elems -> elems .. project(f))
     has been added. The idea is that inner projections can be efficiently special-cased
     for structured observables. E.g. for `ObservableArray` streams, instead of projecting
     each array element for every mutation, only new items have to be projected.


 * Bug fixes / Behavioral changes:

   * `sjs:sequence::each.track`: Make the implementation robust against a (fatal) stack overflow occuring when an
     each.track loop with fast producer and slow consumer was exited via blocklambda break or blocklambda return.

   * Fix various edge cases where blocklambda breaks or returns would not be propagated properly in the case of
     blocking finally clauses, potentially altering control flow (e.g. causing loops not to be exited).
     Fortunately there are no known cases in existing code where any of these edge cases were hit.

   * Add missing `mho:surface/cmd::On` export.

   * `mho:flux/kv::set`: Prevent accidental deletion of keys by disallowing 'undefined' values

   * mho:surface: Fix bug where top-level strings containing the literal text 'surface_stream'       would cause spurious Mechanisms to be run upon insertion of such a string into the DOM with
     one of the surface insertion functions (appendContent, etc).

   * `require()` now injects a module-specific `require` function into plain JavaScript
     modules, which allows CommonJS-style JS modules to load other files by URL relative to the
     JS module (or via hubs). Note that any files loaded from JS modules in this way need to
     be synchronously available (e.g. preloaded with a prior `require` call from an SJS module).
     Furthermore, the default extension for files `require`d from JS modules is '.js'.
     Prior to this change, JS modules would see the global `require` function, which would
     break resolution of relative URLs, and would default to loading files with '.sjs'
     extension.

   * `sjs:xbrowser/dom::script`: Throw proper `Error` object (and not just a string) if script
     can't be loaded.

   * `sjs:xbrowser/dom::css`: Block until stylesheet is loaded; throw error if it can't be
     loaded. Don't reload stylesheets if previously loaded in this way.

   * `mho:surface::RequireExternalScript`: Fix error handling (see `sjs:xbrowser/dom::script` above).

   * `mho:surface::RequireExternalCSS`: Fix semantics (see `sjs:xbrowser/dom::css` above).

   * Structured observables (symbols `ObservableArray`, `ObservableArrayVar`) and 
     supporting functions (`reconstitute`) have been moved into their own module 
     `sjs:structured-observable`.

   * Structured observables (`ObservableArray`, `ObservableArrayVar`) no longer inherit
     from `Observable`, but from `StructuredObservable`, which in turn inherits from
     `Stream`. 

   * `CompoundObservable` and `DelayedObservable` no longer automatically
     reconstitute their inputs. Since structured observables don't inherit from `Observable`
     any longer, `CompoundObservable` will now throw an exception when fed with structured
     observables that haven't been passed through `reconstitute`.

   * `project` and `dereference` have been moved into a new `sjs:projection` module.

   * `project` no longer performs inner projection on `ObservableArray`. Instead 
     it calls its transformation function with the full array on every mutation
     (i.e. like `project` for other stream types, it now performs *outer* projection).
     For inner projection, we now have a function `projectInner`.

   * `ObservableArray`: The format of the mutation stream has been changed. Instead of
     'reset' mutation events, the stream now contains a copy of the array.

   * The (undocumented) interface machinery for adding new types into `reconstitute` 
     and `project` has been removed. The intention is to add a similar functionality 
     in a future version of stratifiedjs.


## Version 0.7.5:

 * New functionality:

   * `sjs:sequence::scan` now takes an optional 'initial' argument.

   * Various API methods have been added to `sjs:observable::ObservableArrayVar`:
     - `reset`
     - `push`
     - `getLength`

   * `sjs:sys::withEvalContext`:
     - An `imports` parameter for importing symbols into the context has been added.
     - The `eval` function now takes an optional `file_name` parameter, to customize the name appearing in stack traces.

   * `mho:surface::CollectStream` now takes an optional `post_append` function argument.

   * A new function `mho:surface::ReplaceStream` has been added. In contrast to `mho:surface::CollectStream`, 
     this will always insert the most recent stream element, replacing the previous element. This behavior also
     happens to be the default mode for rendering streams (i.e. instead of `@ReplaceStream(S)`, you can just use 
     `s` directly as a HtmlFragment.), however `ReplaceStream` allows for specifying a `post_update` function.


 * Bug fixes / Behavioral changes:

   * Calling `sjs:observable::reconstitute` on an `ObservableArrayVar` stream now generates a new (cloned) 
     array for each stream element, to ensure proper operation with `sjs:sequence::dedupe`.

   * `sjs:sequence::dedupe` will now only start to call its (optional) `eq` parameter on the second
     stream element. Previously `eq` was also erroneously called on the first stream element 
     (and a dummy sentinel as first argument).

   * `sjs:cutil::waitforAll` now takes a copy of its `funcs` array argument. I.e. even if members are 
     added/removed to/from the array after the initiation of the waitforAll call 
     (e.g. by synchronous manipulation from one of the array members), waitforAll will execute precisely 
     the functions present in the array when the waitforAll call is initiated.

   * `ObservableArray`s are now also tagged as `Observables`, i.e. `isObservable` will return 'true' for them.

   * `sjs:sys::withEvalContext`:
     - The `name` parameter has been changed to `id`, and its role in module resolution clarified in the docs.

   * `sequence::mirror` semantics have been clarified in the docs.

   * The 'cyclic stratum abort' console warnings have been removed, and the docs warning about cyclic aborts
     have been toned down (instead of being 'typical' of flawed program logic, we now say, they 'can be indicative' 
     thereof, given that there are many use cases, as evident in the standard lib, especially the sequence module).
     See also 'Stratum::abort' in the docs.

   * A memory leak which caused `sjs:sequence::each.par` to hold onto large amounts of context information has 
     been plugged. This leak caused Conductance processes which used 'bridge' rpc communication to ultimately run out of 
     memory.

   * Blocklambda `return` calls initiated from within `spawn`ed strata used to erroneously call `retract` clauses in 
     enclosing code (outside of the spawned stratum, but within the return path). This has been fixed.

   * Exceptions thrown in `retract` clauses were silently swallowed if there was a `finally` clause present. This too has 
     been fixed.

   * Various stray `console.log` debug calls have been removed.

   * Various small speed and memory consumption improvements.

   * Routing of blocklambda breaks across the rpc bridge has been fixed 
     (see tests/integration/bridge-tests::blocklambda_break_2).

   * Structured streams (such as ObservableArray streams) will now automatically be reconstituted when rendered as
     (part of) a HtmlFragment.

