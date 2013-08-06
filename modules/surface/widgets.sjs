var { Widget, Mechanism, Attrib } = require('./html');
var { replaceContent, appendContent, prependContent, Prop, removeElement, insertBefore } = require('./dynamic');
var { HostEmitter, Stream } = require('sjs:events');
var { integers, each, map, indexed, filter, sort, slice } = require('sjs:sequence');
var { areEquivalentArrays, isArrayLike } = require('sjs:array');
var { override } = require('sjs:object');
var { isObservable, isObservableArray, isMutatable, Computed, get, Map, at } = require('../observable');

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
    node.value = get(value);
    if (isObservable(value)) {
      waitfor {
        value.observe {
          |val|
          if (node.value !== val)
            node.value = val;
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
 @function Checkbox
 @summary A HTML 'checkbox' widget
 @param  {Boolean|../observable::Observable} [value] Value.
 @return {html::Widget}
*/
var Checkbox = value ->
  Widget('input') ..
  Attrib("type", "checkbox") ..
  Mechanism(function(node) {
    node.checked = Boolean(get(value));
    if (isObservable(value)) {
      waitfor {
        value.observe {
          |current|
          current = Boolean(current);
          if (node.checked !== current) node.checked = current;
        }
      }
      and {
        if (isMutatable(value)) {
          HostEmitter(node, 'change') .. Stream .. each {
            |ev|
            value.set(node.checked);
          }
        }
      }
    }
  });
exports.Checkbox = Checkbox;

//----------------------------------------------------------------------
/**
 @function Select
 @summary A plain HTML 'select' widget
 @param  {Object} [settings] Widget settings
 @setting {Boolean} [multiple=false] Whether or not this is a multi-selection widget
 @setting {Array|../observable::Observable} [items] Selectable items
 @return {html::Widget}
*/


function selectedIndices(items, selection) {
  items = get(items);
  var rv = {};
  var selection_arr = get(selection);
  if (!isArrayLike(selection_arr)) 
    selection_arr = [selection_arr];
  selection_arr .. 
    map(selected_item -> items.indexOf(selected_item)) .. each {
      |index|
      rv[index] = true;
    }
  return rv;
}

function updateSelectionHtml(node, items, selection) {
  var select_map = selectedIndices(items, selection);
  node.querySelectorAll('option') ..
  indexed .. each {
    |[index, elem]|
    elem.selected = select_map[index];
  }
}

function SelectOptionsObserverMechanism(ft, items, selection) {
  return ft .. Mechanism(function(node) {
    items.observe {
      |_items, change|
      switch (change.type) {
      case 'splice':
        if (change.removed) {
          node.querySelectorAll('option') .. 
            slice(change.index, change.index + change.removed) .. 
            each { |elem| elem .. removeElement }
        }
        if (change.added) {
          var new_html = integers(change.index, change.index + change.added - 1) ..
            map(i -> _items[i] .. Computed(item -> `<option>$item</option>`));
          if (change.appending)
            node .. appendContent(new_html);
          else {
            var anchor = node.querySelectorAll('option')[change.index];
            anchor .. insertBefore(new_html);
          }
        }
        break;
      default:
        node .. 
          replaceContent(_items .. 
                         Map(item -> `<option>$item</option>`));
        updateSelectionHtml(node, items, selection);
      }
    }
  });
}

function SelectSelectionMechanism(ft, items, selection) {
  return ft .. Mechanism(function(node) {
    updateSelectionHtml(node, items, selection);
    waitfor {
     if (isObservable(selection)) {
       selection.observe {
         ||
         updateSelectionHtml(node, items, selection);
       }
     }
    }
    and {
      if (isMutatable(selection)) {
        HostEmitter(node, 'change') .. Stream .. each {
          |ev|
          var new_selection = node.querySelectorAll('option') .. 
            indexed .. 
            filter(([idx,elem]) -> elem.selected) ..
            map(([idx,]) -> items.at(idx));
          if (isObservableArray(selection)) {
            if (!areEquivalentArrays(selection, new_selection))
              selection.set(new_selection);
          }
          else if (selection.get() !== new_selection[0])
            selection.set(new_selection[0]);
        }
      }
    }
  })
}

function Select(settings) {
  settings = {
    multiple: false,
    items: [],
    selected: undefined
  } .. override(settings);

  if (settings.multiple && !settings.selected)
    settings.selected = [];

  var dom_attribs = {};
  if (settings.multiple)
    dom_attribs.multiple = true;

  // <option> doesn't take arbitrary html content. we need to treat
  // observables a bit specially below
  var rv = Widget('select',
                  settings.items .. 
                  Map(item -> isObservable(item) ? 
                      Computed(item, function(item_content) {
                        var rv = Widget('option', item_content);
                        var selection_arr = get(settings.selected);
                        if (!isArrayLike(selection_arr))
                          selection_arr = [selection_arr];
                        if (selection_arr.indexOf(this[0]) !== -1)
                          rv = rv .. Prop('selected', true);
                        return rv;
                      }) :
                      `<option>$item</option>`
                     ),
                  dom_attribs);

  if (isObservable(settings.items)) 
    rv = rv .. SelectOptionsObserverMechanism(settings.items, settings.selected);

  rv = rv .. SelectSelectionMechanism(settings.items, settings.selected);

  return rv;
}
exports.Select = Select;

