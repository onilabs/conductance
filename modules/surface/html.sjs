var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream } = require('sjs:sequence');
var { extend, propertyPairs } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');

//----------------------------------------------------------------------
/**
   @class FragmentTree
   @summary A tree structure representing a piece of Html along with meta information 
   @desc
     FRAGMENT_TREE      : QUASI | FRAGMENT | ARRAY | UNSAFE_TXT
     QUASI              : "`" QUASI_COMPONENT* "`"
     QUASI_COMPONENT    : LITERAL_TXT | "${" FRAGMENT_TREE "}"
     ARRAY              : "[" FRAGMENT_TREE_LIST? "]"
     FRAGMENT_TREE_LIST : FRAGMENT | FRAGMENT_TREE_LIST "," FRAGMENT  
     UNSAFE_TXT         : '"' STRING '"'
     LITERAL_TXT        : STRING
     FRAGMENT           : an instance of class [::Fragment]
*/

//----------------------------------------------------------------------
/**
   @class Fragment
*/
var FragmentProto = {
  toString:        -> "html::Fragment [#{this.getHtml()}]",
  getHtml:         -> this.content,        // string
  getStyleDefs:    -> this.style,          // { style_id : def, ... }
  getMechanisms:   -> this.mechanisms,     // { mechanism_id : code, ... }
  getMechanismUses:-> this.mechanism_uses, // [ [mechanism_id, use_id], ... ]
};

//helpers:
function initFragment(f) {
  f.content = '';
  f.style = {};
  f.mechanisms = {};
  f.mechanism_uses = [];
}

function Fragment() {
  var rv = Object.create(FragmentProto);
  initFragment(rv);
  return rv;
}

/**
   @function isFragment
*/
function isFragment(obj) { return FragmentProto.isPrototypeOf(obj); }
exports.isFragment = isFragment;


// helper
function joinFragment(target, src) {
  target.content += src.getHtml();
  target.style .. extend(src.getStyleDefs());
  target.mechanisms .. extend(src.getMechanisms());
  target.mechanism_uses = src.getMechanismUses().concat(target.mechanism_uses);
}

/**
  @function collapseFragmentTree
  @param {::FragmentTree} [ft]
  @return {::Fragment}
*/
function collapseFragmentTree(ft) {
  var rv;

  if (isFragment(ft)) {
    rv = ft;
  }
  else if (isString(ft)) {
    rv = Fragment();
    rv.content += sanitize(ft);
  }
  else if (Array.isArray(ft) || isStream(ft)) {
    rv = ft .. 
      map(collapseFragmentTree) ..
      reduce(Fragment(), function(c, p) {
        c .. joinFragment(p);
        return c;
      });
  }
  else if (isQuasi(ft)) {
    rv = indexed(ft.parts) .. 
      reduce(Fragment(), function(c, [idx, val]) {
        if (idx % 2) {
          c .. joinFragment(collapseFragmentTree(val));
        }
        else // a literal value
          c.content += val;
        return c;
      }); 
  }
  else 
    throw new Error("Unsupported object '#{ft}' of type '#{typeof(ft)}' in fragment tree");
  
  return rv;
}
exports.collapseFragmentTree = collapseFragmentTree;

//----------------------------------------------------------------------
/**
   @class Widget
   @inherit ::Fragment
*/
var WidgetProto = Object.create(FragmentProto);

WidgetProto.toString = function() {
  return "html::Fragment [#{this.getHtml()}]";
};

WidgetProto.getHtml = function() {
  return "<#{this.tag} #{ 
            propertyPairs(this.attribs) ..
            map([key,val] -> "#{key}=\"#{val.replace(/\"/g, '&quot;')}\"") ..
            join(' ')                     
          }>#{this.content}</#{this.tag}>";
};

WidgetProto.createElement = function() {
  // xbrowser env only
  var elem = document.createElement(this.tag);
  propertyPairs(this.attribs) .. each {
    |[name,val]|
    elem.setAttribute(name, val);
  }
  elem.innerHTML = this.content;
  return elem;
};

function initWidget(w, tag, attribs) {
  initFragment(w);
  w.tag = tag || 'surface-ui';
  w.attribs = attribs || {};
}

/**
   @function Widget
   @param {::FragmentTree} [content]
   @return {::Widget}
*/
function Widget(content, tag, attribs) {
  var rv = Object.create(WidgetProto);
  initWidget(rv, tag, attribs);
  rv .. joinFragment(collapseFragmentTree(content));

  return rv;
}
exports.Widget = Widget;

/** 
   @function isWidget
*/
function isWidget(obj) { return WidgetProto.isPrototypeOf(obj); }
exports.isWidget = isWidget;

/**
   @function ensureWidget
*/
function ensureWidget(ft) {
  if (!isWidget(ft))
    ft = Widget(ft);
  return ft;
}
exports.ensureWidget = ensureWidget;


//----------------------------------------------------------------------

// Style classes

var InternalStyleDefProto = {
  // XXX this needs some sanitizing!
  getHtml: -> "<style type='text/css'>#{this.content}</style>",
  createElement: function() {
    // xbrowser env only
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');
    if (elem.styleSheet) {
      // IE
      elem.styleSheet.cssText = this.content;
    } else {
      elem.appendChild(document.createTextNode(this.content));
    }
    return elem;
  }
};

function InternalStyleDef(content, parent_class) {
  var rv = Object.create(InternalStyleDefProto);
  rv.content = scope(content, parent_class);
  return rv;
}

/**
   @function Style
   @summary Add style to a fragment XXX
*/


var style_counter = 0;

function Style(/* [opt] ft, style */) {
  var id = ++style_counter, styledef;
  // XXX should distinguish between client-side/server-side style here:
  var class_name = "_oni_style#{id}_";

  function setStyle(ft) {
    ft = ensureWidget(ft);
    ft.style[id] = styledef;
    var classes = ft.attribs['class'] || '';
    if (classes.indexOf(class_name) == -1) 
      classes += " "+class_name;
    ft.attribs['class'] = classes;
    return ft;
  }

  if (arguments.length == 1) {
    styledef = InternalStyleDef(arguments[0], class_name);
    return setStyle;
  }
  else /* if (arguments == 2) */{
    styledef = InternalStyleDef(arguments[1], class_name);
    return setStyle(arguments[0]);
  }
}
exports.Style = Style;

var ExternalStyleDefProto = {
  // XXX this needs some sanitizing!
  getHtml: -> "<link rel='stylesheet' href='#{this.url}'>",
  createElement: function() {
    // xbrowser env only
    var elem = document.createElement('link');
    elem.setAttribute('rel', 'stylesheet');
    elem.setAttribute('href', this.url);
    return elem;
  }
};

function ExternalStyleDef(url, parent_class) {
  var rv = Object.create(ExternalStyleDefProto);
  rv.url = buildUrl(url, {scope:parent_class});
  return rv;
}

/**
   @function RequireStyle
   @summary Add an external stylesheet to a fragment XXX
*/


function RequireStyle(/* [opt] ft, url */) {
  var id = ++style_counter, styledef;
  // XXX should distinguish between client-side/server-side style here:
  var class_name = "_oni_style#{id}_";

  function setStyle(ft) {
    ft = ensureWidget(ft);
    ft.style[id] = styledef;
    var classes = ft.attribs['class'] || '';
    if (classes.indexOf(class_name) == -1) 
      classes += " "+class_name;
    ft.attribs['class'] = classes;
    return ft;
  }

  if (arguments.length == 1) {
    styledef = ExternalStyleDef(arguments[0], class_name);
    return setStyle;
  }
  else /* if (arguments == 2) */{
    styledef = ExternalStyleDef(arguments[1], class_name);
    return setStyle(arguments[0]);
  }
}
exports.RequireStyle = RequireStyle;



//----------------------------------------------------------------------

/**
   @function Mechanism
   @summary Destructively add a mechanism to a html fragment 
*/
var mechanism_counter = 0;
var mechanism_use_counter = 0;
function Mechanism(/* [opt} ft, code */) {
  var id = ++mechanism_counter, code;

  function setMechanism(ft) {
    ft = ensureWidget(ft);
    ft.mechanisms[id] = code;
    var use_id = ++mechanism_use_counter;
    ft.mechanism_uses.unshift([id, use_id]);

    if(!ft.attribs['data-oni-mechanism'])
      ft.attribs['data-oni-mechanism'] = String(use_id);
    else 
      ft.attribs['data-oni-mechanism'] += ' '+use_id;

    return ft;
  }

  if (arguments.length == 1) {
    code = arguments[0];
    return setMechanism;
  }
  else /* if (arguments == 2) */ {
    code = arguments[1];
    return setMechanism(arguments[0]);
  }
}
exports.Mechanism = Mechanism;
