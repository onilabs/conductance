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
  @summary Conductance sub-system for constructing static and dynamic client-side UI
*/

var modules = ['./surface/base'];
if (require('sjs:sys').hostenv === 'xbrowser') {
  modules.push('./surface/dynamic');
} else {
  modules.push('./surface/static');
}
module.exports = require(modules);


// GENERATED DOCS FOLLOW:

/**

@require ./surface/base
@require ./surface/dynamic

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
     Typically, this will be an [sjs:observable::ObservableVar] or a Stream derived from one.

  Any other types will be coerced to a String wherever a HtmlFragment
  is required.

  Note: Streams are only allowed for content that will be used in
  the 'dynamic world' (i.e. client-side). Attempting to add
  a stream to a [::Document] will raise an error.

@class Element
@__inherit__ CURRENTLY HIDDEN ::CollapsedFragment
@summary A [::HtmlFragment] rooted in a single HTML element

@function Element
@param {String} [tag]
@param {::HtmlFragment} [content] Content to set on DOM element
@param {optional Object} [attributes] Object with {name: string} attributes to set on DOM element
@return {::Element}
@desc 
  ### Notes
  
  * As an alternative to specifying `attributes`, see the the [::Attrib] decorator.

@function isElement
@param {Object} [element]
@summary Test whether `element` is an [::Element]
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
@summary Wrap a [::HtmlFragment] in an [::Element] with tag name 'surface-ui', if it isn't already one.

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

@function GlobalCSS
@param {String} [style]
@return {::HtmlFragment}
@summary Create a global CSS style
@desc
  Creates a widget which (when inserted into the document)
  adds the given `style` CSS rules. Unlike [::CSS], the attached style
  will not be scoped to any particular widget.

@function Mechanism
@altsyntax element .. Mechanism(mechanism)
@param {optional ::HtmlFragment} [element]
@param {Function|String} [mechanism]
@summary Add a mechanism to an element
@return {::Element|Function}
@desc
  Whenever an instance of the returned element is inserted into the
  document using [::appendContent] or one of the surface module's other \
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
@summary Focus element when loaded into DOM
@param {::HtmlFragment} [element]
@return {::Element}
@desc
  Similar to setting an attribute 'autofocus' on an element, but works in 
  more circumstances, e.g. in Bootstrap modal dialog boxes that have tabindex=-1.

  If `Autofocus` is applied to a [::HtmlFragment] that is not of class [::Element], 
  `element` will automatically be wrapped using [::ensureElement].

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

  * Any [::Mechanism]s contained in `html` will be started in post-order (i.e. mechanisms on inner 
    DOM nodes before mechanisms on more outer DOM nodes).

  * If no function `block` is provided, `appendContent` returns an
    array containing the DOM elements and comment nodes that have
    been appended. Note that this array does not contain any
    top-level text that has been inserted.

  * If a function (or blocklambda) `block` is provided, it will be passed as arguments
    the DOM elements and comment nodes that have been appended. When `block` 
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
@summary Add a javascript property to an element
@param {::HtmlFragment} [element]
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
@summary Add a `disabled` attribute to element when obs is not truthy
@param {::HtmlFragment} [element]
@param {sjs:observable::Observable} [obs] Observable
@return {::Element}
@hostenv xbrowser
@desc
   Works on most elements that accept user input, such as buttons, input element, checkboxes
@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   var Flag = @ObservableVar(false);

   @mainContent .. @appendContent(
     @demo.CodeResult("\
     @ = require(['mho:std','mho:app']);

     var Flag = @ObservableVar(false);

     @mainBody .. @appendContent([
       @Button('Test') .. @Enabled(Flag),
       @TextInput('Test') .. @Enabled(Flag)
     ]);

     while (true) {
       hold(2000);
       Flag.modify(val -> !val);
     }",
     [@Button('Test') .. @Enabled(Flag),
      @TextInput('Test') .. @Enabled(Flag) .. @Style('margin-top:5px')]));
    
     resize();
     while (1) {
       hold(2000);
       Flag.modify(val -> !val);
     }

@function On
@altsyntax element .. On(event, [settings], event_handler)
@summary Adds an event handler on an element
@param {::HtmlFragment} [element]
@param {String} [event] Name of the event, e.g. 'click'
@param {optional Object} [settings] Settings as described at [sjs:event::events].
@param {Function} [event_handler] 
@return {::Element}
@hostenv xbrowser
@desc
  Sets an event handler on the element's DOM once it is inserted into the document.

  Note that no buffering of events takes place: any events emitted
  while `event_handler` is blocked will have no effect.     
@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   @mainContent .. @appendContent(
     @demo.CodeResult(
       "@Button('mouse me over') .. 
     @On('mouseover', ev -> @mainContent ..
                              @appendContent(ev))",
       @Button('mouse me over') .. 
         @On('mouseover', ev -> @mainContent .. 
           @appendContent(ev))
     ));

@function OnClick
@altsyntax element .. OnClick([settings], event_handler)
@summary Adds a 'click' event handler on an element
@param {::HtmlFragment} [element]
@param {optional Object} [settings] Settings as described at [sjs:event::events].
@param {Function} [event_handler] 
@return {::Element}
@hostenv xbrowser
@desc
  See also [::On].
@demo
   @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);
   @mainContent .. @appendContent(
     @demo.CodeResult(
       "@Button('click me') .. 
     @OnClick(ev -> @mainContent ..
                      @appendContent(ev))",
       @Button('click me') .. 
         @OnClick(ev -> @mainContent .. 
                          @appendContent(ev))
     ));

@function Document
@hostenv nodejs
@summary Generate a static document
@return {string}
@param {surface::HtmlFragment} [content] Document content
@param {Settings} [settings]
@setting {surface::HtmlFragment} [title] Document title
@setting {surface::HtmlFragment} [head] Additional HTML content to appear in the document's <head> (before SJS is initialized)
@setting {String} [init] SJS source code to run on the client once SJS is initialized
@setting {String} [main] SJS module URL to run on the client
@setting {Array}  [externalScripts] Array of Javascript script URLs to add to the page
@setting {Object} [templateData] object which will be be passed through to the template function
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
