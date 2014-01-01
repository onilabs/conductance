/* (c) 2013 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

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
function wrapWithClass(baseElement, cls) {
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

