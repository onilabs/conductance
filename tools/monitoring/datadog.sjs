@ = require('sjs:std');
// wraps `datadog` with some defaults from environment variables
var {@Datadog} = require('mho:services/datadog');

exports.Datadog = function(opts) {
  opts = opts || {};
  var env = process.env;

  return @Datadog({
    apikey: env.DATADOG_API_KEY,
    host: env.DATADOG_HOST,
    defaultTags: [
      "env:#{opts.env}",
      "hostname:#{require('nodejs:os').hostname()}",
    ],
  } .. @merge(opts));
};
