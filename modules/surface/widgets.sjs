var { Widget, Mechanism } = require('./html');
var { replaceContent } = require('./dynamic');
var { HostEmitter, Stream } = require('sjs:events');
var { each, map } = require('sjs:sequence');
var { override } = require('sjs:object');
var { isObservable, isMutatable, Computed, Value } = require('../observable');

//----------------------------------------------------------------------
/**
 @function Div
 @summary A plain HTML 'div' widget
 @param  {html::HtmlFragment} [content] Html content.
 @return {html::Widget}
*/
var Div = content -> Widget('div', content);
exports.Div = Div;

//----------------------------------------------------------------------
/**
 @function Button
 @summary A plain HTML 'button' widget
 @param  {html::HtmlFragment} [title] Button title.
 @return {html::Widget}
*/
var Button = title -> Widget('button', title || 'A button');
exports.Button = Button;

//----------------------------------------------------------------------
/**
 @function Form
 @summary A plain HTML 'form' widget
 @param  {html::HtmlFragment} [content] Html content.
 @return {html::Widget}
*/
var Form = content -> Widget('form', content);
exports.Form = Form;

//----------------------------------------------------------------------
/**
 @function TextInput
 @summary A plain HTML 'input' widget
 @param  {String|../observable::Observable} [value] Value.
 @return {html::Widget}
*/
var TextInput = value ->
  Widget('input') ..
  Mechanism(function(node) {
    node.value = Value(value);
    if (isObservable(value)) {
      waitfor {
        value.observe {
          |change|
          if (node.value !== Value(value))
            node.value = Value(value);
        }
      }
      and {
        if (isMutatable(value)) {
          HostEmitter(node, 'input') .. Stream .. each {
            |ev|
            value.set(node.value);
          }
        }
      }
    }
  });
exports.TextInput = TextInput;

//----------------------------------------------------------------------
/**
 @function Select
 @summary A plain HTML 'select' widget
 @param  {Object} [settings] Widget settings
 @setting {Boolean} [multiple=false] Whether or not this is a multi-selection widget
 @setting {Array|../observable::Observable} [items] Selectable items
 @return {html::Widget}
*/

function SelectObserverMechanism(ft, items) {
  return ft .. Mechanism(function(node) {
    items.observe {
      |change|
      node .. replaceContent(
        Computed(items, 
                 items -> items .. map(c -> `<option>$c</option>`)))
    }
  });
}

function Select(settings) {
  settings = {
    multiple: false,
    items: []
  } .. override(settings);

  var dom_attribs = {};
  if (settings.multiple)
    dom_attribs.multiple = true;

  var rv = Widget('select',
                  // XXX use a computed 'Map' here
                  Computed(settings.items, 
                           items -> items .. map(c -> `<option>$c</option>`)),
                  dom_attribs);
  if (isObservable(settings.items)) 
    rv = rv .. SelectObserverMechanism(settings.items);

  return rv;
}
exports.Select = Select;

