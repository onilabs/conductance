var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream } = require('sjs:sequence');
var { clone, propertyPairs, extend } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');
var { isObservable, get, observe } = require('../observable');
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
  "__oni_surface_init = [#{gStyleCounter+1}, #{gMechanismCounter+1}];\n";


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
__js var FragmentBase = {
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

__js CollapsedFragmentProto .. extend({
  toString:        -> "html::CollapsedFragment [#{this.content}]",
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

__js function extendStyle(target, src) {
  propertyPairs(src) .. each(function([id,def]) {
    if (target[id])
      target[id] = [target[id][0]+def[0], def[1]];
    else
      target[id] = def;
  })
};

//helpers:
__js function CollapsedFragment() { 
  var rv = Object.create(CollapsedFragmentProto);
  rv._init();
  return rv;
}

/**
   @function isCollapsedFragment
*/
__js function isCollapsedFragment(obj) { return CollapsedFragmentProto.isPrototypeOf(obj); }
__js function isFragment(obj) { return FragmentBase.isPrototypeOf(obj); }


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

// internal function used by collapseHtmlFragment()
function appendFragmentTo(target, ft, tag) { 
  if (isQuasi(ft)) {
    for (var idx=0,l=ft.parts.length;idx<l;++idx) {
      var val = ft.parts[idx];
      if (idx % 2) {
        appendFragmentTo(target, val, tag);
      }
      else {// a literal value 
        target.content += val;
      }
    }
  }
  else if (isFragment(ft)) {
    return ft.appendTo(target, tag);
  }
  else if (isObservable(ft)) {
    // observables are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    (ensureWidget(ft.get()) .. ObservableContentMechanism(ft)).appendTo(target);
  }
  else if (Array.isArray(ft) || isStream(ft)) {
    ft .. each(p -> appendFragmentTo(target, p, tag));
  }
  else {
    if (ft !== undefined)
      target.content += escapeForTag(ft, tag);
  }
}

__js {
  function escapeForTag(s, tag) {
    switch(tag) {
    case 'script':
      return String(s).replace(/\<\//g, '\\x3C/');
      break;
    case 'style':
      return String(s).replace(/\</g, '\\<');
      break;
    default:
      return sanitize(String(s));
      break;
    }
  }
  exports.escapeForTag = escapeForTag;
}

function collapseHtmlFragment(ft, tag) {
  if (isCollapsedFragment(ft)) return ft;
  var rv = CollapsedFragment();
  appendFragmentTo(rv, ft, tag);
  return rv;
}
  
exports.collapseHtmlFragment = collapseHtmlFragment;

//----------------------------------------------------------------------
/**
   @class Widget
   @inherit ::CollapsedFragment
   @summary A [::HtmlFragment] rooted in a single HTML element
*/
__js var WidgetProto = Object.create(FragmentBase);

__js WidgetProto._init = func.seq(WidgetProto._init, function(tag, content, attribs) { 
  this.tag = tag;
  // XXX do we need to copy attribs?
  // probably not here, because we always clone before we modify anything
  this.attribs = attribs ? attribs : {};
//  if (attribs) this.attribs .. extend(attribs);
  this.content = content;
});

__js WidgetProto.toString = function() {
  return "html::Widget[#{this.tag}]";
};

__js WidgetProto._normalizeClasses = function() {
  // ensure the `class` attrib is an array
  var classes = this.attribs['class'];
  if (!Array.isArray(classes)) {
    classes = this.attribs['class'] = classes ? String(classes).split(" ") : [];
  }
  return classes;
};

__js var flattenAttrib = (val) -> Array.isArray(val) ? val .. join(" ") : String(val);

WidgetProto.appendTo = function(target) {
  target.content += "<#{this.tag} #{
            propertyPairs(this.attribs) ..
            map([key,val] -> "#{key}=\"#{flattenAttrib(val).replace(/\"/g, '&quot;')}\"") ..
            join(' ')
          }>";
  this._appendInner(target);
  target.content += "</#{this.tag}>";
};

WidgetProto._appendInner = func.seq(FragmentBase.appendTo, function(target) {
  // append inner contents (as well as adding this widget's styles, mechanisms, etc)
  if (this.content != null) {
    appendFragmentTo(target, this.content, this.tag);
  }
});

WidgetProto.createElement = function() { 
  // xbrowser env only
  var elem = document.createElement(this.tag);
  propertyPairs(this.attribs) .. each(
    function([name,val]) {
      elem.setAttribute(name, flattenAttrib(val));
    }
  )
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
__js {
  function Widget(tag, content, attribs) {
    var rv = Object.create(WidgetProto);
    rv._init.apply(rv, arguments);
    return rv;
  }
  exports.Widget = Widget;
}

/**
   @function isWidget
*/
__js {
  function isWidget(obj) { return WidgetProto.isPrototypeOf(obj); }
  exports.isWidget = isWidget;
}

/**
   @function ensureWidget
*/
__js {
  function ensureWidget(ft) {
    if (!isWidget(ft))
      ft = Widget('surface-ui', ft);
    return ft;
  }
  exports.ensureWidget = ensureWidget;
}

/**
  @function cloneWidget
*/
__js {
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
}

//----------------------------------------------------------------------

// Style classes

__js var InternalStyleDefProto = {
  getHtml: -> "<style type='text/css'>#{escapeForTag(this.content, 'style')}</style>",
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

__js function InternalStyleDef(content, parent_class, mech) {
  var rv = Object.create(InternalStyleDefProto);
  rv.content = content;
  rv.mechanism = mech;
  return rv;
}

/**
   @function Style
   @summary Add style to a widget
*/

__js {
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

    var selector = '_oni_style_.' + class_name;

    var styleMechanism;
    var content = arguments.length == 1 ? arguments[0] : arguments[1];
    if (content .. isQuasi) {
      var q = content;
      var render = function(observables) {
        var rv = "";
        for (var i=0; i<q.parts.length; i++) {
          var p = q.parts[i];
          if (i%2) {
            // XXX: are there general escaping rules we can use for CSS attribs?
            if (isObservable(p)) {
              if(observables) observables.push(p);
              rv += String(p.get());
            } else {
              rv += String(p);
            }
          } else rv += p;
        }
        return scope(rv, selector);
      }
      var observables = [];
      content = render(observables);
      // if render found any observables, set up a mechanism:
      if (observables.length) {
        styleMechanism = function(elem) {
          var onChange = function() {
            var content = render();
            if (elem.styleSheet) {
              // IE
              elem.styleSheet.cssText = content;
            } else {
              elem.lastChild.nodeValue = content;
            }
          }
          observe.apply(null, observables.concat(onChange));
        };
      }
    } else {
      content = scope(content, selector);
    }
    styledef = InternalStyleDef(content, class_name, styleMechanism);
    
    if (arguments.length == 1) {
      return setStyle;
    }
    else /* if (arguments == 2) */{
      return setStyle(arguments[0]);
    }
  }
  exports.Style = Style;
}

__js var ExternalStyleDefProto = {
  getHtml: -> "<link rel='stylesheet' href=\"#{sanitize(this.url)}\">",
  createElement: function() {
    // xbrowser env only
    var elem = document.createElement('link');
    elem.setAttribute('rel', 'stylesheet');
    elem.setAttribute('href', this.url);
    return elem;
  }
};

__js function ExternalStyleDef(url, parent_class) {
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
__js {
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
}

//----------------------------------------------------------------------

// helper mechanism for making observable classes dynamic:
function ObservableClassMechanism(ft, cls, current) {
  return ft .. Mechanism(function(node) {
    cls.observe { 
      ||
      __js {      
        if (current !== undefined) 
          node.classList.remove(current);
        if ((current = get(cls)) !== undefined) 
          node.classList.add(current); 
      }
    }
  });
}

function Class(widget, clsname, val) {
  __js  var widget = cloneWidget(widget);
  
  __js  var classes = widget._normalizeClasses();
  if (isObservable(clsname)) {
    __js    if (arguments.length > 2)
      throw new Error('Class(.) argument error: Cannot have a boolean toggle in conmbination with an observable class name');
    classes.push(clsname .. get);
    widget = widget .. ObservableClassMechanism(clsname, clsname .. get);
  }
  else {
    // !isObservable(clsname)
    if (arguments.length > 2) {
      // val is provided, treat it as a boolean toggle
      if (get(val)) classes.push(clsname);
      else classes .. array.remove(clsname);
      
      if (isObservable(val)) {
        widget = widget .. Mechanism {
          |elem|
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
