// conductance server environment
// server-side only
var sys = require("sjs:sys");
var path = require("nodejs:path");
var url = require("sjs:url");
var { stat } = require('sjs:nodejs/fs');
var { Registry } = require('sjs:service');
var { ownPropertyPairs } = require("sjs:object");
var { each } = require("sjs:sequence");

var sjsRoot = path.dirname(sys.executable);
var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();
var conductanceVersion = "1-#{
                              (new Date(
                                  stat(require.resolve('sjs:../stratified-node.js').path .. url.toPath(7)).mtime
                              )).getTime()
                            }";

var e = module.exports = Registry();
var predefined = {
  executable         : path.join(conductanceRoot, 'conductance'),
  conductanceRoot    : conductanceRoot,
  sjsRoot            : sjsRoot,
  conductanceVersion : -> conductanceVersion,
  configPath         : -> e.get('config', {}).path, // TODO: remove
  configRoot         : function() { var p = e.configPath(); return p ? url.normalize('./', p); }, // TODO: remove
};

predefined .. ownPropertyPairs .. each {|[key, val]|
  if (e[val]) throw new Error("Duplicate: #{key}");
  e[key] = val;
  if (typeof(val) === 'function') {
    e.factory(key, val);
  } else {
    e.value(key, val);
  }
}

e.config = -> e.get('config', undefined);
