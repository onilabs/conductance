/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
var { Emitter } = require('sjs:event');
var { flatten } = require('sjs:array');

exports.ChangeBuffer = function(size) {
  // xxx not sure about size; we add changes to the change buffer in
  // batches; should the size of the batches taken into consideration
  // when deciding to shift the buffer?
  var buf = [];
  var rv = {
    emitter: Emitter(),
    revision: 1,
    addChanges: function(changes) {
      buf.push(changes);
      if (buf.length > size) buf.shift();
      rv.emitter.emit(++rv.revision);
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
