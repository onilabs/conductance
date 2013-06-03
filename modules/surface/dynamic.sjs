//----------------------------------------------------------------------
// dynamic surface:
// if hostenv == xbrowser

var { ensureWidget } = require('./html');
var { propertyPairs } = require('sjs:object');
var { toArray, map, filter, each, reverse, combine } = require('sjs:sequence');
var { split } = require('sjs:string');

//----------------------------------------------------------------------
// global ref counted resource registry that adds/removes resources to
// the document
var stylesInstalled = {};
var mechanismsInstalled = {};

var resourceRegistry = {
  useStyleDefs: function(defs) {
    propertyPairs(defs) .. each {
      |[id, [cnt,def]]|
      var desc;
      if (!(desc = stylesInstalled[id])) {
        desc = stylesInstalled[id] = { ref_count: cnt, elem: def.createElement() };
        (document.head || document.getElementsByTagName("head")[0] /* IE<9 */).appendChild(desc.elem);
      }
      else {
        desc.ref_count += cnt;
      }
    }   
  },
  unuseStyle: function(id) {
    console.log("Unusing style #{id}");
    var desc = stylesInstalled[id];
    if (!desc) console.log("Warning: Trying to unuse unknown style #{id}")
    if (--desc.ref_count === 0) {
      // XXX might actually want to cache this for a while
      desc.elem.parentNode.removeChild(desc.elem);
      delete stylesInstalled[id];
    }
  },

  useMechanisms: function(mechs) {
    propertyPairs(mechs) .. each {
      |[id, code]|
      var desc;
      if (!(desc = mechanismsInstalled[id])) {
        desc = mechanismsInstalled[id] = {
          ref_count: 1,
          func: require('builtin:apollo-sys').eval("(function(){#{code}})")
        };
      }
      else {
        ++desc.ref_count;
      }
    }
  },
  unuseMechanisms: function(ids) {
    ids .. each {
      |id|
      var desc = mechanismsInstalled[id];
      --desc.ref_count;
      /*
        we don't actually want to purge the mechanism immediately... we want 
        to cache mechanisms for a while

        XXX implement lru caching or something similar

      if (--desc.ref_count === 0) {
        delete mechanismsInstalled[id];
      }
      */
    }
  },

};
exports.resourceRegistry = resourceRegistry;


//----------------------------------------------------------------------
// main dynamic api

function appendHtml(parent_node, ft) {
  ft = ensureWidget(ft);
  
  var elem = ft.createElement();

  // install styles:
  var styles = ft.getStyleDefs();
  resourceRegistry.useStyleDefs(styles);

  // install mechanisms:
  var mechs = ft.getMechanisms();
  resourceRegistry.useMechanisms(mechs);

  try {
    parent_node.appendChild(elem);

    // run mechanisms:
    try {
      (elem.querySelectorAll('[data-oni-mechanisms]') || []) ..
        combine(elem.hasAttribute('data-oni-mechanisms') ? [elem] : []) ..
        reverse .. // we want to start mechanisms in post-order; querySelectorAll is pre-order
        each {
          |elem|
          elem.__oni_mechs = [];
          elem.getAttribute('data-oni-mechanisms').split(' ') ..
            filter .. // only truthy elements
            each {
              |mech|
              elem.__oni_mechs.push(spawn mechanismsInstalled[mech].func.apply(elem));
            }
        }
    }
    finally {
      // now they have been run, we can tell the resource registry to
      // remove the mechanisms again
      resourceRegistry.unuseMechanisms(propertyPairs(mechs) .. map([id, code] -> id) .. toArray);
    }
  }
  catch(e) {
    removeElement(elem);
    throw e;
  }
  return elem;
}
exports.appendHtml = appendHtml;

function removeElement(elem) {
  // stop all mechanisms below us:
  combine([elem], elem.querySelectorAll('._oni_mech_') || []) ..
    each {
      |elem|
      (elem.__oni_mechs || []) .. each {
        |stratum|
        stratum.abort();
      }
      delete elem.__oni_mechs;
    }

  if (elem.parentNode)
    elem.parentNode.removeChild(elem);
  
  // unuse all styles below us
  combine([elem], elem.querySelectorAll('._oni_style_') || []) ..
    each {
      |elem|
      elem.getAttribute('class') .. split(' ') .. each {
        |cls|
        var matches = /_oni_style(\d+)_/.exec(cls);
        if (!matches) continue;
        resourceRegistry.unuseStyle(matches[1]);
      }
    }
}
exports.removeElement = removeElement;


function withHtml(parent_node, ft, block) {
  var elem = parent_node .. appendHtml(ft);
  try {
    block(elem);
  }
  finally {
    removeElement(elem);
  }
}
exports.withHtml = withHtml;

