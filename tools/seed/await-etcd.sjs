require('./modules/hub');
require('seed:env').defaults();
require('./bin/etcd.sjs').awaitRunningServer();
