@url = require('sjs:url');
var clientServiceHub = @url.normalize('./client', module.id);
require.hubs.unshift(['lib:seed', clientServiceHub]);
