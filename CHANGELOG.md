This changelog lists the most prominent, developer-visible changes in each release, starting with release 0.7.5:

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

