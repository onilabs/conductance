/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
  @nodoc
  @noindex
  (documented as mho:surface)
 */

var { isQuasi, Quasi } = require('sjs:quasi');
var { isString, sanitize } = require('sjs:string');
var { each, indexed, reduce, map, join, isStream, first, toArray } = require('sjs:sequence');
var { clone, propertyPairs, extend, hasOwn } = require('sjs:object');
var { scope } = require('./css');
var { build: buildUrl } = require('sjs:url');
var array = require('sjs:array');
var func = require('sjs:function');

//----------------------------------------------------------------------
// counters which will be used to generate css & mechanism ids

// To keep the static & dynamic worlds from colliding, we initialize
// these from the global variable __oni_surface_init if present (it is
// added for static documents - see static.sjs::Document)

var gCSSCounter = 0;
var gMechanismCounter = 0;

if (typeof __oni_surface_init !== 'undefined') {
  [gCSSCounter, gMechanismCounter] = __oni_surface_init;
}

exports._getDynOniSurfaceInit = -> 
  "__oni_surface_init = [#{gCSSCounter+1}, #{gMechanismCounter+1}];\n";


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

     - Any [::Element]
     - An `Array` of [::HtmlFragment]s.
     - A `String`, which will be automatically escaped (see [::RawHTML] for
       inserting a String as HTML).
     - A [sjs:sequence::Stream] whose values are themselves [::HtmlFragment]s. Note that streams are assumed
       to be **time-varying** - i.e the most recently emitted item from the stream is displayed at all times.
       Typically, this will be an [sjs:observable::ObservableVar] or a Stream derived from one. To append all the
       elements of a stream, use [sjs:sequence::toArray], [::CollectStream], or [::ScrollStream].
     - A [::ContentGenerator]

    Any other types will be coerced to a String wherever a HtmlFragment
    is required.

    Note: Streams and ContentGenerators are only allowed for content that will be used in
    the 'dynamic world' (i.e. client-side). Attempting to add
    a stream to a [::Document] will raise an error.
*/
/*
    HTML_FRAGMENT      : QUASI | CFRAGMENT | ARRAY | UNSAFE_TXT | 
                         STREAM
    QUASI              : "`" QUASI_COMPONENT* "`"
    QUASI_COMPONENT    : LITERAL_TXT | "${" HTML_FRAGMENT "}"
    ARRAY              : "[" FRAGMENT_TREE_LIST? "]"
    FRAGMENT_TREE_LIST : HTML_FRAGMENT | FRAGMENT_TREE_LIST "," HTML_FRAGMENT  
    UNSAFE_TXT         : '"' STRING '"'
    STREAM             : an instance of [sjs:sequence::Stream] whose
                         value is a [::HtmlFragment]
    LITERAL_TXT        : STRING
    CFRAGMENT          : an instance of class [::CollapsedFragment]
*/
__js var FragmentBase = {
  appendTo: function(target) {
    target.css .. extendCSS(this.css);
    target.mechanisms .. extend(this.mechanisms);
    target.externalScripts .. extend(this.externalScripts);
    target.externalCSS .. extend(this.externalCSS);
  },
  _init: function() {
    this.css = {};
    this.mechanisms = {};
    this.externalScripts = {};
    this.externalCSS = {};
  },
};

/* NOT PART OF DOCUMENTED API
  @class CollapsedFragment
  @summary Internal class representing a collapsed [::HtmlFragment]
  @inherit ::HtmlFragment
*/
var CollapsedFragmentProto = Object.create(FragmentBase);

__js CollapsedFragmentProto .. extend({
  toString:        -> "html::CollapsedFragment [#{this.content}]",
  getHtml:         -> this.content,        // string
  getCSSDefs:      -> this.css,          // { css_id : [ref_count, def], ... }
  getMechanisms:   -> this.mechanisms,     // { mechanism_id : code, ... }
  getExternalScripts: -> this.externalScripts,     // { url: true, ... }
  getExternalCSS: -> this.externalCSS, // { url: true, ... }
  appendTo: func.seq(CollapsedFragmentProto.appendTo, function(target) {
    target.content += this.content;
  }),
  _init: func.seq(CollapsedFragmentProto._init, function() {
    this.content = "";
  }),
});

__js function extendCSS(target, src) {
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

/* NOT PART OF DOCUMENTED API
  @function isCollapsedFragment
*/
__js function isCollapsedFragment(obj) { return CollapsedFragmentProto.isPrototypeOf(obj); }
__js function isFragment(obj) { return FragmentBase.isPrototypeOf(obj); }
exports.isFragment = isFragment;

/* NOT PART OF DOCUMENTED API
  @function collapseHtmlFragment
  @param {::HtmlFragment} [ft]
  @return {::CollapsedFragment}
*/


function StreamingContent(stream) {
  var dyn = require('./dynamic');
  
  function mechanism(node) {
    stream .. each.track {
      |val|
      var anchor = node.nextSibling;
      if (anchor) {
        // we've got an anchor for 'insertBefore'
        anchor .. dyn.insertBefore(val) { 
          ||
          // We hold until aborted (when content gets removed from doc
          // and we get retracted, or when a new stream value arrives
          // and 'each.track' aborts us)
          // On abortion, insertBefore will clean up our content.
          hold();
        }
      }
      else {
        // we're appending to the end:
        node.parentNode .. dyn.appendContent(val) { || hold(); }
      }
    }
  }

  var ft = CollapsedFragment(), id = ++gMechanismCounter;
  ft.content = "<!-- surface_stream |#{id}| -->";
  ft.mechanisms[id] = mechanism;
  return ft;
}

//----------------------------------------------------------------------
// generated content

function GeneratedContent(generator) {
  var dyn = require('./dynamic');
  
  function mechanism(node) {
    var appendFunc;
    var anchor = node.nextSibling;
    if (anchor) 
      appendFunc = (content,block) -> anchor .. dyn.insertBefore(content,block);
    else
      appendFunc = (content,block) -> node.parentNode .. dyn.appendContent(content,block);

    generator(appendFunc, node);
  }

  var ft = CollapsedFragment(), id = ++gMechanismCounter;
  ft.content = "<!-- surface_stream |#{id}| -->";
  ft.mechanisms[id] = mechanism;
  return ft;
}

__js function isContentGenerator(f) {
  return f && f.__oni_isContentGenerator === true;
}

// documented as part of dynamic.sjs
__js exports.ContentGenerator = function(f) { 
  f.__oni_isContentGenerator = true;
  return f;
}

//----------------------------------------------------------------------

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
  else if (isStream(ft)) { 
    // streams are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    ft = StreamingContent(ft);
    ft.appendTo(target, tag);
  }
  else if (isContentGenerator(ft)) {
    // content generators are only allowed in the dynamic world; if the user
    // tries to use the generated content with e.g. static::Document,
    // an error will be thrown.
    ft = GeneratedContent(ft);
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
  @class Element
  @__inherit__ CURRENTLY HIDDEN ::CollapsedFragment
  @summary A [::HtmlFragment] rooted in a single HTML element
*/
__js var ElementProto = Object.create(FragmentBase);

var voidTags = {
  // source: http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
  area: 1,
  base: 1,
  br: 1,
  col: 1,
  command: 1,
  embed: 1,
  hr: 1,
  img: 1,
  input: 1,
  keygen: 1,
  link: 1,
  meta: 1,
  param: 1,
  source: 1,
  track: 1,
  wbr: 1
};

__js ElementProto._init = func.seq(ElementProto._init, function(tag, content, attribs) { 
  this.tag = tag;
  this.isVoid = voidTags[tag] && voidTags .. hasOwn(tag);
  if (this.isVoid) {
    if (attribs === undefined && typeof(content) == 'object') {
      // for void tags, allow Element(tagname, attrs).
      // we only do this if `attribs` is undefined,
      // since Element(tagname, null, attrs) is perfectly valid.
      attribs = content;
      content = null;
    }
    if (content != null) throw new Error("#{tag} tag cannot contain content");
  }
  this.attribs = attribs ? attribs : {};
  this.content = content;
});

__js ElementProto.toString = function() {
  return "html::Element[#{this.tag}]";
};

__js ElementProto._normalizeClasses = function() {
  // ensure the `class` attrib is an array
  var classes = this.attribs['class'];
  if (!Array.isArray(classes)) {
    classes = this.attribs['class'] = classes ? String(classes).split(" ") : [];
  }
  return classes;
};

__js var flattenAttrib = (val) -> Array.isArray(val) ? val .. join(" ") : val;

ElementProto.appendTo = function(target) {
  var attribs = propertyPairs(this.attribs)
    .. map(function([key,val]) {
      if (typeof(val) === 'undefined') return "";
      if (typeof(val) === 'boolean') {
        return val ? " #{key}" : "";
      }
      return " #{key}=\"#{String(flattenAttrib(val)).replace(/\"/g, '&quot;')}\"";
    })
    .. join('');

  target.content += "<#{this.tag}#{attribs}>";
  this._appendInner(target);
  if (this.isVoid)
    return;
  target.content += "</#{this.tag}>";
};

ElementProto._appendInner = func.seq(FragmentBase.appendTo, function(target) {
  // append inner contents (as well as adding this element's css, mechanisms, etc)
  if (this.content != null) {
    appendFragmentTo(target, this.content, this.tag);
  }
});

ElementProto.createElement = function() { 
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
  @function Element
  @param {String} [tag]
  @param {::HtmlFragment} [content] Content to set on DOM element
  @param {optional Object} [attributes] Object with {name: string} attributes to set on DOM element
  @return {::Element}
  @desc 
    ### Notes
    
    * As an alternative to specifying `attributes`, see the the [::Attrib] decorator.
*/
__js {
  function Element(tag, content, attribs) {
    var rv = Object.create(ElementProto);
    rv._init.apply(rv, arguments);
    return rv;
  }
  exports.Element = Element;
}

/**
  @function isElement
  @param {Object} [element]
  @summary Test whether `element` is an [::Element]
  @return {Boolean}
*/
__js {
  function isElement(obj) { return ElementProto.isPrototypeOf(obj); }
  exports.isElement = isElement;
}

/**
   @function isElementWithClass
   @param {Object} [element]
   @param {String} [class_name] CSS Class
   @summary Test whether `element` is an [::Element] with CSS class `class_name`
   @return {Boolean}
*/
__js {
  function isElementWithClass(elem,cls) {
    return isElement(elem) && (elem._normalizeClasses().indexOf(cls) !== -1);
  }
  exports.isElementWithClass = isElementWithClass;
}

/**
   @function isElementOfType
   @param {Object} [element]
   @param {String} [type] Tag name (e.g. "li" or "div")
   @summary Test whether `element` is an [::Element] of type `type`.
   @return {Boolean}
*/
__js {
  function isElementOfType(elem, type) {
    return isElement(elem) && (elem.tag == type);
  }
  exports.isElementOfType = isElementOfType;
}


/**
  @function ensureElement
  @param {::HtmlFragment} [html]
  @return {::Element}
  @summary Wrap a [::HtmlFragment] in an [::Element] with tag name 'surface-ui', if it isn't already one.
*/
__js {
  function ensureElement(ft) {
    if (!isElement(ft))
      ft = Element('surface-ui', ft);
    return ft;
  }
  exports.ensureElement = ensureElement;
}

/* NOT CURRENTLY PART OF DOCUMENTED API
  @function cloneElement
  @param {::HtmlFragment} [element]
  @return {::element}
  @summary Clone `element`
  @desc
     `element` will automatically be wrapped using [::ensureElement] if it is not an [::Element]
*/
__js {
  function cloneElement(ft) {
    if (!isElement(ft)) return ensureElement(ft);
    var rv = Object.create(ElementProto);
    rv._init(ft.tag, ft.content, ft.attribs ? clone(ft.attribs));
    rv.css = clone(ft.css);
    rv.mechanisms = clone(ft.mechanisms);
    rv.externalScripts = clone(ft.externalScripts);
    rv.externalCSS = clone(ft.externalCSS);
    return rv;
  }
  exports.cloneElement = cloneElement;
}



//----------------------------------------------------------------------

// CSS-related classes

__js var InternalCSSDefProto = {
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

__js function InternalCSSDef(content, parent_class, mech) {
  var rv = Object.create(InternalCSSDefProto);
  rv.content = content;
  rv.mechanism = mech;
  return rv;
}

/**
  @function CSS
  @altsyntax element .. CSS(style)
  @param {optional ::HtmlFragment} [element]
  @param {String|sjs:quasi::Quasi} [style]
  @return {::Element|Function}
  @summary Add CSS style to an element
  @desc
    `style` should be a CSS string, which will be automatically
    scoped to all instances of the given widget.

    The following additional syntax is supported:

      - A non-scoped block will apply to the root element
        of this widget. e.g:
        
            {
              position: absolute;
            }

      - A scope prefixed with `&` will be rolled into the
        parent selector - e.g the following will add a border
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

      - indented blocks will be flattened, much like [LESS](http://lesscss.org/)
        e.g:
      
            .post {
              // applies to ".post"
              position: relative;

              h1 {
                // flattened to ".post h1"
                font-weight: 20pt;
              }

              p, pre {
                // flattened to ".post p, .post pre"
                margin: 0 20px;
              }
            }

    If `style` is a [sjs:quasi::Quasi] containing any
    [sjs:sequence::Stream] values, the style will be recomputed and
    updated whenever any one of the composite stream values
    changes. This only works in a dynamic (xbrowser) context; in a
    static [::Document] context an error will be thrown if a Stream is
    encountered.

    If `element` is not provided, `CSS` will
    return a cached style function which can later be
    called on a [::HtmlFragment] to apply the given style.
    When reusing styles, it is more efficient to create an
    intermediate `CSS` function in this way, because it
    ensures that underlying <style> elements are re-used.

    If `CSS` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].
*/

__js {
  function CSS(/* [opt] ft, style */) {
    var id = ++gCSSCounter, cssdef;
    var class_name = "_oni_css#{id}_";
    
    function setCSS(ft) {
      ft = cloneElement(ft);
      
      if (!ft.css[id])
        ft.css[id] = [1,cssdef];
      else
        ft.css[id] = [ft.css[id][0]+1, cssdef];
      
      var classes = ft._normalizeClasses();
      if (classes.indexOf('_oni_css_') == -1)
        ft.attribs['class'] = classes.concat(' _oni_css_', class_name);
      else if (classes.indexOf(class_name) == -1)
        ft.attribs['class'] = classes.concat(class_name);
      return ft;
    }

    var selector = '_oni_css_.' + class_name;

    var cssMechanism;
    var content = arguments.length == 1 ? arguments[0] : arguments[1];
    if (content .. isQuasi) {
      var q = content;
      var render = function(collectObservables, values) {
        var rv = "", obsIdx=0;
        for (var i=0; i<q.parts.length; i++) {
          var p = q.parts[i];
          if (i%2) {
            if (isStream(p)) {
              if(collectObservables) collectObservables.push(p);
              // XXX: are there general escaping rules we can use for CSS attribs?
              else rv += String(values[obsIdx++]);
            } else {
              rv += String(p);
            }
          } else rv += p;
        }
        return scope(rv, selector);
      }
      var observables = [];
      content = render(observables);
      // if render collected any observables, set up a mechanism:
      if (observables.length) {
        content = ""; // leave blank until we have observable values
        cssMechanism = function(elem) {
          var onChange = function(values) {
            var content = render(null, values);
            if (elem.styleSheet) {
              // IE
              elem.styleSheet.cssText = content;
            } else {
              elem.lastChild.nodeValue = content;
            }
          }
          var args = observables.slice(0);
          args.push(function() { return arguments .. toArray });
          require('sjs:observable').observe.apply(null, args) .. each(onChange);
        };
      }
    } else {
      content = scope(content, selector);
    }
    cssdef = InternalCSSDef(content, class_name, cssMechanism);
    
    if (arguments.length == 1) {
      return setCSS;
    }
    else /* if (arguments == 2) */{
      return setCSS(arguments[0]);
    }
  }
  exports.CSS = CSS;
}

/**
  @function GlobalCSS
  @param {String} [style]
  @return {::HtmlFragment}
  @summary Create a global CSS style
  @desc
    Creates a widget which (when inserted into the document)
    adds the given `style` CSS rules. Unlike [::CSS], the attached style
    will not be scoped to any particular widget.
*/
exports.GlobalCSS = function(content) {
  var f = Object.create(FragmentBase);
  var id = ++gCSSCounter;
  var cssdef = InternalCSSDef(scope(content));
  f._init();
  f.css[id] = [1, cssdef];
  return f;
};

//----------------------------------------------------------------------

/**
  @function Mechanism
  @altsyntax element .. Mechanism(mechanism, [prepend])
  @param {optional ::HtmlFragment} [element]
  @param {Function|String} [mechanism] Function to execute when `element` is added to the DOM
  @param {optional Boolean} [prepend=false] If `true`, this mechanism will be executed before any other existing mechanisms on `element`.
  @summary Add a mechanism to an element
  @return {::Element|Function}
  @desc
    Whenever an instance of the returned element is inserted into the
    document using [::appendContent] or one of the surface module's other
    content insertion functions, `mechanism` will be called 
    with its first argument and
    `this` pointer both set to `element`s DOM node.

    When `element` is removed from the document using [::removeNode],
    any still-running mechanisms attached to that element will be
    aborted.

    `mechanism` can be a JS function or String representation of a JS function.
    The former only works in a dynamic (xbrowser) context; if `mechanism` is a Function and
    this element is used in a static [::Document], an error will
    be thrown.

    If `element` is not provided, `cached_mech = Mechanism(f)` will
    return a cached mechanism function which can later be
    applied to multiple [::HtmlFragment]s to attach the given mechanism to them.
    Calling `elem .. cached_mech` for a number of `elem`s is more efficient than 
    calling `elem .. Mechanism(f)` on each of them. 

    If `Mechanism` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].

    The `prepend` flag is used to coordinate the order of execution
    when there are multiple mechanisms on an element. By default,
    mechanisms will be executed in the order that they were
    added. `prepend`=`true` overrides this by adding a mechanism to the
    front of the queue. It guarantees that a given mechanism will be
    executed before all mechanisms with `prepend`=`false`.

    Mechanisms that inject interfaces/apis into a DOM element should
    generally be added with `prepend`=`true`, so that other mechanisms
    on the element can make use of them.

 
*/
__js {
  function Mechanism(/* [opt] ft, code, [opt] prepend */) {
    var id = ++gMechanismCounter, code, prepend;
    
    function setMechanism(ft) {
      if (code == null) throw new Error("null mechanism");
      ft = cloneElement(ft);
      
      ft.mechanisms[id] = code;
      
      if(!ft.attribs['data-oni-mechanisms'])
        ft.attribs['data-oni-mechanisms'] = String(id);
      else if (!prepend)
        ft.attribs['data-oni-mechanisms'] += ' '+id;
      else
        ft.attribs['data-oni-mechanisms'] = id + ' ' + ft.attribs['data-oni-mechanisms'];

      var classes = ft._normalizeClasses();
      if (classes.indexOf('_oni_mech_') == -1)
        ft.attribs['class'] = classes.concat(' _oni_mech_');
      return ft;
    }
    
    if (arguments.length == 1 || typeof arguments[1] !== 'function') {
      code = arguments[0];
      prepend = arguments[1];
      return setMechanism;
    }
    else /* if (arguments.length == 2|3 ) */ {
      code = arguments[1];
      prepend = arguments[2];
      return setMechanism(arguments[0]);
    }
  }
  exports.Mechanism = Mechanism;
}

//----------------------------------------------------------------------

// helper mechanism for making observable classes dynamic:
function StreamClassMechanism(ft, cls) {
  return ft .. Mechanism(function(node) {
    var current;
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

function setAttribValue(element, name, v) {
  if (typeof v === 'boolean') {
    if (v) element.attribs[name] = 'true';
    // else leave out attribute
  }
  else {
    element.attribs[name] = String(v);
  }
}

function StreamAttribMechanism(ft, name, obs) {
  return ft .. Mechanism(function(node) {
    obs .. each {
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
  @altsyntax element .. Attrib(name, value)
  @summary Add a HTML attribute to an element
  @param {::HtmlFragment} [element]
  @param {String} [name] Attribute name
  @param {Boolean|String|sjs:sequence::Stream} [value] Attribute value
  @return {::Element}
  @desc
    `value` can be an [sjs:sequence::Stream], but only in a
    dynamic (xbrowser) context; if `val` is a Stream and
    this element is used in a static [::Document], an error will
    be thrown.

    If `value` is a boolean (or `value` is a a stream that yields a
    boolean), then the attribute will be set to the string `'true'` if
    `value` is `true`. If the value is `false`, then the attribute will 
    not be set at all (in a dynamic context, where `value` is a stream 
    yielding `false`, the attribute will be removed from the element if present).

    If `value` is not boolean, then it will be cast to a string. This means that
    `Div() .. Attrib('foo', undefined)` yields `<div foo='undefined'></div>` and not
    `<div foo></div>` or `<div></div>` as one might expect. 

    If `Attrib` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].

    See also [::Prop].
*/
function Attrib(element, name, value) {
  if (isStream(value)) {
    return element .. StreamAttribMechanism(name, value);
  }
  __js element = cloneElement(element);
  setAttribValue(element, name, value);
  return element;
}
exports.Attrib = Attrib;

/**
  @function Id
  @altsyntax element .. Id(id)
  @param {::HtmlFragment} [element]
  @param {String|sjs:sequence::Stream} [id]
  @summary Add an `id` attribute to an element
  @return {::Element}
  @desc
    `id` can be an [sjs:sequence::Stream], but only in a
    dynamic (xbrowser) context; if `val` is a Stream and
    this element is used in a static [::Document], an error will
    be thrown.

    If `Id` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].
*/
exports.Id = (element, id) -> Attrib(element, 'id', id);

/**
  @function Style
  @altsyntax element .. Style(style)
  @summary Add to an element's "style" attribute
  @param {::HtmlFragment} [element]
  @param {String} [style]
  @return {::Element}
  @desc
    Returns a copy of `element` with `style` added to the 
    element's "style" attribute.

    To replace the "style" attribute entirely rather
    than adding to it, use [::Attrib]`('style', newVal)`.

    For a richer way to add styling, see [::CSS].

    If `Style` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].

*/
__js {
  function Style(element, style) {
    element = cloneElement(element);
    var prop = element.attribs['style'];
    if (!prop)
      prop = element.attribs['style'] = [style];
    else if (!Array.isArray(prop))
      prop = element.attribs['style'] = [prop, style];
    else
      element.attribs['style'] = prop.concat(style);

    return element;
  }
  exports.Style = Style;
}

/**
  @function Class
  @altsyntax element .. Class(class, [flag])
  @summary Add a `class` to an element
  @param {::HtmlFragment} [element]
  @param {String|sjs:sequence::Stream} [class]
  @param {optional Boolean|sjs:sequence::Stream} [flag]
  @return {::Element}
  @desc
    Returns a copy of `element` with `class`
    added to the element's class list. If `class` is a
    stream, changes to `class` will be reflected
    in this element.

    If `flag` is provided, it is treated as a boolean -
    the `class` is added if `flag` is `true`, otherwise
    it is removed. This is often useful with an
    observable boolean value, to toggle
    the presence of a class based on some logical condition.

    To replace the `class` attribute entirely rather
    than adding to it, use [::Attrib]`('class', newVal)`.

    If `Class` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].
*/
function Class(element, clsname, val) {
  __js  var element = cloneElement(element);
  __js  var classes = element._normalizeClasses();
  if (isStream(clsname)) {
    __js    if (arguments.length > 2)
      throw new Error('Class(.) argument error: Cannot have a boolean toggle in combination with an observable class name');
    element = element .. StreamClassMechanism(clsname);
  }
  else {
    // !isStream(clsname)
    if (arguments.length > 2) {
      // val is provided, treat it as a boolean toggle
      if (isStream(val)) {
        element = element .. Mechanism {
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
          element.attribs['class'] = classes.concat(clsname);
        else {
          element.attribs['class'] = classes = classes.slice(0); // take a copy
          classes .. array.remove(clsname);
        }
      }
    } else {
      element.attribs['class'] = classes.concat(clsname);
    }
  }

  return element;
}
exports.Class = Class;

/**
  @function Content
  @altsyntax element .. Content(content)
  @summary Add to an element's content
  @param {::HtmlFragment} [element]
  @param {::HtmlFragment} [content]
  @return {::Element}
  @desc
    Returns a copy of `element` with `content` added to the 
    element's content.

    If `Content` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].

*/
__js {
  function Content(elem, content) {
    var elem = cloneElement(elem);
    if (elem.content) 
      elem.content = [elem.content, content];
    else
      elem.content = content;
    return elem;
  };
  exports.Content = Content; 
}

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


/**
  @function Autofocus
  @altsyntax element .. Autofocus()
  @summary Focus element when loaded into DOM
  @param {::HtmlFragment} [element]
  @return {::Element}
  @desc
    Similar to setting an attribute 'autofocus' on an element, but works in 
    more circumstances, e.g. in Bootstrap modal dialog boxes that have tabindex=-1. Also, if the element itself is not focusable, the first child element matching the CSS selector `input, a[href], area[href], iframe` will be focussed.

    If `Autofocus` is applied to a [::HtmlFragment] that is not of class [::Element], 
    `element` will automatically be wrapped using [::ensureElement].
*/
// the hold(0) is necessary to make focus work for content that is initially hidden; e.g.
// in doModal:
exports.Autofocus = Mechanism("\
 hold(0); 
 this.focus(); 
 if (document.activeElement !== this) {
   var focusable = this.querySelector('input, a[href], area[href], iframe');
   if (focusable)
     focusable.focus();
 }
");

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

/**
  @function RequireExternalCSS
  @summary Declare a dependency on an external `.css` file
  @param {String} [url]
  @return {::HtmlFragment}
  @desc
    You can place `RequireExternalCSS` anywhere in a [::HtmlFragment], it
    has no content. The first time the fragment is inserted into the document, the
    external script will be loaded and executed. If the url specified has already been
    loaded in this way, it will not be reloaded or re-executed.

    Note that unlike [::CSS], external stylesheets
    will not be scoped to any particular element -
    they will be applied globally.

*/
exports.RequireExternalCSS = function(url) {
  var rv = CollapsedFragment();
  rv.externalCSS[url] = true;
  return rv;
};

