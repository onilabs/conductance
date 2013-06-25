var { Observable, ObservableArray, Computed } = require('mho:observable');
var { appendContent, Mechanism, Attrib, Prop, Button, Form, TextInput, Select, Style } = require('mho:surface');


//----------------------------------------------------------------------

var items     = ObservableArray(["Alpha", "Beta", "Gamma"]);
var itemToAdd = Observable('');

function addItem(ev) {
  ev.preventDefault();
  if (itemToAdd.get().length)
    items.push(itemToAdd.get());
  itemToAdd.set('');
}

document.body .. appendContent(
    `
      ${ 
        Form(`
             New item:
             $TextInput(itemToAdd)
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

