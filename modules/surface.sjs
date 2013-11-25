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


  Note: Observables are only allowed for content that will be used in 
  the 'dynamic world' (i.e. client-side).

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

@function RequireStyle
@summary Add an external stylesheet to a widget

@function Mechanism
@summary Add a mechanism to a widget

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
