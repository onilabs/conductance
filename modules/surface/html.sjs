var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream } = require('sjs:sequence');
var { clone, propertyPairs, extend } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');

//----------------------------------------------------------------------
// counters which will be used to generate style & mechanism ids

// To keep the static & dynamic worlds from colliding, we initialize
// these from the global variable __oni_surface_init if present (it is
// added for static documents - see static.sjs::Document)

var gStyleCounter = 0;
var gMechanismCounter = 0;

if (typeof __oni_surface_init !== 'undefined') {
  [gStyleCounter, gMechanismCounter] = __oni_surface_init;
}

exports._getDynOniSurfaceInit = -> 
  "__oni_surface_init = [#{gStyleCounter+1}, #{gMechanismCounter+1}];";

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
  getStyleDefs:    -> this.style,          // { style_id : [ref_count, def], ... }
  getMechanisms:   -> this.mechanisms,     // { mechanism_id : code, ... }
};

//helpers:
function initFragment(f) {
  f.content = '';
  f.style = {};
  f.mechanisms = {};
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
  propertyPairs(src.getStyleDefs()) .. each { 
    |[id,def]|
    if (target.style[id])
      target.style[id] = [target.style[id][0]+def[0], def[1]];
    else
      target.style[id] = def;
  }
  target.mechanisms .. extend(src.getMechanisms());
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
  else {
    rv = Fragment();
    rv.content += sanitize(String(ft));
  }
  
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
  w.attribs = {};
  if (attribs) w.attribs .. extend(attribs);
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

/**
  @function cloneWidget
*/
function cloneWidget(ft) {
  if (!isWidget(ft)) return ensureWidget(ft);
  var rv = Object.create(WidgetProto);
  initWidget(rv, ft.tag, ft.attribs);
  rv.content = ft.content;
  rv.style = clone(ft.getStyleDefs());
  rv.mechanisms = clone(ft.getMechanisms());
  return rv;
}
exports.cloneWidget = cloneWidget;

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
   @summary Add style to a fragment 
*/



function Style(/* [opt] ft, style */) {
  var id = ++gStyleCounter, styledef;
  var class_name = "_oni_style#{id}_";

  function setStyle(ft) {
    ft = cloneWidget(ft);

    if (!ft.style[id])
      ft.style[id] = [1,styledef];
    else
      ft.style[id] = [ft.style[id][0]+1, styledef];

    var classes = ft.attribs['class'] || '';
    if (classes.indexOf('_oni_style_') == -1)
      classes += ' _oni_style_';
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
   @summary Add an external stylesheet to a fragment
*/


function RequireStyle(/* [opt] ft, url */) {
  var id = ++gStyleCounter, styledef;
  var class_name = "_oni_style#{id}_";

  function setStyle(ft) {
    ft = cloneWidget(ft);

    if (!ft.style[id])
      ft.style[id] = [1,styledef];
    else
      ft.style[id] = [ft.style[id][0]+1, styledef];

    var classes = ft.attribs['class'] || '';
    if (classes.indexOf('_oni_style_') == -1)
      classes += ' _oni_style_';
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
   @summary Add a mechanism to a html fragment 
*/
function Mechanism(/* [opt] ft, code */) {
  var id = ++gMechanismCounter, code;

  function setMechanism(ft) {
    ft = cloneWidget(ft);

    ft.mechanisms[id] = code;

    if(!ft.attribs['data-oni-mechanisms'])
      ft.attribs['data-oni-mechanisms'] = String(id);
    else 
      ft.attribs['data-oni-mechanisms'] += ' '+id;

    var classes = ft.attribs['class'] || '';
    if (classes.indexOf('_oni_mech_') == -1)
      classes += ' _oni_mech_';
    ft.attribs['class'] = classes;

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
