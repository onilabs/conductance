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
