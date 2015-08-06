#!/usr/bin/env sjs
@ = require('sjs:std');
@datadog = require('./datadog').Datadog();

var run = function(args, capture) {
  return @childProcess.run(
    args[0],
    args.slice(1),
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

function applyUpdates() {
  @info("Updating nixos channel");
  run(['nix-channel', '--update']);

  var buildCommand = action -> [
    'nixos-rebuild', action .. @assert.ok("no action provided"),
    '--no-build-output', '--show-trace'
  ];

  @info("Listing updates ...");
  var updates = (run(buildCommand('dry-run'), 'stderr').stderr .. nonEmptyLines()).slice(1);

  @info("Rebuilding");
  run(buildCommand('switch'));

  // notify datadog
  if (updates.length > 0) {
    @datadog.event({
      title: 'package updates',
      text: updates.join('\n'),
      alertType: 'success',
      tags: ['package-update'],
    });
  }

  @datadog.metric('user.package_updates.run', [1]);
  @datadog.metric('user.package_updates.count', [updates.length]);
};

function checkKernal() {
  var [ runningKernel, bootedKernel ] = ['current','booted']
    .. @map(function(which) {
      var path = "/var/run/#{which}-system/kernel";
      return {stat: @fs.stat(path), path: @fs.readlink(path),};
    });

  if (runningKernel.stat.dev === bootedKernel.stat.dev && runningKernel.stat.ino === bootedKernel.stat.ino) {
    @info("Kernel has not changed: #{runningKernel.path}");
    @datadog.metric('user.reboot_required', [0]);
  } else {
    var msg = "Kernel has changed from #{bootedKernel.path} -> #{runningKernel.path}";
    @warn(msg);
    @datadog.metric('user.reboot_required', [1]);
    @datadog.event({
      title: 'reboot required',
      text: msg,
      alertType: 'warning',
      tags: ['reboot-required'],
    });
  }

};


try {
  process.chdir("/tmp");
  applyUpdates();
  checkKernal();
  @info("Updates complete.");

} catch(e) {
  ;['stdout', 'stderr'] .. @each {|prop|
    if(e[prop]) {
      console.warn(e[prop]);
    }
  };
  @datadog.metric('user.package_updates.run', [0]);
  @datadog.event({
    title: 'package updates failed',
    text: e.stderr || '(no output)',
    tags: ['package-update'],
    alertType: 'error',
  });
  throw e;
}
