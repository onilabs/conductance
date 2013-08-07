require('../hub.sjs');
var Url = require('sjs:url');
var http = require('sjs:http');
var logging = require('sjs:logging');

var host = null;
exports.getHost = -> host;
exports.setHost = h -> host = h;

exports.url = u -> Url.normalize(u, host);

exports.serve = function(block) {
  var args = [
    'run',
    Url.normalize('./test.mho', module.id) .. Url.toPath,
  ];
  var port = '7078';

  var isRunning = function() {
    var base_url = 'http://localhost:' + port + '/';
    try {
      http.get(base_url);
      exports.setHost(base_url);
      return true;
    } catch (e) {
      if(e.toString().indexOf('ECONNREFUSED') == -1) {
        // this is not the error we expected!
        throw(e);
      }
      return false;
    }
  };

  if (isRunning()) {
    // no need to start or stop
    return block();
  }

  var origLevel = logging.getLevel();
  waitfor {
    logging.setLevel(logging.WARN);
    require('mho:server/main').run(args);
  } or {
    var tries = 0;
    while(!isRunning()) {
      if (tries++ > 10) throw new Error("conductance failed to start");
      hold(1000);
    }
    logging.setLevel(origLevel);
    block();
  }
}
