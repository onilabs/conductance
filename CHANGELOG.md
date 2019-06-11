This changelog lists the most prominent, developer-visible changes in each release, starting with release 0.7.5:

## Version 0.8.0:

 * General:

   * The ssh2 dependency has been updated from 0.5.5 to 0.8.4, which should fix some
     protocol negotiation issues encountered in conjunction with node v10.15.3-stretch.


 * New functionality:

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

