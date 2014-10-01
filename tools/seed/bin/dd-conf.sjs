#!/usr/bin/env conductance
// creates a datadog-conf from an input template
@ = require('mho:std');
require('../modules/hub');
require('seed:env').defaults();

var api_key = @env.get('api-keys') .. @get('datadog');
var [input, output] = @argv();
var contents = input .. @fs.readFile('utf-8') .. @supplant({api_key: api_key});
output .. @fs.writeFile(contents, 'utf-8');
console.log("Wrote #{output}");
