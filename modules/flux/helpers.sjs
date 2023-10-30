/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @nodoc
*/
var { Dispatcher } = require('sjs:cutil');
var { flatten } = require('sjs:array');

exports.ChangeBuffer = function(size) {
  // xxx not sure about size; we add changes to the change buffer in
  // batches; should the size of the batches taken into consideration
  // when deciding to shift the buffer?
  var buf = [];
  var rv = {
    dispatcher: Dispatcher(),
    revision: 1,
    addChanges: function(changes) {
      buf.push(changes);
      if (buf.length > size) buf.shift();
      rv.dispatcher.dispatch(++rv.revision);
    },
    getChanges: function(start_revision) {
      var count = rv.revision - start_revision;
      var start = buf.length - count;
      if (start < 0) throw new Error("ChangeBuffer exhausted");
      return buf.slice(start) .. flatten;
    }
  };
  return rv;
};

//----------------------------------------------------------------------
// helpers

// recursive clone with special case for 'Date'
__js function structural_clone(obj) {
  var rv;
  if (obj === null) {
    rv = obj;
  }
  else if (Array.isArray(obj)) {
    rv = new Array(obj.length);
    for (var i=0; i<obj.length; ++i) {
      rv[i] = structural_clone(obj[i]);
    }
  }
  else if (typeof obj === 'object' && ! (obj instanceof Date)) {
    rv = {};
    for (var prop in obj) {
      // XXX check for 'own' properties here?
      rv[prop] = structural_clone(obj[prop]);
    }
  }
  else {
    rv = obj;
  }
  return rv;
}
exports.structuralClone = structural_clone;
