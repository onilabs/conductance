/**
  @nodoc
  @noindex
  (documented as mho:surface)
 */

var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream, first } = require('sjs:sequence');
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


/**
  @class HtmlFragment
  @summary A tree structure representing a piece of Html along with meta information
  @desc

    A HtmlFragment is anything that can be treated as HTML content. Many
    different Javascript types can be used, namely:

     - Any [sjs:quasi::Quasi], which is treated as raw HTML. Embedded
       [::HtmlFragment] values are allowed. e.g:

           var name = "John"
           var html = `<strong>Hello, $name</strong>`

           // `html` is a fragment corresponding to a <strong> element
           // with the text "Hello, John"

     - Any [::CollapsedFragment] (e.g any [::Widget])
     - An [observable::Observable] whose value is a [::HtmlFragment]
     - An `Array` of [::HtmlFragment]s.
     - A `String`, which will be automatically escaped (see [::RawHTML] for
       inserting a String as HTML).

    Any other types will be coerced to a String wherever a HtmlFragment
    is required.

    Note: Observables are only allowed for content that will be used in
    the 'dynamic world' (i.e. client-side). Attempting to add
    an observable to in a [::Document] will raise an error.
*/
/*
    HTML_FRAGMENT      : QUASI | CFRAGMENT | ARRAY | UNSAFE_TXT | 
                         OBSERVABLE
    QUASI              : "`" QUASI_COMPONENT* "`"
    QUASI_COMPONENT    : LITERAL_TXT | "${" HTML_FRAGMENT "}"
    ARRAY              : "[" FRAGMENT_TREE_LIST? "]"
    FRAGMENT_TREE_LIST : HTML_FRAGMENT | FRAGMENT_TREE_LIST "," HTML_FRAGMENT  
    UNSAFE_TXT         : '"' STRING '"'
    OBSERVABLE         : an instance of [observable::ObservableBase] whose
                         value is a [::HtmlFragment]
    LITERAL_TXT        : STRING
    CFRAGMENT          : an instance of class [::CollapsedFragment]
*/
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
  var dyn = require('./dynamic');
  return ft .. Mechanism(function(node) {
    obs.observe { |val|
      node .. dyn.replaceContent(collapseHtmlFragment(val));
    }
  });
}

// helper for streaminging content:
var gSentinelCounter = 0;

function isSentinelNode(node, sentinel) {
  // nodeType '8' is a comment node
  if (node.nodeType !== 8 || node.nodeValue.indexOf('surface_sentinel') == -1) return false;
  var [,id] = node.nodeValue.split('|');
  return id == sentinel; 
}

function StreamingContent(stream) {
  var dyn = require('./dynamic');
  
  function mechanism(node) {
    var sentinel = ++gSentinelCounter, have_inserted = false;
    try {
      stream .. each { 
        |val|
        if (have_inserted) {
          // remove previously inserted content between `node` and the sentinel
          do {
            var inserted = node.nextSibling;
            inserted.remove();
          } while (!(inserted .. isSentinelNode(sentinel)));
        }
        else
          have_inserted = true;
        var anchor = node.nextElementSibling;
        if (anchor) {
          // we've got an anchor for 'insertBefore'
          anchor .. dyn.insertBefore([val,`<!-- surface_sentinel |$sentinel| -->`]);
        }
        else {
          // we're appending to the end
          node.parentNode .. dyn.appendContent([val, `<!-- surface_sentinel |$sentinel| -->`]);
        }
      }
    }
    retract {
      if (have_inserted) {
        // remove previously inserted content between `node` and the sentinel
        do {
          var inserted = node.nextSibling;
          inserted.remove();
        } while (!(inserted .. isSentinelNode(sentinel)));
      }
//      console.log("STREAMING CONTENT MECHANISM RETRACTED");
    }
  }

  var ft = CollapsedFragment(), id = ++gMechanismCounter;
  ft.content = "<!-- surface_stream |#{id}| -->";
  ft.mechanisms[id] = mechanism;
  return ft;
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
    // XXX can we make this more efficient by not going through Widget?
    ft = Widget('surface-ui') .. ObservableContentMechanism(ft);
    ft.appendTo(target, tag);
  }
  else if (isStream(ft)) { 
    // streams are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    ft = StreamingContent(ft);
    ft.appendTo(target, tag);
  }
  else if (Array.isArray(ft)) {
    ft .. each(p -> appendFragmentTo(target, p, tag));
  }
  else {
    if (ft != null)
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
  @param {optional Object} [attributes]
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
  @param {Object} [widget]
  @return {Boolean}
*/
__js {
  function isWidget(obj) { return WidgetProto.isPrototypeOf(obj); }
  exports.isWidget = isWidget;
}

/**
  @function ensureWidget
  @param {::HtmlFragment}
  @return {::Widget}
  @summary Wrap a [::HtmlFragment] in a [::Widget], if it isn't already one.
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
  @param {::Widget} [widget]
  @return {::Widget}
  @summary Clone `widget`
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
  @param {optional ::Widget} [widget]
  @param {String} [style]
  @return {::Widget|Function}
  @summary Add CSS style to a widget
  @desc
    Style should be a CSS string, which will be automatically
    scoped to all instances of the given widget.

    The following additional syntax is supported:

      - A non-scoped block will apply to the root element
        of this widget. e.g:
        
            {
              position: absolute;
            }

      - A scope prefixed with `&` will be rolled into the
        root selector - e.g the following will add a border
        to the root element only when it also has the `border` class.

            &.border {
              border: 10px solid red;
            }

      - A `@global` block applies the given rules globally,
        rather than scoping them to this widget.
        e.g :
          
            @global {
              img {
                border: none;
              }
            }

    If `style` is an Observable (or a [sjs:quasi::Quasi] containing
    any observable values), the style will be recomputed and updated
    whenever any of the composite observable values changes.

    If `widget` is not provided, `Style` will
    return a cached style function which can later be
    called on a [::Widget] to apply the given style.
    When reusing styles, it is more efficient to create an
    intermediate `Style` function in this way, because it
    ensures that underlying <style> elements are re-used.
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
  },
  waitforLoading: true // This causes dynamic html code to wait for the css file to load before displaying; sometimes this is what we want, sometimes it isn't. XXX we might want to make this configurable.
};

__js function ExternalStyleDef(url, parent_class) {
  var rv = Object.create(ExternalStyleDefProto);
  rv.url = buildUrl(url, {scope:parent_class});
  return rv;
}

/**
  @function RequireStyle
  @param {::Widget} [widget]
  @param {String} [url]
  @summary Add an external stylesheet to a widget
  @desc
    Note that unlike [::Style], external stylesheets
    will not b scoped to the widget's root element -
    they will be applid globally for as long as `widget`
    is present in the document.
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
  @param {::Widget} [widget]
  @param {Function} [mechanism]
  @summary Add a mechanism to a widget
  @return {::Widget}
  @desc
    Whenever an instance of the returned widget
    is inserted into the document, `mechanism` will
    be called with the widget's root element as its
    first argument.

    When a widget's root element is removed from the
    document, any still-running mechanisms corresponding
    to that element will be aborted.
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

function StreamClassMechanism(ft, cls, current) {
  return ft .. Mechanism(function(node) {
    cls .. each { 
      |clsname|
      __js {  
        if (clsname === current) continue;
        if (current !== undefined) 
          node.classList.remove(current);
        if ((current = clsname) !== undefined) 
          node.classList.add(current); 
      }
    }
  });
}


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

/**
  @function Attrib
  @summary Add an attribute to a widget
  @param {::Widget} [widget]
  @param {String} [name] Attribute name
  @param {String|observable::Observable} [value] Attribute value
  @return {::Widget}
  @desc
    `value` can be an [observable::Observable], but only in a
    dynamic (xbrowser) context; if `val` is an observable and
    this widget is used in a static [::Document], an error will
    be thrown.
*/
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

/**
  @function Id
  @param {::Widget} [widget]
  @param {String|observable::Observable} [id]
  @summary Add an `id` attribute to a widget
  @return {::Widget}
*/
exports.Id = (widget, id) -> Attrib(widget, 'id', id);


/**
  @function Class
  @summary Add a `class` to a widget
  @param {::Widget} [widget]
  @param {String|observable::Observable} [class]
  @param {optional Boolean|observable::Observable} [flag]
  @return {::Widget}
  @desc
    Returns a copy of `widget` widget with `class`
    added to the widget's class list. If `class` is an
    observable, changes to `class` will be reflected
    in this widget.

    If `flag` is provided, it is treated as a boolean -
    the `class` is added if `flag` is `true`, otherwise
    it is removed. This is often useful with an
    [observable::Computed] boolean value, to toggle
    the presence of a class based on some logical condition.

    To replace the `class` attribute entirely rather
    than adding to it, use [::Attrib]`('class', newVal)`.
*/
function Class(widget, clsname, val) {
  __js  var widget = cloneWidget(widget);
  
  __js  var classes = widget._normalizeClasses();
  if (isObservable(clsname)) {
    __js    if (arguments.length > 2)
      throw new Error('Class(.) argument error: Cannot have a boolean toggle in combination with an observable class name');
    classes.push(clsname .. get);
    widget = widget .. ObservableClassMechanism(clsname, clsname .. get);
  }
  else if (isStream(clsname)) {
    __js    if (arguments.length > 2)
      throw new Error('Class(.) argument error: Cannot have a boolean toggle in combination with an observable class name');
    var current = clsname .. first;
    classes.push(current);
    widget = widget .. StreamClassMechanism(clsname, current);
  }
  else {
    // !isObservable/isStream(clsname)
    if (arguments.length > 2) {
      // val is provided, treat it as a boolean toggle
      
      if (isObservable(val)) {
        if (get(val)) 
          classes.push(clsname);
        else 
          classes .. array.remove(clsname);
        widget = widget .. Mechanism {
          |elem|
          var cl = elem.classList;
          val.observe {|v|
                       if (v) cl.add(clsname);
                       else cl.remove(clsname);
                      }
        }
      }
      else if (isStream(val)) {
        if (val .. first)
          classes.push(clsname);
        else
          classes .. array.remove(clsname);
        widget = widget .. Mechanism {
          |elem|
          var cl = elem.classList;
          val .. each {
            |v|
            if (v) cl.add(clsname);
            else cl.remove(clsname);
          }
        }
      }
      else {
        if (val) 
          classes.push(clsname);
        else 
          classes .. array.remove(clsname);
      }
    } else {
      classes.push(clsname);
    }
  }

  return widget;
}
exports.Class = Class;
/**
  @function RawHTML
  @summary Cast a string into raw HTML
  @param {String} [html]
  @return {sjs:quasi::Quasi}
  @desc
    Normally, strings substituted into quasi-quotes are escaped
    when inserted into a HTML document. This function returns
    a quasi-quote from the given string, so that it is treated as
    HTML. This function should not be applied to untrusted user
    input, as it would enable users to inject arbitrary content
    into the page.

    ### Example:

        var subject = "<b>World!</b>";

        collapseHtmlFragment(`Hello, $subject`).getHtml()
        // "Hello, &lt;b&gt;World!&lt;/b&gt;"

        collapseHtmlFragment(`Hello, $RawHTML(subject)`).getHtml()
        // "Hello, <b>World!</b>"

        
*/
exports.RawHTML = (str) -> Quasi([str]);

//----------------------------------------------------------------------

exports.Markdown = (str, settings) -> exports.RawHTML(require('sjs:marked').convert(str, settings));

/**
  @function RequireExternalScript
  @summary Declare a dependency on an external `.js` script
  @param {String} [url]
  @return {::HtmlFragment}
  @desc
    You can place `RequireExternalScript` anywhere in a [::HtmlFragment], it
    has no content. The first time the fragment is inserted into the document, the
    external script will be loaded and executed. If the url specified has already been
    loaded in this way, it will not be reloaded or re-executed.

    You should use this for widgets which depend on some javascript library being
    globally available - that way, the script is automatically loaded when your
    widget is used. For SJS-based dependencies, this function is unnecessary
    (just use `require`).
*/
exports.RequireExternalScript = function(url) {
  var rv = CollapsedFragment();
  rv.externalScripts[url] = true;
  return rv;
};
