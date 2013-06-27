// Conductance version of http://knockoutjs.com/examples/betterList.html

var { Observable, ObservableArray, Computed } = require('mho:observable');
var { appendContent, Attrib, Prop, Button, Form, TextInput, Select, Style, OnClick } = require('mho:surface');
var { difference } = require('sjs:array');


//----------------------------------------------------------------------

var allItems      = ObservableArray(["Fries", "Eggs Benedict", "Ham", "Cheese"]);
var selectedItems = ObservableArray(["Ham"]);
var itemToAdd     = Observable('');

function addItem(ev) {
  ev.preventDefault();
  // prevent blanks and duplicates
  if (itemToAdd.get().length && allItems.get().indexOf(itemToAdd.get()) == -1)
    allItems.push(itemToAdd.get());
  itemToAdd.set(''); // clear text box
}

function removeSelected() {
  allItems.set(difference(allItems.get(), selectedItems.get()));
  selectedItems.set([]);
}

function sortItems() {
  allItems.sort();
}

document.body .. appendContent(
  `
   ${ 
     Form(`
           Add item:
           $TextInput(itemToAdd)
           ${ 
             Button('Add ') .. 
               Attrib('type', 'submit') .. 
               Attrib('disabled', itemToAdd .. Computed(x->x.length == 0))
           }
          `) .. Prop('onsubmit', addItem)
   }
  
   <p>Your values:</p>
   ${ 
     Select({multiple:true, items: allItems, selected: selectedItems}) .. 
       Style("{ width: 50em; height: 10em;}") 
   }
   <div>
    ${ 
      Button('Remove') .. 
        Attrib('disabled', selectedItems .. Computed(x->x==0)) ..
        OnClick(removeSelected)
    }
    ${
      Button('Sort') ..
        Attrib('disabled', allItems .. Computed(x->x.length < 2)) ..
        OnClick(sortItems)
    }   
   </div>
  ` 
);

