This changelog lists the most prominent, developer-visible changes in each release.

## Version 0.6:

 * The `ChangeBuffer` function in the `mho:flux/helpers` module has been changed:
   it's no longer possible to call `emit` directly. As an example, this code no
   longer works:

        var change_buffer = @ChangeBuffer(...);
        change_buffer.emitter.emit(...);

   Instead, use `change_buffer.addChanges(...)`

## Version 0.5:

 * New functions and symbols:

  * server/route::DocumentationBrowser
  * server/route::ETagFilter
  * surface::isElementWithClass
  * surface::isElementOfType
  * surface::CSS
  * surface::GlobalCSS
  * surface::Content
  * surface/doc-fragment::bootstrapColors
  * surface/doc-fragment::conductanceCss
  * surface/doc-fragment::mhoColors
  * surface/bootstrap/html::Lead
  * surface/bootstrap/html::ListGroup
  * surface/bootstrap/html::ListGroupItem
  * surface/bootstrap/html::ListGroupItem
  * surface/bootstrap/html::Panel
  * surface/bootstrap/html::PanelBody
  * surface/bootstrap/html::PanelHeading
  * surface/bootstrap/html::PanelTitle

 * Changes:

  * The `mho:observable` module has been moved into `sjs:observable`.

  * surface::Style now simply sets the html `style` attribute.
    The previous behavour of the `Style` function has been moved to
    surface::CSS.

  * surface::RequireExternalCSS has been renamed to RequireExternalCSS

  * Improvements to surface mechanism error propagation:
    Previously mechanisms were run detached, and an error raised by a mechanism
    would be uncaught. Now, errors thrown from mechanisms
    associated with a block (e.g. `appendContent(parent, content, _block_)`)
    will cause the error to be thrown from the call which added the content,
    as if they were thrown from `_block_` itself.

  * changes to the server/systemd module (used for systemd integration):
    - Added `Unit` class (with `Service` `Socket` & `Timer` shorthand functions)
    - The format of the object passed into `Group` has changed. Previously,
      components were a plain object with unit-type keys, as in:

              Group({
                main: {
                  Service: { /* service properties */ },
                  Socket: { /* socket properties */ },
                }
              });

      This did not allow specifying non-service properties (e.g properties
      belonging in the `Unit` or `Install` section of the underlying systemd unit),
      which is supported by the new `Unit` object.

      The previous code also only supported the `socket` and `service` unit types - we
      have added explicit support for `timer` units in version 0.5, but you can also
      create arbitrary unit types as well.

      The new format is for each component passed to the `Group` constructor to have
      an array of `Unit` objects, as in:

              Group({
                main: [
                  Service({ /* service properties */ }),
                  Socket( { /* socket properties  */ }),
                ],
              });

      You can also specify just a single `Unit`, rather than an array. Having an explicit object
      type allows us to use optional arguments, and provides better error handling / feedback
      than a nested untyped object.

    - We've also refined the default properties added to units and how some of the
      `conductance systemd` commands operate, to better ensure that the appropriate
      units are started / stopped / restarted in concert.

## Version 0.4:

 * initial support for Windows (including self-installer .exe)
 * update StratifiedJS to 0.18
 * update nodemon to 1.0
