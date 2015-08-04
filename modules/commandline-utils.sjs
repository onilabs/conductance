/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

@ = require(['mho:std', 
             {id: 'sjs:dashdash', name:'dashdash'}
            ]);

//----------------------------------------------------------------------
/**
   @function parseArgs
   @summary Parse the process arguments
   @param {Object} [settings]
   @setting {optional String} [summary] Descriptive text for help text
   @setting {optional Array}  [args] Argument descriptors `{name: STRING, help: HELP_STRING}`
   @setting {optional Array}  [options] Options descriptors in the format expected by [sjs:dashdash::]
   @setting {optional String} [exe_name=process.argv[1]] Name of executable (for help text)
   @setting {optional Array}  [argv=@sys.argv()] Arguments to parse.
   @return {Object} arguments/options object
   @desc
     Parses the process arguments into arguments and options. Exits the process (`process.exit(1)`) if 
     there is a parse error (e.g. too few arguments provided).
     
     The returned object is a hash of named arguments/options and their values.

     The options '--help, -h' and '--loglevel=LEVEL' are automatically added to the list of accepted 
     options. 

     The former shows a help text and exits the process (`process.exit(0)`). 

     The latter sets the loglevel ([sjs:logging::setLevel]) to LEVEL (typically one of 'OFF', 'ERROR', 'WARN', 'DEBUG', 'INFO', 'VERBOSE').

*/
function parseArgs(settings) {
  settings = { 
    args: [],
    options: [],
    exe_name: (process.argv[1] .. @url.parse).file,
    summary: '',
    argv: undefined
  } .. @override(settings);

  settings.options.unshift({ names: ['help', 'h'], type: 'bool', help: 'Print this help and exit.'});
  settings.options.unshift({ name: 'loglevel', type: 'string', help: 'Set logging level.'});

  var parser = @dashdash.createParser({options:settings.options});
  try {
    var opts = parser.parse({argv:settings.argv});
    if (!opts.help && opts._args.length !== settings.args.length)
      throw new Error("#{settings.args.length} arguments expected; #{opts._args.length} provided");
  } catch(e) {
    console.error("\
#{settings.exe_name}: Error: #{e.message}
Try \"#{settings.exe_name} -h\"");
    process.exit(1);
  }

  if (opts.help) {
    console.log("\
Usage: #{settings.exe_name} [OPTIONS]#{settings.args.length ? ' --':''} #{settings.args .. @map(arg -> arg.name) .. @join(" ") }

#{settings.summary}
#{settings.args.length ? "\nArguments:\n" : ""}
#{ settings.args .. @map(arg -> "#{arg.name}\n#{arg.help ? @prefixLines(arg.help, '     ') : ''}\n") .. @join('\n') }

Options:
#{parser.help()}");
    process.exit(0);
  }

  if (opts.loglevel) {
    @logging.setLevel(@logging .. @get(opts.loglevel.toUpperCase()));
  }

  settings.args .. @indexed .. @each {
    |[i,arg]|
    opts[arg.name] = opts._args[i];
  }

  return opts;
}

exports.parseArgs = parseArgs;

