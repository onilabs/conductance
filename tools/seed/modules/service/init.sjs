require('./hub');
@ = require(['sjs:object', 'sjs:sequence']);
@env = require('mho:env');
var config = process.env .. @get('SEED_SERVICE_CONFIG')
  .. require('sjs:nodejs/fs').readFile()
  .. JSON.parse;
config._env .. @ownPropertyPairs .. @each { |[k,v]|
  @env.set(k, v);
}
@env.set('seed-service-config', config);
