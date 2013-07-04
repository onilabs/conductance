// add `mho` hubs
var url = require('sjs:url');
require.hubs.addDefault(['mho:', url.normalize('./modules/', module.id)]);
require.hubs.addDefault(['\u2127:', 'mho:']); // mho sign '℧'
