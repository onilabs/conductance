#!/usr/bin/env sjs
@ = require('sjs:std');
@datadog = require('./datadog').Datadog();

var YUM='/usr/bin/yum';
var yum = function(args, capture) {
  // -y == assume yes
  // -d == debug verbosity
  // -e == error-reporting level
  return @childProcess.run(
    YUM,
    ['-y', '-d0'].concat(args),
    {
    stdio: ['ignore',
      capture === 'stdout' ? 'pipe' : process.stdout,
      capture === 'stderr' ? 'pipe' : process.stderr,
    ]
  });
};

var nonEmptyLines = function(output) {
  return output.split("\n")
    .. @map(line -> line.trim())
    .. @filter(line -> line.length > 0)
    .. @toArray;
};

try {
  @info("Clearing metadata  ...");
  yum(['clean', 'all']);

  @info("Listing updates ...");
  var updates = (yum(
    ['--security', 'list', 'updates' ],
    'stdout').stdout .. nonEmptyLines()).slice(1);

  @info("Applying updates ...");
  var errors = yum(
    ['--security', 'update'],
    'stderr').stderr.trim();

  if (errors) @warn(errors);

  // combine update list with output
  var output = updates.join("\n");
  if (errors.length > 0) {
    output += "\n----\n#{errors}";
  }

  // notify datadog
  if (output != "") {
    @datadog.event({
      title: 'package updates',
      text: output,
      alertType: 'success',
      tags: ['package-update'],
    });
  }

  @datadog.metric('user.package_updates.run', [1]);
  @datadog.metric('user.package_updates.count', [updates.length]);

  /**********************/

  @info("Checking for update warnings ...");
  var warnings = [];
  try {
    warnings = yum(['--security', 'check-update' ], 'stdout').stdout .. nonEmptyLines();
  } catch(e) {
    if (e.code == 100) {
      // OK (http://yum.baseurl.org/wiki/YumCommands)
    } else {
      throw e;
    }
  }

  if (warnings.length > 0) {
    warnings .. @each(@warn);
    @datadog.event({
      title: 'package warnings',
      text: warnings.join("\n"),
      alertType: 'warning',
      tags: ['package-update'],
    });
  }
  @datadog.metric('user.package_updates.warn', [warnings.length]);
  @info("Updates complete.");

} catch(e) {
  if (e.stderr) {
    console.warn(e.stderr);
  }
  @datadog.metric('user.package_updates.run', [0]);
  @datadog.event({
    title: 'package updates failed',
    text: e.stderr || '(no output)',
    tags: ['package-update'],
    alertType: 'error',
  });
  throw e;
}
