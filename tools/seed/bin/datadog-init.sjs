@ = require('sjs:std');
// an init module for datadog scripts that expect $DATADOG_API_KEY,
// which we can't store verbatim in `nix` (because the store is world-readable)
process.env.DATADOG_API_KEY = process.env.SEED_KEYS .. @fs.readFile() .. JSON.parse .. @get('datadog');
process.env.DATADOG_API_KEY = @env.get('datadog-api-key');
require(process.env.WRAP_MAIN .. @url.fileURI, {main:true});
