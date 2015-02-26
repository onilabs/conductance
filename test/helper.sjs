require('../hub.sjs');
var Url = require('sjs:url');
var http = require('sjs:http');
var logging = require('sjs:logging');
var suite = require('sjs:test/suite');
var { isBrowser } = require('sjs:test/suite');

var host = null;
var prefix = isBrowser ? (Url.normalize('../', module.id) .. Url.parse()).path : '/';

exports.getRoot = function() {
  if(!host && !isBrowser) throw new Error("Host not yet set");
  return Url.normalize(prefix, host);
};
exports.setHost = h -> host = h;

exports.url = u -> Url.normalize(u, exports.getRoot());

var inProcessServer = false;
exports.inProcessServer = -> inProcessServer;

exports.serve = function(config, block) {
  var port = config.address.port;
  var base_url = 'http://localhost:' + port + '/';
  exports.setHost(base_url);

  var isRunning = function() {
    try {
      http.get(base_url);
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
    console.warn("using existing server on #{port}");
    return block();
  }

  inProcessServer = true;
  require('mho:server').run(config, block);
}

if (!isBrowser) {
  var childProcess = require('sjs:nodejs/child-process');
  var fs = require('sjs:nodejs/fs');
  exports.tmpContext = function() {
    var root = process.env['TEMP'] || process.env['TMP'] || '/tmp';
    var tmp = {};
  
    var mkdir = function() {
      while(true) {
        var path = "#{root}/conductance-test-#{process.pid}-#{Math.round(Math.random() * 9999)}";
        try {
          fs.mkdir(path);
        } catch(e) {
          if (e.code == 'EEXIST') {
            continue; // try a different path
          } else {
            throw e;
          }
        }
        
        // mkdir succeeded - break out of loop
        tmp.path = path;
        break;
      }
    }

    var cleanup = function() {
      if (tmp.path && fs.exists(tmp.path)) {
        childProcess.run('rm', ['-r', tmp.path], {stdio:'inherit'});
      }
      tmp.path = null;
    }

    suite.test.beforeEach {||
      cleanup();
      mkdir();
    }
    suite.test.afterAll(cleanup);
    return tmp;
  }
}
