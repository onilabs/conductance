/**
@type doc
@summary Documentation for the .mho file format
@desc
  The `.mho` file format is used to configure the conductance
  web server.

  When you run `conductance serve` with no arguments, `config.mho` is
  loaded from the current directory if it exists. Otherwise, the default
  server configuration included in conductance (`default_config.mho`) is used.

  To run the server with a file other than `./config.mho`, pass it
  as the first option to `conductance serve`.

@function exports.serve
@summary The function run by `conductance serve`
@param {Array} [args] Additional command-line arguments passed to `conductance serve`
@desc
  When you run `conductance serve`, it will call this function with any
  additional command line arguments in `args`. If your server accepts
  arguments, you would typically use the [sjs:dashdash::] module to
  process them.

  If your server does *not* accept arguments, you should fail when `args`
  is not empty.

@variable exports.systemd
@summary sytemd configuration for your application
@desc
  `exports.systemd` may be a [mho:systemd::Group] object, or a function which (when
  invoked with no arguments) returns a [mho:systemd::Group] object.

  The various subcommands of `conductance systemd` will use this object
  to determine the systemd name of your application its the units, etc.

  If you use systemd to install multiple applications on the same machine,
  each of their `systemd` export objects should be a group with a unique group
  name. If you use the same group name for multiple .mho files, they will be
  treated as a single application by the `conductance systemd` commands.
*/
