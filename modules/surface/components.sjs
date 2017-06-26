/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @summary Standard Material Design HTML Components
   @desc
     This module defines standard Material Design components drawing heavily on
     https://material.io.

     All components defined here expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

*/


@ = require([
  'sjs:std',
  'mho:surface',
  'mho:surface/html',
  {id:'mho:surface/field', name:'field'},
  {id:'mho:surface/cmd', name:'cmd'}
])

//----------------------------------------------------------------------
/**
   @function Btn
   @summary HTML Button component
   @param {surface::HtmlFragment} [content] Button content
   @param {optional String} [types] Space-separated button styles: 'dense', 'raised', 'compact', 'primary', 'accent'
   @desc
      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/buttons/.
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}]);
     var vsizing = ['','dense'];
     var hsizing = ['', 'compact'];
     var type = ['', 'raised'];
     var style = ['', 'primary', 'accent'];
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(`button { margin: 10px; }`),
       @product(vsizing, hsizing, type, style) .. @map([a,b,c,d] -> @components.Btn(([a,b,c,d] .. @filter .. @join(' ')) || 'Default', [a,b,c,d] .. @filter .. @join(' '))),
       `<h4>Disabled:</h4>`,
       `<fieldset disabled>
         ${@product(vsizing, hsizing, type, style) .. @map([a,b,c,d] -> @components.Btn(([a,b,c,d] .. @filter .. @join(' ')) || 'Default', [a,b,c,d] .. @filter .. @join(' ')))}
        </fieldset>`,
     ]);
*/
function Btn(content, types) {
  if (!types) types = '';
  return @Button("mho-button "+(types.split(' ') .. @filter .. @transform(type -> "mho-button--#{type}") .. @join(" "))) :: content;
}
exports.Btn = Btn;

//----------------------------------------------------------------------
/**
   @function TextField
   @summary HTML TextField component
   @param {optional Object} [settings]
   @setting {String} [name]
   @setting {String} [type='text']
   @setting {surface::HtmlFragment} [label]
   @setting {surface::HtmlFragment} [help]
   @setting {Boolean} [persistent_help]
   @setting {sjs:observable::ObservableVar} [Value]
   @setting {sjs:observable::ObservableVar} [ValidationState]
   @desc
      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/input-controls/text-fields/.

      XXX Todo: document field binding; implement validation markup; fix baseline
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}, {id:'mho:surface/field', name: 'field'}]);
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(`
         body { font-size: 16px; }
         .row { display:flex; align-items:baseline;}
         .grow { flex-grow: 1 }
       `),
       @Div('row') :: [@Span :: `Plain TextField:&nbsp;`, @Div('grow') :: @components.TextField()],
       @Div('row') :: [@Span :: `TextField({label:'First Name'}):&nbsp;`, @Div('grow') :: @components.TextField({label:'First Name'})],
       @Div('row') :: [@Span :: `TextField({label:'First Name', help:'Enter your Given Name'}):&nbsp;`, @Div('grow') :: @components.TextField({label:'First Name', help: 'Enter your Given Name'})],
       @Div('row') :: [@Span :: `TextField({label:'First Name', persistent_help: true, help:'...'}):&nbsp;`, @Div('grow') :: @components.TextField({label:'First Name', persistent_help: true, help: 'Enter your Given Name'})],
       @Div('row') :: [@Span :: `TextField with Validation:&nbsp;`, @Div('grow') :: @components.TextField({label:'Password', xhelp: 'More than 8 characters'}) .. @field.Validate(x -> x.length < 8 ? 'need more than 8 chars')]

     ]);
*/

var TextFieldMechanism = @Mechanism(function(node) {

  var input_compound = node.firstChild;

  waitfor {
    // XXX this is probably not the best way. we want to initialize the label in a way
    // that prevents a FOUC
    hold(0); // give input field a chance to initialize from observable; XXX maybe use a prioritized mechanism on inputs instead
    if (input_compound.firstChild.value)
      input_compound.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
    input_compound.firstChild.nextSibling.classList.remove('mho-textfield__label--not-initialized');
    input_compound.firstChild .. @events('input') .. @each { 
      ||
      if (input_compound.firstChild.value) {
        input_compound.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
      }
      else {
        input_compound.firstChild.nextSibling.classList.remove('mho-textfield__label--float-above');
      }
    }
  }
  and {
    // focus lifecycle
    while (1) {
      input_compound.firstChild .. @wait('focus');
      node.classList.add('mho-textfield--focused');
      //input_compound.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
      
      input_compound.firstChild .. @wait('blur');
      node.classList.remove('mho-textfield--focused');
      //if (!input_compound.firstChild.value) node.firstChild.nextSibling.classList.remove('mho-textfield__label--float-above');
    }
  }
});

function TextField(settings) {

  settings = {
    name: undefined,
    type: 'text',
    label: undefined,
    help: undefined,
    Value: undefined,
    ValidationState: undefined,
    persistent_help: false
  } .. @override(settings);

  var control;
  if (settings.type === 'multiline') {
    control = @TextArea({attrs: { 'class': 'mho-textfield__input', rows:'8' }});
  }
  else {
    control = @Input({type: settings.type, attrs: { 'class': 'mho-textfield__input' }});
  }

  var innerHtml = [
    @Div('mho-textfield__input_compound') :: [
      control,
      @Label('mho-textfield__label mho-textfield__label--not-initialized') :: settings.label
    ]
  ];

  if (settings.help) {
    var help_classes = ['mho-textfield__helptext'];
    if (settings.persistent_help)
      help_classes.push('mho-textfield__helptext--persistent');
    innerHtml.push(@P(help_classes.join(" ")) :: settings.help);
  }

//  innerHtml.push(@P(help

  var outer_classes = ['mho-textfield'];
  if (settings.type === 'multiline') outer_classes.push('mho-textfield--multiline');

  var outerHtml = @Div(outer_classes.join(" ")) .. TextFieldMechanism :: 
    innerHtml;

  return @field.Field({name:settings.name, Value:settings.Value, ValidationState:settings.ValidationState}) :: outerHtml;
}
exports.TextField = TextField;

//----------------------------------------------------------------------
/**
   @function PermanentDrawer
   @summary XXX document me
   @desc
      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/drawers/.
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}]);
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(``),
       `write me`
     ]);
*/
function PermanentDrawer(content, settings) {
  return @Nav("mho-permanent-drawer") :: 
           @Div("mho-permanent-drawer__content") :: [@Div::content];
}
exports.PermanentDrawer = PermanentDrawer;


//----------------------------------------------------------------------
/**
   @function List
   @summary Material Design List widget
   @param {surface::HtmlFragment} [content] List content
   @desc
      List content should be wrapped in [::List.A] or [::List.Item] for appropriate styling.

      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/lists/.
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}]);
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(`
       .section { display: flex; }
       .code { margin-right: 20px; }
       .result { border: 1px solid #aaa; }
       `),
       @Div('section') :: [
         @Pre('code') :: "\
     List ::
       [
         List.Item :: 'Apples',
         List.Item :: 'Pears',
         List.Item :: 'Oranges'
       ]",
         @Div('result') ::
           @components.List ::
             [
               @components.List.Item :: 'Apples',
               @components.List.Item :: 'Pears',
               @components.List.Item :: 'Oranges'
             ]
       ]
     ]);

   @function List.A
   @summary An `A` wrapper for List content
   @param {surface::HtmlFragment} [content] List content
   @param {String} [address] Href attribute
   @desc
     Note: If the List is in a [::PermanentDrawer], List.A's will be marked up as selected if their 
     href attribute matches the currently navigated URL.

     See [::List].

   @function List.Item
   @summary A `Li` wrapper for List content
   @param {surface::HtmlFragment} [content] List content
   @desc
     See [::List].
*/

// helper that should go elsewhere:
var Href = (elem, address) -> elem .. @Attrib('href', @url.build(address));

var IsURLSelected = url -> @Observable(function(r) {
  url = @url.normalize(url, location.href) .. @url.canonicalize;
  var {Location} = require('mho:surface/navigation');
  Location ..
    @each {
      |location|
      if (url === location)
        r(true);
      else
        r(false);
    }
});

function List(content) {
  return @Ul('mho-list') :: content
}

List.Item = content -> @Li('mho-list-item') :: content;

List.A = function(content,href) {
  href = @url.build(href);
  return @A('mho-list-item') .. 
    @Attrib('href', href) .. 
    @Class('mho-list-item--selected', IsURLSelected(href)) :: 
      content;
}

exports.List = List;

//----------------------------------------------------------------------
/**
   @function AppBar
   @summary xxx write me
   @desc
      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/toolbar/.
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}]);
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(``),
       `write me`
     ]);
*/

var AppBarGlobalCSS = @CSS(`
  @global {
    body {
      padding-top: 56px;
      box-sizing: border-box;
    }
  }
`);


function AppBar(settings) {
  settings = {
    title: '',
    actions: ''
  } .. @override(settings);

  return @Nav('mho-appbar') .. AppBarGlobalCSS :: [
    @Div('mho-appbar__navicon') :: '', 
    @Div('mho-appbar__title') :: settings.title,
    @Div('mho-appbar__actions') :: settings.actions
  ]
}
exports.AppBar = AppBar;

//----------------------------------------------------------------------
/**
   @function SelectField
   @summary xxx write me
   @desc
      Note: Expects that the default CSS Surface styles are applied - see [surface/style::CSSSurfaceDefault].

      See also https://material.io/components/web/catalog/input-controls/select-menus/.
   @demo
     // plain
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, {id:'mho:surface/components', name:'components'}]);
     @mainContent .. @appendContent([
       require('mho:surface/style').CSSSurfaceDefault,
       @GlobalCSS(``),
       `write me`
     ]);
*/
function SelectField(settings) {
}
exports.SelectField = SelectField;
