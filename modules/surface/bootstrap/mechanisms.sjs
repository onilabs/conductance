var dom = require('sjs:xbrowser/dom');

// dom module backfill:

function domFindData(name, value, from, to) {
// no 'dataset' property on IE9!
//  traverseDOM(from, to) { |c| if (value.indexOf(c.dataset[name]) != -1) return c }
  dom.traverseDOM(from, to) { |c| if (c.getAttribute && (value.indexOf(c.getAttribute("data-#{name}")) != -1)) return c }
  return null;
}

exports.dropdowns = function(parent) {
  var ignore = false;
  using (var Q = dom.eventQueue(parent, 'click', function (e){
    if ((e.node = domFindData('toggle', 'dropdown', e.target, parent))) {
      dom.stopEvent(e);
      if (ignore) { // see explanation below
        ignore = false;
        return false;
      }          
      return true;
    }
    else
      return false;
  })) {
    while (1) {
      var ev = Q.get();
      var current = ev.node;
      current.parentNode.classList.add('open');
      try {
        ev = dom.waitforEvent(window, '!click');
        if (domFindData('toggle', 'dropdown', ev.target, parent) == current) {
          // we could stop the event here, to prevent the dropdown from reappearing, 
          // but that is bad form: there might be other capturing listenern that 
          // clear some state, so we should *never* stop events during the capturing
          // phase
          // dom.stopEvent(ev);
          // Instead we set a flag that ignores the next event:
          ignore = true;
        }
      }
      finally {
        current.parentNode.classList.remove('open');
      }
    }
  }  
};

exports.dismissAlerts = function(parent) {
  using (var Q = dom.eventQueue(parent, 'click', function(e) {
    if (e.node = domFindData('dismiss', 'alert', e.target, parent)) {
      dom.stopEvent(e);
      return true;
    }
    else 
      return false;
  })) {
    while (1) {
      var ev = Q.get();
      var target = dom.findNode('.alert', ev.node);
      //target.classList.remove('in');
      target.parentNode.removeChild(target);
    }
  }
};
