#!/usr/bin/env conductance
require('../modules/hub');
var logging = require('sjs:logging');
// logging.setLevel(logging.DEBUG);

if (typeof(__karma__) !== 'undefined' && module.id.indexOf('/app/') == -1) {
  throw new Error("run.html loaded as #{module.id}\nUnder karma, the test module should be:\n    /app/test/run.app\n");
}

var opts = {
  base: module.id,
  logLevel: logging.INFO,
};
var runner = require('sjs:test/runner');

if(require('sjs:sys').hostenv === 'xbrowser') {
  opts.moduleList = 'modules.txt';
  runner.run(opts);
} else {
  opts.modules = require('./modules.txt.gen').list();
  require('./lib/stub.api').hook( -> runner.run(opts));
}

