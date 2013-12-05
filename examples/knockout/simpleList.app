// Conductance version of http://knockoutjs.com/examples/simpleList.html

var { Observable, Computed } = require('mho:observable');
var { appendContent, Mechanism, Attrib, Style, Prop } = require('mho:surface');
var { Button, Form, TextInput, Select } = require('mho:surface/html');


//----------------------------------------------------------------------

var items     = Observable(["Alpha", "Beta", "Gamma"]);
var itemToAdd = Observable('');

function addItem(ev) {
  ev.preventDefault();
  var newItem = itemToAdd.get();
  if (newItem.length) {
    items.modify(current -> current.concat([newItem]));
  }
  itemToAdd.set('');
}

var name = Observable("test");
document.body .. appendContent(
    `
      ${
        Form(`
             New item:
             $TextInput(itemToAdd)
             $name
             ${
               Button('Add ') ..
                 Attrib('type', 'submit') ..
                 Attrib('disabled', itemToAdd .. Computed(x->x.length == 0))
              }
             <p>Your items:</p>
             ${
               Select({multiple:true, items: items}) ..
                 Style("{ width: 50em; height: 10em;}")
             }
             `) .. Prop('onsubmit', addItem)
      }
    `
);

