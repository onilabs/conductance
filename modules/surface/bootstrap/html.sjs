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

@ = require(['sjs:object', 'sjs:sequence', '../../surface', 'sjs:quasi']);

/**
  @summary Bootstrap HTML module
  @desc
    All of the symbols in this module are also exposed by the [mho:app::] module in various [mho:#features/app-file::] templates (see [mho:surface/doc-template/::] for a list of templates.)

    This module should be used instead of [../html::] for Bootstrap-enabled
    documents. It provides all of the symbols from [../html::], but
    adds / overrides the symbols documented here to add bootstrap classes
    and functionality.
*/

// xxx helper that's also in ../html.sjs.
// map each value of a stream of input if it is an Observable / Stream, else
// just `map` them.
function _map(items, fn) {
  if (@isStream(items))
    return items .. @transform(val -> @map(val, fn));
  return items .. @map(fn);
}

function hasClass(elem,cls) {
  return @isElement(elem) && (elem._normalizeClasses().indexOf(cls) !== -1);
}

function prefixClasses(classes, prefix) {
  if (!classes) return [];
  return classes.split(' ') .. @map(cls -> prefix+cls);
}

//----------------------------------------------------------------------
// BASIC HTML ELEMENTS, SPECIALIZED WITH BS STYLES

var base_html = require('../html');

// export all elements from surface/html.sjs:

exports .. @extend(base_html);

// ... and override with bootstrap specializations:

// XXX there has to be a better way to set the classes here
__js function wrapWithClass(baseElement, cls) {
  return () -> baseElement.apply(null, arguments) .. @Class(cls);
}

__js function callWithClass(baseElement, cls, content, attribs) {
  return baseElement.call(null, content, attribs) .. @Class(cls);
}

// XXX use of @Class this way is undocumented, but works
// for an array of non-observable class names
var wrapWithClasses = wrapWithClass;
var callWithClasses = callWithClass;

/**
  @function Button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <button class="btn">
  @return {surface::Element}
*/
exports.Button = wrapWithClasses(base_html.Button, ['btn', 'btn-default']);

/**
  @function Table
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <table class="table">
  @return {surface::Element}
*/
exports.Table = wrapWithClass(base_html.Table, 'table');

/**
  @function Input
  @summary <input class="form-control">
  @param  {String} [type]
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value] 
  @param  {optional Object} [attrs] Hash of DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If
    `value` is an [sjs:observable::ObservableVar] (as identified by being a
    [sjs:sequence::Stream] and having a `set` function), then `value` will
    be updated to reflect any manual changes to the element's value.
*/
exports.Input = wrapWithClass(base_html.Input, 'form-control');

/**
  @function TextInput
  @summary [../html::TextInput] with class "form-control"
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If
    `value` is an [sjs:observable::ObservableVar] (as identified by being a
    [sjs:sequence::Stream] and having a `set` function), then `value` will
    be updated to reflect any manual changes to the element's value.
*/
exports.TextInput = wrapWithClass(base_html.TextInput, 'form-control');

/**
  @function TextArea
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <textarea class="form-control">
  @return {surface::Element}
*/
exports.TextArea = wrapWithClass(base_html.TextArea, 'form-control');

/**
  @function Select
  @param {Object} [settings]
  @param {optional Object} [attribs]
  @summary [../html::Select] with class "form-control"
  @return {surface::Element}
*/
exports.Select = wrapWithClass(base_html.Select, 'form-control');


//----------------------------------------------------------------------
// LOW-LEVEL BOOTSTRAP-SPECIFIC ELEMENTS:


/**
  @function Btn
  @summary Bootstrap-style button ("class='btn'") with additional `btn-*` classes applied.
  @param {String} [btn_classes] String of `btn-*` classes to apply to the button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @return {surface::Element}
  @desc
    `btn_classes` is a space-separated list of `btn-*` classes that should be applied to the 
    button:
    
    * **style**: `default`, `primary`, `success`, `info`, `warning`, `danger`, or `link`
    * **sizing**: `lg`, `sm`, or `xs` (or none)
    * **block-level**: `block` (or none)

  @demo
    @ = require(['mho:std', 'mho:app']);
    var btn_styles = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'];
    var btn_sizes  = ['lg', '', 'sm', 'xs' ];
    @mainContent .. @appendContent([
      btn_styles .. 
        @unpack(cls -> btn_sizes .. @transform(size -> "#{cls} #{size}")) ..
        @transform(cls -> @Btn(cls, "@Btn('#{cls}',CONTENT)") .. @Style("margin:10px;")) ..
        @toArray,
      @Hr(),
      @Btn('block primary', "@Btn('block primary', CONTENT)"),
      @Hr(),
      @Row([
        @Col('sm-6', @Pre("@Btn('primary',\n      `$@Icon('cloud-download') Download`)")),
        @Col('sm-6', @Btn('primary',`$@Icon('cloud-download') Download`))
      ])
        ]
    );
*/
exports.Btn = (btn_classes, content, attribs) ->
  callWithClass(base_html.Button,
    ['btn'].concat(prefixClasses(btn_classes,'btn-')),
    content, attribs);

/**
  @function Icon
  @param {String} [name]
  @summary <span class="glyphicon glyphicon-{name}">
  @param {optional Object} [attribs]
  @return {surface::Element}
*/
exports.Icon = (name, attribs) -> callWithClasses(base_html.Span, ["glyphicon", "glyphicon-#{name}"], '', attribs);

/**
  @function Row
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="row">
  @return {surface::Element}
*/
exports.Row = wrapWithClass(base_html.Div, 'row');

/**
  @function Col
  @summary <div class="col-`col_classes`">
  @param {String} [col_classes] String of `col-*` classes to apply to the col
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @return {surface::Element}
  @desc
    `col_classes` is a space-separated list of `col-*` classes that 
    should be applied to the col (`N` designates an integer between 1-12, `M` an integer between 0-11):

    * **width**: one or more of `xs-N`, `sm-N`, `md-N`, `lg-N`.
    * **offset**: one or more of `xs-offset-M`, `sm-offset-M`, `md-offset-M`, `lg-offset-M`.
    * **pulling left**: one or more of `xs-pull-M`, `sm-pull-M`, `md-pull-M`, `lg-pull-M`.
    * **pushing right**: one or more of `xs-push-M`, `sm-push-M`, `md-push-M`, `lg-push-M`.
*/
exports.Col = (col_classes, content, attribs) ->
  callWithClasses(base_html.Div, prefixClasses(col_classes,'col-'), content, attribs);

/**
  @function Container
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="container">
  @return {surface::Element}
*/
exports.Container = wrapWithClass(base_html.Div, 'container');

/**
  @function Lead
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary Lead body paragraph <p class='lead'>...</p>
  @return {surface:Element}
*/
exports.Lead = wrapWithClass(base_html.P, 'lead');

/**
  @function ListGroup
  @param {Array} [items] Array of [surface::HtmlFragment]s
  @param {optional Object} [attribs]
  @summary <div class='list-group'><div class='list-group-item'>...</div>...</div>
  @return {surface::Element}
*/
exports.ListGroup = (items, attribs) -> callWithClass(base_html.Div, 'list-group',
  items .. _map(item -> item .. hasClass('list-group-item') ? item : base_html.Div(item, {'class':'list-group-item'})),
  attribs);


/**
  @function ListGroupItem
  @summary XXX document me
*/
exports.ListGroupItem = function(/*cls, content*/) {
  if (arguments.length > 1)
    var [cls,content] = arguments;
  else {
    cls = '';
    content = arguments[0];
  }
    
  return @Element('div', content, {'class': 'list-group-item '+prefixClasses(cls, 'list-group-item-') });
}


/**
  @function PageHeader
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="page-header"><h1>{content}</h1></div>
  @return {surface::Element}
*/
exports.PageHeader = (content, attribs) -> callWithClass(base_html.Div, 'page-header', `<h1>$content</h1>`, attribs);

/**
  @function Panel
  @summary Bootstrap-style panel ("<div class='panel'>") with additional `panel-*` classes applied.
  @param {String} [panel_classes] String of `panel-*` classes to apply to the button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @return {surface::Element}
  @desc
    `panel_classes` is a space-separated list of `panel-*` classes that should be applied to the 
    panel:
    
    * **context**: `default`, `primary`, `success`, `info`, `warning`, or `danger`
*/
exports.Panel = (panel_classes, content, attribs) ->
  callWithClasses(base_html.Div, ['panel'].concat(prefixClasses(panel_classes, 'panel-')),
    content, attribs);

/**
  @function PanelBody
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="panel-body">
  @return {surface::Element}
*/
exports.PanelBody = wrapWithClass(base_html.Div, 'panel-body');

/**
  @function PanelHeading
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="panel-heading">
  @return {surface::Element}
*/
exports.PanelHeading = wrapWithClass(base_html.Div, 'panel-heading');

/**
  @function PanelTitle
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <h3 class='panel-title'>
  @return {surface::Element}
*/
exports.PanelTitle = wrapWithClass(base_html.H3, 'panel-title');

//----------------------------------------------------------------------
// HIGH-LEVEL BOOTSTRAP-SPECIFIC CONSTRUCTS:


/**
  @function doModal
  @altsyntax doModal(body, [settings], block)
  @altsyntax doModal([settings]) { |dialog| ... }
  @param {Object} [settings] 
  @param {Function} [block] Function bounding lifetime of dialog; will be called with DOM node of dialog as first argument.
  @return {Object} `undefined` if the dialog is dismissed with the close button, by clicking on the backdrop or typing 'Escape', other equal to the return value of `block`
  @setting {surface::HtmlFragment} [body]
  @setting {optional surface::HtmlFragment} [header] Content of header. Takes precedence over `title` if both are given.
  @setting {optional surface::HtmlFragment} [title] Title to display in a `<h4 class='modal-title'>` in the header.
  @setting {optional Boolean} [close_button=true] Show a close button in the header. Only takes effect if `header` or `title` is given.
  @setting {optional surface::HtmlFragment} [footer]
  @setting {optional Boolean|String} [backdrop=true] Include a modal-backdrop element. Specify `'static'` for a backdrop that doesn't close the modal on click.
  @setting {optional Boolean} [keyboard=true] Close the modal when Escape key is pressed.
  @summary Execute function `block` while showing a modal dialogbox
  @hostenv xbrowser
*/
function doModal() {
  // untangle args:
  var settings = { close_button: true}, block;
  if (typeof arguments[0] === 'string' ||
      @isQuasi(arguments[0]) ||
      @isFragment(arguments[0]) ||
      Array.isArray(arguments[0])) {
    settings = settings .. @merge({body:arguments[0]});
    if (arguments.length > 2) {
      block = arguments[2];
      settings = settings .. @merge(arguments[1]);
    }
    else {
      block = arguments[1];
    }
  }
  else {
    settings = settings .. @merge(arguments[0]);
    block = arguments[1];
  }

  // build content:
  var content = `<div class='modal-body'>${settings.body}</div>`;

  if (!settings.header && settings.title)
    settings.header = `<h4 class='modal-title'>${settings.title}</h4>`;
  if (settings.header) {
    content = [`<div class='modal-header'>${settings.close_button? `<button type='button' class='close' data-dismiss='modal'>&times;</button>`}${settings.header}</div>`, content];
  }
  if (settings.footer) {
    content = [content, `<div class='modal-footer'>${settings.footer}</div>`];
  }

  // build options to pass to bootstrap's modal(.) init call:
  var bs_options = { backdrop: true,
                     keyboard: true,
                   } .. @override(settings);

  document.body .. @appendContent(
    `<div class='modal' tabindex='-1'>
      <div class='modal-dialog'>
        <div class='modal-content'>
          $content
        </div>
      </div>
     </div>`) {
    |dialog|
    
    $(dialog).modal(bs_options);
    try {
      waitfor {
        return block(dialog);
      }
      or {
        waitfor() {
          $(dialog).on('hidden.bs.modal', resume);
        }
      }
    }
    finally {
      $(dialog).modal('hide');
    }
  }
}
exports.doModal = doModal;
