var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream } = require('sjs:sequence');
var { clone, propertyPairs, extend } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');
var { isObservable, get } = require('../observable');
var array = require('sjs:array');

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
   @class HtmlFragment
   @summary A tree structure representing a piece of Html along with meta information 
   @desc
     HTML_FRAGMENT      : QUASI | CFRAGMENT | ARRAY | UNSAFE_TXT | 
                          OBSERVABLE
     QUASI              : "`" QUASI_COMPONENT* "`"
     QUASI_COMPONENT    : LITERAL_TXT | "${" HTML_FRAGMENT "}"
     ARRAY              : "[" FRAGMENT_TREE_LIST? "]"
     FRAGMENT_TREE_LIST : HTML_FRAGMENT | FRAGMENT_TREE_LIST "," HTML_FRAGMENT  
     UNSAFE_TXT         : '"' STRING '"'
     OBSERVABLE         : an instance of [../observable::Observable] whose
                          value is a HtmlFragment
     LITERAL_TXT        : STRING
     CFRAGMENT          : an instance of class [::CollapsedFragment]


     Note: Observables are only allowed for content that will be used in 
     the 'dynamic world' (i.e. client-side).
*/

//----------------------------------------------------------------------
/**
   @class CollapsedFragment
   @summary Internal class representing a collapsed [::HtmlFragment] 
   @inherit ::HtmlFragment
*/
var CollapsedFragmentProto = {
  toString:        -> "html::CollapsedFragment [#{this.getHtml()}]",
  getHtml:         -> this.content,        // string
  getStyleDefs:    -> this.style,          // { style_id : [ref_count, def], ... }
  getMechanisms:   -> this.mechanisms,     // { mechanism_id : code, ... }
  getExternalScripts: -> this.externalScripts,     // { url: true, ... }
};

//helpers:
function initCollapsedFragment(f) {
  f.content = '';
  f.style = {};
  f.mechanisms = {};
  f.externalScripts = {};
}

function CollapsedFragment() {
  var rv = Object.create(CollapsedFragmentProto);
  initCollapsedFragment(rv);
  return rv;
}

/**
   @function isCollapsedFragment
*/
function isCollapsedFragment(obj) { return CollapsedFragmentProto.isPrototypeOf(obj); }
exports.isCollapsedFragment = isCollapsedFragment;


// helper
function joinCollapsedFragment(target, src) {
  target.content += src.getHtml();
  propertyPairs(src.getStyleDefs()) .. each { 
    |[id,def]|
    if (target.style[id])
      target.style[id] = [target.style[id][0]+def[0], def[1]];
    else
      target.style[id] = def;
  }
  target.mechanisms .. extend(src.getMechanisms());
  target.externalScripts .. extend(src.getExternalScripts());
}

/**
  @function collapseHtmlFragment
  @param {::HtmlFragment} [ft]
  @return {::CollapsedFragment}
*/

// helper mechanism for making observable content dynamic:
function ObservableContentMechanism(ft, obs) {
  return ft .. Mechanism(function(node) {
    obs.observe {
      |change|
      if (node.parentNode)
        (node .. require('./dynamic').replaceElement(obs));
    }
  });
}

function collapseHtmlFragment(ft) {
  var rv;

  if (isCollapsedFragment(ft)) {
    rv = ft;
  }
  else if (isObservable(ft)) { 
    // observables are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    rv = collapseHtmlFragment(ensureWidget(ft.get()) .. 
                              ObservableContentMechanism(ft));
  }
  else if (Array.isArray(ft) || isStream(ft)) {
    rv = ft .. 
      map(collapseHtmlFragment) ..
      reduce(CollapsedFragment(), function(c, p) {
        c .. joinCollapsedFragment(p);
        return c;
      });
  }
  else if (isQuasi(ft)) {
    rv = indexed(ft.parts) .. 
      reduce(CollapsedFragment(), function(c, [idx, val]) {
        if (idx % 2) {
          c .. joinCollapsedFragment(collapseHtmlFragment(val));
        }
        else // a literal value
          c.content += val;
        return c;
      }); 
  }
  else {
    rv = CollapsedFragment();
    if (ft !== undefined)
      rv.content += sanitize(String(ft));
  }
  
  return rv;
}
exports.collapseHtmlFragment = collapseHtmlFragment;

//----------------------------------------------------------------------
/**
   @class Widget
   @inherit ::CollapsedFragment
   @summary A [::HtmlFragment] rooted in a single HTML element
*/
var WidgetProto = Object.create(CollapsedFragmentProto);

WidgetProto.toString = function() {
  return "html::Widget [#{this.getHtml()}]";
};

WidgetProto._normalizeClasses = function() {
  // ensure the `class` attrib is an array
  var classes = this.attribs['class'];
  if (!Array.isArray(classes)) {
    classes = this.attribs['class'] = classes ? String(classes).split(" ") : [];
  }
  return classes;
};

var flattenAttrib = (val) -> Array.isArray(val) ? val .. join(" ") : String(val);

WidgetProto.getHtml = function() {
  return "<#{this.tag} #{ 
            propertyPairs(this.attribs) ..
            map([key,val] -> "#{key}=\"#{flattenAttrib(val).replace(/\"/g, '&quot;')}\"") ..
            join(' ')                     
          }>#{this.content}</#{this.tag}>";
};

WidgetProto.createElement = function() {
  // xbrowser env only
  var elem = document.createElement(this.tag);
  propertyPairs(this.attribs) .. each {
    |[name,val]|
    elem.setAttribute(name, flattenAttrib(val));
  }
  elem.innerHTML = this.content;
  return elem;
};

function initWidget(w, tag, attribs) {
  initCollapsedFragment(w);
  w.tag = tag;
  w.attribs = {};
  if (attribs) w.attribs .. extend(attribs);
}

/**
   @function Widget
   @param {String} [tag]
   @param {::HtmlFragment} [content]
   @return {::Widget}
*/
function Widget(tag, content, attribs) {
  var rv = Object.create(WidgetProto);
  initWidget(rv, tag, attribs);
  if (content !== undefined)
    rv .. joinCollapsedFragment(collapseHtmlFragment(content));

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
    ft = Widget('surface-ui', ft);
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
  rv.externalScripts = clone(ft.getExternalScripts());
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
   @summary Add style to a widget 
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

    var classes = ft._normalizeClasses();
    if (classes.indexOf('_oni_style_') == -1)
      classes.push(' _oni_style_');
    if (classes.indexOf(class_name) == -1) 
      classes.push(class_name);
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
   @summary Add an external stylesheet to a widget
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

    var classes = ft._normalizeClasses();
    if (classes.indexOf('_oni_style_') == -1)
      classes.push(' _oni_style_');
    if (classes.indexOf(class_name) == -1) 
      classes.push(class_name);
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
   @summary Add a mechanism to a widget 
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

    var classes = ft._normalizeClasses();
    if (classes.indexOf('_oni_mech_') == -1)
      classes.push(' _oni_mech_');
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

//----------------------------------------------------------------------

function Class(widget, clsname, val) {
  var widget = cloneWidget(widget);

  var classes = widget._normalizeClasses();
  if (arguments.length > 2) {
    // val is provided, treat it as a boolean toggle
    if (isObservable(val)) {
      widget = widget .. Mechanism {|elem|
        var cl = elem.classList;
        val.observe {|change|
          if (val.get()) cl.add(clsname);
          else cl.remove(clsname);
        }
      }
    } else {
      // regular value
      if (val) classes.push(clsname);
      else classes .. array.remove(clsname);
    }
  } else {
    classes.push(clsname);
  }

  return widget;
}
exports.Class = Class;

//----------------------------------------------------------------------

function setAttribValue(widget, name, v) {
  if (typeof v === 'boolean') {
    if (v) widget.attribs[name] = 'true';
    // else leave out attribute
  }
  else {
    widget.attribs[name] = String(v);
  }
}

function ObservableAttribMechanism(ft, name, obs) {
  return ft .. Mechanism(function(node) {
    obs.observe {
      |change|
      if (typeof get(obs) == 'boolean') {
        if (get(obs)) 
          node.setAttribute(name, 'true');
        else
          node.removeAttribute(name);
      }
      else {
        node.setAttribute(name, get(val));
      }
    }
  });
}

// XXX 'value' can be an observable, but only in the dynamic world; if
// the user tries to use the generated content with
// e.g. static::Document, an error will be thrown.
function Attrib(widget, name, value) {
  var widget = cloneWidget(widget);
  if (isObservable(value)) {
    setAttribValue(widget, name, value.get());
    return widget .. ObservableAttribMechanism(name, value);
  }
  else {
    setAttribValue(widget, name, value);
    return widget;
  }
}
exports.Attrib = Attrib;

//----------------------------------------------------------------------

exports.Id = (widget, id) -> Attrib(widget, 'id', id);

//----------------------------------------------------------------------

exports.Unescaped = (str) -> Quasi([str]);

//----------------------------------------------------------------------

exports.Markdown = (str, settings) -> exports.Unescaped(require('sjs:marked').convert(str, settings));

//----------------------------------------------------------------------

exports.RequireExternalScript = function(url) {
  var rv = CollapsedFragment();
  rv.externalScripts[url] = true;
  return rv;
};
