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
  @nodoc
  @noindex
  (documented as mho:surface/bootstrap)
*/


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
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled button (`<button class="btn btn-default">`)
  @return {surface::Element}
  @desc
    * See also [::Btn] for creating buttons with more style choices.
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Button('Click me')",
        @Button('Click me')
      )]);

    
*/
exports.Button = wrapWithClasses(base_html.Button, ['btn', 'btn-default']);

/**
  @function Table
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled table (`<table class="table">`)
  @return {surface::Element}
*/
exports.Table = wrapWithClass(base_html.Table, 'table');

/**
  @function Input
  @summary Bootstrap-styled input (`<input class="form-control">`)
  @param  {String} [type]
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value] 
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar], then `value` will
    be updated to reflect any manual changes to the element's value.
*/
exports.Input = wrapWithClass(base_html.Input, 'form-control');

/**
  @function TextInput
  @summary Bootstrap-styled [surface/html::TextInput] (with class "form-control")
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar], then `value` will
    be updated to reflect any manual changes to the element's value.
*/
exports.TextInput = wrapWithClass(base_html.TextInput, 'form-control');

/**
  @function TextArea
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled textarea (`<textarea class="form-control">`)
  @return {surface::Element}
*/
exports.TextArea = wrapWithClass(base_html.TextArea, 'form-control');

/**
  @function Select
  @param {Object} [settings]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled [surface/html::Select] (with class "form-control")
  @return {surface::Element}
*/
exports.Select = wrapWithClass(base_html.Select, 'form-control');

