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

@ = require([
  'sjs:std',
  'mho:surface',
  'mho:surface/html',
  {id:'mho:surface/field', name:'field'},
  {id:'mho:surface/cmd', name:'cmd'}
])


/**
   @function Btn
   @summary XXX Document me
   @desc
     types = dense, raised, compact, primary, accent
*/
function Btn(content, types) {
  if (!types) types = '';
  return @Button("mho-button "+(types.split(' ') .. @filter .. @transform(type -> "mho-button--#{type}") .. @join(" "))) :: content;
}
exports.Btn = Btn;

/**
   @function TextField
   @summary XXX Document me
   @desc
*/

var TextFieldMechanism = @Mechanism(function(node) {

  waitfor {
    // XXX this is probably not the best way. we want to initialize the label in a way
    // that prevents a FOUC
    hold(0); // give input field a chance to initialize from observable; XXX maybe use a prioritized mechanism on inputs instead
    if (node.firstChild.value)
      node.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
    node.firstChild.nextSibling.classList.remove('mho-textfield__label--not-initialized');
    node.firstChild .. @events('input') .. @each { 
      ||
      if (node.firstChild.value) {
        node.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
      }
      else {
        node.firstChild.nextSibling.classList.remove('mho-textfield__label--float-above');
      }
    }
  }
  and {
    // focus lifecycle
    while (1) {
      node.firstChild .. @wait('focus');
      node.classList.add('mho-textfield--focused');
      //node.firstChild.nextSibling.classList.add('mho-textfield__label--float-above');
      
      node.firstChild .. @wait('blur');
      node.classList.remove('mho-textfield--focused');
      //if (!node.firstChild.value) node.firstChild.nextSibling.classList.remove('mho-textfield__label--float-above');
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
    control,
    @Label('mho-textfield__label mho-textfield__label--not-initialized') :: settings.label
  ];

  var outer_classes = ['mho-textfield'];
  if (settings.type === 'multiline') outer_classes.push('mho-textfield--multiline');

  var outerHtml = @Div(outer_classes.join(" ")) .. TextFieldMechanism :: 
    innerHtml;

  if (settings.help) {
    var help_classes = ['mho-textfield-helptext'];
    if (settings.persistent_help)
      help_classes.push('mho-textfield-helptext--persistent');
    outerHtml = @Div('mho-textfield-container') :: [
      outerHtml, 
      @P(help_classes.join(" ")) :: settings.help
    ];
  }

  return @field.Field({name:settings.name, Value:settings.Value, ValidationState:settings.ValidationState}) :: outerHtml;
}
exports.TextField = TextField;

