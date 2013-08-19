var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream } = require('sjs:sequence');
var { clone, propertyPairs, extend } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');
var { isObservable, get } = require('../observable');
var array = require('sjs:array');
var func = require('sjs:function');

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
var FragmentBase = {
  appendTo: function(target) {
    target.style .. extendStyle(this.style);
    target.mechanisms .. extend(this.mechanisms);
    target.externalScripts .. extend(this.externalScripts);
  },
  _init: function() {
    this.style = {};
    this.mechanisms = {};
    this.externalScripts = {};
  },
};

/**
   @class CollapsedFragment
   @summary Internal class representing a collapsed [::HtmlFragment]
   @inherit ::HtmlFragment
*/
var CollapsedFragmentProto = Object.create(FragmentBase);

CollapsedFragmentProto .. extend({
  toString:        -> "html::CollapsedFragment [#{this.getHtml()}]",
  getHtml:         -> this.content,        // string
  getStyleDefs:    -> this.style,          // { style_id : [ref_count, def], ... }
  getMechanisms:   -> this.mechanisms,     // { mechanism_id : code, ... }
  getExternalScripts: -> this.externalScripts,     // { url: true, ... }
  appendTo: func.seq(CollapsedFragmentProto.appendTo, function(target) {
    target.content += this.content;
  }),
  _init: func.seq(CollapsedFragmentProto._init, function() {
    this.content = "";
  }),
});

function extendStyle(target, src) {
  propertyPairs(src) .. each {
    |[id,def]|
    if (target[id])
      target[id] = [target[id][0]+def[0], def[1]];
    else
      target[id] = def;
  }
};

//helpers:
function CollapsedFragment() {
  var rv = Object.create(CollapsedFragmentProto);
  rv._init();
  return rv;
}

/**
   @function isCollapsedFragment
*/
function isCollapsedFragment(obj) { return CollapsedFragmentProto.isPrototypeOf(obj); }
function isFragment(obj) { return FragmentBase.isPrototypeOf(obj); }


/**
  @function collapseHtmlFragment
  @param {::HtmlFragment} [ft]
  @return {::CollapsedFragment}
*/

// helper mechanism for making observable content dynamic:
function ObservableContentMechanism(ft, obs) {
  return ft .. Mechanism(function(node) {
    obs.observe { ||
      if (node.parentNode)
        (node .. require('./dynamic').replaceElement(obs));
    }
  });
}

function collapseHtmlFragment(ft) {
  var rv;

  if (isCollapsedFragment(ft)) {
    return ft;
  } else {
    rv = CollapsedFragment();
  }

  if (isFragment(ft)) {
    ft.appendTo(rv);
  }
  else if (isObservable(ft)) {
    // observables are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    (ensureWidget(ft.get()) .. ObservableContentMechanism(ft)).appendTo(rv);
  }
  else if (Array.isArray(ft) || isStream(ft)) {
    ft ..
      map(collapseHtmlFragment) ..
      each(p -> p.appendTo(rv));
  }
  else if (isQuasi(ft)) {
    indexed(ft.parts) ..
      each { |[idx, val]|
        if (idx % 2) {
          collapseHtmlFragment(val).appendTo(rv);
        }
        else // a literal value
          rv.content += val;
      };
  }
  else {
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
var WidgetProto = Object.create(FragmentBase);

WidgetProto._init = func.seq(WidgetProto._init, function(tag, content, attribs) {
  this.tag = tag;
  this.attribs = {};
  if (attribs) this.attribs .. extend(attribs);
  this.content = content;
});

WidgetProto.toString = function() {
  return "html::Widget [#{collapseHtmlFragment(this).getHtml()}]";
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

WidgetProto.appendTo = function(target) {
  target.content += "<#{this.tag} #{
            propertyPairs(this.attribs) ..
            map([key,val] -> "#{key}=\"#{flattenAttrib(val).replace(/\"/g, '&quot;')}\"") ..
            join(' ')
          }>"
  this._appendInner(target);
  target.content += "</#{this.tag}>";
};

WidgetProto._appendInner = func.seq(FragmentBase.appendTo, function(target) {
  // append inner contents (as well as adding this widget's styles, mechanisms, etc)
  collapseHtmlFragment(this.content).appendTo(target);
});

WidgetProto.createElement = function() {
  // xbrowser env only
  var elem = document.createElement(this.tag);
  propertyPairs(this.attribs) .. each {
    |[name,val]|
    elem.setAttribute(name, flattenAttrib(val));
  }
  // content is a collapsedFragment without our outer tag
  var content = CollapsedFragment();
  this._appendInner(content);
  return [elem, content];
};

/**
   @function Widget
   @param {String} [tag]
   @param {::HtmlFragment} [content]
   @return {::Widget}
*/
function Widget(tag, content, attribs) {
  var rv = Object.create(WidgetProto);
  rv._init.apply(rv, arguments);
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
  rv._init(ft.tag, ft.content, ft.attribs);
  rv.style = clone(ft.style);
  rv.mechanisms = clone(ft.mechanisms);
  rv.externalScripts = clone(ft.externalScripts);
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
    if (get(val)) classes.push(clsname);
    else classes .. array.remove(clsname);

    if (isObservable(val)) {
      widget = widget .. Mechanism {|elem|
        var cl = elem.classList;
        val.observe {|v|
          if (v) cl.add(clsname);
          else cl.remove(clsname);
        }
      }
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
      |v|
      if (typeof v == 'boolean') {
        if (v)
          node.setAttribute(name, 'true');
        else
          node.removeAttribute(name);
      }
      else {
        node.setAttribute(name, v);
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
