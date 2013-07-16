var url = require('sjs:url');
var path = require('nodejs:path');

var selfUpdatePath = process.env['CONDUCTANCE_ROOT'];
if (selfUpdatePath) selfUpdatePath = path.join(selfUpdatePath, 'share', 'self-update.js');

var getModule = function() {
  return require(selfUpdatePath .. url.fileURL);
};

exports.available = selfUpdatePath && require('sjs:nodejs/fs').exists(selfUpdatePath);

if (exports.available) {
  checkForUpdates = function() {
    waitfor (var err, updates) {
      getModule().checkForUpdates(resume);
    }
    if(err) throw err;
    return updates;
  }

  exports.check = function(args) {
    console.log("Checking for updates ...");
    if (args.length > 0) {
      console.error("self-update takes no arguments");
      process.exit(1);
    }
    try {
      if (checkForUpdates()) {
        console.warn("A conductance update is available. Run `conductance-self-update` to update.");
      }
    } catch(e) {
      console.warn("An error occurred while checking for conductance updates:\n#{e.message || e}");
      process.exit(1);
    }
  };

  exports.update = function(args) {
    if (args.length > 0) {
      console.error("self-update takes no arguments");
      process.exit(1);
    }
    checkForUpdates();
    // NOTE: executes async, kills the process itself if it fails
    getModule().main(false);
  };
}

