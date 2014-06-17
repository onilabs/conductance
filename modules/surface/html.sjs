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

var { Element, Mechanism, Attrib } = require('./base');
var { replaceContent, appendContent, prependContent, Prop, removeNode, insertBefore } = require('./dynamic');
var { events } = require('sjs:event');
var { Stream, isStream, integers, each, map, transform, indexed, filter, sort, slice, any, toArray } = require('sjs:sequence');
var { isArrayLike } = require('sjs:array');
var { shallowEq } = require('sjs:compare');
var { override, merge } = require('sjs:object');
var { observe } = require('sjs:observable');

/**
  @summary Surface HTML elements
  @desc
    As well as the explicitly document functions below, this module exports a
    constructor function for almost _(see "Clashing names" below)_ every HTML tag in the
    [HTML5 Element List](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/HTML5_element_list).
    The function for each tag is in TitleCase, e.g:

     - A
     - Div
     - Span
     - Li, Dl, Dt, etc
     - H1 ... H6
     - BlockQuote, THead, TBody, FigCaption, DataLost, OptGroup, TextArea, MenuItem, etc

    Each of these tag methods is a shortcut for calling [surface::Element] with the given tag name - i.e `Element(<tagName>, ... )`.

    ## Clashing names

    A small number of HTML tags do not have constructors in this module, since they would clash with names (and functionality)
    already provided in [mho:std::] or other modules. Currently these are:

      - `Style`
      - `Col`

    If you do need to create one of these elements directly, you should use [../surface::Element], e.g. `Element('style', ...)`.

    ### Examples:

        A("Click me!", {href: "http://example.com/"});

        P(`Elements can be $Em(`nested`)`)

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
  'Head', 'Title', 'Base', 'Link', 'Meta', /* 'Style', */
  'Script','NoScript',
  'Body', 'Section', 'Nav',
  'Article', 'Aside',
  'H1','H2','H3','H4','H5','H6',
  'Header', 'Footer', 'Address', 'Main',
  'P','Hr','Pre', 'BlockQuote', /* 'Ol', 'Ul', */ 'Li','Dl','Dt','Dd','Figure','FigCaption','Div',
  'A','Em','Strong','Small','S','Cite','Q','Dfn','Abbr','Data', 'Time', 'Code', 'Var',
  'Samp', 'Kbd', 'Sub', 'Sup', 'I', 'B', 'U', 'Mark', 'Ruby', 'Rt', 'Rp',
  'Bdi', 'Bdo', 'Span', 'Br', 'Wbr',
  'Ins', 'Del',
  'Img', 'Iframe', 'Embed', 'Object', 'Param', 'Video', 'Audio', 'Source', 'Track',
  'Canvas', 'Map', 'Area', 'Svg', 'Math',
  'Table', 'Caption', 'ColGroup', /* 'Col' ,*/ 'TBody', 'THead', 'TFoot', 'Tr', 'Td', 'Th',
  'Form', 'FieldSet', 'Legend', 'Label', /* 'Input', */ 'Button', /* 'Select', */
  'DataList', 'OptGroup', 'Option', /*'TextArea', */ 'KeyGen', 'Output', 'Progress', 'Meter',
  'Details', 'Summary', 'MenuItem', 'Menu',
] .. each {|name|
  var tag = name.toLowerCase();
  exports[name] = (content, attr) -> Element(tag, content, attr);
}

//----------------------------------------------------------------------
/**
  @function Input
  @summary A plain HTML 'input' element 
  @param  {String} [type]
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value] 
  @param  {optional Object} [attrs] Hash of DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If, in addition,
    `value` has a `set` method, (e.g. it is an [sjs:observable::ObservableVar]), 
    then `value` will be updated to reflect any manual changes to the element's value.
*/
var Input = (type, value, attrs) ->
  Element('input', {'type':type} .. merge(attrs||{})) ..
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
          events(node, 'input') .. each { |ev|
            value.set(node.value);
          }
        }
      }
    } else {
      node.value = value;
    }
  });
exports.Input = Input;


//----------------------------------------------------------------------
/**
  @function TextInput
  @summary A plain HTML 'input' element with type='text'
  @param  {String} [type]
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value] 
  @param  {optional Object} [attrs] Hash of DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If, in addition,
    `value` has a `set` method, (e.g. it is an [sjs:observable::ObservableVar]), 
    then `value` will be updated to reflect any manual changes to the element's value.
*/
var TextInput = (value, attrs) -> Input('text', value, attrs);
exports.TextInput = TextInput;

//----------------------------------------------------------------------
/**
  @function TextArea
  @summary A plain HTML 'textarea' element
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs]
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If, in addition,
    `value` has a `set` method, (e.g. it is an [sjs:observable::ObservableVar]), 
    then `value` will be updated to reflect any manual changes to the element's value.
*/
var TextArea = (value, attrs) ->
  Element('textarea', attrs||{}) ..
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
          events(node, 'input') .. each { |ev|
            value.set(node.value);
          }
        }
      }
    } else {
      node.value = value;
    }
  });
exports.TextArea = TextArea;


//----------------------------------------------------------------------
/**
  @function Checkbox
  @summary A HTML 'checkbox' widget
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value] 
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If, in addition,
    `value` has a `set` method, (e.g. it is an [sjs:observable::ObservableVar]), 
    then `value` will be updated to reflect any manual changes to the element's value.
*/
var Checkbox = value ->
  Element('input') ..
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
          events(node, 'change') .. each { |ev|
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
  @return {surface::Element}
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
              .. map([idx, item] -> Element("option", item, {selected: select_map[idx]}))
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
        events(node, 'change') .. each {
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
    // make a single observable encapsulating the entire state
    var args = state .. map(ensureStream);
    args.push(function() { return arguments .. toArray});
    computedState = observe.apply(null, args);
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
    return Element('select', null, dom_attribs)
    .. SelectObserverMechanism(computedState, updateSelected);
  }

  // else: statically apply selections, no mechanism needed
  // <option> doesn't take arbitrary html content, so we don't
  // support observable item elements (only a whole observable array)
  var selectedStream = ensureStream(settings.selected);
  var select_map = selectedIndices(settings.items, settings.selection);
  var options = settings.items .. indexed .. map([idx, item] ->
    Element('option', item, {selected: select_map[idx]})
  );

  return Element('select',  options, dom_attribs);
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
  @function Ul
  @param {Array|sjs:sequence::Stream|undefined} [items]
  @param {optional Object} [attrs]
  @return {surface::Element}
  @summary Create a `<ul>` element, wrapping each element of `items` in a `<li>` 
           as required.
  @desc
    If `items` is a [sjs:sequence::Stream], then that stream is expected 
    to have [sjs:observable::Observable] semantics and consist of 
    elements of Array type. The list content will be updated every time the 
    observable changes.

    Any elements in `item` that isn't a `<li>` {surface::Element} will be wrapped 
    with a `<li>` {surface::Element}.
*/

__js function wrapLi(item) { 
  if (@isElementOfType(item, 'li')) return item;
  return exports.Li(item);
}

exports.Ul = (items, attrs) -> Element('ul', items ? items .. _map(wrapLi), attrs);

/**
  @function Ol
  @param {Array|sjs:sequence::Stream|undefined} [items]
  @param {optional Object} [attrs]
  @return {surface::Element}
  @summary Create a `<ol>` element, wrapping each element of`items` in a `<li>`
  @desc
    If `items` is a [sjs:sequence::Stream], then that stream is expected 
    to have [sjs:observable::Observable] semantics and consist of 
    elements of Array type. The list content will be updated every time the 
    observable changes.

    Any elements in `item` that isn't a `<li>` {surface::Element} will be wrapped 
    with a `<li>` {surface::Element}.
*/
exports.Ol = (items, attrs) -> Element('ol', items ? items .. _map(wrapLi), attrs);

/**
  @function Submit
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs]
  @return {surface::Element}
  @summary Create an `<input type="submit">` element.
*/
exports.Submit = (content, attr) -> Element('input', null, (attr || {}) .. merge({type:'submit', value: content}));
