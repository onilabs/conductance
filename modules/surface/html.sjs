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

var { hostenv } = require('builtin:apollo-sys');

var imports = [
  'sjs:std',
  {id:'./base', include: ['Element', 'Mechanism', 'isElementOfType']}
];

if (hostenv === 'xbrowser') {
  imports = imports.concat([
    {id:'./dynamic', include: ['replaceContent']},
    {id:'./field', name:'field'}
  ]);
}

@ = require(imports);

//----------------------------------------------------------------------
// helpers:

// map each value of a stream of input if it is an Observable / Stream, else
// just `map` them.
var _map = function(items, fn) {
  if (@isStream(items))
    return items .. @transform(val -> @map(val, fn));
  return items .. @map(fn);
}

//----------------------------------------------------------------------

/**
  @summary Basic HTML elements
  @desc
    This module defines basic HTML building blocks.

    When writing a Conductance client-side app
    ([mho:#features/app-file::]), you typically don't import this
    module yourself: Many templates (such as
    [mho:surface/doc-template/app-plain::]; see
    [mho:surface/doc-template/::] for a complete list) will expose all
    of the symbols in this module (either directly or via a framework-specific UI module such as [surface/bootstrap::])
    automatically in a dynamically
    generated [mho:app::] module.

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

    ### Clashing names

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
  'Form', 'FieldSet', 'Legend', /*'Label', */ /* 'Input', */ 'Button', /* 'Select', */
  'DataList', 'OptGroup', 'Option', /*'TextArea', */ 'KeyGen', 'Output', /* 'Progress', */ 'Meter',
  'Details', 'Summary', 'MenuItem', 'Menu',
] .. @each {|name|
  var tag = name.toLowerCase();
  exports[name] = (content, attr) -> @Element(tag, content, attr);
}

//----------------------------------------------------------------------

/**
  @function Ul
  @param {Array|sjs:sequence::Stream|undefined} [items]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @summary Create a `<ul>` element, wrapping each element of `items` in a `<li>` 
           as required.
  @desc
    If `items` is a [sjs:sequence::Stream], then that stream is expected 
    to have [sjs:observable::Observable] semantics and consist of 
    elements of Array type. The list content will be updated every time the 
    observable changes. This is only supported on the client-side: When using 
    `Ul` on the server-side ([sjs:sys::hostenv] !== 'xbrowser'), `items` must not be a 
    [sjs:sequence::Stream].

    Any element in `item` that isn't a `<li>` [surface::Element] will be wrapped 
    with a `<li>` [surface::Element].


    See [::Ol] for a demonstration.
*/

__js function wrapLi(item) { 
  if (@isElementOfType(item, 'li')) return item;
  return exports.Li(item);
}

exports.Ul = (items, attrs) -> @Element('ul', items ? items .. _map(wrapLi), attrs);

/**
  @function Ol
  @param {Array|sjs:sequence::Stream|undefined} [items]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @summary Create a `<ol>` element, wrapping each element of `items` in a `<li>`
  @desc
    If `items` is a [sjs:sequence::Stream], then that stream is expected 
    to have [sjs:observable::Observable] semantics and consist of 
    elements of Array type. The list content will be updated every time the 
    observable changes. This is only supported on the client-side: When using 
    `Ol` on the server-side ([sjs:sys::hostenv] !== 'xbrowser'), `items` must not be a 
    [sjs:sequence::Stream].

    Any element in `item` that isn't a `<li>` [surface::Element] will be wrapped 
    with a `<li>` [surface::Element].
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var plain_html = require('mho:surface/html');

    var Numbers = @generate(function() {
      hold(1000);
      return [Math.random(), Math.random(), Math.random()];
      });

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @ = require(['mho:app', 'mho:std']);    

    @mainContent .. @appendContent(
      @Ol(['Apples', 'Pears', 'Oranges'])
    );",
        plain_html.Ol(['Apples', 'Pears', 'Oranges'])
      ),
      @demo.CodeResult("\
    var Numbers = @generate(function() {
      hold(1000);
      return [Math.random(), Math.random(), Math.random()];
    });
    
    @mainContent .. @appendContent(
      @Ol(Numbers)
    );
      ",
        plain_html.Ol(Numbers)
      ),
      @demo.CodeResult("\
    @mainContent .. @appendContent(
      @Ol(['A string',
           @Strong('HTML'),
           `Dynamic: 
            ${Numbers .. @transform(arr->arr .. @first)}`
          ])
    )",
        plain_html.Ol(['A string', @Strong('HTML'), 
        `Dynamic: ${Numbers .. @transform(arr->arr .. @first)}`]))
    ]);

*/
exports.Ol = (items, attrs) -> @Element('ol', items ? items .. _map(wrapLi), attrs);

/**
  @function Submit
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @summary Create an `<input type="submit">` element.
*/
exports.Submit = (content, attr) -> @Element('input', null, (attr || {}) .. @merge({type:'submit', value: content}));

//----------------------------------------------------------------------
/**
  @function Label
  @summary XXX write me
  @desc
    ** Binding to fields **
    `Label` will automatically attempt to bind to the nearest enclosing field. XXX elaborate.

*/
var Label;
if (hostenv === 'xbrowser') {

  var FieldLabelMechanism = @Mechanism(function(node) {
    // XXX should use more specific api here; not [CTX_FIELD].id directly
    var ctx = node .. @field.findContext(@field.CTX_FIELD);
    if (ctx) {
      node.setAttribute('for', ctx.id);
    }
  });

  Label = (content, attr) -> @Element('label', content, attr) .. FieldLabelMechanism();
}
else { // hostenv === 'nodejs'
 Label = (content, attr) -> @Element('label', content, attr);
}
exports.Label = Label;

//----------------------------------------------------------------------
/**
  @function Input
  @altsyntax Input(type, value, [attrs])
  @summary A plain HTML 'input' element 
  @param  {String} [type]
  @param  {optional Object} [settings]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @setting {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value=undefined]
  @setting {Function} [valToTxt] Transformer yielding control's text from value (only used for field-bound Inputs; see description below.
  @setting {Function} [txtToVal] Transformer yielding value for text (only used for field-bound Inputs; see description below.
  @return {surface::Element}
  @desc
    #### On client-side ([sjs:sys::hostenv] === 'xbrowser')

    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar],
    then `value` will be updated to reflect any manual changes to the element's value.

    ** Binding to fields **
    If `value` is undefined, `Input` will automatically attempt to bind to the nearest enclosing field. XXX elaborate.

    #### On server-side ([sjs:sys::hostenv] === 'nodejs')

    `value` must be a String and not a [sjs:sequence::Stream] or [sjs:observable::observableVar].
    An element with a 'value' attribute set to `value` will be inserted into the document.
    
*/
var Input;
if (hostenv === 'xbrowser') {

  // helper to keep a node's value synchronized with an observable (or
  // just setting it, if the given value is not an observable):
  function syncValue(node, value, edited, settings) {
    settings = settings || {};
    if (@isStream(value)) {
      var internal_set = false;
      waitfor {
        value .. @each {|val|
          if (internal_set) continue;
          if (settings.valToTxt)
            val = settings.valToTxt(val);
          val = val || "";
          if (node.value !== val)
            node.value = val;
        }
      }
      and {
        if (@isObservableVar(value)) {
          @events(node, 'input') .. @each.track { |ev|
            var val = node.value;
            if (settings.txtToVal)
              val = settings.txtToVal(val);

            internal_set = true;
            value.set(val);
            internal_set = false;

            if (edited)
              edited.set(true);
          }
        }
      }
    } else {
      node.value = value;
    }
  }

  // mechanism for inputs and textareas: 
  var FieldInputMechanism = (content, settings) ->
    content .. @Mechanism(function(node) {
    // XXX should use more specific api here; not
    // [CTX_FIELD].id/.value/.auto_validate directly
      var ctx = node .. @field.findContext(@field.CTX_FIELD);
      if (ctx) {
        var value = ctx.value;
        node.setAttribute('id', ctx.id);
      }
      else {
        value = '';
      }
      // keep node's value in sync with observable:
      syncValue(node, value, ctx ? ctx.auto_validate, settings);
    });


  Input = function(type, settings, attrs) {
    // untangle settings
    if (typeof settings === 'string' ||
        settings .. @isStream) {
      settings = {value: settings};
    }
    else {
      settings = {
        value: undefined,
        valToTxt: undefined,
        txtToVal: undefined
      } .. @override(settings);
    }
    var rv = @Element('input', {'type':type} .. @merge(attrs||{}));
    if (settings.value === undefined) {
      // a field input element
      rv = rv .. FieldInputMechanism(settings);
    }
    else {
      rv = rv .. @Mechanism(function(node) {
        syncValue(node, settings.value);
      });
    }
    return rv;
  }
}
else { // hostenv === 'nodejs'
  Input = (type, value, attrs) -> 
    @Element('input', {'type':type, 'value':value||''} .. @merge(attrs||{}));
}
exports.Input = Input;
  

//----------------------------------------------------------------------
/**
  @function TextInput
  @summary A plain HTML 'input' element with type='text'
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    #### On client-side ([sjs:sys::hostenv] === 'xbrowser')

    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar],
    then `value` will be updated to reflect any manual changes to the element's value.

    #### On server-side ([sjs:sys::hostenv] === 'nodejs')

    `value` must be a String and not a [sjs:sequence::Stream] or [sjs:observable::observableVar].
    An element with a 'value' attribute set to `value` will be inserted into the document.
*/
var TextInput = (value, attrs) -> Input('text', value, attrs);
exports.TextInput = TextInput;

//----------------------------------------------------------------------
/**
  @function TextArea
  @summary A plain HTML 'textarea' element
  @param  {optional String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value=undefined]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    #### On client-side ([sjs:sys::hostenv] === 'xbrowser')

    When the element is inserted into the document, its value 
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar],
    then `value` will be updated to reflect any manual changes to the element's value.

    ** Binding to fields **
    If `value` is undefined, `TextArea` will automatically attempt to bind to the nearest enclosing field. XXX elaborate.


    #### On server-side ([sjs:sys::hostenv] === 'nodejs')

    `value` must be a String and not a [sjs:sequence::Stream] or [sjs:observable::observableVar].
    An element with a 'value' attribute set to `value` will be inserted into the document.
*/
var TextArea;
if (hostenv === 'xbrowser') {
  TextArea = function(value, attrs) {
    var rv = @Element('textarea', null, attrs||{});
    if (value === undefined) {
      // a field textarea element
      rv = rv .. FieldInputMechanism();
    }
    else {
      rv = rv .. @Mechanism(function(node) {
        syncValue(node, value);
      });
    }
    return rv;
  }
}
else { // hostenv === 'nodejs'
  TextArea = (value, attrs) -> 
    @Element('textarea', null, {'value':value||''} .. @merge(attrs||{}));
}
exports.TextArea = TextArea;


//----------------------------------------------------------------------
/**
  @function Checkbox
  @summary A HTML 'checkbox' widget
  @param  {optional Boolean|sjs:sequence::Stream|sjs:observable::ObservableVar} [checked=undefined] 
  @return {surface::Element}
  @desc
    #### On client-side ([sjs:sys::hostenv] === 'xbrowser')

    When the element is inserted into the document, its checked state will be set to 
    will be set to `checked`. If `checked` is a [sjs:sequence::Stream], the
    element's state will be updated every time `checked` changes. If (in addition)
    `checked` is an [sjs:observable::ObservableVar], 
    then `checked` will be updated to reflect any manual changes to the element's state.

    ** Binding to fields **
    If `checked` is undefined, `Checkbox` will automatically attempt to bind to the nearest enclosing field. XXX elaborate.


    #### On server-side ([sjs:sys::hostenv] === 'nodejs')

    `checked` must be a Boolean and not a [sjs:sequence::Stream] or [sjs:observable::observableVar].
    An element with a 'checked' attribute set to `checked` will be inserted into the document.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    var surface = require('mho:surface/html');
    var Value = @ObservableVar(true);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @ = require(['mho:std', 'mho:app']);

    var Value = @ObservableVar(true);

    @mainContent .. @appendContent(
      `$@Checkbox(Value) I like Conductance <br>
       You ${Value .. @transform(x -> x ? \"do\" : \"don't\")}
       like Conductance`
    )",
        `${surface.Checkbox(Value)} I like Conductance <br>
         You ${Value .. @transform(x -> x ? "do" : "don't")} like Conductance`
      )
    ]);
*/
var Checkbox;
if (hostenv === 'xbrowser') {


  // helper to keep a node's value synchronized with an observable (or
  // just setting it, if the given value is not an observable):
  function syncCheckboxValue(node, value, edited) {
    if (@isStream(value)) {
      waitfor {
        value .. @each {|val|
          val = Boolean(val);
          if (node.checked !== val)
            node.checked = val;
        }
      }
      and {
        if (@isObservableVar(value)) {
          @events(node, 'change') .. @each { |ev|
            value.set(node.checked);
            if (edited)
              edited.set(true);
          }
        }
      }
    } else {
      node.checked = Boolean(value);
    }
  }

  // mechanism for checkboxes: 
  var FieldCheckboxMechanism = @Mechanism(function(node) {
    // XXX should use more specific api here; not
    // [CTX_FIELD].id/.value/.auto_validate directly
    var ctx = node .. @field.findContext(@field.CTX_FIELD);
    if (ctx) {
      var value = ctx.value;
      node.setAttribute('id', ctx.id);
    }
    else {
      value = '';
    }
    // keep node's value in sync with observable:
    syncCheckboxValue(node, value, ctx ? ctx.auto_validate);
  });


  Checkbox = function(value) {
    var rv = @Element('input', {type:'checkbox'});
    if (value === undefined) {
      // a field input element
      rv = rv .. FieldCheckboxMechanism();
    }
    else {
      rv = rv .. @Mechanism(function(node) {
        syncCheckboxValue(node, value);
      });
    }
    return rv;
  };
}
else { // hostenv === 'nodejs'
  Checkbox = value -> @Element('input', { type: 'checkbox', checked: Boolean(value) });
}
exports.Checkbox = Checkbox;



/**
  @function Progress
  @summary A HTML `<progress>` widget
  @param {Number|sjs:sequence::Stream} [value]
  @param {optional Object} [settings]
  @setting {optional Number} [min=0] Lowest value of `value`
  @setting {optional Number} [max=100] Highest value of `value`
  @return {surface::Element}
  @desc
    If `value` is a [sjs:sequence::Stream], then the % completed will
    change over time to match the stream.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var surface = require('mho:surface/html');

    var percent = @ObservableVar(0);

    spawn @generate(Math.random) ..@each(function (x) {
      percent.set(x * 100);
      hold(2000);
    });

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    var percent = @ObservableVar(0);

    @Progress(percent)",
    surface.Progress(percent))
    ]);
*/
// TODO code duplication with Bootstrap Progress
function computePercentage(value, min, max) {
  return ((value - min) / (max - min)) * 100;
}

// TODO code duplication with Bootstrap Progress
// TODO I don't think `isStream` is the right predicate to use
function Progress(value, settings) {
  // TODO is there a utility to handle this ?
  if (settings == null) {
    settings = {};
  }
  if (settings.min == null) {
    settings.min = 0;
  }
  if (settings.max == null) {
    settings.max = 100;
  }

  // TODO is there a better way to do this ?
  if (@isStream(value)) {
    value = @mirror(value);
  } else {
    value = [value];
  }

  var percentage = @Element('span') ..@Mechanism(function (node) {
    value ..@each(function (value) {
      var percent = computePercentage(value, settings.min, settings.max);
      var rounded = Math.round(percent);
      node.textContent = "#{rounded}%";
    });
  });

  var top = @Element('progress', percentage)
    ..@Attrib('aria-valuemin', '' + settings.min)
    ..@Attrib('aria-valuemax', '' + settings.max)
    ..@Attrib('max', '100')
    ..@Mechanism(function (node) {
      value ..@each(function (value) {
        var percent = computePercentage(value, settings.min, settings.max);
        node.setAttribute('aria-valuenow', '' + value);
        node.setAttribute('value', '' + percent);
      });
    });

  return top;
}
exports.Progress = Progress;


//----------------------------------------------------------------------
/**
  @function Select
  @summary A plain HTML 'select' widget
  @param  {Object} [settings] Widget settings
  @setting {Boolean} [multiple=false] Whether or not this is a multi-selection widget
  @setting {Array|sjs:sequence::Stream} [items] Selectable Items (Array of Strings or Observable yielding Array of Strings)
  @setting {sjs:observable::ObservableVar} [selected] Optional ObservableVar that will be synchronized to selected item(s).
  @return {surface::Element}
  @desc
    #### On client-side ([sjs:sys::hostenv] === 'xbrowser')

    See demonstration below

    #### On server-side ([sjs:sys::hostenv] === 'nodejs')

    `items` must be an Array and not a [sjs:sequence::Stream].

  @demo
    @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);

    var surface = require('mho:surface/html');

    var options = ["Bad", "Ok", "Pretty Good", "Perfect"];
    var Rating  = @ObservableVar('Pretty Good');


    @mainContent .. @appendContent(
       @demo.CodeResult("\
    @ = require(['mho:std','mho:app']);

    var options = ['Bad', 'Ok', 'Pretty Good', 'Perfect'];
    var Rating  = @ObservableVar('Perfect');

    @mainBody .. @appendContent(`
      Rate Conductance:
      $@Select({items:options, selected: Rating})
      Your Rating: $Rating`);",
          `Rate Conductance:  ${surface.Select({items:options, selected: Rating})}
           Your Rating: $Rating`
    ));
*/


function selectedIndices(items, selection) {
  var rv = {};
  if (!@isArrayLike(selection))
    selection = [selection];
  selection ..
    @map(selected_item -> items.indexOf(selected_item)) .. @each {
      |index|
      rv[index] = true;
    }
  return rv;
}

function SelectObserverMechanism(ft, state, updateSelected) {
  return ft .. @Mechanism(function(node) {

    function update(items) {
      var new_selection = node.querySelectorAll('option') ..
        @indexed ..
        @filter(([idx,elem]) -> elem.selected) ..
        @map([idx,] -> items[idx]);
      
      updateSelected(new_selection);
    }

    var lastSelection;
    waitfor {
      var lastItems;
      state .. @each {|[items, selection]|
        var nodes = node.querySelectorAll('option');
        var select_map;
        if (selection === undefined) {
          select_map = {};
          nodes .. @indexed .. @each {|[i,n]|
            if (n.selected) select_map[i] = true;
          }
        } else {
          select_map = selectedIndices(items, selection);
        }

        if (lastItems !== items) {
          /* update content */
          node ..
            @replaceContent(
              items
              .. @indexed
              .. @map([idx, item] -> @Element("option", item, {selected: select_map[idx]}))
            );
        } else {
          /* update selections */
          nodes .. @indexed .. @each {
            |[index, elem]|
            elem.selected = select_map[index];
          }
        }

        lastSelection = selection;

        if (!lastItems && updateSelected) {
          update(items);
        }

        lastItems = items;
      }
    } and {
      if (updateSelected) {
        @events(node, 'change') .. @each {
          |ev|
          if (lastItems)
            update(lastItems);
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
  } .. @override(settings);

  var dom_attribs = {};
  if (settings.multiple)
    dom_attribs.multiple = true;

  var ensureStream = o -> @isStream(o) ? o: @Stream(function(emit) { emit(o); hold(); });
  var state = [settings.items, settings.selected];
  var computedState = null;
  if (state .. @any(@isStream)) {
    // make a single observable encapsulating the entire state
    var args = state .. @map(ensureStream);
    args.push(function() { return arguments .. @toArray});
    computedState = @observe.apply(null, args);
  }

  if (computedState) {
    var updateSelected;
    if (@isObservableVar(settings.selected)) {
      if (settings.multiple) {
        updateSelected = (sels) -> settings.selected.set(sels);
      } else {
        updateSelected = (sels) -> settings.selected.set(sels[0]);
      }
    }
    return @Element('select', null, dom_attribs)
    .. SelectObserverMechanism(computedState, updateSelected);
  }

  // else: statically apply selections, no mechanism needed
  // <option> doesn't take arbitrary html content, so we don't
  // support observable item elements (only a whole observable array)
  var selectedStream = ensureStream(settings.selected);
  var select_map = selectedIndices(settings.items, settings.selection);
  var options = settings.items .. @indexed .. @map([idx, item] ->
    @Element('option', item, {selected: select_map[idx]})
  );

  return @Element('select',  options, dom_attribs);
}
exports.Select = Select;
