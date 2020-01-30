// conductance server environment
// server-side only

/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */


/**
  @nodoc
  (documented as mho:env)
*/
var sys = require("sjs:sys");
var path = require("nodejs:path");
var url = require("sjs:url");
var { stat, readFile } = require('sjs:nodejs/fs');
var { ownPropertyPairs } = require("sjs:object");
var { each } = require("sjs:sequence");

var sjsRoot = path.dirname(sys.executable);
var conductanceRoot = url.normalize('../../', module.id) .. url.toPath();

var packageInfo = JSON.parse(readFile(path.join(conductanceRoot, 'package.json')));
var conductanceVersion = packageInfo.version;

var sjsVersionStamp = (new Date(stat(require.resolve('sjs:../stratified-node.js').path .. url.toPath(7)).mtime)).getTime();

exports.fillEnv = function(e) {

  var predefined = {
    executable         : path.join(conductanceRoot, 'conductance'),
    conductanceRoot    : conductanceRoot,
    sjsRoot            : sjsRoot,
    conductanceVersion : -> conductanceVersion,
    compilerStamp      : -> sjsVersionStamp,
    configPath         : -> e.get('config', {}).path, // TODO: remove?
    configRoot         : function() { var p = e.configPath(); return p ? url.normalize('./', p); }, // TODO: remove?
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
  // 'config' is set from ./_config.sjs
  e.config = -> e.get('config', undefined);
};
