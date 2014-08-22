require('../modules/hub');
var logging = require('sjs:logging');
// logging.setLevel(logging.DEBUG);

if (typeof(__karma__) !== 'undefined' && module.id.indexOf('/app/') == -1) {
  throw new Error("run.html loaded as #{module.id}\nUnder karma, the test module should be:\n    /app/test/run.app\n");
}

var runner = require('sjs:test/runner');
require('./api/stub.api').connect() {|api|
  api.hook {||
    runner.run({
      moduleList: 'modules.txt',
      base: module.id,
      logLevel: logging.INFO,
    });
  }
}

