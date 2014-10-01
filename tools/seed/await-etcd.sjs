require('./modules/hub');
require('seed:env').defaults();
require('./bin/services').etcd.awaitRunningServer();
