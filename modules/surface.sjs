/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
  @summary Conductance sub-system for constructing static and dynamic client-side UI
  @inlibrary mho:std
*/

var modules = ['./surface/base', './surface/nodes'];
if (require('sjs:sys').hostenv === 'xbrowser') {
  modules.push('./surface/dynamic');
} else {
  modules.push('./surface/static');
}
module.exports = require(modules);

// GENERATED DOCS FOLLOW:

/**

@require ./surface/base
@require ./surface/nodes
@require ./surface/dynamic

@class HtmlFragment
@summary A tree structure representing a piece of Html along with meta information
@desc

  A HtmlFragment is anything that can be treated as HTML content. Many
  different Javascript types can be used, namely:

   - `null` or `undefined` (which both stand for empty html)
   - Any [sjs:#language/syntax::quasi-quote], which is treated as raw HTML. Embedded
     [::HtmlFragment] values are allowed. e.g:

         var name = "John"
         var html = `<strong>Hello, $name</strong>`

         // `html` is a fragment corresponding to a <strong> element
         // with the text "Hello, John"

   - Any [::Element]
   - Any [::ElementConstructor]
   - An `Array` of [::HtmlFragment]s.
   - A `String` or nodejs buffer, which will be automatically escaped (see [::RawHTML] for
     inserting a String as HTML).
   - A Number
   - A [sjs:sequence::Stream] whose values are themselves [::HtmlFragment]s. Note that streams are assumed
     to be **time-varying** - i.e the most recently emitted item from the stream is displayed at all times.
     Typically, this will be an [sjs:observable::ObservableVar] or a Stream derived from one. To append all the
     elements of a stream, use [sjs:sequence::toArray], [::CollectStream], or [::ScrollStream].
   - A [::ContentGenerator]

  #### Caveats

   - Other types of objects (such as e.g. a `Date` object) will *NOT* be coerced to a String and are not allowed as HtmlFragments. This is deliberate because experience has shown that more often than not plain objects in HtmlFragments point towards an error in program logic.

   - Streams and ContentGenerators are only allowed for content that will be used in
     the 'dynamic world' (i.e. client-side). Attempting to add
     a stream to a [::Document] will raise an error.

@function looksLikeHtmlFragment
@summary Check whether an object looks like a [::HtmlFragment]
@param {Object} [obj]
@desc
  Returns `true` if `obj` is any of the following:
    - `null` or `undefined`
    - [sjs:#language/syntax::quasi-quote]
    - [::Element]
    - [::ElementConstructor]
    - String
    - Nodejs Buffer
    - Number
    - Array
    - [sjs:sequence::Stream]
    - [::ContentGenerator]

@class Element
@__inherit__ CURRENTLY HIDDEN ::CollapsedFragment
@summary A [::HtmlFragment] rooted in a single HTML element

@class ElementWrapper
@summary A 'builder'-type function that, when applied to an [::Element], returns a new [::Element] derived from the original [::Element]. The original element will not be modified. 
@desc
   ### Note: 

   If an ElementWrapper is applied to a [::HtmlFragment] that is not
   an [::Element], the [::HtmlFragment] will automatically be cast
   into an [::Element] using [::ensureElement]. This behavior is
   under review, and in future the implementation might throw an
   error in this case instead.



@function Element
@param {String} [tag]
@param {::HtmlFragment} [content] Content to set on DOM element
@param {optional Object|String} [attributes_or_class] Object with {name: string|Stream} attributes to set on DOM element, or a string of class names to apply to the element.
@return {::Element}
@desc 
  ### Notes
  
  * As an alternative to specifying `attributes_or_class`, see the [::Attrib] and [::Class] decorators.

@function isElement
@param {Object} [element]
@summary Test whether `element` is an [::Element]
@return {Boolean}

@function ElementConstructor
@summary Marks a function as returning an [::Element]
@param {Function} [f]
@return {Function}
@desc
  Functions wrapped with `ElementConstructor` are expected to return an [::Element] when 
  called with no arguments.
 
  An ElementConstructor `a` is a [::HtmlFragment] equivalent to `a()`, i.e. `a` can be used with or 
  without function application.
 
  #### Example

  Most of the HTML constructors defined in [mho:surface/html::] are ElementConstructors:

      var my_html = [@Div, @Hr, @Div];

      // is equivalent to:

      var my_html = [@Div(), @Hr(), @Div()];

@function isElementConstructor
@summary Tests whether `element` is an [::ElementConstructor]
@param {Object} [element]
@return {Boolean}

@function isElementWithClass
@param {Object} [element]
@param {String} [class_name] CSS Class
@summary Test whether `element` is an [::Element] with CSS class `class_name`
@return {Boolean}

@function isElementOfType
@param {Object} [element]
@param {String} [type] Tag name (e.g. "li" or "div")
@summary Test whether `element` is an [::Element] of type `type`.
@return {Boolean}

@function ensureElement
@param {::HtmlFragment} [html]
@return {::Element}
@summary Return `html` unmodified if it is an [::Element]; resolve to [::Element] if it is an [::ElementConstructor]; otherwise return `html` wrapped in an [::Element] with tag name `<surface-ui>`.

@function CSS
@altsyntax element .. CSS(style)
@param {optional ::Element} [element]
@param {String|sjs:quasi::Quasi|Array} [style]
@return {::Element|Function}
@summary An [::ElementWrapper] that adds CSS style to an element
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

  A quasi-valued `style` is allowed to contain interpolated values which are quasis themselves.
  Note that currently Stream-valued interpolated values are only allowed in the top-level quasi.

  If `style` is an array, the first element is an object of flags, and the second element
  the 'actual' style (i.e. a string or quasi, as explained above). The following flags are
  supported:

    - `prepend`: if this is set to true, the stylesheet will be prepended to the 
      document's <head>, rather than appended.
      This is useful for defining 'default' styles which can easily be overridden by
      normal (i.e. appended) stylesheets through the normal css cascading rules.

  If `element` is not provided, `CSS` will
  return a cached style function which can later be
  called on a [::HtmlFragment] to apply the given style.
  When reusing styles, it is more efficient to create an
  intermediate `CSS` function in this way, because it
  ensures that underlying <style> elements are re-used.

@function GlobalCSS
@param {String|Quasi} [style]
@return {::HtmlFragment}
@summary Create a global CSS style
@desc
  Creates a widget which (when inserted into the document)
  adds the given `style` CSS rules. Unlike [::CSS], the attached style
  will not be scoped to any particular widget.

@function Mechanism
@altsyntax element .. Mechanism(mechanism, [settings])
@param {optional ::Element} [element]
@param {Function|String} [mechanism] Function to execute when `element` is added to the DOM
@param {optional Object} [settings] Additional settings
@setting {optional Integer} [priority] Priority value for coordinating mechanism execution order (Default: [::MECH_PRIORITY_NORMAL])
@setting {optional Boolean} [prepend=false] If `true`, this mechanism will be executed before any other existing mechanisms on `element`. **deprecated**
@summary An [::ElementWrapper] that adds a "mechanism" to an element
@return {::Element|Function}
@desc
  Whenever an instance of the returned element is inserted into the
  document using [::appendContent] or one of the surface module's other
  content insertion functions, `mechanism` will be called 
  with its first argument and
  `this` pointer both set to `element`s DOM node. Furthermore, `mechanism` will be executed with an implicit [::DynamicDOMContext] set to `element`s DOM node. 

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

  *** Coordinating execution order ***

  When a [::HtmlFragment] is inserted into the document using [::appendContent] (or one
  of the surface module's other content insertion functions) and there are multiple 
  mechanisms to be executed, their execution order can be coordinated using the 
  `priority` setting: Mechanisms with a lower numerical `priority` value will be 
  executed first. See also [::MECH_PRIORITY_API], [::MECH_PRIORITY_STREAM] and [::MECH_PRIORITY_NORMAL]. 

  Mechanisms of the same priority will be started in pre-order (i.e. mechanisms on outer DOM nodes before mechanisms on more inner DOM nodes).

  The `prepend` flag is used to coordinate the order of execution
  when there are multiple mechanisms *on the same element*. By default,
  mechanisms will be executed in the order that they were
  added. `prepend`=`true` overrides this by adding a mechanism to the
  front of the queue. It guarantees that - given same `priority` - on a particular 
  element, a given mechanism will be executed before all mechanisms 
  that have `prepend`=`false`.

  *** Reentrant abortion ***

  Removing the element to which a mechanism is attached causes the mechanism to be aborted. If the element is removed by the running mechanism itself, 
  then this will cause the mechanism to be reentrantly aborted as soon as it suspends

      document.body .. appendContent(html_elem .. 
                                       Mechanism(function(dom_elem) {
                                         hold(1000);
                                         removeNode(dom_elem);
                                         console.log('this will be executed');
                                         hold(0); // <-- mechanism is aborted here
                                         console.log('not reached');
                                       }));

  This behavior is consistent with how abortion/cancellation works in SJS in general, and is usually what is wanted.
  `spawn` can be used in situations where an action initiated by a mechanism should complete even if the underlying dom element has been removed. This is e.g. done in [::OnClick], as aborting an initiated event handler is - in most circumstances - not desired.
  

@variable MECH_PRIORITY_API
@summary Priority at which API-injecting mechanisms should be executed to ensure that they are available for streams and other mechanisms (100). See [::Mechanism]
   
@variable MECH_PRIORITY_STREAM
@summary Priority at which streams are executed (500). See [::Mechanism]
   
@variable MECH_PRIORITY_NORMAL
@summary Default priority at which mechanisms are (1000). See [::Mechanism]
   
@function Attrib
@altsyntax element .. Attrib(name, value)
@summary An [::ElementWrapper] that adds a HTML attribute to an element
@param {::Element} [element]
@param {String} [name] Attribute name
@param {Boolean|String|sjs:sequence::Stream} [value] Attribute value
@return {::Element}
@desc
  `value` can be an [sjs:sequence::Stream], but only in a
  dynamic (xbrowser) context; if `val` is a Stream and
  this element is used in a static [::Document], an error will
  be thrown. `values` of Stream type will be iterated in a [::DynamicDOMContext] set to 
  `element`'s DOM node.

  If `value` is a boolean (or `value` is a a stream that yields a
  boolean), then the attribute will be set to the string `'true'` if
  `value` is `true`. If the value is `false`, then the attribute will 
  not be set at all (in a dynamic context, where `value` is a stream 
  yielding `false`, the attribute will be removed from the element if present).

  If `value` is not boolean, then it will be cast to a string. This means that
  `Div() .. Attrib('foo', undefined)` yields `<div foo='undefined'></div>` and not
  `<div foo></div>` or `<div></div>` as one might expect. 

  See also [::Prop].

@function Id
@altsyntax element .. Id(id)
@param {::Element} [element]
@param {String|sjs:sequence::Stream} [id]
@summary An [::ElementWrapper] that adds an `id` attribute to an element
@return {::Element}
@desc
  `id` can be an [sjs:sequence::Stream], but only in a
  dynamic (xbrowser) context; if `val` is a Stream and
  this element is used in a static [::Document], an error will
  be thrown.

@function Style
@altsyntax element .. Style(style)
@summary An [::ElementWrapper] that adds to an element's "style" attribute
@param {::Element} [element]
@param {String|undefined} [style]
@return {::Element}
@desc
  Returns a copy of `element` with `style` added to the 
  element's "style" attribute.

  To replace the "style" attribute entirely rather
  than adding to it, use [::Attrib]`('style', newVal)`.

  For a richer way to add styling, see [::CSS].

  If the `style` parameter is `undefined`, `element` will be returned unmodified.


@function Class
@altsyntax element .. Class(class, [flag])
@summary An [::ElementWrapper] that adds a `class` to an element
@param {::Element} [element]
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

  [sjs:sequence::Stream] arguments will be iterated in a [::DynamicDOMContext] set to `element`s DOM node.

@function Content
@altsyntax element .. Content(content)
@summary An [::ElementWrapper] that adds to an element's content
@param {::Element} [element]
@param {::HtmlFragment} [content]
@return {::Element}
@desc
  Returns a copy of `element` with `content` added to the 
  element's content.

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

      

@function Autofocus
@altsyntax element .. Autofocus()
@summary An [::ElementWrapper] that focusses an element when loaded into DOM
@param {::Element} [element]
@return {::Element}
@desc
  Similar to setting an attribute 'autofocus' on an element, but works in 
  more circumstances, e.g. in Bootstrap modal dialog boxes that have tabindex=-1. Also, if the element itself is not focusable, the first child element matching the CSS selector `input, a[href], area[href], iframe` will be focussed.

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
  widget is used. For SJS-based or CommonJS-compliant JS dependencies, this function 
  is unnecessary (just use [sjs:#language/builtins::require]).

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


@feature DynamicDOMContext
@summary An implicitly defined dynamic DOM context
@hostenv xbrowser
@desc
   There are a number of functions in the [surface::] module that operate on 
   the DOM tree and need to be called with a DOM node argument, such as e.g. 
   [surface/field::Valid].

   This is problematic under some circumstances, because we sometimes want to 
   use these functions before the DOM tree has actually been built, and we haven't got a DOM node to pass to the function. E.g.:

       @Button('click me') .. @Enabled(@field.Valid(/* can't pass in a node here *\/))

   The [surface::] module solves this problem by having certain functions automatically inject a "dynamic DOM context" (using [::withDOMContext]) - a variable with dynamic (rather than lexical) scope that contains a reference DOM nodes (or array of DOM nodes).

   E.g. [::Mechanism] executes its mechanism function with a dynamic DOM context set to the DOM node that the mechanism will be executed on. Functions such as [surface/field::Valid] executed inside the mechanism function then automatically bind to this context if they are not explicitly bound to a DOM node:

       @Mechanism(function() { ... @field.Valid() ... } // automatically binds the
                                                        // @field.Valid call to
                                                        // the Mechanism's DOM node

   The injected DOM context has *dynamic extent*, meaning that nested function calls (and even spawned calls) from within the mechanism function will receive this context.

   Most surface functions that take a function as argument inject dynamic DOM contexts when calling that function argument. They include [::Mechanism], [::appendContent], [::replaceContent], [::prependContent], [::insertBefore], [::insertAfter], [::On], [::OnClick].
   
   Most surface functions that take a [sjs:sequence::Stream] argument inject dynamic DOM contexts when playing back the stream. They include [::Attrib], [::Class], [::Enabled].

   The current dynamic DOM context can be retrieved using [::getDOMNode] or [::getDOMNodes].

   Functions that take advantage of dynamically injected DOM contexts in lieu of an 
   explicit DOM node argument include [surface/field::getField], [surface/field::Valid], [surface/field::validate], [surface/field::ValidationState], [surface/field::Value].


@function withDOMContext
@param {DOMNode|Array} [context] DOM node or Array of DOM nodes
@param {Function} [block]
@summary Execute `block` with a [::DynamicDOMContext] set to `context`
@hostenv xbrowser
@desc
   The DOM node(s) are injected as a dynamically-scoped variable using [sjs:sys::withDynVarContext].

   As described under [::DynamicDOMContext], this function is called implicitly by many surface functions, 
   and is rarely useful in user code.

@function getDOMNode
@param {optional DOMNode|Array} [context] DOM node or Array of DOM nodes (overrides use of the [::DynamicDOMContext])
@param {optional String} [selector] CSS selector
@hostenv xbrowser
@summary Retrieve a DOM node from the implicit [::DynamicDOMContext] (or an explicit context if provided)
@desc
   Retrieves the first DOM node in the current [::DynamicDOMContext] (or the explicit `context`, if provided) that matches `selector`. If no `selector` is given, the first node in the context will be returned.

@function getDOMNodes
@param {optional DOMNode|Array} [context] DOM node or Array of DOM nodes (overrides use of the [::DynamicDOMContext])
@param {optional String} [selector] CSS selector
@hostenv xbrowser
@summary Retrieve DOM nodes from the implicit [::DynamicDOMContext] (or an explicit context if provided)
@desc
   Retrieves all DOM node in the current [::DynamicDOMContext] (or the explicit `context`, if provided) that matches `selector`. If no `selector` is given, an array of all root nodes in the context will be returned.

@function replaceContent
@altsyntax parent_element .. replaceContent(html)
@summary Replace the content of a DOM element with a [::HtmlFragment]
@param {DOMElement} [parent_element]
@param {::HtmlFragment} [html] Html to insert
@param {optional Function} [block] Function bounding lifetime of inserted content
@return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
@hostenv xbrowser
@desc
  * See [::appendContent] for notes on the semantics and return value.
  * The original content of `parent_element` is not restored when `block`
    completes - this function simply removes all existing content and then
    acts like [::appendContent] on the now-empty node.

@function appendContent
@altsyntax parent_element .. appendContent(html) { |node1, node2, ...| ... }
@summary Append a [::HtmlFragment] to a DOM element's content
@param {DOMElement} [parent_element] 
@param {::HtmlFragment} [html] Html to append
@param {optional Function} [block] Function bounding lifetime of appended content
@return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
@hostenv xbrowser

@desc

  * See also [::replaceContent], [::prependContent], [::insertBefore] and [::insertAfter].

  * Any [::Mechanism]s contained in `html` will be started in order of their priority setting. Mechanisms of the same priority will be started in pre-order (i.e. mechanisms on outer 
    DOM nodes before mechanisms on more inner DOM nodes).

  * If no function `block` is provided, `appendContent` returns an
    array containing the DOM elements and comment nodes that have
    been appended. Note that this array does not contain any
    top-level text that has been inserted.

  * If a function (or blocklambda) `block` is provided, it will be passed as arguments
    the DOM elements and comment nodes that have been appended. Furthermore, 
    `block` will be executed with an implicit [::DynamicDOMContext] set to the 
    appended DOM elements & comment nodes.
    When `block` 
    exits (normally, by exception or by retraction), the appended nodes will be removed.
    Any [::Mechanism]s running on the inserted nodes will be aborted.

  ### Examples:

      document.body .. appendContent(
        `<div>This will show for only 5 seconds</div>`) {
        ||
        hold(5000); // wait 5s
      }

      document.body .. appendContent(
        `<button>foo</button>
         <button>bar</button>`) {
         |foo_elem, bar_elem|
         // 'foo_elem' and 'bar_elem' contain the DOM elements of the respective buttons
         ...
      }

@function prependContent
@altsyntax parent_element .. prependContent(html) { |node1, node2, ...| ... }
@summary Prepend a [::HtmlFragment] to a DOM element's content
@param {DOMElement} [parent_element] 
@param {::HtmlFragment} [html] Html to prepend
@param {optional Function} [block] Function bounding lifetime of prepended content
@return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
@hostenv xbrowser

@desc
  * See [::appendContent] for notes on the semantics and return value.

@function insertBefore
@altsyntax sibling_node .. insertBefore(html) { |node1, node2, ...| ... }
@summary Insert a [::HtmlFragment] before the given sibling node
@param {DOMNode} [sibling_node] Sibling before which to insert
@param {::HtmlFragment} [html] Html to insert
@param {optional Function} [block] Function bounding lifetime of inserted content
@return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
@hostenv xbrowser

@desc
  * See [::appendContent] for notes on the semantics and return value.

@function insertAfter
@altsyntax sibling_node .. insertAfter(html) { |node1, node2, ...| ... }
@summary Insert a [::HtmlFragment] after the given sibling node
@param {DOMNode} [sibling_node] Sibling before which to insert
@param {::HtmlFragment} [html] Html to insert
@param {optional Function} [block] Function bounding lifetime of inserted content
@return {Array|void} `void` if `block` has been provided; array of inserted DOM elements otherwise
@hostenv xbrowser

@desc
  * See [::appendContent] for notes on the semantics and return value.

@function removeNode
@param {DOMNode} [node] Node to remove
@summary Remove a DOM node from the document
@hostenv xbrowser
@desc
  * This function can be used to remove any DOM node from
    document - whether it has been inserted using one of the surface
    module functions ([::appendContent], etc).

  * `removeNode` will abort any [::Mechanism]s running on the node
    and release any [::CSS] references.

  * Note that you can remove DOM nodes inserted using surface module functions also
    using normal DOM operations (e.g. removeChild), however any [::Mechanism]s that might
    be running on the content will not be aborted, and [::CSS] references will not be
    released. This might change in future versions of the library.

@function Prop
@altsyntax element .. Prop(name, value)
@summary An [::ElementWrapper] that adds a javascript property to an element
@param {::Element} [element]
@param {String} [name] Property name
@param {Object} [value] Property value
@return {::Element}
@hostenv xbrowser
@desc
  Sets a javascript property
  on the element's DOM node once it is inserted into the document.

  See also [::Attrib].

@function Enabled
@altsyntax element .. Enabled(obs)
@summary An [::ElementWrapper] that adds a `disabled` attribute to element when obs is not truthy
@param {::Element} [element]
@param {sjs:sequence::Stream} [obs] Stream of true/false values (typically an [sjs:observable::Observable])
@return {::Element}
@hostenv xbrowser
@desc
   Works on most elements that accept user input, such as buttons, input element, checkboxes.
   
   `obs` is iterated in a [::DynamicDOMContext] set to `element`s DOM node.

@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   var Flag = @ObservableVar(false);

   @mainContent .. @appendContent(
     @demo.CodeResult("\
     @ = require(['mho:std','mho:app']);

     var Flag = @ObservableVar(false);

     @mainBody .. @appendContent([
       @Button('Test') .. @Enabled(Flag),
       @Input('Test') .. @Enabled(Flag)
     ]);

     while (true) {
       hold(2000);
       Flag.modify(val -> !val);
     }",
     [@Button('Test') .. @Enabled(Flag),
      @Input('Test') .. @Enabled(Flag) .. @Style('margin-top:5px')]));
    
     resize();
     while (1) {
       hold(2000);
       Flag.modify(val -> !val);
     }

@function On
@altsyntax element .. On(event, [settings], event_handler)
@summary An [::ElementWrapper] that adds an event handler on an element
@param {::Element} [element]
@param {String} [event] Name of the event, e.g. 'click'
@param {optional Object} [settings] Settings as described at [sjs:event::events].
@param {Function} [event_handler] 
@return {::Element}
@hostenv xbrowser
@desc
  Sets an event handler on the element's DOM once it is inserted into the document.

  `event_handler` will be passed the DOM event object (possibly amended by the provided `settings` - see [sjs:event::events]), and executed with an implicit [::DynamicDOMContext] set to `element`s DOM node.

  Note that no buffering of events takes place: any events emitted
  while `event_handler` is blocked will have no effect.

  Also note that `event_handler` will be aborted if `element` is removed from the DOM while `event_handler` is running.
  See also the 'Reentrant abortion' section under [::Mechanism].

@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   @mainContent .. @appendContent(
     @demo.CodeResult(
       "@Button('mouse me over') .. 
     @On('mouseover', ev -> @mainContent ..
                              @appendContent(String(ev)))",
       @Button('mouse me over') .. 
         @On('mouseover', ev -> @mainContent .. 
           @appendContent(String(ev)))
     ));

@function OnClick
@altsyntax element .. OnClick([settings], event_handler)
@summary An [::ElementWrapper] that adds a 'click' event handler on an element
@param {::Element} [element]
@param {optional Object} [settings] Settings as described at [sjs:event::events].
@param {Function} [event_handler] 
@return {::Element}
@hostenv xbrowser
@desc
  See also [::On].

  Note that, as for [::On], no buffering of events takes place: any events emitted
  while `event_handler` is blocked will have no effect.     

  Also note that `OnClick` has a different abort behavior than mechanisms or [::On]:
  Once the event handler is triggered it will NOT be aborted when `element` is removed from the DOM.
  See also the 'Reentrant abortion' section under [::Mechanism].

@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   @mainContent .. @appendContent(
     @demo.CodeResult(
       "@Button('click me') ..
     @OnClick({handle: @stopEvent},
        ev -> @mainContent .. @appendContent(String(ev)))",
      @Button('click me') ..
        @OnClick({handle: @stopEvent},
        ev -> @mainContent ..
                        @appendContent(String(ev)))
     ));

@function ContentGenerator
@summary A [::HtmlFragment] consisting of content generated dynamically after inserting in the DOM
@return {::HtmlFragment}
@param {Function} [generator] Function that will generate content
@desc
  `generator` is a function of signature `f(append, node)`. It will be called when the ContentGenerator
  is inserted into the DOM (directly or indirectly via a parent of the ContentGenerator 
  being inserted into the DOM).

  The `append` parameter is a function that `generator` can use to insert content into the DOM. 
  `node` is the (comment) node that anchors the ContentGenerator in the DOM and next to which the 
  generated content will be inserted. `append` returns an array of inserted DOM nodes.

  The generator function will be executed at priority [::MECH_PRIORITY_STREAM].

@function CollectStream
@hostenv xbrowser
@summary A [::HtmlFragment] for inserting all elements of a stream into the DOM
@param {sjs:sequence::Stream} [stream]
@param {optional Object} [settings]
@setting {optional Function} [post_append] Function to execute for each appended item. Will be called with the inserted DOM (an array) as first argument
@return {::HtmlFragment}
@desc
  `stream` will be iterated when the CollectStream is inserted into the DOM (directly or indirectly via a 
  parent of the CollectStream being inserted into the DOM).

  Elements of `stream` will be appended to the DOM as they are produced.

@function ReplaceStream
@hostenv xbrowser
@summary A [::HtmlFragment] for inserting the most recent element of a stream into the DOM, replacing the previous element
@param {sjs:sequence::Stream} [stream]
@param {optional Object} [settings]
@setting {optional Function} [post_update] Function to execute after each time a stream element has been inserted into the DOM. Will be called with the inserted DOM (an array) as first argument
@return {::HtmlFragment}
@desc
  `stream` will be iterated when the ReplaceStream is inserted into the DOM (directly or indirectly via a 
  parent of the CollectStream being inserted into the DOM).

  Elements of `stream` will be inserted into the DOM as they are produced.

@function ScrollStream
@hostenv xbrowser
@summary A [::HtmlFragment] for inserting elements of a stream into the DOM as the user scrolls vertically
@param {sjs:sequence::Stream} [stream]
@param {optional Object} [settings]
@setting {Integer} [tolerance=0] Distance (in pixels) that an element needs to be off-screen before we stop appending elements and wait for scrolling
@setting {Function} [post_append] Function `f(appended_node_array)` to call after each item in the stream has been appended. 
@setting {::HtmlFragment} [in_progress_html] [::HtmlFragment] to show while the stream is still being iterated. Will be appended at the end and removed when `stream` is finished.
@setting {::HtmlFragment} [empty_html] [::HtmlFragment] to show if the stream is empty. 
@return {::HtmlFragment}
@desc
  `stream` will be iterated when the ScrollStream is inserted into the DOM (directly or indirectly via a 
  parent of the ScrollStream being inserted into the DOM).

  Elements of `stream` will be appended to the DOM as they are produced and only up the point where they overflow
  the window. When the user scrolls the last element into view, more elements will be inserted.

  If a `post_append` function is provided, it will be called with an array of the top DOM nodes of each appended element. If `post_append` returns a truthy value, no overflow check will be made, and the next element from `stream` will be appended.

@function focus
@param {DOMNode} [node] DOM node to focus
@summary Focus given node or, if node is not focussable, first focussable child thereof
@hostenv xbrowser
@desc
  `focus(node)` will attempt to focus `node`, or, if that doesn't succeed, the first
  child of `node` that matches the selector `input, a[href], area[href], iframe`.

@function Document
@hostenv nodejs
@summary Generate a static document
@return {string}
@param {surface::HtmlFragment} [content] Document content
@param {Settings} [settings]
@setting {surface::HtmlFragment} [title] Document title
@setting {surface::HtmlFragment} [head] Additional HTML content to appear in the document's <head> (before SJS is initialized)
@setting {String|sjs:quasi::Quasi} [init] SJS source code to run on the client once SJS is initialized
@setting {String} [main] SJS module URL to run on the client
@setting {Array}  [externalScripts] Array of Javascript script URLs to add to the page
@setting {Object} [templateData] object which will be be passed through to the template function
@setting {surface::HtmlFragment} [runtimeInit] Override the default SJS runtime initialization
@setting {Function|String} [template="default"] Document template
@desc
  **Note:** the `head` and `title` settings can be any [surface::HtmlFragment] type,
  but since they're used for customising the HTML <head> before SJS is initialized, only the
  raw HTML value be used (i.e any mechanisms and other non-html content on these objects will be ignored).

  If `template` is a function, it will be called with a single argument - an object containing the following properties:

   - head: html to be inserted into the <head> element
   - script: initialization, as a <script type="text/sjs"> tag
   - body: the main document content

  If `template` is a string, it will be passed to [::loadTemplate], and the returned
  function will be called as above.

  `template` must return a [sjs:quasi::Quasi].

  #### Example usage inside a [mho:#features/gen-file::]

  Plain (template [mho:surface/doc-template/plain::]):

      // hello-plain.html.gen
      @ = require(['mho:std']);

      exports.content = -> @Document(`<h1>Hello, world</h1>`, {template:'plain'});
      
  Bootstrap-enabled (template [mho:surface/doc-template/default::]):

      // hello.html.gen
      @ = require(['mho:std', 'mho:surface/bootstrap']);

      exports.content = -> @Document(@PageHeader('Hello, Bootstrap world'));
      


@function loadTemplate
@hostenv nodejs
@summary Load a template module
@param {String} [name] template name or module URL
@param {optional String} [base] base URL
@desc
  Loads a template module by name or URL and returns its
  Document property (which should be a function).

  If `name` does not contain path separators it is assumed to name a module
  in [./surface/doc-template/::].

  Otherwise, `name` is normalized against `base` (using [sjs:url::normalize]). If
  you do not pass a `base` argument, `name` must be an absolute URL.

*/
