This changelog lists the most prominent, developer-visible changes in each release, starting with release 0.7.5:

## Version 0.7.6:

 * New functionality:

   * Websocket client implementation (module 'mho:websocket-client')

 * Bug fixes / Behavioral changes:

   * `sjs:sequence::each.track`: Make the implementation robust against a (fatal) stack overflow occuring when an
     each.track loop with fast producer and slow consumer was exited via blocklambda break or blocklambda return.

   * Fix various edge cases where blocklambda breaks or returns would not be propagated properly in the case of
     blocking finally clauses, potentially altering control flow (e.g. causing loops not to be exited).
     Fortunately there are no known cases in existing code where any of these edge cases were hit.

   * Add missing mho:surface/cmd::On export.

   * mho:flux/kv::set: Prevent accidental deletion of keys by disallowing 'undefined' values

   * mho:surface: Fix bug where top-level strings containing the literal text 'surface_stream'          would cause spurious Mechanisms to be run upon insertion of such a string into the DOM with
     one of the surface insertion functions (appendContent, etc).

   * `require()` now injects a module-specific `require` function into plain JavaScript
     modules, which allows CommonJS-style JS modules to load other files by URL relative to the
     JS module (or via hubs). Note that any files loaded from JS modules in this way need to
     be synchronously available (e.g. preloaded with a prior `require` call from an SJS module).
     Furthermore, the default extension for files `require`d from JS modules is '.js'.
     Prior to this change, JS modules would see the global `require` function, which would
     break resolution of relative URLs, and would default to loading files with '.sjs'
     extension.


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

