var dom    = require('sjs:xbrowser/dom');
var events = require('sjs:events');
var { each, find } = require('sjs:sequence');

// dom module backfill:

function domFindData(name, value, from, to) {
// no 'dataset' property on IE9!
//  traverseDOM(from, to) { |c| if (value.indexOf(c.dataset[name]) != -1) return c }
  dom.traverseDOM(from, to) { |c| if (c.getAttribute && (value.indexOf(c.getAttribute("data-#{name}")) != -1)) return c }
  return null;
}

exports.dropdowns = function(parent) {
  var ignore = false;
  using (var Q = events.Queue(events.HostEmitter(parent, 'click', function (e){
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
  }))) {
    while (1) {
      var ev = Q.get();
      var current = ev.node;
      current.parentNode.classList.add('open');
      try {
        ev = events.wait(window, '!click');
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
  using (var Q = events.Queue(events.HostEmitter(parent, 'click', function(e) {
    if (e.node = domFindData('dismiss', 'alert', e.target, parent)) {
      dom.stopEvent(e);
      return true;
    }
    else 
      return false;
  }))) {
    while (1) {
      var ev = Q.get();
      var target = dom.findNode('.alert', ev.node);
      //target.classList.remove('in');
      target.parentNode.removeChild(target);
    }
  }
};

exports.tabbing = function(parent) {
  using (var Q = events.Queue(events.HostEmitter(parent, 'click', function(e) {
    if (domFindData('toggle', ['tab','pill'], e.target, parent)) {
      dom.stopEvent(e);
      return true;
    }
    else
      return false;
  }))) {
    while (1) {
      var ev = Q.get();
      // ev.target is the <a> we want to activate
      var newTab = dom.findNode('li', ev.target);
      if (newTab.classList.contains('active')) continue;
      var tabContainer = dom.findNode('ul:not(.dropdown-menu)', ev.target);
      // deactivate current tab...
      var currentTab = tabContainer.querySelector('li.active');
      currentTab.classList.remove('active');
      // ... and activate  the new one
      newTab.classList.add('active');
      
      // special case for dropdowns within tabs:
      var olddropdown = currentTab.querySelector('.dropdown-menu > .active');
      if (olddropdown) 
        olddropdown.classList.remove('active');
      if (newTab.parentNode.classList.contains('dropdown-menu'))
        dom.findNode('li.dropdown', newTab).classList.add('active');
      
      // now switch to new content:
      var newContent = tabContainer.parentNode.querySelector(ev.target.getAttribute('data-target') || ev.target.getAttribute('href'));
      
      var oldContent = newContent.parentNode.querySelector('.active');
      oldContent.classList.remove('active');
      newContent.classList.add('active');
    }
  }
};


// dom module or dom-shim backfill:
var transitionEndEvent = 
  ([['transition', 'transitionend'],
    ['WebkitTransition', 'webkitTransitionEnd'],
    ['MozTransition', 'transitionend']] ..
   find([styleprop, eventname] -> document.body.style[styleprop] !== undefined, 
        [,undefined])
  )[1];

exports.accordion = function(parent) {
  events.HostEmitter(parent, 'click', function(e) { 
    if (domFindData('toggle', 'accordion', e.target, parent)) {
      dom.stopEvent(e);
      return true;
    }
    else 
      return false;
  }) ..
    events.Stream ..
    each {
      |ev|

      var selected_group = dom.findNode('.accordion-group', ev.target, parent);
      var selected_body = selected_group.querySelector('.accordion-body');
      var old_body = parent.querySelector('.accordion-body.in');

      // simultaneously animate in & out:
      // unfortunately CSS can't animate from 'auto' values, so this
      // is a bit convoluted
      waitfor {
        if (old_body) {
          if (transitionEndEvent) {
            // *sigh* need to temporarily remove 'collapse' class to
            // prevent animation
            old_body.classList.remove('collapse'); 
            old_body.style.height = "#{old_body.offsetHeight}px";
            // force reflow for new height to filter through:
            var forceReflow = old_body.offsetHeight;
            old_body.classList.add('collapse');
            old_body.classList.remove('in');
            old_body.style.height = null;
            waitfor {
              old_body .. events.wait(transitionEndEvent);
            }
            or {
              // the timeout makes it robust; in case the
              // transitionendevent isn't firing for some reason
              // (style removed, etc)
              hold(500);
            }
          }
          else {
            // browser doesn't support transition effects
            old_body.classList.remove('in');
          }
        }
      }
      and {
        if (old_body !== selected_body) {
          selected_body.classList.add('in');
          if (transitionEndEvent) {
            waitfor {
              // can't just do this:
              //selected_body.style.height = "#{selected_body.offsetHeight}px";
              // ff needs an explicit '0px' as starting point
              var h = selected_body.offsetHeight;
              selected_body.style.height = '0px';
              var forceReflow = selected_body.offsetHeight;
              selected_body.style.height = "#{h}px";
              selected_body .. events.wait(transitionEndEvent);
            }
            or {
              // the timeout makes it robust; in case the
              // transitionendevent isn't firing for some reason
              // (style removed, etc)
              hold(500);
            }
            finally {
              // *sigh* need to temporarily remove 'collapse' class to
              // prevent another animation
              selected_body.classList.remove('collapse'); 
              selected_body.style.height = null;
              // force reflow for new height to filter through:
              var forceReflow = selected_body.offsetHeight;
              selected_body.classList.add('collapse');
            }        
          }
        }
      }
    }
};
