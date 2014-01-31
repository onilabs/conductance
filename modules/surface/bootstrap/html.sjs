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
    This module should be used instead of [../html::] for Bootstrap-enabled
    documents. It provides all of the symbols from [../html::], but
    adds / overrides the symbols documented here to add bootstrap classes
    and functionality.
*/

var base_html = require('../html');


// export all elements from surface/html.sjs:

exports .. @extend(base_html);

// ... and override with bootstrap specializations:

// XXX there has to be a better way to set the classes here
__js function wrapWithClass(baseElement, cls) {
  return () -> baseElement.apply(null, arguments) .. @Class(cls);
}

/**
  @function Button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <button class="btn">
  @return {surface::Element}
*/
exports.Button = wrapWithClass(base_html.Button, 'btn');

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
    * **sizing**: `lg`, `sm`, or `xs`
    * **block-level**: `block`
*/
exports.Btn = (btn_classes, content, attribs) -> 
  (wrapWithClass(base_html.Button, 'btn '+(btn_classes.split(' ') .. @map(cls->'btn-'+cls) .. @join(' '))))(content, attribs);

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
  @param  {String} [type]
  @param {String|sjs:sequence::Stream} [value]
  @param {optional Object} [attribs]
  @summary <input class="form-control">
  @return {surface::Element}
*/
exports.Input = wrapWithClass(base_html.Input, 'form-control');

/**
  @function TextInput
  @param {String|sjs:sequence::Stream} [value]
  @param {optional Object} [attribs]
  @summary [../html::TextInput] with class "form-control"
  @return {surface::Element}
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
  @summary [../html::Select] with class "form-control"
  @return {surface::Element}
*/
exports.Select = wrapWithClass(base_html.Select, 'form-control');

/**
  @function Icon
  @param {String} [name]
  @summary <span class="glyphicon glyphicon-{name}">
  @return {surface::Element}
*/
exports.Icon = name -> @Element('span', '', { 'class': "glyphicon glyphicon-#{name}"});

/**
  @function Row
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="row">
  @return {surface::Element}
*/
exports.Row = (content, attribs) -> @Element('div', content, attribs) .. @Class('row');

/**
  @function ColSm
  @param {Number} [num]
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="col-sm-{num}">
  @return {surface::Element}
*/
exports.ColSm = (n, content, attribs) -> @Element('div', content, attribs) .. @Class("col-sm-#{n}");

/**
  @function Container
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="container">
  @return {surface::Element}
*/
exports.Container = (content, attribs) -> @Element('div', content, attribs) .. @Class('container');

/**
  @function Label
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <label class="label [label-{attribs.type}]">
  @return {surface::Element}
*/
exports.Label = (content, attribs) -> @Element('label', content, attribs) .. @Class("label #{attribs.type ? "label-#{attribs.type}" : ''}");

/**
  @function PageHeader
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="page-header"><h1>{content}</h1></div>
  @return {surface::Element}
*/
exports.PageHeader = (content, attribs) -> @Element('div', `<h1>$content</h1>`, attribs) .. @Class('page-header');

/**
  @function doModal
  @altsyntax doModal(body, [settings], block)
  @param {Object} [settings] 
  @param {Function} [block] Function bounding lifetime of dialog
  @return `undefined` if the dialog is dismissed with the close button, by clicking on the backdrop or typing 'Escape', other equal to the return value of `block`
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
