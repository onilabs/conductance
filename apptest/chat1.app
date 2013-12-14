/**
 @template-show-busy-indicator
*/

require('mho:app').withBusyIndicator {||
  @ = require(['mho:std', 'mho:app']);
}

var name = @Observable('minion');

@withAPI('./chat1.api') { 
  |api|
  main(api);
}

function main(api) {

  @mainContent .. @appendContent(
    `
    <h1>Oni Labs Chat</h1>
    ${
       api.messages .. 
         @transform(list -> list .. 
                            @map({name,msg} -> `<div><i>${name}</i>: ${msg}</div>`))
     }
    <hr>
    <div id='pending' style='color:grey'></div>
    <div class='row'>
      <div class='col-md-2'>
        ${
           // name input
           // XXX fix observable-to-value binding
           @Input('', {type:'text'}) .. @Mechanism({ 
             |node| 
             waitfor { 
               name .. @each {
                 |val|
                 if (node.value !== val) node.value = val;
               }
             }
             and {
               node .. @when('keyup') {
                 |ev|
                 name.set(node.value);
               }
             }
           })
                                                     
         }
      </div>
      <div class='col-md-10'>
        ${
           // message input
           // XXX clean this up
           @Input('', {type:'text', id:'message_input'})
         }
      </div>
    </div>
    ` .. @Div) {
    |ui|
    var input = ui.querySelector('#message_input');
    var pending = ui.querySelector('#pending');
    
    input.focus();
    input .. @when('keyup', { filter: ev -> ev.keyCode === 13 }) {
      |ev|
      var msg = input.value;
      pending .. @appendContent(`<span>You said: ${msg}</span>`) {
        ||
        input.value = '';
        input.disabled = true;
        hold(1000);
        api.writeMessage(name.get(), msg);
        input.disabled = false;
      }
    }
    
  }
}
