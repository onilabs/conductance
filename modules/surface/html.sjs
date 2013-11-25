var { Widget, Mechanism, Attrib } = require('./base');
var { replaceContent, appendContent, prependContent, Prop, removeElement, insertBefore } = require('./dynamic');
var { HostEmitter, Stream } = require('sjs:events');
var { integers, each, map, indexed, filter, sort, slice } = require('sjs:sequence');
var { isArrayLike } = require('sjs:array');
var { shallowEq } = require('sjs:compare');
var { override, merge } = require('sjs:object');
var { isObservable, isObservableArray, isMutatable, Computed, get, Map, at } = require('../observable');

/**
  @desc
    As well as the explicitly document functions below, this module exports a
    constructor function for every HTML tag in the
    [HTML5 Element List](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/HTML5_element_list).
    The function for each tag is in TitleCase, e.g:

     - A
     - Div
     - Span
     - Input
     - Ol, Ul, Li, Dl, Dt, etc
     - H1 ... H6
     - BlockQuote, THead, TBody, FigCaption, DataLost, OptGroup, TextArea, MenuItem, etc

    Each of these tag methods is a shortcut for calling [surface::Widget] with the given tag name - i.e `Widget(<tagName>, ... )`.

    ### Examples:

        A("Click me!", {href: "http://example.com/"});

        Ul([
          Li("item 1"),
          Li("item 2"),
        ]);

        Ul(`
          <li>item 1</li>
          <li>item 2</li>
        `);

        Br();
*/

// commented-out tag names are those we have advanced bindings for, so we don't want the default
;[
  'Html',
  'Head', 'Title', 'Base', 'Link', 'Meta', 'Style',
  'Script','NoScript',
  'Body', 'Section', 'Nav',
  'Article', 'Aside',
  'H1','H2','H3','H4','H5','H6',
  'Header', 'Footer', 'Address', 'Main',
  'P','Hr','Pre', 'BlockQuote', 'Ol', 'Ul', 'Li','Dl','Dt','Dd','Figure','FigCaption','Div',
  'A','Em','Strong','Small','S','Cite','Q','Dfn','Abbr','Data', 'Time', 'Code', 'Var',
  'Samp', 'Kbd', 'Sub', 'Sup', 'I', 'B', 'U', 'Mark', 'Ruby', 'Rt', 'Rp',
  'Bdi', 'Bdo', 'Span', 'Br', 'Wbr',
  'Ins', 'Del',
  'Img', 'Iframe', 'Embed', 'Object', 'Param', 'Video', 'Audio', 'Source', 'Track',
  'Canvas', 'Map', 'Area', 'Svg', 'Math',
  'Table', 'Caption', 'ColGroup', 'Col', 'TBody', 'THead', 'TFoot', 'Tr', 'Td', 'Th',
  'Form', 'FieldSet', 'Legend', 'Label', 'Input', 'Button', /* 'Select', */
  'DataList', 'OptGroup', 'Option', 'TextArea', 'KeyGen', 'Output', 'Progress', 'Meter',
  'Details', 'Summary', 'MenuItem', 'Menu',
] .. each {|name|
  var tag = name.toLowerCase();
  exports[name] = (content, attr) -> Widget(tag, content, attr);
}

//----------------------------------------------------------------------
/**
 @function TextInput
 @summary A plain HTML 'input' widget
 @param  {String|../observable::Observable} [value] Value.
 @return {surface::Widget}
*/
var TextInput = (value, attrs) ->
  Widget('input', null, {'type':'text'} .. merge(attrs||{})) ..
  Mechanism(function(node) {
    value = value || "";
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
 @return {surface::Widget}
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
 @return {surface::Widget}
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
            if (!shallowEq(selection, new_selection))
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


// create an Observable.Map of the inputs if they are an ObservableArray, else
// just `map` them.
var _map = function(items, fn) {
  var m = isObservable(items) ? Map : map;
  return m(items, fn);
}
/**
 @function UnorderedList
 @param {Array} [items]
 @param {optional Object} [attrs]
 @return {surface::Widget}
 @summary Crate a `<ul>` widget, wrapping each element of`items` in a `<li>`
*/
exports.UnorderedList = (items, attrs) -> exports.Ul(items .. _map(exports.Li), attrs);
/**
 @function OrderedList
 @param {Array} [items]
 @param {optional Object} [attrs]
 @return {surface::Widget}
 @summary Crate a `<ol>` widget, wrapping each element of`items` in a `<li>`
*/
exports.OrderedList = (items, attrs) -> exports.Ol(items .. _map(exports.Li), attrs);

/**
 @function Submit
 @param {surface::HtmlFragment} [content]
 @param {optional Object} [attrs]
 @return {surface::Widget}
 @summary Crate an `<input type="submit">` widget.
*/
exports.Submit = (content, attr) -> Widget('input', null, (attr || {}) .. merge({type:'submit', value: content}));
