@url = require('sjs:url');
require.hubs.push(['seed:', @url.normalize('./', module.id)]);
