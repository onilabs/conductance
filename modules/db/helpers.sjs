var { Emitter } = require('sjs:events');

exports.ChangeBuffer = function(size) {

  var buf = [];
  var rv = {
    emitter: Emitter(),
    revision: 1,
    addChange: function(change) {
      buf.push(change);
      if (buf.length > size) buf.shift();
      rv.emitter.emit(++rv.revision);
    },
    getChanges: function(start_revision) {
      var count = rv.revision - start_revision;
      var start = buf.length - count;
      if (start < 0) throw new Error("ChangeBuffer exhausted");
      return buf.slice(start);
    }
  };
  return rv;
};
