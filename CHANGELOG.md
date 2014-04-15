This changelog lists the most prominent, developer-visible changes in each release.

## Version 0.5:

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
