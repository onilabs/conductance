var modules = ['./surface/base'];
if (require('sjs:sys').hostenv === 'xbrowser') {
  modules.push('./surface/dynamic');
} else {
  modules.push('./surface/static');
}
module.exports = require(modules);


// GENERATED DOCS FOLLOW:

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

@class CollapsedFragment
@summary Internal class representing a collapsed [::HtmlFragment]
@inherit ::HtmlFragment

@function isCollapsedFragment

@function collapseHtmlFragment
@param {::HtmlFragment} [ft]
@return {::CollapsedFragment}

@class Widget
@inherit ::CollapsedFragment
@summary A [::HtmlFragment] rooted in a single HTML element

@function Widget
@param {String} [tag]
@param {::HtmlFragment} [content]
@param {optional Object} [attributes]
@return {::Widget}

@function isWidget
@param {Object} [widget]
@return {Boolean}

@function ensureWidget
@param {::HtmlFragment}
@return {::Widget}
@summary Wrap a [::HtmlFragment] in a [::Widget], if it isn't already one.

@function cloneWidget
@param {::Widget} [widget]
@return {::Widget}
@summary Clone `widget`

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

  If `style` is an Observable (or a [sjs:quasi::Quasi] containing
  any observable values), the style will be recomputed and updated
  whenever any of the composite observable values changes.

  If `widget` is not provided, `Style` will
  return a cached style function which can later be
  called on a [::Widget] to apply the given style.
  When reusing styles, it is more efficient to create an
  intermediate `Style` function in this way, because it
  ensures that underlying <style> elements are re-used.

@function RequireStyle
@param {::Widget} [widget]
@param {String} [url]
@summary Add an external stylesheet to a widget
@desc
  Note that unlike [::Style], external stylesheets
  will not b scoped to the widget's root element -
  they will be applid globally for as long as `widget`
  is present in the document.

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

@function Id
@param {::Widget} [widget]
@param {String|observable::Observable} [id]
@summary Add an `id` attribute to a widget
@return {::Widget}

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

@function replaceContent

@function replaceElement

@function appendContent

@function prependContent

@function insertBefore

@function insertAfter

@function removeElement

@function appendWidget

@function prependWidget

@function withWidget

@function Document
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

  `template` must return a String.

  If `template` is a string, it will be passed to [::loadTemplate], and the returned
  function will be called as above.

@function loadTemplate
@param {String} [name] template name or module URL
@param {optional String} [base] base URL
@desc
  Loads a template module by name or URL and returns its
  Document property (which should be a function).

  If `name` does not contain path separators it is assumed to name a builtin
  template, which are currently:

   - default
   - plain
   - app-default
   - app-plain

  Otherwise, `name` is normalized against `base` (using [sjs:url::normalize]). If
  you do not pass a `base` argument, `name` must be an absolute URL.

*/
