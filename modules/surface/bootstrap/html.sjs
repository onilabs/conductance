@ = require(['sjs:object', '../../surface']);

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
function wrapWithClass(baseWidget, cls) {
  return (content, attribs) -> baseWidget(content, attribs) .. @Class(cls);
}

/**
  @function Button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <button class="btn">
  @return {surface::Widget}
*/
exports.Button = wrapWithClass(base_html.Button, 'btn');

/**
  @function Table
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <table class="table">
  @return {surface::Widget}
*/
exports.Table = wrapWithClass(base_html.Table, 'table');

/**
  @function Input
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <input class="form-control">
  @return {surface::Widget}
*/
exports.Input = wrapWithClass(base_html.Input, 'form-control');

/**
  @function TextInput
  @param {String|sjs:sequence::Stream} [value]
  @param {optional Object} [attribs]
  @summary [../html::TextInput] with class "form-control"
  @return {surface::Widget}
*/
exports.TextInput = wrapWithClass(base_html.TextInput, 'form-control');

/**
  @function TextArea
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <textarea class="form-control">
  @return {surface::Widget}
*/
exports.TextArea = wrapWithClass(base_html.TextArea, 'form-control');

/**
  @function Select
  @param {Object} [settings]
  @summary [../html::Select] with class "form-control"
  @return {surface::Widget}
*/
exports.Select = wrapWithClass(base_html.Select, 'form-control');

/**
  @function Icon
  @param {String} [name]
  @summary <span class="glyphicon glyphicon-{name}">
  @return {surface::Widget}
*/
exports.Icon = name -> @Widget('span', '', { 'class': "glyphicon glyphicon-#{name}"});

/**
  @function Row
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="row">
  @return {surface::Widget}
*/
exports.Row = (content, attribs) -> @Widget('div', content, attribs) .. @Class('row');

/**
  @function ColSm
  @param {Number} [num]
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="col-sm-{num}">
  @return {surface::Widget}
*/
exports.ColSm = (n, content, attribs) -> @Widget('div', content, attribs) .. @Class("col-sm-#{n}");

/**
  @function Container
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="container">
  @return {surface::Widget}
*/
exports.Container = (content, attribs) -> @Widget('div', content, attribs) .. @Class('container');

/**
  @function Label
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <label class="label [label-{attribs.type}]">
  @return {surface::Widget}
*/
exports.Label = (content, attribs) -> @Widget('label', content, attribs) .. @Class("label #{attribs.type ? "label-#{attribs.type}" : ''}");

/**
  @function PageHeader
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attribs]
  @summary <div class="page-header"><h1>{content}</h1></div>
  @return {surface::Widget}
*/
exports.PageHeader = (content, attribs) -> @Widget('div', `<h1>$content</h1>`, attribs) .. @Class('page-header');

