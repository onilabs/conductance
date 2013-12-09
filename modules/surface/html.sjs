var { Widget, Mechanism, Attrib } = require('./base');
var { replaceContent, appendContent, prependContent, Prop, removeElement, insertBefore } = require('./dynamic');
var { HostEmitter } = require('sjs:event');
var { Stream, isStream, integers, each, map, indexed, filter, sort, slice, any } = require('sjs:sequence');
var { isArrayLike } = require('sjs:array');
var { shallowEq } = require('sjs:compare');
var { override, merge } = require('sjs:object');
var { Computed } = require('../observable');

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

    ### Void Elements

    Void elements (those which have no closing tag or content) will throw an error if you pass a truthy value
    as their `content` argument. As a convenience, you can omit the `content` attribute entirely. So the
    following calls are equivalent since `img` is a void element:

      - `Img(null, {"src": "main.png"})`
      - `Img({"src": "main.png"})`

    The current list of known void elements is
    `area`,
    `base`,
    `br`,
    `col`,
    `command`,
    `embed`,
    `hr`,
    `img`,
    `input`,
    `keygen`,
    `link`,
    `meta`,
    `param`,
    `source`,
    `track`
    and `wbr`.

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
  @param  {String|sjs:sequence::Stream} [value] Value.
  @return {surface::Widget}
*/
var TextInput = (value, attrs) ->
  Widget('input', null, {'type':'text'} .. merge(attrs||{})) ..
  Mechanism(function(node) {
    value = value || "";
    if (isStream(value)) {
      waitfor {
        value .. each {|val|
          if (node.value !== val)
            node.value = val;
        }
      }
      and {
        if (value.set) {
          HostEmitter(node, 'input').stream() .. each { |ev|
            value.set(node.value);
          }
        }
      }
    } else {
      node.value = value;
    }
  });
exports.TextInput = TextInput;


//----------------------------------------------------------------------
/**
  @function Checkbox
  @summary A HTML 'checkbox' widget
  @param  {Boolean|sjs:sequence::Stream} [value] Value.
  @return {surface::Widget}
*/
var Checkbox = value ->
  Widget('input') ..
  Attrib("type", "checkbox") ..
  Mechanism(function(node) {
    if (isStream(value)) {
      waitfor {
        value .. each { |current|
          current = Boolean(current);
          if (node.checked !== current) node.checked = current;
        }
      }
      and {
        if (value.set) {
          HostEmitter(node, 'change').stream() .. each { |ev|
            value.set(node.checked);
          }
        }
      }
    } else {
      node.checked = Boolean(value);
    }
  });
exports.Checkbox = Checkbox;

//----------------------------------------------------------------------
/**
  @function Select
  @summary A plain HTML 'select' widget
  @param  {Object} [settings] Widget settings
  @setting {Boolean} [multiple=false] Whether or not this is a multi-selection widget
  @setting {Array|sjs:sequence::Stream} [items] Selectable items
  @return {surface::Widget}
*/


function selectedIndices(items, selection) {
  var rv = {};
  if (!isArrayLike(selection))
    selection = [selection];
  selection ..
    map(selected_item -> items.indexOf(selected_item)) .. each {
      |index|
      rv[index] = true;
    }
  return rv;
}

function SelectObserverMechanism(ft, state, updateSelected) {
  return ft .. Mechanism(function(node) {
    var lastSelection;
    waitfor {
      var lastItems;
      state .. each {|[items, selection]|
        var nodes = node.querySelectorAll('option');
        var select_map;
        if (selection === undefined) {
          select_map = {};
          nodes .. indexed .. each {|[i,n]|
            if (n.selected) select_map[i] = true;
          }
        } else {
          select_map = selectedIndices(items, selection);
        }

        if (lastItems !== items) {
          /* update content */
          node ..
            replaceContent(
              items
              .. indexed
              .. map([idx, item] -> Widget("option", item, {selected: select_map[idx]}))
            );
        } else {
          /* update selections */
          nodes .. indexed .. each {
            |[index, elem]|
            elem.selected = select_map[index];
          }
        }

        lastSelection = selection;
        lastItems = items;
      }
    } and {
      if (updateSelected) {
        HostEmitter(node, 'change').stream() .. each {
          |ev|
          if (!lastItems) continue;
          var new_selection = node.querySelectorAll('option') ..
            indexed ..
            filter(([idx,elem]) -> elem.selected) ..
            map([idx,] -> lastItems[idx]);

          updateSelected(new_selection);
        }
      }
    }
  });
};

function Select(settings) {
  settings = {
    multiple: false,
    items: [],
    selected: undefined
  } .. override(settings);

  var dom_attribs = {};
  if (settings.multiple)
    dom_attribs.multiple = true;

  var ensureStream = o -> isStream(o) ? o: Stream(function(emit) { emit(o); hold(); });
  var state = [settings.items, settings.selected];
  var computedState = null;
  if (state .. any(isStream)) {
    var { ObservableTuple } = require('../observable');
    // make a single observable encapsulating the entire state
    computedState = ObservableTuple.apply(null, state .. map(ensureStream));
  }

  if (computedState) {
    var updateSelected;
    if (isStream(settings.selected) && settings.selected.set) {
      if (settings.multiple) {
        updateSelected = (sels) -> settings.selected.set(sels);
      } else {
        updateSelected = (sels) -> settings.selected.set(sels[0]);
      }
    }
    return Widget('select', null, dom_attribs)
    .. SelectObserverMechanism(computedState, updateSelected);
  }

  // else: statically apply selections, no mechanism needed
  // <option> doesn't take arbitrary html content, so we don't
  // support observable item elements (only a whole observable array)
  var selectedStream = ensureStream(settings.selected);
  var select_map = selectedIndices(settings.items, settings.selection);
  var options = settings.items .. indexed .. map([idx, item] ->
    Widget('option', item, {selected: select_map[idx]})
  );

  return Widget('select',  options, dom_attribs);
}
exports.Select = Select;

// map each value of a stream of input if it is an Observable / Stream, else
// just `map` them.
var _map = function(items, fn) {
  if (isStream(items))
    return items .. transform(val -> map(val, fn));
  return items .. map(fn);
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
